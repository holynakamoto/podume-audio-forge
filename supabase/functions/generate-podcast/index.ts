
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const generateAudioWithGeminiTTS = async (text: string): Promise<string | null> => {
  console.log('Attempting to generate audio with Gemini TTS...');
  
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  if (!geminiApiKey) {
    console.log('Gemini API key not found, skipping TTS generation');
    return null;
  }

  try {
    console.log('Making request to Gemini TTS API...');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Generate a natural, professional podcast-style audio for this text: "${text}"`
          }]
        }],
        generationConfig: {
          responseMimeType: "audio/wav",
          responseModalities: ["Audio"]
        },
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Zephyr"
            }
          }
        }
      }),
    });

    console.log('Gemini TTS response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini TTS API error:', response.status, errorText);
      return null; // Return null instead of throwing
    }

    const result = await response.json();
    console.log('Gemini TTS response structure:', JSON.stringify(result, null, 2));
    
    // Extract audio data with more flexible response handling
    if (result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
      const audioData = result.candidates[0].content.parts[0].inlineData.data;
      const mimeType = result.candidates[0].content.parts[0].inlineData.mimeType || 'audio/wav';
      console.log('Successfully extracted audio data from Gemini TTS');
      return `data:${mimeType};base64,${audioData}`;
    } else {
      console.log('No audio data found in Gemini TTS response');
      return null;
    }
  } catch (error) {
    console.error('Error in Gemini TTS generation:', error.message);
    return null; // Always return null on error instead of throwing
  }
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== Generate podcast function called ===');
    
    // Validate API keys with detailed error messages
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    console.log('OpenAI API key check:', openAIApiKey ? 'Found' : 'NOT FOUND');
    
    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment variables');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured',
        details: 'Please check your Supabase secrets configuration'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('OpenAI API key found');

    // Parse request body with better error handling
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

    const { resume_content, title, package_type, voice_clone, premium_assets } = body;
    console.log('Request data received:', { 
      title, 
      package_type, 
      voice_clone, 
      premium_assets,
      resume_content_length: resume_content?.length || 0
    });

    // Validate required fields
    if (!resume_content || !title) {
      console.error('Missing required fields');
      return new Response(JSON.stringify({ error: 'Missing required fields: resume_content and title' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client for auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    let user;
    try {
      const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser();
      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }
      user = authUser;
    } catch (authError) {
      console.error('Failed to authenticate user:', authError);
      return new Response(JSON.stringify({ error: 'Authentication failed' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!user) {
      console.error('User not authenticated');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('User authenticated:', user.id);

    // Generate podcast script with OpenAI
    const prompt = `Based on the following resume text, please generate a compelling 2-3 minute podcast script that tells this person's career story in an engaging, conversational way. Focus on their key achievements, skills, and career progression. Make it sound natural and interesting, as if you're introducing this person to potential employers or collaborators.

Resume:
---
${resume_content}
---

Please return the output as a JSON object with the following structure: { "description": "A short, compelling summary for the podcast.", "transcript": "The full podcast script as a string that should be 2-3 minutes when read aloud." }`;

    console.log('Calling OpenAI API for script generation...');
    console.log('Using API key starting with:', openAIApiKey.substring(0, 7) + '...');
    
    let openAIResult;
    try {
      console.log('Making OpenAI request...');
      
      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a creative assistant that transforms resumes into engaging podcast scripts. Write in a natural, conversational tone suitable for audio." },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        }),
      });

      console.log('OpenAI response status:', openAIResponse.status);
      
      if (!openAIResponse.ok) {
        const errorText = await openAIResponse.text();
        console.error('OpenAI API error details:', {
          status: openAIResponse.status,
          statusText: openAIResponse.statusText,
          errorText
        });
        
        // Handle specific error cases
        if (openAIResponse.status === 401) {
          throw new Error('OpenAI API authentication failed. Please check your API key.');
        } else if (openAIResponse.status === 429) {
          throw new Error('OpenAI API rate limit exceeded. Please try again later.');
        } else if (openAIResponse.status === 402) {
          throw new Error('OpenAI API quota exceeded. Please check your billing.');
        } else {
          throw new Error(`OpenAI API error: ${openAIResponse.status} - ${errorText}`);
        }
      }

      openAIResult = await openAIResponse.json();
      console.log('OpenAI response received successfully');
    } catch (openAIError) {
      console.error('OpenAI API call failed:', openAIError);
      return new Response(JSON.stringify({ 
        error: `Failed to generate podcast script: ${openAIError.message}`,
        details: 'Check the function logs for more information'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const content = openAIResult.choices?.[0]?.message?.content;
    if (!content) {
      console.error('No content received from OpenAI');
      return new Response(JSON.stringify({ error: 'No content received from OpenAI' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let description, transcript;
    try {
      const parsedContent = JSON.parse(content);
      description = parsedContent.description;
      transcript = parsedContent.transcript;
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid response format from OpenAI' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Script generated successfully');

    // Save to database
    console.log('Saving podcast to database...');
    const supabaseAdminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let podcastData;
    try {
      const { data, error: insertError } = await supabaseAdminClient
        .from('podcasts')
        .insert({
          user_id: user.id,
          title: title || 'Untitled Podcast',
          resume_content: resume_content || '',
          package_type: package_type || 'core',
          voice_clone: voice_clone || false,
          premium_assets: premium_assets || false,
          description: description || '',
          transcript: transcript || '',
          audio_url: null, // Skip TTS for now
          status: 'completed',
        })
        .select()
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw insertError;
      }
      
      podcastData = data;
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      return new Response(JSON.stringify({ error: `Database error: ${dbError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Podcast created successfully with ID:', podcastData.id);
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
