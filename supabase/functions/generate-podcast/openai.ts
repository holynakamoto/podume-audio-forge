import { OpenAI } from "https://deno.land/x/openai@1.2.1/mod.ts";

interface PodcastData {
  title: string;
  package_type: string;
  voice_clone: boolean;
  premium_assets: boolean;
}

export async function generatePodcastScript(resumeContent: string): Promise<string> {
  console.log('=== Starting Hugging Face podcast script generation ===');
  console.log('Resume content length:', resumeContent.length);
  console.log('Resume content preview:', resumeContent.substring(0, 200) + '...');

  const huggingFaceApiKey = Deno.env.get('HUGGING_FACE_API_KEY');
  if (!huggingFaceApiKey) {
    console.error('Hugging Face API key not found');
    throw new Error('Hugging Face API key not configured. Please check your Supabase secrets configuration');
  }

  console.log('Hugging Face API key found, proceeding with generation...');

  // Use a capable text generation model from Hugging Face
  const modelEndpoint = 'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1';
  
  const prompt = `You are a professional podcast scriptwriter. Convert the following resume content into an engaging, conversational podcast script for a single host presenting this person's career story. 

Make it sound natural and engaging, as if the host is telling the story of this person's professional journey to an audience. Include:
- An engaging introduction
- Key career highlights and achievements
- Skills and expertise in a conversational way
- A compelling conclusion

Keep the tone professional yet conversational, suitable for a career-focused podcast. The script should be about 3-5 minutes when read aloud.

Resume content:
${resumeContent}

Generate a complete podcast script:`;

  console.log('Sending request to Hugging Face API...');
  console.log('Model endpoint:', modelEndpoint);
  console.log('Prompt length:', prompt.length);

  try {
    const response = await fetch(modelEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${huggingFaceApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 1500,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false
        }
      }),
    });

    console.log('Hugging Face API response status:', response.status);
    console.log('Hugging Face API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error response:', errorText);
      
      if (response.status === 503) {
        throw new Error('Model is currently loading. Please try again in a few moments.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (response.status === 401) {
        throw new Error('Invalid Hugging Face API key. Please check your configuration.');
      } else {
        throw new Error(`Hugging Face API error (${response.status}): ${errorText}`);
      }
    }

    const data = await response.json();
    console.log('Hugging Face API response received');
    console.log('Response data structure:', Object.keys(data));

    let generatedText: string;
    
    // Handle different response formats from Hugging Face
    if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
      generatedText = data[0].generated_text;
    } else if (data.generated_text) {
      generatedText = data.generated_text;
    } else {
      console.error('Unexpected response format from Hugging Face:', data);
      throw new Error('Unexpected response format from Hugging Face API');
    }

    console.log('Generated text length:', generatedText.length);
    console.log('Generated text preview:', generatedText.substring(0, 200) + '...');

    if (!generatedText || generatedText.trim().length < 50) {
      throw new Error('Generated script is too short or empty. Please try again.');
    }

    console.log('=== Hugging Face podcast script generation completed successfully ===');
    return generatedText.trim();

  } catch (error) {
    console.error('=== Hugging Face API Error ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error connecting to Hugging Face API. Please check your internet connection.');
    }
    
    throw error;
  }
}
