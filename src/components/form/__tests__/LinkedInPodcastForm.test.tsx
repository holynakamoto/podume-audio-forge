
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LinkedInPodcastForm } from '../LinkedInPodcastForm';
import { server } from '../../../__mocks__/firecrawl-server';
import { http, HttpResponse } from 'msw';

// Mock dependencies
jest.mock('@/auth/ClerkAuthProvider', () => ({
  useAuth: () => ({
    user: { id: 'test-user' },
    isSignedIn: true,
  }),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({
        data: { session: { access_token: 'test-token' } },
        error: null,
      }),
    },
    functions: {
      invoke: jest.fn(),
    },
  },
}));

jest.mock('sonner', () => ({
  toast: {
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('LinkedInPodcastForm Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the form with all required fields', () => {
    render(<LinkedInPodcastForm />);
    
    expect(screen.getByText('Create Your Podcast')).toBeInTheDocument();
    expect(screen.getByLabelText('Podcast Title')).toBeInTheDocument();
    expect(screen.getByLabelText('LinkedIn Profile URL')).toBeInTheDocument();
    expect(screen.getByText('Package Options')).toBeInTheDocument();
    expect(screen.getByText('Create Podcast')).toBeInTheDocument();
  });

  it('should validate form inputs', async () => {
    const user = userEvent.setup();
    render(<LinkedInPodcastForm />);
    
    // Try to submit empty form
    const submitButton = screen.getByRole('button', { name: /create podcast/i });
    await user.click(submitButton);
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
  });

  it('should successfully extract LinkedIn profile and submit form', async () => {
    const user = userEvent.setup();
    const mockInvoke = jest.fn().mockResolvedValue({
      data: { podcast: { id: 'test-podcast-id' } },
      error: null,
    });
    
    require('@/integrations/supabase/client').supabase.functions.invoke = mockInvoke;
    
    render(<LinkedInPodcastForm />);
    
    // Fill form
    await user.type(screen.getByLabelText('Podcast Title'), 'Nicholas Moore Professional Journey');
    await user.type(screen.getByLabelText('LinkedIn Profile URL'), 'https://linkedin.com/in/nicholasmoore');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /create podcast/i }));
    
    // Should show extracting message
    await waitFor(() => {
      expect(screen.getByText(/extracting profile/i)).toBeInTheDocument();
    });
    
    // Should call the generate-podcast function with extracted data
    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('generate-podcast', {
        body: {
          title: 'Nicholas Moore Professional Journey',
          resume_content: expect.stringContaining('Nick Moore ⚡️'),
          package_type: 'core',
          voice_clone: false,
          premium_assets: false,
        },
        headers: {
          Authorization: 'Bearer test-token',
        },
      });
    });
  });

  it('should handle FireCrawl extraction errors', async () => {
    const user = userEvent.setup();
    const { toast } = require('sonner');
    
    // Mock FireCrawl API failure
    server.use(
      http.post('/api/firecrawl-scrape', () => {
        return new HttpResponse(
          JSON.stringify({ success: false, error: 'Failed to access LinkedIn profile' }), 
          { status: 400 }
        );
      })
    );
    
    render(<LinkedInPodcastForm />);
    
    // Fill and submit form
    await user.type(screen.getByLabelText('Podcast Title'), 'Test Podcast');
    await user.type(screen.getByLabelText('LinkedIn Profile URL'), 'https://linkedin.com/in/private-profile');
    await user.click(screen.getByRole('button', { name: /create podcast/i }));
    
    // Should show error message
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to access LinkedIn profile');
    });
  });

  it('should handle package type selection', async () => {
    const user = userEvent.setup();
    render(<LinkedInPodcastForm />);
    
    // Select premium package
    const premiumRadio = screen.getByRole('radio', { name: /premium package/i });
    await user.click(premiumRadio);
    
    expect(premiumRadio).toBeChecked();
  });

  it('should show loading states during form submission', async () => {
    const user = userEvent.setup();
    render(<LinkedInPodcastForm />);
    
    // Fill form
    await user.type(screen.getByLabelText('Podcast Title'), 'Test Podcast');
    await user.type(screen.getByLabelText('LinkedIn Profile URL'), 'https://linkedin.com/in/nicholasmoore');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /create podcast/i }));
    
    // Should show loading button with spinner
    await waitFor(() => {
      const submitButton = screen.getByRole('button');
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/extracting profile/i)).toBeInTheDocument();
    });
  });
});
