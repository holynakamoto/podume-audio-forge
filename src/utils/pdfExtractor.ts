
import { pdfjs, getDocument } from 'react-pdf';

// Set up the worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export interface ProgressCallback {
  (progress: number): void;
}

export const extractTextFromPDF = async (
  file: File, 
  onProgress?: ProgressCallback
): Promise<string> => {
  console.log('=== PDF EXTRACTION START (react-pdf) ===');
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
    console.log('Array buffer created, size:', arrayBuffer.byteLength);
    
    onProgress?.(15);
    
    // Create PDF document using react-pdf
    console.log('Creating PDF document with react-pdf...');
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    console.log('PDF loaded successfully:', {
      numPages: pdf.numPages
    });
    
    onProgress?.(25);
    
    let extractedText = '';
    const totalPages = pdf.numPages;
    
    console.log(`Starting text extraction from ${totalPages} pages...`);
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      console.log(`Processing page ${pageNum}/${totalPages}...`);
      
      try {
        const page = await pdf.getPage(pageNum);
        console.log(`Page ${pageNum} loaded`);
        
        const textContent = await page.getTextContent();
        console.log(`Page ${pageNum} text items:`, textContent.items.length);
        
        // Extract text from all items
        const pageText = textContent.items
          .filter((item: any) => item.str && item.str.trim())
          .map((item: any) => item.str.trim())
          .join(' ');
        
        if (pageText.length > 0) {
          extractedText += pageText + '\n\n';
          console.log(`Page ${pageNum} extracted ${pageText.length} characters`);
        } else {
          console.log(`Page ${pageNum} contained no readable text`);
        }
        
        // Update progress
        const progress = 25 + ((pageNum / totalPages) * 70);
        onProgress?.(Math.round(progress));
        
      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError);
        // Continue with other pages even if one fails
      }
    }
    
    onProgress?.(100);
    
    const finalText = extractedText.trim();
    console.log('=== PDF EXTRACTION COMPLETE ===');
    console.log('Final extracted text length:', finalText.length);
    console.log('Text preview:', finalText.substring(0, 200) + '...');
    
    if (finalText.length < 10) {
      throw new Error('Extracted text is too short. The PDF may contain images or unreadable text.');
    }
    
    return finalText;
    
  } catch (error) {
    console.error('=== PDF EXTRACTION ERROR ===');
    console.error('Error details:', error);
    
    // Provide more helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF')) {
        throw new Error('The uploaded file appears to be corrupted or is not a valid PDF.');
      } else if (error.message.includes('Password')) {
        throw new Error('This PDF is password protected. Please use an unprotected PDF or paste your text directly.');
      }
    }
    
    throw new Error('Failed to extract text from PDF. Please try pasting your resume text instead.');
  }
};
