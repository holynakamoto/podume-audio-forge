
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

export interface ProgressCallback {
  (progress: number): void;
}

// Main PDF text extraction function
export const extractTextFromPDF = async (
  file: File,
  onProgress?: ProgressCallback
): Promise<string> => {
  console.log('Starting PDF text extraction...', { fileName: file.name, fileSize: file.size });
  onProgress?.(5);

  try {
    console.log('Converting file to array buffer...');
    const arrayBuffer = await file.arrayBuffer();
    console.log('Array buffer created, size:', arrayBuffer.byteLength);
    onProgress?.(15);

    console.log('Configuring PDF.js document loader...');
    // Use minimal configuration to avoid any worker or external resource issues
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      verbosity: 0,
      // Disable all external fetching and workers
      useWorkerFetch: false,
      isEvalSupported: false,
      // Set very conservative limits
      maxImageSize: 64 * 64,
      cMapPacked: false,
      // Disable font loading completely
      standardFontDataUrl: null,
      useSystemFonts: false,
    });

    console.log('Loading PDF document...');
    const pdf: PDFDocumentProxy = await loadingTask.promise;
    console.log('PDF loaded successfully, pages:', pdf.numPages);
    onProgress?.(35);

    // Extract text from all pages (limit to first 5 pages for performance)
    const numPages = Math.min(pdf.numPages, 5);
    const textContents: string[] = [];

    console.log(`Processing ${numPages} pages...`);
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      console.log(`Processing page ${pageNum}...`);
      try {
        const page: PDFPageProxy = await pdf.getPage(pageNum);
        console.log(`Page ${pageNum} loaded, extracting text...`);
        
        const textContent = await page.getTextContent();
        console.log(`Page ${pageNum} text items:`, textContent.items.length);
        
        const pageText = textContent.items
          .map((item) => ('str' in item ? item.str : ''))
          .filter((str) => str.trim().length > 0)
          .join(' ');
        
        textContents.push(pageText);
        console.log(`Page ${pageNum} processed, text length:`, pageText.length);
        onProgress?.(35 + (pageNum / numPages) * 55);
      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError);
        // Continue with other pages
      }
    }

    // Clean up resources
    console.log('Cleaning up PDF resources...');
    await pdf.cleanup();
    loadingTask.destroy();
    onProgress?.(100);

    const extractedText = textContents.join('\n');
    console.log('PDF extraction completed. Total text length:', extractedText.length);
    
    if (extractedText.length < 50) {
      console.warn('Very little text extracted from PDF');
      throw new Error('Insufficient text extracted from PDF');
    }

    return extractedText;
  } catch (error) {
    console.error('PDF extraction failed:', error);
    let userMessage = 'Could not process PDF. Please try pasting your text directly.';

    if (error instanceof Error) {
      console.error('Error details:', { message: error.message, stack: error.stack });
      
      if (error.message.includes('worker') || error.message.includes('fetch') || error.message.includes('Setting up fake worker failed')) {
        userMessage = 'PDF processing failed due to internal configuration issues. Please paste your text directly.';
      } else if (error.message.includes('invalid') || error.message.includes('Invalid PDF')) {
        userMessage = 'Invalid PDF file. Please upload a valid PDF or paste the text directly.';
      } else if (error.message.includes('Insufficient text')) {
        userMessage = 'Could not extract readable text from this PDF. Please try pasting your resume text instead.';
      }
    }

    throw new Error(userMessage);
  }
};
