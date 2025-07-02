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
    const { text, voice = 'podcast-host' } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    console.log('Google NotebookLM TTS request:', { textLength: text.length, voice });

    // For now, use OpenAI TTS as a fallback since Google NotebookLM doesn't have a public API yet
    // This will provide better quality than the current failing providers
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      throw new Error('OpenAI API key not configured (NotebookLM fallback)');
    }

    // Use OpenAI TTS with podcast-style settings
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1-hd', // Higher quality model
        input: text,
        voice: voice === 'podcast-host' ? 'nova' : 'alloy', // Female voices work well for podcasts
        response_format: 'mp3',
        speed: 1.0
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NotebookLM (OpenAI fallback) API error:', response.status, errorText);
      throw new Error(`NotebookLM TTS error: ${response.status}`);
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

    console.log('NotebookLM TTS successful, audio length:', arrayBuffer.byteLength);

    return new Response(
      JSON.stringify({ 
        success: true,
        audio: base64Audio,
        provider: 'notebooklm',
        voice,
        format: 'mp3',
        note: 'Using high-quality OpenAI TTS as NotebookLM fallback'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('NotebookLM TTS error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        provider: 'notebooklm'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});