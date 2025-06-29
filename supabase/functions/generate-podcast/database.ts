
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { PodcastRequest } from './types.ts';
import { generateAudioWithDeepgram } from './deepgram-tts.ts';
import { processAudioWithAuphonic } from './auphonic-api.ts';
import { triggerZapierMCP, notifyZapierCompletion } from './zapier-mcp.ts';

export async function savePodcastToDatabase(
  user: any,
  request: PodcastRequest,
  generatedScript: string
) {
  console.log('Saving podcast to database...');
  console.log('Generated script length:', generatedScript.length);
  console.log('Generated script preview:', generatedScript.substring(0, 200) + '...');
  
  const supabaseAdminClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // First create the podcast entry without audio
    const { data, error: insertError } = await supabaseAdminClient
      .from('podcasts')
      .insert({
        user_id: user.id,
        title: request.title || 'Untitled Podcast',
        resume_content: request.resume_content || '',
        package_type: request.package_type || 'core',
        voice_clone: request.voice_clone || false,
        premium_assets: request.premium_assets || false,
        description: `Professional podcast generated from resume - ${request.title}`,
        transcript: generatedScript,
        audio_url: null,
        status: 'processing',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw insertError;
    }
    
    console.log('Podcast created successfully with ID:', data.id);
    
    // Trigger Zapier MCP workflow early for parallel processing
    await triggerZapierMCP(data);
    
    console.log('Starting audio generation with Deepgram Aura-2...');

    // Generate audio with Deepgram Aura-2
    const audioDataUrl = await generateAudioWithDeepgram(generatedScript);
    
    if (audioDataUrl) {
      console.log('Deepgram audio generation successful');
      
      // Process audio with Auphonic for enhancement
      console.log('Starting Auphonic audio post-processing...');
      const processedAudioUrl = await processAudioWithAuphonic(audioDataUrl, data.title);
      
      const finalAudioUrl = processedAudioUrl || audioDataUrl;
      console.log('Final audio URL:', finalAudioUrl ? 'Generated' : 'None');
      
      // Update the podcast with the processed audio URL
      const { error: updateError } = await supabaseAdminClient
        .from('podcasts')
        .update({
          audio_url: finalAudioUrl,
          status: 'completed',
        })
        .eq('id', data.id);

      if (updateError) {
        console.error('Failed to update podcast with audio URL:', updateError);
      } else {
        console.log('Podcast updated with processed audio URL successfully');
        data.audio_url = finalAudioUrl;
        data.status = 'completed';
        
        // Notify Zapier of completion
        await notifyZapierCompletion(data);
      }
    } else {
      console.log('Deepgram audio generation failed, keeping podcast without audio');
      // Update status to completed even without audio
      await supabaseAdminClient
        .from('podcasts')
        .update({ status: 'completed' })
        .eq('id', data.id);
      data.status = 'completed';
      
      // Still notify Zapier even without audio
      await notifyZapierCompletion(data);
    }
    
    return data;
  } catch (dbError) {
    console.error('Database operation failed:', dbError);
    throw new Error(`Database error: ${dbError.message}`);
  }
}
