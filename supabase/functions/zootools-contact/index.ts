
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for this function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Security headers
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https:; media-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'X-XSS-Protection': '1; mode=block'
};

const ZOOTOOLS_API_KEY = Deno.env.get('ZOOTOOLS_API_KEY');

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: { ...corsHeaders, ...securityHeaders } 
    });
  }

  try {
    console.log('ZooTools contact function called');
    
    if (!ZOOTOOLS_API_KEY) {
      console.error('ZOOTOOLS_API_KEY not configured');
      return new Response(JSON.stringify({ 
        error: 'Service configuration error',
        details: 'Contact service is not properly configured'
      }), {
        status: 500,
        headers: { 
          ...corsHeaders, 
          ...securityHeaders,
          'Content-Type': 'application/json'
        },
      });
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(JSON.stringify({ 
        error: 'Invalid request format',
        details: 'Request body must be valid JSON'
      }), {
        status: 400,
        headers: { 
          ...corsHeaders, 
          ...securityHeaders,
          'Content-Type': 'application/json'
        },
      });
    }

    // Validate required fields
    const { email, name, message } = body;
    if (!email || !name || !message) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields',
        details: 'Email, name, and message are required'
      }), {
        status: 400,
        headers: { 
          ...corsHeaders, 
          ...securityHeaders,
          'Content-Type': 'application/json'
        },
      });
    }

    // Sanitize inputs
    const sanitizedData = {
      email: email.trim(),
      name: name.trim(),
      message: message.trim(),
    };

    // Call ZooTools API
    const response = await fetch('https://api.zootools.co/v1/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ZOOTOOLS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sanitizedData),
    });

    if (!response.ok) {
      console.error('ZooTools API error:', response.status, response.statusText);
      return new Response(JSON.stringify({ 
        error: 'Contact service error',
        details: 'Failed to submit contact form'
      }), {
        status: 500,
        headers: { 
          ...corsHeaders, 
          ...securityHeaders,
          'Content-Type': 'application/json'
        },
      });
    }

    const result = await response.json();
    console.log('ZooTools contact submitted successfully');

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Contact form submitted successfully'
    }), {
      headers: { 
        ...corsHeaders, 
        ...securityHeaders,
        'Content-Type': 'application/json'
      },
    });

  } catch (error) {
    console.error('ZooTools contact function error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: 'An unexpected error occurred'
    }), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        ...securityHeaders,
        'Content-Type': 'application/json'
      },
    });
  }
});
