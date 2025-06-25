
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
    
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlApiKey) {
      console.error('FireCrawl API key not found');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'FireCrawl API key not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { url } = await req.json();
    
    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Valid URL is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Scraping URL:', url);
    
    const app = new FirecrawlApp({ apiKey: firecrawlApiKey });
    
    const scrapeResult = await app.scrapeUrl(url, {
      formats: ['markdown'],
      onlyMainContent: true,
      includeTags: ['h1', 'h2', 'h3', 'p', 'li', 'span', 'div'],
      excludeTags: ['nav', 'footer', 'script', 'style'],
    });

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
    
    if (!extractedText || extractedText.length < 10) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No meaningful content found on the webpage' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Successfully scraped content, length:', extractedText.length);
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: extractedText 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in FireCrawl scrape function:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
