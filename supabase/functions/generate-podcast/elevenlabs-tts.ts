
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
    
    // Split the text into sentences for better voice alternation
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 10);
    const audioBuffers: ArrayBuffer[] = [];
    
    // Voice IDs for two different hosts
    const voice1 = '9BWtsMINqrJLrRacOk9x'; // Aria - female voice
    const voice2 = 'onwK4e9ZLuTAKqWW03F9'; // Daniel - male voice
    
    console.log('Processing', sentences.length, 'sentences for alternating voices');
    
    for (let i = 0; i < sentences.length; i++) {
      let sentence = sentences[i].trim();
      
      if (sentence.length === 0) continue;
      
      // Add proper punctuation if missing
      if (!sentence.match(/[.!?]$/)) {
        sentence += '.';
      }
      
      // Alternate voices - start with voice1
      const voiceId = i % 2 === 0 ? voice1 : voice2;
      const voiceName = i % 2 === 0 ? 'Voice 1 (Aria)' : 'Voice 2 (Daniel)';
      
      console.log(`Generating audio for sentence ${i + 1} with ${voiceName}`);
      
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsApiKey,
        },
        body: JSON.stringify({
          text: sentence,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true
          }
        }),
      });

      console.log(`ElevenLabs TTS API response status for sentence ${i + 1}:`, response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`ElevenLabs TTS API error for sentence ${i + 1}:`, response.status, errorText);
        continue; // Skip this segment but continue with others
      }

      // Store the audio buffer
      const arrayBuffer = await response.arrayBuffer();
      audioBuffers.push(arrayBuffer);
      
      console.log(`Audio buffer size for sentence ${i + 1}:`, arrayBuffer.byteLength, 'bytes');
      
      // Add a small delay between requests to avoid rate limiting
      if (i < sentences.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    if (audioBuffers.length === 0) {
      console.log('No audio segments generated');
      return null;
    }
    
    console.log('Successfully generated audio segments:', audioBuffers.length);
    
    // Concatenate all audio buffers
    const totalLength = audioBuffers.reduce((acc, buffer) => acc + buffer.byteLength, 0);
    const concatenatedBuffer = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const buffer of audioBuffers) {
      concatenatedBuffer.set(new Uint8Array(buffer), offset);
      offset += buffer.byteLength;
    }
    
    console.log('Total concatenated audio size:', concatenatedBuffer.length, 'bytes');
    
    // Convert to base64 in chunks to avoid stack overflow
    let binaryString = '';
    const chunkSize = 8192; // Process 8KB at a time
    
    for (let j = 0; j < concatenatedBuffer.length; j += chunkSize) {
      const chunk = concatenatedBuffer.slice(j, j + chunkSize);
      binaryString += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    const base64Audio = btoa(binaryString);
    console.log('Returning concatenated audio data, base64 length:', base64Audio.length);
    
    return `data:audio/mp3;base64,${base64Audio}`;
    
  } catch (error) {
    console.error('Error in ElevenLabs TTS generation:', error.message);
    return null;
  }
}
