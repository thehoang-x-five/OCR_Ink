import type { OcrSettings, OcrResult, ConvertOptions, ProgressState } from '@/types';

// Demo text for mock responses
const DEMO_TEXT = `DocText OCR & Converter

This is a sample extracted text from your document. The OCR engine has successfully processed your file and identified the following content:

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

Key Features Detected:
• Text extraction with high accuracy
• Multi-language support
• Layout preservation
• Table detection capability

Processing Statistics:
- Characters detected: 1,247
- Words identified: 203
- Paragraphs: 5
- Tables: 1

Thank you for using DocText OCR & Converter!`;

const DEMO_PAGES = [
  {
    page: 1,
    text: 'Page 1: Introduction\n\nThis document demonstrates multi-page PDF extraction capabilities.',
    confidence: 0.94,
  },
  {
    page: 2,
    text: 'Page 2: Content\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    confidence: 0.91,
  },
  {
    page: 3,
    text: 'Page 3: Conclusion\n\nThank you for using DocText OCR & Converter. Your document has been processed successfully.',
    confidence: 0.96,
  },
];

// Progress steps
const PROGRESS_STEPS: ProgressState[] = [
  { step: 1, text: 'Uploading file...', total: 5 },
  { step: 2, text: 'Preprocessing image...', total: 5 },
  { step: 3, text: 'Running OCR recognition...', total: 5 },
  { step: 4, text: 'Post-processing text...', total: 5 },
  { step: 5, text: 'Finalizing results...', total: 5 },
];

type ProgressCallback = (progress: ProgressState) => void;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRandomConfidence(): number {
  return 0.85 + Math.random() * 0.14; // 0.85 - 0.99
}

export async function uploadAndExtractText(
  file: File,
  settings: OcrSettings,
  onProgress?: ProgressCallback
): Promise<OcrResult> {
  const isPdf = file.type === 'application/pdf';
  const startTime = Date.now();
  
  // Simulate progress steps
  for (const step of PROGRESS_STEPS) {
    onProgress?.(step);
    const delayTime = settings.mode === 'fast' ? 300 : settings.mode === 'balanced' ? 500 : 800;
    await delay(delayTime);
  }
  
  const processingTime = Date.now() - startTime;
  
  // Return mock result
  if (isPdf) {
    const fullText = DEMO_PAGES.map((p) => p.text).join('\n\n---\n\n');
    const avgConfidence = DEMO_PAGES.reduce((sum, p) => sum + p.confidence, 0) / DEMO_PAGES.length;
    
    return {
      fullText,
      pages: DEMO_PAGES,
      language: settings.language === 'auto' ? 'en' : settings.language,
      avgConfidence,
      processingTime,
    };
  }
  
  return {
    fullText: DEMO_TEXT,
    language: settings.language === 'auto' ? 'en' : settings.language,
    avgConfidence: getRandomConfidence(),
    processingTime,
  };
}

const CONVERT_STEPS: ProgressState[] = [
  { step: 1, text: 'Processing text...', total: 3 },
  { step: 2, text: 'Generating file...', total: 3 },
  { step: 3, text: 'Finalizing...', total: 3 },
];

export async function convertTextToFile(
  text: string,
  options: ConvertOptions,
  onProgress?: ProgressCallback
): Promise<Blob> {
  // Simulate progress
  for (const step of CONVERT_STEPS) {
    onProgress?.(step);
    await delay(400);
  }
  
  // Generate appropriate blob based on format
  const mimeTypes: Record<string, string> = {
    txt: 'text/plain',
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    md: 'text/markdown',
    json: 'application/json',
  };
  
  let content: string = text;
  
  if (options.format === 'json') {
    content = JSON.stringify(
      {
        content: text,
        metadata: options.includeMetadata
          ? {
              createdAt: new Date().toISOString(),
              encoding: options.encoding,
              charCount: text.length,
              wordCount: text.split(/\s+/).filter(Boolean).length,
            }
          : undefined,
      },
      null,
      2
    );
  } else if (options.format === 'md') {
    content = `# Converted Document\n\n${text}`;
  }
  
  return new Blob([content], { type: mimeTypes[options.format] || 'text/plain' });
}

// Helper to read text file content
export async function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
