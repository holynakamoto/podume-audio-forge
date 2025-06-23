
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

interface ContactRequest {
  email: string;
  message: string;
  name?: string;
}

function validateInput(data: ContactRequest): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email is required');
  }
  
  if (!data.message || data.message.trim().length < 10) {
    errors.push('Message must be at least 10 characters');
  }
  
  if (data.message && data.message.length > 1000) {
    errors.push('Message cannot exceed 1000 characters');
  }
  
  if (data.name && data.name.length > 100) {
    errors.push('Name cannot exceed 100 characters');
  }
  
  return { isValid: errors.length === 0, errors };
}

function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { ...corsHeaders, ...securityHeaders } });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const zooToolsApiKey = Deno.env.get('ZOOTOOLS_API_KEY');
    if (!zooToolsApiKey) {
      console.error('ZooTools API key not configured');
      return new Response(JSON.stringify({ error: 'Service configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body: ContactRequest = await req.json();
    const validation = validateInput(body);
    
    if (!validation.isValid) {
      return new Response(JSON.stringify({ error: 'Validation failed', details: validation.errors }), {
        status: 400,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
      });
    }

    const sanitizedData = {
      email: sanitizeInput(body.email),
      message: sanitizeInput(body.message),
      name: body.name ? sanitizeInput(body.name) : undefined
    };

    // Forward to ZooTools API
    const zooToolsResponse = await fetch('https://api.zootools.co/v1/contact', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${zooToolsApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sanitizedData)
    });

    if (!zooToolsResponse.ok) {
      console.error('ZooTools API error:', zooToolsResponse.status);
      return new Response(JSON.stringify({ error: 'Failed to submit contact form' }), {
        status: 500,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Contact form submitted successfully' }), {
      status: 200,
      headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
    });
  }
});
