
import type { PDFExtractionResult } from './types';

export const parseResumeStructure = (text: string): PDFExtractionResult['structured'] => {
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
};

const extractName = (lines: string[]): string => {
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
};

const extractContactInfo = (lines: string[]): { email?: string; phone?: string } => {
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
};

const extractSummarySection = (lines: string[]): string | undefined => {
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
};

const extractExperienceSection = (lines: string[]): string[] => {
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
};

const extractEducationSection = (lines: string[]): string[] => {
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
};

const extractSkillsSection = (lines: string[]): string[] => {
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
};

export const calculateExtractionConfidence = (text: string, structured: any): number => {
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
};
