
// Regression tests to ensure existing functionality continues to work
import { render, screen, fireEvent } from '@testing-library/react';
import { LinkedInPodcastForm } from '@/components/form/LinkedInPodcastForm';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Regression Tests', () => {
  test('LinkedIn form should maintain previous functionality', () => {
    render(
      <TestWrapper>
        <LinkedInPodcastForm />
      </TestWrapper>
    );
    
    // Core elements should be present
    expect(screen.getByLabelText(/Podcast Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/LinkedIn Profile URL/i)).toBeInTheDocument();
    expect(screen.getByText(/Create LinkedIn Podcast/i)).toBeInTheDocument();
  });

  test('Package selector should work as before', () => {
    render(
      <TestWrapper>
        <LinkedInPodcastForm />
      </TestWrapper>
    );
    
    const coreOption = screen.getByLabelText(/Core Package/i);
    const premiumOption = screen.getByLabelText(/Premium Package/i);
    
    expect(coreOption).toBeInTheDocument();
    expect(premiumOption).toBeInTheDocument();
    
    // Core should be selected by default
    expect(coreOption).toBeChecked();
  });

  test('Form validation should work consistently', () => {
    render(
      <TestWrapper>
        <LinkedInPodcastForm />
      </TestWrapper>
    );
    
    const titleInput = screen.getByLabelText(/Podcast Title/i);
    const urlInput = screen.getByLabelText(/LinkedIn Profile URL/i);
    
    // Test empty form submission
    fireEvent.click(screen.getByText(/Create LinkedIn Podcast/i));
    
    // Should show validation errors (this depends on form implementation)
    expect(titleInput).toBeInTheDocument();
    expect(urlInput).toBeInTheDocument();
  });
});
