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
    const { text, voice = 'barbershop-man' } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    console.log('Cartesia TTS request:', { textLength: text.length, voice });

    const apiKey = Deno.env.get('CARTESIA_API_KEY');
    if (!apiKey) {
      throw new Error('Cartesia API key not configured');
    }

    // Call Cartesia TTS API
    const response = await fetch('https://api.cartesia.ai/tts/bytes', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_id: 'sonic-english',
        transcript: text,
        voice: {
          mode: 'id',
          id: voice
        },
        output_format: {
          container: 'mp3',
          encoding: 'mp3',
          sample_rate: 44100
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cartesia API error:', response.status, errorText);
      throw new Error(`Cartesia API error: ${response.status}`);
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

    console.log('Cartesia TTS successful, audio length:', arrayBuffer.byteLength);

    return new Response(
      JSON.stringify({ 
        success: true,
        audio: base64Audio,
        provider: 'cartesia',
        voice,
        format: 'mp3'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Cartesia TTS error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        provider: 'cartesia'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});