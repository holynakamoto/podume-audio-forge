
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCORS } from './cors.ts';
import { validateEnvironment, validateRequest } from './validation.ts';
import { authenticateUser } from './auth.ts';
import { generatePodcastScript } from './openai.ts';
import { savePodcastToDatabase } from './database.ts';

serve(async (req: Request) => {
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  try {
    console.log('=== Generate podcast function called ===');
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    // Validate environment
    const envError = validateEnvironment();
    if (envError) {
      console.error('Environment validation failed:', envError);
      return new Response(JSON.stringify({ 
        error: envError,
        details: 'Please check your Supabase secrets configuration'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
      console.log('Request body parsed successfully:', {
        title: body.title,
        package_type: body.package_type,
        voice_clone: body.voice_clone,
        premium_assets: body.premium_assets,
        resume_content_length: body.resume_content?.length || 0
      });
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON in request body',
        details: parseError.message 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const validation = validateRequest(body);
    if (!validation.isValid) {
      console.error('Request validation failed:', validation.error);
      return new Response(JSON.stringify({ 
        error: validation.error,
        details: 'Request validation failed'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Authenticate user
    let user;
    try {
      console.log('Authenticating user...');
      user = await authenticateUser(req);
      console.log('User authenticated successfully:', user.id);
    } catch (authError) {
      console.error('Authentication failed:', authError);
      return new Response(JSON.stringify({ 
        error: authError.message,
        details: 'User authentication failed'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate podcast script
    let content;
    try {
      console.log('Starting podcast script generation...');
      content = await generatePodcastScript(validation.data!.resume_content);
      console.log('Script generated successfully');
    } catch (scriptError) {
      console.error('Script generation failed:', scriptError);
      console.error('Script error stack:', scriptError.stack);
      
      return new Response(JSON.stringify({ 
        error: scriptError.message,
        details: 'Failed to generate podcast script. Check the function logs for more information.',
        errorType: scriptError.constructor.name
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Save to database
    let podcastData;
    try {
      console.log('Saving podcast to database...');
      podcastData = await savePodcastToDatabase(user, validation.data!, content);
      console.log('Podcast saved successfully with ID:', podcastData.id);
    } catch (dbError) {
      console.error('Database save failed:', dbError);
      console.error('Database error stack:', dbError.stack);
      
      return new Response(JSON.stringify({ 
        error: dbError.message,
        details: 'Failed to save podcast to database',
        errorType: dbError.constructor.name
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Function completed successfully');
    return new Response(JSON.stringify({ podcast: podcastData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('=== CRITICAL ERROR in generate-podcast function ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', error);
    
    return new Response(JSON.stringify({ 
      error: `Internal server error: ${error.message}`,
      details: 'Check function logs for more information',
      errorType: error.constructor.name,
      stack: error.stack
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
