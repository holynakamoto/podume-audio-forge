import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { chromium } from "https://esm.sh/playwright@1.53.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotebookLMRequest {
  pdfContent: string; // base64 encoded PDF
  fileName: string;
  googleEmail?: string;
  googlePassword?: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfContent, fileName, googleEmail, googlePassword }: NotebookLMRequest = await req.json();

    if (!pdfContent || !fileName) {
      throw new Error('PDF content and filename are required');
    }

    console.log('Starting NotebookLM automation for file:', fileName);

    // Launch browser with necessary options for server environment
    const browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();

    try {
      console.log('Navigating to NotebookLM...');
      
      // Navigate to NotebookLM
      await page.goto('https://notebooklm.google.com', {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Check if we need to sign in
      const signInButton = await page.locator('text=Sign in').first();
      if (await signInButton.isVisible()) {
        console.log('Signing in to Google...');
        
        if (!googleEmail || !googlePassword) {
          throw new Error('Google credentials required for NotebookLM access');
        }

        await signInButton.click();
        
        // Handle Google sign-in
        await page.waitForSelector('input[type="email"]', { timeout: 10000 });
        await page.fill('input[type="email"]', googleEmail);
        await page.click('#identifierNext');

        await page.waitForSelector('input[type="password"]', { timeout: 10000 });
        await page.fill('input[type="password"]', googlePassword);
        await page.click('#passwordNext');

        // Wait for successful login
        await page.waitForURL('**/notebooklm.google.com/**', { timeout: 30000 });
      }

      console.log('Navigating to new notebook...');
      
      // Look for "New notebook" or create new notebook
      await page.waitForSelector('[data-testid="new-notebook"], text=New notebook, text=Create', { timeout: 15000 });
      
      const newNotebookButton = await page.locator('[data-testid="new-notebook"], text=New notebook, text=Create').first();
      await newNotebookButton.click();

      console.log('Uploading PDF file...');

      // Convert base64 to buffer for file upload
      const buffer = Uint8Array.from(atob(pdfContent), c => c.charCodeAt(0));

      // Wait for the upload area or add sources button
      await page.waitForSelector('[data-testid="add-source"], input[type="file"], text=Add sources', { timeout: 15000 });

      // Handle file upload - try multiple selectors as UI may vary
      const fileInputSelectors = [
        'input[type="file"]',
        '[data-testid="file-upload"]',
        '[accept*="pdf"]'
      ];

      let fileInput = null;
      for (const selector of fileInputSelectors) {
        try {
          fileInput = await page.locator(selector).first();
          if (await fileInput.isVisible()) break;
        } catch (e) {
          continue;
        }
      }

      if (!fileInput) {
        // Try clicking add sources button first
        const addSourceButton = await page.locator('[data-testid="add-source"], text=Add sources').first();
        if (await addSourceButton.isVisible()) {
          await addSourceButton.click();
          await page.waitForSelector('input[type="file"]', { timeout: 5000 });
          fileInput = await page.locator('input[type="file"]').first();
        }
      }

      if (!fileInput) {
        throw new Error('Could not find file upload input');
      }

      // Create a temporary file for upload
      await page.setInputFiles(fileInput, {
        name: fileName,
        mimeType: 'application/pdf',
        buffer: buffer
      });

      console.log('PDF uploaded, waiting for processing...');

      // Wait for file to be processed
      await page.waitForSelector('[data-testid="source-processed"], text=Ready, text=Processed', { 
        timeout: 60000 
      });

      console.log('Looking for podcast generation option...');

      // Look for Audio Overview, Podcast, or similar option
      const podcastSelectors = [
        '[data-testid="audio-overview"]',
        'text=Audio Overview',
        'text=Generate podcast',
        'text=Create podcast',
        '[aria-label*="podcast"]',
        '[aria-label*="audio"]'
      ];

      let podcastButton = null;
      for (const selector of podcastSelectors) {
        try {
          podcastButton = await page.locator(selector).first();
          if (await podcastButton.isVisible()) break;
        } catch (e) {
          continue;
        }
      }

      if (!podcastButton) {
        throw new Error('Could not find podcast generation option');
      }

      await podcastButton.click();

      console.log('Generating podcast...');

      // Wait for podcast generation to complete
      await page.waitForSelector('[data-testid="audio-ready"], text=Download, [download]', { 
        timeout: 180000 // 3 minutes for podcast generation
      });

      console.log('Podcast generated, downloading...');

      // Find and click download button
      const downloadButton = await page.locator('[data-testid="download"], text=Download, [download]').first();
      
      // Set up download handling
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        downloadButton.click()
      ]);

      // Get the downloaded file content
      const downloadedFile = await download.path();
      const audioContent = await Deno.readFile(downloadedFile!);
      
      // Convert to base64 for transmission
      const base64Audio = btoa(String.fromCharCode(...audioContent));

      console.log('NotebookLM automation completed successfully');

      return new Response(JSON.stringify({ 
        success: true,
        audioContent: base64Audio,
        fileName: download.suggestedFilename() || 'podcast.mp3',
        message: 'Podcast generated and downloaded successfully from NotebookLM'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } finally {
      await browser.close();
    }

  } catch (error: any) {
    console.error('NotebookLM automation error:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'Failed to automate NotebookLM process'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});