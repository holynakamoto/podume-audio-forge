
import { PodcastRequest } from './types.ts';

export function validateEnvironment(): string | null {
  const huggingFaceApiKey = Deno.env.get('HUGGING_FACE_API_KEY');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  console.log('=== Environment Validation ===');
  console.log('Hugging Face API key present:', !!huggingFaceApiKey);
  console.log('Hugging Face API key prefix:', huggingFaceApiKey ? huggingFaceApiKey.substring(0, 7) + '...' : 'MISSING');
  console.log('Supabase URL present:', !!supabaseUrl);
  console.log('Supabase Service Role Key present:', !!supabaseServiceKey);
  
  if (!huggingFaceApiKey) {
    console.error('Hugging Face API key not found in environment variables');
    return 'Hugging Face API key not configured. Please check your Supabase secrets configuration';
  }
  
  if (!supabaseUrl) {
    console.error('Supabase URL not found in environment variables');
    return 'Supabase URL not configured. Please check your Supabase secrets configuration';
  }
  
  if (!supabaseServiceKey) {
    console.error('Supabase Service Role Key not found in environment variables');
    return 'Supabase Service Role Key not configured. Please check your Supabase secrets configuration';
  }
  
  console.log('All required environment variables found');
  return null;
}

export function validateRequest(body: any): { isValid: boolean; error?: string; data?: PodcastRequest } {
  const { resume_content, title, package_type, voice_clone, premium_assets } = body;
  
  console.log('=== Request Validation ===');
  console.log('Request data received:', { 
    title, 
    package_type, 
    voice_clone, 
    premium_assets,
    resume_content_length: resume_content?.length || 0,
    resume_content_preview: resume_content ? resume_content.substring(0, 100) + '...' : 'MISSING'
  });

  if (!resume_content || typeof resume_content !== 'string') {
    console.error('Resume content validation failed:', { 
      present: !!resume_content, 
      type: typeof resume_content,
      length: resume_content?.length || 0
    });
    return { isValid: false, error: 'Missing or invalid resume_content field' };
  }

  if (!title || typeof title !== 'string') {
    console.error('Title validation failed:', { 
      present: !!title, 
      type: typeof title,
      value: title
    });
    return { isValid: false, error: 'Missing or invalid title field' };
  }

  if (resume_content.length < 5) {
    console.error('Resume content too short:', resume_content.length);
    return { isValid: false, error: 'Resume content must be at least 5 characters' };
  }

  if (title.length < 3) {
    console.error('Title too short:', title.length);
    return { isValid: false, error: 'Title must be at least 3 characters' };
  }

  console.log('Request validation passed');
  return {
    isValid: true,
    data: { resume_content, title, package_type, voice_clone, premium_assets }
  };
}
