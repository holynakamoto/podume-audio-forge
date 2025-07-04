
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import FirecrawlApp from "https://esm.sh/@mendable/firecrawl-js@1.0.0";

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
    console.log('=== FireCrawl scrape function called ===');
    console.log('Request method:', req.method);
    
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlApiKey) {
      console.error('FireCrawl API key not found in environment');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'FireCrawl API key not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body:', requestBody);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid JSON in request body' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { url } = requestBody;
    
    if (!url || typeof url !== 'string') {
      console.error('Invalid URL provided:', url);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Valid URL is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Scraping URL:', url);
    console.log('Using FireCrawl API key (first 10 chars):', firecrawlApiKey.substring(0, 10) + '...');
    
    // Initialize FireCrawl exactly like your working example
    const app = new FirecrawlApp({ apiKey: firecrawlApiKey });
    
    let scrapeResult;
    try {
      // Use exact same configuration as your working example
      scrapeResult = await app.scrapeUrl(url, {
        formats: ["markdown"],
        onlyMainContent: true,
      });
      
      console.log('FireCrawl API response:', scrapeResult);
      console.log('Response success:', scrapeResult?.success);
      console.log('Response data keys:', scrapeResult?.data ? Object.keys(scrapeResult.data) : 'no data');
      
    } catch (apiError) {
      console.error('FireCrawl API error:', apiError);
      console.error('Error type:', typeof apiError);
      console.error('Error message:', apiError.message);
      
      // Handle specific API errors
      if (apiError.message?.includes('403') || apiError.message?.includes('Forbidden')) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Access denied to the provided URL. Please ensure the resume is publicly accessible.' 
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: `FireCrawl API error: ${apiError.message}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!scrapeResult) {
      console.error('Null scrape result from FireCrawl API');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No response from FireCrawl API' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!scrapeResult.success) {
      console.error('FireCrawl scraping failed:', scrapeResult.error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: scrapeResult.error || 'Failed to scrape website' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract markdown content from the response
    const extractedText = scrapeResult.data?.markdown || scrapeResult.data?.content || '';
    console.log('Extracted text length:', extractedText.length);
    console.log('Extracted text preview (first 200 chars):', extractedText.substring(0, 200));
    
    if (!extractedText || extractedText.length < 10) {
      console.error('No meaningful content extracted');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No meaningful content found on the webpage. Please check if the URL is accessible and contains resume content.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Successfully scraped content, returning success response');
    
    const successResponse = { 
      success: true, 
      data: extractedText 
    };
    
    return new Response(JSON.stringify(successResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('=== CRITICAL ERROR in FireCrawl scrape function ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Internal server error: ${error.message}` 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
