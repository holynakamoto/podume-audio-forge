
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Set up PDF.js worker
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

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

// Enhanced PDF text extraction with structured parsing
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

    // Load PDF document
    console.log('Loading PDF document...');
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    console.log('PDF loaded successfully, pages:', pdf.numPages);
    onProgress?.(25);

    let fullText = '';
    const maxPages = Math.min(pdf.numPages, 10); // Process up to 10 pages

    // Extract text from each page with enhanced parsing
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      console.log(`Processing page ${pageNum}/${maxPages}`);
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Enhanced text extraction with positioning data
      const pageText = extractStructuredTextFromPage(textContent);
      fullText += pageText + '\n\n';
      
      // Update progress
      const progress = 25 + ((pageNum / maxPages) * 50);
      onProgress?.(progress);
    }

    console.log('PDF extraction completed. Total text length:', fullText.length);
    onProgress?.(80);

    if (fullText.trim().length < 50) {
      throw new Error('Could not extract sufficient text from PDF. The file may be image-based or password protected.');
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

function extractStructuredTextFromPage(textContent: any): string {
  const items = textContent.items;
  let pageText = '';
  
  // Sort items by vertical position, then horizontal
  const sortedItems = items.sort((a: any, b: any) => {
    const yDiff = b.transform[5] - a.transform[5]; // Y coordinate (inverted)
    if (Math.abs(yDiff) > 5) return yDiff > 0 ? 1 : -1;
    return a.transform[4] - b.transform[4]; // X coordinate
  });
  
  let currentY = null;
  for (const item of sortedItems) {
    const y = item.transform[5];
    
    // Add line break if significant Y position change
    if (currentY !== null && Math.abs(currentY - y) > 10) {
      pageText += '\n';
    }
    
    pageText += item.str + ' ';
    currentY = y;
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
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const line = lines[i].trim();
    if (line.length > 0 && line.length < 50 && 
        !line.includes('@') && !line.includes('http') && 
        !line.toLowerCase().includes('resume') &&
        !/\d/.test(line)) { // Exclude lines with numbers
      return line;
    }
  }
  return 'Professional';
}

function extractContactInfo(lines: string[]): { email?: string; phone?: string } {
  const contact: { email?: string; phone?: string } = {};
  
  for (const line of lines.slice(0, 10)) {
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
      const nextLines = lines.slice(i + 1, i + 5);
      const summary = nextLines
        .filter(line => line.trim().length > 30)
        .join(' ')
        .substring(0, 300);
      
      if (summary.length > 50) {
        return summary;
      }
    }
  }
  return undefined;
}

function extractExperienceSection(lines: string[]): string[] {
  const experience: string[] = [];
  const experienceKeywords = ['experience', 'work', 'employment', 'professional'];
  
  let inExperienceSection = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    if (experienceKeywords.some(keyword => line.includes(keyword))) {
      inExperienceSection = true;
      continue;
    }
    
    if (inExperienceSection && lines[i].trim().length > 30) {
      experience.push(lines[i].trim());
      if (experience.length >= 8) break; // Limit extraction
    }
  }
  
  return experience;
}

function extractEducationSection(lines: string[]): string[] {
  const education: string[] = [];
  const educationKeywords = ['education', 'degree', 'university', 'college'];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (educationKeywords.some(keyword => line.includes(keyword))) {
      // Extract education entries from following lines
      for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
        const eduLine = lines[j].trim();
        if (eduLine.length > 15 && /\d{4}/.test(eduLine)) {
          education.push(eduLine);
        }
      }
      break;
    }
  }
  
  return education;
}

function extractSkillsSection(lines: string[]): string[] {
  const skillKeywords = ['skills', 'technologies', 'tools', 'competencies'];
  const skills: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (skillKeywords.some(keyword => line.includes(keyword))) {
      // Extract skills from following lines
      for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
        const skillLine = lines[j];
        if (skillLine.includes(',') || skillLine.includes('•') || skillLine.includes('-')) {
          const extractedSkills = skillLine
            .split(/[,•\-]/)
            .map(skill => skill.trim())
            .filter(skill => skill.length > 2 && skill.length < 30);
          skills.push(...extractedSkills);
        }
      }
      break;
    }
  }
  
  return skills.slice(0, 15); // Limit skills
}

function calculateExtractionConfidence(text: string, structured: any): number {
  let confidence = 0.5; // Base confidence
  
  // Increase confidence based on structured data quality
  if (structured.name && structured.name !== 'Professional') confidence += 0.1;
  if (structured.contact.email) confidence += 0.1;
  if (structured.sections.experience.length > 0) confidence += 0.2;
  if (structured.sections.skills.length > 0) confidence += 0.1;
  if (text.length > 500) confidence += 0.1;
  
  return Math.min(confidence, 1.0);
}

// Maintain backward compatibility
export const extractTextFromPDF = extractTextFromPDFEnhanced;
