
export async function generateAudioWithOpenAITTS(text: string): Promise<string | null> {
  console.log('Attempting to generate audio with OpenAI TTS...');
  
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    console.log('OpenAI API key not found, skipping TTS generation');
    return null;
  }

  try {
    console.log('Generating podcast audio with OpenAI TTS...');
    console.log('Text length:', text.length);
    
    // OpenAI TTS has a limit of 4096 characters per request
    const maxLength = 4000;
    let textToConvert = text;
    
    if (text.length > maxLength) {
      console.log('Text too long, truncating to', maxLength, 'characters');
      textToConvert = text.substring(0, maxLength) + '...';
    }
    
    console.log('Making request to OpenAI TTS API...');
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: textToConvert,
        voice: 'alloy',
        response_format: 'mp3'
      }),
    });

    console.log('OpenAI TTS API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI TTS API error:', response.status, errorText);
      return null;
    }

    // Convert the audio response to base64
    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    console.log('Successfully generated audio with OpenAI TTS');
    return `data:audio/mp3;base64,${base64Audio}`;
    
  } catch (error) {
    console.error('Error in OpenAI TTS generation:', error.message);
    return null;
  }
}
