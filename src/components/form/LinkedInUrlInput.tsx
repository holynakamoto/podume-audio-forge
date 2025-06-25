
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
      <Label htmlFor="linkedin_url" className="text-gray-700 font-medium">
        Kickresume Preview URL
      </Label>
      <Input
        id="linkedin_url"
        {...register('linkedin_url')}
        placeholder="https://www.kickresume.com/edit/16086325/preview/"
        className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
      />
      {errors.linkedin_url && (
        <p className="text-red-500 text-sm">{errors.linkedin_url.message}</p>
      )}
    </div>
  );
};
