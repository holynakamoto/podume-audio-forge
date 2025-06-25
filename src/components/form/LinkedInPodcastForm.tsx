
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/ClerkAuthProvider';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { Loader2, Globe, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { linkedInFormSchema, LinkedInFormValues } from './schemas/linkedInFormSchema';

export const LinkedInPodcastForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const navigate = useNavigate();
  const { user, isSignedIn } = useAuth();

  const form = useForm<LinkedInFormValues>({
    resolver: zodResolver(linkedInFormSchema),
    defaultValues: {
      title: '',
      linkedin_url: 'https://linkedin.com/in/',
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
    toast.info('Extracting LinkedIn profile and generating podcast...');

    try {
      // First, extract content from LinkedIn profile
      const extractResult = await FirecrawlService.scrapeUrl(values.linkedin_url);
      
      if (!extractResult.success || !extractResult.data) {
        toast.error(extractResult.error || 'Failed to extract LinkedIn profile content');
        return;
      }

      setIsExtracting(false);
      toast.info('Profile extracted! Now generating podcast...');

      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast.error('Please sign in again to create a podcast');
        navigate('/auth');
        return;
      }

      // Generate podcast with extracted LinkedIn content
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

      toast.success('Your LinkedIn podcast has been created!');
      navigate(`/podcast/${data.podcast.id}`);
    } catch (error: any) {
      console.error('Error creating LinkedIn podcast:', error);
      toast.error(`Failed to create podcast: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setIsExtracting(false);
    }
  };

  if (!isSignedIn) {
    return (
      <Card className="w-full max-w-lg mx-auto shadow-sm border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900">Sign In Required</CardTitle>
          <CardDescription className="text-gray-600">You must be signed in to create a podcast from LinkedIn.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 sm:px-0">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2">
          Create Your Podcast
        </h1>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
          Transform your LinkedIn profile into an engaging audio resume
        </p>
      </div>

      <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardContent className="p-6 sm:p-8">
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Globe className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              Make sure your LinkedIn profile is public or accessible for the best results.
            </AlertDescription>
          </Alert>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-700 font-medium">
                Podcast Title
              </Label>
              <Input
                id="title"
                {...form.register('title')}
                placeholder="John Smith's Professional Journey"
                className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
              {form.formState.errors.title && (
                <p className="text-red-500 text-sm">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin_url" className="text-gray-700 font-medium">
                LinkedIn Profile URL
              </Label>
              <Input
                id="linkedin_url"
                type="url"
                {...form.register('linkedin_url')}
                placeholder="https://linkedin.com/in/yourprofile"
                className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
              {form.formState.errors.linkedin_url && (
                <p className="text-red-500 text-sm">{form.formState.errors.linkedin_url.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <Label className="text-gray-700 font-medium">Package Options</Label>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    id="core"
                    value="core"
                    {...form.register('package_type')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <Label htmlFor="core" className="font-normal text-gray-700 cursor-pointer flex-1">
                    Core Package
                    <span className="block text-sm text-gray-500">Standard podcast generation</span>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    id="premium"
                    value="premium"
                    {...form.register('package_type')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <Label htmlFor="premium" className="font-normal text-gray-700 cursor-pointer flex-1">
                    Premium Package
                    <span className="block text-sm text-gray-500">Enhanced features & quality</span>
                  </Label>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isExtracting ? 'Extracting Profile...' : 'Generating Podcast...'}
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  Create Podcast
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
