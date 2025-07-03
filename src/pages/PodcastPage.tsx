
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Twitter, Linkedin, Copy, Play, Pause } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import PodcastDistribution from '@/components/PodcastDistribution';
import { PodcastSharingControls } from '@/components/PodcastSharingControls';
import { toast } from 'sonner';
import { sanitizeHtml, sanitizeText } from '@/utils/security';

const fetchPodcast = async (id: string) => {
  const { data, error } = await supabase
    .from('podcasts')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  
  if (!data) {
    throw new Error('Podcast not found');
  }
  
  return data;
};

const PodcastPage = () => {
  const { id } = useParams<{ id: string }>();
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isPublic, setIsPublic] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const { data: podcast, isLoading, error, refetch } = useQuery({
    queryKey: ['podcast', id],
    queryFn: () => fetchPodcast(id!),
    enabled: !!id,
  });

  const shareUrl = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSharingChange = (newIsPublic: boolean) => {
    setIsPublic(newIsPublic);
    refetch(); // Refresh podcast data
  };

  React.useEffect(() => {
    if (podcast) {
      console.log('=== PODCAST DEBUG INFO ===');
      console.log('Podcast ID:', podcast.id);
      console.log('Podcast status:', podcast.status);
      console.log('Audio URL:', podcast.audio_url);
      console.log('Transcript exists:', !!podcast.transcript);
      console.log('Transcript length:', podcast.transcript?.length || 0);
      console.log('Transcript preview:', podcast.transcript?.substring(0, 200) + '...');
      console.log('Raw transcript:', podcast.transcript);
      console.log('========================');
      setIsPublic(podcast.is_public || false);
    }
  }, [podcast]);

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

  // Sanitize content for security
  const sanitizedTitle = sanitizeText(podcast.title);
  const sanitizedDescription = podcast.description ? sanitizeText(podcast.description) : 'Your professional podcast generated from your resume';
  const sanitizedTranscript = podcast.transcript ? sanitizeHtml(podcast.transcript) : '';

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
            <CardTitle className="text-3xl">{sanitizedTitle}</CardTitle>
            <CardDescription>{sanitizedDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            {podcast.audio_url && (
              <div className="my-6">
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <Button
                    onClick={togglePlayback}
                    size="lg"
                    className="rounded-full w-12 h-12"
                  >
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </Button>
                  <div className="flex-1">
                    <p className="font-medium">Your Career Podcast</p>
                    <p className="text-sm text-muted-foreground">Generated from your resume</p>
                  </div>
                </div>
                <audio 
                  ref={audioRef}
                  src={podcast.audio_url}
                  onEnded={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="hidden"
                />
              </div>
            )}
            
            <div className="mt-6 space-y-4">
              <h3 className="font-semibold text-lg">Transcript</h3>
              
              {/* Debug info for transcript */}
              <div className="text-xs text-muted-foreground bg-yellow-50 p-2 rounded border">
                <strong>Debug Info:</strong><br/>
                Status: {podcast.status}<br/>
                Transcript exists: {podcast.transcript ? 'Yes' : 'No'}<br/>
                Transcript length: {podcast.transcript?.length || 0} characters<br/>
                Raw transcript type: {typeof podcast.transcript}
              </div>
              
              <div className="prose prose-sm max-w-none text-muted-foreground bg-muted p-4 rounded-md max-h-96 overflow-y-auto">
                {podcast.transcript && podcast.transcript.trim().length > 0 ? (
                  <div className="whitespace-pre-wrap">
                    {podcast.transcript}
                  </div>
                ) : (
                  <div>
                    <p className="text-muted-foreground italic">
                      {podcast.status === 'processing' ? 
                        'Transcript is being generated... Please refresh the page in a moment.' :
                        'No transcript available. This could be due to an error during generation.'
                      }
                    </p>
                    {podcast.status === 'completed' && (!podcast.transcript || podcast.transcript.trim().length === 0) && (
                      <p className="text-red-500 text-sm mt-2">
                        Warning: Podcast is marked as completed but no transcript was generated. 
                        This might indicate an issue with the Claude API or transcript generation process.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="font-semibold text-lg mb-4">Share this Podcast</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(sanitizedTitle)}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline"><Twitter className="mr-2 h-4 w-4" /> Twitter</Button>
                </a>
                <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(sanitizedTitle)}&summary=${encodeURIComponent(sanitizedDescription)}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline"><Linkedin className="mr-2 h-4 w-4" /> LinkedIn</Button>
                </a>
                <Button variant="outline" onClick={handleCopy}><Copy className="mr-2 h-4 w-4" /> Copy Link</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {podcast.audio_url && (
          <PodcastDistribution 
            podcastId={podcast.id}
            podcastTitle={sanitizedTitle}
            audioUrl={podcast.audio_url}
          />
        )}
        
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
