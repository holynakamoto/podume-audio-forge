
import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LinkedInFormValues } from './schemas/linkedInFormSchema';

interface LinkedInUrlInputProps {
  register: UseFormRegister<LinkedInFormValues>;
  errors: FieldErrors<LinkedInFormValues>;
}

export const LinkedInUrlInput: React.FC<LinkedInUrlInputProps> = ({
  register,
  errors,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="linkedin_url">LinkedIn Profile URL</Label>
      <Input
        id="linkedin_url"
        type="url"
        {...register('linkedin_url')}
        placeholder="https://linkedin.com/in/yourprofile"
        className="w-full"
      />
      {errors.linkedin_url && (
        <p className="text-red-500 text-sm">{errors.linkedin_url.message}</p>
      )}
    </div>
  );
};
