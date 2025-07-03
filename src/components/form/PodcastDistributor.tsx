import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Podcast, Rss, Music, Headphones } from 'lucide-react';

interface PodcastDistributorProps {
  audioUrl: string;
  transcript: string;
  title: string;
}

export const PodcastDistributor: React.FC<PodcastDistributorProps> = ({ 
  audioUrl, 
  transcript, 
  title 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [podcastDetails, setPodcastDetails] = useState({
    title: title || 'My LinkedIn Podumé',
    description: 'An AI-generated podcast based on my LinkedIn profile and professional experience.',
    category: 'Business',
    author: '',
    email: '',
  });

  const distributors = [
    {
      name: 'Apple Podcasts',
      icon: <Podcast className="w-5 h-5" />,
      description: 'Submit to Apple Podcasts Connect',
      url: 'https://podcastsconnect.apple.com/',
      color: 'bg-gray-100 hover:bg-gray-200'
    },
    {
      name: 'Spotify',
      icon: <Music className="w-5 h-5" />,
      description: 'Submit via Spotify for Podcasters',
      url: 'https://podcasters.spotify.com/',
      color: 'bg-green-100 hover:bg-green-200'
    },
    {
      name: 'Anchor',
      icon: <Headphones className="w-5 h-5" />,
      description: 'Upload to Anchor for auto-distribution',
      url: 'https://anchor.fm/',
      color: 'bg-orange-100 hover:bg-orange-200'
    },
    {
      name: 'RSS Feed',
      icon: <Rss className="w-5 h-5" />,
      description: 'Generate RSS feed for distribution',
      url: '#',
      color: 'bg-orange-100 hover:bg-orange-200'
    }
  ];

  const generateRSSFeed = () => {
    const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>${podcastDetails.title}</title>
    <description>${podcastDetails.description}</description>
    <language>en-us</language>
    <itunes:category text="${podcastDetails.category}" />
    <itunes:author>${podcastDetails.author}</itunes:author>
    <itunes:owner>
      <itunes:email>${podcastDetails.email}</itunes:email>
      <itunes:name>${podcastDetails.author}</itunes:name>
    </itunes:owner>
    <item>
      <title>${podcastDetails.title}</title>
      <description>${podcastDetails.description}</description>
      <enclosure url="${audioUrl}" type="audio/mpeg" />
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>
  </channel>
</rss>`;

    const blob = new Blob([rssContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'podcast-feed.xml';
    link.click();
    toast.success('RSS feed downloaded!');
  };

  const handleDistribution = (distributor: typeof distributors[0]) => {
    if (distributor.name === 'RSS Feed') {
      generateRSSFeed();
      return;
    }
    
    window.open(distributor.url, '_blank');
    toast.info(`Opening ${distributor.name} submission page...`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>📡 Distribute Your Podcast</CardTitle>
          <p className="text-sm text-muted-foreground">
            Share your podcast on major platforms and generate distribution files
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Podcast Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Podcast Title</Label>
              <Input
                id="title"
                value={podcastDetails.title}
                onChange={(e) => setPodcastDetails(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter podcast title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author Name</Label>
              <Input
                id="author"
                value={podcastDetails.author}
                onChange={(e) => setPodcastDetails(prev => ({ ...prev, author: e.target.value }))}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                type="email"
                value={podcastDetails.email}
                onChange={(e) => setPodcastDetails(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={podcastDetails.category}
                onChange={(e) => setPodcastDetails(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Business, Technology, etc."
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={podcastDetails.description}
              onChange={(e) => setPodcastDetails(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your podcast..."
              rows={3}
            />
          </div>

          {/* Distribution Platforms */}
          <div className="space-y-4">
            <h4 className="font-medium">Distribution Platforms</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {distributors.map((distributor) => (
                <Card key={distributor.name} className={`cursor-pointer transition-all hover:shadow-lg border-2 ${distributor.color} hover:scale-105`}>
                  <CardContent className="p-6">
                    <div 
                      className="flex items-center justify-between"
                      onClick={() => handleDistribution(distributor)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-full bg-primary text-primary-foreground">
                          {distributor.icon}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-bold text-lg">{distributor.name}</h5>
                          <p className="text-sm text-muted-foreground">{distributor.description}</p>
                        </div>
                      </div>
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        {distributor.name === 'RSS Feed' ? 'Download' : 'Submit'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">📝 Distribution Tips</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Download the RSS feed and use it to submit to podcast directories</li>
              <li>• Each platform has its own submission process and requirements</li>
              <li>• It may take 24-48 hours for your podcast to appear on platforms</li>
              <li>• Make sure your audio file is publicly accessible via a direct URL</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};