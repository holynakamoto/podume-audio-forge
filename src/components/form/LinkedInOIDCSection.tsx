import React from 'react';
import { toast } from 'sonner';
import { LinkedInOIDCButton } from './LinkedInOIDCButton';

interface LinkedInOIDCSectionProps {
  isProcessingProfile: boolean;
  linkedInContent: string;
}

export const LinkedInOIDCSection: React.FC<LinkedInOIDCSectionProps> = ({
  isProcessingProfile,
  linkedInContent
}) => {
  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="font-semibold text-blue-900 mb-2">Option 1: Connect with LinkedIn OIDC</h3>
      <p className="text-blue-700 text-sm mb-3">
        Sign in with LinkedIn to automatically import your profile data
      </p>
      {isProcessingProfile ? (
        <div className="w-full p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            🔄 Processing your LinkedIn profile and creating podcast...
          </p>
        </div>
      ) : linkedInContent ? (
        <div className="w-full p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">
            ✅ LinkedIn profile imported! Creating your podcast...
          </p>
        </div>
      ) : (
        <LinkedInOIDCButton 
          className="w-full mb-2"
          onSuccess={() => {
            toast.success('LinkedIn connected! Processing your profile...');
          }}
        />
      )}
    </div>
  );
};