import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { VoiceOption, AudioState } from '../types/tts';

export const useTTSGeneration = () => {
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption | null>(null);
  const [audioState, setAudioState] = useState<AudioState>({ 
    audio: null, 
    isLoading: false, 
    isPlaying: false 
  });
  const [audio] = useState(new Audio());

  const generateTTS = async (transcript: string, voice1 = 'nova', voice2 = 'alloy') => {
    setAudioState(prev => ({ ...prev, isLoading: true }));
    
    try {
      console.log('Generating dual-voice TTS with voices:', voice1, voice2);
      toast.info('Creating exciting two-host podcast audio...');

      const { data, error } = await supabase.functions.invoke('generate-dual-voice-podcast', {
        body: { transcript, voice1, voice2 }
      });

      if (error) {
        console.error('Dual-voice TTS error:', error);
        throw new Error(error.message || 'Failed to generate dual-voice audio');
      }

      if (!data?.audioContent) {
        throw new Error('No audio content returned from dual-voice service');
      }

      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      
      setAudioState(prev => ({ ...prev, audio: audioUrl, isLoading: false }));
      toast.success(`Dual-voice podcast with ${data.segments} segments generated successfully!`);
      
    } catch (error: any) {
      console.error('Dual-voice TTS error:', error);
      setAudioState(prev => ({ ...prev, isLoading: false }));
      toast.error(`Dual-voice TTS failed: ${error.message}`);
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

  return {
    selectedVoice,
    setSelectedVoice,
    audioState,
    generateTTS,
    playAudio,
    downloadAudio
  };
};