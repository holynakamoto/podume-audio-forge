
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Type, Globe } from 'lucide-react';

interface UploadModeSelectorProps {
  uploadMode: 'upload' | 'paste' | 'url';
  onModeChange: (mode: 'upload' | 'paste' | 'url') => void;
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
        className="flex-1"
      >
        <Upload className="w-4 h-4 mr-2" />
        Upload PDF
      </Button>
      <Button
        type="button"
        variant={uploadMode === 'url' ? 'default' : 'outline'}
        onClick={() => onModeChange('url')}
        className="flex-1"
      >
        <Globe className="w-4 h-4 mr-2" />
        Extract from URL
      </Button>
      <Button
        type="button"
        variant={uploadMode === 'paste' ? 'default' : 'outline'}
        onClick={() => onModeChange('paste')}
        className="flex-1"
      >
        <Type className="w-4 h-4 mr-2" />
        Paste Text
      </Button>
    </div>
  );
};
