
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { linkedInFormSchema, LinkedInFormValues } from './schemas/linkedInFormSchema';
import { LinkedInAlerts } from './LinkedInAlerts';
import { useLinkedInOAuth } from './hooks/useLinkedInOAuth';
import { usePodcastGeneration } from './hooks/usePodcastGeneration';
import { LinkedInOIDCSection } from './LinkedInOIDCSection';
import { TranscriptDisplay } from './TranscriptDisplay';
import { LinkedInFormStatus } from './LinkedInFormStatus';

export const LinkedInPodcastForm: React.FC = () => {
  const [linkedInContent, setLinkedInContent] = useState('');
  const { isLoading, generatedTranscript, generatePodcast } = usePodcastGeneration();

  // Auto-fetch LinkedIn profile data after OIDC sign-in
  const { isProcessingProfile } = useLinkedInOAuth(
    (profileData) => {
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

          <div className="text-center mb-4">
            <span className="bg-white px-3 py-1 text-gray-500 text-sm">OR</span>
          </div>

          <LinkedInAlerts showManualOption={false} />

          <LinkedInFormStatus 
            linkedInContent={linkedInContent}
            isProcessingProfile={isProcessingProfile}
          />

          <TranscriptDisplay transcript={generatedTranscript} />
        </CardContent>
      </Card>
    </div>
  );
};
