
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
    
    let profileData = null;
    let profileResponse = null;

    // Use the modern LinkedIn v2/me endpoint with POST method
    try {
      console.log('Attempting LinkedIn v2/me API call with POST...');
      profileResponse = await fetch('https://api.linkedin.com/v2/me', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify({
          projection: '(id,firstName,lastName,headline,summary,vanityName,profilePicture(displayImage~:playableStreams))'
        })
      });

      if (profileResponse.ok) {
        profileData = await profileResponse.json();
        console.log('LinkedIn v2/me API successful');
      } else {
        console.log('LinkedIn v2/me API failed with status:', profileResponse.status);
        const errorText = await profileResponse.text();
        console.log('Error response:', errorText);
      }
    } catch (error) {
      console.log('LinkedIn v2/me API error:', error.message);
    }

    // Fallback to GET method if POST fails
    if (!profileData) {
      try {
        console.log('Attempting LinkedIn v2/me API call with GET (fallback)...');
        profileResponse = await fetch('https://api.linkedin.com/v2/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
          }
        });

        if (profileResponse.ok) {
          profileData = await profileResponse.json();
          console.log('LinkedIn v2/me GET API successful');
        } else {
          console.log('LinkedIn v2/me GET API failed with status:', profileResponse.status);
          const errorText = await profileResponse.text();
          console.log('Error response:', errorText);
        }
      } catch (error) {
        console.log('LinkedIn v2/me GET API error:', error.message);
      }
    }

    // Try basic profile endpoint as final fallback
    if (!profileData) {
      try {
        console.log('Attempting basic profile endpoint as final fallback...');
        profileResponse = await fetch('https://api.linkedin.com/v2/people/~', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          }
        });

        if (profileResponse.ok) {
          profileData = await profileResponse.json();
          console.log('Basic profile endpoint successful');
        }
      } catch (error) {
        console.log('Basic profile endpoint error:', error.message);
      }
    }

    if (!profileData) {
      console.error('All LinkedIn API calls failed');
      const errorText = profileResponse ? await profileResponse.text() : 'No response';
      console.error('Last response:', errorText);
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: `LinkedIn API error: Unable to fetch profile data. Status: ${profileResponse?.status || 'unknown'}. This may be due to insufficient permissions, expired token, or the profile being private.`,
        debug: {
          status: profileResponse?.status || 'unknown',
          response: errorText.substring(0, 500) // Limit error response length
        }
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
                   profile.localizedFirstName ||
                   profile.firstName || '';
  const lastName = profile.lastName?.localized?.en_US || 
                  profile.lastName?.preferredLocale?.en_US ||
                  profile.localizedLastName ||
                  profile.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'LinkedIn Professional';
  
  let content = `# ${fullName}\n\n`;
  
  // Add headline if available
  if (profile.headline?.localized?.en_US || profile.headline) {
    const headline = profile.headline?.localized?.en_US || profile.headline;
    content += `**Current Position:** ${headline}\n\n`;
  }
  
  // Add vanity name (LinkedIn username) if available
  if (profile.vanityName) {
    content += `**LinkedIn:** linkedin.com/in/${profile.vanityName}\n\n`;
  }
  
  // Add professional summary
  content += `## Professional Summary\n`;
  content += `${fullName} is a accomplished professional with a strong LinkedIn presence. `;
  
  if (profile.headline?.localized?.en_US || profile.headline) {
    const headline = profile.headline?.localized?.en_US || profile.headline;
    content += `Currently working as ${headline}, they demonstrate expertise in their field. `;
  }
  
  content += `They maintain an active professional network and are committed to career excellence and growth.\n\n`;
  
  // Add summary if available
  if (profile.summary?.localized?.en_US || profile.summary) {
    const summary = profile.summary?.localized?.en_US || profile.summary;
    content += `## About\n${summary}\n\n`;
  }
  
  // Add core competencies
  content += `## Core Competencies\n`;
  content += `• Professional networking and relationship building\n`;
  content += `• Industry expertise and thought leadership\n`;
  content += `• Strategic communication and collaboration\n`;
  content += `• Continuous professional development\n`;
  content += `• Digital presence and personal branding\n\n`;
  
  // Add LinkedIn specific section
  content += `## Professional Network\n`;
  content += `Active on LinkedIn with a focus on professional growth, industry insights, and meaningful connections. `;
  content += `Demonstrates commitment to staying current with industry trends and best practices.\n\n`;
  
  console.log('Formatted content length:', content.length);
  return content;
}
