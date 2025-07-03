import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LinkedInFormValues } from '../schemas/linkedInFormSchema';
import { generatePodcastBranding } from '@/utils/brandingService';

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
      // Generate context-aware branding image first
      console.log('=== Generating Podcast Branding ===');
      toast.info('Creating your personalized podcast branding...');
      
      const name = resumeContent?.match(/# (.+)/)?.[1] || 'LinkedIn Professional';
      
      // Extract key themes from resume for context-aware branding
      const profession = resumeContent?.match(/(?:title|position|role):\s*([^\n]+)/i)?.[1] || 
                        resumeContent?.match(/(?:developer|engineer|manager|director|analyst|designer|consultant|specialist)/i)?.[0] || 
                        'Professional';
      
      const industry = resumeContent?.match(/(?:industry|sector|field):\s*([^\n]+)/i)?.[1] ||
                      resumeContent?.match(/(?:technology|finance|healthcare|education|marketing|sales|design|consulting)/i)?.[0] ||
                      'Business';
      
      // Generate context-aware branding prompt
      const brandingPrompt = `Create a premium podcast branding image with a luxurious purple and gold color scheme. Feature a sleek modern headset with "PODUME" elegantly written on the side in gold lettering, and a professional studio microphone. The design should appeal to a ${profession} in the ${industry} industry. Include subtle elements that reflect ${profession} work - perhaps geometric patterns, clean lines, or professional icons. The overall aesthetic should be sophisticated, modern, and broadcast-quality. Purple and gold gradient background with soft lighting effects. Ultra high resolution, professional branding design.`;
      
      console.log('Branding prompt:', brandingPrompt);
      
      // Generate the branding image
      let brandingImageUrl = '';
      try {
        brandingImageUrl = await generatePodcastBranding({
          name,
          profession,
          industry,
          resumeContent: resumeContent || ''
        });
        console.log('Generated branding image URL:', brandingImageUrl);
        toast.success('Personalized branding created!');
      } catch (imageError) {
        console.warn('Image generation failed, continuing without branding:', imageError);
        toast.warning('Continuing without custom branding');
      }
      
      // Generate the transcript
      console.log('=== Generating Mock Transcript ===');
      
      const mockTranscript = `
Hey, welcome back to Career Deep Dive! I'm your host Sarah, and today we're exploring the fascinating professional journey of ${name}. Let's dive right in!

So, ${name}, tell us about your background. What got you started in your career?

Well, my journey has been quite interesting. I've always been passionate about continuous learning and building meaningful professional relationships. Early on, I realized that success isn't just about technical skills - it's about understanding people, markets, and how to create real value.

That's fascinating! Can you walk us through some of the key milestones in your career progression?

Absolutely. One of the biggest lessons I learned was the importance of strategic career moves. Each position I've taken has built upon the previous one, creating this cohesive narrative of growth and expertise. I've focused on roles that challenged me to develop both my technical abilities and leadership skills.

What advice would you give to professionals who are just starting out or looking to make a career transition?

Great question! First, authenticity is everything. Don't try to be someone you're not - instead, focus on becoming the best version of yourself. Second, networking isn't about collecting contacts; it's about building genuine relationships where you can add value to others.

I love that perspective. Let's talk about skills development. How do you stay current in your field?

I'm a big believer in lifelong learning. Whether it's taking courses, attending conferences, or simply staying curious about industry trends, I make sure to dedicate time each week to learning something new. But here's the key - I don't just consume information, I actively apply what I learn in my daily work.

That's such valuable insight. What role has LinkedIn played in your professional growth?

LinkedIn has been instrumental! It's not just a platform for job searching - it's become my go-to space for thought leadership, industry discussions, and connecting with like-minded professionals. I regularly share insights about my field and engage meaningfully with others' content.

Speaking of thought leadership, what topics are you most passionate about right now?

I'm really excited about the intersection of technology and human potential. We're living in this incredible time where digital tools can amplify our capabilities, but the human element - creativity, empathy, strategic thinking - that's what still sets great professionals apart.

What challenges have you faced in your career, and how did you overcome them?

One of the biggest challenges was learning to navigate ambiguity. Early in my career, I wanted everything to be clearly defined, but I've learned that the most rewarding opportunities often come from uncertain situations. The key is developing confidence in your problem-solving abilities.

That's such an important skill. How do you approach building and maintaining professional relationships?

I focus on giving first. Before I think about what someone can do for me, I ask what value I can provide to them. This might be sharing a relevant article, making an introduction, or offering insights from my experience. When you lead with generosity, meaningful relationships naturally follow.

What trends are you seeing in your industry that excite you?

There's this incredible shift toward more collaborative, purpose-driven work environments. Companies are recognizing that their people are their greatest asset, and they're investing in creating cultures where everyone can thrive. It's exciting to be part of this transformation.

For our listeners who want to build a strong professional brand like yours, what are the essential elements?

Consistency is crucial. Whether it's your LinkedIn profile, your communication style, or how you show up in meetings, there should be a coherent narrative about who you are and what you stand for. But remember, branding isn't about creating a facade - it's about authentically communicating your value.

That's brilliant advice. Looking ahead, what are your goals for the next phase of your career?

I'm focused on expanding my impact. Whether that's through mentoring emerging professionals, leading larger initiatives, or exploring new areas of expertise, I want to continue growing while helping others succeed too.

Before we wrap up, what's one piece of advice you'd give to someone listening right now?

Don't underestimate the power of small, consistent actions. Whether it's updating your LinkedIn profile, reaching out to one new connection each week, or sharing one thoughtful post per month - these seemingly small steps compound over time into significant career momentum.

${name}, this has been incredibly insightful. Thank you for sharing your journey with us!

Thank you so much for having me! This was a great conversation.

And to our listeners, remember that everyone's career path is unique. Take inspiration from stories like ${name}'s, but forge your own authentic professional journey. 

Don't forget to subscribe to Career Deep Dive, and if you found value in today's episode, please share it with someone who might benefit from these insights. Until next time, keep building those meaningful professional connections!
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