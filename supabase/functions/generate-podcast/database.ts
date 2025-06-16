
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { PodcastRequest, PodcastContent } from './types.ts';

export async function savePodcastToDatabase(
  user: any,
  request: PodcastRequest,
  content: PodcastContent
) {
  console.log('Saving podcast to database...');
  
  const supabaseAdminClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { data, error: insertError } = await supabaseAdminClient
      .from('podcasts')
      .insert({
        user_id: user.id,
        title: request.title || 'Untitled Podcast',
        resume_content: request.resume_content || '',
        package_type: request.package_type || 'core',
        voice_clone: request.voice_clone || false,
        premium_assets: request.premium_assets || false,
        description: content.description || '',
        transcript: content.transcript || '',
        audio_url: null, // Skip TTS for now
        status: 'completed',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw insertError;
    }
    
    console.log('Podcast created successfully with ID:', data.id);
    return data;
  } catch (dbError) {
    console.error('Database operation failed:', dbError);
    throw new Error(`Database error: ${dbError.message}`);
  }
}
