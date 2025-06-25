
export interface ProgressCallback {
  (progress: number): void;
}

export interface PDFExtractionResult {
  text: string;
  structured: {
    name: string;
    contact: {
      email?: string;
      phone?: string;
    };
    sections: {
      summary?: string;
      experience: string[];
      education: string[];
      skills: string[];
    };
  };
  metadata: {
    pageCount: number;
    extractionMethod: 'text' | 'ocr' | 'fallback';
    confidence: number;
  };
}

export interface FileDebugInfo {
  headerAnalysis: {
    isPDF: boolean;
    detectedType: string;
  };
}
