
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker with multiple fallback approaches
const configureWorker = () => {
  console.log('Configuring PDF.js worker...');
  console.log('PDF.js version:', pdfjsLib.version);
  
  // Try multiple worker configurations for maximum compatibility
  try {
    // First attempt: Use the bundled worker from node_modules
    if (typeof window !== 'undefined') {
      // For browser environment, try the bundled worker first
      const workerUrl = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString();
      console.log('Attempting to use bundled worker:', workerUrl);
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
    }
  } catch (error) {
    console.warn('Bundled worker failed, falling back to CDN:', error);
    // Fallback to CDN
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }
  
  console.log('Worker configured with:', pdfjsLib.GlobalWorkerOptions.workerSrc);
};

// Initialize worker
configureWorker();

export interface ProgressCallback {
  (progress: number): void;
}

export const extractTextFromPDF = async (
  file: File, 
  onProgress?: ProgressCallback
): Promise<string> => {
  console.log('=== PDF EXTRACTION START ===');
  console.log('File name:', file.name);
  console.log('File size:', file.size);
  console.log('File type:', file.type);
  console.log('Worker source:', pdfjsLib.GlobalWorkerOptions.workerSrc);
  
  onProgress?.(5);
  console.log('Progress set to 5%');
  
  try {
    console.log('Reading file as array buffer...');
    const arrayBuffer = await file.arrayBuffer();
    console.log('Array buffer created, size:', arrayBuffer.byteLength);
    onProgress?.(15);
    console.log('Progress set to 15%');
    
    console.log('Loading PDF document...');
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      verbosity: 1, // Increase verbosity to see more details
      // Add additional options for better compatibility
      standardFontDataUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/standard_fonts/`,
      cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
      cMapPacked: true
    });
    console.log('Loading task created');
    
    // Add progress tracking for document loading
    loadingTask.onProgress = (progress) => {
      console.log('Loading progress:', progress);
      if (progress.total) {
        const loadProgress = 15 + (progress.loaded / progress.total) * 10;
        onProgress?.(loadProgress);
      }
    };
    
    console.log('Awaiting PDF document...');
    const pdf = await loadingTask.promise;
    console.log('PDF loaded successfully, pages:', pdf.numPages);
    onProgress?.(25);
    console.log('Progress set to 25%');
    
    let extractedText = '';
    const totalPages = pdf.numPages;
    
    console.log(`Starting to process ${totalPages} pages...`);
    
    for (let i = 1; i <= totalPages; i++) {
      console.log(`=== Processing page ${i}/${totalPages} ===`);
      
      try {
        console.log(`Getting page ${i}...`);
        const page = await pdf.getPage(i);
        console.log(`Page ${i} loaded`);
        
        console.log(`Getting text content for page ${i}...`);
        const textContent = await page.getTextContent();
        console.log(`Text content loaded for page ${i}, items:`, textContent.items.length);
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        console.log(`Page ${i} text extracted, length: ${pageText.length}`);
        console.log(`Page ${i} first 50 chars:`, pageText.substring(0, 50));
        extractedText += pageText + '\n';
        
        // Update progress: 25% + (page progress * 65%)
        const pageProgress = (i / totalPages) * 65;
        const newProgress = 25 + pageProgress;
        onProgress?.(newProgress);
        console.log(`Progress updated to ${newProgress}% after page ${i}`);
        
      } catch (pageError) {
        console.error(`ERROR processing page ${i}:`, pageError);
        console.error('Page error details:', {
          message: pageError.message,
          stack: pageError.stack,
          name: pageError.name
        });
        // Continue with other pages even if one fails
      }
    }
    
    onProgress?.(95);
    console.log('All pages processed, setting progress to 95%');
    console.log('Total extracted text length:', extractedText.length);
    console.log('First 200 chars:', extractedText.substring(0, 200));
    console.log('=== PDF EXTRACTION COMPLETE ===');
    
    return extractedText.trim();
  } catch (error) {
    console.error('=== PDF EXTRACTION ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    console.error('Error stack:', error.stack);
    
    // Try to provide more specific error information
    if (error.message.includes('worker')) {
      console.error('Worker-related error detected. Current worker src:', pdfjsLib.GlobalWorkerOptions.workerSrc);
      // Try reconfiguring worker as fallback
      try {
        console.log('Attempting worker reconfiguration...');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        console.log('Worker reconfigured to:', pdfjsLib.GlobalWorkerOptions.workerSrc);
      } catch (workerError) {
        console.error('Worker reconfiguration failed:', workerError);
      }
    }
    
    throw error;
  }
};
