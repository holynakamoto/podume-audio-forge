
import { validateFileType, validateFileSize } from './security';

const ALLOWED_PDF_TYPES = ['application/pdf'];
const MAX_PDF_SIZE_MB = 10;

export const validatePDFUpload = async (file: File): Promise<{ isValid: boolean; error?: string }> => {
  // Check file type
  if (!validateFileType(file, ALLOWED_PDF_TYPES)) {
    return {
      isValid: false,
      error: 'Please upload a valid PDF file'
    };
  }

  // Check file size
  if (!validateFileSize(file, MAX_PDF_SIZE_MB)) {
    return {
      isValid: false,
      error: `File size must be less than ${MAX_PDF_SIZE_MB}MB`
    };
  }

  // Additional PDF header validation
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const uint8Array = new Uint8Array(arrayBuffer.slice(0, 8));
      
      // Check PDF magic number (%PDF)
      const pdfSignature = [0x25, 0x50, 0x44, 0x46]; // %PDF
      const isPDF = pdfSignature.every((byte, index) => uint8Array[index] === byte);
      
      if (!isPDF) {
        resolve({
          isValid: false,
          error: 'File does not appear to be a valid PDF'
        });
      } else {
        resolve({ isValid: true });
      }
    };
    
    reader.onerror = () => {
      resolve({
        isValid: false,
        error: 'Failed to validate file'
      });
    };
    
    reader.readAsArrayBuffer(file.slice(0, 8));
  });
};

export const sanitizeFileName = (fileName: string): string => {
  // Remove potentially dangerous characters
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 100); // Limit length
};
