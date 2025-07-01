import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ZapierCompletionPayload {
  podcast_id: string;
  audio_url: string;
  transcript: string;
  profile_name?: string;
  duration?: number;
  generation_timestamp: string;
  success: boolean;
  error_message?: string;
}

serve(async (req: Request) => {
  console.log('🎯 === Zapier Completion Webhook Called ===');
  console.log('📊 Request details:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries()),
    timestamp: new Date().toISOString()
  });

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Returning CORS response');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the completion data from Zapier AI Agent
    console.log('=== Step 1: Parsing Zapier completion data ===');
    let completionData: ZapierCompletionPayload;
    
    try {
      const rawBody = await req.text();
      console.log('📝 Raw completion body length:', rawBody.length);
      console.log('📝 Raw completion body preview:', rawBody.substring(0, 500));
      
      completionData = JSON.parse(rawBody);
      console.log('✅ Completion data parsed successfully:', {
        podcast_id: completionData.podcast_id,
        success: completionData.success,
        audio_url: completionData.audio_url ? 'Present' : 'Missing',
        transcript_length: completionData.transcript?.length || 0,
        profile_name: completionData.profile_name,
        duration: completionData.duration,
        error_message: completionData.error_message
      });
    } catch (parseError) {
      console.error('❌ Failed to parse completion data:', parseError);
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON in completion data',
        details: parseError.message
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    console.log('=== Step 2: Initializing Supabase client ===');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (!completionData.success) {
      console.error('❌ Zapier AI Agent reported failure:', completionData.error_message);
      
      // Update podcast status to failed
      const { error: updateError } = await supabaseClient
        .from('podcasts')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', completionData.podcast_id);

      if (updateError) {
        console.error('❌ Failed to update podcast status to failed:', updateError);
      } else {
        console.log('✅ Podcast status updated to failed');
      }

      return new Response(JSON.stringify({ 
        message: 'Completion processed (failed)',
        podcast_id: completionData.podcast_id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Update the podcast with the results from Zapier AI Agent
    console.log('=== Step 3: Updating podcast with completion data ===');
    
    const updateData: any = {
      audio_url: completionData.audio_url,
      transcript: completionData.transcript,
      status: 'completed',
      updated_at: new Date().toISOString(),
    };

    // Add optional metadata if provided
    if (completionData.profile_name || completionData.duration) {
      updateData.social_assets = {
        profile_name: completionData.profile_name,
        duration: completionData.duration,
        generation_timestamp: completionData.generation_timestamp,
        processed_by: 'zapier_ai_agent'
      };
    }

    console.log('📤 Updating podcast with data:', {
      podcast_id: completionData.podcast_id,
      audio_url: updateData.audio_url ? 'Present' : 'Missing',
      transcript_length: updateData.transcript?.length || 0,
      status: updateData.status,
      social_assets: updateData.social_assets
    });

    const { data: updatedPodcast, error: updateError } = await supabaseClient
      .from('podcasts')
      .update(updateData)
      .eq('id', completionData.podcast_id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Failed to update podcast:', updateError);
      return new Response(JSON.stringify({ 
        error: 'Failed to update podcast',
        details: updateError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Podcast updated successfully:', {
      id: updatedPodcast.id,
      title: updatedPodcast.title,
      status: updatedPodcast.status,
      audio_url: updatedPodcast.audio_url ? 'Present' : 'Missing',
      transcript_length: updatedPodcast.transcript?.length || 0
    });

    console.log('🎉 === Zapier Completion Processing Complete ===');

    return new Response(JSON.stringify({ 
      message: 'Completion processed successfully',
      podcast_id: completionData.podcast_id,
      status: 'completed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('=== CRITICAL ERROR in zapier-completion function ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: `Internal server error: ${error.message}`,
      details: 'Check function logs for more information'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});