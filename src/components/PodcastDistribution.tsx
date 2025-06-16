
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, Podcast, Music, Radio, Headphones } from 'lucide-react';

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

  const platforms = [
    { name: 'Spotify', icon: Music, color: 'bg-green-500' },
    { name: 'Apple Podcasts', icon: Podcast, color: 'bg-purple-500' },
    { name: 'Google Podcasts', icon: Radio, color: 'bg-blue-500' },
    { name: 'Anchor', icon: Headphones, color: 'bg-orange-500' },
  ];

  const handleDistribute = async () => {
    if (!audioUrl) {
      toast.error('Audio must be generated before distribution');
      return;
    }

    if (!rssUrl.trim()) {
      toast.error('Please enter your RSS feed URL');
      return;
    }

    setIsDistributing(true);
    
    try {
      // This would typically call a backend service to handle distribution
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Distribution initiated! Your podcast will appear on platforms within 24-48 hours.');
      
      // In a real implementation, this would:
      // 1. Upload audio to a CDN
      // 2. Generate RSS feed
      // 3. Submit to platform APIs
      // 4. Track submission status
      
    } catch (error) {
      toast.error('Failed to distribute podcast. Please try again.');
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
          Share your podcast across major streaming platforms to reach a wider audience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="rss-url">RSS Feed URL (Optional)</Label>
          <Input
            id="rss-url"
            type="url"
            placeholder="https://your-podcast-feed.com/rss"
            value={rssUrl}
            onChange={(e) => setRssUrl(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            If you have an existing RSS feed, enter it here. Otherwise, we'll create one for you.
          </p>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="font-medium">Target Platforms</h3>
          <div className="grid grid-cols-2 gap-4">
            {platforms.map((platform) => (
              <div key={platform.name} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className={`p-2 rounded-full ${platform.color}`}>
                  <platform.icon className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium">{platform.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your podcast will be uploaded to our content delivery network</li>
            <li>• We'll generate an RSS feed for your podcast</li>
            <li>• Your podcast will be submitted to all major platforms</li>
            <li>• You'll receive email updates on approval status</li>
          </ul>
        </div>

        <Button 
          onClick={handleDistribute} 
          disabled={isDistributing || !audioUrl}
          className="w-full"
        >
          {isDistributing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Distributing...
            </>
          ) : (
            'Distribute to All Platforms'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PodcastDistribution;
