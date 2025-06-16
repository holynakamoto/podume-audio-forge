
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ResumeUploader } from './ResumeUploader';
import { PodcastTitleInput } from './PodcastTitleInput';
import { PodcastSettings } from './PodcastSettings';
import { PodcastSubmitButton } from './PodcastSubmitButton';
import { formSchema, FormValues } from './schemas/podcastFormSchema';

interface PodcastCreationFormProps {
  initialResumeContent?: string;
}

export const PodcastCreationForm: React.FC<PodcastCreationFormProps> = ({ 
  initialResumeContent = '' 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [resumeContent, setResumeContent] = useState(initialResumeContent);
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      package_type: 'core',
      voice_clone: false,
      premium_assets: false,
      resume_content: '',
      title: '',
    },
  });

  // Update resume content when initial content changes
  useEffect(() => {
    if (initialResumeContent) {
      setResumeContent(initialResumeContent);
      form.setValue('resume_content', initialResumeContent);
    }
  }, [initialResumeContent, form]);

  // Update form whenever resumeContent changes
  useEffect(() => {
    form.setValue('resume_content', resumeContent);
  }, [resumeContent, form]);

  const onSubmit = async (values: FormValues) => {
    console.log('Form submission started with values:', values);
    console.log('Resume content length:', resumeContent.length);
    console.log('Resume content preview:', resumeContent.substring(0, 100) + '...');
    
    // Ensure we use the current resume content
    const submitData = { 
      ...values, 
      resume_content: resumeContent 
    };
    
    if (submitData.resume_content.length < 5) {
      toast.error('Resume content must be at least 5 characters.');
      return;
    }

    if (submitData.title.length < 3) {
      toast.error('Title must be at least 3 characters.');
      return;
    }

    setIsLoading(true);
    toast.info('Generating your podcast... This may take a moment.');

    try {
      console.log('Calling generate-podcast function with data:', submitData);
      const { data, error } = await supabase.functions.invoke('generate-podcast', {
        body: submitData,
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Podcast generated successfully:', data);
      toast.success('Your podcast has been created!');
      const newPodcastId = data.podcast.id;
      navigate(`/podcast/${newPodcastId}`);
    } catch (error: any) {
      console.error('Error creating podcast:', error);
      toast.error(`Failed to create podcast: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Watch form values for validation
  const titleValue = form.watch('title');
  
  // Use the actual resumeContent state for validation, not just the form value
  const canSubmit = resumeContent.length >= 5 && titleValue && titleValue.length >= 3;

  console.log('Form state:', { 
    resumeContentLength: resumeContent.length, 
    titleLength: titleValue?.length || 0, 
    canSubmit,
    isLoading
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Your Podcast</CardTitle>
        <CardDescription>Fill in the details below to generate your audio resume.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <PodcastTitleInput form={form} />
          
          <ResumeUploader 
            onResumeContentChange={setResumeContent}
            resumeContent={resumeContent}
          />
          {resumeContent.length < 5 && resumeContent.length > 0 && (
            <p className="text-red-500 text-sm">Resume content must be at least 5 characters.</p>
          )}
          
          <PodcastSettings form={form} />

          <PodcastSubmitButton 
            isLoading={isLoading} 
            canSubmit={canSubmit} 
          />
        </form>
      </CardContent>
    </Card>
  );
};
