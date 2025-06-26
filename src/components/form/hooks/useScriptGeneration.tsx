
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { LinkedInFormValues } from '../schemas/linkedInFormSchema';

export const useScriptGeneration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<string>('');

  const generateScriptPreview = async (linkedInContent: string, formValues: LinkedInFormValues) => {
    if (!linkedInContent || linkedInContent.length < 10) {
      toast.error('Please import your LinkedIn profile first');
      return;
    }

    setIsLoading(true);
    toast.info('Generating script preview with Claude Sonnet...');

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast.error('Please sign in again');
        return;
      }

      console.log('=== Script Preview Generation ===');
      console.log('Calling generate-podcast function for preview...');

      const { data, error } = await supabase.functions.invoke('generate-podcast', {
        body: {
          title: formValues.title,
          resume_content: linkedInContent,
          package_type: formValues.package_type,
          voice_clone: false,
          premium_assets: false,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Script generation error:', error);
        toast.error(`Failed to generate script: ${error.message}`);
        return;
      }

      console.log('Script generated successfully');
      if (data?.podcast?.transcript) {
        setGeneratedScript(data.podcast.transcript);
        toast.success('Script preview generated with Claude Sonnet!');
      }
    } catch (error: any) {
      console.error('Error generating script preview:', error);
      toast.error(`Failed to generate script: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    generatedScript,
    generateScriptPreview,
    setGeneratedScript
  };
};
