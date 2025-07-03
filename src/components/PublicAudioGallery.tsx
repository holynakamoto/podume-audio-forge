import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Download, Share2, Calendar, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface PublicAudioFile {
  id: string;
  file_name: string;
  supabase_url: string;
  uploaded_at: string;
  metadata: any;
}

export const PublicAudioGallery: React.FC = () => {
  const [playingAudio, setPlayingAudio] = React.useState<string | null>(null);
  const [audio] = React.useState(new Audio());

  // Fetch published audio files
  const { data: audioFiles, isLoading } = useQuery({
    queryKey: ['public-audio-files'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audio_files')
        .select('*')
        .eq('is_published', true)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      return data as PublicAudioFile[];
    },
  });

  // Audio event handlers
  React.useEffect(() => {
    audio.onended = () => setPlayingAudio(null);
    audio.onpause = () => setPlayingAudio(null);
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audio]);

  const toggleAudioPlayback = (audioFile: PublicAudioFile) => {
    if (!audioFile.supabase_url) {
      toast.error('Audio file not available');
      return;
    }

    if (playingAudio === audioFile.id) {
      audio.pause();
      setPlayingAudio(null);
    } else {
      audio.src = audioFile.supabase_url;
      audio.play();
      setPlayingAudio(audioFile.id);
    }
  };

  const downloadAudio = (audioFile: PublicAudioFile) => {
    if (!audioFile.supabase_url) {
      toast.error('Audio file not available');
      return;
    }

    const link = document.createElement('a');
    link.href = audioFile.supabase_url;
    link.download = audioFile.file_name;
    link.click();
    toast.success('Audio download started');
  };

  const shareAudio = async (audioFile: PublicAudioFile) => {
    const shareData = {
      title: `Listen to ${audioFile.file_name}`,
      text: 'Check out this AI-generated podcast created with NotebookLM!',
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } catch (error) {
        // Fallback to copying URL
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } else {
      // Fallback to copying URL
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-muted rounded w-64 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">AI-Generated Podcasts</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover fascinating audio content created with Google NotebookLM. 
          From research papers to articles, transformed into engaging podcast-style conversations.
        </p>
      </div>

      {!audioFiles || audioFiles.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎧</div>
          <h3 className="text-xl font-semibold mb-2">No podcasts available yet</h3>
          <p className="text-muted-foreground">
            Check back soon for AI-generated audio content!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {audioFiles.map((audioFile) => (
            <Card key={audioFile.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg leading-tight">
                  {audioFile.file_name.replace(/\.(mp3|wav|m4a)$/i, '')}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(audioFile.uploaded_at).toLocaleDateString()}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Audio Player Controls */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => toggleAudioPlayback(audioFile)}
                    size="lg"
                    className="rounded-full w-12 h-12 flex-shrink-0"
                  >
                    {playingAudio === audioFile.id ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>
                  
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-primary transition-all duration-300 ${
                          playingAudio === audioFile.id ? 'animate-pulse' : ''
                        }`}
                        style={{ 
                          width: playingAudio === audioFile.id ? '40%' : '0%' 
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {playingAudio === audioFile.id ? 'Playing...' : 'Click to play'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => downloadAudio(audioFile)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    onClick={() => shareAudio(audioFile)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>

                {/* Metadata */}
                {audioFile.metadata && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    {audioFile.metadata.file_size && (
                      <div>
                        Size: {(audioFile.metadata.file_size / 1024 / 1024).toFixed(1)} MB
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="text-center mt-12 pt-8 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Audio content generated using{' '}
          <a 
            href="https://notebooklm.google.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Google NotebookLM
          </a>
          {' '}and published via Lovable
        </p>
      </div>
    </div>
  );
};