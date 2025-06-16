
export async function generateAudioWithGeminiTTS(text: string): Promise<string | null> {
  console.log('Attempting to generate audio with Gemini TTS...');
  
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  if (!geminiApiKey) {
    console.log('Gemini API key not found, skipping TTS generation');
    return null;
  }

  try {
    console.log('Generating two-voice podcast conversation...');
    
    // Split the script into segments for different speakers
    const conversationScript = convertToTwoSpeakerFormat(text);
    console.log('Converted script for two speakers:', conversationScript.substring(0, 200) + '...');
    
    console.log('Making request to Gemini TTS API...');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Generate a natural, professional podcast-style audio conversation between two hosts discussing this content. Use distinct voices for each speaker: "${conversationScript}"`
          }]
        }],
        generationConfig: {
          responseMimeType: "audio/wav",
          responseModalities: ["Audio"]
        },
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Journey"
            }
          }
        }
      }),
    });

    console.log('Gemini TTS response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini TTS API error:', response.status, errorText);
      
      // Try with alternative voice
      return await generateWithAlternativeVoice(conversationScript, geminiApiKey);
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
      console.log('No audio data found in Gemini TTS response, trying alternative approach');
      return await generateWithAlternativeVoice(conversationScript, geminiApiKey);
    }
  } catch (error) {
    console.error('Error in Gemini TTS generation:', error.message);
    return null;
  }
}

function convertToTwoSpeakerFormat(originalScript: string): string {
  // Convert the script into a more conversational format between two podcast hosts
  const lines = originalScript.split('\n').filter(line => line.trim().length > 0);
  
  let conversation = "Host 1: Welcome to Career Spotlight! I'm your host Sarah, and today we have an amazing professional journey to share with our listeners.\n\n";
  conversation += "Host 2: That's right, Sarah! I'm Mike, your co-host, and we're excited to dive into this inspiring career story.\n\n";
  
  // Convert the content into a natural back-and-forth conversation
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length > 0) {
      const speaker = i % 2 === 0 ? "Host 1" : "Host 2";
      conversation += `${speaker}: ${line}\n\n`;
    }
  }
  
  conversation += "Host 1: What an inspiring journey! Thanks for joining us on Career Spotlight.\n\n";
  conversation += "Host 2: Don't forget to subscribe and share this episode with anyone who might find this career story motivating!";
  
  return conversation;
}

async function generateWithAlternativeVoice(text: string, apiKey: string): Promise<string | null> {
  try {
    console.log('Trying alternative Gemini TTS voice...');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Create a professional podcast audio from this script with two distinct voices: "${text}"`
          }]
        }],
        generationConfig: {
          responseMimeType: "audio/wav",
          responseModalities: ["Audio"]
        },
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Puck"
            }
          }
        }
      }),
    });

    if (!response.ok) {
      console.error('Alternative voice also failed:', await response.text());
      return null;
    }

    const result = await response.json();
    
    if (result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
      const audioData = result.candidates[0].content.parts[0].inlineData.data;
      const mimeType = result.candidates[0].content.parts[0].inlineData.mimeType || 'audio/wav';
      console.log('Successfully generated audio with alternative voice');
      return `data:${mimeType};base64,${audioData}`;
    }
    
    return null;
  } catch (error) {
    console.error('Alternative voice generation failed:', error);
    return null;
  }
}
