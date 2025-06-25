
export interface PDFDebugInfo {
  fileInfo: {
    name: string;
    size: number;
    type: string;
    lastModified: number;
  };
  headerAnalysis: {
    isPDF: boolean;
    detectedType: string;
    headerBytes: string;
  };
  environmentInfo: {
    userAgent: string;
    platform: string;
    cookieEnabled: boolean;
    onLine: boolean;
  };
  workerInfo: {
    workerSrc: string;
    isWorkerAvailable: boolean;
  };
}

export const debugPDFFile = async (file: File): Promise<PDFDebugInfo> => {
  console.log('=== PDF DEBUG ANALYSIS START ===');
  
  // File info
  const fileInfo = {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
  };
  console.log('File Info:', fileInfo);

  // Header analysis
  const headerBuffer = await file.slice(0, 50).arrayBuffer();
  const headerBytes = Array.from(new Uint8Array(headerBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join(' ');
  
  const uint8Array = new Uint8Array(headerBuffer);
  const pdfSignature = [0x25, 0x50, 0x44, 0x46]; // %PDF
  const isPDF = pdfSignature.every((byte, index) => uint8Array[index] === byte);
  
  let detectedType = 'unknown';
  if (isPDF) {
    detectedType = 'PDF';
  } else if (uint8Array[0] === 0x50 && uint8Array[1] === 0x4B) {
    detectedType = 'ZIP/Office';
  } else if (uint8Array[0] === 0xFF && uint8Array[1] === 0xD8) {
    detectedType = 'JPEG';
  } else if (uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && uint8Array[3] === 0x47) {
    detectedType = 'PNG';
  }

  const headerAnalysis = {
    isPDF,
    detectedType,
    headerBytes,
  };
  console.log('Header Analysis:', headerAnalysis);

  // Environment info
  const environmentInfo = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
  };
  console.log('Environment Info:', environmentInfo);

  // Worker info
  const workerInfo = {
    workerSrc: (globalThis as any).pdfjsLib?.GlobalWorkerOptions?.workerSrc || 'not set',
    isWorkerAvailable: typeof Worker !== 'undefined',
  };
  console.log('Worker Info:', workerInfo);

  const debugInfo = {
    fileInfo,
    headerAnalysis,
    environmentInfo,
    workerInfo,
  };

  console.log('=== PDF DEBUG ANALYSIS COMPLETE ===');
  return debugInfo;
};

export const logPDFError = (error: Error, context: string, additionalInfo?: any) => {
  console.error(`=== PDF ERROR in ${context} ===`);
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
  console.error('Error name:', error.name);
  if (additionalInfo) {
    console.error('Additional info:', additionalInfo);
  }
  console.error('=== END PDF ERROR ===');
};

export const testPDFWorker = async (): Promise<boolean> => {
  try {
    console.log('Testing PDF worker availability...');
    
    // Check if Worker is available
    if (typeof Worker === 'undefined') {
      console.error('Web Workers not supported in this environment');
      return false;
    }

    // Check if pdfjs is loaded
    const pdfjs = (globalThis as any).pdfjsLib;
    if (!pdfjs) {
      console.error('PDF.js library not loaded');
      return false;
    }

    // Check worker source
    const workerSrc = pdfjs.GlobalWorkerOptions?.workerSrc;
    if (!workerSrc) {
      console.error('PDF worker source not configured');
      return false;
    }

    console.log('PDF worker test passed');
    return true;
  } catch (error) {
    console.error('PDF worker test failed:', error);
    return false;
  }
};
