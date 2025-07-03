
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { linkedInFormSchema, LinkedInFormValues } from './schemas/linkedInFormSchema';
import { LinkedInAlerts } from './LinkedInAlerts';
import { usePodcastGeneration } from './hooks/usePodcastGeneration';
import { useLinkedInOAuth } from './hooks/useLinkedInOAuth';
import { LinkedInOIDCSection } from './LinkedInOIDCSection';
import { LinkedInDataDisplay } from './LinkedInDataDisplay';
import { TranscriptDisplay } from './TranscriptDisplay';
import { LinkedInFormStatus } from './LinkedInFormStatus';
import { TTSComparison } from './TTSComparison';
import { OneClickDistribution } from '../OneClickDistribution';

export const LinkedInPodcastForm: React.FC = () => {
  const [linkedInContent, setLinkedInContent] = useState('');
  const [rawLinkedInJSON, setRawLinkedInJSON] = useState('');
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState('');
  const { isLoading, generatedTranscript, generatePodcast } = usePodcastGeneration();

  console.log('[LinkedInPodcastForm] Component rendered');
  console.log('[LinkedInPodcastForm] Current state:', { linkedInContent, isLoading, hasTranscript: !!generatedTranscript });

  // Auto-fetch LinkedIn profile data after OIDC sign-in
  const { isProcessingProfile } = useLinkedInOAuth(
    (profileData) => {
      console.log('[LinkedInPodcastForm] Profile data received:', profileData);
      setLinkedInContent(profileData);
      // Auto-submit form with LinkedIn data
      if (profileData) {
        const autoValues = {
          title: 'My LinkedIn Podumé',
          linkedin_url: 'https://linkedin.com/in/auto-imported',
          package_type: 'core' as const,
          voice_clone: false,
          premium_assets: false,
        };
        generatePodcast(autoValues, profileData);
      }
    },
    (rawJSON) => {
      console.log('[LinkedInPodcastForm] Raw JSON received:', rawJSON);
      setRawLinkedInJSON(rawJSON);
    }
  );

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
          <LinkedInOIDCSection 
            isProcessingProfile={isProcessingProfile}
            linkedInContent={linkedInContent}
          />
          
          <LinkedInAlerts showManualOption={false} />

          <LinkedInFormStatus 
            linkedInContent={linkedInContent}
            isProcessingProfile={isLoading}
          />
          
          {generatedTranscript && (
            <TTSComparison 
              transcript={generatedTranscript} 
              onAudioGenerated={setGeneratedAudioUrl}
            />
          )}
          
          {generatedAudioUrl && generatedTranscript && (
            <OneClickDistribution 
              podcastId="temp-linkedin-podcast"
              audioUrl={generatedAudioUrl}
              podcastTitle="My LinkedIn Podumé"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
