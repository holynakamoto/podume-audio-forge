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
    console.log('=== TTS Test Function Called ===');
    console.log('Method:', req.method);
    console.log('Headers:', Object.fromEntries(req.headers.entries()));
    
    const body = await req.json();
    console.log('Request body:', body);
    
    const { text } = body;
    
    if (!text) {
      throw new Error('Text is required');
    }

    console.log('Text received:', text.substring(0, 100) + '...');

    // Simple test response without calling external APIs
    const testResponse = {
      success: true,
      audio: 'UklGRjQAAABXQVZFZm10IBAAAAABAAABACYAAACGAAAABAA...', // Base64 test audio
      provider: 'test',
      format: 'wav',
      message: 'Test TTS function working'
    };

    console.log('Sending test response');

    return new Response(
      JSON.stringify(testResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('TTS Test error:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        stack: error.stack,
        provider: 'test'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});