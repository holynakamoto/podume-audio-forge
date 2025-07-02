import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LinkedInFormValues } from '../schemas/linkedInFormSchema';

export const usePodcastGeneration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTranscript, setGeneratedTranscript] = useState('');
  const navigate = useNavigate();

  const generatePodcast = async (values: LinkedInFormValues, resumeContent?: string) => {
    console.log('=== LinkedIn Auto-Submit Started ===');
    
    if (isLoading) return;
    setIsLoading(true);
    toast.info('Creating podcast from LinkedIn profile...');

    try {
      const session = await supabase.auth.getSession();
      
      const requestPayload = {
        title: values.title.trim(),
        linkedin_url: values.linkedin_url.trim(),
        package_type: values.package_type || 'core',
        voice_clone: values.voice_clone || false,
        premium_assets: values.premium_assets || false,
        source_type: 'linkedin_oidc',
        resume_content: resumeContent || ''
      };

      const { data, error } = await supabase.functions.invoke('generate-podcast', {
        body: requestPayload,
        headers: {
          'Content-Type': 'application/json',
          ...(session.data.session?.access_token && {
            'Authorization': `Bearer ${session.data.session.access_token}`
          })
        },
      });

      console.log('=== Podcast Generation Response ===');
      console.log('Error:', error);
      console.log('Data:', data);
      console.log('Data transcript:', data?.transcript);
      console.log('Data podcast transcript:', data?.podcast?.transcript);

      if (error) throw new Error(error.message);
      if (!data) throw new Error('No response data received');

      // Store the generated transcript for display
      if (data?.transcript) {
        console.log('Setting transcript from data.transcript:', data.transcript);
        setGeneratedTranscript(data.transcript);
        toast.success('Transcript generated! Check below.');
      } else if (data?.podcast?.transcript) {
        console.log('Setting transcript from data.podcast.transcript:', data.podcast.transcript);
        setGeneratedTranscript(data.podcast.transcript);
        toast.success('Transcript generated! Check below.');
      } else {
        console.log('No transcript found in response');
        toast.warning('Podcast created but no transcript found');
      }

      if (data?.podcast?.id) {
        toast.success('Your LinkedIn podcast has been created!');
        navigate(`/podcast/${data.podcast.id}`);
      } else {
        toast.error('Podcast creation response was unexpected');
      }
    } catch (error: any) {
      console.log('=== Podcast Generation Error ===');
      console.log('Full error object:', error);
      console.log('Error message:', error?.message);
      console.log('Error details:', error?.details);
      toast.error(`Failed to create podcast: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    generatedTranscript,
    generatePodcast,
    setGeneratedTranscript
  };
};