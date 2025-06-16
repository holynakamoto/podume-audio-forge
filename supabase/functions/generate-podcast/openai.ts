
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
  console.log('Resume content preview:', resumeContent.substring(0, 150) + '...');

  const hfApiKey = Deno.env.get('HUGGING_FACE_API_KEY');
  if (!hfApiKey) {
    console.log('Hugging Face API key not found, using basic script generation');
    return generateBasicScript(resumeContent);
  }

  console.log('Hugging Face API key found, proceeding with generation...');

  // Enhanced prompt for two-host conversation format
  const prompt = `Create a professional podcast script featuring TWO HOSTS having a natural conversation about this resume. The script should:

1. Have Host 1 (Sarah) and Host 2 (Mike) naturally discussing the career journey
2. Include smooth transitions between topics
3. Sound conversational and engaging, not like reading bullet points
4. Highlight key achievements and skills naturally in conversation
5. Be approximately 2-3 minutes when spoken
6. End with closing remarks from both hosts

Resume Content:
${resumeContent}

Format the output as a natural conversation between two podcast hosts, with clear speaker labels.`;

  console.log('Sending request to Hugging Face API...');
  console.log('Model endpoint: https://api-inference.huggingface.co/models/microsoft/DialoGPT-large');
  console.log('Prompt length:', prompt.length);

  try {
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-large', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfApiKey}`,
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
        return await tryFallbackModel(resumeContent, hfApiKey);
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

function generateBasicScript(resumeContent: string): string {
  console.log('=== Generating basic script as final fallback ===');
  
  // Extract key information from resume
  const lines = resumeContent.split('\n').filter(line => line.trim().length > 0);
  const name = extractName(lines);
  const summary = extractSummary(lines);
  const experience = extractExperience(lines);
  
  // Create a conversational two-host script
  let script = `Host 1: Welcome to Career Spotlight! Today we're featuring the professional journey of ${name}.\n\n`;
  script += `Host 2: That's right! Let me take you through an inspiring career story that showcases dedication, growth, and expertise.\n\n`;
  
  if (summary) {
    script += `Host 1: ${summary}\n\n`;
  }
  
  if (experience.length > 0) {
    script += `Host 2: Looking at their professional experience, we can see some impressive achievements:\n\n`;
    experience.slice(0, 3).forEach((exp, index) => {
      const speaker = index % 2 === 0 ? "Host 1" : "Host 2";
      script += `${speaker}: ${exp}\n\n`;
    });
  }
  
  script += `Host 1: What stands out most is the consistent growth and adaptability throughout their career.\n\n`;
  script += `Host 2: Absolutely! This is exactly the kind of professional development story that inspires others.\n\n`;
  script += `Host 1: Thanks for joining us on Career Spotlight! Don't forget to subscribe for more inspiring career stories.\n\n`;
  script += `Host 2: Until next time, keep growing and pursuing your professional goals!`;

  console.log('Basic script generated successfully');
  return script;
}

function extractName(lines: string[]): string {
  const firstLine = lines[0]?.trim() || '';
  if (firstLine.length > 0 && firstLine.length < 50 && !firstLine.includes('@') && !firstLine.includes('http')) {
    return firstLine;
  }
  return 'this professional';
}

function extractSummary(lines: string[]): string {
  const summaryKeywords = ['summary', 'profile', 'about', 'overview'];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (summaryKeywords.some(keyword => line.includes(keyword))) {
      const nextLines = lines.slice(i + 1, i + 4);
      const summary = nextLines.filter(line => line.trim().length > 20).join(' ');
      if (summary.length > 50) {
        return summary.substring(0, 200) + (summary.length > 200 ? '...' : '');
      }
    }
  }
  return '';
}

function extractExperience(lines: string[]): string[] {
  const experience: string[] = [];
  const experienceKeywords = ['experience', 'work', 'employment', 'career', 'position', 'role'];
  
  let foundExperience = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (experienceKeywords.some(keyword => line.includes(keyword))) {
      foundExperience = true;
      continue;
    }
    
    if (foundExperience && lines[i].trim().length > 30) {
      experience.push(lines[i].trim());
      if (experience.length >= 5) break;
    }
  }
  
  return experience;
}
