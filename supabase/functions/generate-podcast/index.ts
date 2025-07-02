
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
      generatedScript = generateLinkedInScript(validation.data!);
    } else {
      console.log('📄 Resume content provided - generating resume-focused script');
      generatedScript = generateResumeScript(validation.data!);
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

function generateResumeScript(data: any): string {
  const title = data.title || 'Professional Journey';
  const resumeContent = data.resume_content || '';
  
  // Extract key information from resume content
  const lines = resumeContent.split('\n');
  const name = lines.find(line => line.startsWith('#'))?.replace('#', '').trim() || 'Professional';
  
  return `# ${title}

Welcome to this professional journey podcast. Today we're exploring the career story of ${name}, a dedicated professional whose experiences offer valuable insights into career development and professional growth.

## Introduction

Every professional has a unique story—a journey filled with challenges, achievements, and continuous learning. Today's episode focuses on a career path that demonstrates resilience, adaptability, and commitment to excellence.

## Professional Background

${name} represents the modern professional who understands that career success comes from:

- Continuous skill development and learning
- Building strong professional relationships
- Adapting to industry changes and new technologies
- Maintaining a commitment to quality and excellence

## Career Highlights

Throughout their career journey, key themes emerge:

1. **Professional Growth**: A commitment to expanding skills and taking on new challenges
2. **Industry Expertise**: Deep knowledge developed through hands-on experience
3. **Leadership Qualities**: Demonstrated ability to guide projects and mentor others
4. **Problem-Solving**: Creative approaches to overcoming professional challenges

## Key Competencies

The professional skills demonstrated include:
- Strategic thinking and planning
- Effective communication and collaboration
- Technical expertise in their field
- Project management and organization
- Adaptability and continuous learning

## Professional Philosophy

This career journey reflects important principles:
- Excellence in all professional endeavors
- Commitment to continuous improvement
- Value of building meaningful professional relationships
- Importance of staying current with industry trends

## Lessons Learned

Key insights from this professional journey:

1. **Consistency Matters**: Regular effort and dedication compound over time
2. **Relationships Are Key**: Professional success often depends on the strength of your network
3. **Learning Never Stops**: The best professionals are always acquiring new skills
4. **Quality Over Quantity**: Focus on doing excellent work rather than just more work

## Conclusion

This professional story reminds us that career success is not just about reaching destinations—it's about the journey itself, the relationships we build, and the value we create along the way.

Thank you for joining us on this exploration of professional excellence. Remember, every career has its unique story, and every professional has valuable experiences to share.

---
Generated from resume content
Podcast title: ${title}
Content length: ${resumeContent.length} characters`;
}
