
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { linkedInFormSchema, LinkedInFormValues } from './schemas/linkedInFormSchema';
import { LinkedInAlerts } from './LinkedInAlerts';
import { LinkedInTitleInput } from './LinkedInTitleInput';
import { LinkedInUrlInput } from './LinkedInUrlInput';
import { LinkedInSubmitButton } from './LinkedInSubmitButton';

export const LinkedInPodcastForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<LinkedInFormValues>({
    resolver: zodResolver(linkedInFormSchema),
    defaultValues: {
      title: 'My LinkedIn Podumé',
      linkedin_url: 'https://linkedin.com/in/',
      package_type: 'core',
      voice_clone: false,
      premium_assets: false,
    },
  });

  const onSubmit = async (values: LinkedInFormValues) => {
    console.log('=== LinkedIn Form Submission ===');
    console.log('Form values:', values);

    setIsLoading(true);
    toast.info('Creating podcast from LinkedIn profile...');

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      // Allow creation without authentication for now
      const authToken = session?.access_token || 'anonymous';

      console.log('Calling generate-podcast function with LinkedIn URL...');

      const { data, error } = await supabase.functions.invoke('generate-podcast', {
        body: {
          title: values.title,
          linkedin_url: values.linkedin_url,
          package_type: values.package_type,
          voice_clone: values.voice_clone,
          premium_assets: values.premium_assets,
          source_type: 'linkedin_url'
        },
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (error) {
        console.error('Podcast generation error:', error);
        toast.error(`Failed to create podcast: ${error.message}`);
        return;
      }

      console.log('Podcast generation response:', data);

      if (data?.podcast?.id) {
        toast.success('Your LinkedIn podcast has been created!');
        navigate(`/podcast/${data.podcast.id}`);
      } else {
        toast.error('Podcast was created but navigation failed');
      }
    } catch (error: any) {
      console.error('Error creating LinkedIn podcast:', error);
      toast.error(`Failed to create podcast: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-0">
      <div className="text-center mb-8 mt-16 sm:mt-20">
        <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2">
          Create Your LinkedIn Podcast
        </h1>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
          Enter your LinkedIn profile URL and transform it into an engaging audio experience
        </p>
      </div>

      <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardContent className="p-6 sm:p-8">
          <LinkedInAlerts showManualOption={false} />

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <LinkedInTitleInput 
              register={form.register}
              errors={form.formState.errors}
            />

            <LinkedInUrlInput 
              register={form.register}
              errors={form.formState.errors}
            />

            <LinkedInSubmitButton 
              isLoading={isLoading}
              isExtracting={false}
              disabled={!form.watch('linkedin_url') || form.watch('linkedin_url') === 'https://linkedin.com/in/'}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
