

export async function generateAudioWithElevenLabsTTS(text: string): Promise<string | null> {
  console.log('Attempting to generate audio with ElevenLabs TTS...');
  
  const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
  if (!elevenLabsApiKey) {
    console.log('ElevenLabs API key not found, skipping TTS generation');
    return null;
  }

  try {
    console.log('Generating podcast audio with ElevenLabs TTS...');
    console.log('Text length:', text.length);
    
    // Split the text by lines to identify host segments
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const audioSegments: string[] = [];
    
    // Voice IDs for two different hosts
    const voice1 = '9BWtsMINqrJLrRacOk9x'; // Aria - female voice
    const voice2 = 'onwK4e9ZLuTAKqWW03F9'; // Daniel - male voice
    
    console.log('Processing', lines.length, 'text segments');
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      
      // Remove "Host 1:" and "Host 2:" labels
      line = line.replace(/^Host\s*[12]:\s*/i, '');
      
      if (line.length === 0) continue;
      
      // Alternate between voices based on original host labeling or line index
      const isHost1 = lines[i].toLowerCase().includes('host 1') || i % 2 === 0;
      const voiceId = isHost1 ? voice1 : voice2;
      
      console.log(`Generating audio for segment ${i + 1} with ${isHost1 ? 'Voice 1 (Aria)' : 'Voice 2 (Daniel)'}`);
      
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsApiKey,
        },
        body: JSON.stringify({
          text: line,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true
          }
        }),
      });

      console.log(`ElevenLabs TTS API response status for segment ${i + 1}:`, response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`ElevenLabs TTS API error for segment ${i + 1}:`, response.status, errorText);
        continue; // Skip this segment but continue with others
      }

      // Convert the audio response to base64
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      console.log(`Audio buffer size for segment ${i + 1}:`, uint8Array.length, 'bytes');
      
      // Convert to base64 in chunks to avoid stack overflow
      let binaryString = '';
      const chunkSize = 8192; // Process 8KB at a time
      
      for (let j = 0; j < uint8Array.length; j += chunkSize) {
        const chunk = uint8Array.slice(j, j + chunkSize);
        binaryString += String.fromCharCode.apply(null, Array.from(chunk));
      }
      
      const base64Audio = btoa(binaryString);
      audioSegments.push(`data:audio/mp3;base64,${base64Audio}`);
      
      // Add a small delay between requests to avoid rate limiting
      if (i < lines.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    if (audioSegments.length === 0) {
      console.log('No audio segments generated');
      return null;
    }
    
    // For now, return the first segment as a proof of concept
    // In a full implementation, you'd want to concatenate all segments
    console.log('Successfully generated audio segments:', audioSegments.length);
    console.log('Returning first segment for testing');
    return audioSegments[0];
    
  } catch (error) {
    console.error('Error in ElevenLabs TTS generation:', error.message);
    return null;
  }
}

