
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { PodcastRequest } from './types.ts';

export async function savePodcastToDatabase(
  user: any,
  request: PodcastRequest,
  generatedScript: string
) {
  console.log('Saving podcast to database...');
  console.log('Generated script length:', generatedScript.length);
  console.log('Source type:', request.source_type);
  console.log('LinkedIn URL:', request.linkedin_url || 'Not provided');
  
  const supabaseAdminClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Create the podcast entry with generated content
    const { data, error: insertError } = await supabaseAdminClient
      .from('podcasts')
      .insert({
        user_id: user.id,
        title: request.title || 'Untitled Podcast',
        resume_content: request.resume_content || '',
        package_type: request.package_type || 'core',
        voice_clone: request.voice_clone || false,
        premium_assets: request.premium_assets || false,
        description: `Professional podcast generated from ${request.source_type === 'linkedin_url' ? 'LinkedIn profile' : 'resume'} - ${request.title}`,
        transcript: generatedScript,
        audio_url: null, // Audio generation can be added later
        status: 'completed', // Mark as completed since we have the transcript
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw insertError;
    }
    
    console.log('Podcast created successfully with ID:', data.id);
    console.log('Status: completed with generated transcript');
    
    return data;
    
  } catch (dbError) {
    console.error('Database operation failed:', dbError);
    throw new Error(`Database error: ${dbError.message}`);
  }
}
