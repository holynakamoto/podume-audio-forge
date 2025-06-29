
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Podcast, ExternalLink, Play } from 'lucide-react';
import { toast } from 'sonner';

interface PodcastEpisode {
  title: string;
  description: string;
  pubDate: string;
  link?: string;
  audioUrl?: string;
}

export const RSSPodcastViewer = () => {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRSSFeed();
  }, []);

  const fetchRSSFeed = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Using a CORS proxy to fetch the RSS feed
      const proxyUrl = 'https://api.allorigins.win/get?url=';
      const rssUrl = 'https://feed.pod.co/podume';
      const response = await fetch(proxyUrl + encodeURIComponent(rssUrl));
      
      if (!response.ok) {
        throw new Error('Failed to fetch RSS feed');
      }
      
      const data = await response.json();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
      
      const items = xmlDoc.querySelectorAll('item');
      const parsedEpisodes: PodcastEpisode[] = [];
      
      items.forEach((item, index) => {
        if (index < 10) { // Limit to 10 episodes
          const title = item.querySelector('title')?.textContent || 'Untitled Episode';
          const description = item.querySelector('description')?.textContent || '';
          const pubDate = item.querySelector('pubDate')?.textContent || '';
          const link = item.querySelector('link')?.textContent || '';
          const enclosure = item.querySelector('enclosure');
          const audioUrl = enclosure?.getAttribute('url') || '';
          
          parsedEpisodes.push({
            title,
            description: description.substring(0, 200) + (description.length > 200 ? '...' : ''),
            pubDate,
            link,
            audioUrl
          });
        }
      });
      
      setEpisodes(parsedEpisodes);
    } catch (err) {
      console.error('Error fetching RSS feed:', err);
      setError('Failed to load podcast episodes');
      toast.error('Failed to load podcast episodes');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayEpisode = (audioUrl: string, title: string) => {
    if (audioUrl) {
      window.open(audioUrl, '_blank');
    } else {
      toast.error('Audio not available for this episode');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading our latest podcasts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchRSSFeed} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Our Latest Podcasts</h2>
        <p className="text-gray-300">Discover amazing stories and insights from our community</p>
      </div>
      
      {episodes.length === 0 ? (
        <div className="text-center py-8">
          <Podcast className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No episodes found</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {episodes.map((episode, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white text-lg line-clamp-2">
                  {episode.title}
                </CardTitle>
                {episode.pubDate && (
                  <p className="text-gray-300 text-sm">
                    {new Date(episode.pubDate).toLocaleDateString()}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-gray-200 text-sm mb-4 line-clamp-3">
                  {episode.description}
                </p>
                <div className="flex gap-2">
                  {episode.audioUrl && (
                    <Button
                      size="sm"
                      onClick={() => handlePlayEpisode(episode.audioUrl!, episode.title)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Play
                    </Button>
                  )}
                  {episode.link && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(episode.link, '_blank')}
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
