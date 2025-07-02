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
    const { text, model = 'aura-luna-en' } = await req.json(); // Default to Luna voice

    if (!text) {
      throw new Error('Text is required');
    }

    console.log('Deepgram TTS request:', { textLength: text.length, model });

    const apiKey = Deno.env.get('DEEPGRAM_API_KEY');
    if (!apiKey) {
      throw new Error('Deepgram API key not configured');
    }

    // Call Deepgram TTS API
    const response = await fetch('https://api.deepgram.com/v1/speak?model=' + model, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Deepgram API error:', response.status, errorText);
      throw new Error(`Deepgram API error: ${response.status}`);
    }

    // Convert audio to base64
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const base64Audio = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));

    console.log('Deepgram TTS successful, audio length:', arrayBuffer.byteLength);

    return new Response(
      JSON.stringify({ 
        success: true,
        audio: base64Audio,
        provider: 'deepgram',
        model,
        format: 'wav'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Deepgram TTS error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        provider: 'deepgram'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});