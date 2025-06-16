
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

// Set up the worker with proper Vite configuration
const setupWorker = () => {
  try {
    // Use the ES module version of the worker for Vite compatibility
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
    console.log('Worker source set to local:', pdfjsLib.GlobalWorkerOptions.workerSrc);
  } catch (localError) {
    console.warn('Local worker setup failed, trying CDN:', localError);
    try {
      // Fallback to CDN with mjs extension
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      console.log('Worker source set to CDN:', pdfjsLib.GlobalWorkerOptions.workerSrc);
    } catch (cdnError) {
      console.error('Both local and CDN worker setup failed:', cdnError);
      throw new Error('Failed to setup PDF worker');
    }
  }
};

// Initialize worker
let workerInitialized = false;
try {
  setupWorker();
  workerInitialized = true;
} catch (workerError) {
  console.error('Worker initialization failed:', workerError);
  workerInitialized = false;
}

export interface ProgressCallback {
  (progress: number): void;
}

// Worker-less PDF processing fallback
const extractTextWithoutWorker = async (
  arrayBuffer: ArrayBuffer,
  onProgress?: ProgressCallback
): Promise<string> => {
  console.log('Attempting worker-less PDF processing...');
  onProgress?.(10);
  
  try {
    // Completely disable worker for this processing
    const originalWorkerSrc = pdfjsLib.GlobalWorkerOptions.workerSrc;
    pdfjsLib.GlobalWorkerOptions.workerSrc = null;
    
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      verbosity: 0,
      useWorkerFetch: false,
      isEvalSupported: false,
      maxImageSize: 512 * 512, // Smaller image size for worker-less mode
    });
    
    const pdf: PDFDocumentProxy = await Promise.race([
      loadingTask.promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('PDF loading timeout')), 20000)
      )
    ]);
    
    onProgress?.(30);
    
    let extractedText = '';
    const totalPages = Math.min(pdf.numPages, 5); // Limit pages in worker-less mode
    
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page: PDFPageProxy = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .filter((item: any) => item.str && typeof item.str === 'string')
        .map((item: any) => item.str.trim())
        .join(' ');
      
      if (pageText.length > 0) {
        extractedText += pageText + '\n\n';
      }
      
      onProgress?.(30 + ((pageNum / totalPages) * 60));
    }
    
    // Restore original worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = originalWorkerSrc;
    
    onProgress?.(100);
    return extractedText.trim();
    
  } catch (error) {
    console.error('Worker-less processing failed:', error);
    throw new Error('Could not process PDF without worker. Please try pasting your text directly.');
  }
};

export const extractTextFromPDF = async (
  file: File, 
  onProgress?: ProgressCallback
): Promise<string> => {
  console.log('=== PDF EXTRACTION START ===');
  console.log('Worker initialized:', workerInitialized);
  
  onProgress?.(5);
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    onProgress?.(15);
    
    // Try with worker first if available
    if (workerInitialized) {
      try {
        console.log('Attempting PDF processing with worker...');
        const pdf: PDFDocumentProxy = await pdfjsLib.getDocument({
          data: arrayBuffer,
          verbosity: 0,
          useWorkerFetch: true, // Enable worker fetch for better compatibility
          isEvalSupported: false,
          maxImageSize: 1024 * 1024,
        }).promise;
        
        onProgress?.(25);
        
        let extractedText = '';
        const totalPages = pdf.numPages;
        
        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
          const page: PDFPageProxy = await Promise.race([
            pdf.getPage(pageNum),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Page load timeout')), 10000)
            )
          ]);
          
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .filter((item: any) => item.str && typeof item.str === 'string')
            .map((item: any) => item.str.trim())
            .join(' ');
          
          if (pageText.length > 0) {
            extractedText += pageText + '\n\n';
          }
          
          onProgress?.(25 + ((pageNum / totalPages) * 70));
        }
        
        onProgress?.(100);
        const finalText = extractedText.trim();
        
        if (finalText.length < 50) {
          throw new Error('Insufficient text extracted');
        }
        
        console.log('=== PDF EXTRACTION SUCCESS (WITH WORKER) ===');
        return finalText;
        
      } catch (workerError) {
        console.warn('Worker-based extraction failed, trying fallback:', workerError);
        
        // Check for specific worker errors
        if (workerError instanceof Error && 
            (workerError.message.includes('Failed to fetch dynamically imported module') ||
             workerError.message.includes('Setting up fake worker failed'))) {
          console.log('Detected worker loading failure, switching to fallback mode');
        }
        
        // Try worker-less fallback
        return await extractTextWithoutWorker(arrayBuffer, onProgress);
      }
    } else {
      // Worker not available, use fallback directly
      console.log('Worker not initialized, using fallback mode');
      return await extractTextWithoutWorker(arrayBuffer, onProgress);
    }
    
  } catch (error) {
    console.error('=== PDF EXTRACTION ERROR ===', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Please try pasting')) {
        throw error;
      } else if (error.message.includes('Invalid PDF')) {
        throw new Error('This file appears to be corrupted or is not a valid PDF. Please try pasting your text directly.');
      } else if (error.message.includes('password')) {
        throw new Error('This PDF is password protected. Please use an unprotected PDF or paste your text directly.');
      }
    }
    
    throw new Error('Unable to process this PDF file. Please copy and paste your resume text directly instead.');
  }
};
