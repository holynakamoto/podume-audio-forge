
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
    
    // ElevenLabs has a limit, but it's higher than OpenAI
    // For free tier, we'll keep it reasonable
    const maxLength = 5000;
    let textToConvert = text;
    
    if (text.length > maxLength) {
      console.log('Text too long, truncating to', maxLength, 'characters');
      textToConvert = text.substring(0, maxLength) + '...';
    }
    
    // Using a professional voice - Aria (female, clear)
    const voiceId = '9BWtsMINqrJLrRacOk9x'; // Aria voice
    
    console.log('Making request to ElevenLabs TTS API...');
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify({
        text: textToConvert,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true
        }
      }),
    });

    console.log('ElevenLabs TTS API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs TTS API error:', response.status, errorText);
      return null;
    }

    // Convert the audio response to base64 using a more memory-efficient approach
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    console.log('Audio buffer size:', uint8Array.length, 'bytes');
    
    // Convert to base64 in chunks to avoid stack overflow
    let binaryString = '';
    const chunkSize = 8192; // Process 8KB at a time
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      binaryString += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    const base64Audio = btoa(binaryString);
    
    console.log('Successfully generated audio with ElevenLabs TTS');
    console.log('Base64 audio length:', base64Audio.length);
    return `data:audio/mp3;base64,${base64Audio}`;
    
  } catch (error) {
    console.error('Error in ElevenLabs TTS generation:', error.message);
    return null;
  }
}
