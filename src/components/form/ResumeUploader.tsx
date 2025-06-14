
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ResumeUploaderProps {
  onResumeContentChange: (content: string) => void;
  resumeContent: string;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  onResumeContentChange,
  resumeContent
}) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadMode, setUploadMode] = useState<'upload' | 'paste'>('upload');

  const extractTextFromPDF = async (file: File): Promise<string> => {
    // For now, we'll ask users to paste text since PDF parsing requires additional libraries
    // In a production app, you'd use a PDF parsing library like pdf-parse or PDF.js
    toast.info('PDF text extraction is not yet implemented. Please copy and paste your resume text instead.');
    return '';
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file.');
      return;
    }

    setIsExtracting(true);
    try {
      const extractedText = await extractTextFromPDF(file);
      if (extractedText) {
        onResumeContentChange(extractedText);
        toast.success('Resume text extracted successfully!');
      }
    } catch (error) {
      toast.error('Failed to extract text from PDF. Please try pasting the text instead.');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <Button
          type="button"
          variant={uploadMode === 'upload' ? 'default' : 'outline'}
          onClick={() => setUploadMode('upload')}
          size="sm"
        >
          <UploadCloud className="w-4 h-4 mr-2" />
          Upload PDF
        </Button>
        <Button
          type="button"
          variant={uploadMode === 'paste' ? 'default' : 'outline'}
          onClick={() => setUploadMode('paste')}
          size="sm"
        >
          <FileText className="w-4 h-4 mr-2" />
          Paste Text
        </Button>
      </div>

      {uploadMode === 'upload' ? (
        <div>
          <Label htmlFor="resume-upload" className="font-semibold">Upload Your Resume (PDF)</Label>
          <div className="mt-2 flex justify-center rounded-lg border border-dashed border-border px-6 py-10">
            <div className="text-center">
              {isExtracting ? (
                <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
              ) : (
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              )}
              <div className="mt-4 flex text-sm leading-6 text-gray-400">
                <label htmlFor="resume-upload" className="relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80">
                  <span>{isExtracting ? 'Processing...' : 'Upload a PDF file'}</span>
                  <Input 
                    id="resume-upload" 
                    type="file" 
                    className="sr-only" 
                    onChange={handleFileUpload}
                    accept=".pdf"
                    disabled={isExtracting}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs leading-5 text-gray-400">PDF up to 10MB</p>
              <p className="text-xs leading-5 text-orange-500 mt-2">Note: PDF text extraction coming soon. Please use "Paste Text" for now.</p>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <Label htmlFor="resume-content" className="font-semibold">Paste Your Resume Text</Label>
          <Textarea
            id="resume-content"
            placeholder="Copy and paste your full resume text here..."
            value={resumeContent}
            onChange={(e) => onResumeContentChange(e.target.value)}
            className="min-h-[200px] mt-2"
          />
        </div>
      )}
    </div>
  );
};
