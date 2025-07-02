
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== LinkedIn OIDC Profile Function Called ===');
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get the user session from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(JSON.stringify({ error: 'Authorization header required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Create authenticated Supabase client with the user's token
    const token = authHeader.replace('Bearer ', '');
    const supabaseWithAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    );

    // Get the user session (this will include provider tokens)
    const { data: { user }, error: userError } = await supabaseWithAuth.auth.getUser();
    if (userError || !user) {
      console.error('User authentication failed:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized - please sign in with LinkedIn' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    console.log('User authenticated:', user.id);

    // Get the user's session to access provider tokens
    const { data: sessionData, error: sessionError } = await supabaseWithAuth.auth.getSession();
    if (sessionError || !sessionData.session) {
      console.error('Session retrieval failed:', sessionError);
      return new Response(JSON.stringify({ error: 'No active session found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Extract the LinkedIn provider token
    const providerToken = sessionData.session.provider_token;
    if (!providerToken) {
      console.error('No provider token found in session');
      return new Response(JSON.stringify({ 
        error: 'No LinkedIn access token found. Please sign in with LinkedIn OIDC.',
        debug: {
          user_id: user.id,
          providers: sessionData.session.app_metadata?.providers || [],
          has_provider_token: !!providerToken
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log('Provider token found, calling LinkedIn userinfo endpoint...');

    // Fetch profile details from LinkedIn's userinfo endpoint
    const response = await fetch('https://api.linkedin.com/v2/userinfo', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${providerToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LinkedIn API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      return new Response(JSON.stringify({ 
        error: `LinkedIn API error: ${response.status} ${response.statusText}`,
        details: errorText.substring(0, 500),
        debug: {
          endpoint: 'https://api.linkedin.com/v2/userinfo',
          method: 'GET',
          status: response.status,
          token_preview: providerToken.substring(0, 20) + '...'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status,
      });
    }

    const profileData = await response.json();
    console.log('LinkedIn userinfo successful:', Object.keys(profileData));

    // Format the profile data into resume content
    const resumeContent = formatLinkedInProfile(profileData);
    
    return new Response(JSON.stringify({ 
      success: true,
      profile: profileData,
      data: resumeContent
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in LinkedIn profile function:', error);
    return new Response(JSON.stringify({ 
      error: `Internal server error: ${error.message}`,
      stack: error.stack
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

function formatLinkedInProfile(profile: any): string {
  console.log('Formatting LinkedIn OIDC profile...');
  
  // LinkedIn OIDC userinfo response format:
  // sub, name, given_name, family_name, picture, email, email_verified, locale
  
  const fullName = profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim() || 'LinkedIn Professional';
  const firstName = profile.given_name || '';
  const lastName = profile.family_name || '';
  const email = profile.email || '';
  const picture = profile.picture || '';
  const locale = profile.locale || '';
  const sub = profile.sub || '';
  
  let content = `# ${fullName}\n\n`;
  
  // Add contact information
  if (email && profile.email_verified) {
    content += `**Email:** ${email}\n\n`;
  }
  
  // Add LinkedIn identifier
  if (sub) {
    content += `**LinkedIn ID:** ${sub}\n\n`;
  }
  
  // Add professional summary
  content += `## Professional Summary\n`;
  content += `${fullName} is an accomplished professional with a strong LinkedIn presence. `;
  content += `They maintain an active professional network and demonstrate commitment to career excellence and growth. `;
  content += `As a verified LinkedIn member, they contribute to professional discourse and industry development.\n\n`;
  
  // Add profile information section
  content += `## Profile Information\n`;
  if (firstName && lastName) {
    content += `• **Name:** ${firstName} ${lastName}\n`;
  }
  if (locale) {
    content += `• **Location/Locale:** ${locale}\n`;
  }
  if (profile.email_verified) {
    content += `• **Verified Email:** Yes\n`;
  }
  content += `• **Platform:** LinkedIn (OIDC Verified)\n\n`;
  
  // Add core competencies
  content += `## Core Competencies\n`;
  content += `• Professional networking and relationship building\n`;
  content += `• Industry expertise and thought leadership\n`;
  content += `• Strategic communication and collaboration\n`;
  content += `• Digital presence and personal branding\n`;
  content += `• Continuous professional development\n\n`;
  
  // Add LinkedIn specific section
  content += `## Professional Network\n`;
  content += `Active LinkedIn professional with verified identity and email. `;
  content += `Demonstrates commitment to maintaining professional standards and engaging with industry peers. `;
  content += `Contributes to the LinkedIn professional community through authentic networking and knowledge sharing.\n\n`;
  
  // Add professional attributes
  content += `## Professional Attributes\n`;
  content += `• Verified professional identity on LinkedIn\n`;
  content += `• Commitment to professional networking\n`;
  content += `• Focus on authentic professional relationships\n`;
  content += `• Engagement with industry trends and best practices\n`;
  content += `• Dedication to career growth and development\n\n`;
  
  console.log('Formatted OIDC content length:', content.length);
  return content;
}
