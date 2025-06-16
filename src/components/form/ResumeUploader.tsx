
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { extractTextFromPDF } from '@/utils/pdfExtractor';
import { UploadModeSelector } from './UploadModeSelector';
import { PDFUploadZone } from './PDFUploadZone';
import { TextPasteArea } from './TextPasteArea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Info } from 'lucide-react';

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
  const [showPasteRecommendation, setShowPasteRecommendation] = useState(false);
  const [usedFallbackMode, setUsedFallbackMode] = useState(false);

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
      size: file.size
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
    setShowPasteRecommendation(false);
    setUsedFallbackMode(false);
    
    try {
      console.log('Calling extractTextFromPDF...');
      const extractedText = await extractTextFromPDF(file, setUploadProgress);
      
      console.log('PDF extraction completed successfully');
      setUploadProgress(100);
      
      if (extractedText.length < 50) {
        console.log('Extracted text too short:', extractedText.length);
        toast.error('Could not extract readable text from this PDF. Please try pasting your resume text instead.');
        setShowPasteRecommendation(true);
        return;
      }

      console.log('Text extraction successful, updating content');
      onResumeContentChange(extractedText);
      
      // Check if fallback mode was used (simplified detection)
      if (extractedText.length > 0 && extractedText.length < 2000) {
        setUsedFallbackMode(true);
        toast.success('PDF text extracted using simplified mode. For better results with complex PDFs, try pasting the text directly.');
      } else {
        toast.success('PDF text extracted successfully!');
      }
      
      console.log('=== FILE UPLOAD HANDLER SUCCESS ===');
    } catch (error) {
      console.error('=== FILE UPLOAD HANDLER ERROR ===');
      console.error('Error in handleFileUpload:', error);
      
      let errorMessage = 'Failed to extract text from PDF.';
      let shouldRecommendPaste = true;
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Check for specific error types that suggest paste mode
        if (error.message.includes('Please try pasting') ||
            error.message.includes('paste your text directly')) {
          shouldRecommendPaste = true;
        } else if (error.message.includes('Worker loading failure') ||
                   error.message.includes('Setting up fake worker failed')) {
          errorMessage = 'PDF processing encountered technical difficulties. Please try pasting your text directly for best results.';
          shouldRecommendPaste = true;
        }
      }
      
      toast.error(errorMessage);
      
      if (shouldRecommendPaste) {
        setShowPasteRecommendation(true);
      }
      
      setUploadProgress(0);
    } finally {
      console.log('Cleaning up...');
      setIsExtracting(false);
      event.target.value = '';
      
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
        onModeChange={(mode) => {
          setUploadMode(mode);
          if (mode === 'paste') {
            setShowPasteRecommendation(false);
          }
        }} 
      />

      {showPasteRecommendation && uploadMode === 'upload' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Having trouble with PDF upload? Try switching to "Paste Text" mode above for more reliable results.
          </AlertDescription>
        </Alert>
      )}

      {usedFallbackMode && uploadMode === 'upload' && resumeContent && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            PDF processed in simplified mode (limited to first 5 pages). For complex PDFs or better accuracy, consider using "Paste Text" mode.
          </AlertDescription>
        </Alert>
      )}

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
