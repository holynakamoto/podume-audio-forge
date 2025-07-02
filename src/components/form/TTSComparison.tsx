import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Square, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface TTSComparisonProps {
  transcript: string;
}

interface AudioState {
  audio: string | null;
  isLoading: boolean;
  isPlaying: boolean;
  duration?: number;
}

export const TTSComparison: React.FC<TTSComparisonProps> = ({ transcript }) => {
  const [elevenlabs, setElevenlabs] = useState<AudioState>({ audio: null, isLoading: false, isPlaying: false });
  const [deepgram, setDeepgram] = useState<AudioState>({ audio: null, isLoading: false, isPlaying: false });
  const [hume, setHume] = useState<AudioState>({ audio: null, isLoading: false, isPlaying: false });

  // Audio elements refs
  const [audioRefs] = useState({
    elevenlabs: new Audio(),
    deepgram: new Audio(),
    hume: new Audio()
  });

  const generateTTS = async (provider: 'elevenlabs' | 'deepgram' | 'hume') => {
    const setState = provider === 'elevenlabs' ? setElevenlabs : 
                    provider === 'deepgram' ? setDeepgram : setHume;
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      console.log(`Generating ${provider} TTS...`);
      
      // Use first 500 characters for testing
      const testText = transcript.substring(0, 500) + "...";
      
      const { data, error } = await supabase.functions.invoke(`tts-${provider}`, {
        body: { text: testText }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'TTS generation failed');

      const audioUrl = `data:audio/${data.format};base64,${data.audio}`;
      
      setState(prev => ({ ...prev, audio: audioUrl, isLoading: false }));
      toast.success(`${provider} TTS generated successfully!`);
      
    } catch (error: any) {
      console.error(`${provider} TTS error:`, error);
      setState(prev => ({ ...prev, isLoading: false }));
      toast.error(`${provider} TTS failed: ${error.message}`);
    }
  };

  const playAudio = (provider: 'elevenlabs' | 'deepgram' | 'hume') => {
    const audio = audioRefs[provider];
    const state = provider === 'elevenlabs' ? elevenlabs : 
                  provider === 'deepgram' ? deepgram : hume;
    const setState = provider === 'elevenlabs' ? setElevenlabs : 
                     provider === 'deepgram' ? setDeepgram : setHume;

    if (!state.audio) return;

    if (state.isPlaying) {
      audio.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    } else {
      // Pause other audio
      Object.keys(audioRefs).forEach(key => {
        if (key !== provider) {
          audioRefs[key as keyof typeof audioRefs].pause();
        }
      });
      setElevenlabs(prev => ({ ...prev, isPlaying: false }));
      setDeepgram(prev => ({ ...prev, isPlaying: false }));
      setHume(prev => ({ ...prev, isPlaying: false }));

      audio.src = state.audio;
      audio.play();
      setState(prev => ({ ...prev, isPlaying: true }));
      
      audio.onended = () => {
        setState(prev => ({ ...prev, isPlaying: false }));
      };
    }
  };

  const providers = [
    {
      name: 'ElevenLabs',
      key: 'elevenlabs' as const,
      state: elevenlabs,
      description: 'High-quality AI voices with emotional expression',
      color: 'border-purple-200 bg-purple-50'
    },
    {
      name: 'Deepgram Aura2',
      key: 'deepgram' as const,
      state: deepgram,
      description: 'Fast, natural-sounding speech synthesis',
      color: 'border-blue-200 bg-blue-50'
    },
    {
      name: 'Hume AI',
      key: 'hume' as const,
      state: hume,
      description: 'Emotionally intelligent voice generation',
      color: 'border-green-200 bg-green-50'
    }
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>🎧 TTS Provider Comparison</CardTitle>
          <p className="text-sm text-gray-600">
            Test different Text-to-Speech providers with your podcast transcript
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {providers.map(provider => (
              <Card key={provider.key} className={provider.color}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{provider.name}</CardTitle>
                  <p className="text-xs text-gray-600">{provider.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => generateTTS(provider.key)}
                    disabled={provider.state.isLoading}
                    className="w-full"
                    variant="outline"
                  >
                    {provider.state.isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Audio'
                    )}
                  </Button>
                  
                  {provider.state.audio && (
                    <Button
                      onClick={() => playAudio(provider.key)}
                      className="w-full"
                      variant={provider.state.isPlaying ? "destructive" : "default"}
                    >
                      {provider.state.isPlaying ? (
                        <>
                          <Square className="w-4 h-4 mr-2" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Play
                        </>
                      )}
                    </Button>
                  )}
                  
                  {provider.state.audio && (
                    <p className="text-xs text-gray-500">
                      ✅ Audio ready to play
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Testing with first 500 characters:</strong> "{transcript.substring(0, 100)}..."
            </p>
          </div>
          
          <div className="mt-4">
            <Button
              onClick={async () => {
                try {
                  console.log('Testing basic TTS function...');
                  const { data, error } = await supabase.functions.invoke('tts-test', {
                    body: { text: "Hello, this is a test of the TTS system." }
                  });
                  
                  if (error) {
                    console.error('Test error:', error);
                    toast.error(`Test failed: ${error.message}`);
                  } else {
                    console.log('Test success:', data);
                    toast.success('Test TTS function is working!');
                  }
                } catch (err: any) {
                  console.error('Test exception:', err);
                  toast.error(`Test exception: ${err.message}`);
                }
              }}
              variant="outline"
              className="w-full"
            >
              🧪 Test Basic TTS Function
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};