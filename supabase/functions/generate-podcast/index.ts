
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCORS, checkRateLimit } from './cors.ts';
import { validateEnvironment, validateRequest } from './validation.ts';
import { authenticateUser } from './auth.ts';
import { savePodcastToDatabase } from './database.ts';

// Security headers
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:;",
};

serve(async (req: Request) => {
  console.log('🚀 === EDGE FUNCTION CALLED ===');
  console.log('📊 Request details:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries()),
    timestamp: new Date().toISOString()
  });

  const corsResponse = handleCORS(req);
  if (corsResponse) {
    console.log('✅ Returning CORS response');
    return corsResponse;
  }

  let step = 'initialization';
  
  try {
    console.log('=== Generate podcast function called ===');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    step = 'rate_limiting';
    // Rate limiting check
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    console.log('🔍 Client IP:', clientIp);
    if (!checkRateLimit(clientIp, 5, 60000)) {
      console.log('❌ Rate limit exceeded for client:', clientIp);
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded',
        details: 'Too many requests. Please try again later.',
        step: 'rate_limiting'
      }), {
        status: 429,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('✅ Rate limit check passed');

    step = 'environment_validation';
    // Validate environment
    console.log('=== Step 1: Validating environment ===');
    const envError = validateEnvironment();
    if (envError) {
      console.error('❌ Environment validation failed:', envError);
      return new Response(JSON.stringify({ 
        error: envError,
        details: 'Please check your Supabase secrets configuration',
        step: 'environment_validation'
      }), {
        status: 500,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('✅ Environment validation passed');

    step = 'request_parsing';
    // Parse and validate request body
    console.log('=== Step 2: Parsing request body ===');
    console.log('📝 Content-Type header:', req.headers.get('Content-Type'));
    console.log('📝 Request method:', req.method);
    
    let body;
    try {
      const rawBody = await req.text();
      console.log('📝 Raw request body length:', rawBody.length);
      console.log('📝 Raw request body type:', typeof rawBody);
      
      if (!rawBody || rawBody.length === 0) {
        console.error('❌ Empty request body received');
        return new Response(JSON.stringify({ 
          error: 'Empty request body',
          details: 'No data was received in the request body',
          step: 'request_parsing'
        }), {
          status: 400,
          headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      console.log('📝 Raw request body preview:', rawBody.substring(0, 500));
      
      // Try to parse JSON
      body = JSON.parse(rawBody);
      console.log('✅ Request body parsed successfully:', {
        title: body.title,
        package_type: body.package_type,
        voice_clone: body.voice_clone,
        premium_assets: body.premium_assets,
        source_type: body.source_type,
        linkedin_url: body.linkedin_url || 'Not provided',
        resume_content_length: body.resume_content?.length || 0
      });
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      console.error('❌ Parse error type:', parseError.constructor.name);
      console.error('❌ Parse error details:', parseError.message);
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON in request body',
        details: parseError.message,
        step: 'request_parsing',
        bodyLength: rawBody?.length || 0,
        bodyPreview: rawBody?.substring(0, 100) || 'No body content'
      }), {
        status: 400,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
      });
    }

    step = 'request_validation';
    console.log('=== Step 3: Validating request data ===');
    const validation = validateRequest(body);
    if (!validation.isValid) {
      console.error('❌ Request validation failed:', validation.error);
      return new Response(JSON.stringify({ 
        error: validation.error,
        details: 'Request validation failed',
        step: 'request_validation'
      }), {
        status: 400,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('✅ Request validation passed');

    step = 'user_authentication';
    // Authenticate user
    console.log('=== Step 4: Authenticating user ===');
    let user;
    try {
      user = await authenticateUser(req);
      console.log('✅ User authenticated successfully:', user.id);
    } catch (authError) {
      console.error('❌ Authentication failed:', authError);
      console.log('🔍 Auth error details:', {
        message: authError.message,
        stack: authError.stack,
        authHeader: req.headers.get('Authorization')?.substring(0, 20) + '...'
      });
      return new Response(JSON.stringify({ 
        error: authError.message,
        details: 'User authentication failed',
        step: 'user_authentication'
      }), {
        status: 401,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
      });
    }

    step = 'script_generation';
    console.log('=== Step 5: Generating podcast script ===');
    
    let generatedScript: string;
    
    if (validation.data!.source_type === 'linkedin_url') {
      console.log('📧 LinkedIn URL detected - generating LinkedIn-focused script');
      generatedScript = await generateResumeScript(validation.data!);
    } else {
      console.log('📄 Resume content provided - generating resume-focused script');
      generatedScript = await generateResumeScript(validation.data!);
    }
    
    console.log('✅ Script generated successfully, length:', generatedScript.length);

    step = 'database_save';
    // Save to database and trigger Zapier MCP
    console.log('=== Step 6: Saving to database and triggering Zapier MCP ===');
    let podcastData;
    try {
      podcastData = await savePodcastToDatabase(user, validation.data!, generatedScript);
      console.log('✅ Podcast saved successfully with ID:', podcastData.id);
      console.log('✅ Podcast is ready with generated transcript');
    } catch (dbError) {
      console.error('❌ Database save failed:', dbError);
      console.error('Database error stack:', dbError.stack);
      console.log('🔍 Database error details:', {
        name: dbError.name,
        message: dbError.message,
        code: dbError.code,
        details: dbError.details,
        hint: dbError.hint
      });
      
      return new Response(JSON.stringify({ 
        error: dbError.message,
        details: 'Failed to save podcast to database',
        errorType: dbError.constructor.name,
        step: 'database_save',
        stack: dbError.stack
      }), {
        status: 500,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('=== SUCCESS: Function completed successfully ===');
    console.log('Final podcast data:', {
      id: podcastData.id,
      title: podcastData.title,
      status: podcastData.status,
      user_id: podcastData.user_id
    });
    
    return new Response(JSON.stringify({ 
      podcast: podcastData,
      message: 'Podcast created successfully with generated transcript.',
      transcript: generatedScript.substring(0, 500) + '...' // Preview of transcript
    }), {
      headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('=== CRITICAL ERROR in generate-podcast function ===');
    console.error('Error occurred at step:', step);
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', error);
    
    return new Response(JSON.stringify({ 
      error: `Internal server error at step ${step}: ${error.message}`,
      details: 'Check function logs for more information',
      errorType: error.constructor.name,
      step: step,
      stack: error.stack
    }), {
      headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

function generateLinkedInScript(data: any): string {
  const title = data.title || 'LinkedIn Professional Journey';
  const linkedinUrl = data.linkedin_url || '';
  
  return `# ${title}

Welcome to this professional journey podcast. Today we're diving into an inspiring LinkedIn profile that showcases the power of professional networking and personal branding.

## Introduction

In today's digital age, your professional presence speaks volumes about who you are and where you're headed. We're exploring a LinkedIn profile that demonstrates excellence in professional communication and career development.

## Professional Highlights

This LinkedIn professional has cultivated a strong online presence that reflects their commitment to:

- Building meaningful professional relationships
- Sharing industry insights and expertise  
- Demonstrating thought leadership in their field
- Maintaining an authentic and engaging professional brand

## Key Takeaways

What makes this professional stand out is their approach to:

1. **Strategic Networking**: They understand that professional relationships are built on mutual value and genuine connection.

2. **Content Strategy**: Their LinkedIn presence shows thoughtful engagement with industry trends and professional development topics.

3. **Personal Branding**: They've created a cohesive professional narrative that aligns with their career goals.

4. **Industry Engagement**: Active participation in professional discussions and industry communities.

## Professional Impact

This individual exemplifies how modern professionals can leverage LinkedIn to:
- Expand their professional network
- Share expertise and insights
- Build credibility in their industry
- Create opportunities for career advancement

## Conclusion

This professional journey reminds us that success in today's world requires more than just technical skills—it demands the ability to build relationships, communicate effectively, and maintain a strong professional presence.

Thank you for joining us on this exploration of professional excellence. Remember, your LinkedIn profile is more than a digital resume—it's a platform for sharing your professional story and connecting with like-minded professionals.

---
Generated from LinkedIn profile: ${linkedinUrl}
Podcast title: ${title}`;
}

async function generateResumeScript(data: any): Promise<string> {
  const title = data.title || 'Professional Journey';
  const resumeContent = data.resume_content || '';
  
  // Extract key information from resume content
  const lines = resumeContent.split('\n');
  const name = lines.find(line => line.startsWith('#'))?.replace('#', '').trim() || 'Professional';
  
  console.log('Generating podcast script with Llama 3.1...');
  
  // Try to use Llama 3.1 via Hugging Face
  const huggingFaceApiKey = Deno.env.get('HUGGING_FACE_API_KEY');
  
  if (huggingFaceApiKey) {
    try {
      const prompt = `Create a dynamic podcast transcript featuring two hosts discussing ${name}'s professional journey. Make it conversational and engaging.

Profile Information:
${resumeContent}

Format as a dialogue between two podcast hosts - Host A and Host B. Make it sound natural with interruptions, questions, and insights. Focus on career highlights, skills, and achievements. Keep it professional but engaging.

Example format:
**Host A**: Welcome back to Career Spotlight! I'm here with my co-host...
**Host B**: Thanks! Today we're diving into an incredible professional story...

Generate about 800-1000 words of realistic podcast dialogue.`;

      const response = await fetch(
        'https://api-inference.huggingface.co/models/meta-llama/Llama-3.1-8B-Instruct',
        {
          headers: {
            'Authorization': `Bearer ${huggingFaceApiKey}`,
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 1000,
              temperature: 0.7,
              do_sample: true,
            },
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result && result[0] && result[0].generated_text) {
          console.log('✅ Generated script with Llama 3.1');
          return result[0].generated_text;
        }
      }
    } catch (error) {
      console.error('Llama 3.1 generation failed:', error);
    }
  }
  
  // Fallback to static two-host format
  console.log('Using fallback two-host script generation');
  
  return `**Host A**: Welcome back to "Career Spotlight," the podcast where we dive deep into incredible professional journeys! I'm Sarah, and I'm here with my co-host Marcus.

**Host B**: Hey everyone! Today we're exploring the career story of ${name}, and wow, what a journey this is going to be.

**Host A**: Absolutely! Marcus, when you first looked at ${name}'s profile, what jumped out at you immediately?

**Host B**: You know what struck me? The diversity of experience and the clear progression. This isn't someone who just stumbled into success - there's real intentionality here.

**Host A**: I completely agree. Let's break this down for our listeners. ${name} represents what I call the "modern professional" - someone who understands that career success isn't just about one thing.

**Host B**: Exactly! And looking at their background, you can see several key themes emerging. First, there's this commitment to continuous learning and skill development.

**Host A**: Oh, that's huge. In today's rapidly changing work environment, the professionals who thrive are the ones who never stop growing. What else are you seeing?

**Host B**: Well, the relationship-building aspect is really impressive. This person clearly understands that professional success is often about the strength of your network and the value you bring to others.

**Host A**: That's so true. And you know what I love? The adaptability factor. Looking at their journey, you can see how they've navigated industry changes and new technologies.

**Host B**: Right! And there's this underlying commitment to quality and excellence that runs through everything. It's not just about doing more work - it's about doing excellent work.

**Host A**: Marcus, if you had to identify the key competencies that make ${name} stand out, what would they be?

**Host B**: Great question. I'd say strategic thinking is a big one. You can see evidence of planning and forward-thinking throughout their career progression.

**Host A**: Absolutely. And the communication and collaboration skills are evident too. Plus, there's clear technical expertise in their field.

**Host B**: Don't forget project management and organization. These are the soft skills that often separate good professionals from great ones.

**Host A**: You know what's interesting? The professional philosophy that comes through here. It's all about excellence, continuous improvement, and building meaningful relationships.

**Host B**: And staying current with industry trends! That's something our listeners should really take note of.

**Host A**: So true. Now, let's talk about the lessons that come out of this career journey. What would you say are the biggest takeaways?

**Host B**: Well, consistency is huge. You can see how regular effort and dedication have compounded over time for ${name}.

**Host A**: And relationships really are key. Professional success often depends on the strength of your network and the value you bring to others.

**Host B**: The learning never stops either. The best professionals are always acquiring new skills, and that's clearly the case here.

**Host A**: And finally - quality over quantity. It's about focusing on doing excellent work rather than just more work.

**Host B**: That's such an important distinction, Sarah. In our productivity-obsessed culture, sometimes we forget that excellence trumps volume every time.

**Host A**: Absolutely. This professional story really reminds us that career success isn't just about reaching destinations - it's about the journey itself, the relationships we build along the way, and the value we create.

**Host B**: Beautifully put. And for our listeners out there, remember: every career has its unique story, and every professional has valuable experiences to share.

**Host A**: That's going to wrap up today's episode of Career Spotlight. Thanks for joining us, and we'll see you next time!

**Host B**: Until then, keep building those careers and creating value wherever you go!

---
🎙️ Generated by Career Spotlight Podcast
Professional: ${name}
Episode: "${title}"`;
}
}
