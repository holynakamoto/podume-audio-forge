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
Hey, welcome back to Career Deep Dive! So I've been diving into ${name}'s professional journey, and honestly, there's some really impressive stuff here.

Oh absolutely! What caught my eye right away is how they've built this authentic professional presence. You know what I mean? It's not just another generic LinkedIn profile - there's real substance behind their career progression.

Exactly! And speaking of progression, let's talk about their networking approach. It's clear they understand that career growth isn't just about what you know, but who you're connected with and how you add value to those relationships.

That's such a good point. I was looking at their skill development, and it's fascinating how they've balanced technical expertise with those softer leadership qualities. You don't see that combination very often.

Right? And here's what I find really interesting - their approach to professional branding feels genuine. It's not just buzzwords and fluff. There's real depth in how they present their experience and growth trajectory.

I totally agree. You can tell they've been strategic about their career moves. Each step seems intentional, building on the previous experience rather than just jumping around randomly.

And that consistency shows up in everything - from their professional communication style to how they engage with their industry. It's the kind of authenticity that employers are really looking for right now.

Absolutely. In today's market, candidates like ${name} who can demonstrate both competence and genuine professional growth are exactly what forward-thinking organizations need to invest in.

Couldn't have said it better myself. For anyone listening who wants to build a similar trajectory, the key takeaway here is that authentic professional development really does make all the difference.

Thanks for diving deep with us today! If you found this conversation valuable, definitely share it with someone who might benefit from these insights. Until next time, keep building those meaningful professional connections!
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