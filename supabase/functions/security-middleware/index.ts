import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(identifier);

    if (!entry || now > entry.resetTime) {
      // New window or expired
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }

    if (entry.count >= this.maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

const rateLimiter = new RateLimiter(100, 60 * 1000); // 100 requests per minute

// Security event logging
async function logSecurityEvent(
  supabase: any,
  eventType: string,
  userId: string | null,
  details: any,
  riskLevel: 'low' | 'medium' | 'high' = 'low',
  req?: Request
) {
  try {
    const ipAddress = req?.headers.get('x-forwarded-for') || 
                     req?.headers.get('x-real-ip') || 
                     'unknown';
    
    const userAgent = req?.headers.get('user-agent') || 'unknown';

    await supabase.rpc('log_security_event', {
      p_event_type: eventType,
      p_user_id: userId,
      p_event_data: details,
      p_risk_level: riskLevel,
      p_ip_address: ipAddress,
      p_user_agent: userAgent
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// Input validation functions
function validateInput(input: any, type: 'string' | 'number' | 'email' | 'url', maxLength?: number): { isValid: boolean; sanitized?: any; error?: string } {
  if (input === null || input === undefined) {
    return { isValid: false, error: 'Input is required' };
  }

  switch (type) {
    case 'string':
      if (typeof input !== 'string') {
        return { isValid: false, error: 'Input must be a string' };
      }
      if (maxLength && input.length > maxLength) {
        return { isValid: false, error: `Input exceeds maximum length of ${maxLength}` };
      }
      // Remove potentially dangerous characters
      const sanitized = input.trim().replace(/[<>'"&]/g, '');
      return { isValid: true, sanitized };

    case 'email':
      if (typeof input !== 'string') {
        return { isValid: false, error: 'Email must be a string' };
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const cleanEmail = input.trim().toLowerCase();
      if (!emailRegex.test(cleanEmail)) {
        return { isValid: false, error: 'Invalid email format' };
      }
      return { isValid: true, sanitized: cleanEmail };

    case 'url':
      if (typeof input !== 'string') {
        return { isValid: false, error: 'URL must be a string' };
      }
      try {
        const url = new URL(input);
        if (!['http:', 'https:'].includes(url.protocol)) {
          return { isValid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
        }
        return { isValid: true, sanitized: url.toString() };
      } catch {
        return { isValid: false, error: 'Invalid URL format' };
      }

    default:
      return { isValid: false, error: 'Unknown validation type' };
  }
}

// Content Security Policy headers
function getSecurityHeaders(): Record<string, string> {
  return {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.openai.com https://api.elevenlabs.io;",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'microphone=(), camera=(), geolocation=()',
    ...corsHeaders
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getSecurityHeaders() });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Extract request information
    const url = new URL(req.url);
    const ipAddress = req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Rate limiting
    const identifier = ipAddress;
    if (!rateLimiter.isAllowed(identifier)) {
      await logSecurityEvent(
        supabase,
        'rate_limit_exceeded',
        null,
        { ipAddress, userAgent, endpoint: url.pathname },
        'medium',
        req
      );
      
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded. Please try again later.' 
      }), {
        status: 429,
        headers: getSecurityHeaders()
      });
    }

    // Cleanup rate limiter periodically
    if (Math.random() < 0.01) { // 1% chance
      rateLimiter.cleanup();
    }

    // Extract and validate authentication
    const authHeader = req.headers.get('authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      try {
        const { data: { user } } = await supabase.auth.getUser(
          authHeader.replace('Bearer ', '')
        );
        userId = user?.id || null;
      } catch (error) {
        // Invalid token - log but don't block
        await logSecurityEvent(
          supabase,
          'invalid_auth_token',
          null,
          { error: error instanceof Error ? error.message : 'Unknown' },
          'medium',
          req
        );
      }
    }

    // Validate request body if present
    let validatedBody: any = null;
    if (req.method === 'POST' && req.headers.get('content-type')?.includes('application/json')) {
      try {
        const body = await req.json();
        
        // Basic validation - extend as needed
        if (body && typeof body === 'object') {
          // Validate common fields
          if (body.title) {
            const titleValidation = validateInput(body.title, 'string', 200);
            if (!titleValidation.isValid) {
              return new Response(JSON.stringify({ 
                error: 'Invalid title: ' + titleValidation.error 
              }), {
                status: 400,
                headers: getSecurityHeaders()
              });
            }
            body.title = titleValidation.sanitized;
          }

          if (body.email) {
            const emailValidation = validateInput(body.email, 'email');
            if (!emailValidation.isValid) {
              return new Response(JSON.stringify({ 
                error: 'Invalid email: ' + emailValidation.error 
              }), {
                status: 400,
                headers: getSecurityHeaders()
              });
            }
            body.email = emailValidation.sanitized;
          }

          if (body.url) {
            const urlValidation = validateInput(body.url, 'url');
            if (!urlValidation.isValid) {
              return new Response(JSON.stringify({ 
                error: 'Invalid URL: ' + urlValidation.error 
              }), {
                status: 400,
                headers: getSecurityHeaders()
              });
            }
            body.url = urlValidation.sanitized;
          }
        }
        
        validatedBody = body;
      } catch (error) {
        await logSecurityEvent(
          supabase,
          'invalid_json_payload',
          userId,
          { error: error instanceof Error ? error.message : 'Unknown' },
          'low',
          req
        );
        
        return new Response(JSON.stringify({ 
          error: 'Invalid JSON payload' 
        }), {
          status: 400,
          headers: getSecurityHeaders()
        });
      }
    }

    // Log successful validation
    await logSecurityEvent(
      supabase,
      'request_validated',
      userId,
      {
        method: req.method,
        endpoint: url.pathname,
        hasAuth: !!authHeader,
        bodySize: validatedBody ? JSON.stringify(validatedBody).length : 0
      },
      'low',
      req
    );

    // Return success with security headers
    return new Response(JSON.stringify({
      success: true,
      message: 'Security validation passed',
      data: {
        userId,
        validatedBody,
        timestamp: new Date().toISOString()
      }
    }), {
      headers: getSecurityHeaders()
    });

  } catch (error) {
    console.error('Security middleware error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal security error' 
    }), {
      status: 500,
      headers: getSecurityHeaders()
    });
  }
});