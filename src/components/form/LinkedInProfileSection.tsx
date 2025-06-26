
import React from 'react';
import { Button } from '@/components/ui/button';
import { LinkedInOAuthButton } from './LinkedInOAuthButton';

interface LinkedInProfileSectionProps {
  linkedInContent: string;
  isProcessingProfile: boolean;
  isScriptLoading: boolean;
  onProfileData: (data: string) => void;
  onClearProfile: () => void;
  onGeneratePreview: () => void;
}

export const LinkedInProfileSection: React.FC<LinkedInProfileSectionProps> = ({
  linkedInContent,
  isProcessingProfile,
  isScriptLoading,
  onProfileData,
  onClearProfile,
  onGeneratePreview
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Import LinkedIn Profile</h3>
      
      {isProcessingProfile && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            Processing your LinkedIn profile...
          </p>
        </div>
      )}
      
      {!linkedInContent && !isProcessingProfile ? (
        <LinkedInOAuthButton 
          onProfileData={onProfileData}
        />
      ) : linkedInContent && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">
              ✓ LinkedIn profile imported successfully! ({linkedInContent.length} characters)
            </p>
            <Button 
              type="button"
              variant="outline"
              size="sm"
              onClick={onClearProfile}
              className="mt-2"
            >
              Import Different Profile
            </Button>
          </div>

          {/* Script Preview Button */}
          <Button 
            type="button"
            variant="outline"
            onClick={onGeneratePreview}
            disabled={isScriptLoading}
            className="w-full bg-purple-50 hover:bg-purple-100 border-purple-200"
          >
            {isScriptLoading ? 'Generating Preview...' : 'Generate Script Preview with Claude Sonnet'}
          </Button>
        </div>
      )}
    </div>
  );
};
