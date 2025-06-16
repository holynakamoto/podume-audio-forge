
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Set up PDF.js worker
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export interface ProgressCallback {
  (progress: number): void;
}

// PDF text extraction function using pdfjs-dist
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

    // Load PDF document
    console.log('Loading PDF document...');
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    console.log('PDF loaded successfully, pages:', pdf.numPages);
    onProgress?.(25);

    let fullText = '';
    const maxPages = Math.min(pdf.numPages, 10); // Limit to first 10 pages for performance

    // Extract text from each page
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      console.log(`Processing page ${pageNum}/${maxPages}`);
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
      
      // Update progress
      const progress = 25 + ((pageNum / maxPages) * 60);
      onProgress?.(progress);
    }

    console.log('PDF extraction completed. Total text length:', fullText.length);
    onProgress?.(90);

    if (fullText.trim().length < 50) {
      throw new Error('Could not extract sufficient text from PDF. The file may be image-based or password protected.');
    }

    onProgress?.(100);
    return fullText.trim();

  } catch (error) {
    console.error('PDF extraction failed:', error);
    let userMessage = 'Could not process PDF. Please try pasting your text directly.';

    if (error instanceof Error) {
      console.error('Error details:', { message: error.message, stack: error.stack });
      
      if (error.message.includes('Invalid PDF') || error.message.includes('password')) {
        userMessage = 'Invalid or password-protected PDF file. Please upload a valid PDF or paste the text directly.';
      } else if (error.message.includes('Could not extract sufficient text')) {
        userMessage = error.message + ' Please try pasting your resume text instead.';
      }
    }

    throw new Error(userMessage);
  }
};
