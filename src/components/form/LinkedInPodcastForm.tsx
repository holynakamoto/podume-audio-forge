
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
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

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.provider_token && session.provider === 'linkedin_oidc') {
        console.log('LinkedIn OAuth successful, fetching profile...');
        
        try {
          const { data, error } = await supabase.functions.invoke('linkedin-profile', {
            body: { access_token: session.provider_token }
          });

          if (error) {
            console.error('Error fetching LinkedIn profile:', error);
            toast.error('Failed to fetch LinkedIn profile');
            return;
          }

          if (data?.success && data?.data) {
            setLinkedInContent(data.data);
            toast.success('LinkedIn profile imported successfully!');
          }
        } catch (error) {
          console.error('Error processing LinkedIn profile:', error);
          toast.error('Failed to process LinkedIn profile');
        }
      }
    };

    handleOAuthCallback();
  }, []);

  const onSubmit = async (values: LinkedInFormValues) => {
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

    setIsLoading(true);
    toast.info('Generating podcast from LinkedIn profile...');

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast.error('Please sign in again to create a podcast');
        navigate('/auth');
        return;
      }

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

      toast.success('Your LinkedIn podcast has been created!');
      navigate(`/podcast/${data.podcast.id}`);
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
              
              {!linkedInContent ? (
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
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">
                    ✓ LinkedIn profile imported successfully! ({linkedInContent.length} characters)
                  </p>
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setLinkedInContent('')}
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
              isExtracting={false}
              disabled={!linkedInContent}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
