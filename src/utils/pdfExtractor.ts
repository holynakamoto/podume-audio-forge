
import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker with better error handling
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  console.log('Worker source set to:', pdfjsLib.GlobalWorkerOptions.workerSrc);
} catch (workerError) {
  console.error('Failed to set PDF.js worker:', workerError);
}

export interface ProgressCallback {
  (progress: number): void;
}

export const extractTextFromPDF = async (
  file: File, 
  onProgress?: ProgressCallback
): Promise<string> => {
  console.log('=== PDF EXTRACTION START (pdfjs-dist) ===');
  console.log('PDF.js version:', pdfjsLib.version);
  console.log('Worker source:', pdfjsLib.GlobalWorkerOptions.workerSrc);
  console.log('File details:', {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: new Date(file.lastModified).toISOString()
  });
  
  onProgress?.(5);
  
  try {
    // Convert file to array buffer with error handling
    console.log('Converting file to array buffer...');
    let arrayBuffer: ArrayBuffer;
    try {
      arrayBuffer = await file.arrayBuffer();
      console.log('Array buffer created successfully, size:', arrayBuffer.byteLength);
    } catch (bufferError) {
      console.error('Failed to create array buffer:', bufferError);
      throw new Error(`Failed to read file: ${bufferError instanceof Error ? bufferError.message : 'Unknown error'}`);
    }
    
    onProgress?.(15);
    
    // Create PDF document using pdfjs-dist with detailed error handling
    console.log('Creating PDF document with pdfjs-dist...');
    let pdf: any;
    try {
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        verbosity: 1 // Enable verbose logging
      });
      
      // Add progress listener for loading
      loadingTask.onProgress = (progress: any) => {
        console.log('PDF loading progress:', progress);
      };
      
      pdf = await loadingTask.promise;
      console.log('PDF loaded successfully:', {
        numPages: pdf.numPages,
        fingerprints: pdf.fingerprints,
        info: 'PDF document created'
      });
    } catch (pdfError) {
      console.error('Failed to load PDF document:', pdfError);
      console.error('PDF error details:', {
        name: pdfError instanceof Error ? pdfError.name : 'Unknown',
        message: pdfError instanceof Error ? pdfError.message : 'Unknown error',
        stack: pdfError instanceof Error ? pdfError.stack : 'No stack trace'
      });
      
      if (pdfError instanceof Error) {
        if (pdfError.message.includes('Invalid PDF')) {
          throw new Error('The uploaded file appears to be corrupted or is not a valid PDF.');
        } else if (pdfError.message.includes('password')) {
          throw new Error('This PDF is password protected. Please use an unprotected PDF.');
        } else if (pdfError.message.includes('worker')) {
          throw new Error('PDF worker failed to load. Please try again or paste your text directly.');
        }
      }
      
      throw new Error(`Failed to load PDF: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`);
    }
    
    onProgress?.(25);
    
    let extractedText = '';
    const totalPages = pdf.numPages;
    
    console.log(`Starting text extraction from ${totalPages} pages...`);
    
    // Extract text from each page with detailed error handling
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      console.log(`Processing page ${pageNum}/${totalPages}...`);
      
      try {
        // Get page with timeout
        const page = await Promise.race([
          pdf.getPage(pageNum),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Page load timeout')), 10000)
          )
        ]);
        console.log(`Page ${pageNum} loaded successfully`);
        
        // Get text content with timeout
        const textContent = await Promise.race([
          page.getTextContent(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Text extraction timeout')), 10000)
          )
        ]);
        
        console.log(`Page ${pageNum} text extraction completed:`, {
          itemCount: textContent.items.length,
          hasItems: textContent.items.length > 0
        });
        
        // Extract and process text from all items
        const pageText = textContent.items
          .filter((item: any) => {
            const hasStr = item.str && typeof item.str === 'string';
            const hasTrimmedStr = hasStr && item.str.trim().length > 0;
            return hasTrimmedStr;
          })
          .map((item: any) => item.str.trim())
          .join(' ');
        
        if (pageText.length > 0) {
          extractedText += pageText + '\n\n';
          console.log(`Page ${pageNum} text extracted: ${pageText.length} characters`);
          console.log(`Page ${pageNum} text preview:`, pageText.substring(0, 100) + '...');
        } else {
          console.log(`Page ${pageNum} contained no readable text`);
        }
        
        // Update progress
        const progress = 25 + ((pageNum / totalPages) * 70);
        onProgress?.(Math.round(progress));
        
      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, {
          error: pageError,
          name: pageError instanceof Error ? pageError.name : 'Unknown',
          message: pageError instanceof Error ? pageError.message : 'Unknown error',
          stack: pageError instanceof Error ? pageError.stack : 'No stack trace'
        });
        
        // Continue with other pages even if one fails
        console.log(`Continuing with remaining pages despite error on page ${pageNum}`);
      }
    }
    
    onProgress?.(100);
    
    const finalText = extractedText.trim();
    console.log('=== PDF EXTRACTION COMPLETE ===');
    console.log('Final extraction results:', {
      textLength: finalText.length,
      pageCount: totalPages,
      hasContent: finalText.length > 0
    });
    console.log('Text preview (first 300 chars):', finalText.substring(0, 300) + '...');
    
    if (finalText.length < 10) {
      console.error('Extracted text too short:', {
        length: finalText.length,
        content: finalText
      });
      throw new Error('Extracted text is too short. The PDF may contain images, be scanned, or have unreadable text.');
    }
    
    return finalText;
    
  } catch (error) {
    console.error('=== PDF EXTRACTION ERROR ===');
    console.error('Complete error details:', {
      error: error,
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      type: typeof error
    });
    
    // Provide more helpful error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF') || error.message.includes('corrupted')) {
        throw new Error('The uploaded file appears to be corrupted or is not a valid PDF.');
      } else if (error.message.includes('password') || error.message.includes('Password')) {
        throw new Error('This PDF is password protected. Please use an unprotected PDF or paste your text directly.');
      } else if (error.message.includes('worker') || error.message.includes('Worker')) {
        throw new Error('PDF processing failed due to worker issues. Please try again or paste your text directly.');
      } else if (error.message.includes('timeout')) {
        throw new Error('PDF processing timed out. The file may be too complex. Please try a simpler PDF or paste your text directly.');
      } else if (error.message.includes('fetch') || error.message.includes('network')) {
        throw new Error('Network error while processing PDF. Please check your connection and try again.');
      }
      
      // If it's already a user-friendly error, re-throw it
      if (error.message.includes('Please try') || error.message.includes('paste your text')) {
        throw error;
      }
    }
    
    // Fallback error message
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}. Please try pasting your resume text instead.`);
  }
};
