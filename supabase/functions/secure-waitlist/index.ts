
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

interface WaitlistRequest {
  email: string;
  source?: string;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

function sanitizeInput(input: string): string {
  return input.trim().toLowerCase();
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: WaitlistRequest = await req.json();
    
    if (!body.email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
      });
    }

    const sanitizedEmail = sanitizeInput(body.email);
    
    if (!validateEmail(sanitizedEmail)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check for existing email
    const { data: existing } = await supabase
      .from('waitlist_emails')
      .select('email')
      .eq('email', sanitizedEmail)
      .single();

    if (existing) {
      return new Response(JSON.stringify({ error: 'Email already registered' }), {
        status: 409,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Insert new email
    const { error } = await supabase
      .from('waitlist_emails')
      .insert({
        email: sanitizedEmail,
        source: body.source || 'website',
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Database error:', error);
      return new Response(JSON.stringify({ error: 'Failed to register email' }), {
        status: 500,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Log security event
    await supabase.from('security_audit_log').insert({
      event_type: 'waitlist_signup',
      event_data: { email: sanitizedEmail, source: body.source },
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent')
    });

    return new Response(JSON.stringify({ success: true, message: 'Email registered successfully' }), {
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
