
import * as pdfParse from 'pdf-parse';

export interface ProgressCallback {
  (progress: number): void;
}

// Main PDF text extraction function using pdf-parse
export const extractTextFromPDF = async (
  file: File,
  onProgress?: ProgressCallback
): Promise<string> => {
  console.log('Starting PDF text extraction with pdf-parse...', { fileName: file.name, fileSize: file.size });
  onProgress?.(5);

  try {
    console.log('Converting file to array buffer...');
    const arrayBuffer = await file.arrayBuffer();
    console.log('Array buffer created, size:', arrayBuffer.byteLength);
    onProgress?.(25);

    console.log('Converting array buffer to Buffer...');
    const buffer = Buffer.from(arrayBuffer);
    onProgress?.(50);

    console.log('Parsing PDF with pdf-parse...');
    const data = await pdfParse(buffer);
    console.log('PDF parsed successfully');
    onProgress?.(85);

    const extractedText = data.text;
    console.log('PDF extraction completed. Total text length:', extractedText.length);
    
    if (extractedText.length < 50) {
      console.warn('Very little text extracted from PDF');
      throw new Error('Insufficient text extracted from PDF');
    }

    onProgress?.(100);
    return extractedText;
  } catch (error) {
    console.error('PDF extraction failed:', error);
    let userMessage = 'Could not process PDF. Please try pasting your text directly.';

    if (error instanceof Error) {
      console.error('Error details:', { message: error.message, stack: error.stack });
      
      if (error.message.includes('invalid') || error.message.includes('Invalid PDF')) {
        userMessage = 'Invalid PDF file. Please upload a valid PDF or paste the text directly.';
      } else if (error.message.includes('Insufficient text')) {
        userMessage = 'Could not extract readable text from this PDF. Please try pasting your resume text instead.';
      }
    }

    throw new Error(userMessage);
  }
};
