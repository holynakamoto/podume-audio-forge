
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { extractTextFromPDF } from '@/utils/pdfExtractor';
import { UploadModeSelector } from './UploadModeSelector';
import { PDFUploadZone } from './PDFUploadZone';
import { TextPasteArea } from './TextPasteArea';

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
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('=== FILE UPLOAD HANDLER START ===');
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected for upload:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    });

    if (file.type !== 'application/pdf') {
      console.log('Invalid file type:', file.type);
      toast.error('Please upload a PDF file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      console.log('File too large:', file.size);
      toast.error('File size must be less than 10MB.');
      return;
    }

    console.log('File validation passed, starting extraction...');
    setIsExtracting(true);
    setUploadProgress(0);
    
    try {
      console.log('Calling extractTextFromPDF...');
      const extractedText = await extractTextFromPDF(file, setUploadProgress);
      
      console.log('PDF extraction completed successfully');
      setUploadProgress(100);
      
      if (extractedText.length < 10) {
        console.log('Extracted text too short:', extractedText.length);
        toast.error('Could not extract readable text from this PDF. Please try a different file or paste your resume text manually.');
        return;
      }

      console.log('Text extraction successful, updating content');
      onResumeContentChange(extractedText);
      
      toast.success('PDF text extracted successfully!');
      console.log('=== FILE UPLOAD HANDLER SUCCESS ===');
    } catch (error) {
      console.error('=== FILE UPLOAD HANDLER ERROR ===');
      console.error('Error in handleFileUpload:', error);
      toast.error('Failed to extract text from PDF. Please try pasting your resume text instead.');
      setUploadProgress(0);
    } finally {
      console.log('Cleaning up...');
      setIsExtracting(false);
      // Clear the input so the same file can be uploaded again if needed
      event.target.value = '';
      
      // Reset progress after a short delay
      setTimeout(() => {
        console.log('Resetting progress to 0');
        setUploadProgress(0);
      }, 2000);
    }
  };

  return (
    <div className="space-y-4">
      <UploadModeSelector 
        uploadMode={uploadMode} 
        onModeChange={setUploadMode} 
      />

      {uploadMode === 'upload' ? (
        <div>
          <Label htmlFor="resume-upload" className="font-semibold">Upload Your Resume (PDF)</Label>
          <PDFUploadZone 
            onFileUpload={handleFileUpload}
            isExtracting={isExtracting}
            uploadProgress={uploadProgress}
          />
        </div>
      ) : (
        <TextPasteArea 
          resumeContent={resumeContent}
          onResumeContentChange={onResumeContentChange}
        />
      )}
    </div>
  );
};
