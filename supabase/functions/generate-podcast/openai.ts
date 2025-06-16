
import { OpenAIResponse, PodcastContent } from './types.ts';

export async function generatePodcastScript(resumeContent: string): Promise<PodcastContent> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  console.log('=== OpenAI API Call Debug Info ===');
  console.log('API Key present:', !!openAIApiKey);
  console.log('API Key prefix:', openAIApiKey ? openAIApiKey.substring(0, 7) + '...' : 'MISSING');
  console.log('Resume content length:', resumeContent.length);
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not found in environment variables');
  }
  
  const prompt = `Based on the following resume text, please generate a compelling 2-3 minute podcast script that tells this person's career story in an engaging, conversational way. Focus on their key achievements, skills, and career progression. Make it sound natural and interesting, as if you're introducing this person to potential employers or collaborators.

Resume:
---
${resumeContent}
---

Please return the output as a JSON object with the following structure: { "description": "A short, compelling summary for the podcast.", "transcript": "The full podcast script as a string that should be 2-3 minutes when read aloud." }`;

  console.log('Making OpenAI API request...');
  
  try {
    const requestBody = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a creative assistant that transforms resumes into engaging podcast scripts. Write in a natural, conversational tone suitable for audio." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    };
    
    console.log('Request payload:', JSON.stringify(requestBody, null, 2));
    
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('=== OpenAI Response Details ===');
    console.log('Response status:', openAIResponse.status);
    console.log('Response status text:', openAIResponse.statusText);
    console.log('Response headers:', Object.fromEntries(openAIResponse.headers.entries()));
    
    // Get response text for debugging
    const responseText = await openAIResponse.text();
    console.log('Raw response body:', responseText);
    
    if (!openAIResponse.ok) {
      console.error('=== OpenAI API Error ===');
      console.error('Status Code:', openAIResponse.status);
      console.error('Status Text:', openAIResponse.statusText);
      console.error('Error Response Body:', responseText);
      
      // Try to parse error details
      try {
        const errorData = JSON.parse(responseText);
        console.error('Parsed error data:', errorData);
        
        if (errorData.error) {
          console.error('Error type:', errorData.error.type);
          console.error('Error code:', errorData.error.code);
          console.error('Error message:', errorData.error.message);
        }
      } catch (parseError) {
        console.error('Could not parse error response as JSON');
      }
      
      // Handle specific error cases
      if (openAIResponse.status === 401) {
        throw new Error('OpenAI API authentication failed. Please check your API key.');
      } else if (openAIResponse.status === 429) {
        throw new Error('OpenAI API rate limit exceeded. Please try again later.');
      } else if (openAIResponse.status === 402) {
        throw new Error('OpenAI API quota exceeded. Please check your billing.');
      } else {
        throw new Error(`OpenAI API error: ${openAIResponse.status} - ${responseText}`);
      }
    }

    console.log('OpenAI API call successful');
    
    try {
      const openAIResult: OpenAIResponse = JSON.parse(responseText);
      console.log('Parsed response successfully');
      console.log('Response structure:', {
        hasChoices: !!openAIResult.choices,
        choicesLength: openAIResult.choices?.length || 0,
        firstChoiceHasMessage: !!openAIResult.choices?.[0]?.message,
        firstChoiceHasContent: !!openAIResult.choices?.[0]?.message?.content
      });

      const content = openAIResult.choices?.[0]?.message?.content;
      if (!content) {
        console.error('No content received from OpenAI');
        console.error('Full response:', openAIResult);
        throw new Error('No content received from OpenAI');
      }

      console.log('Content received, length:', content.length);
      console.log('Content preview:', content.substring(0, 200) + '...');

      try {
        const parsedContent = JSON.parse(content);
        console.log('Successfully parsed content JSON');
        console.log('Parsed content keys:', Object.keys(parsedContent));
        
        return {
          description: parsedContent.description,
          transcript: parsedContent.transcript
        };
      } catch (parseError) {
        console.error('Failed to parse OpenAI response content as JSON:', parseError);
        console.error('Content that failed to parse:', content);
        throw new Error('Invalid response format from OpenAI');
      }
    } catch (jsonParseError) {
      console.error('Failed to parse OpenAI response as JSON:', jsonParseError);
      console.error('Response text that failed to parse:', responseText);
      throw new Error('Invalid JSON response from OpenAI');
    }
  } catch (networkError) {
    console.error('=== Network/Fetch Error ===');
    console.error('Error type:', networkError.constructor.name);
    console.error('Error message:', networkError.message);
    console.error('Error stack:', networkError.stack);
    throw new Error(`Failed to generate podcast script: ${networkError.message}`);
  }
}
