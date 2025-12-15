// OCR Settings Types
export type OcrLanguage = 'auto' | 'vi' | 'en' | 'ja' | 'ko' | 'zh';
export type OcrMode = 'fast' | 'balanced' | 'accurate';

export interface OcrPreprocess {
  deskew: boolean;
  denoise: boolean;
  binarize: boolean;
  contrastBoost: boolean;
}

export interface RegionSelection {
  type: 'full' | 'manual';
  coords?: { x: number; y: number; w: number; h: number };
}

export interface OcrOutputOptions {
  keepLineBreaks: boolean;
  preserveLayout: boolean;
  detectTables: boolean;
}

export interface OcrSettings {
  language: OcrLanguage;
  mode: OcrMode;
  preprocess: OcrPreprocess;
  region: RegionSelection;
  output: OcrOutputOptions;
}

// OCR Result Types
export interface OcrPage {
  page: number;
  text: string;
  confidence: number;
}

export interface OcrResult {
  fullText: string;
  pages?: OcrPage[];
  language: string;
  avgConfidence: number;
  processingTime: number;
}

// Convert Types
export type OutputFormat = 'txt' | 'pdf' | 'docx' | 'md' | 'json';
export type Encoding = 'utf-8' | 'utf-16' | 'ascii';
export type PageSize = 'a4' | 'letter' | 'legal';

export interface ConvertOptions {
  format: OutputFormat;
  fileName: string;
  encoding: Encoding;
  includeMetadata: boolean;
  pageSize: PageSize;
  fontSize: number;
}

// App State Types
export type TabType = 'extract' | 'convert';
export type ProcessStatus = 'idle' | 'running' | 'done' | 'error';

export interface ProgressState {
  step: number;
  text: string;
  total: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

// File validation
export const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
];

export const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'pdf', 'docx', 'txt', 'md'];

export const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
