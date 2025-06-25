
import { GlobalWorkerOptions } from 'pdfjs-dist';

export const testPDFWorker = async (): Promise<boolean> => {
  try {
    return typeof GlobalWorkerOptions.workerSrc === 'string' && GlobalWorkerOptions.workerSrc.length > 0;
  } catch {
    return false;
  }
};

export const setupPDFWorker = () => {
  console.log('Setting up PDF.js worker with version 5.3.31...');
  
  // Clear any existing worker configuration
  GlobalWorkerOptions.workerSrc = '';
  
  try {
    // Use the exact same version as our installed pdfjs-dist package
    // This should resolve the version mismatch
    GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
    
    console.log('PDF worker set to local path:', GlobalWorkerOptions.workerSrc);
    
    // If local worker fails, fallback to CDN with exact version
    if (!GlobalWorkerOptions.workerSrc.includes('pdfjs-dist')) {
      throw new Error('Local worker path failed');
    }
    
  } catch (error) {
    console.warn('Local worker setup failed, using CDN fallback:', error);
    
    // Use unpkg as primary CDN fallback - it's more reliable for exact versions
    GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.mjs';
    console.log('PDF worker set to unpkg CDN:', GlobalWorkerOptions.workerSrc);
  }
  
  // Verify worker is set
  console.log('Final worker source:', GlobalWorkerOptions.workerSrc);
};

// Initialize worker setup immediately
setupPDFWorker();
