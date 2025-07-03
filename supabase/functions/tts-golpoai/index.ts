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
      console.error('GOLPO_AI_API_KEY environment variable not found');
      throw new Error('Golpo AI API key not configured');
    }

    console.log('API Key exists, length:', apiKey.length);

    // Since we don't have official API docs, let's try multiple possible endpoints
    const possibleEndpoints = [
      'https://api.golpoai.com/v1/tts',
      'https://api.golpoai.com/tts', 
      'https://golpoai.com/api/tts',
      'https://golpoai.com/api/v1/tts'
    ];

    let lastError = null;
    
    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: text,
            voice: voice,
            voice_id: voice,
            format: 'mp3',
            output_format: 'mp3'
          }),
        });

        console.log(`Response status for ${endpoint}:`, response.status);
        
        if (response.status === 404) {
          console.log(`Endpoint ${endpoint} not found, trying next...`);
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Golpo AI API error for ${endpoint}:`, response.status, errorText);
          lastError = new Error(`Golpo AI API error: ${response.status} - ${errorText}`);
          continue;
        }

        const result = await response.json();
        console.log('Golpo AI response keys:', Object.keys(result));
        
        // Try different possible response formats
        let base64Audio = null;
        if (result.audio) {
          base64Audio = result.audio;
        } else if (result.audioContent) {
          base64Audio = result.audioContent;
        } else if (result.data) {
          base64Audio = result.data;
        } else {
          console.error('No audio data found in response:', result);
          throw new Error('No audio data received from Golpo AI');
        }

        console.log('Golpo AI TTS successful, audio received from:', endpoint);

        return new Response(
          JSON.stringify({ 
            success: true,
            audio: base64Audio,
            provider: 'golpoai',
            voice,
            format: 'mp3',
            endpoint: endpoint
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
        
      } catch (endpointError: any) {
        console.error(`Error with endpoint ${endpoint}:`, endpointError.message);
        lastError = endpointError;
        continue;
      }
    }

    // If we get here, all endpoints failed
    throw lastError || new Error('All Golpo AI endpoints failed');

  } catch (error: any) {
    console.error('Golpo AI TTS error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        provider: 'golpoai',
        details: 'Check function logs for more details'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});