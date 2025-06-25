
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { extractTextFromPDFEnhanced, PDFExtractionResult } from '@/utils/enhanced-pdf-extractor';
import { UploadModeSelector } from './UploadModeSelector';
import { PDFUploadZone } from './PDFUploadZone';
import { TextPasteArea } from './TextPasteArea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

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
  const [extractionResult, setExtractionResult] = useState<PDFExtractionResult | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('=== ENHANCED FILE UPLOAD HANDLER START ===');
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected for enhanced upload:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    if (file.type !== 'application/pdf') {
      console.log('Invalid file type:', file.type);
      toast.error('Please upload a PDF file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit as per PRD
      console.log('File too large:', file.size);
      toast.error('File size must be less than 5MB.');
      return;
    }

    console.log('File validation passed, starting enhanced extraction...');
    setIsExtracting(true);
    setUploadProgress(0);
    setShowPasteRecommendation(false);
    setExtractionResult(null);
    
    try {
      console.log('Calling extractTextFromPDFEnhanced...');
      const result = await extractTextFromPDFEnhanced(file, setUploadProgress);
      
      console.log('Enhanced PDF extraction completed successfully');
      console.log('Extraction metadata:', result.metadata);
      console.log('Structured data:', result.structured);
      
      setUploadProgress(100);
      setExtractionResult(result);
      
      if (result.text.length < 50) {
        console.log('Extracted text too short:', result.text.length);
        toast.error('Could not extract readable text from this PDF. Please try pasting your resume text instead.');
        setShowPasteRecommendation(true);
        return;
      }

      console.log('Enhanced text extraction successful, updating content');
      onResumeContentChange(result.text);
      
      // Provide feedback based on extraction quality
      if (result.metadata.confidence > 0.8) {
        toast.success(`PDF processed successfully! Extracted ${result.metadata.pageCount} pages with high confidence.`);
      } else if (result.metadata.confidence > 0.6) {
        toast.success(`PDF processed with good results. Some sections may need manual review.`);
      } else {
        toast.success(`PDF processed. Consider using "Paste Text" mode for better results with complex layouts.`);
      }
      
      console.log('=== ENHANCED FILE UPLOAD HANDLER SUCCESS ===');
    } catch (error) {
      console.error('=== ENHANCED FILE UPLOAD HANDLER ERROR ===');
      console.error('Error in enhanced handleFileUpload:', error);
      
      let errorMessage = 'Failed to extract text from PDF.';
      let shouldRecommendPaste = true;
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        if (error.message.includes('Please try pasting') ||
            error.message.includes('paste your text directly')) {
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
            setExtractionResult(null);
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

      {extractionResult && uploadMode === 'upload' && resumeContent && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <div><strong>PDF Analysis Complete:</strong></div>
              <div>• Extracted {extractionResult.metadata.pageCount} pages</div>
              <div>• Confidence: {Math.round(extractionResult.metadata.confidence * 100)}%</div>
              <div>• Found: {extractionResult.structured.name !== 'Professional' ? extractionResult.structured.name : 'Resume content'}</div>
              {extractionResult.structured.sections.experience.length > 0 && (
                <div>• Experience sections: {extractionResult.structured.sections.experience.length}</div>
              )}
              {extractionResult.structured.sections.skills.length > 0 && (
                <div>• Skills identified: {extractionResult.structured.sections.skills.length}</div>
              )}
            </div>
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
