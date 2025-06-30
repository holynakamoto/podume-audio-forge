
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile_data } = await req.json();
    
    console.log('🎙️ Generating transcript for profile:', profile_data.name);
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: `Create an engaging 5-7 minute podcast transcript about this LinkedIn profile. 
          
          Guidelines:
          - Start with a compelling hook that draws listeners in
          - Highlight 3-4 key career achievements and milestones  
          - Discuss their expertise and unique value proposition
          - Include specific examples or projects when available
          - End with insights about their professional journey and what makes them stand out
          - Write in a conversational, podcast-friendly tone as if you're hosting a show
          - Add natural pauses with [PAUSE] markers for better flow
          - Optimize for text-to-speech conversion - avoid complex punctuation
          - Keep sentences clear and not too long
          - Use "they/them" pronouns unless gender is explicitly clear
          
          Profile Data: ${JSON.stringify(profile_data, null, 2)}
          
          Format the transcript as a natural, engaging podcast episode about this professional.`
        }]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Anthropic API error:', errorText);
      throw new Error(`Transcript generation failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    const transcript = result.content[0].text;
    
    console.log('✅ Transcript generated successfully');
    console.log('📝 Transcript length:', transcript.length);
    
    return new Response(JSON.stringify({
      transcript: transcript
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Transcript generation error:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
