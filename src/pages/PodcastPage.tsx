
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Twitter, Linkedin, Copy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { toast } from 'sonner';

const fetchPodcast = async (id: string) => {
  const { data, error } = await supabase
    .from('podcasts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const PodcastPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: podcast, isLoading, error } = useQuery({
    queryKey: ['podcast', id],
    queryFn: () => fetchPodcast(id!),
    enabled: !!id,
  });

  const shareUrl = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground mt-4">Loading Podcast...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-destructive">Error loading podcast: {error.message}</p>
        <Link to="/create">
          <Button variant="link" className="mt-4">Go back to creation</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="absolute top-8 left-8">
        <Link to="/">
          <Logo />
        </Link>
      </div>
      <div className="w-full max-w-3xl mx-auto mt-24">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{podcast.title}</CardTitle>
            <CardDescription>{podcast.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {podcast.audio_url && (
              <div className="my-4">
                <audio controls className="w-full">
                  <source src={podcast.audio_url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
            <div className="mt-6 space-y-4">
              <h3 className="font-semibold text-lg">Transcript</h3>
              <div className="prose prose-sm max-w-none text-muted-foreground bg-muted p-4 rounded-md max-h-96 overflow-y-auto">
                <p>{podcast.transcript}</p>
              </div>
            </div>
            <div className="mt-8">
              <h3 className="font-semibold text-lg mb-4">Share this Podcast</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(podcast.title)}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline"><Twitter className="mr-2 h-4 w-4" /> Twitter</Button>
                </a>
                <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(podcast.title)}&summary=${encodeURIComponent(podcast.description || '')}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline"><Linkedin className="mr-2 h-4 w-4" /> LinkedIn</Button>
                </a>
                <Button variant="outline" onClick={handleCopy}><Copy className="mr-2 h-4 w-4" /> Copy Link</Button>
              </div>
            </div>
          </CardContent>
        </Card>
         <div className="text-center mt-6">
            <Link to="/create">
                <Button>Create another podcast</Button>
            </Link>
        </div>
      </div>
    </div>
  );
};

export default PodcastPage;
