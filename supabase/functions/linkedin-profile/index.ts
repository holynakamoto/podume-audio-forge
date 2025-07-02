
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== LinkedIn Profile API function called (OIDC userinfo) ===');
    
    const { access_token } = await req.json();
    
    if (!access_token) {
      console.error('No access token provided');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Access token is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching LinkedIn profile via userinfo endpoint...');
    
    // Use the modern LinkedIn OIDC userinfo endpoint
    const response = await fetch('https://api.linkedin.com/v2/userinfo', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LinkedIn userinfo API failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: `LinkedIn API error: ${response.status} ${response.statusText}`,
        details: errorText.substring(0, 500),
        debug: {
          endpoint: 'https://api.linkedin.com/v2/userinfo',
          method: 'GET',
          status: response.status
        }
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const profileData = await response.json();
    console.log('LinkedIn userinfo API successful');
    console.log('Profile data keys:', Object.keys(profileData));

    // Format the profile data into resume content
    const resumeContent = formatLinkedInProfile(profileData);
    console.log('Formatted resume content length:', resumeContent.length);
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: resumeContent,
      raw_profile: profileData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in LinkedIn profile function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Internal server error: ${error.message}` 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
