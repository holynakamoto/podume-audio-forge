
import { generateScriptWithClaude } from './claude-api.ts';
import { generateAudioWithDeepgram } from './deepgram-tts.ts';
import { generateBasicScript } from './script-generator.ts';

interface PodcastData {
  title: string;
  package_type: string;
  voice_clone: boolean;
  premium_assets: boolean;
}

export async function generatePodcastScript(resumeContent: string): Promise<string> {
  console.log('=== Starting podcast script generation ===');
  console.log('Resume content length:', resumeContent.length);
  
  // Try Claude 3.5 Sonnet first (as per PRD)
  const claudeApiKey = Deno.env.get('ANTHROPIC_API_KEY');
  
  if (claudeApiKey) {
    console.log('Anthropic API key found, using Claude 3.5 Sonnet...');
    try {
      return await generateScriptWithClaude(resumeContent);
    } catch (error) {
      console.error('Claude generation failed, falling back:', error);
    }
  } else {
    console.log('Anthropic API key not found');
  }

  // Fallback to enhanced script generation
  console.log('Using enhanced script generation as fallback');
  return generateBasicScript(resumeContent);
}

export async function generatePodcastAudio(transcript: string): Promise<string | null> {
  console.log('=== Starting podcast audio generation ===');
  console.log('Transcript length:', transcript.length);
  
  // Try Deepgram Aura-2 first (as per PRD)
  const deepgramApiKey = Deno.env.get('DEEPGRAM_API_KEY');
  
  if (deepgramApiKey) {
    console.log('Deepgram API key found, using Aura-2...');
    try {
      return await generateAudioWithDeepgram(transcript);
    } catch (error) {
      console.error('Deepgram generation failed:', error);
    }
  } else {
    console.log('Deepgram API key not found');
  }

  // Could add other TTS fallbacks here if needed
  console.log('No audio generation available');
  return null;
}
