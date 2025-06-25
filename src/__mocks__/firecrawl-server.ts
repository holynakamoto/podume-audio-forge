
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const mockLinkedInProfileData = {
  success: true,
  data: `
Nick Moore ⚡️

Anaheim, California, United States

5K followers • 500+ connections

About: He Makes All Things New

Experience:
• Senior Software Engineer at Tech Company
• Full Stack Developer with expertise in React, TypeScript, Node.js
• 5+ years of experience in web development

Languages: English, Python, Golang, Arabic

Skills: React, TypeScript, Node.js, AWS, Docker, Kubernetes
  `.trim()
};

const handlers = [
  // Mock the firecrawl edge function endpoint
  rest.post('/api/firecrawl-scrape', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(mockLinkedInProfileData)
    );
  }),
  
  // Mock the Supabase edge function endpoint
  rest.post('*/functions/v1/firecrawl-scrape', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(mockLinkedInProfileData)
    );
  }),
];

export const server = setupServer(...handlers);
