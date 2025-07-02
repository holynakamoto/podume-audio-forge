
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { linkedInFormSchema, LinkedInFormValues } from './schemas/linkedInFormSchema';
import { LinkedInAlerts } from './LinkedInAlerts';
import { usePodcastGeneration } from './hooks/usePodcastGeneration';
import { ClerkLinkedInAuth } from './ClerkLinkedInAuth';
import { LinkedInDataDisplay } from './LinkedInDataDisplay';
import { TranscriptDisplay } from './TranscriptDisplay';
import { LinkedInFormStatus } from './LinkedInFormStatus';

export const LinkedInPodcastForm: React.FC = () => {
  const [linkedInContent, setLinkedInContent] = useState('');
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);
  const { isLoading, generatedTranscript, generatePodcast } = usePodcastGeneration();

  console.log('[LinkedInPodcastForm] Component rendered');
  console.log('[LinkedInPodcastForm] Current state:', { linkedInContent, isLoading, hasTranscript: !!generatedTranscript });

  const handleLinkedInData = (userData: any) => {
    if (hasAutoSubmitted) {
      console.log('[LinkedInPodcastForm] Auto-submit already completed, skipping...');
      return;
    }
    
    console.log('[LinkedInPodcastForm] Received LinkedIn data:', userData);
    console.log('[LinkedInPodcastForm] Full user data object:', userData.fullUserData);
    
    // Convert Clerk user data to profile content
    const profileContent = `# ${userData.name}

**Email:** ${userData.email}
**LinkedIn ID:** ${userData.linkedInId}

## Professional Summary
${userData.name} is an accomplished professional with a strong LinkedIn presence. They maintain an active professional network and demonstrate commitment to career excellence and growth.

## Profile Information
• **Name:** ${userData.name}
• **Email:** ${userData.email}
• **Platform:** LinkedIn (via Clerk)

## Core Competencies
• Professional networking and relationship building
• Industry expertise and thought leadership
• Strategic communication and collaboration
• Digital presence and personal branding
• Continuous professional development

## Professional Network
Active LinkedIn professional with verified identity. Demonstrates commitment to maintaining professional standards and engaging with industry peers.
`;

    setLinkedInContent(profileContent);
    
    // Auto-generate podcast
    const autoValues = {
      title: `${userData.name}'s LinkedIn Podumé`,
      linkedin_url: 'https://linkedin.com/in/clerk-imported',
      package_type: 'core' as const,
      voice_clone: false,
      premium_assets: false,
    };
    
    setHasAutoSubmitted(true);
    generatePodcast(autoValues, profileContent);
  };

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
          <ClerkLinkedInAuth onLinkedInData={handleLinkedInData} />
          
          {/* DEBUG: Always show data display for testing */}
          <LinkedInDataDisplay 
            linkedInContent={linkedInContent}
            generatedTranscript={generatedTranscript}
          />


          <LinkedInAlerts showManualOption={false} />

          <LinkedInFormStatus 
            linkedInContent={linkedInContent}
            isProcessingProfile={isLoading}
          />

          <TranscriptDisplay transcript={generatedTranscript} />
        </CardContent>
      </Card>
    </div>
  );
};
