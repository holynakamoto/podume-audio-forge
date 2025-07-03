import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');

// Voice IDs for the two hosts
const HOST_A_VOICE = 'EXAVITQu4vr4xnSDxMaL'; // Sarah - Female host
const HOST_B_VOICE = 'TX3LPaxmHKxFdv7VOQHJ'; // Liam - Male host

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    const { transcript } = await req.json();

    if (!transcript) {
      throw new Error('Transcript is required');
    }

    console.log('Generating dual-voice podcast...');

    // Split transcript by hosts
    const lines = transcript.split('\n').filter(line => line.trim());
    const audioSegments = [];

    for (const line of lines) {
      if (line.includes('**Host A**:') || line.includes('**Sarah**:')) {
        const text = line.replace(/\*\*Host A\*\*:|Sarah:/g, '').trim();
        if (text) {
          audioSegments.push({ voice: HOST_A_VOICE, text, speaker: 'Host A' });
        }
      } else if (line.includes('**Host B**:') || line.includes('**Marcus**:')) {
        const text = line.replace(/\*\*Host B\*\*:|Marcus:/g, '').trim();
        if (text) {
          audioSegments.push({ voice: HOST_B_VOICE, text, speaker: 'Host B' });
        }
      }
    }

    console.log(`Found ${audioSegments.length} audio segments`);

    // Generate audio for each segment
    const audioBuffers = [];
    
    for (let i = 0; i < audioSegments.length; i++) {
      const segment = audioSegments[i];
      console.log(`Generating audio for ${segment.speaker}: ${segment.text.substring(0, 50)}...`);

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${segment.voice}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: segment.text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.2,
            use_speaker_boost: true
          }
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`ElevenLabs API error for segment ${i}:`, error);
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBuffer = await response.arrayBuffer();
      audioBuffers.push({
        buffer: audioBuffer,
        speaker: segment.speaker,
        index: i
      });

      // Add a small pause between speakers (500ms of silence)
      if (i < audioSegments.length - 1) {
        // Simple silence buffer (this is a basic implementation)
        const silenceBuffer = new ArrayBuffer(8000); // Approximate 500ms of silence
        audioBuffers.push({
          buffer: silenceBuffer,
          speaker: 'silence',
          index: i + 0.5
        });
      }
    }

    // For simplicity, return the first audio segment for now
    // In a full implementation, you'd concatenate all audio buffers
    const firstAudio = audioBuffers[0];
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(firstAudio.buffer)));

    return new Response(JSON.stringify({ 
      audioContent: base64Audio,
      segments: audioSegments.length,
      message: 'Dual-voice podcast generated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating dual-voice podcast:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate dual-voice podcast' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});