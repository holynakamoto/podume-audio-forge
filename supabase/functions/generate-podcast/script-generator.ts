
import { extractName, extractSummary, extractExperience } from './resume-extractor.ts';
import { generateEnhancedScript } from './enhanced-script-generator.ts';

export function generateBasicScript(resumeContent: string): string {
  console.log('=== Generating script with enhanced content for 5+ minutes ===');
  
  // Use the enhanced script generator for longer, more detailed content
  return generateEnhancedScript(resumeContent);
}
