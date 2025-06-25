
import React from 'react';
import { render } from '@/utils/test-utils';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { ResumeUploader } from '../ResumeUploader';
import { toast } from 'sonner';

// Mock the PDF extractor
jest.mock('@/utils/enhanced-pdf-extractor', () => ({
  extractTextFromPDFEnhanced: jest.fn(),
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe('ResumeUploader', () => {
  const mockOnResumeContentChange = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders upload mode by default', () => {
    render(
      <ResumeUploader 
        onResumeContentChange={mockOnResumeContentChange}
        resumeContent=""
      />
    );
    
    expect(screen.getByText('Upload PDF')).toBeInTheDocument();
    expect(screen.getByLabelText(/Upload Your Resume \(PDF\)/)).toBeInTheDocument();
  });

  it('switches to paste mode when selected', () => {
    render(
      <ResumeUploader 
        onResumeContentChange={mockOnResumeContentChange}
        resumeContent=""
      />
    );
    
    fireEvent.click(screen.getByText('Paste Text'));
    expect(screen.getByLabelText(/Paste Your Resume Text/)).toBeInTheDocument();
  });

  it('validates file type before processing', async () => {
    render(
      <ResumeUploader 
        onResumeContentChange={mockOnResumeContentChange}
        resumeContent=""
      />
    );
    
    const fileInput = screen.getByLabelText(/Upload Your Resume \(PDF\)/);
    const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });
    
    expect(toast.error).toHaveBeenCalledWith(
      'Please upload a PDF file. Other file formats are not supported.'
    );
  });

  it('validates file size', async () => {
    render(
      <ResumeUploader 
        onResumeContentChange={mockOnResumeContentChange}
        resumeContent=""
      />
    );
    
    const fileInput = screen.getByLabelText(/Upload Your Resume \(PDF\)/);
    // Create a file larger than 10MB
    const largeContent = 'x'.repeat(11 * 1024 * 1024);
    const largeFile = new File([largeContent], 'large.pdf', { type: 'application/pdf' });
    
    fireEvent.change(fileInput, { target: { files: [largeFile] } });
    
    expect(toast.error).toHaveBeenCalledWith(
      'File size must be less than 10MB. Please try a smaller PDF file.'
    );
  });

  it('shows extracted text preview', () => {
    const sampleText = 'This is extracted resume content from the PDF file.';
    render(
      <ResumeUploader 
        onResumeContentChange={mockOnResumeContentChange}
        resumeContent={sampleText}
      />
    );
    
    expect(screen.getByText('Extracted Text Preview')).toBeInTheDocument();
    expect(screen.getByText(sampleText)).toBeInTheDocument();
  });

  it('updates content when text is pasted', () => {
    render(
      <ResumeUploader 
        onResumeContentChange={mockOnResumeContentChange}
        resumeContent=""
      />
    );
    
    // Switch to paste mode
    fireEvent.click(screen.getByText('Paste Text'));
    
    const textarea = screen.getByPlaceholderText(/Copy and paste your full resume text here/);
    fireEvent.change(textarea, { target: { value: 'Pasted resume content' } });
    
    expect(mockOnResumeContentChange).toHaveBeenCalledWith('Pasted resume content');
  });
});
