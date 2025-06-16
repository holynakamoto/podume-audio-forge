
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const podcastId = url.searchParams.get('podcast_id');
    const userId = url.searchParams.get('user_id');

    if (!podcastId && !userId) {
      return new Response('Either podcast_id or user_id is required', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let query = supabase
      .from('podcasts')
      .select('*')
      .eq('status', 'completed');

    if (podcastId) {
      query = query.eq('id', podcastId);
    } else if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: podcasts, error } = await query;

    if (error) {
      console.error('Error fetching podcasts:', error);
      return new Response('Error fetching podcasts', { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    if (!podcasts || podcasts.length === 0) {
      return new Response('No podcasts found', { 
        status: 404, 
        headers: corsHeaders 
      });
    }

    // Generate RSS XML
    const baseUrl = `https://${Deno.env.get('SUPABASE_URL')?.replace('https://', '')}/functions/v1/generate-rss`;
    const rssXml = generateRSSXML(podcasts, baseUrl, userId);

    return new Response(rssXml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/rss+xml; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('Error generating RSS:', error);
    return new Response('Internal server error', { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});

function generateRSSXML(podcasts: any[], baseUrl: string, userId?: string): string {
  const channelTitle = userId ? `Podumé - Career Podcasts` : podcasts[0]?.title || 'Podumé Podcast';
  const channelDescription = userId 
    ? 'Professional career podcasts generated from resumes'
    : podcasts[0]?.description || 'Career-focused podcast content';

  const rssItems = podcasts.map(podcast => {
    const pubDate = new Date(podcast.created_at).toUTCString();
    const audioUrl = podcast.audio_url || '';
    
    return `
    <item>
      <title><![CDATA[${podcast.title}]]></title>
      <description><![CDATA[${podcast.description || 'Professional podcast generated from resume'}]]></description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="false">${podcast.id}</guid>
      ${audioUrl ? `<enclosure url="${audioUrl}" type="audio/mpeg" />` : ''}
      <itunes:summary><![CDATA[${podcast.description || 'Professional podcast generated from resume'}]]></itunes:summary>
      <itunes:duration>00:05:00</itunes:duration>
      <itunes:explicit>false</itunes:explicit>
    </item>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title><![CDATA[${channelTitle}]]></title>
    <description><![CDATA[${channelDescription}]]></description>
    <link>https://podume.com</link>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <itunes:author>Podumé</itunes:author>
    <itunes:summary><![CDATA[${channelDescription}]]></itunes:summary>
    <itunes:owner>
      <itunes:name>Podumé</itunes:name>
      <itunes:email>support@podume.com</itunes:email>
    </itunes:owner>
    <itunes:image href="https://podume.com/podcast-cover.jpg" />
    <itunes:category text="Business">
      <itunes:category text="Careers" />
    </itunes:category>
    <itunes:explicit>false</itunes:explicit>
    ${rssItems}
  </channel>
</rss>`;
}
