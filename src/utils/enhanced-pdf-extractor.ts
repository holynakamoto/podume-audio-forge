import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Set up PDF.js worker with better fallback options
try {
  GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
} catch {
  // Fallback for environments where URL constructor might not work
  GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

export interface ProgressCallback {
  (progress: number): void;
}

export interface PDFExtractionResult {
  text: string;
  structured: {
    name: string;
    contact: {
      email?: string;
      phone?: string;
    };
    sections: {
      summary?: string;
      experience: string[];
      education: string[];
      skills: string[];
    };
  };
  metadata: {
    pageCount: number;
    extractionMethod: 'text' | 'ocr' | 'fallback';
    confidence: number;
  };
}

// Enhanced PDF text extraction with better error handling
export const extractTextFromPDFEnhanced = async (
  file: File,
  onProgress?: ProgressCallback
): Promise<PDFExtractionResult> => {
  console.log('Starting enhanced PDF text extraction...', { fileName: file.name, fileSize: file.size });
  onProgress?.(5);

  try {
    console.log('Converting file to array buffer...');
    const arrayBuffer = await file.arrayBuffer();
    console.log('Array buffer created, size:', arrayBuffer.byteLength);
    onProgress?.(15);

    // Basic file size validation
    if (arrayBuffer.byteLength === 0) {
      throw new Error('The uploaded file appears to be empty. Please try uploading a different PDF file.');
    }

    // Validate PDF header with better logic
    const uint8Array = new Uint8Array(arrayBuffer.slice(0, 10));
    const pdfSignature = [0x25, 0x50, 0x44, 0x46]; // %PDF
    const isPDF = pdfSignature.every((byte, index) => uint8Array[index] === byte);
    
    if (!isPDF) {
      // Check for common file signatures to give better error messages
      const fileHeader = Array.from(uint8Array.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join('');
      console.warn('File header:', fileHeader);
      throw new Error('This file does not appear to be a valid PDF. Please ensure you are uploading a PDF file and not a Word document, image, or other file type.');
    }

    // Load PDF document with improved configuration
    console.log('Loading PDF document...');
    let pdf;
    try {
      pdf = await getDocument({ 
        data: arrayBuffer,
        useSystemFonts: true,
        disableFontFace: false,
        standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/',
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
        cMapPacked: true,
        isEvalSupported: false,
        maxImageSize: 1024 * 1024 // Limit image size to prevent memory issues
      }).promise;
    } catch (pdfError: any) {
      console.error('PDF loading error:', pdfError);
      
      if (pdfError.message?.includes('Invalid PDF structure') || pdfError.message?.includes('PDF header')) {
        throw new Error('This PDF file appears to be corrupted or uses an unsupported format. Please try saving your resume as a new PDF from your word processor, or use the "Paste Text" option instead.');
      } else if (pdfError.message?.includes('password') || pdfError.message?.includes('encrypted')) {
        throw new Error('This PDF is password protected or encrypted. Please remove the password protection or use the "Paste Text" option instead.');
      } else if (pdfError.message?.includes('XFA')) {
        throw new Error('This PDF uses XFA forms which are not supported. Please save your resume as a standard PDF or use the "Paste Text" option instead.');
      } else {
        throw new Error('Unable to read this PDF file. This might be due to the PDF format or security settings. Please try using the "Paste Text" option instead.');
      }
    }
    
    console.log('PDF loaded successfully, pages:', pdf.numPages);
    onProgress?.(25);

    if (pdf.numPages === 0) {
      throw new Error('This PDF appears to have no pages. Please check the file and try again.');
    }

    let fullText = '';
    const maxPages = Math.min(pdf.numPages, 10); // Process up to 10 pages

    // Extract text from each page with enhanced parsing
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      console.log(`Processing page ${pageNum}/${maxPages}`);
      
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Enhanced text extraction with positioning data
        const pageText = extractStructuredTextFromPage(textContent);
        if (pageText.trim()) {
          fullText += pageText + '\n\n';
        }
        
        // Update progress
        const progress = 25 + ((pageNum / maxPages) * 50);
        onProgress?.(progress);
      } catch (pageError) {
        console.warn(`Failed to extract text from page ${pageNum}:`, pageError);
        // Continue with other pages - don't fail completely
      }
    }

    console.log('PDF extraction completed. Total text length:', fullText.length);
    onProgress?.(80);

    // Clean up the extracted text
    fullText = cleanExtractedText(fullText);

    // Be more lenient with text length requirements
    if (fullText.trim().length < 10) {
      throw new Error('Could not extract readable text from this PDF. This might be a scanned document, image-based PDF, or the text might be embedded as images. Please try using the "Paste Text" option to enter your resume content directly.');
    }

    // Structure the extracted data
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
    return result;

  } catch (error) {
    console.error('PDF extraction failed:', error);
    
    if (error instanceof Error) {
      // Re-throw our custom error messages
      if (error.message.includes('Please try using the "Paste Text"') ||
          error.message.includes('does not appear to be a valid PDF') ||
          error.message.includes('password protected') ||
          error.message.includes('corrupted') ||
          error.message.includes('XFA forms') ||
          error.message.includes('appears to be empty')) {
        throw error;
      }
    }

    // Generic fallback error
    throw new Error('Unable to process this PDF file. This could be due to the file format, security settings, or the PDF being scanned. Please try using the "Paste Text" option to enter your resume content directly.');
  }
};

