
import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { LinkedInFormValues } from './schemas/linkedInFormSchema';

interface PackageSelectorProps {
  register: UseFormRegister<LinkedInFormValues>;
}

export const PackageSelector: React.FC<PackageSelectorProps> = ({ register }) => {
  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Package Options</Label>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="core"
            value="core"
            {...register('package_type')}
            className="w-4 h-4"
          />
          <Label htmlFor="core" className="font-normal">
            Core Package - Standard podcast generation
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="premium"
            value="premium"
            {...register('package_type')}
            className="w-4 h-4"
          />
          <Label htmlFor="premium" className="font-normal">
            Premium Package - Enhanced features
          </Label>
        </div>
      </div>
    </div>
  );
};
