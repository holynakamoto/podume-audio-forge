
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
    
    // Validate environment
    const envError = validateEnvironment();
    if (envError) {
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
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const validation = validateRequest(body);
    if (!validation.isValid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Authenticate user
    let user;
    try {
      user = await authenticateUser(req);
    } catch (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate podcast script
    let content;
    try {
      content = await generatePodcastScript(validation.data!.resume_content);
      console.log('Script generated successfully');
    } catch (scriptError) {
      return new Response(JSON.stringify({ 
        error: scriptError.message,
        details: 'Check the function logs for more information'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Save to database
    let podcastData;
    try {
      podcastData = await savePodcastToDatabase(user, validation.data!, content);
    } catch (dbError) {
      return new Response(JSON.stringify({ error: dbError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ podcast: podcastData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('=== CRITICAL ERROR in generate-podcast function ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: `Internal server error: ${error.message}`,
      details: 'Check function logs for more information'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
