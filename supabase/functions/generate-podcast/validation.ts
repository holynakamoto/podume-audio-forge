
interface ValidationResult {
  isValid: boolean;
  error?: string;
  data?: PodcastRequest;
}

interface PodcastRequest {
  title: string;
  package_type: string;
  voice_clone: boolean;
  premium_assets: boolean;
  resume_content: string;
}

export function validateEnvironment(): string | null {
  console.log('=== Environment Validation ===');
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  console.log('Supabase URL present:', !!supabaseUrl);
  console.log('Supabase Service Role Key present:', !!supabaseServiceKey);
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return 'Missing required Supabase environment variables';
  }

  // Check for API keys (optional but recommended)
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
  const deepgramKey = Deno.env.get('DEEPGRAM_API_KEY');
  const hfKey = Deno.env.get('HUGGING_FACE_API_KEY');
  
  console.log('Anthropic API key present:', !!anthropicKey);
  console.log('Deepgram API key present:', !!deepgramKey);
  console.log('Hugging Face API key present:', !!hfKey);
  
  if (anthropicKey) {
    console.log('Anthropic API key prefix:', anthropicKey.substring(0, 8) + '...');
  }
  if (deepgramKey) {
    console.log('Deepgram API key prefix:', deepgramKey.substring(0, 8) + '...');
  }
  if (hfKey) {
    console.log('Hugging Face API key prefix:', hfKey.substring(0, 8) + '...');
  }
  
  console.log('All required environment variables found');
  return null;
}

export function validateRequest(body: any): ValidationResult {
  console.log('=== Request Validation ===');
  
  if (!body) {
    return { isValid: false, error: 'Request body is required' };
  }

  console.log('Request data received:', {
    title: body.title,
    package_type: body.package_type,
    voice_clone: body.voice_clone,
    premium_assets: body.premium_assets,
    resume_content_length: body.resume_content?.length || 0,
    resume_content_preview: body.resume_content?.substring(0, 100) + '...' || 'No content'
  });

  // Validate required fields
  if (!body.title || typeof body.title !== 'string') {
    return { isValid: false, error: 'Valid title is required' };
  }

  if (body.title.length < 3 || body.title.length > 200) {
    return { isValid: false, error: 'Title must be between 3 and 200 characters' };
  }

  if (!body.package_type || typeof body.package_type !== 'string') {
    return { isValid: false, error: 'Valid package_type is required' };
  }

  if (!['core', 'premium', 'enterprise'].includes(body.package_type)) {
    return { isValid: false, error: 'package_type must be core, premium, or enterprise' };
  }

  if (!body.resume_content || typeof body.resume_content !== 'string') {
    return { isValid: false, error: 'Resume content is required' };
  }

  if (body.resume_content.length < 50) {
    return { isValid: false, error: 'Resume content is too short (minimum 50 characters)' };
  }

  if (body.resume_content.length > 50000) {
    return { isValid: false, error: 'Resume content is too long (maximum 50,000 characters)' };
  }

  // Validate boolean fields
  if (typeof body.voice_clone !== 'boolean') {
    body.voice_clone = false;
  }

  if (typeof body.premium_assets !== 'boolean') {
    body.premium_assets = false;
  }

  const validatedData: PodcastRequest = {
    title: body.title.trim(),
    package_type: body.package_type,
    voice_clone: body.voice_clone,
    premium_assets: body.premium_assets,
    resume_content: body.resume_content.trim()
  };

  console.log('Request validation passed');
  return { isValid: true, data: validatedData };
}
