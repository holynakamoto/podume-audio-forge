
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
      console.error('No access token provided');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Access token is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching LinkedIn profile data with access token...');
    
    // Try to fetch basic profile information with different scopes
    let profileData = null;
    let profileResponse = null;

    // First try with the v2 people API (more comprehensive)
    try {
      console.log('Attempting v2 people API call...');
      profileResponse = await fetch(
        'https://api.linkedin.com/v2/people/~:(id,firstName,lastName,headline,summary,positions)',
        {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (profileResponse.ok) {
        profileData = await profileResponse.json();
        console.log('v2 people API successful');
      } else {
        console.log('v2 people API failed with status:', profileResponse.status);
      }
    } catch (error) {
      console.log('v2 people API error:', error.message);
    }

    // If v2 fails, try the lite profile endpoint
    if (!profileData) {
      try {
        console.log('Attempting lite profile API call...');
        profileResponse = await fetch(
          'https://api.linkedin.com/v2/people/~:(id,firstName,lastName,profilePicture(displayImage~:playableStreams))',
          {
            headers: {
              'Authorization': `Bearer ${access_token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (profileResponse.ok) {
          profileData = await profileResponse.json();
          console.log('Lite profile API successful');
        } else {
          console.log('Lite profile API failed with status:', profileResponse.status);
        }
      } catch (error) {
        console.log('Lite profile API error:', error.message);
      }
    }

    if (!profileData) {
      console.error('All LinkedIn API calls failed');
      const errorText = profileResponse ? await profileResponse.text() : 'No response';
      console.error('Last response:', errorText);
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: `LinkedIn API error: Unable to fetch profile data. This may be due to insufficient permissions or the profile being private.` 
      }), {
        status: profileResponse?.status || 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('LinkedIn profile data received successfully');
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
  console.log('Formatting LinkedIn profile...');
  
  const firstName = profile.firstName?.localized?.en_US || 
                   profile.firstName?.preferredLocale?.en_US ||
                   profile.firstName || '';
  const lastName = profile.lastName?.localized?.en_US || 
                  profile.lastName?.preferredLocale?.en_US ||
                  profile.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Professional';
  
  let content = `# ${fullName}\n\n`;
  
  if (profile.headline) {
    content += `**Current Position:** ${profile.headline}\n\n`;
  }
  
  // Add a professional summary if we have basic info
  if (firstName || lastName) {
    content += `## Professional Summary\n`;
    content += `${fullName} is a dedicated professional with experience in their field. `;
    
    if (profile.headline) {
      content += `Currently serving as ${profile.headline}, they bring valuable expertise and skills to their role. `;
    }
    
    content += `This professional is committed to excellence and continuous growth in their career.\n\n`;
  }
  
  if (profile.summary) {
    content += `## About\n${profile.summary}\n\n`;
  }
  
  if (profile.positions && profile.positions.elements && profile.positions.elements.length > 0) {
    content += `## Professional Experience\n\n`;
    
    profile.positions.elements.forEach((position: any, index: number) => {
      const company = position.companyName || `Company ${index + 1}`;
      const title = position.title || 'Professional Role';
      const description = position.description || 'Contributed to company objectives and delivered results in their professional capacity.';
      
      content += `### ${title} at ${company}\n`;
      content += `${description}\n\n`;
    });
  } else {
    // Add generic experience section if no specific positions
    if (profile.headline) {
      content += `## Professional Experience\n\n`;
      content += `### ${profile.headline}\n`;
      content += `Experienced professional with demonstrated expertise in their field. Committed to delivering quality results and contributing to organizational success.\n\n`;
    }
  }
  
  // Add skills section
  content += `## Core Competencies\n`;
  content += `• Professional communication and collaboration\n`;
  content += `• Problem-solving and analytical thinking\n`;
  content += `• Project management and organization\n`;
  content += `• Adaptability and continuous learning\n\n`;
  
  console.log('Formatted content length:', content.length);
  return content;
}
