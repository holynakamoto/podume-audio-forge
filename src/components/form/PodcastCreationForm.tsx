
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/ClerkAuthProvider';
import { ResumeUploader } from './ResumeUploader';
import { PodcastTitleInput } from './PodcastTitleInput';
import { PodcastSettings } from './PodcastSettings';
import { PodcastSubmitButton } from './PodcastSubmitButton';
import { formSchema, FormValues } from './schemas/podcastFormSchema';

interface PodcastCreationFormProps {
  initialResumeContent?: string;
}

const logSecurityEvent = async (eventType: string, eventData: any) => {
  try {
    await supabase.from('security_audit_log').insert({
      event_type: eventType,
      event_data: eventData,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const PodcastCreationForm: React.FC<PodcastCreationFormProps> = ({ 
  initialResumeContent = '' 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [resumeContent, setResumeContent] = useState(initialResumeContent);
  const navigate = useNavigate();
  const { user, isSignedIn } = useAuth();

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

  const validateSubmitData = (data: FormValues): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!data.title || data.title.trim().length < 3) {
      errors.push('Title must be at least 3 characters');
    }
    
    if (data.title && data.title.length > 200) {
      errors.push('Title cannot exceed 200 characters');
    }
    
    if (!data.resume_content || data.resume_content.trim().length < 5) {
      errors.push('Resume content must be at least 5 characters');
    }
    
    if (data.resume_content && data.resume_content.length > 50000) {
      errors.push('Resume content cannot exceed 50,000 characters');
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const onSubmit = async (values: FormValues) => {
    console.log('Form submission started with values:', values);
    console.log('Resume content length:', resumeContent.length);
    
    // Check if user is signed in
    if (!isSignedIn || !user) {
      toast.error('You must be signed in to create a podcast');
      navigate('/auth');
      return;
    }
    
    // Enhanced validation
    const validation = validateSubmitData({ ...values, resume_content: resumeContent });
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    // Sanitize inputs
    const submitData = { 
      ...values, 
      title: sanitizeInput(values.title),
      resume_content: sanitizeInput(resumeContent)
    };

    setIsLoading(true);
    toast.info('Generating your podcast... This may take a moment.');

    try {
      console.log('Calling generate-podcast function with data:', submitData);
      
      // Log podcast creation attempt
      await logSecurityEvent('podcast_creation_attempt', {
        title: submitData.title,
        package_type: submitData.package_type,
        content_length: submitData.resume_content.length
      });

      // Get the current session to ensure we have a valid token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('No valid session found:', sessionError);
        toast.error('Please sign in again to create a podcast');
        navigate('/auth');
        return;
      }

      console.log('Using session token for function call');

      const { data, error } = await supabase.functions.invoke('generate-podcast', {
        body: submitData,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        await logSecurityEvent('podcast_creation_failed', {
          title: submitData.title,
          error: error.message
        });
        
        // Provide more specific error messages
        if (error.message?.includes('Authentication')) {
          toast.error('Authentication failed. Please sign in again.');
          navigate('/auth');
        } else if (error.message?.includes('Edge Function returned a non-2xx')) {
          toast.error('Server error. Please try again in a moment.');
        } else {
          toast.error(`Failed to create podcast: ${error.message}`);
        }
        return;
      }

      console.log('Podcast generated successfully:', data);
      await logSecurityEvent('podcast_creation_success', {
        podcast_id: data.podcast.id,
        title: submitData.title
      });
      
      toast.success('Your podcast has been created!');
      const newPodcastId = data.podcast.id;
      navigate(`/podcast/${newPodcastId}`);
    } catch (error: any) {
      console.error('Error creating podcast:', error);
      await logSecurityEvent('podcast_creation_error', {
        title: submitData.title,
        error: error.message || 'Unknown error'
      });
      toast.error(`Failed to create podcast: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Watch form values for validation
  const titleValue = form.watch('title');
  
  // Enhanced validation for submit button
  const canSubmit = resumeContent.length >= 5 && 
                   resumeContent.length <= 50000 &&
                   titleValue && 
                   titleValue.length >= 3 && 
                   titleValue.length <= 200 &&
                   isSignedIn;

  console.log('Form state:', { 
    resumeContentLength: resumeContent.length, 
    titleLength: titleValue?.length || 0, 
    canSubmit,
    isLoading,
    isSignedIn
  });

  if (!isSignedIn) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Sign In Required</CardTitle>
          <CardDescription>You must be signed in to create a podcast.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

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
          {resumeContent.length > 0 && resumeContent.length < 5 && (
            <p className="text-red-500 text-sm">Resume content must be at least 5 characters.</p>
          )}
          {resumeContent.length > 50000 && (
            <p className="text-red-500 text-sm">Resume content cannot exceed 50,000 characters.</p>
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
