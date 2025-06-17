
import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (content: string): string => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'i', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  });
};

/**
 * Validates and sanitizes text input
 */
export const sanitizeText = (text: string): string => {
  return text.trim().replace(/[<>]/g, '');
};

/**
 * Validates file types for uploads
 */
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

/**
 * Validates file size
 */
export const validateFileSize = (file: File, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

/**
 * Secure storage for sensitive data (replaces localStorage for API keys)
 */
export const secureStorage = {
  setItem: (key: string, value: string) => {
    // Use sessionStorage for temporary API keys instead of localStorage
    sessionStorage.setItem(key, value);
  },
  
  getItem: (key: string): string | null => {
    return sessionStorage.getItem(key);
  },
  
  removeItem: (key: string) => {
    sessionStorage.removeItem(key);
  },
  
  clear: () => {
    sessionStorage.clear();
  }
};
