
import { extractStructuredData } from './enhanced-resume-extractor.ts';

export async function generateScriptWithHuggingFace(resumeContent: string, apiKey: string): Promise<string> {
  console.log('=== Generating script with Hugging Face API for 5+ minute podcast ===');
  
  try {
    // Extract structured data for better context
    const structuredData = extractStructuredData(resumeContent);
    
    // Create a comprehensive prompt for longer content generation
    const prompt = createEnhancedPrompt(structuredData, resumeContent);
    
    console.log('Sending enhanced prompt to Hugging Face API...');
    
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-large', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 1000,
          temperature: 0.7,
          do_sample: true,
          pad_token_id: 50256
        }
      }),
    });

    if (!response.ok) {
      console.error('Hugging Face API error:', response.status, response.statusText);
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Hugging Face API response received');
    
    if (result.error) {
      console.error('Hugging Face API returned error:', result.error);
      throw new Error(`Hugging Face API error: ${result.error}`);
    }

    let generatedText = '';
    if (Array.isArray(result) && result.length > 0) {
      generatedText = result[0].generated_text || '';
    } else if (result.generated_text) {
      generatedText = result.generated_text;
    }

    if (!generatedText || generatedText.length < 200) {
      console.log('Generated content too short, using enhanced fallback');
      const { generateEnhancedScript } = await import('./enhanced-script-generator.ts');
      return generateEnhancedScript(resumeContent);
    }

    // Enhance the generated content to ensure it's podcast-appropriate and long enough
    const enhancedScript = enhanceGeneratedScript(generatedText, structuredData);
    
    console.log('Enhanced script generated successfully, length:', enhancedScript.length);
    return enhancedScript;

  } catch (error) {
    console.error('Hugging Face generation failed:', error);
    console.log('Falling back to enhanced script generator');
    
    const { generateEnhancedScript } = await import('./enhanced-script-generator.ts');
    return generateEnhancedScript(resumeContent);
  }
}

function createEnhancedPrompt(structuredData: any, resumeContent: string): string {
  return `Create a detailed 5-minute podcast conversation between two hosts (Sarah and Mike) discussing the professional career of ${structuredData.name}. 

Professional Summary: ${structuredData.summary || 'Accomplished professional with diverse experience'}

Key Experience: ${structuredData.experience.slice(0, 3).map(exp => `${exp.role} at ${exp.company}`).join(', ')}

Skills: ${structuredData.skills.slice(0, 8).join(', ')}

Create an engaging dialogue that:
- Opens with a warm welcome and introduction
- Discusses career progression and key achievements
- Analyzes skills and competencies
- Explores industry relevance and future potential
- Includes natural conversation flow with both hosts contributing
- Maintains professional yet engaging tone
- Totals approximately 800-1000 words for 5+ minutes of audio

Start the conversation:

Sarah: Welcome to Career Spotlight! I'm Sarah, and today Mike and I are exploring the remarkable journey of ${structuredData.name}.

Mike:`;
}

function enhanceGeneratedScript(generatedText: string, structuredData: any): string {
  // If the generated text is too short, enhance it with additional content
  if (generatedText.length < 800) {
    const additionalContent = `

Sarah: What really impresses me about ${structuredData.name}'s background is the strategic career progression we see here.

Mike: Absolutely, Sarah. Looking at their experience across ${structuredData.experience.length} different roles, you can see how each position built upon the previous one.

Sarah: And their skill set - ${structuredData.skills.slice(0, 5).join(', ')} - shows someone who's not just keeping up with industry trends, but staying ahead of them.

Mike: That's exactly what sets exceptional professionals apart. They don't just adapt to change, they anticipate it and position themselves accordingly.

Sarah: For our listeners who are building their own careers, ${structuredData.name}'s journey is a perfect example of intentional professional development.

Mike: Couldn't agree more, Sarah. This has been another inspiring episode of Career Spotlight. Thanks for joining us!`;
    
    return generatedText + additionalContent;
  }
  
  return generatedText;
}
