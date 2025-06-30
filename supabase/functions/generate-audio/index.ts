
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript, job_id } = await req.json();
    
    console.log('🔊 Generating audio for job:', job_id);
    console.log('📝 Transcript length:', transcript.length);
    
    // Clean transcript for TTS
    const cleanTranscript = transcript
      .replace(/\[PAUSE\]/g, '... ')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/\n{2,}/g, '\n')
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      .trim();
    
    console.log('🧹 Cleaned transcript for TTS');
    
    // Generate audio with Deepgram Aura2
    const audioResponse = await fetch('https://api.deepgram.com/v1/speak', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${Deno.env.get('DEEPGRAM_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: cleanTranscript,
        model: 'aura-luna-en',
        encoding: 'mp3',
        sample_rate: 44100,
        bit_rate: 128000
      })
    });
    
    if (!audioResponse.ok) {
      const errorText = await audioResponse.text();
      console.error('❌ Deepgram API error:', errorText);
      throw new Error(`Audio generation failed: ${audioResponse.statusText}`);
    }
    
    console.log('✅ Audio generated successfully');
    
    const audioBuffer = await audioResponse.arrayBuffer();
    console.log('📦 Audio buffer size:', audioBuffer.byteLength);
    
    // Upload to Supabase Storage
    const fileName = `podcast_${job_id}_${Date.now()}.mp3`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('podcasts')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
        cacheControl: '3600'
      });
    
    if (uploadError) {
      console.error('❌ Storage upload error:', uploadError);
      throw uploadError;
    }
    
    console.log('📤 Audio uploaded to storage:', fileName);
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('podcasts')
      .getPublicUrl(fileName);
    
    console.log('🔗 Public URL generated:', publicUrl);
    
    return new Response(JSON.stringify({
      audio_url: publicUrl,
      file_name: fileName
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Audio generation error:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
