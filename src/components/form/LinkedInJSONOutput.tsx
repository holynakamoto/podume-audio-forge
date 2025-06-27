
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

interface LinkedInJSONOutputProps {
  jsonData: string;
  onClear: () => void;
}

export const LinkedInJSONOutput: React.FC<LinkedInJSONOutputProps> = ({
  jsonData,
  onClear
}) => {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jsonData);
      toast.success('JSON copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadJSON = () => {
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'linkedin-profile.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('JSON file downloaded!');
  };

  // Show placeholder when no data
  if (!jsonData) {
    return (
      <Card className="mb-6 bg-gray-50 border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-700">
            LinkedIn Profile JSON
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded border border-gray-300 text-center">
            <p className="text-gray-500 text-sm">
              No LinkedIn profile data yet. Complete the LinkedIn OAuth to see JSON data here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 bg-green-50 border-green-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-green-900">
            LinkedIn Profile JSON
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="text-green-700 border-green-300 hover:bg-green-100"
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadJSON}
              className="text-green-700 border-green-300 hover:bg-green-100"
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              className="text-red-700 border-red-300 hover:bg-red-100"
            >
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-white p-4 rounded border border-green-300 max-h-96 overflow-auto">
          <pre className="text-sm whitespace-pre-wrap font-mono text-gray-800">
            {JSON.stringify(JSON.parse(jsonData), null, 2)}
          </pre>
        </div>
        <p className="text-green-700 text-sm mt-2">
          Raw JSON data: {jsonData.length} characters
        </p>
      </CardContent>
    </Card>
  );
};
