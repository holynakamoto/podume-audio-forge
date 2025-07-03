import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DistributionRequest {
  podcastId: string;
  platforms: string[];
  userEmail?: string;
  authorName?: string;
}

interface PlatformSubmission {
  platform: string;
  status: 'submitted' | 'pending' | 'approved' | 'rejected';
  submissionUrl?: string;
  submissionId?: string;
  message?: string;
}

// Platform configurations with submission endpoints
const PLATFORMS = {
  spotify: {
    name: 'Spotify for Podcasters',
    submitUrl: 'https://podcasters.spotify.com/dashboard/submit',
    requiresManualSubmission: true,
    instructions: 'Visit Spotify for Podcasters and submit your RSS feed manually'
  },
  apple: {
    name: 'Apple Podcasts',
    submitUrl: 'https://podcastsconnect.apple.com/',
    requiresManualSubmission: true,
    instructions: 'Submit via Apple Podcasts Connect with your RSS feed'
  },
  anchor: {
    name: 'Anchor',
    submitUrl: 'https://anchor.fm/dashboard/episodes/new',
    requiresManualSubmission: true,
    instructions: 'Upload directly to Anchor for automatic distribution'
  }
};

async function logDistribution(supabase: any, podcastId: string, platform: string, status: string, details: any = {}) {
  try {
    await supabase
      .from('sharing_logs')
      .insert({
        podcast_id: podcastId,
        platform: platform,
        share_url: details.rssUrl || null,
        shared_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error logging distribution:', error);
  }
}

async function generateDistributionInstructions(podcastId: string, rssUrl: string): Promise<PlatformSubmission[]> {
  const submissions: PlatformSubmission[] = [];

  for (const [key, platform] of Object.entries(PLATFORMS)) {
    submissions.push({
      platform: platform.name,
      status: 'pending',
      submissionUrl: platform.submitUrl,
      message: `RSS Feed: ${rssUrl}\n\nInstructions: ${platform.instructions}`
    });
  }

  return submissions;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { podcastId, platforms, userEmail, authorName }: DistributionRequest = await req.json();

    if (!podcastId) {
      return new Response(JSON.stringify({ error: 'Missing podcastId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify podcast exists and has audio
    const { data: podcast, error: podcastError } = await supabase
      .from('podcasts')
      .select('*')
      .eq('id', podcastId)
      .single();

    if (podcastError || !podcast) {
      return new Response(JSON.stringify({ error: 'Podcast not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!podcast.audio_url) {
      return new Response(JSON.stringify({ error: 'Podcast audio not available' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Generate RSS feed URL
    const baseUrl = Deno.env.get('SUPABASE_URL') || 'https://pudwgzutzoidxbvozhnk.supabase.co';
    const rssUrl = `${baseUrl}/functions/v1/generate-rss?podcast_id=${podcastId}`;

    // Generate distribution instructions for all platforms
    const distributionResults = await generateDistributionInstructions(podcastId, rssUrl);

    // Log distribution attempts
    for (const result of distributionResults) {
      await logDistribution(supabase, podcastId, result.platform, result.status, { rssUrl });
    }

    // Update podcast status to indicate distribution is ready
    await supabase
      .from('podcasts')
      .update({ 
        status: 'distributed',
        updated_at: new Date().toISOString()
      })
      .eq('id', podcastId);

    return new Response(JSON.stringify({
      success: true,
      rssUrl,
      distributions: distributionResults,
      message: 'Podcast prepared for distribution. Use the provided links to submit to each platform.',
      instructions: 'Your RSS feed has been generated and is ready for submission to podcast platforms. Click the platform buttons to open their submission pages and paste your RSS feed URL.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in auto-distribute:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to prepare distribution',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});