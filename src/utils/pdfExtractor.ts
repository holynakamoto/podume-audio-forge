
export interface ProgressCallback {
  (progress: number): void;
}

// Simple PDF text extraction function for browser environment
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
    onProgress?.(25);

    // Simple PDF header validation
    const uint8Array = new Uint8Array(arrayBuffer);
    const pdfHeader = new TextDecoder().decode(uint8Array.slice(0, 8));
    
    if (!pdfHeader.startsWith('%PDF-')) {
      throw new Error('Invalid PDF file format');
    }

    onProgress?.(50);

    console.log('PDF file validated successfully');
    onProgress?.(75);

    // Since complex PDF parsing libraries don't work reliably in browsers,
    // we'll throw a helpful error that guides users to paste text instead
    console.log('PDF processing requires server-side handling or text paste mode');
    onProgress?.(100);

    throw new Error('PDF text extraction is not available in browser mode. Please use the "Paste Text" option instead for best results.');

  } catch (error) {
    console.error('PDF extraction failed:', error);
    let userMessage = 'Could not process PDF. Please try pasting your text directly.';

    if (error instanceof Error) {
      console.error('Error details:', { message: error.message, stack: error.stack });
      
      if (error.message.includes('Invalid PDF file format')) {
        userMessage = 'Invalid PDF file. Please upload a valid PDF or paste the text directly.';
      } else if (error.message.includes('Please use the "Paste Text" option')) {
        userMessage = error.message;
      }
    }

    throw new Error(userMessage);
  }
};
