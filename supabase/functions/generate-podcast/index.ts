
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
    let body;
    try {
      const rawBody = await req.text();
      console.log('📝 Raw request body length:', rawBody.length);
      console.log('📝 Raw request body preview:', rawBody.substring(0, 200));
      
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
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON in request body',
        details: parseError.message,
        step: 'request_parsing'
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
    console.log('=== Step 5: Generating placeholder script ===');
    // Create placeholder transcript - Zapier MCP will handle actual generation
    let generatedScript = 'Placeholder transcript - will be generated by Zapier MCP workflow using Claude integration.';
    
    if (validation.data!.source_type === 'linkedin_url') {
      console.log('📧 LinkedIn URL detected - full processing via Zapier MCP');
      generatedScript = `LinkedIn Profile Podcast: ${validation.data!.title}

This podcast transcript will be generated by our Zapier MCP workflow using Claude integration.

LinkedIn Profile: ${validation.data!.linkedin_url}

The workflow will:
1. Extract comprehensive profile data from LinkedIn
2. Generate a professional podcast script using Claude
3. Process the content for optimal audio production
4. Return the final transcript and audio

Status: Processing via Zapier MCP workflow...`;
    } else {
      console.log('📄 Resume content provided - will route through Zapier MCP for consistency');
      generatedScript = `Resume-based Podcast: ${validation.data!.title}

This podcast transcript will be generated by our Zapier MCP workflow using Claude integration.

The workflow will process the provided resume content and generate a professional podcast script.

Status: Processing via Zapier MCP workflow...`;
    }
    console.log('✅ Placeholder script generated');

    step = 'database_save';
    // Save to database and trigger Zapier MCP
    console.log('=== Step 6: Saving to database and triggering Zapier MCP ===');
    let podcastData;
    try {
      podcastData = await savePodcastToDatabase(user, validation.data!, generatedScript);
      console.log('✅ Podcast saved successfully with ID:', podcastData.id);
      console.log('✅ Zapier MCP workflow triggered for complete processing');
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
      message: 'Podcast created successfully. Zapier MCP workflow will handle transcript and audio generation.',
      processing_status: 'Zapier MCP workflow triggered'
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
