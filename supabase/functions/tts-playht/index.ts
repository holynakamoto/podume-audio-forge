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
    const { text, voice = 'jennifer' } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    console.log('PlayHT TTS request:', { textLength: text.length, voice });

    const apiKey = Deno.env.get('PLAYHT_API_KEY');
    const userId = Deno.env.get('PLAYHT_USER_ID');
    
    if (!apiKey || !userId) {
      throw new Error('PlayHT API credentials not configured');
    }

    // Call PlayHT TTS API
    const response = await fetch('https://api.play.ht/api/v2/tts/stream', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-User-ID': userId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice: voice,
        output_format: 'mp3',
        voice_engine: 'PlayHT2.0-turbo'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PlayHT API error:', response.status, errorText);
      throw new Error(`PlayHT API error: ${response.status}`);
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

    console.log('PlayHT TTS successful, audio length:', arrayBuffer.byteLength);

    return new Response(
      JSON.stringify({ 
        success: true,
        audio: base64Audio,
        provider: 'playht',
        voice,
        format: 'mp3'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('PlayHT TTS error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        provider: 'playht'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});