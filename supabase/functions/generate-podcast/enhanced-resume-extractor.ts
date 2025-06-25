
interface ResumeData {
  name: string;
  contact: {
    email?: string;
    phone?: string;
    location?: string;
  };
  summary?: string;
  experience: Array<{
    role: string;
    company: string;
    dates: string;
    details: string[];
  }>;
  education: Array<{
    degree: string;
    school: string;
    year: string;
  }>;
  skills: string[];
  achievements: string[];
}

export function extractStructuredData(resumeText: string): ResumeData {
  console.log('=== Extracting structured data from resume ===');
  
  const lines = resumeText.split('\n').filter(line => line.trim().length > 0);
  
  const data: ResumeData = {
    name: extractName(lines),
    contact: extractContactInfo(lines),
    summary: extractSummary(lines),
    experience: extractDetailedExperience(lines),
    education: extractEducation(lines),
    skills: extractSkills(lines),
    achievements: extractAchievements(lines)
  };
  
  console.log('Structured data extracted:', {
    name: data.name,
    experienceCount: data.experience.length,
    educationCount: data.education.length,
    skillsCount: data.skills.length,
    achievementsCount: data.achievements.length
  });
  
  return data;
}

export function extractName(lines: string[]): string {
  // Look for name in first few lines
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const line = lines[i].trim();
    if (line.length > 0 && line.length < 50 && 
        !line.includes('@') && !line.includes('http') && 
        !line.toLowerCase().includes('resume') &&
        !line.toLowerCase().includes('cv')) {
      return line;
    }
  }
  return 'this professional';
}

function extractContactInfo(lines: string[]): { email?: string; phone?: string; location?: string } {
  const contact: { email?: string; phone?: string; location?: string } = {};
  
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

export function extractSummary(lines: string[]): string {
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
  return '';
}

function extractDetailedExperience(lines: string[]): Array<{
  role: string;
  company: string;
  dates: string;
  details: string[];
}> {
  const experience: Array<{
    role: string;
    company: string;
    dates: string;
    details: string[];
  }> = [];
  
  const experienceKeywords = ['experience', 'work', 'employment', 'career', 'professional'];
  let inExperienceSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    if (experienceKeywords.some(keyword => line.includes(keyword))) {
      inExperienceSection = true;
      continue;
    }
    
    if (inExperienceSection) {
      // Look for job titles/company patterns
      const jobPattern = /^[\w\s]+\s+at\s+[\w\s]+/i;
      const datePattern = /\d{4}/;
      
      if (jobPattern.test(lines[i]) || datePattern.test(lines[i])) {
        const jobInfo = lines[i].split(' at ');
        if (jobInfo.length === 2) {
          experience.push({
            role: jobInfo[0].trim(),
            company: jobInfo[1].trim(),
            dates: extractDatesFromText(lines[i]),
            details: extractJobDetails(lines, i + 1)
          });
        }
      }
      
      if (experience.length >= 4) break; // Limit to prevent over-extraction
    }
  }
  
  return experience;
}

function extractDatesFromText(text: string): string {
  const dateMatch = text.match(/\d{4}[\s-]*(?:to|-)?\s*(?:\d{4}|present|current)?/i);
  return dateMatch ? dateMatch[0] : '';
}

function extractJobDetails(lines: string[], startIndex: number): string[] {
  const details: string[] = [];
  
  for (let i = startIndex; i < Math.min(startIndex + 5, lines.length); i++) {
    const line = lines[i].trim();
    if (line.length > 20 && (line.startsWith('•') || line.startsWith('-') || line.includes('responsible'))) {
      details.push(line.replace(/^[•\-]\s*/, ''));
    }
  }
  
  return details;
}

function extractEducation(lines: string[]): Array<{
  degree: string;
  school: string;
  year: string;
}> {
  const education: Array<{
    degree: string;
    school: string;
    year: string;
  }> = [];
  
  const educationKeywords = ['education', 'degree', 'university', 'college', 'school'];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (educationKeywords.some(keyword => line.includes(keyword))) {
      // Extract education entries from following lines
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const eduLine = lines[j];
        const yearMatch = eduLine.match(/\d{4}/);
        if (yearMatch && eduLine.length > 15) {
          education.push({
            degree: eduLine.split(',')[0] || eduLine,
            school: eduLine.includes(',') ? eduLine.split(',')[1]?.trim() || '' : '',
            year: yearMatch[0]
          });
        }
      }
      break;
    }
  }
  
  return education;
}

function extractSkills(lines: string[]): string[] {
  const skillKeywords = ['skills', 'technologies', 'tools', 'competencies'];
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
            .filter(skill => skill.length > 2 && skill.length < 30);
          skills.push(...extractedSkills);
        }
      }
      break;
    }
  }
  
  return skills.slice(0, 15); // Limit to prevent over-extraction
}

function extractAchievements(lines: string[]): string[] {
  const achievements: string[] = [];
  const achievementKeywords = ['achievement', 'accomplishment', 'award', 'recognition', 'certification'];
  
  for (const line of lines) {
    if (achievementKeywords.some(keyword => line.toLowerCase().includes(keyword)) ||
        line.includes('%') || line.includes('increased') || line.includes('improved')) {
      if (line.length > 20 && line.length < 200) {
        achievements.push(line.trim());
      }
    }
  }
  
  return achievements.slice(0, 10);
}

export function extractExperience(lines: string[]): string[] {
  const structured = extractStructuredData(lines.join('\n'));
  return structured.experience.map(exp => 
    `${exp.role} at ${exp.company} (${exp.dates}): ${exp.details.join('. ')}`
  );
}
