import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PodcastData {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  created_at: string;
  user_id: string;
  transcript: string;
}

function generateRSSFeed(podcast: PodcastData): string {
  const pubDate = new Date(podcast.created_at).toUTCString();
  const currentDate = new Date().toUTCString();
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(podcast.title)}</title>
    <description>${escapeXml(podcast.description || 'AI-generated podcast from LinkedIn profile')}</description>
    <link>https://pudwgzutzoidxbvozhnk.supabase.co/functions/v1/generate-rss?podcast_id=${podcast.id}</link>
    <language>en-us</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <pubDate>${currentDate}</pubDate>
    <ttl>60</ttl>
    <image>
      <url>https://pudwgzutzoidxbvozhnk.supabase.co/storage/v1/object/public/podcasts/default-cover.jpg</url>
      <title>${escapeXml(podcast.title)}</title>
      <link>https://pudwgzutzoidxbvozhnk.supabase.co/functions/v1/generate-rss?podcast_id=${podcast.id}</link>
      <width>3000</width>
      <height>3000</height>
    </image>
    
    <!-- iTunes specific tags -->
    <itunes:author>AI Podcast Generator</itunes:author>
    <itunes:summary>${escapeXml(podcast.description || 'AI-generated podcast from LinkedIn profile')}</itunes:summary>
    <itunes:category text="Business">
      <itunes:category text="Careers"/>
    </itunes:category>
    <itunes:owner>
      <itunes:name>AI Podcast Generator</itunes:name>
      <itunes:email>support@aipodcastgenerator.com</itunes:email>
    </itunes:owner>
    <itunes:explicit>no</itunes:explicit>
    <itunes:image href="https://pudwgzutzoidxbvozhnk.supabase.co/storage/v1/object/public/podcasts/default-cover.jpg"/>
    
    <item>
      <title>${escapeXml(podcast.title)}</title>
      <description>${escapeXml(podcast.description || 'AI-generated podcast from LinkedIn profile')}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="false">${podcast.id}</guid>
      <enclosure url="${podcast.audio_url}" type="audio/mpeg" length="0"/>
      <itunes:duration>00:05:00</itunes:duration>
      <itunes:explicit>no</itunes:explicit>
      ${podcast.transcript ? `<content:encoded><![CDATA[${podcast.transcript}]]></content:encoded>` : ''}
    </item>
  </channel>
</rss>`;
}

function escapeXml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const podcastId = url.searchParams.get('podcast_id');

    if (!podcastId) {
      return new Response('Missing podcast_id parameter', { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      });
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch podcast data
    const { data: podcast, error } = await supabase
      .from('podcasts')
      .select('*')
      .eq('id', podcastId)
      .single();

    if (error || !podcast) {
      console.error('Error fetching podcast:', error);
      return new Response('Podcast not found', { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      });
    }

    if (!podcast.audio_url) {
      return new Response('Podcast audio not available', { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      });
    }

    const rssContent = generateRSSFeed(podcast);

    return new Response(rssContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new Response('Internal server error', { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
    });
  }
});