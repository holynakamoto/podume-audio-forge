
import React from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText } from 'lucide-react';

interface UploadModeSelectorProps {
  uploadMode: 'upload' | 'paste';
  onModeChange: (mode: 'upload' | 'paste') => void;
}

export const UploadModeSelector: React.FC<UploadModeSelectorProps> = ({
  uploadMode,
  onModeChange
}) => {
  return (
    <div className="flex gap-2 mb-4">
      <Button
        type="button"
        variant={uploadMode === 'upload' ? 'default' : 'outline'}
        onClick={() => onModeChange('upload')}
        size="sm"
      >
        <UploadCloud className="w-4 h-4 mr-2" />
        Upload PDF
      </Button>
      <Button
        type="button"
        variant={uploadMode === 'paste' ? 'default' : 'outline'}
        onClick={() => onModeChange('paste')}
        size="sm"
      >
        <FileText className="w-4 h-4 mr-2" />
        Paste Text
      </Button>
    </div>
  );
};
