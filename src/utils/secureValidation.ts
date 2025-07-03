import DOMPurify from 'dompurify';

// Input validation utilities
export const validateInput = {
  // Text validation with length limits
  text: (input: string, maxLength: number = 1000): { isValid: boolean; sanitized: string; error?: string } => {
    if (!input || typeof input !== 'string') {
      return { isValid: false, sanitized: '', error: 'Input must be a valid string' };
    }
    
    if (input.length > maxLength) {
      return { 
        isValid: false, 
        sanitized: input.slice(0, maxLength), 
        error: `Input exceeds maximum length of ${maxLength} characters` 
      };
    }
    
    // Remove potentially dangerous characters
    const sanitized = input.trim().replace(/[<>'"&]/g, '');
    return { isValid: true, sanitized };
  },

  // URL validation with whitelist approach
  url: (input: string): { isValid: boolean; sanitized: string; error?: string } => {
    if (!input || typeof input !== 'string') {
      return { isValid: false, sanitized: '', error: 'URL must be a valid string' };
    }

    try {
      const url = new URL(input);
      
      // Whitelist allowed protocols
      const allowedProtocols = ['http:', 'https:'];
      if (!allowedProtocols.includes(url.protocol)) {
        return { 
          isValid: false, 
          sanitized: '', 
          error: 'Only HTTP and HTTPS URLs are allowed' 
        };
      }

      // Check for LinkedIn URLs specifically
      if (url.hostname !== 'linkedin.com' && url.hostname !== 'www.linkedin.com') {
        return { 
          isValid: false, 
          sanitized: '', 
          error: 'Only LinkedIn URLs are allowed' 
        };
      }

      return { isValid: true, sanitized: url.toString() };
    } catch (error) {
      return { isValid: false, sanitized: '', error: 'Invalid URL format' };
    }
  },

  // Email validation
  email: (input: string): { isValid: boolean; sanitized: string; error?: string } => {
    if (!input || typeof input !== 'string') {
      return { isValid: false, sanitized: '', error: 'Email must be a valid string' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitized = input.trim().toLowerCase();
    
    if (!emailRegex.test(sanitized)) {
      return { isValid: false, sanitized: '', error: 'Invalid email format' };
    }

    if (sanitized.length > 254) {
      return { isValid: false, sanitized: '', error: 'Email address too long' };
    }

    return { isValid: true, sanitized };
  },

  // File validation for PDF uploads
  file: (file: File): { isValid: boolean; error?: string } => {
    if (!file) {
      return { isValid: false, error: 'No file provided' };
    }

    // Check file type
    const allowedTypes = ['application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return { 
        isValid: false, 
        error: 'Only PDF files are allowed' 
      };
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { 
        isValid: false, 
        error: 'File size must be less than 10MB' 
      };
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.pdf')) {
      return { 
        isValid: false, 
        error: 'File must have .pdf extension' 
      };
    }

    return { isValid: true };
  }
};

// XSS prevention utilities
export const sanitizeHtml = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Configure DOMPurify for strict sanitization
  const config = {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false
  };

  return DOMPurify.sanitize(input, config);
};

export const sanitizeText = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Content Security Policy helpers
export const generateNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Rate limiting utilities
export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, number[]>();

  return (identifier: string): boolean => {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get existing requests for this identifier
    const userRequests = requests.get(identifier) || [];
    
    // Filter out requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart);
    
    // Check if limit exceeded
    if (validRequests.length >= maxRequests) {
      return false;
    }

    // Add current request
    validRequests.push(now);
    requests.set(identifier, validRequests);

    // Cleanup old entries periodically
    if (Math.random() < 0.01) { // 1% chance
      for (const [key, times] of requests.entries()) {
        const validTimes = times.filter(time => time > windowStart);
        if (validTimes.length === 0) {
          requests.delete(key);
        } else {
          requests.set(key, validTimes);
        }
      }
    }

    return true;
  };
};

// Secure token utilities
export const maskToken = (token: string): string => {
  if (!token || token.length < 8) return '****';
  return token.slice(0, 4) + '*'.repeat(token.length - 8) + token.slice(-4);
};

export const generateSecureId = (): string => {
  return crypto.randomUUID();
};

// Password validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};