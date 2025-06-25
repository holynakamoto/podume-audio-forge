
import type { FileDebugInfo } from './types';

export const debugPDFFile = async (file: File): Promise<FileDebugInfo> => {
  const arrayBuffer = await file.arrayBuffer();
  const header = new Uint8Array(arrayBuffer.slice(0, 10));
  
  return {
    headerAnalysis: {
      isPDF: header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46,
      detectedType: header[0] === 0x25 && header[1] === 0x50 ? 'PDF' :
                   header[0] === 0x50 && header[1] === 0x4B ? 'ZIP/Office document' :
                   header[0] === 0xFF && header[1] === 0xD8 ? 'JPEG image' : 'Unknown'
    }
  };
};

export const logPDFError = (error: Error, context: string, debugInfo?: any) => {
  console.error(`PDF Error in ${context}:`, error.message);
  if (debugInfo) {
    console.error('Debug info:', debugInfo);
  }
};

export const validatePDFFile = (arrayBuffer: ArrayBuffer, debugInfo: FileDebugInfo) => {
  // Enhanced validation using debug info
  if (!debugInfo.headerAnalysis.isPDF) {
    const errorMessage = `Invalid file type detected: ${debugInfo.headerAnalysis.detectedType}. Please upload a valid PDF file.`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  // Basic file size validation
  if (arrayBuffer.byteLength === 0) {
    throw new Error('The uploaded file appears to be empty. Please try uploading a different PDF file.');
  }

  if (arrayBuffer.byteLength < 100) {
    throw new Error('The file is too small to be a valid PDF. Please check your file and try again.');
  }
};
