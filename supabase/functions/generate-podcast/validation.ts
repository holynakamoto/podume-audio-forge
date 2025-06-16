
import { PodcastRequest } from './types.ts';

export function validateEnvironment(): string | null {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  console.log('OpenAI API key check:', openAIApiKey ? 'Found' : 'NOT FOUND');
  
  if (!openAIApiKey) {
    console.error('OpenAI API key not found in environment variables');
    return 'OpenAI API key not configured. Please check your Supabase secrets configuration';
  }
  console.log('OpenAI API key found');
  return null;
}

export function validateRequest(body: any): { isValid: boolean; error?: string; data?: PodcastRequest } {
  const { resume_content, title, package_type, voice_clone, premium_assets } = body;
  
  console.log('Request data received:', { 
    title, 
    package_type, 
    voice_clone, 
    premium_assets,
    resume_content_length: resume_content?.length || 0
  });

  if (!resume_content || !title) {
    console.error('Missing required fields');
    return { isValid: false, error: 'Missing required fields: resume_content and title' };
  }

  return {
    isValid: true,
    data: { resume_content, title, package_type, voice_clone, premium_assets }
  };
}
