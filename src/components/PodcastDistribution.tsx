import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Rss, Podcast, Music, Copy, ExternalLink } from 'lucide-react';

interface PodcastDistributionProps {
  podcastId: string;
  podcastTitle: string;
  audioUrl?: string;
}

const PodcastDistribution: React.FC<PodcastDistributionProps> = ({ 
  podcastId, 
  podcastTitle, 
  audioUrl 
}) => {
  const [isDistributing, setIsDistributing] = useState(false);
  const [rssUrl, setRssUrl] = useState('');
  const [generatedRssUrl, setGeneratedRssUrl] = useState('');

  const platforms = [
    { name: 'Spotify for Creators', icon: Music, color: 'bg-green-500', url: 'https://podcasters.spotify.com/' },
    { name: 'Apple Podcasts', icon: Podcast, color: 'bg-purple-500', url: 'https://podcastsconnect.apple.com/' },
  ];

  useEffect(() => {
    if (podcastId) {
      const baseUrl = 'https://pudwgzutzoidxbvozhnk.supabase.co/functions/v1/generate-rss';
      const url = `${baseUrl}?podcast_id=${podcastId}`;
      setGeneratedRssUrl(url);
    }
  }, [podcastId]);

  const handleCopyRssUrl = () => {
    navigator.clipboard.writeText(generatedRssUrl);
    toast.success('RSS feed URL copied to clipboard!');
  };

  const handleAutoDistribute = async () => {
    if (!audioUrl) {
      toast.error('Audio must be generated before distribution');
      return;
    }

    setIsDistributing(true);
    
    try {
      // Generate RSS URL directly without edge function
      const baseUrl = 'https://pudwgzutzoidxbvozhnk.supabase.co';
      const rssUrl = `${baseUrl}/functions/v1/generate-rss?podcast_id=${podcastId}`;
      
      // Copy RSS URL to clipboard
      await navigator.clipboard.writeText(rssUrl);
      
      toast.success('🚀 RSS feed URL copied to clipboard! Opening platform submission pages...');
      
      // Open platform submission pages
      platforms.forEach((platform, index) => {
        setTimeout(() => {
          window.open(platform.url, '_blank');
        }, index * 800); // 800ms delay between each
      });
      
    } catch (error) {
      console.error('Distribution error:', error);
      toast.error('Failed to prepare distribution. Please try again.');
    } finally {
      setIsDistributing(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rss className="h-5 w-5" />
          Distribute to Streaming Platforms
        </CardTitle>
        <CardDescription>
          Share your podcast across major streaming platforms using your RSS feed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generated RSS Feed */}
        <div className="space-y-3">
          <Label htmlFor="generated-rss">Your Podcast RSS Feed</Label>
          <div className="flex gap-2">
            <Input
              id="generated-rss"
              type="url"
              value={generatedRssUrl}
              readOnly
              className="font-mono text-sm"
            />
            <Button 
              onClick={handleCopyRssUrl}
              variant="outline"
              size="icon"
              disabled={!generatedRssUrl}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            This is your podcast's RSS feed URL. Use this when submitting to podcast platforms.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="custom-rss-url">Custom RSS Feed URL (Optional)</Label>
          <Input
            id="custom-rss-url"
            type="url"
            placeholder="https://your-custom-feed.com/rss"
            value={rssUrl}
            onChange={(e) => setRssUrl(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            If you prefer to use a custom RSS feed, enter it here.
          </p>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="font-medium">Submit to Platforms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {platforms.map((platform) => (
              <div key={platform.name} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${platform.color}`}>
                    <platform.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-semibold text-lg">{platform.name}</span>
                </div>
                <Button
                  size="lg"
                  onClick={() => window.open(platform.url, '_blank')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 font-semibold"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Submit Now
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Individual Distribution Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* RSS Generation Button */}
          <div className="text-center">
            <Button
              onClick={() => {
                const baseUrl = 'https://pudwgzutzoidxbvozhnk.supabase.co';
                const rssUrl = `${baseUrl}/functions/v1/generate-rss?podcast_id=${podcastId}`;
                navigator.clipboard.writeText(rssUrl);
                toast.success('📡 RSS feed URL copied to clipboard!');
              }}
              disabled={!audioUrl}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 mb-2"
              size="lg"
            >
              <Rss className="mr-2 h-4 w-4" />
              Generate RSS Feed
            </Button>
            <p className="text-xs text-muted-foreground">Step 1: Copy RSS feed URL</p>
          </div>

          {/* Apple Podcasts Button */}
          <div className="text-center">
            <Button
              onClick={() => {
                window.open('https://podcastsconnect.apple.com/', '_blank');
                toast.info('🍎 Opening Apple Podcasts Connect - paste your RSS feed URL');
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 mb-2"
              size="lg"
            >
              <Podcast className="mr-2 h-4 w-4" />
              Submit to Apple
            </Button>
            <p className="text-xs text-muted-foreground">Step 2: Submit to Apple Podcasts</p>
          </div>

          {/* Spotify Button */}
          <div className="text-center">
            <Button
              onClick={() => {
                window.open('https://podcasters.spotify.com/', '_blank');
                toast.info('🎵 Opening Spotify for Creators - paste your RSS feed URL');
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 mb-2"
              size="lg"
            >
              <Music className="mr-2 h-4 w-4" />
              Submit to Spotify
            </Button>
            <p className="text-xs text-muted-foreground">Step 3: Submit to Spotify for Creators</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PodcastDistribution;
