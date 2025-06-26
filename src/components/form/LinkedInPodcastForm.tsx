import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/ClerkAuthProvider';
import { linkedInFormSchema, LinkedInFormValues } from './schemas/linkedInFormSchema';
import { LinkedInAlerts } from './LinkedInAlerts';
import { LinkedInTitleInput } from './LinkedInTitleInput';
import { LinkedInUrlInput } from './LinkedInUrlInput';
import { PackageTypeSelector } from './PackageTypeSelector';
import { LinkedInSubmitButton } from './LinkedInSubmitButton';
import { LinkedInOAuthButton } from './LinkedInOAuthButton';

export const LinkedInPodcastForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showManualOption, setShowManualOption] = useState(false);
  const [linkedInContent, setLinkedInContent] = useState<string>('');
  const [useOAuth, setUseOAuth] = useState(true);
  const [isProcessingProfile, setIsProcessingProfile] = useState(false);
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

  // Handle OAuth callback and profile extraction
  useEffect(() => {
    const handleOAuthCallback = async () => {
      console.log('=== LinkedIn OAuth Callback Handler ===');
      console.log('Current URL:', window.location.href);
      console.log('URL params:', window.location.search);
      console.log('URL hash:', window.location.hash);
      
      // Small delay to ensure auth state is settled
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        console.log('Checking for LinkedIn OAuth session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          return;
        }

        console.log('Session check result:');
        console.log('- Session exists:', !!session);
        console.log('- Provider:', session?.user?.app_metadata?.provider);
        console.log('- Provider token exists:', !!session?.provider_token);
        console.log('- User ID:', session?.user?.id);

        if (session?.provider_token && session.user.app_metadata?.provider === 'linkedin_oidc') {
          console.log('=== LinkedIn OAuth Session Found ===');
          console.log('Processing LinkedIn profile...');
          setIsProcessingProfile(true);
          
          // Extract profile data using the provider token
          const profileData = await extractLinkedInProfile(session.provider_token);
          
          if (profileData) {
            console.log('Profile data extracted successfully, length:', profileData.length);
            setLinkedInContent(profileData);
            toast.success('LinkedIn profile imported successfully!');
          } else {
            console.error('Failed to extract LinkedIn profile data');
            toast.error('Failed to extract LinkedIn profile data');
          }
          
          setIsProcessingProfile(false);
        } else {
          console.log('No LinkedIn OAuth session found or invalid session');
          console.log('Session details:', {
            hasSession: !!session,
            provider: session?.user?.app_metadata?.provider,
            hasProviderToken: !!session?.provider_token
          });
        }
      } catch (error) {
        console.error('Error processing OAuth callback:', error);
        setIsProcessingProfile(false);
        toast.error('Error processing LinkedIn authentication');
      }
    };

    // Run immediately and also listen for auth state changes
    handleOAuthCallback();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('=== Auth State Change Event ===');
      console.log('Event:', event);
      console.log('Session provider:', session?.user?.app_metadata?.provider);
      console.log('Provider token exists:', !!session?.provider_token);
      
      if (event === 'SIGNED_IN' && session?.user?.app_metadata?.provider === 'linkedin_oidc') {
        console.log('LinkedIn sign-in detected, processing profile...');
        // Small delay to ensure everything is ready
        setTimeout(() => {
          handleOAuthCallback();
        }, 500);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const extractLinkedInProfile = async (accessToken: string): Promise<string | null> => {
    try {
      console.log('=== LinkedIn Profile Extraction ===');
      console.log('Access token exists:', !!accessToken);
      console.log('Access token length:', accessToken?.length);
      console.log('Calling linkedin-profile function...');
      
      const { data, error } = await supabase.functions.invoke('linkedin-profile', {
        body: { access_token: accessToken }
      });

      console.log('LinkedIn function response received');
      console.log('Error:', error);
      console.log('Data:', data);

      if (error) {
        console.error('LinkedIn profile function error:', error);
        toast.error(`Failed to extract LinkedIn profile: ${error.message}`);
        return null;
      }

      if (data?.success && data?.data) {
        console.log('LinkedIn profile data received successfully');
        console.log('Profile data length:', data.data.length);
        console.log('Profile data preview:', data.data.substring(0, 200) + '...');
        return data.data;
      } else {
        console.error('LinkedIn profile function returned no data:', data);
        toast.error('No profile data received from LinkedIn');
        return null;
      }
    } catch (error) {
      console.error('Error calling LinkedIn profile function:', error);
      toast.error('Error processing LinkedIn profile');
      return null;
    }
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
      toast.error('Please import your LinkedIn profile first or use a LinkedIn URL');
      return;
    }

    setIsLoading(true);
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
      setIsLoading(false);
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

  return (
    <div className="w-full max-w-lg mx-auto px-4 sm:px-0">
      <div className="text-center mb-8 mt-16 sm:mt-20">
        <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2">
          Create Your Podcast
        </h1>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
          Import your LinkedIn profile and transform it into an engaging audio experience
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

            {/* LinkedIn Import Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Import LinkedIn Profile</h3>
              
              {isProcessingProfile && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    Processing your LinkedIn profile...
                  </p>
                </div>
              )}
              
              {!linkedInContent && !isProcessingProfile ? (
                <div className="space-y-4">
                  <LinkedInOAuthButton 
                    onProfileData={setLinkedInContent}
                  />
                  
                  <div className="text-center">
                    <span className="text-gray-500">or</span>
                  </div>
                  
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setUseOAuth(false)}
                    className="w-full"
                  >
                    Use LinkedIn URL Instead
                  </Button>
                  
                  {!useOAuth && (
                    <LinkedInUrlInput
                      register={form.register}
                      errors={form.formState.errors}
                    />
                  )}
                </div>
              ) : linkedInContent && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">
                    ✓ LinkedIn profile imported successfully! ({linkedInContent.length} characters)
                  </p>
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setLinkedInContent('');
                      setUseOAuth(true);
                    }}
                    className="mt-2"
                  >
                    Import Different Profile
                  </Button>
                </div>
              )}
            </div>

            <PackageTypeSelector register={form.register} />

            <LinkedInSubmitButton 
              isLoading={isLoading}
              isExtracting={isProcessingProfile}
              disabled={!linkedInContent && !form.watch('linkedin_url')}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
