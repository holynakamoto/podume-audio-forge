
export const cleanExtractedText = (text: string): string => {
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove control characters
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Normalize line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove multiple consecutive newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

export const extractStructuredTextFromPage = (textContent: any): string => {
  if (!textContent || !textContent.items) {
    return '';
  }

  const items = textContent.items;
  let pageText = '';
  
  try {
    // Sort items by vertical position, then horizontal
    const sortedItems = items.sort((a: any, b: any) => {
      if (!a.transform || !b.transform) return 0;
      
      const yDiff = b.transform[5] - a.transform[5]; // Y coordinate (inverted)
      if (Math.abs(yDiff) > 5) return yDiff > 0 ? 1 : -1;
      return a.transform[4] - b.transform[4]; // X coordinate
    });
    
    let currentY = null;
    let currentLine = '';
    
    for (const item of sortedItems) {
      if (!item.str || !item.transform) continue;
      
      const y = item.transform[5];
      const text = item.str.trim();
      
      if (!text) continue;
      
      // Check if we're on a new line
      if (currentY !== null && Math.abs(currentY - y) > 5) {
        if (currentLine.trim()) {
          pageText += currentLine.trim() + '\n';
        }
        currentLine = text + ' ';
      } else {
        currentLine += text + ' ';
      }
      
      currentY = y;
    }
    
    // Add the last line
    if (currentLine.trim()) {
      pageText += currentLine.trim() + '\n';
    }
    
  } catch (sortError) {
    console.warn('Error sorting text items, using fallback extraction:', sortError);
    // Fallback: just concatenate all text items
    for (const item of items) {
      if (item.str && item.str.trim()) {
        pageText += item.str.trim() + ' ';
      }
    }
  }
  
  return pageText;
};
