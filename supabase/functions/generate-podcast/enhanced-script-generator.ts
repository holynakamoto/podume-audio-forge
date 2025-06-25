
import { extractName, extractSummary, extractExperience } from './resume-extractor.ts';

export function generateEnhancedScript(resumeContent: string): string {
  console.log('=== Generating enhanced script for 5+ minute podcast ===');
  
  // Extract key information from resume
  const lines = resumeContent.split('\n').filter(line => line.trim().length > 0);
  const name = extractName(lines);
  const summary = extractSummary(lines);
  const experience = extractExperience(lines);
  
  // Create a longer, more detailed conversational script
  let script = `Welcome to Career Spotlight, the podcast where we dive deep into inspiring professional journeys! I'm your host Sarah, and today I'm joined by my co-host Mike to explore the remarkable career story of ${name}.`;
  
  script += ` That's absolutely right, Sarah! What we have here is a truly fascinating professional profile that showcases not just technical expertise, but real growth and adaptability in today's dynamic workplace. Let's take our listeners through this incredible journey.`;
  
  // Opening segment - Personal introduction
  script += ` So Mike, when you first look at ${name}'s background, what immediately catches your attention?`;
  script += ` Well Sarah, what strikes me first is the comprehensive nature of their professional development. This isn't just someone who's been going through the motions - this is a professional who has been intentionally building their career with purpose and direction.`;
  
  // Professional Summary deep dive
  if (summary) {
    script += ` Let's start with their professional summary, which really sets the stage for everything we're about to discuss. ${summary}`;
    script += ` You know what I love about that summary, Sarah? It's not just a list of buzzwords. You can see the strategic thinking behind their career choices, and it shows someone who understands not just what they do, but why they do it.`;
    script += ` Exactly, Mike! And that kind of self-awareness is what separates good professionals from truly exceptional ones. It's clear that ${name} has taken the time to reflect on their journey and articulate their value proposition clearly.`;
  }
  
  // Experience analysis - detailed breakdown
  if (experience.length > 0) {
    script += ` Now let's dive into the meat of their experience. This is where we really see the progression and growth that defines a successful career trajectory.`;
    
    experience.slice(0, 4).forEach((exp, index) => {
      script += ` ${exp}`;
      
      if (index === 0) {
        script += ` Mike, this first role really shows us their foundation. You can see how they built the core competencies that would serve them throughout their career.`;
        script += ` Absolutely, Sarah. What I find impressive is how they didn't just perform their duties - they clearly took ownership and initiative. That's the kind of mindset that leads to real career advancement.`;
      } else if (index === 1) {
        script += ` And here we see the natural progression, Sarah. They're taking on more responsibility, tackling more complex challenges.`;
        script += ` Right, Mike. This is where we see them transitioning from execution to strategy, from following directions to providing direction. That's a crucial evolution in any professional's journey.`;
      } else if (index === 2) {
        script += ` This role really demonstrates their leadership capabilities emerging. They're not just managing tasks anymore - they're managing outcomes and people.`;
        script += ` And you can see how each role has built upon the previous one, Sarah. There's a clear thread of continuous learning and growth that runs through their entire career story.`;
      }
    });
  }
  
  // Skills and competencies analysis
  script += ` Let's talk about the skill set we see here, Mike. This isn't just about technical abilities - we're looking at a well-rounded professional toolkit.`;
  script += ` You're absolutely right, Sarah. What impresses me most is the balance between hard technical skills and the soft skills that make someone truly effective in today's collaborative workplace.`;
  script += ` And that's so important because technical skills can be taught, but the ability to communicate, lead, and adapt - those are the differentiators that employers are really looking for.`;
  
  // Industry insights and relevance
  script += ` When we look at ${name}'s background in the context of current industry trends, what do you see, Mike?`;
  script += ` This is someone who's positioned themselves incredibly well for the future of work, Sarah. They've developed expertise that's not just relevant today, but will continue to be valuable as industries evolve.`;
  script += ` That forward-thinking approach is evident throughout their career choices. They haven't just been reactive to opportunities - they've been proactive in building capabilities that open doors.`;
  
  // Career trajectory and achievements
  script += ` Let's talk about the overall trajectory we see here. This isn't a random collection of jobs - this is a carefully constructed career path.`;
  script += ` Exactly, Sarah. Each move has been strategic, building on previous experience while expanding into new areas of expertise. That shows real career intelligence and planning.`;
  script += ` And the achievements we see aren't just individual wins - they demonstrate someone who understands how their success contributes to organizational success. That's the kind of systems thinking that makes for effective leadership.`;
  
  // Value proposition and fit
  script += ` So Mike, when we put it all together, what's the value proposition that ${name} brings to a potential employer or collaborator?`;
  script += ` Sarah, what we have here is a proven performer with a track record of growth, adaptation, and results. But more than that, we have someone who brings both depth and breadth to their work.`;
  script += ` The depth comes from their specialized expertise, but the breadth comes from their ability to see the bigger picture and work effectively across different contexts and with different stakeholders.`;
  
  // Future potential and opportunities
  script += ` Looking ahead, where do you see someone with this background making their next impact, Mike?`;
  script += ` The beauty of a profile like this, Sarah, is its versatility. Whether they're looking to go deeper in their area of expertise or expand into new domains, they have the foundation to succeed.`;
  script += ` And in today's rapidly changing business environment, that adaptability is invaluable. Employers aren't just hiring for today's needs - they're hiring for tomorrow's challenges.`;
  
  // Closing thoughts
  script += ` As we wrap up today's episode, what would you say is the key takeaway from ${name}'s career story, Mike?`;
  script += ` I think the biggest lesson here, Sarah, is that successful careers aren't accidents. They're the result of intentional choices, continuous learning, and the courage to take on new challenges.`;
  script += ` Beautifully said, Mike. This has been another inspiring episode of Career Spotlight. To our listeners, if ${name}'s story resonates with you, remember that every successful career is built one strategic decision at a time.`;
  script += ` That's right, Sarah. Thank you to everyone for joining us today. Keep building those careers with purpose and intention, and we'll see you next time on Career Spotlight!`;
  
  console.log('Enhanced script generated successfully, length:', script.length);
  return script;
}
