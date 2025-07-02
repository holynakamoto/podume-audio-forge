
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
import { LinkedInOIDCButton } from './LinkedInOIDCButton';

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
    console.log('=== LinkedIn Form Submission Started ===');
    console.log('Form values:', values);

    // Prevent multiple submissions
    if (isLoading) {
      console.log('Form already submitting, ignoring duplicate submission');
      return;
    }

    setIsLoading(true);
    toast.info('Creating podcast from LinkedIn profile...');

    try {
      // Validate form values before submission
      if (!values.title?.trim()) {
        throw new Error('Title is required');
      }
      
      if (!values.linkedin_url?.trim() || values.linkedin_url === 'https://linkedin.com/in/') {
        throw new Error('Valid LinkedIn URL is required');
      }

      console.log('Form validation passed');

      // Get current session with better error handling
      console.log('Getting authentication session...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error(`Authentication error: ${sessionError.message}`);
      }

      const session = sessionData?.session;
      console.log('Session status:', { 
        hasSession: !!session, 
        userId: session?.user?.id,
        isAuthenticated: !!session?.access_token 
      });

      // Prepare the request payload
      const requestPayload = {
        title: values.title.trim(),
        linkedin_url: values.linkedin_url.trim(),
        package_type: values.package_type || 'core',
        voice_clone: values.voice_clone || false,
        premium_assets: values.premium_assets || false,
        source_type: 'linkedin_url',
        resume_content: '' // Add empty resume_content for consistency
      };

      console.log('Request payload prepared:', {
        ...requestPayload,
        linkedin_url: requestPayload.linkedin_url.substring(0, 50) + '...' // Truncate for logging
      });

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
        console.log('Added authorization header');
      } else {
        console.log('No session token available - proceeding without authentication');
      }

      console.log('About to call generate-podcast function...');
      console.log('Supabase client configured:', !!supabase);

      // Call the Edge Function with timeout
      const timeoutMs = 30000; // 30 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        console.log('🚀 About to invoke generate-podcast function with payload:', requestPayload);
        
        const { data, error } = await supabase.functions.invoke('generate-podcast', {
          body: requestPayload,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
        });

        clearTimeout(timeoutId);

        console.log('Edge Function response received:');
        console.log('- Data:', data);
        console.log('- Error:', error);

        if (error) {
          console.error('Edge Function error details:', {
            message: error.message,
            status: error.status,
            statusText: error.statusText,
            details: error.details || 'No additional details'
          });
          
          throw new Error(error.message || 'Edge Function returned an error');
        }

        if (!data) {
          console.error('No data returned from Edge Function');
          throw new Error('No response data received from server');
        }

        console.log('Success! Podcast created:', data);

        if (data?.podcast?.id) {
          toast.success('Your LinkedIn podcast has been created!');
          console.log('Navigating to podcast page:', `/podcast/${data.podcast.id}`);
          navigate(`/podcast/${data.podcast.id}`);
        } else {
          console.warn('Unexpected response structure:', data);
          toast.error('Podcast creation response was unexpected');
        }

      } catch (invokeError) {
        clearTimeout(timeoutId);
        
        if (invokeError.name === 'AbortError') {
          throw new Error('Request timed out - please try again');
        }
        
        throw invokeError;
      }

    } catch (error: any) {
      console.error('=== Catch block error ===');
      console.error('Error type:', error?.constructor?.name || 'Unknown');
      console.error('Error message:', error?.message || 'No message');
      console.error('Error stack:', error?.stack || 'No stack trace');
      console.error('Full error object:', error);
      
      const errorMessage = error?.message || 'Network or unknown error occurred';
      toast.error(`Failed to create podcast: ${errorMessage}`);
      
    } finally {
      console.log('=== LinkedIn Form Submission Completed ===');
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
          {/* LinkedIn OIDC Sign-in Option */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Option 1: Connect with LinkedIn OIDC</h3>
            <p className="text-blue-700 text-sm mb-3">
              Sign in with LinkedIn to automatically import your profile data
            </p>
            <LinkedInOIDCButton 
              className="w-full mb-2"
              onSuccess={() => {
                toast.success('LinkedIn connected! Your profile will be processed automatically.');
              }}
            />
          </div>

          <div className="text-center mb-4">
            <span className="bg-white px-3 py-1 text-gray-500 text-sm">OR</span>
          </div>

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
