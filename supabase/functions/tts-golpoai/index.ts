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
    const { text, voice = 'podcast-female' } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    console.log('Golpo AI TTS request:', { textLength: text.length, voice });

    const apiKey = Deno.env.get('GOLPO_AI_API_KEY');
    if (!apiKey) {
      throw new Error('Golpo AI API key not configured');
    }

    // Call Golpo AI TTS API
    const response = await fetch('https://api.golpoai.com/v1/tts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        voice: voice,
        format: 'mp3',
        style: 'podcast'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Golpo AI API error:', response.status, errorText);
      throw new Error(`Golpo AI API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.audio) {
      throw new Error('No audio data received from Golpo AI');
    }

    // Golpo AI returns base64 encoded audio
    const base64Audio = result.audio;

    console.log('Golpo AI TTS successful, audio received');

    return new Response(
      JSON.stringify({ 
        success: true,
        audio: base64Audio,
        provider: 'golpoai',
        voice,
        format: 'mp3'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Golpo AI TTS error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        provider: 'golpoai'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});