function cleanExtractedText(text: string): string {
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove control characters
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Normalize line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove multiple consecutive newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractStructuredTextFromPage(textContent: any): string {
  if (!textContent || !textContent.items) {
    return '';
  }

  const items = textContent.items;
  let pageText = '';
  
  try {
    // Sort items by vertical position, then horizontal
    const sortedItems = items.sort((a: any, b: any) => {
      if (!a.transform || !b.transform) return 0;
      
      const yDiff = b.transform[5] - a.transform[5]; // Y coordinate (inverted)
      if (Math.abs(yDiff) > 5) return yDiff > 0 ? 1 : -1;
      return a.transform[4] - b.transform[4]; // X coordinate
    });
    
    let currentY = null;
    let currentLine = '';
    
    for (const item of sortedItems) {
      if (!item.str || !item.transform) continue;
      
      const y = item.transform[5];
      const text = item.str.trim();
      
      if (!text) continue;
      
      // Check if we're on a new line
      if (currentY !== null && Math.abs(currentY - y) > 5) {
        if (currentLine.trim()) {
          pageText += currentLine.trim() + '\n';
        }
        currentLine = text + ' ';
      } else {
        currentLine += text + ' ';
      }
      
      currentY = y;
    }
    
    // Add the last line
    if (currentLine.trim()) {
      pageText += currentLine.trim() + '\n';
    }
    
  } catch (sortError) {
    console.warn('Error sorting text items, using fallback extraction:', sortError);
    // Fallback: just concatenate all text items
    for (const item of items) {
      if (item.str && item.str.trim()) {
        pageText += item.str.trim() + ' ';
      }
    }
  }
  
  return pageText;
}

function parseResumeStructure(text: string): PDFExtractionResult['structured'] {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  return {
    name: extractName(lines),
    contact: extractContactInfo(lines),
    sections: {
      summary: extractSummarySection(lines),
      experience: extractExperienceSection(lines),
      education: extractEducationSection(lines),
      skills: extractSkillsSection(lines)
    }
  };
}

function extractName(lines: string[]): string {
  // Look for name in first few lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    if (line.length > 0 && line.length < 100 && 
        !line.includes('@') && !line.includes('http') && 
        !line.toLowerCase().includes('resume') &&
        !line.toLowerCase().includes('cv') &&
        !/^\d+$/.test(line) && // Not just numbers
        !line.includes('|') && // Not a contact line
        line.split(' ').length >= 2 && line.split(' ').length <= 4) { // Reasonable name length
      return line;
    }
  }
  return 'Professional';
}

