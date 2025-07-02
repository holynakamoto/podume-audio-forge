import React from 'react';

interface LinkedInFormStatusProps {
  linkedInContent: string;
  isProcessingProfile: boolean;
}

export const LinkedInFormStatus: React.FC<LinkedInFormStatusProps> = ({
  linkedInContent,
  isProcessingProfile
}) => {
  if (linkedInContent || isProcessingProfile) return null;

  return (
    <div className="text-center p-6 text-gray-600">
      <p className="text-sm">Please sign in with LinkedIn OIDC above to automatically create your podcast.</p>
    </div>
  );
};