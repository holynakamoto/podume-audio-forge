import React from 'react';

interface TranscriptDisplayProps {
  transcript: string;
}

export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ transcript }) => {
  if (!transcript) return null;

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
      <h3 className="font-semibold text-gray-900 mb-3">Generated Transcript (Troubleshooting)</h3>
      <div className="max-h-96 overflow-y-auto">
        <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
          {transcript}
        </pre>
      </div>
    </div>
  );
};