function extractContactInfo(lines: string[]): { email?: string; phone?: string } {
  const contact: { email?: string; phone?: string } = {};
  
  for (const line of lines.slice(0, 15)) {
    const emailMatch = line.match(/[\w\.-]+@[\w\.-]+\.\w+/);
    if (emailMatch && !contact.email) {
      contact.email = emailMatch[0];
    }
    
    const phoneMatch = line.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch && !contact.phone) {
      contact.phone = phoneMatch[0];
    }
  }
  
  return contact;
}

function extractSummarySection(lines: string[]): string | undefined {
  const summaryKeywords = ['summary', 'profile', 'about', 'overview', 'objective'];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (summaryKeywords.some(keyword => line.includes(keyword))) {
      const nextLines = lines.slice(i + 1, i + 8);
      const summary = nextLines
        .filter(line => line.trim().length > 20)
        .join(' ')
        .substring(0, 400);
      
      if (summary.length > 30) {
        return summary;
      }
    }
  }
  return undefined;
}

function extractExperienceSection(lines: string[]): string[] {
  const experience: string[] = [];
  const experienceKeywords = ['experience', 'work', 'employment', 'professional', 'career'];
  
  let inExperienceSection = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    if (experienceKeywords.some(keyword => line.includes(keyword))) {
      inExperienceSection = true;
      continue;
    }
    
    if (inExperienceSection && lines[i].trim().length > 20) {
      experience.push(lines[i].trim());
      if (experience.length >= 10) break; // Limit extraction
    }
    
    // Stop if we hit another major section
    if (inExperienceSection && (line.includes('education') || line.includes('skills'))) {
      break;
    }
  }
  
  return experience;
}

function extractEducationSection(lines: string[]): string[] {
  const education: string[] = [];
  const educationKeywords = ['education', 'degree', 'university', 'college', 'school'];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (educationKeywords.some(keyword => line.includes(keyword))) {
      // Extract education entries from following lines
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const eduLine = lines[j].trim();
        if (eduLine.length > 10 && (/\d{4}/.test(eduLine) || eduLine.toLowerCase().includes('bachelor') || eduLine.toLowerCase().includes('master'))) {
          education.push(eduLine);
        }
      }
      break;
    }
  }
  
  return education;
}

function extractSkillsSection(lines: string[]): string[] {
  const skillKeywords = ['skills', 'technologies', 'tools', 'competencies', 'technical'];
  const skills: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (skillKeywords.some(keyword => line.includes(keyword))) {
      // Extract skills from following lines
      for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
        const skillLine = lines[j];
        if (skillLine.includes(',') || skillLine.includes('•') || skillLine.includes('-')) {
          const extractedSkills = skillLine
            .split(/[,•\-]/)
            .map(skill => skill.trim())
            .filter(skill => skill.length > 1 && skill.length < 50);
          skills.push(...extractedSkills);
        }
      }
      break;
    }
  }
  
  return skills.slice(0, 20); // Limit skills
}

function calculateExtractionConfidence(text: string, structured: any): number {
  let confidence = 0.3; // Base confidence
  
  // Increase confidence based on structured data quality
  if (structured.name && structured.name !== 'Professional') confidence += 0.2;
  if (structured.contact.email) confidence += 0.1;
  if (structured.contact.phone) confidence += 0.1;
  if (structured.sections.experience.length > 0) confidence += 0.2;
  if (structured.sections.skills.length > 0) confidence += 0.1;
  if (structured.sections.education.length > 0) confidence += 0.1;
  if (text.length > 300) confidence += 0.1;
  if (text.length > 1000) confidence += 0.1;
  
  return Math.min(confidence, 1.0);
}

// Maintain backward compatibility
export const extractTextFromPDF = extractTextFromPDFEnhanced;
