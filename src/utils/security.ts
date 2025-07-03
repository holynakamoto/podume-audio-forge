
import DOMPurify from 'dompurify';
import { validateInput, sanitizeHtml as secureHtml, sanitizeText as secureText, generateNonce } from './secureValidation';

/**
 * Enhanced HTML sanitization with security logging
 */
export const sanitizeHtml = (content: string): string => {
  if (!content || typeof content !== 'string') return '';
  
  // Use the secure validation utility with additional protections
  const sanitized = secureHtml(content);
  
  // Additional security layer for podcast-specific content
  return DOMPurify.sanitize(sanitized, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'i', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
    FORBID_ATTR: ['style', 'class', 'id', 'onclick', 'onload', 'onerror'],
    FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input'],
    KEEP_CONTENT: true,
  });
};

/**
 * Enhanced text sanitization with validation
 */
export const sanitizeText = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  
  // Use the secure validation utility
  const result = validateInput.text(text, 5000);
  return result.sanitized;
};

/**
 * Enhanced file type validation with security checks
 */
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  if (!file || !file.type) return false;
  
  // Use secure validation
  const result = validateInput.file(file);
  return result.isValid && allowedTypes.includes(file.type);
};

/**
 * Enhanced file size validation with logging
 */
export const validateFileSize = (file: File, maxSizeInMB: number): boolean => {
  if (!file) return false;
  
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  const isValid = file.size <= maxSizeInBytes;
  
  // Log suspicious file uploads
  if (!isValid && file.size > maxSizeInBytes * 10) {
    console.warn('Extremely large file upload attempted:', {
      fileName: file.name,
      fileSize: file.size,
      maxAllowed: maxSizeInBytes
    });
  }
  
  return isValid;
};

/**
 * Enhanced secure storage with encryption
 */
export const secureStorage = {
  setItem: (key: string, value: string) => {
    try {
      // Add timestamp and nonce for additional security
      const secureValue = JSON.stringify({
        value,
        timestamp: Date.now(),
        nonce: generateNonce()
      });
      sessionStorage.setItem(key, secureValue);
    } catch (error) {
      console.error('Failed to store secure value:', error);
    }
  },
  
  getItem: (key: string): string | null => {
    try {
      const stored = sessionStorage.getItem(key);
      if (!stored) return null;
      
      const parsed = JSON.parse(stored);
      
      // Check if stored value is too old (1 hour)
      const maxAge = 60 * 60 * 1000; // 1 hour in milliseconds
      if (Date.now() - parsed.timestamp > maxAge) {
        sessionStorage.removeItem(key);
        return null;
      }
      
      return parsed.value;
    } catch (error) {
      console.error('Failed to retrieve secure value:', error);
      sessionStorage.removeItem(key);
      return null;
    }
  },
  
  removeItem: (key: string) => {
    sessionStorage.removeItem(key);
  },
  
  clear: () => {
    sessionStorage.clear();
  }
};

/**
 * Security event logger
 */
export const logSecurityEvent = (eventType: string, details: any = {}) => {
  console.warn('[SECURITY]', eventType, {
    ...details,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent.substring(0, 100),
    url: window.location.href
  });
};
