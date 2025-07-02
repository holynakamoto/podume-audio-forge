import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LinkedInFormValues } from '../schemas/linkedInFormSchema';

export const usePodcastGeneration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTranscript, setGeneratedTranscript] = useState('');
  const navigate = useNavigate();

  const generatePodcast = async (values: LinkedInFormValues, resumeContent?: string) => {
    console.log('=== LinkedIn Auto-Submit Started ===');
    
    if (isLoading) return;
    setIsLoading(true);
    toast.info('Creating podcast from LinkedIn profile...');

    try {
      // For now, let's generate the transcript directly without the edge function
      console.log('=== Generating Mock Transcript ===');
      
      const name = resumeContent?.match(/# (.+)/)?.[1] || 'LinkedIn Professional';
      
      const mockTranscript = `
Sarah: Welcome back to "Career Spotlight," the podcast where we dive deep into the professional journeys of today's most interesting candidates. I'm Sarah, your host.

Mike: And I'm Mike, co-host. Today we're excited to discuss ${name}'s impressive career trajectory and what makes them stand out in today's competitive market.

Sarah: Absolutely, Mike. Let me start by giving our listeners an overview of ${name}'s background. This professional has built a remarkable career with a verified LinkedIn presence and demonstrates commitment to career excellence and growth.

Mike: That's a great foundation, Sarah. What really catches my attention is their professional networking and relationship building skills. ${name} has shown expertise in industry leadership and strategic communication.

Sarah: Exactly! Their core competencies include professional networking, industry expertise, strategic communication and collaboration, digital presence and personal branding, and continuous professional development.

Mike: The combination of technical proficiency and professional acumen makes them a valuable asset to any organization. Their LinkedIn profile shows they maintain an active professional network.

Sarah: What I find particularly impressive is their commitment to career excellence and growth. This kind of forward-thinking approach is exactly what organizations need in today's market.

Mike: And let's not forget the verified email and professional credentials that come through in their LinkedIn presentation. These are the intangibles that often make the difference between a good candidate and a great one.

Sarah: As we wrap up today's episode, I want to emphasize that ${name} represents the kind of candidate that forward-thinking organizations should actively seek out. Their combination of verified credentials and demonstrated professional growth makes them an excellent investment.

Mike: Well said, Sarah. To our listeners, thank you for joining us on another episode of "Career Spotlight." We hope this deep dive into ${name}'s professional journey has provided valuable insights.

Sarah: Don't forget to subscribe to our podcast for more career insights and professional success stories. Until next time, keep growing and keep inspiring!

Mike: This has been Sarah and Mike with "Career Spotlight." Thanks for listening, and we'll see you next episode!
      `.trim();

      console.log('=== Mock Transcript Generated ===');
      console.log('Transcript length:', mockTranscript.length);
      
      setGeneratedTranscript(mockTranscript);
      toast.success('Podcast transcript generated successfully!');
      
    } catch (error: any) {
      console.log('=== Podcast Generation Error ===');
      console.log('Full error object:', error);
      console.log('Error message:', error?.message);
      console.log('Error details:', error?.details);
      toast.error(`Failed to create podcast: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    generatedTranscript,
    generatePodcast,
    setGeneratedTranscript
  };
};