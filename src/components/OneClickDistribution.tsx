import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Rocket, ExternalLink, Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface OneClickDistributionProps {
  podcastId: string;
  audioUrl: string;
  podcastTitle: string;
}

interface DistributionResult {
  platform: string;
  status: 'pending' | 'opened' | 'completed';
  url: string;
  message: string;
}

export const OneClickDistribution: React.FC<OneClickDistributionProps> = ({
  podcastId,
  audioUrl,
  podcastTitle
}) => {
  const [isDistributing, setIsDistributing] = useState(false);
  const [distributionResults, setDistributionResults] = useState<DistributionResult[]>([]);
  const [rssUrl, setRssUrl] = useState('');

  const handleOneClickDistribution = async () => {
    if (!audioUrl) {
      toast.error('Audio must be generated before distribution');
      return;
    }

    setIsDistributing(true);
    
    try {
      // Generate RSS URL directly
      const baseUrl = 'https://pudwgzutzoidxbvozhnk.supabase.co';
      const generatedRssUrl = `${baseUrl}/functions/v1/generate-rss?podcast_id=${podcastId}`;
      setRssUrl(generatedRssUrl);

      // Platform URLs for direct submission
      const platforms = [
        {
          name: 'Spotify for Creators',
          url: 'https://podcasters.spotify.com/',
          description: 'Submit to Spotify for Creators'
        },
        {
          name: 'Apple Podcasts',
          url: 'https://podcastsconnect.apple.com/',
          description: 'Submit to Apple Podcasts'
        }
      ];

      setDistributionResults(platforms.map(platform => ({
        platform: platform.name,
        status: 'pending',
        url: platform.url,
        message: `RSS Feed: ${generatedRssUrl}\n\nPaste this URL when submitting to ${platform.name}`
      })));

      // Show success message
      toast.success('🚀 RSS feed generated! Opening platform submission pages...');

      // Open platform pages with delays
      platforms.forEach((platform, index) => {
        setTimeout(() => {
          window.open(platform.url, '_blank');
          setDistributionResults(prev => 
            prev.map(result => 
              result.platform === platform.name 
                ? { ...result, status: 'opened' }
                : result
            )
          );
        }, index * 1000); // 1 second delay between each
      });

    } catch (error) {
      console.error('Distribution error:', error);
      toast.error('Failed to prepare distribution. Please try again.');
    } finally {
      setIsDistributing(false);
    }
  };

  const copyRssUrl = () => {
    navigator.clipboard.writeText(rssUrl);
    toast.success('RSS feed URL copied to clipboard!');
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-blue-600" />
          One-Click Distribution
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Automatically prepare and distribute your podcast to all major platforms
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* One-click button */}
        <div className="text-center">
          <Button
            onClick={handleOneClickDistribution}
            disabled={isDistributing || !audioUrl}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 text-lg"
            size="lg"
          >
            {isDistributing ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Preparing Distribution...
              </>
            ) : (
              <>
                <Rocket className="mr-2 h-6 w-6" />
                🚀 Distribute to All Platforms
              </>
            )}
          </Button>
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
              <Button onClick={copyRssUrl} variant="outline" size="icon">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Copy this URL and paste it when submitting to each platform
            </p>
          </div>
        )}

        {/* Distribution Results */}
        {distributionResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Distribution Status</h4>
            <div className="space-y-2">
              {distributionResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      result.status === 'completed' ? 'bg-green-500' :
                      result.status === 'opened' ? 'bg-yellow-500' : 'bg-gray-300'
                    }`} />
                    <span className="font-medium">{result.platform}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.status === 'opened' && (
                      <span className="text-sm text-green-600">Page Opened</span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(result.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Click the distribution button above</li>
            <li>Your RSS feed is automatically generated</li>
            <li>Platform submission pages open automatically</li>
            <li>Paste your RSS feed URL on each platform</li>
            <li>Follow their review process (1-7 days)</li>
            <li>Your podcast goes live once approved!</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};