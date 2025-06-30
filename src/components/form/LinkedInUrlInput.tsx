
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { LinkedInFormValues } from './schemas/linkedInFormSchema';

interface LinkedInUrlInputProps {
  register: UseFormRegister<LinkedInFormValues>;
  errors: FieldErrors<LinkedInFormValues>;
}

export const LinkedInUrlInput: React.FC<LinkedInUrlInputProps> = ({ 
  register, 
  errors 
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="linkedin_url" className="text-sm font-medium text-gray-700">
        LinkedIn Profile URL
      </Label>
      <Input
        id="linkedin_url"
        type="url"
        placeholder="https://linkedin.com/in/your-profile"
        className="w-full"
        {...register('linkedin_url')}
      />
      {errors.linkedin_url && (
        <p className="text-red-500 text-sm">{errors.linkedin_url.message}</p>
      )}
      <p className="text-gray-500 text-xs">
        Enter your public LinkedIn profile URL. Make sure your profile is set to public visibility.
      </p>
    </div>
  );
};
