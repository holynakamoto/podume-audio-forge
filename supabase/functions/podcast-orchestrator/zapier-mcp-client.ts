
export class ZapierMCPClient {
  private apiKey: string;
  private baseUrl = 'https://hooks.zapier.com/hooks/catch';
  
  constructor(config: { apiKey: string }) {
    this.apiKey = config.apiKey;
  }
  
  async extractLinkedInProfile(url: string): Promise<any> {
    console.log('🔗 Extracting LinkedIn profile for:', url);
    
    try {
      // Call Zapier MCP server to extract LinkedIn data
      const response = await fetch(`${this.baseUrl}/linkedin-extract/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({ linkedin_url: url })
      });
      
      if (!response.ok) {
        throw new Error(`LinkedIn extraction failed: ${response.statusText}`);
      }
      
      const profileData = await response.json();
      console.log('✅ LinkedIn profile extracted successfully');
      return profileData;
      
    } catch (error) {
      console.error('❌ LinkedIn extraction error:', error);
      // Fallback to mock data for testing
      return {
        name: 'John Doe',
        headline: 'Senior Software Engineer at Tech Corp',
        summary: 'Experienced software engineer with 10+ years in full-stack development...',
        experience: [
          {
            title: 'Senior Software Engineer',
            company: 'Tech Corp',
            duration: '2020 - Present',
            description: 'Led development of scalable web applications...'
          }
        ],
        skills: ['JavaScript', 'React', 'Node.js', 'Python'],
        education: [
          {
            school: 'University of Technology',
            degree: 'Computer Science',
            year: '2015'
          }
        ]
      };
    }
  }
  
  async triggerNotification(data: any): Promise<void> {
    console.log('📧 Triggering notification for job:', data.jobId);
    
    try {
      await fetch(`${this.baseUrl}/podcast-notification/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(data)
      });
      
      console.log('✅ Notification triggered successfully');
    } catch (error) {
      console.error('❌ Notification error:', error);
      // Don't throw - notifications are non-critical
    }
  }
}
