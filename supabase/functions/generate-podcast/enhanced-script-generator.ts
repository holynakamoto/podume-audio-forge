
export function generateEnhancedScript(resumeContent: string): string {
  console.log('=== Generating enhanced script for 5+ minutes ===');
  
  // Extract key information from resume
  const name = extractName(resumeContent) || 'Professional';
  const summary = extractSummary(resumeContent);
  const experience = extractExperience(resumeContent);
  const skills = extractSkills(resumeContent);
  const education = extractEducation(resumeContent);
  
  // Generate a comprehensive 800-1200 word script for 5-7 minutes
  const script = `
Sarah: Welcome back to "Career Spotlight," the podcast where we dive deep into the professional journeys of today's most interesting candidates. I'm Sarah, your host.

Mike: And I'm Mike, co-host. Today we're excited to discuss ${name}'s impressive career trajectory and what makes them stand out in today's competitive market.

Sarah: Absolutely, Mike. Let me start by giving our listeners an overview of ${name}'s background. ${summary || 'This professional has built a remarkable career with diverse experiences across multiple domains.'}

Mike: That's a great foundation, Sarah. What really catches my attention is the progression we see in their work experience. ${name} has demonstrated consistent growth and increasing responsibility throughout their career.

Sarah: Exactly! Let's break down their professional journey. ${experience.length > 0 ? `Starting with their role as ${experience[0]?.role || 'their early position'}, we can see how they've built their expertise step by step.` : 'Their career shows a clear trajectory of professional development.'}

Mike: The experience really tells a story of evolution. ${experience.length > 1 ? `Moving from ${experience[0]?.role || 'their initial role'} to ${experience[1]?.role || 'their next position'} shows strategic career planning.` : 'Each role has contributed to their overall professional development.'}

Sarah: What I find particularly impressive is the depth of their technical and professional skills. ${skills.length > 0 ? `They've mastered ${skills.slice(0, 3).join(', ')}${skills.length > 3 ? ` and several other key competencies` : ''}.` : 'Their skill set demonstrates both breadth and depth of expertise.'}

Mike: Those skills are exactly what today's employers are looking for. The combination of technical proficiency and professional acumen makes them a valuable asset to any organization.

Sarah: Let's talk about their educational foundation. ${education.length > 0 ? `With their background in ${education[0]?.degree || 'their field of study'}, they've built a solid academic foundation that clearly supports their professional achievements.` : 'Their educational background provides the theoretical foundation for their practical expertise.'}

Mike: Education is important, but what really stands out is how they've applied that knowledge in real-world situations. The practical experience they've gained demonstrates their ability to translate learning into results.

Sarah: That's such an important point, Mike. In today's rapidly evolving workplace, it's not just about what you know, but how you apply that knowledge to solve problems and drive innovation.

Mike: Absolutely. Looking at their career progression, I see someone who doesn't just follow trends but actively contributes to shaping their field. This kind of forward-thinking approach is exactly what organizations need.

Sarah: The diversity of their experience is also noteworthy. ${experience.length > 2 ? `Having worked in multiple roles and possibly different industries gives them a unique perspective that many employers highly value.` : 'Their varied experience provides a well-rounded perspective that benefits any team.'}

Mike: And let's not forget the soft skills that come through in their professional presentation. Communication, leadership, problem-solving - these are the intangibles that often make the difference between a good candidate and a great one.

Sarah: Communication skills, in particular, are becoming increasingly important. In our interconnected world, the ability to collaborate across teams, departments, and even continents is crucial for success.

Mike: What advice would you give to someone looking to build a similar career trajectory, Sarah?

Sarah: Great question, Mike. I think the key takeaway from ${name}'s journey is the importance of continuous learning and strategic career moves. Each position has clearly built upon the previous one, creating a compelling narrative of professional growth.

Mike: I completely agree. It's also worth noting the importance of developing both technical expertise and leadership capabilities. The most successful professionals are those who can not only execute but also inspire and guide others.

Sarah: As we wrap up today's episode, I want to emphasize that ${name} represents the kind of candidate that forward-thinking organizations should actively seek out. Their combination of experience, skills, and demonstrated growth potential makes them an excellent investment for any company.

Mike: Well said, Sarah. To our listeners, thank you for joining us on another episode of "Career Spotlight." We hope this deep dive into ${name}'s professional journey has provided valuable insights into what makes a standout candidate in today's market.

Sarah: Don't forget to subscribe to our podcast for more career insights and professional success stories. Until next time, keep growing and keep inspiring!

Mike: This has been Sarah and Mike with "Career Spotlight." Thanks for listening, and we'll see you next episode!
`;

  console.log('Enhanced script generated, length:', script.length);
  return script.trim();
}

// Helper functions for content extraction
function extractName(content: string): string | null {
  const namePatterns = [
    /^([A-Z][a-z]+ [A-Z][a-z]+)/m,
    /Name:?\s*([A-Z][a-z]+ [A-Z][a-z]+)/i,
    /([A-Z][A-Z\s]+)\s*\n/
  ];
  
  for (const pattern of namePatterns) {
    const match = content.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  return null;
}

function extractSummary(content: string): string {
  const summaryPatterns = [
    /(?:summary|profile|objective)[:\s]*([^.\n]*(?:\.[^.\n]*){0,2})/i,
    /(?:about|overview)[:\s]*([^.\n]*(?:\.[^.\n]*){0,2})/i
  ];
  
  for (const pattern of summaryPatterns) {
    const match = content.match(pattern);
    if (match && match[1].trim().length > 20) {
      return match[1].trim();
    }
  }
  return '';
}

function extractExperience(content: string): Array<{role: string, company?: string}> {
  const experiences: Array<{role: string, company?: string}> = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    const roleMatch = line.match(/(?:^|\s)((?:Senior\s+)?(?:Lead\s+)?(?:Principal\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+Engineer|\s+Manager|\s+Director|\s+Analyst|\s+Coordinator|\s+Specialist))/i);
    if (roleMatch) {
      experiences.push({ role: roleMatch[1] });
      if (experiences.length >= 3) break;
    }
  }
  
  return experiences;
}

function extractSkills(content: string): string[] {
  const skillKeywords = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'TypeScript', 'SQL', 'AWS', 'Docker', 'Kubernetes',
    'Project Management', 'Leadership', 'Agile', 'Scrum', 'Communication', 'Problem Solving', 'Analytics',
    'Machine Learning', 'Data Science', 'UI/UX', 'Design', 'Marketing', 'Sales', 'Strategy'
  ];
  
  const foundSkills = skillKeywords.filter(skill => 
    content.toLowerCase().includes(skill.toLowerCase())
  );
  
  return foundSkills.slice(0, 8);
}

function extractEducation(content: string): Array<{degree: string}> {
  const educationPatterns = [
    /(Bachelor|Master|PhD|B\.S\.|M\.S\.|B\.A\.|M\.A\.)[\s\w]*/gi,
    /(Computer Science|Engineering|Business|Marketing|Finance|Psychology|Economics)/gi
  ];
  
  const education: Array<{degree: string}> = [];
  
  for (const pattern of educationPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      education.push({ degree: matches[0] });
      break;
    }
  }
  
  return education;
}
