
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface TextPasteAreaProps {
  resumeContent: string;
  onResumeContentChange: (content: string) => void;
}

export const TextPasteArea: React.FC<TextPasteAreaProps> = ({
  resumeContent,
  onResumeContentChange
}) => {
  return (
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
  );
};
