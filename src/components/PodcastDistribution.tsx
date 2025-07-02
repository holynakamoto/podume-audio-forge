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
    { name: 'Google Podcasts', icon: Radio, color: 'bg-blue-500', url: 'https://podcastmanagers.google.com/' },
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

  const handleDistribute = async () => {
    if (!audioUrl) {
      toast.error('Audio must be generated before distribution');
      return;
    }

    setIsDistributing(true);
    
    try {
      // Simulate the distribution process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Distribution initiated! Your RSS feed is ready for platform submission.');
      
    } catch (error) {
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
              <div key={platform.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${platform.color}`}>
                    <platform.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium">{platform.name}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(platform.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Submit
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">How to submit your podcast:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Copy your RSS feed URL above</li>
            <li>Click "Submit" next to each platform</li>
            <li>Paste your RSS feed URL in their submission form</li>
            <li>Follow their review process (usually 1-7 days)</li>
            <li>Your podcast will be live once approved!</li>
          </ol>
        </div>

        <Button 
          onClick={handleDistribute} 
          disabled={isDistributing || !audioUrl}
          className="w-full"
        >
          {isDistributing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Preparing Distribution...
            </>
          ) : (
            'Prepare for Distribution'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PodcastDistribution;
