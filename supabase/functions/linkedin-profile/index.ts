
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
    console.log('=== LinkedIn Profile API function called ===');
    
    const linkedinClientId = Deno.env.get('LINKEDIN_CLIENT_ID');
    const linkedinClientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET');
    
    if (!linkedinClientId || !linkedinClientSecret) {
      console.error('LinkedIn credentials not found in environment');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'LinkedIn credentials not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { access_token } = await req.json();
    
    if (!access_token) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Access token is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching LinkedIn profile data...');
    
    // Fetch basic profile information
    const profileResponse = await fetch(
      'https://api.linkedin.com/v2/people/~:(id,firstName,lastName,headline,summary,positions)',
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!profileResponse.ok) {
      console.error('LinkedIn API error:', profileResponse.status, profileResponse.statusText);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `LinkedIn API error: ${profileResponse.statusText}` 
      }), {
        status: profileResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const profileData = await profileResponse.json();
    console.log('LinkedIn profile data received');

    // Format the profile data into resume content
    const resumeContent = formatLinkedInProfile(profileData);
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: resumeContent 
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
  const firstName = profile.firstName?.localized?.en_US || '';
  const lastName = profile.lastName?.localized?.en_US || '';
  const fullName = `${firstName} ${lastName}`.trim();
  
  let content = `# ${fullName}\n\n`;
  
  if (profile.headline) {
    content += `**Current Position:** ${profile.headline}\n\n`;
  }
  
  if (profile.summary) {
    content += `## Summary\n${profile.summary}\n\n`;
  }
  
  if (profile.positions && profile.positions.elements && profile.positions.elements.length > 0) {
    content += `## Experience\n\n`;
    
    profile.positions.elements.forEach((position: any) => {
      const company = position.companyName || 'Company';
      const title = position.title || 'Position';
      const description = position.description || '';
      
      content += `### ${title} at ${company}\n`;
      if (description) {
        content += `${description}\n`;
      }
      content += '\n';
    });
  }
  
  return content;
}
