
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface LinkedInDebugInfoProps {
  linkedInContent: string;
  generatedScript: string;
  showDebugInfo: boolean;
  onToggleDebug: () => void;
}

export const LinkedInDebugInfo: React.FC<LinkedInDebugInfoProps> = ({
  linkedInContent,
  generatedScript,
  showDebugInfo,
  onToggleDebug
}) => {
  if (!linkedInContent && !generatedScript) return null;

  return (
    <>
      <div className="mb-4">
        <Button 
          type="button"
          variant="outline"
          onClick={onToggleDebug}
          className="w-full bg-gray-100 hover:bg-gray-200"
        >
          {showDebugInfo ? 'Hide' : 'Show'} Debug Information
        </Button>
      </div>

      {showDebugInfo && (
        <div className="space-y-4 mb-6">
          {linkedInContent && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-blue-900 mb-2">LinkedIn Profile Data</h3>
                <div className="bg-white p-3 rounded border text-sm overflow-auto max-h-40">
                  <pre className="whitespace-pre-wrap">{linkedInContent}</pre>
                </div>
                <p className="text-blue-700 text-sm mt-2">
                  Length: {linkedInContent.length} characters
                </p>
              </CardContent>
            </Card>
          )}

          {generatedScript && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-green-900 mb-2">Claude Sonnet Generated Script</h3>
                <div className="bg-white p-3 rounded border text-sm overflow-auto max-h-60">
                  <pre className="whitespace-pre-wrap">{generatedScript}</pre>
                </div>
                <p className="text-green-700 text-sm mt-2">
                  Length: {generatedScript.length} characters
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </>
  );
};
