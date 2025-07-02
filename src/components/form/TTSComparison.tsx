import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Square, Loader2, Share, Download } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface TTSComparisonProps {
  transcript: string;
}

interface VoiceOption {
  provider: 'elevenlabs' | 'deepgram' | 'cartesia' | 'playht';
  voiceId: string;
  name: string;
  description: string;
}

interface AudioState {
  audio: string | null;
  isLoading: boolean;
  isPlaying: boolean;
  duration?: number;
}

export const TTSComparison: React.FC<TTSComparisonProps> = ({ transcript }) => {
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption | null>(null);
  const [audioState, setAudioState] = useState<AudioState>({ audio: null, isLoading: false, isPlaying: false });
  const [audio] = useState(new Audio());

  const voiceOptions: VoiceOption[] = [
    // ElevenLabs voices (premium quality)
    { provider: 'elevenlabs', voiceId: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah (ElevenLabs)', description: 'Professional female voice' },
    { provider: 'elevenlabs', voiceId: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam (ElevenLabs)', description: 'Confident male voice' },
    { provider: 'elevenlabs', voiceId: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte (ElevenLabs)', description: 'Warm female voice' },
    { provider: 'elevenlabs', voiceId: 'JBFqnCBsd6RMkjVDRZzb', name: 'George (ElevenLabs)', description: 'Distinguished male voice' },
    
    // Deepgram voices (fast & natural)
    { provider: 'deepgram', voiceId: 'aura-asteria-en', name: 'Asteria (Deepgram)', description: 'Clear female voice' },
    { provider: 'deepgram', voiceId: 'aura-orpheus-en', name: 'Orpheus (Deepgram)', description: 'Smooth male voice' },
    
    // Cartesia voices (conversational)
    { provider: 'cartesia', voiceId: 'barbershop-man', name: 'Barbershop Man (Cartesia)', description: 'Casual male voice' },
    { provider: 'cartesia', voiceId: 'pleasant-female', name: 'Pleasant Female (Cartesia)', description: 'Friendly female voice' },
    
    // PlayHT voices (natural)
    { provider: 'playht', voiceId: 'jennifer', name: 'Jennifer (PlayHT)', description: 'Natural female voice' },
    { provider: 'playht', voiceId: 'mark', name: 'Mark (PlayHT)', description: 'Professional male voice' },
  ];

  const generateTTS = async () => {
    if (!selectedVoice) {
      toast.error('Please select a voice first');
      return;
    }
    
    setAudioState(prev => ({ ...prev, isLoading: true }));
    
    try {
      console.log(`Generating ${selectedVoice.provider} TTS with voice ${selectedVoice.voiceId}...`);
      
      // Use first 1000 characters for testing
      const testText = transcript.substring(0, 1000) + "...";
      
      const requestBody = selectedVoice.provider === 'elevenlabs' 
        ? { text: testText, voice_id: selectedVoice.voiceId }
        : selectedVoice.provider === 'deepgram'
        ? { text: testText, model: selectedVoice.voiceId }
        : selectedVoice.provider === 'cartesia'
        ? { text: testText, voice: selectedVoice.voiceId }
        : { text: testText, voice: selectedVoice.voiceId }; // PlayHT
      
      const { data, error } = await supabase.functions.invoke(`tts-${selectedVoice.provider}`, {
        body: requestBody
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'TTS generation failed');

      const audioUrl = `data:audio/${data.format};base64,${data.audio}`;
      
      setAudioState(prev => ({ ...prev, audio: audioUrl, isLoading: false }));
      toast.success(`${selectedVoice.name} TTS generated successfully!`);
      
    } catch (error: any) {
      console.error(`${selectedVoice.provider} TTS error:`, error);
      setAudioState(prev => ({ ...prev, isLoading: false }));
      toast.error(`${selectedVoice.name} TTS failed: ${error.message}`);
    }
  };

  const playAudio = () => {
    if (!audioState.audio) return;

    if (audioState.isPlaying) {
      audio.pause();
      setAudioState(prev => ({ ...prev, isPlaying: false }));
    } else {
      audio.src = audioState.audio;
      audio.play();
      setAudioState(prev => ({ ...prev, isPlaying: true }));
      
      audio.onended = () => {
        setAudioState(prev => ({ ...prev, isPlaying: false }));
      };
    }
  };

  const shareToSocial = (platform: string) => {
    if (!audioState.audio) {
      toast.error('Generate audio first to share');
      return;
    }
    
    const shareText = `Check out my AI-generated podcast from my LinkedIn profile! 🎧 #PodcastGeneration #AI`;
    const shareUrl = window.location.href;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
        break;
      default:
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
    }
  };

  const downloadAudio = () => {
    if (!audioState.audio) {
      toast.error('Generate audio first to download');
      return;
    }
    
    const link = document.createElement('a');
    link.href = audioState.audio;
    link.download = 'podcast.mp3';
    link.click();
    toast.success('Audio download started!');
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🎧 Generate Podcast Audio</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose a voice and generate high-quality audio from your transcript
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Voice Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Voice</label>
            <Select onValueChange={(value) => {
              const voice = voiceOptions.find(v => `${v.provider}-${v.voiceId}` === value);
              setSelectedVoice(voice || null);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a voice for your podcast..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="elevenlabs-EXAVITQu4vr4xnSDxMaL">Sarah (ElevenLabs) - Professional female</SelectItem>
                <SelectItem value="elevenlabs-TX3LPaxmHKxFdv7VOQHJ">Liam (ElevenLabs) - Confident male</SelectItem>
                <SelectItem value="elevenlabs-XB0fDUnXU5powFXDhCwa">Charlotte (ElevenLabs) - Warm female</SelectItem>
                <SelectItem value="elevenlabs-JBFqnCBsd6RMkjVDRZzb">George (ElevenLabs) - Distinguished male</SelectItem>
                <SelectItem value="deepgram-aura-asteria-en">Asteria (Deepgram) - Clear female</SelectItem>
                <SelectItem value="deepgram-aura-orpheus-en">Orpheus (Deepgram) - Smooth male</SelectItem>
                <SelectItem value="cartesia-barbershop-man">Barbershop Man (Cartesia) - Casual male</SelectItem>
                <SelectItem value="cartesia-pleasant-female">Pleasant Female (Cartesia) - Friendly female</SelectItem>
                <SelectItem value="playht-jennifer">Jennifer (PlayHT) - Natural female</SelectItem>
                <SelectItem value="playht-mark">Mark (PlayHT) - Professional male</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Generate Button */}
          <Button
            onClick={generateTTS}
            disabled={audioState.isLoading || !selectedVoice}
            className="w-full"
            size="lg"
          >
            {audioState.isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Audio...
              </>
            ) : (
              'Generate Podcast Audio'
            )}
          </Button>

          {/* Audio Player */}
          {audioState.audio && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <Button
                  onClick={playAudio}
                  size="lg"
                  className="rounded-full w-12 h-12"
                >
                  {audioState.isPlaying ? <Square className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
                <div className="flex-1">
                  <p className="font-medium">Your LinkedIn Podcast</p>
                  <p className="text-sm text-muted-foreground">
                    Generated with {selectedVoice?.name}
                  </p>
                </div>
                <Button onClick={downloadAudio} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>

              {/* Social Sharing */}
              <div className="space-y-3">
                <h4 className="font-medium">Share Your Podcast</h4>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    onClick={() => shareToSocial('twitter')} 
                    variant="outline" 
                    size="sm"
                    className="bg-blue-50 hover:bg-blue-100"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Twitter
                  </Button>
                  <Button 
                    onClick={() => shareToSocial('linkedin')} 
                    variant="outline" 
                    size="sm"
                    className="bg-blue-50 hover:bg-blue-100"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Button>
                  <Button 
                    onClick={() => shareToSocial('facebook')} 
                    variant="outline" 
                    size="sm"
                    className="bg-blue-50 hover:bg-blue-100"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Facebook
                  </Button>
                  <Button 
                    onClick={() => shareToSocial('copy')} 
                    variant="outline" 
                    size="sm"
                  >
                    Copy Link
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-4 p-3 bg-muted rounded">
            <p className="text-sm text-muted-foreground">
              <strong>Preview:</strong> "{transcript.substring(0, 150)}..."
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};