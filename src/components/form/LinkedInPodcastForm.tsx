
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
import { z } from 'zod';

const linkedInFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters'),
  linkedin_url: z.string().url('Please enter a valid URL').refine(
    (url) => url.toLowerCase().includes('linkedin.com'),
    'Please enter a LinkedIn profile URL'
  ),
  package_type: z.enum(['core', 'premium']).default('core'),
  voice_clone: z.boolean().default(false),
  premium_assets: z.boolean().default(false),
});

type LinkedInFormValues = z.infer<typeof linkedInFormSchema>;

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
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Sign In Required</CardTitle>
          <CardDescription>You must be signed in to create a podcast from LinkedIn.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Podcast from LinkedIn Profile</CardTitle>
        <CardDescription>
          Generate an audio resume podcast directly from your LinkedIn profile URL.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <Globe className="h-4 w-4" />
          <AlertDescription>
            <strong>Supported LinkedIn URLs:</strong> Public LinkedIn profiles, portfolio pages, or any LinkedIn URL containing professional information. Make sure your profile is public or accessible.
          </AlertDescription>
        </Alert>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Podcast Title</Label>
            <Input
              id="title"
              {...form.register('title')}
              placeholder="e.g., John Smith's Professional Journey"
              className="w-full"
            />
            {form.formState.errors.title && (
              <p className="text-red-500 text-sm">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin_url">LinkedIn Profile URL</Label>
            <Input
              id="linkedin_url"
              type="url"
              {...form.register('linkedin_url')}
              placeholder="https://linkedin.com/in/yourprofile"
              className="w-full"
            />
            {form.formState.errors.linkedin_url && (
              <p className="text-red-500 text-sm">{form.formState.errors.linkedin_url.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">Package Options</Label>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="core"
                  value="core"
                  {...form.register('package_type')}
                  className="w-4 h-4"
                />
                <Label htmlFor="core" className="font-normal">
                  Core Package - Standard podcast generation
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="premium"
                  value="premium"
                  {...form.register('package_type')}
                  className="w-4 h-4"
                />
                <Label htmlFor="premium" className="font-normal">
                  Premium Package - Enhanced features
                </Label>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isExtracting ? 'Extracting Profile...' : 'Generating Podcast...'}
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 mr-2" />
                Create LinkedIn Podcast
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
