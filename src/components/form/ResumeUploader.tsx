import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
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
  const [uploadProgress, setUploadProgress] = useState(0);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    console.log('=== PDF EXTRACTION START ===');
    console.log('File name:', file.name);
    console.log('File size:', file.size);
    console.log('File type:', file.type);
    
    setUploadProgress(5);
    console.log('Progress set to 5%');
    
    try {
      console.log('Reading file as array buffer...');
      const arrayBuffer = await file.arrayBuffer();
      console.log('Array buffer created, size:', arrayBuffer.byteLength);
      setUploadProgress(15);
      console.log('Progress set to 15%');
      
      console.log('Loading PDF document...');
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      console.log('Loading task created');
      
      const pdf = await loadingTask.promise;
      console.log('PDF loaded successfully, pages:', pdf.numPages);
      setUploadProgress(25);
      console.log('Progress set to 25%');
      
      let extractedText = '';
      const totalPages = pdf.numPages;
      
      console.log(`Starting to process ${totalPages} pages...`);
      
      for (let i = 1; i <= totalPages; i++) {
        console.log(`=== Processing page ${i}/${totalPages} ===`);
        
        try {
          console.log(`Getting page ${i}...`);
          const page = await pdf.getPage(i);
          console.log(`Page ${i} loaded`);
          
          console.log(`Getting text content for page ${i}...`);
          const textContent = await page.getTextContent();
          console.log(`Text content loaded for page ${i}, items:`, textContent.items.length);
          
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          
          console.log(`Page ${i} text extracted, length: ${pageText.length}`);
          extractedText += pageText + '\n';
          
          // Update progress: 25% + (page progress * 65%)
          const pageProgress = (i / totalPages) * 65;
          const newProgress = 25 + pageProgress;
          setUploadProgress(newProgress);
          console.log(`Progress updated to ${newProgress}% after page ${i}`);
          
        } catch (pageError) {
          console.error(`ERROR processing page ${i}:`, pageError);
          // Continue with other pages even if one fails
        }
      }
      
      setUploadProgress(95);
      console.log('All pages processed, setting progress to 95%');
      console.log('Total extracted text length:', extractedText.length);
      console.log('First 100 chars:', extractedText.substring(0, 100));
      console.log('=== PDF EXTRACTION COMPLETE ===');
      
      return extractedText.trim();
    } catch (error) {
      console.error('=== PDF EXTRACTION ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      throw error;
    }
  };

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
      const extractedText = await extractTextFromPDF(file);
      
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
                <div className="space-y-2">
                  <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
                  <div className="text-sm text-gray-600">
                    Extracting text from PDF... {Math.round(uploadProgress)}%
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mx-auto">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
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
