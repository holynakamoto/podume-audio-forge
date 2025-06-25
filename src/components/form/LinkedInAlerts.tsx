
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, AlertCircle, FileText } from 'lucide-react';

interface LinkedInAlertsProps {
  showManualOption: boolean;
}

export const LinkedInAlerts: React.FC<LinkedInAlertsProps> = ({ showManualOption }) => {
  const navigate = useNavigate();

  return (
    <>
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <Globe className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 text-sm">
          Make sure your Kickresume is public or accessible for the best results. Use the preview URL from your Kickresume editor.
        </AlertDescription>
      </Alert>

      {showManualOption && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 text-sm">
            <div className="space-y-2">
              <p><strong>Unable to extract content from your Kickresume.</strong></p>
              <p>Alternative options:</p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Try using a different resume URL</li>
                <li>Use the main podcast creation form with "Paste Text" option</li>
                <li>Copy your resume content and paste it manually</li>
              </ul>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => navigate('/create-podcast')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Use Manual Entry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};
