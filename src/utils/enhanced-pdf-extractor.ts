
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { setupPDFWorker, testPDFWorker, resetPDFWorker, checkWorkerHealth } from './pdf/worker-setup';
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
  console.log('File info:', { name: file.name, size: file.size, type: file.type });
  
  // Debug file information
  const debugInfo = await debugPDFFile(file);
  console.log('File debug info:', debugInfo);
  
  // Enhanced worker setup and validation
  console.log('Checking worker health...');
  let workerHealth = await checkWorkerHealth();
  console.log('Initial worker health:', workerHealth);
  
  if (!workerHealth.healthy) {
    console.log('Worker unhealthy, attempting reset...');
    resetPDFWorker();
    
    // Wait for reset to complete
    await new Promise(resolve => setTimeout(resolve, 200));
    
    workerHealth = await checkWorkerHealth();
    console.log('Post-reset worker health:', workerHealth);
    
    if (!workerHealth.healthy) {
      throw new Error(`PDF worker is not properly configured: ${workerHealth.error}. Please refresh the page and try again, or use the "Paste Text" option.`);
    }
  }
  
  console.log('Current worker source:', GlobalWorkerOptions.workerSrc);
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
    
    // Retry mechanism for worker mismatch issues
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        console.log(`PDF loading attempt ${retryCount + 1}/${maxRetries + 1}`);
        
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
        break; // Success, exit retry loop
        
      } catch (pdfError: any) {
        console.error(`PDF loading attempt ${retryCount + 1} failed:`, pdfError);
        
        // Check for worker/version mismatch errors
        const isWorkerError = pdfError.message?.includes('worker') || 
                             pdfError.message?.includes('Worker') ||
                             pdfError.message?.includes('API version') || 
                             pdfError.message?.includes('version mismatch') ||
                             pdfError.message?.includes('Cannot resolve') ||
                             pdfError.name === 'UnknownErrorException';
        
        if (isWorkerError && retryCount < maxRetries) {
          console.log(`Worker error detected, attempting worker reset (retry ${retryCount + 1})`);
          resetPDFWorker();
          
          // Wait for worker reset
          await new Promise(resolve => setTimeout(resolve, 300));
          
          retryCount++;
          continue; // Retry with new worker
        }
        
        // Handle specific error types
        logPDFError(pdfError, 'PDF loading', { debugInfo, retryCount });
        
        if (pdfError.name === 'PasswordException') {
          throw new Error('This PDF is password protected. Please remove the password protection or use the "Paste Text" option instead.');
        } else if (pdfError.name === 'InvalidPDFException') {
          throw new Error('This PDF file is corrupted or uses an unsupported format. Please try saving your resume as a new PDF from your word processor.');
        } else if (pdfError.message?.includes('XFA')) {
          throw new Error('This PDF uses XFA forms which are not supported. Please save your resume as a standard PDF.');
        } else if (pdfError.message?.includes('Invalid PDF structure')) {
          throw new Error('The PDF structure is invalid. Please try re-saving your document as a new PDF.');
        } else if (pdfError.message?.includes('network')) {
          throw new Error('Network error loading PDF. Please check your connection and try again, or use the "Paste Text" option.');
        } else if (isWorkerError) {
          throw new Error('PDF processing worker error. Please refresh the page and try again, or use the "Paste Text" option.');
        } else {
          throw new Error(`Unable to read this PDF file: ${pdfError.message}. Please try using the "Paste Text" option instead.`);
        }
      }
    }
    
    if (!pdf) {
      throw new Error('Failed to load PDF after multiple attempts. Please try refreshing the page or use the "Paste Text" option.');
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
