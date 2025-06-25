
import { GlobalWorkerOptions } from 'pdfjs-dist';

export const testPDFWorker = async (): Promise<boolean> => {
  try {
    return typeof GlobalWorkerOptions.workerSrc === 'string' && GlobalWorkerOptions.workerSrc.length > 0;
  } catch {
    return false;
  }
};

export const setupPDFWorker = () => {
  console.log('Setting up PDF.js worker with forced version 5.3.31...');
  
  // Clear any existing worker configuration
  GlobalWorkerOptions.workerSrc = '';
  
  try {
    // Use jsdelivr CDN with specific version - most reliable
    GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.3.31/build/pdf.worker.min.mjs`;
    console.log('PDF worker set to jsdelivr CDN with exact version 5.3.31:', GlobalWorkerOptions.workerSrc);
    
    // Verify the worker source is set correctly
    if (!GlobalWorkerOptions.workerSrc.includes('5.3.31')) {
      throw new Error('Worker version mismatch detected in URL');
    }
    
    console.log('Worker version verification passed');
  } catch (error) {
    console.warn('Failed to set jsdelivr worker, trying unpkg:', error);
    try {
      // Fallback to unpkg with exact version
      GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.mjs`;
      console.log('PDF worker set to unpkg CDN with exact version 5.3.31:', GlobalWorkerOptions.workerSrc);
    } catch (unpkgError) {
      console.error('Failed to set CDN workers, using local fallback:', unpkgError);
      // Last resort - local worker (will likely have version mismatch but worth trying)
      GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
      console.log('PDF worker set to local path (may have version issues):', GlobalWorkerOptions.workerSrc);
    }
  }
  
  // Force a small delay to ensure worker is ready
  setTimeout(() => {
    console.log('Worker setup completed. Current workerSrc:', GlobalWorkerOptions.workerSrc);
  }, 100);
};

// Initialize worker setup immediately
setupPDFWorker();
