
import { validateFileType, validateFileSize, logSecurityEvent } from './security';
import { validateInput } from './secureValidation';

const ALLOWED_PDF_TYPES = ['application/pdf'];
const MAX_PDF_SIZE_MB = 10;

export const validatePDFUpload = async (file: File): Promise<{ isValid: boolean; error?: string }> => {
  // Use secure validation first
  const secureResult = validateInput.file(file);
  if (!secureResult.isValid) {
    logSecurityEvent('file_validation_failed', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      error: secureResult.error
    });
    return {
      isValid: false,
      error: secureResult.error
    };
  }

  // Check file type
  if (!validateFileType(file, ALLOWED_PDF_TYPES)) {
    logSecurityEvent('invalid_file_type', {
      fileName: file.name,
      fileType: file.type,
      expected: ALLOWED_PDF_TYPES
    });
    return {
      isValid: false,
      error: 'Please upload a valid PDF file'
    };
  }

  // Check file size
  if (!validateFileSize(file, MAX_PDF_SIZE_MB)) {
    logSecurityEvent('file_size_exceeded', {
      fileName: file.name,
      fileSize: file.size,
      maxAllowed: MAX_PDF_SIZE_MB * 1024 * 1024
    });
    return {
      isValid: false,
      error: `File size must be less than ${MAX_PDF_SIZE_MB}MB`
    };
  }

  // Enhanced PDF header validation with security checks
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!arrayBuffer || arrayBuffer.byteLength < 8) {
          resolve({
            isValid: false,
            error: 'File appears to be corrupted or too small'
          });
          return;
        }
        
        const uint8Array = new Uint8Array(arrayBuffer.slice(0, 8));
        
        // Check PDF magic number (%PDF)
        const pdfSignature = [0x25, 0x50, 0x44, 0x46]; // %PDF
        const isPDF = pdfSignature.every((byte, index) => uint8Array[index] === byte);
        
        // Additional security check for suspicious file headers
        const suspiciousHeaders = [
          [0x4D, 0x5A], // MZ (executable)
          [0x50, 0x4B], // PK (zip/office docs trying to masquerade)
        ];
        
        const hasSuspiciousHeader = suspiciousHeaders.some(header => 
          header.every((byte, index) => uint8Array[index] === byte)
        );
        
        if (hasSuspiciousHeader) {
          logSecurityEvent('suspicious_file_header', {
            fileName: file.name,
            fileType: file.type,
            header: Array.from(uint8Array.slice(0, 4))
          });
          resolve({
            isValid: false,
            error: 'File type not allowed for security reasons'
          });
          return;
        }
        
        if (!isPDF) {
          logSecurityEvent('invalid_pdf_header', {
            fileName: file.name,
            fileType: file.type,
            header: Array.from(uint8Array)
          });
          resolve({
            isValid: false,
            error: 'File does not appear to be a valid PDF'
          });
        } else {
          resolve({ isValid: true });
        }
      } catch (error) {
        logSecurityEvent('file_validation_error', {
          fileName: file.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        resolve({
          isValid: false,
          error: 'Failed to validate file'
        });
      }
    };
    
    reader.onerror = () => {
      logSecurityEvent('file_read_error', {
        fileName: file.name,
        fileType: file.type
      });
      resolve({
        isValid: false,
        error: 'Failed to read file'
      });
    };
    
    reader.readAsArrayBuffer(file.slice(0, 8));
  });
};

export const sanitizeFileName = (fileName: string): string => {
  if (!fileName || typeof fileName !== 'string') {
    return 'unnamed_file';
  }
  
  // Enhanced sanitization with security checks
  const result = validateInput.text(fileName, 255);
  
  return result.sanitized
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^[._-]+/, '') // Remove leading dots/underscores/dashes
    .replace(/[._-]+$/, '') // Remove trailing dots/underscores/dashes
    .substring(0, 100) || 'file'; // Ensure we always have a name
};
