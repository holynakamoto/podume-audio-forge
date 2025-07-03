import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface NotebookLMState {
  isProcessing: boolean;
  progress: number;
  currentStep: string;
  audioUrl: string | null;
}

export const useNotebookLMIntegration = () => {
  const [state, setState] = useState<NotebookLMState>({
    isProcessing: false,
    progress: 0,
    currentStep: '',
    audioUrl: null
  });

  const generatePodcastWithNotebookLM = async (
    pdfFile: File,
    googleCredentials?: { email: string; password: string }
  ) => {
    setState(prev => ({ 
      ...prev, 
      isProcessing: true, 
      progress: 10, 
      currentStep: 'Preparing PDF for upload...' 
    }));

    try {
      // Convert PDF to base64
      const arrayBuffer = await pdfFile.arrayBuffer();
      const base64Content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      setState(prev => ({ 
        ...prev, 
        progress: 20, 
        currentStep: 'Launching browser automation...' 
      }));

      console.log('Starting NotebookLM automation process...');
      toast.info('Starting automated NotebookLM process - this may take a few minutes...');

      const { data, error } = await supabase.functions.invoke('notebooklm-automation', {
        body: {
          pdfContent: base64Content,
          fileName: pdfFile.name,
          googleEmail: googleCredentials?.email,
          googlePassword: googleCredentials?.password
        }
      });

      if (error) {
        console.error('NotebookLM automation error:', error);
        throw new Error(error.message || 'Failed to process with NotebookLM');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'NotebookLM automation failed');
      }

      setState(prev => ({ 
        ...prev, 
        progress: 90, 
        currentStep: 'Processing audio...' 
      }));

      // Convert base64 audio to URL
      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;

      setState(prev => ({ 
        ...prev, 
        progress: 100, 
        currentStep: 'Complete!',
        audioUrl,
        isProcessing: false
      }));

      toast.success('Podcast generated successfully with NotebookLM!');
      
      return {
        success: true,
        audioUrl,
        fileName: data.fileName || 'notebooklm-podcast.mp3'
      };

    } catch (error: any) {
      console.error('NotebookLM integration error:', error);
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        progress: 0, 
        currentStep: '' 
      }));

      toast.error(`NotebookLM automation failed: ${error.message}`);
      
      return {
        success: false,
        error: error.message
      };
    }
  };

  const resetState = () => {
    setState({
      isProcessing: false,
      progress: 0,
      currentStep: '',
      audioUrl: null
    });
  };

  return {
    state,
    generatePodcastWithNotebookLM,
    resetState
  };
};