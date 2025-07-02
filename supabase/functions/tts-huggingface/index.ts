import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, model = 'microsoft/speecht5_tts' } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    console.log('Hugging Face TTS request:', { textLength: text.length, model });

    const apiKey = Deno.env.get('HUGGING_FACE_API_KEY');
    if (!apiKey) {
      throw new Error('Hugging Face API key not configured');
    }

    const hf = new HfInference(apiKey);

    // Call Hugging Face TTS API
    const response = await hf.textToSpeech({
      model: model,
      inputs: text,
    });

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

    console.log('Hugging Face TTS successful, audio length:', arrayBuffer.byteLength);

    return new Response(
      JSON.stringify({ 
        success: true,
        audio: base64Audio,
        provider: 'huggingface',
        model,
        format: 'wav'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Hugging Face TTS error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        provider: 'huggingface'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});