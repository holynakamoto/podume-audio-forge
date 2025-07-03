import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, Podcast, Music, Radio, Headphones, Copy, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
    { name: 'Spotify', icon: Music, color: 'bg-green-500', url: 'https://podcasters.spotify.com/' },
    { name: 'Apple Podcasts', icon: Podcast, color: 'bg-purple-500', url: 'https://podcastsconnect.apple.com/' },
    { name: 'Anchor', icon: Headphones, color: 'bg-orange-500', url: 'https://anchor.fm/' },
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
      const { data, error } = await supabase.functions.invoke('auto-distribute', {
        body: {
          podcastId,
          platforms: platforms.map(p => p.name.toLowerCase()),
          userEmail: '',
          authorName: 'AI Podcast Generator'
        }
      });

      if (error) throw error;

      toast.success('🚀 One-click distribution prepared! Your RSS feed is ready and platform links are opened.');
      
      // Open platform submission pages
      platforms.forEach(platform => {
        setTimeout(() => {
          window.open(platform.url, '_blank');
        }, 500);
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
          <Radio className="h-5 w-5" />
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

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
          <h4 className="font-bold text-blue-900 mb-3 text-lg">🚀 One-Click Distribution</h4>
          <p className="text-blue-800 text-sm mb-4">
            Your RSS feed will be automatically generated and platform submission pages will open. 
            Simply paste your RSS feed URL on each platform.
          </p>
          <Button 
            onClick={handleAutoDistribute} 
            disabled={isDistributing || !audioUrl}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 text-lg"
            size="lg"
          >
            {isDistributing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Preparing Distribution...
              </>
            ) : (
              '🚀 Distribute to All Platforms'
            )}
          </Button>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="font-medium">Manual Platform Submission</h3>
          <p className="text-sm text-muted-foreground">
            Or submit to platforms individually using your RSS feed URL above.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PodcastDistribution;
