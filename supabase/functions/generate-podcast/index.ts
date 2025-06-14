
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from "https://deno.land/x/openai@v4.52.7/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

    const prompt = `Based on the following resume text, please generate a short podcast script. The podcast should be an engaging summary of the person's career highlights and skills.

Resume:
---
${resume_content}
---

Please return the output as a JSON object with the following structure: { "description": "A short, compelling summary for the podcast.", "transcript": "The full podcast script as a string." }`;

    console.log('Calling OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a creative assistant that transforms resumes into podcast scripts." },
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
