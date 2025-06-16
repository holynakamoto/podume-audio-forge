
import * as pdfjsLib from 'pdfjs-dist';

// Try to set up the worker with local fallback
const setupWorker = () => {
  try {
    // First try to use a local worker (this will work better in most environments)
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.js',
      import.meta.url
    ).toString();
    console.log('Worker source set to local:', pdfjsLib.GlobalWorkerOptions.workerSrc);
  } catch (localError) {
    console.warn('Local worker setup failed, trying CDN:', localError);
    try {
      // Fallback to CDN without version in path
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
      console.log('Worker source set to CDN:', pdfjsLib.GlobalWorkerOptions.workerSrc);
    } catch (cdnError) {
      console.error('Both local and CDN worker setup failed:', cdnError);
      throw new Error('Failed to setup PDF worker');
    }
  }
};

// Initialize worker
try {
  setupWorker();
} catch (workerError) {
  console.error('Worker initialization failed:', workerError);
}

export interface ProgressCallback {
  (progress: number): void;
}

export const extractTextFromPDF = async (
  file: File, 
  onProgress?: ProgressCallback
): Promise<string> => {
  console.log('=== PDF EXTRACTION START ===');
  console.log('File details:', {
    name: file.name,
    size: file.size,
    type: file.type
  });
  
  onProgress?.(5);
  
  try {
    // Convert file to array buffer
    console.log('Converting file to array buffer...');
    const arrayBuffer = await file.arrayBuffer();
    console.log('Array buffer created successfully, size:', arrayBuffer.byteLength);
    
    onProgress?.(15);
    
    // Create PDF document with better error handling
    console.log('Creating PDF document...');
    let pdf: any;
    
    try {
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        verbosity: 0, // Reduce verbosity to avoid console spam
        // Disable worker if it failed to load
        useWorkerFetch: false,
        isEvalSupported: false,
        // Add timeout
        maxImageSize: 1024 * 1024, // 1MB max image size
      });
      
      pdf = await Promise.race([
        loadingTask.promise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('PDF loading timeout after 30 seconds')), 30000)
        )
      ]);
      
      console.log('PDF loaded successfully:', {
        numPages: pdf.numPages
      });
    } catch (pdfError) {
      console.error('PDF loading failed:', pdfError);
      
      // Provide specific error messages
      if (pdfError instanceof Error) {
        if (pdfError.message.includes('Invalid PDF')) {
          throw new Error('This file appears to be corrupted or is not a valid PDF. Please try a different file or paste your text directly.');
        } else if (pdfError.message.includes('password')) {
          throw new Error('This PDF is password protected. Please use an unprotected PDF or paste your text directly.');
        } else if (pdfError.message.includes('timeout')) {
          throw new Error('PDF processing timed out. The file may be too complex. Please try a simpler PDF or paste your text directly.');
        } else if (pdfError.message.includes('worker')) {
          throw new Error('PDF processing failed. Please try pasting your text directly instead.');
        }
      }
      
      throw new Error('Failed to process PDF. Please try pasting your resume text directly instead.');
    }
    
    onProgress?.(25);
    
    let extractedText = '';
    const totalPages = pdf.numPages;
    
    console.log(`Extracting text from ${totalPages} pages...`);
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      try {
        console.log(`Processing page ${pageNum}/${totalPages}...`);
        
        const page = await Promise.race([
          pdf.getPage(pageNum),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Page load timeout')), 15000)
          )
        ]);
        
        const textContent = await Promise.race([
          page.getTextContent(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Text extraction timeout')), 15000)
          )
        ]);
        
        const pageText = textContent.items
          .filter((item: any) => item.str && typeof item.str === 'string' && item.str.trim().length > 0)
          .map((item: any) => item.str.trim())
          .join(' ');
        
        if (pageText.length > 0) {
          extractedText += pageText + '\n\n';
          console.log(`Page ${pageNum}: ${pageText.length} characters extracted`);
        }
        
        // Update progress
        const progress = 25 + ((pageNum / totalPages) * 70);
        onProgress?.(Math.round(progress));
        
      } catch (pageError) {
        console.error(`Error on page ${pageNum}:`, pageError);
        // Continue with other pages
      }
    }
    
    onProgress?.(100);
    
    const finalText = extractedText.trim();
    console.log('=== PDF EXTRACTION COMPLETE ===');
    console.log('Results:', {
      textLength: finalText.length,
      pageCount: totalPages
    });
    
    if (finalText.length < 50) {
      throw new Error('Could not extract enough readable text from this PDF. This may be a scanned document or contain mostly images. Please try pasting your resume text directly instead.');
    }
    
    return finalText;
    
  } catch (error) {
    console.error('=== PDF EXTRACTION ERROR ===');
    console.error('Error details:', error);
    
    // If it's already a user-friendly error, re-throw it
    if (error instanceof Error && (
      error.message.includes('Please try pasting') ||
      error.message.includes('paste your text directly')
    )) {
      throw error;
    }
    
    // Generic fallback error
    throw new Error('Unable to process this PDF file. Please copy and paste your resume text directly instead.');
  }
};
