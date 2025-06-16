
export function extractName(lines: string[]): string {
  const firstLine = lines[0]?.trim() || '';
  if (firstLine.length > 0 && firstLine.length < 50 && !firstLine.includes('@') && !firstLine.includes('http')) {
    return firstLine;
  }
  return 'this professional';
}

export function extractSummary(lines: string[]): string {
  const summaryKeywords = ['summary', 'profile', 'about', 'overview'];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (summaryKeywords.some(keyword => line.includes(keyword))) {
      const nextLines = lines.slice(i + 1, i + 4);
      const summary = nextLines.filter(line => line.trim().length > 20).join(' ');
      if (summary.length > 50) {
        return summary.substring(0, 200) + (summary.length > 200 ? '...' : '');
      }
    }
  }
  return '';
}

export function extractExperience(lines: string[]): string[] {
  const experience: string[] = [];
  const experienceKeywords = ['experience', 'work', 'employment', 'career', 'position', 'role'];
  
  let foundExperience = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (experienceKeywords.some(keyword => line.includes(keyword))) {
      foundExperience = true;
      continue;
    }
    
    if (foundExperience && lines[i].trim().length > 30) {
      experience.push(lines[i].trim());
      if (experience.length >= 5) break;
    }
  }
  
  return experience;
}
