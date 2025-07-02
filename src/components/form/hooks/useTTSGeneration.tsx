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

  const generateTTS = async (transcript: string) => {
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