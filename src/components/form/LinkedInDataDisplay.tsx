import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface LinkedInDataDisplayProps {
  linkedInContent: string;
  generatedTranscript?: string;
}

export const LinkedInDataDisplay: React.FC<LinkedInDataDisplayProps> = ({
  linkedInContent,
  generatedTranscript
}) => {
  const [showLinkedInData, setShowLinkedInData] = React.useState(false);
  const [showTranscript, setShowTranscript] = React.useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  if (!linkedInContent && !generatedTranscript) {
    console.log('[LinkedInDataDisplay] No content to display:', { linkedInContent: !!linkedInContent, generatedTranscript: !!generatedTranscript });
    return null;
  }

  return (
    <div className="space-y-4">
      {linkedInContent && (
        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-blue-900">LinkedIn Profile Data (JSON)</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(linkedInContent, "LinkedIn data")}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLinkedInData(!showLinkedInData)}
                >
                  {showLinkedInData ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                  {showLinkedInData ? 'Hide' : 'Show'}
                </Button>
              </div>
            </div>
          </CardHeader>
          {showLinkedInData && (
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg border text-sm font-mono overflow-auto max-h-60">
                <pre className="whitespace-pre-wrap">{linkedInContent}</pre>
              </div>
              <p className="text-blue-600 text-xs mt-2">
                Length: {linkedInContent.length} characters
              </p>
            </CardContent>
          )}
        </Card>
      )}

      {generatedTranscript && (
        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-green-900">Generated Podcast Script (LLM Output)</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generatedTranscript, "Podcast script")}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTranscript(!showTranscript)}
                >
                  {showTranscript ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                  {showTranscript ? 'Hide' : 'Show'}
                </Button>
              </div>
            </div>
          </CardHeader>
          {showTranscript && (
            <CardContent>
              <div className="bg-green-50 p-4 rounded-lg border text-sm font-mono overflow-auto max-h-60">
                <pre className="whitespace-pre-wrap">{generatedTranscript}</pre>
              </div>
              <p className="text-green-600 text-xs mt-2">
                Length: {generatedTranscript.length} characters
              </p>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};