
import { extractTextFromPDFEnhanced } from '../enhanced-pdf-extractor';

// Mock pdfjs-dist
jest.mock('pdfjs-dist', () => ({
  getDocument: jest.fn(),
  GlobalWorkerOptions: { workerSrc: '' },
}));

describe('enhanced-pdf-extractor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  describe('extractTextFromPDFEnhanced', () => {
    it('should handle empty files', async () => {
      const emptyFile = new File([], 'empty.pdf', { type: 'application/pdf' });
      
      await expect(extractTextFromPDFEnhanced(emptyFile)).rejects.toThrow(
        'The uploaded file appears to be empty'
      );
    });

    it('should handle very small files', async () => {
      const smallFile = new File(['x'], 'small.pdf', { type: 'application/pdf' });
      
      await expect(extractTextFromPDFEnhanced(smallFile)).rejects.toThrow(
        'The file is too small to be a valid PDF'
      );
    });

    it('should detect non-PDF files by header', async () => {
      // Create a file that looks like a ZIP file
      const zipHeader = new Uint8Array([0x50, 0x4B, 0x03, 0x04]);
      const zipFile = new File([zipHeader], 'test.pdf', { type: 'application/pdf' });
      
      await expect(extractTextFromPDFEnhanced(zipFile)).rejects.toThrow(
        'This appears to be a ZIP file or Office document'
      );
    });

    it('should detect JPEG files by header', async () => {
      const jpegHeader = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]);
      const jpegFile = new File([jpegHeader], 'test.pdf', { type: 'application/pdf' });
      
      await expect(extractTextFromPDFEnhanced(jpegFile)).rejects.toThrow(
        'This appears to be a JPEG image'
      );
    });

    it('should call progress callback during extraction', async () => {
      const mockProgress = jest.fn();
      const validPdfHeader = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // %PDF
      const validFile = new File([validPdfHeader], 'test.pdf', { type: 'application/pdf' });

      try {
        await extractTextFromPDFEnhanced(validFile, mockProgress);
      } catch (error) {
        // Expected to fail due to mock, but progress should be called
      }

      expect(mockProgress).toHaveBeenCalledWith(5);
      expect(mockProgress).toHaveBeenCalledWith(15);
    });

    it('should log detailed debugging information', async () => {
      const validPdfHeader = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
      const validFile = new File([validPdfHeader], 'test.pdf', { type: 'application/pdf' });

      try {
        await extractTextFromPDFEnhanced(validFile);
      } catch (error) {
        // Expected to fail due to mock
      }

      expect(console.log).toHaveBeenCalledWith(
        'Starting enhanced PDF text extraction...',
        expect.objectContaining({
          fileName: 'test.pdf',
          fileSize: expect.any(Number),
          fileType: 'application/pdf'
        })
      );
    });
  });
});
