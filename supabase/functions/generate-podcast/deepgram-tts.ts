
export async function generateAudioWithDeepgram(text: string): Promise<string | null> {
  console.log('=== Generating audio with Deepgram Aura-2 ===');
  
  const deepgramApiKey = Deno.env.get('DEEPGRAM_API_KEY');
  if (!deepgramApiKey) {
    console.log('Deepgram API key not found, skipping TTS generation');
    return null;
  }

  try {
    console.log('Generating podcast audio with Deepgram Aura-2...');
    console.log('Text length:', text.length);
    
    // Split text by speakers for multi-voice generation
    const speakerSegments = splitTextBySpeakers(text);
    console.log('Found speaker segments:', speakerSegments.length);
    
    const audioSegments: string[] = [];
    
    for (const segment of speakerSegments) {
      console.log(`Generating audio for ${segment.speaker}...`);
      
      const voice = segment.speaker === 'Sarah' ? 'aura-asteria-en' : 'aura-apollo-en';
      
      const response = await fetch('https://api.deepgram.com/v1/speak?model=' + voice, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${deepgramApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: segment.text
        }),
      });

      console.log(`Deepgram API response status for ${segment.speaker}:`, response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Deepgram API error:', response.status, errorText);
        continue; // Skip this segment but continue with others
      }

      // Convert audio response to base64
      const arrayBuffer = await response.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      audioSegments.push(base64Audio);
    }
    
    if (audioSegments.length === 0) {
      console.log('No audio segments generated successfully');
      return null;
    }

    // For now, return the first segment (in a real implementation, you'd concatenate them)
    console.log('Successfully generated audio with Deepgram Aura-2');
    return `data:audio/wav;base64,${audioSegments[0]}`;
    
  } catch (error) {
    console.error('Error in Deepgram TTS generation:', error.message);
    return null;
  }
}

interface SpeakerSegment {
  speaker: string;
  text: string;
}

function splitTextBySpeakers(text: string): SpeakerSegment[] {
  const segments: SpeakerSegment[] = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('Sarah:')) {
      segments.push({
        speaker: 'Sarah',
        text: trimmed.replace('Sarah:', '').trim()
      });
    } else if (trimmed.startsWith('Mike:')) {
      segments.push({
        speaker: 'Mike',
        text: trimmed.replace('Mike:', '').trim()
      });
    } else if (trimmed.startsWith('Host 1:')) {
      segments.push({
        speaker: 'Sarah',
        text: trimmed.replace('Host 1:', '').trim()
      });
    } else if (trimmed.startsWith('Host 2:')) {
      segments.push({
        speaker: 'Mike',
        text: trimmed.replace('Host 2:', '').trim()
      });
    } else if (trimmed.length > 0 && !trimmed.includes(':')) {
      // Add to last speaker or default to Sarah
      if (segments.length > 0) {
        segments[segments.length - 1].text += ' ' + trimmed;
      } else {
        segments.push({
          speaker: 'Sarah',
          text: trimmed
        });
      }
    }
  }
  
  return segments.filter(segment => segment.text.length > 0);
}
