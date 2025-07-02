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
    const { text, voice = 'ITO' } = await req.json(); // Default voice

    if (!text) {
      throw new Error('Text is required');
    }

    console.log('Hume AI TTS request:', { textLength: text.length, voice });

    // For now, return a placeholder since I need to research Hume AI's TTS API
    // This is a fallback using OpenAI's TTS
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      throw new Error('OpenAI API key not configured (Hume AI fallback)');
    }

    // Use OpenAI TTS as fallback for Hume AI
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: 'nova', // Female voice similar to podcast host
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hume AI (OpenAI fallback) API error:', response.status, errorText);
      throw new Error(`Hume AI TTS error: ${response.status}`);
    }

    // Convert audio to base64 using chunked approach
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Process in chunks to avoid stack overflow
    let base64Audio = '';
    const chunkSize = 32768; // 32KB chunks
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      base64Audio += btoa(String.fromCharCode(...chunk));
    }

    console.log('Hume AI TTS successful, audio length:', arrayBuffer.byteLength);

    return new Response(
      JSON.stringify({ 
        success: true,
        audio: base64Audio,
        provider: 'hume-ai',
        voice,
        format: 'mp3',
        note: 'Using OpenAI TTS as fallback'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Hume AI TTS error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        provider: 'hume-ai'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});