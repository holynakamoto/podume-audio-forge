
export async function generateScriptWithClaude(resumeContent: string): Promise<string> {
  console.log('=== Generating script with Claude 3.5 Sonnet ===');
  
  const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!anthropicApiKey) {
    console.log('Anthropic API key not found, falling back to enhanced script generation');
    const { generateEnhancedScript } = await import('./enhanced-script-generator.ts');
    return generateEnhancedScript(resumeContent);
  }

  try {
    console.log('Generating podcast script with Claude 3.5 Sonnet...');
    console.log('Resume content length:', resumeContent.length);
    console.log('Resume content preview:', resumeContent.substring(0, 300) + '...');
    
    // Create structured prompt for Claude
    const prompt = createClaudePrompt(resumeContent);
    console.log('Prompt created, length:', prompt.length);
    
    console.log('Sending request to Claude API...');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    console.log('Claude API response status:', response.status);
    console.log('Claude API response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error response:', errorText);
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Claude API response received');
    console.log('Response structure:', Object.keys(result));
    
    if (result.error) {
      console.error('Claude API returned error:', result.error);
      throw new Error(`Claude API error: ${result.error.message}`);
    }

    const generatedScript = result.content?.[0]?.text || '';
    console.log('Generated script length:', generatedScript.length);
    console.log('Generated script preview:', generatedScript.substring(0, 200) + '...');
    
    if (!generatedScript || generatedScript.length < 100) {
      console.log('Generated script too short or empty, using enhanced fallback');
      console.log('Script content:', generatedScript);
      const { generateEnhancedScript } = await import('./enhanced-script-generator.ts');
      return generateEnhancedScript(resumeContent);
    }

    console.log('Claude script generated successfully, final length:', generatedScript.length);
    return generatedScript;

  } catch (error) {
    console.error('=== Claude generation failed ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.log('Falling back to enhanced script generator');
    
    const { generateEnhancedScript } = await import('./enhanced-script-generator.ts');
    return generateEnhancedScript(resumeContent);
  }
}

function createClaudePrompt(resumeContent: string): string {
  return `You are tasked with creating a 5-7 minute podcast transcript featuring two professional hosts discussing a candidate's resume. The transcript should be engaging, conversational, and highlight the candidate's strengths.

Resume Content:
${resumeContent}

Please create a detailed podcast transcript with the following requirements:

1. Two distinct hosts: Sarah (primary host) and Mike (co-host)
2. Natural dialogue that feels like a real podcast conversation
3. Professional yet engaging tone
4. 800-1200 words to ensure 5+ minutes of audio content
5. Include commentary on:
   - Career progression and key achievements
   - Skills and competencies
   - Industry relevance and future potential
   - Notable accomplishments and experiences

Structure the conversation with:
- Opening welcome and introduction
- Deep dive into professional background
- Analysis of skills and experience
- Discussion of career trajectory
- Closing thoughts and wrap-up

Make the dialogue natural with both hosts contributing meaningfully. Use "Sarah:" and "Mike:" to clearly indicate who is speaking.

Begin the transcript now:`;
}
