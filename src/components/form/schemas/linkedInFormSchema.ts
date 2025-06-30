
import { z } from 'zod';

const linkedInUrlRegex = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;

export const linkedInFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  linkedin_url: z.string()
    .min(1, 'LinkedIn URL is required')
    .regex(linkedInUrlRegex, 'Please enter a valid LinkedIn profile URL'),
  package_type: z.enum(['core', 'premium']).default('core'),
  voice_clone: z.boolean().default(false),
  premium_assets: z.boolean().default(false),
});

export type LinkedInFormValues = z.infer<typeof linkedInFormSchema>;
