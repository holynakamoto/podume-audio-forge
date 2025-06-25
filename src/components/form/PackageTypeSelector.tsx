
import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { LinkedInFormValues } from './schemas/linkedInFormSchema';

interface PackageTypeSelectorProps {
  register: UseFormRegister<LinkedInFormValues>;
}

export const PackageTypeSelector: React.FC<PackageTypeSelectorProps> = ({ register }) => {
  return (
    <div className="space-y-4">
      <Label className="text-gray-700 font-medium">Package Options</Label>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <input
            type="radio"
            id="core"
            value="core"
            {...register('package_type')}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <Label htmlFor="core" className="font-normal text-gray-700 cursor-pointer flex-1">
            Core Package
            <span className="block text-sm text-gray-500">Standard podcast generation</span>
          </Label>
        </div>
        
        <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <input
            type="radio"
            id="premium"
            value="premium"
            {...register('package_type')}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <Label htmlFor="premium" className="font-normal text-gray-700 cursor-pointer flex-1">
            Premium Package
            <span className="block text-sm text-gray-500">Enhanced features & quality</span>
          </Label>
        </div>
      </div>
    </div>
  );
};
