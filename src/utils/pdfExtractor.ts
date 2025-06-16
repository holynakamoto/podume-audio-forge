
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker - use a more reliable approach for development
if (typeof window !== 'undefined') {
  // For browser environment, use the bundled worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
}

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
      // Disable worker for more reliable loading in dev
      disableWorker: false,
      // Add more robust options
      verbosity: 0
    });
    console.log('Loading task created');
    
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
        extractedText += pageText + '\n';
        
        // Update progress: 25% + (page progress * 65%)
        const pageProgress = (i / totalPages) * 65;
        const newProgress = 25 + pageProgress;
        onProgress?.(newProgress);
        console.log(`Progress updated to ${newProgress}% after page ${i}`);
        
      } catch (pageError) {
        console.error(`ERROR processing page ${i}:`, pageError);
        // Continue with other pages even if one fails
      }
    }
    
    onProgress?.(95);
    console.log('All pages processed, setting progress to 95%');
    console.log('Total extracted text length:', extractedText.length);
    console.log('First 100 chars:', extractedText.substring(0, 100));
    console.log('=== PDF EXTRACTION COMPLETE ===');
    
    return extractedText.trim();
  } catch (error) {
    console.error('=== PDF EXTRACTION ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    throw error;
  }
};
