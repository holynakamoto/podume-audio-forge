
import { OpenAIResponse, PodcastContent } from './types.ts';

export async function generatePodcastScript(resumeContent: string): Promise<PodcastContent> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;
  
  const prompt = `Based on the following resume text, please generate a compelling 2-3 minute podcast script that tells this person's career story in an engaging, conversational way. Focus on their key achievements, skills, and career progression. Make it sound natural and interesting, as if you're introducing this person to potential employers or collaborators.

Resume:
---
${resumeContent}
---

Please return the output as a JSON object with the following structure: { "description": "A short, compelling summary for the podcast.", "transcript": "The full podcast script as a string that should be 2-3 minutes when read aloud." }`;

  console.log('Calling OpenAI API for script generation...');
  console.log('Using API key starting with:', openAIApiKey.substring(0, 7) + '...');
  
  try {
    console.log('Making OpenAI request...');
    
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a creative assistant that transforms resumes into engaging podcast scripts. Write in a natural, conversational tone suitable for audio." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    console.log('OpenAI response status:', openAIResponse.status);
    
    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error details:', {
        status: openAIResponse.status,
        statusText: openAIResponse.statusText,
        errorText
      });
      
      // Handle specific error cases
      if (openAIResponse.status === 401) {
        throw new Error('OpenAI API authentication failed. Please check your API key.');
      } else if (openAIResponse.status === 429) {
        throw new Error('OpenAI API rate limit exceeded. Please try again later.');
      } else if (openAIResponse.status === 402) {
        throw new Error('OpenAI API quota exceeded. Please check your billing.');
      } else {
        throw new Error(`OpenAI API error: ${openAIResponse.status} - ${errorText}`);
      }
    }

    const openAIResult: OpenAIResponse = await openAIResponse.json();
    console.log('OpenAI response received successfully');

    const content = openAIResult.choices?.[0]?.message?.content;
    if (!content) {
      console.error('No content received from OpenAI');
      throw new Error('No content received from OpenAI');
    }

    try {
      const parsedContent = JSON.parse(content);
      return {
        description: parsedContent.description,
        transcript: parsedContent.transcript
      };
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      throw new Error('Invalid response format from OpenAI');
    }
  } catch (openAIError) {
    console.error('OpenAI API call failed:', openAIError);
    throw new Error(`Failed to generate podcast script: ${openAIError.message}`);
  }
}
