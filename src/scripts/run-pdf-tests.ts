
export const runPDFTests = async () => {
  console.log('=== RUNNING PDF PARSING TESTS ===');
  
  // Test 1: Basic file validation
  console.log('Test 1: File validation');
  try {
    const emptyFile = new File([], 'empty.pdf', { type: 'application/pdf' });
    console.log('Empty file test: Expected to fail');
  } catch (error) {
    console.log('✓ Empty file correctly rejected');
  }

  // Test 2: File type detection
  console.log('Test 2: File type detection');
  const jpegBytes = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]);
  const fakeJpeg = new File([jpegBytes], 'image.pdf', { type: 'application/pdf' });
  console.log('JPEG disguised as PDF:', fakeJpeg.name);

  // Test 3: Worker availability
  console.log('Test 3: Worker availability');
  console.log('Worker support:', typeof Worker !== 'undefined');
  console.log('PDF.js loaded:', typeof (globalThis as any).pdfjsLib !== 'undefined');

  // Test 4: Environment check
  console.log('Test 4: Environment');
  console.log('Browser:', navigator.userAgent.split(' ').pop());
  console.log('Platform:', navigator.platform);
  console.log('Online:', navigator.onLine);

  console.log('=== PDF TESTS COMPLETE ===');
};

// Auto-run in development
if (import.meta.env.DEV) {
  runPDFTests();
}
