
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      return fullText.trim();
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB.');
      return;
    }

    setIsExtracting(true);
    try {
      const extractedText = await extractTextFromPDF(file);
      if (extractedText) {
        onResumeContentChange(extractedText);
        toast.success('Resume text extracted successfully!');
      } else {
        toast.error('No text found in the PDF. Please try pasting the text instead.');
      }
    } catch (error) {
      console.error('PDF extraction error:', error);
      toast.error('Failed to extract text from PDF. Please try pasting the text instead.');
    } finally {
      setIsExtracting(false);
      // Clear the input so the same file can be uploaded again if needed
      event.target.value = '';
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
                  <span>{isExtracting ? 'Extracting text...' : 'Upload a PDF file'}</span>
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
