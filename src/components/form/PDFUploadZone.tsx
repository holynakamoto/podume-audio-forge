
import React from 'react';
import { Input } from '@/components/ui/input';
import { UploadCloud, Loader2 } from 'lucide-react';

interface PDFUploadZoneProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isExtracting: boolean;
  uploadProgress: number;
}

export const PDFUploadZone: React.FC<PDFUploadZoneProps> = ({
  onFileUpload,
  isExtracting,
  uploadProgress
}) => {
  return (
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
              onChange={onFileUpload}
              accept=".pdf"
              disabled={isExtracting}
            />
          </label>
          <p className="pl-1">or drag and drop</p>
        </div>
        <p className="text-xs leading-5 text-gray-400">PDF up to 10MB</p>
      </div>
    </div>
  );
};
