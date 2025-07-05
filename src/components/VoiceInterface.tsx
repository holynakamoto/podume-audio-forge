import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceInterfaceProps {
  onPodcastWorkflowTrigger: () => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ onPodcastWorkflowTrigger }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = (event: any) => {
    console.log('Voice message:', event);
    
    // Handle different event types
    if (event.type === 'response.audio.delta') {
      setIsSpeaking(true);
    } else if (event.type === 'response.audio.done') {
      setIsSpeaking(false);
    } else if (event.type === 'input_audio_buffer.speech_started') {
      setIsListening(true);
    } else if (event.type === 'input_audio_buffer.speech_stopped') {
      setIsListening(false);
    }
  };

  const handleWorkflowTrigger = () => {
    console.log('Voice command triggered podcast workflow');
    toast.success('Voice command received! Starting podcast workflow...');
    onPodcastWorkflowTrigger();
  };

  const startConversation = async () => {
    try {
      console.log('🚀 Starting voice conversation...');
      
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('🎤 Microphone access granted');
      
      chatRef.current = new RealtimeChat(handleMessage, handleWorkflowTrigger);
      console.log('💬 RealtimeChat instance created');
      
      await chatRef.current.init();
      console.log('✅ RealtimeChat initialized successfully');
      
      setIsConnected(true);
      
      toast.success('Voice assistant is ready! Say "Pah-du-may" to start.');
    } catch (error) {
      console.error('❌ Error starting conversation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start voice assistant');
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
    toast.info('Voice assistant disconnected');
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="fixed bottom-8 right-8 flex flex-col items-center gap-4 z-50">
      {/* Status Indicators */}
      {isConnected && (
        <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm border rounded-full px-4 py-2 shadow-lg">
          {isListening && (
            <div className="flex items-center gap-2 text-blue-500">
              <Mic className="w-4 h-4 animate-pulse" />
              <span className="text-sm">Listening...</span>
            </div>
          )}
          {isSpeaking && (
            <div className="flex items-center gap-2 text-green-500">
              <Volume2 className="w-4 h-4 animate-pulse" />
              <span className="text-sm">Speaking...</span>
            </div>
          )}
          {!isListening && !isSpeaking && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mic className="w-4 h-4" />
              <span className="text-sm">Ready</span>
            </div>
          )}
        </div>
      )}

      {/* Main Control Button */}
      {!isConnected ? (
        <Button 
          onClick={startConversation}
          className="rounded-full w-16 h-16 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all"
          size="lg"
        >
          <Mic className="w-6 h-6" />
        </Button>
      ) : (
        <Button 
          onClick={endConversation}
          variant="outline"
          className="rounded-full w-16 h-16 shadow-lg hover:shadow-xl transition-all"
          size="lg"
        >
          <MicOff className="w-6 h-6" />
        </Button>
      )}

      {/* Help Text */}
      {isConnected && (
        <div className="bg-background/80 backdrop-blur-sm border rounded-lg p-3 shadow-lg max-w-xs text-center">
          <p className="text-sm text-muted-foreground">
            Say: <span className="font-medium text-foreground">"Pah-du-may"</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceInterface;