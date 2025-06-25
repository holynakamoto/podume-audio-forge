
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
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
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
    console.log('Using FireCrawl API key:', firecrawlApiKey.substring(0, 10) + '...');
    
    const app = new FirecrawlApp({ apiKey: firecrawlApiKey });
    
    let scrapeResult;
    try {
      scrapeResult = await app.scrapeUrl(url, {
        formats: ['markdown'],
        onlyMainContent: true,
        includeTags: ['h1', 'h2', 'h3', 'p', 'li', 'span', 'div'],
        excludeTags: ['nav', 'footer', 'script', 'style'],
      });
      console.log('FireCrawl API response:', scrapeResult);
    } catch (apiError) {
      console.error('FireCrawl API error:', apiError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `FireCrawl API error: ${apiError.message}` 
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

    const extractedText = scrapeResult.data?.markdown || '';
    console.log('Extracted text length:', extractedText.length);
    console.log('Extracted text preview:', extractedText.substring(0, 200) + '...');
    
    if (!extractedText || extractedText.length < 10) {
      console.error('No meaningful content extracted');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No meaningful content found on the webpage' 
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
