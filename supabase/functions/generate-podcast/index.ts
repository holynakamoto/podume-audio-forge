
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from "https://deno.land/x/openai@v4.52.7/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const generateAudioWithGoogleTTS = async (text: string): Promise<string> => {
  console.log('Generating audio with Google Cloud Text-to-Speech...');
  
  try {
    // Use Google Cloud Text-to-Speech API
    const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${geminiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: 'en-US',
          name: 'en-US-Journey-D', // Professional male voice
          ssmlGender: 'MALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0
        }
      }),
    });

    if (!response.ok) {
      console.error('Google TTS API error:', response.status, await response.text());
      throw new Error(`Google TTS API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Google TTS response received');
    
    // Return the base64 audio data as a data URL
    return `data:audio/mp3;base64,${result.audioContent}`;
  } catch (error) {
    console.error('TTS generation failed, using fallback:', error);
    // Return null if TTS fails - we'll continue without audio
    return null;
  }
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Generate podcast function called');
    
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { resume_content, title, package_type, voice_clone, premium_assets } = await req.json();
    console.log('Request data received:', { title, package_type, voice_clone, premium_assets });

    if (!resume_content || !title) {
      console.error('Missing required fields');
      return new Response(JSON.stringify({ error: 'Missing required fields: resume_content and title' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    console.log('User authenticated:', user?.id);

    if (!user) {
      console.error('User not authenticated');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openai = new OpenAI({ apiKey: openAIApiKey });

    const prompt = `Based on the following resume text, please generate a compelling 2-3 minute podcast script that tells this person's career story in an engaging, conversational way. Focus on their key achievements, skills, and career progression. Make it sound natural and interesting, as if you're introducing this person to potential employers or collaborators.

Resume:
---
${resume_content}
---

Please return the output as a JSON object with the following structure: { "description": "A short, compelling summary for the podcast.", "transcript": "The full podcast script as a string that should be 2-3 minutes when read aloud." }`;

    console.log('Calling OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a creative assistant that transforms resumes into engaging podcast scripts. Write in a natural, conversational tone suitable for audio." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    console.log('OpenAI response received');
    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    const { description, transcript } = JSON.parse(content);

    console.log('Generating audio with Google TTS...');
    let audioUrl = null;
    
    if (geminiApiKey) {
      try {
        audioUrl = await generateAudioWithGoogleTTS(transcript);
        console.log('Audio generated successfully');
      } catch (audioError) {
        console.error('Audio generation failed:', audioError);
        // Continue without audio if generation fails
      }
    } else {
      console.log('Gemini API key not found, skipping audio generation');
    }

    const supabaseAdminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Inserting podcast data...');
    const { data: podcastData, error: insertError } = await supabaseAdminClient
      .from('podcasts')
      .insert({
        user_id: user.id,
        title,
        resume_content,
        package_type,
        voice_clone: voice_clone || false,
        premium_assets: premium_assets || false,
        description,
        transcript,
        audio_url: audioUrl,
        status: 'completed',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw insertError;
    }

    console.log('Podcast created successfully:', podcastData.id);
    return new Response(JSON.stringify({ podcast: podcastData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in generate-podcast function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
