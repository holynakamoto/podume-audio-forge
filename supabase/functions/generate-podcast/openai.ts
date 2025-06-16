
import { generateScriptWithHuggingFace } from './huggingface-api.ts';
import { generateBasicScript } from './script-generator.ts';

interface PodcastData {
  title: string;
  package_type: string;
  voice_clone: boolean;
  premium_assets: boolean;
}

export async function generatePodcastScript(resumeContent: string): Promise<string> {
  const hfApiKey = Deno.env.get('HUGGING_FACE_API_KEY');
  
  if (!hfApiKey) {
    console.log('Hugging Face API key not found, using basic script generation');
    return generateBasicScript(resumeContent);
  }

  console.log('Hugging Face API key found, proceeding with generation...');
  return await generateScriptWithHuggingFace(resumeContent, hfApiKey);
}
