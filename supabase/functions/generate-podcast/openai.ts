
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

  // Use a more accessible model that should work with standard API keys
  const modelEndpoint = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large';
  
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
          max_new_tokens: 1000,
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
        // Try a fallback model if the first one is loading
        console.log('Model loading, trying fallback model...');
        return await tryFallbackModel(resumeContent, huggingFaceApiKey);
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (response.status === 401 || response.status === 403) {
        console.error('Authentication/permission error. Trying fallback approach...');
        return await tryFallbackModel(resumeContent, huggingFaceApiKey);
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

async function tryFallbackModel(resumeContent: string, apiKey: string): Promise<string> {
  console.log('=== Trying fallback model ===');
  
  // Use a simpler, more accessible model
  const fallbackEndpoint = 'https://api-inference.huggingface.co/models/gpt2';
  
  const simplePrompt = `Professional career summary: ${resumeContent.substring(0, 500)}...

Convert this into an engaging podcast script:`;

  try {
    const response = await fetch(fallbackEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: simplePrompt,
        parameters: {
          max_new_tokens: 800,
          temperature: 0.8,
          do_sample: true
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Fallback model also failed:', errorText);
      
      // If both models fail, generate a basic script manually
      return generateBasicScript(resumeContent);
    }

    const data = await response.json();
    let generatedText: string;
    
    if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
      generatedText = data[0].generated_text;
    } else if (data.generated_text) {
      generatedText = data.generated_text;
    } else {
      return generateBasicScript(resumeContent);
    }

    console.log('Fallback model succeeded');
    return generatedText.trim();

  } catch (error) {
    console.error('Fallback model error:', error);
    return generateBasicScript(resumeContent);
  }
}

function generateBasicScript(resumeContent: string): string {
  console.log('=== Generating basic script as final fallback ===');
  
  // Extract key information from resume
  const lines = resumeContent.split('\n').filter(line => line.trim().length > 0);
  const name = lines[0] || 'Professional';
  
  // Find experience section
  const experienceStart = lines.findIndex(line => 
    line.toLowerCase().includes('experience') || 
    line.toLowerCase().includes('work') ||
    line.toLowerCase().includes('employment')
  );
  
  // Find education section
  const educationStart = lines.findIndex(line => 
    line.toLowerCase().includes('education') || 
    line.toLowerCase().includes('degree')
  );
  
  // Find skills section
  const skillsStart = lines.findIndex(line => 
    line.toLowerCase().includes('skills') || 
    line.toLowerCase().includes('technical')
  );

  let script = `Welcome to Career Spotlight! Today we're featuring the professional journey of ${name}.\n\n`;
  
  script += `Let me take you through an inspiring career story that showcases dedication, growth, and expertise.\n\n`;
  
  if (experienceStart > -1) {
    script += `Starting with their professional experience, ${name} has built an impressive career path. `;
    const experienceSection = lines.slice(experienceStart + 1, educationStart > -1 ? educationStart : lines.length)
      .slice(0, 3) // Take first few lines
      .join(' ');
    script += experienceSection.substring(0, 200) + '...\n\n';
  }
  
  if (skillsStart > -1) {
    script += `What really stands out are their technical capabilities. `;
    const skillsSection = lines.slice(skillsStart + 1, lines.length)
      .slice(0, 2) // Take first few lines
      .join(' ');
    script += skillsSection.substring(0, 150) + '...\n\n';
  }
  
  script += `This professional journey demonstrates continuous learning and adaptation in today's dynamic work environment. `;
  script += `${name} represents the kind of forward-thinking professional that drives innovation and success.\n\n`;
  script += `That's a wrap on today's Career Spotlight. Thank you for joining us!`;
  
  console.log('Basic script generated successfully');
  return script;
}
