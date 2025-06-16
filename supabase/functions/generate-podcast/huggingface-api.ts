
import { generateBasicScript } from './script-generator.ts';

export async function generateScriptWithHuggingFace(resumeContent: string, apiKey: string): Promise<string> {
  console.log('=== Starting Hugging Face podcast script generation ===');
  console.log('Resume content length:', resumeContent.length);
  console.log('Resume content preview:', resumeContent.substring(0, 150) + '...');

  // Enhanced prompt for two-host conversation format
  const prompt = `Create a professional podcast script featuring TWO HOSTS having a natural conversation about this resume. The script should:

1. Have alternating speakers in a natural conversation (do not use "Host 1:" or "Host 2:" labels)
2. Include smooth transitions between topics
3. Sound conversational and engaging, not like reading bullet points
4. Highlight key achievements and skills naturally in conversation
5. Be approximately 2-3 minutes when spoken
6. Each paragraph should be spoken by a different person
7. Start with a welcoming introduction and end with closing remarks

Resume Content:
${resumeContent}

Format the output as alternating paragraphs where each paragraph is spoken by a different person. Do not include any speaker labels.`;

  console.log('Sending request to Hugging Face API...');
  console.log('Model endpoint: https://api-inference.huggingface.co/models/microsoft/DialoGPT-large');
  console.log('Prompt length:', prompt.length);

  try {
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-large', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 800,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false
        }
      }),
    });

    console.log('Hugging Face API response status:', response.status);
    console.log('Hugging Face API response headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error response:', errorText);
      
      if (response.status === 403) {
        console.error('Authentication/permission error. Trying fallback approach...');
        return await tryFallbackModel(resumeContent, apiKey);
      }
      
      throw new Error(`Hugging Face API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('Hugging Face API response:', JSON.stringify(result, null, 2));

    let generatedText = '';
    if (Array.isArray(result) && result[0]?.generated_text) {
      generatedText = result[0].generated_text;
    } else if (result.generated_text) {
      generatedText = result.generated_text;
    }

    if (generatedText && generatedText.length > 50) {
      console.log('Successfully generated script with Hugging Face');
      return generatedText;
    } else {
      console.log('Generated text too short or empty, using fallback');
      return generateBasicScript(resumeContent);
    }

  } catch (error) {
    console.error('Hugging Face API request failed:', error.message);
    return generateBasicScript(resumeContent);
  }
}

async function tryFallbackModel(resumeContent: string, apiKey: string): Promise<string> {
  console.log('=== Trying fallback model ===');
  
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `Create a professional podcast conversation about this career: ${resumeContent.substring(0, 1000)}`,
        parameters: {
          max_length: 500,
          temperature: 0.7
        }
      }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result[0]?.generated_text) {
        console.log('Fallback model successful');
        return result[0].generated_text;
      }
    } else {
      console.error('Fallback model also failed:', await response.text());
    }
  } catch (error) {
    console.error('Fallback model error:', error.message);
  }

  return generateBasicScript(resumeContent);
}
