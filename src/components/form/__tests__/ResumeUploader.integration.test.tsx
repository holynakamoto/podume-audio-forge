
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/utils/test-utils';
import { ResumeUploader } from '../ResumeUploader';
import { extractTextFromPDFEnhanced } from '@/utils/enhanced-pdf-extractor';

// Mock the PDF extractor with different scenarios
jest.mock('@/utils/enhanced-pdf-extractor');
const mockExtractText = extractTextFromPDFEnhanced as jest.MockedFunction<typeof extractTextFromPDFEnhanced>;

describe('ResumeUploader Integration', () => {
  const mockOnResumeContentChange = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully extracts text from PDF', async () => {
    const mockResult = {
      text: 'Successfully extracted resume text',
      structured: {
        name: 'John Doe',
        contact: { email: 'john@example.com', phone: '123-456-7890' },
        sections: {
          experience: ['Software Engineer at Company'],
          education: ['BS Computer Science'],
          skills: ['JavaScript', 'React'],
        }
      },
      metadata: {
        pageCount: 2,
        extractionMethod: 'text' as const,
        confidence: 0.9
      }
    };

    mockExtractText.mockResolvedValueOnce(mockResult);

    render(
      <ResumeUploader 
        onResumeContentChange={mockOnResumeContentChange}
        resumeContent=""
      />
    );
    
    const fileInput = screen.getByLabelText(/Upload Your Resume \(PDF\)/);
    const validFile = new File(['pdf content'], 'resume.pdf', { type: 'application/pdf' });
    
    fireEvent.change(fileInput, { target: { files: [validFile] } });
    
    await waitFor(() => {
      expect(mockOnResumeContentChange).toHaveBeenCalledWith('Successfully extracted resume text');
    });

    // Should show extraction results
    expect(screen.getByText(/PDF Analysis Complete/)).toBeInTheDocument();
    expect(screen.getByText(/Confidence: 90%/)).toBeInTheDocument();
    expect(screen.getByText(/Found: John Doe/)).toBeInTheDocument();
  });

  it('handles PDF extraction errors gracefully', async () => {
    mockExtractText.mockRejectedValueOnce(new Error('Unable to read this PDF file'));

    render(
      <ResumeUploader 
        onResumeContentChange={mockOnResumeContentChange}
        resumeContent=""
      />
    );
    
    const fileInput = screen.getByLabelText(/Upload Your Resume \(PDF\)/);
    const validFile = new File(['pdf content'], 'corrupted.pdf', { type: 'application/pdf' });
    
    fireEvent.change(fileInput, { target: { files: [validFile] } });
    
    await waitFor(() => {
      expect(screen.getByText(/Having trouble with PDF upload/)).toBeInTheDocument();
    });
  });

  it('shows progress during extraction', async () => {
    let progressCallback: ((progress: number) => void) | undefined;
    
    mockExtractText.mockImplementationOnce((file, onProgress) => {
      progressCallback = onProgress;
      return new Promise((resolve) => {
        setTimeout(() => {
          progressCallback?.(50);
          setTimeout(() => {
            progressCallback?.(100);
            resolve({
              text: 'Extracted text',
              structured: {
                name: 'Test',
                contact: {},
                sections: { experience: [], education: [], skills: [] }
              },
              metadata: { pageCount: 1, extractionMethod: 'text' as const, confidence: 0.8 }
            });
          }, 100);
        }, 100);
      });
    });

    render(
      <ResumeUploader 
        onResumeContentChange={mockOnResumeContentChange}
        resumeContent=""
      />
    );
    
    const fileInput = screen.getByLabelText(/Upload Your Resume \(PDF\)/);
    const validFile = new File(['pdf content'], 'resume.pdf', { type: 'application/pdf' });
    
    fireEvent.change(fileInput, { target: { files: [validFile] } });
    
    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/Extracting text from PDF/)).toBeInTheDocument();
    });
  });
});
