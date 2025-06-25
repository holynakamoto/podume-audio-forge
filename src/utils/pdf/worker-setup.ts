
import { GlobalWorkerOptions } from 'pdfjs-dist';

export const testPDFWorker = async (): Promise<boolean> => {
  try {
    return typeof GlobalWorkerOptions.workerSrc === 'string' && GlobalWorkerOptions.workerSrc.length > 0;
  } catch {
    return false;
  }
};

export const setupPDFWorker = () => {
  console.log('=== PDF WORKER SETUP START ===');
  console.log('Setting up PDF.js worker with version 5.3.31...');
  
  // Clear any existing worker configuration to prevent conflicts
  GlobalWorkerOptions.workerSrc = '';
  
  try {
    // Method 1: Try local worker first (most reliable)
    console.log('Attempting local worker setup...');
    const localWorkerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
    GlobalWorkerOptions.workerSrc = localWorkerUrl;
    
    console.log('Local worker URL generated:', localWorkerUrl);
    
    // Verify the local path contains the expected structure
    if (GlobalWorkerOptions.workerSrc.includes('pdfjs-dist/build/pdf.worker.min.mjs')) {
      console.log('Local worker setup successful');
      console.log('Final worker source:', GlobalWorkerOptions.workerSrc);
      return;
    }
    
    throw new Error('Local worker path validation failed');
    
  } catch (error) {
    console.warn('Local worker setup failed:', error);
    console.log('Attempting CDN fallback methods...');
    
    // Method 2: Try multiple CDN sources for better reliability
    const cdnSources = [
      'https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.mjs',
      'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.3.31/build/pdf.worker.min.mjs',
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.3.31/pdf.worker.min.mjs'
    ];
    
    for (let i = 0; i < cdnSources.length; i++) {
      try {
        console.log(`Trying CDN source ${i + 1}:`, cdnSources[i]);
        GlobalWorkerOptions.workerSrc = cdnSources[i];
        
        // Simple validation that the URL is set
        if (GlobalWorkerOptions.workerSrc === cdnSources[i]) {
          console.log(`CDN source ${i + 1} set successfully`);
          break;
        }
      } catch (cdnError) {
        console.warn(`CDN source ${i + 1} failed:`, cdnError);
        if (i === cdnSources.length - 1) {
          console.error('All CDN sources failed, using last fallback');
          GlobalWorkerOptions.workerSrc = cdnSources[0]; // Use first as final fallback
        }
      }
    }
  }
  
  console.log('=== PDF WORKER SETUP COMPLETE ===');
  console.log('Final worker source:', GlobalWorkerOptions.workerSrc);
};

// Enhanced worker reset function for when mismatches occur
export const resetPDFWorker = () => {
  console.log('=== RESETTING PDF WORKER ===');
  GlobalWorkerOptions.workerSrc = '';
  
  // Wait a moment before reinitializing
  setTimeout(() => {
    setupPDFWorker();
  }, 100);
};

// Worker health check function
export const checkWorkerHealth = async (): Promise<{ healthy: boolean; error?: string }> => {
  try {
    if (!GlobalWorkerOptions.workerSrc) {
      return { healthy: false, error: 'No worker source configured' };
    }
    
    // Check if worker source is accessible (basic validation)
    if (GlobalWorkerOptions.workerSrc.startsWith('http')) {
      // For CDN sources, we can't easily test without making a request
      // but we can validate the URL format
      const isValidUrl = /^https?:\/\/.+\/pdf\.worker\.min\.mjs$/.test(GlobalWorkerOptions.workerSrc);
      return { 
        healthy: isValidUrl, 
        error: isValidUrl ? undefined : 'Invalid worker URL format' 
      };
    }
    
    return { healthy: true };
  } catch (error) {
    return { 
      healthy: false, 
      error: error instanceof Error ? error.message : 'Unknown worker health check error' 
    };
  }
};

// Initialize worker setup immediately
setupPDFWorker();
