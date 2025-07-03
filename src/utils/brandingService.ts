import { supabase } from '@/integrations/supabase/client';

interface BrandingContext {
  name: string;
  profession: string;
  industry: string;
  resumeContent: string;
}

export const generatePodcastBranding = async (context: BrandingContext): Promise<string> => {
  try {
    // Generate context-aware branding prompt
    const brandingPrompt = `Create a premium podcast branding image with a luxurious purple and gold color scheme. Feature a sleek modern headset with "PODUME" elegantly written on the side in gold lettering, and a professional studio microphone. The design should appeal to a ${context.profession} in the ${context.industry} industry. Include subtle elements that reflect ${context.profession} work - perhaps geometric patterns, clean lines, or professional icons that relate to ${context.industry}. The overall aesthetic should be sophisticated, modern, and broadcast-quality. Purple and gold gradient background with soft lighting effects. Ultra high resolution, professional branding design. 16:9 aspect ratio.`;
    
    console.log('Generating branding with prompt:', brandingPrompt);
    
    // Call the generate-image edge function
    const { data, error } = await supabase.functions.invoke('generate-image', {
      body: {
        prompt: brandingPrompt,
        width: 1024,
        height: 576, // 16:9 aspect ratio
        model: 'flux.dev'
      }
    });
    
    if (error) {
      console.error('Branding generation error:', error);
      throw new Error(`Failed to generate branding: ${error.message}`);
    }
    
    return data.imageUrl;
  } catch (error) {
    console.error('Branding service error:', error);
    throw error;
  }
};