
import { z } from 'zod';

export const linkedInFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters'),
  linkedin_url: z.string().url('Please enter a valid URL').refine(
    (url) => {
      // More flexible pattern that handles both with and without www
      const pattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;
      return pattern.test(url);
    },
    'Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/yourprofile)'
  ),
  package_type: z.enum(['core', 'premium']).default('core'),
  voice_clone: z.boolean().default(false),
  premium_assets: z.boolean().default(false),
});

export type LinkedInFormValues = z.infer<typeof linkedInFormSchema>;
