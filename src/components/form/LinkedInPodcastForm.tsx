
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/ClerkAuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { linkedInFormSchema, LinkedInFormValues } from './schemas/linkedInFormSchema';
import { LinkedInAlerts } from './LinkedInAlerts';
import { LinkedInTitleInput } from './LinkedInTitleInput';
import { PackageTypeSelector } from './PackageTypeSelector';
import { LinkedInSubmitButton } from './LinkedInSubmitButton';
import { LinkedInProfileSection } from './LinkedInProfileSection';
import { LinkedInDebugInfo } from './LinkedInDebugInfo';
import { useLinkedInOAuth } from './hooks/useLinkedInOAuth';
import { useScriptGeneration } from './hooks/useScriptGeneration';

export const LinkedInPodcastForm: React.FC = () => {
  const [linkedInContent, setLinkedInContent] = useState<string>('');
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const navigate = useNavigate();
  const { user, isSignedIn } = useAuth();

  const form = useForm<LinkedInFormValues>({
    resolver: zodResolver(linkedInFormSchema),
    defaultValues: {
      title: 'My Podumé',
      package_type: 'core',
      voice_clone: false,
      premium_assets: false,
    },
  });

  const { isProcessingProfile } = useLinkedInOAuth(setLinkedInContent);
  const { 
    isLoading: isScriptLoading, 
    generatedScript, 
    generateScriptPreview,
    setGeneratedScript 
  } = useScriptGeneration();

  const handleGeneratePreview = () => {
    generateScriptPreview(linkedInContent, form.getValues());
  };

  const handleClearProfile = () => {
    setLinkedInContent('');
    setGeneratedScript('');
  };

  const onSubmit = async (values: LinkedInFormValues) => {
    console.log('=== Form Submission Debug ===');
    console.log('Form values:', values);
    console.log('LinkedIn content length:', linkedInContent.length);
    console.log('User signed in:', isSignedIn);

    if (!isSignedIn || !user) {
      toast.error('You must be signed in to create a podcast');
      navigate('/auth');
      return;
    }

    const resumeContent = linkedInContent || '';
    
    if (!resumeContent || resumeContent.length < 10) {
      toast.error('Please import your LinkedIn profile first');
      return;
    }

    const [isSubmitting, setIsSubmitting] = useState(false);
    setIsSubmitting(true);
    toast.info('Generating podcast from LinkedIn profile...');

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast.error('Please sign in again to create a podcast');
        navigate('/auth');
        return;
      }

      console.log('=== Podcast Generation Debug ===');
      console.log('Calling generate-podcast function...');
      console.log('Resume content length:', resumeContent.length);
      console.log('Will use Claude Sonnet for script generation');

      const { data, error } = await supabase.functions.invoke('generate-podcast', {
        body: {
          title: values.title,
          resume_content: resumeContent,
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
      setIsSubmitting(false);
    }
  };

  if (!isSignedIn) {
    return (
      <Card className="w-full max-w-lg mx-auto shadow-sm border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="text-center pb-4 pt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600">You must be signed in to create a podcast from LinkedIn.</p>
        </CardContent>
      </Card>
    );
  }

  const isLoading = isScriptLoading;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-0">
      <div className="text-center mb-8 mt-16 sm:mt-20">
        <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2">
          Create Your Podcast
        </h1>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
          Import your LinkedIn profile and transform it into an engaging audio experience
        </p>
      </div>

      <LinkedInDebugInfo 
        linkedInContent={linkedInContent}
        generatedScript={generatedScript}
        showDebugInfo={showDebugInfo}
        onToggleDebug={() => setShowDebugInfo(!showDebugInfo)}
      />

      <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardContent className="p-6 sm:p-8">
          <LinkedInAlerts showManualOption={false} />

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <LinkedInTitleInput 
              register={form.register}
              errors={form.formState.errors}
            />

            <LinkedInProfileSection 
              linkedInContent={linkedInContent}
              isProcessingProfile={isProcessingProfile}
              isScriptLoading={isScriptLoading}
              onProfileData={setLinkedInContent}
              onClearProfile={handleClearProfile}
              onGeneratePreview={handleGeneratePreview}
            />

            <PackageTypeSelector register={form.register} />

            <LinkedInSubmitButton 
              isLoading={isLoading}
              isExtracting={isProcessingProfile}
              disabled={!linkedInContent}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
