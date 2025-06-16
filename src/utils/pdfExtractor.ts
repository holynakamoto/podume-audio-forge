
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

export interface ProgressCallback {
  (progress: number): void;
}

// Configure PDF.js to avoid worker issues completely
if (typeof window !== 'undefined') {
  // Set workerSrc to a data URL to avoid external fetching
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'data:application/javascript;base64,';
}

// Main PDF text extraction function
export const extractTextFromPDF = async (
  file: File,
  onProgress?: ProgressCallback
): Promise<string> => {
  console.log('Starting PDF text extraction...');
  onProgress?.(5);

  try {
    const arrayBuffer = await file.arrayBuffer();
    onProgress?.(10);

    // Configure PDF.js with options that avoid worker usage
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      verbosity: 0,
      useWorkerFetch: false,
      isEvalSupported: false,
      maxImageSize: 256 * 256,
      // Use standardFontDataUrl: null to prevent font fetching
      standardFontDataUrl: null,
    });

    // Load PDF document
    const pdf: PDFDocumentProxy = await loadingTask.promise;
    onProgress?.(30);

    // Extract text from all pages
    const numPages = pdf.numPages;
    const textContents: string[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page: PDFPageProxy = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ('str' in item ? item.str : ''))
        .filter((str) => str.trim().length > 0)
        .join(' ');
      textContents.push(pageText);
      onProgress?.(30 + (pageNum / numPages) * 60);
    }

    // Clean up resources
    await pdf.cleanup();
    loadingTask.destroy();
    onProgress?.(100);

    const extractedText = textContents.join('\n');
    
    if (extractedText.length < 50) {
      throw new Error('Insufficient text extracted from PDF');
    }

    return extractedText;
  } catch (error) {
    console.error('PDF extraction failed:', error);
    let userMessage = 'Could not process PDF. Please try pasting your text directly.';

    if (error instanceof Error) {
      if (error.message.includes('worker') || error.message.includes('fetch')) {
        userMessage = 'PDF processing failed due to internal configuration issues. Please paste your text directly.';
      } else if (error.message.includes('invalid')) {
        userMessage = 'Invalid PDF file. Please upload a valid PDF or paste the text directly.';
      }
    }

    throw new Error(userMessage);
  }
};
