
import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LinkedInFormValues } from './schemas/linkedInFormSchema';

interface LinkedInTitleInputProps {
  register: UseFormRegister<LinkedInFormValues>;
  errors: FieldErrors<LinkedInFormValues>;
}

export const LinkedInTitleInput: React.FC<LinkedInTitleInputProps> = ({
  register,
  errors,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="title" className="text-gray-700 font-medium">
        Podcast Title
      </Label>
      <Input
        id="title"
        {...register('title')}
        placeholder="My Podumé"
        className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
      />
      {errors.title && (
        <p className="text-red-500 text-sm">{errors.title.message}</p>
      )}
    </div>
  );
};
