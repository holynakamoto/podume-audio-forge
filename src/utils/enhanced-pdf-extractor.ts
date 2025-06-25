
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { setupPDFWorker, testPDFWorker } from './pdf/worker-setup';
import { debugPDFFile, logPDFError, validatePDFFile } from './pdf/file-validation';
import { cleanExtractedText, extractStructuredTextFromPage } from './pdf/text-extraction';
import { parseResumeStructure, calculateExtractionConfidence } from './pdf/resume-parser';
import type { ProgressCallback, PDFExtractionResult } from './pdf/types';

// Enhanced PDF text extraction with improved error handling
export const extractTextFromPDFEnhanced = async (
  file: File,
  onProgress?: ProgressCallback
): Promise<PDFExtractionResult> => {
  console.log('=== ENHANCED PDF EXTRACTION START ===');
  console.log('Current worker source:', GlobalWorkerOptions.workerSrc);
  
  // Debug file information
  const debugInfo = await debugPDFFile(file);
  
  // Ensure worker is properly set up
  if (!GlobalWorkerOptions.workerSrc) {
    console.log('Worker not initialized, setting up...');
    setupPDFWorker();
  }
  
  // Test worker readiness
  const workerReady = await testPDFWorker();
  if (!workerReady) {
    console.error('PDF worker is not properly configured, attempting reset...');
    setupPDFWorker();
    
    // Give it one more chance
    await new Promise(resolve => setTimeout(resolve, 100));
    const retryWorkerReady = await testPDFWorker();
    if (!retryWorkerReady) {
      throw new Error('PDF processing is currently unavailable. Please refresh the page and try again, or use the "Paste Text" option.');
    }
  }
  
  onProgress?.(5);

  try {
    console.log('Converting file to array buffer...');
    const arrayBuffer = await file.arrayBuffer();
    console.log('Array buffer created, size:', arrayBuffer.byteLength);
    onProgress?.(15);

    // Validate file
    validatePDFFile(arrayBuffer, debugInfo);

    // Load PDF document with enhanced configuration
    console.log('Loading PDF document...');
    let pdf;
    try {
      pdf = await getDocument({ 
        data: arrayBuffer,
        useSystemFonts: true,
        disableFontFace: false,
        isEvalSupported: false,
        maxImageSize: 1024 * 1024,
        disableAutoFetch: false,
        disableStream: false,
        disableRange: false,
        stopAtErrors: false,
        verbosity: 0
      }).promise;
      
      console.log('PDF loaded successfully:', {
        numPages: pdf.numPages,
        fingerprint: pdf.fingerprint,
      });
    } catch (pdfError: any) {
      console.error('PDF loading error details:', pdfError);
      logPDFError(pdfError, 'PDF loading', { debugInfo });
      
      // Enhanced error handling for worker issues
      if (pdfError.message?.includes('worker') || 
          pdfError.message?.includes('Worker') ||
          pdfError.message?.includes('API version') || 
          pdfError.message?.includes('version mismatch')) {
        console.error('Worker/version issue detected, attempting fresh setup...');
        setupPDFWorker();
        throw new Error('PDF worker issue detected. Please refresh the page and try again, or use the "Paste Text" option.');
      } else if (pdfError.name === 'PasswordException') {
        throw new Error('This PDF is password protected. Please remove the password protection or use the "Paste Text" option instead.');
      } else if (pdfError.name === 'InvalidPDFException') {
        throw new Error('This PDF file is corrupted or uses an unsupported format. Please try saving your resume as a new PDF from your word processor.');
      } else if (pdfError.message?.includes('XFA')) {
        throw new Error('This PDF uses XFA forms which are not supported. Please save your resume as a standard PDF.');
      } else if (pdfError.message?.includes('Invalid PDF structure')) {
        throw new Error('The PDF structure is invalid. Please try re-saving your document as a new PDF.');
      } else if (pdfError.message?.includes('network')) {
        throw new Error('Network error loading PDF. Please check your connection and try again, or use the "Paste Text" option.');
      } else {
        throw new Error(`Unable to read this PDF file: ${pdfError.message}. Please try using the "Paste Text" option instead.`);
      }
    }
    
    onProgress?.(25);

    if (pdf.numPages === 0) {
      throw new Error('This PDF appears to have no pages. Please check the file and try again.');
    }

    let fullText = '';
    const maxPages = Math.min(pdf.numPages, 15);
    console.log(`Processing ${maxPages} pages...`);

    // Extract text from each page
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      console.log(`Processing page ${pageNum}/${maxPages}`);
      
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent({
          normalizeWhitespace: true,
          disableCombineTextItems: false
        });
        
        const pageText = extractStructuredTextFromPage(textContent);
        if (pageText.trim()) {
          fullText += pageText + '\n\n';
          console.log(`Page ${pageNum} extracted ${pageText.length} characters`);
        } else {
          console.warn(`Page ${pageNum} extracted no text`);
        }
        
        const progress = 25 + ((pageNum / maxPages) * 50);
        onProgress?.(progress);
      } catch (pageError) {
        console.warn(`Failed to extract text from page ${pageNum}:`, pageError);
        logPDFError(pageError as Error, `Page ${pageNum} extraction`);
        fullText += `[Error reading page ${pageNum}]\n\n`;
      }
    }

    console.log('PDF extraction completed. Total text length:', fullText.length);
    onProgress?.(80);

    fullText = cleanExtractedText(fullText);

    if (fullText.trim().length < 5) {
      throw new Error('Could not extract readable text from this PDF. This might be a scanned document or image-based PDF. Please try using the "Paste Text" option to enter your resume content directly.');
    }

    const structured = parseResumeStructure(fullText);
    
    const result: PDFExtractionResult = {
      text: fullText.trim(),
      structured,
      metadata: {
        pageCount: pdf.numPages,
        extractionMethod: 'text',
        confidence: calculateExtractionConfidence(fullText, structured)
      }
    };

    onProgress?.(100);
    console.log('=== ENHANCED PDF EXTRACTION SUCCESS ===');
    console.log('Final result:', {
      textLength: result.text.length,
      confidence: result.metadata.confidence,
      structuredName: result.structured.name,
      sectionsFound: {
        experience: result.structured.sections.experience.length,
        skills: result.structured.sections.skills.length,
        education: result.structured.sections.education.length,
      }
    });
    
    return result;

  } catch (error) {
    console.error('=== ENHANCED PDF EXTRACTION FAILED ===');
    logPDFError(error as Error, 'Main extraction', { debugInfo });
    
    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Unable to process this PDF file. This could be due to the file format, security settings, or the PDF being scanned. Please try using the "Paste Text" option to enter your resume content directly.');
  }
};

// Maintain backward compatibility
export const extractTextFromPDF = extractTextFromPDFEnhanced;

// Re-export types for convenience
export type { ProgressCallback, PDFExtractionResult } from './pdf/types';
