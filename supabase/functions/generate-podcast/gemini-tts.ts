
export async function generateAudioWithGeminiTTS(text: string): Promise<string | null> {
  console.log('Attempting to generate audio with Gemini TTS...');
  
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  if (!geminiApiKey) {
    console.log('Gemini API key not found, skipping TTS generation');
    return null;
  }

  try {
    console.log('Making request to Gemini TTS API...');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Generate a natural, professional podcast-style audio for this text: "${text}"`
          }]
        }],
        generationConfig: {
          responseMimeType: "audio/wav",
          responseModalities: ["Audio"]
        },
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Zephyr"
            }
          }
        }
      }),
    });

    console.log('Gemini TTS response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini TTS API error:', response.status, errorText);
      return null; // Return null instead of throwing
    }

    const result = await response.json();
    console.log('Gemini TTS response structure:', JSON.stringify(result, null, 2));
    
    // Extract audio data with more flexible response handling
    if (result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
      const audioData = result.candidates[0].content.parts[0].inlineData.data;
      const mimeType = result.candidates[0].content.parts[0].inlineData.mimeType || 'audio/wav';
      console.log('Successfully extracted audio data from Gemini TTS');
      return `data:${mimeType};base64,${audioData}`;
    } else {
      console.log('No audio data found in Gemini TTS response');
      return null;
    }
  } catch (error) {
    console.error('Error in Gemini TTS generation:', error.message);
    return null; // Always return null on error instead of throwing
  }
}
