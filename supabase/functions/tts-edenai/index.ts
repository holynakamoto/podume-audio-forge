import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('Eden AI TTS request body:', requestBody);
    
    const { text, voice = 'en-US-AriaNeural' } = requestBody;

    if (!text) {
      throw new Error('Text is required');
    }

    console.log('Eden AI TTS request:', { textLength: text.length, voice });

    const apiKey = Deno.env.get('EDEN_AI_API_KEY');
    if (!apiKey) {
      throw new Error('Eden AI API key not configured');
    }

    // Call Eden AI TTS API
    const response = await fetch('https://api.edenai.run/v2/audio/text_to_speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        providers: 'microsoft',
        text: text,
        option: voice,
        settings: {
          microsoft: voice
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Eden AI API error:', response.status, errorText);
      throw new Error(`Eden AI API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.microsoft || !result.microsoft.audio) {
      throw new Error('No audio data received from Eden AI');
    }

    // Eden AI returns base64 encoded audio
    const base64Audio = result.microsoft.audio;

    console.log('Eden AI TTS successful, audio received');

    return new Response(
      JSON.stringify({ 
        success: true,
        audio: base64Audio,
        provider: 'edenai',
        voice,
        format: 'mp3'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Eden AI TTS error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        provider: 'edenai'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});