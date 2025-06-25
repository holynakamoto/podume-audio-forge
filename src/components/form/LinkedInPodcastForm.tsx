
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/ClerkAuthProvider';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { linkedInFormSchema, LinkedInFormValues } from './schemas/linkedInFormSchema';
import { LinkedInAlerts } from './LinkedInAlerts';
import { LinkedInTitleInput } from './LinkedInTitleInput';
import { LinkedInUrlInput } from './LinkedInUrlInput';
import { PackageTypeSelector } from './PackageTypeSelector';
import { LinkedInSubmitButton } from './LinkedInSubmitButton';

export const LinkedInPodcastForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [showManualOption, setShowManualOption] = useState(false);
  const navigate = useNavigate();
  const { user, isSignedIn } = useAuth();

  const form = useForm<LinkedInFormValues>({
    resolver: zodResolver(linkedInFormSchema),
    defaultValues: {
      title: 'My Podumé',
      linkedin_url: '',
      package_type: 'core',
      voice_clone: false,
      premium_assets: false,
    },
  });

  const onSubmit = async (values: LinkedInFormValues) => {
    if (!isSignedIn || !user) {
      toast.error('You must be signed in to create a podcast');
      navigate('/auth');
      return;
    }

    setIsLoading(true);
    setIsExtracting(true);
    toast.info('Extracting resume content and generating podcast...');

    try {
      // Extract content from the provided URL
      const extractResult = await FirecrawlService.scrapeUrl(values.linkedin_url);
      
      if (!extractResult.success || !extractResult.data) {
        // Show manual option if extraction fails
        setShowManualOption(true);
        toast.error(extractResult.error || 'Failed to extract resume content');
        return;
      }

      setIsExtracting(false);
      toast.info('Resume extracted! Now generating podcast...');

      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast.error('Please sign in again to create a podcast');
        navigate('/auth');
        return;
      }

      // Generate podcast with extracted resume content
      const { data, error } = await supabase.functions.invoke('generate-podcast', {
        body: {
          title: values.title,
          resume_content: extractResult.data,
          package_type: values.package_type,
          voice_clone: values.voice_clone,
          premium_assets: values.premium_assets,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Podcast generation error:', error);
        toast.error(`Failed to create podcast: ${error.message}`);
        return;
      }

      toast.success('Your resume podcast has been created!');
      navigate(`/podcast/${data.podcast.id}`);
    } catch (error: any) {
      console.error('Error creating resume podcast:', error);
      toast.error(`Failed to create podcast: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setIsExtracting(false);
    }
  };

  if (!isSignedIn) {
    return (
      <Card className="w-full max-w-lg mx-auto shadow-sm border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="text-center pb-4 pt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600">You must be signed in to create a podcast from your resume.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 sm:px-0">
      <div className="text-center mb-8 mt-16 sm:mt-20">
        <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2">
          Create Your Podcast
        </h1>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
          Transform your resume into an engaging audio experience
        </p>
      </div>

      <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardContent className="p-6 sm:p-8">
          <LinkedInAlerts showManualOption={showManualOption} />

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <LinkedInTitleInput 
              register={form.register}
              errors={form.formState.errors}
            />

            <LinkedInUrlInput
              register={form.register}
              errors={form.formState.errors}
            />

            <PackageTypeSelector register={form.register} />

            <LinkedInSubmitButton 
              isLoading={isLoading}
              isExtracting={isExtracting}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
