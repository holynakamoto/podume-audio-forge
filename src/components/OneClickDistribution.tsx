import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Rss, Podcast, Music, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface OneClickDistributionProps {
  podcastId: string;
  audioUrl: string;
  podcastTitle: string;
}

export const OneClickDistribution: React.FC<OneClickDistributionProps> = ({
  podcastId,
  audioUrl,
  podcastTitle
}) => {
  const [rssUrl, setRssUrl] = useState('');
  const [isGeneratingRSS, setIsGeneratingRSS] = useState(false);

  const generateRSSFeed = async () => {
    setIsGeneratingRSS(true);
    try {
      const baseUrl = 'https://pudwgzutzoidxbvozhnk.supabase.co';
      const generatedRssUrl = `${baseUrl}/functions/v1/generate-rss?podcast_id=${podcastId}`;
      setRssUrl(generatedRssUrl);
      
      await navigator.clipboard.writeText(generatedRssUrl);
      toast.success('📡 RSS feed generated and copied to clipboard!');
    } catch (error) {
      console.error('RSS generation error:', error);
      toast.error('Failed to generate RSS feed');
    } finally {
      setIsGeneratingRSS(false);
    }
  };

  const openApplePodcasts = () => {
    if (!rssUrl) {
      toast.error('Please generate RSS feed first');
      return;
    }
    window.open('https://podcastsconnect.apple.com/', '_blank');
    toast.info('🍎 Opening Apple Podcasts Connect - paste your RSS feed URL');
  };

  const openSpotifyCreators = () => {
    if (!rssUrl) {
      toast.error('Please generate RSS feed first');
      return;
    }
    window.open('https://podcasters.spotify.com/', '_blank');
    toast.info('🎵 Opening Spotify for Creators - paste your RSS feed URL');
  };


  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rss className="h-5 w-5 text-orange-600" />
          Podcast Distribution
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate your RSS feed and submit to podcast platforms
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Individual Distribution Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* RSS Generation Button */}
          <div className="text-center">
            <Button
              onClick={generateRSSFeed}
              disabled={isGeneratingRSS || !audioUrl}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 text-lg mb-2"
              size="lg"
            >
              {isGeneratingRSS ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating RSS...
                </>
              ) : (
                <>
                  <Rss className="mr-2 h-5 w-5" />
                  Generate RSS Feed
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">Step 1: Generate your RSS feed</p>
          </div>

          {/* Apple Podcasts Button */}
          <div className="text-center">
            <Button
              onClick={openApplePodcasts}
              disabled={!rssUrl}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 text-lg mb-2"
              size="lg"
            >
              <Podcast className="mr-2 h-5 w-5" />
              Submit to Apple
            </Button>
            <p className="text-xs text-muted-foreground">Step 2: Submit to Apple Podcasts</p>
          </div>

          {/* Spotify Button */}
          <div className="text-center">
            <Button
              onClick={openSpotifyCreators}
              disabled={!rssUrl}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 text-lg mb-2"
              size="lg"
            >
              <Music className="mr-2 h-5 w-5" />
              Submit to Spotify
            </Button>
            <p className="text-xs text-muted-foreground">Step 3: Submit to Spotify for Creators</p>
          </div>
        </div>

        {/* RSS URL Display */}
        {rssUrl && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Podcast RSS Feed</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={rssUrl}
                readOnly
                className="flex-1 px-3 py-2 border rounded-md bg-muted font-mono text-sm"
              />
              <Button 
                onClick={() => {
                  navigator.clipboard.writeText(rssUrl);
                  toast.success('RSS URL copied!');
                }} 
                variant="outline" 
                size="icon"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use this RSS URL when submitting to each platform
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">How to distribute:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Generate your RSS feed first</li>
            <li>Submit to Apple Podcasts Connect</li>
            <li>Submit to Spotify for Creators</li>
            <li>Paste your RSS feed URL on each platform</li>
            <li>Wait for approval (usually 1-7 days)</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};