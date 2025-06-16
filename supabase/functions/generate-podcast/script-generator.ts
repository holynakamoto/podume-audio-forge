
import { extractName, extractSummary, extractExperience } from './resume-extractor.ts';

export function generateBasicScript(resumeContent: string): string {
  console.log('=== Generating basic script as final fallback ===');
  
  // Extract key information from resume
  const lines = resumeContent.split('\n').filter(line => line.trim().length > 0);
  const name = extractName(lines);
  const summary = extractSummary(lines);
  const experience = extractExperience(lines);
  
  // Create a conversational two-host script with clear sentence breaks for alternating voices
  let script = `Welcome to Career Spotlight! Today we're featuring the professional journey of ${name}.`;
  script += ` That's right! Let me take you through an inspiring career story that showcases dedication, growth, and expertise.`;
  
  if (summary) {
    script += ` ${summary}`;
    script += ` What immediately stands out is the depth of experience and professional growth.`;
  }
  
  if (experience.length > 0) {
    script += ` Looking at their professional experience, we can see some impressive achievements.`;
    experience.slice(0, 3).forEach((exp, index) => {
      script += ` ${exp}`;
      if (index < 2) {
        script += ` This demonstrates their commitment to excellence and continuous learning.`;
      }
    });
  }
  
  script += ` What stands out most is the consistent growth and adaptability throughout their career.`;
  script += ` Absolutely! This is exactly the kind of professional development story that inspires others.`;
  script += ` The combination of technical skills and leadership experience is particularly impressive.`;
  script += ` Thanks for joining us on Career Spotlight! Don't forget to subscribe for more inspiring career stories.`;
  script += ` Until next time, keep growing and pursuing your professional goals!`;

  console.log('Basic script generated successfully');
  return script;
}
