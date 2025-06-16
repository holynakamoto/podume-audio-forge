
import * as pdfjsLib from 'pdfjs-dist';

// Simple and reliable worker configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ProgressCallback {
  (progress: number): void;
}

export const extractTextFromPDF = async (
  file: File, 
  onProgress?: ProgressCallback
): Promise<string> => {
  console.log('Starting PDF extraction for:', file.name);
  
  onProgress?.(10);
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    console.log('File loaded, size:', arrayBuffer.byteLength);
    
    onProgress?.(20);
    
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    console.log('PDF loaded, pages:', pdf.numPages);
    
    onProgress?.(30);
    
    let extractedText = '';
    const totalPages = pdf.numPages;
    
    for (let i = 1; i <= totalPages; i++) {
      console.log(`Processing page ${i}/${totalPages}`);
      
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      extractedText += pageText + '\n';
      
      const progress = 30 + (i / totalPages) * 60;
      onProgress?.(progress);
    }
    
    onProgress?.(100);
    console.log('PDF extraction complete, text length:', extractedText.length);
    
    return extractedText.trim();
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw error;
  }
};
