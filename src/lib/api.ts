import type { BatchJob, ConvertOptions, OcrLayoutPage, OcrPage, OcrResult, OcrSettings, ProgressState } from "@/types";
import { generateId } from '@/utils/file';

const DEMO_PAGES: OcrPage[] = [
  {
    page: 1,
    text: 'Invoice #2024-2190\\nVendor: ACME Corp\\nTotal: $1,200.00\\nDate: 2024-03-10',
    confidence: 0.93,
    lowConfidenceRanges: [
      [9, 13] as [number, number],
      [32, 36] as [number, number],
    ],
  },
  {
    page: 2,
    text: 'Line items:\\n1. Service A - $600\\n2. Service B - $600\\nNotes: Thank you for your business.',
    confidence: 0.9,
  },
];

const STRUCTURED_SAMPLE = {
  tables: [
    {
      id: 'table-1',
      name: 'Line Items',
      rows: [
        ['Item', 'Qty', 'Price'],
        ['Service A', '1', '$600'],
        ['Service B', '1', '$600'],
      ],
    },
  ],
  keyValues: [
    { key: 'Invoice Number', value: '#2024-2190' },
    { key: 'Vendor', value: 'ACME Corp' },
    { key: 'Total', value: '$1,200.00' },
  ],
  entities: [
    { type: 'Email', value: 'billing@acme.com' },
    { type: 'Address', value: '123 Market Street, NY' },
  ],
};

const LAYOUT_SAMPLE: OcrLayoutPage[] = [
  {
    page: 1,
    width: 1,
    height: 1.414,
    blocks: [
      {
        id: 'b1',
        bbox: { x: 0.08, y: 0.08, w: 0.84, h: 0.32 },
        lines: [
          {
            text: 'Invoice #2024-2190',
            confidence: 0.94,
            bbox: { x: 0.1, y: 0.1, w: 0.5, h: 0.05 },
            words: [
              { text: 'Invoice', bbox: { x: 0.1, y: 0.1, w: 0.18, h: 0.05 }, confidence: 0.95 },
              { text: '#2024-2190', bbox: { x: 0.29, y: 0.1, w: 0.18, h: 0.05 }, confidence: 0.93 },
            ],
          },
          {
            text: 'Vendor: ACME Corp',
            confidence: 0.92,
            bbox: { x: 0.1, y: 0.16, w: 0.45, h: 0.05 },
            words: [
              { text: 'Vendor:', bbox: { x: 0.1, y: 0.16, w: 0.15, h: 0.05 }, confidence: 0.91 },
              { text: 'ACME', bbox: { x: 0.26, y: 0.16, w: 0.12, h: 0.05 }, confidence: 0.93 },
              { text: 'Corp', bbox: { x: 0.39, y: 0.16, w: 0.1, h: 0.05 }, confidence: 0.9 },
            ],
          },
          {
            text: 'Total: $1,200.00',
            confidence: 0.93,
            bbox: { x: 0.1, y: 0.22, w: 0.32, h: 0.05 },
            words: [
              { text: 'Total:', bbox: { x: 0.1, y: 0.22, w: 0.12, h: 0.05 }, confidence: 0.92 },
              { text: '$1,200.00', bbox: { x: 0.23, y: 0.22, w: 0.19, h: 0.05 }, confidence: 0.94 },
            ],
          },
        ],
      },
      {
        id: 'b2',
        bbox: { x: 0.08, y: 0.44, w: 0.84, h: 0.4 },
        lines: [
          {
            text: 'Line items:',
            confidence: 0.9,
            bbox: { x: 0.1, y: 0.46, w: 0.25, h: 0.05 },
            words: [
              { text: 'Line', bbox: { x: 0.1, y: 0.46, w: 0.1, h: 0.05 }, confidence: 0.9 },
              { text: 'items:', bbox: { x: 0.21, y: 0.46, w: 0.12, h: 0.05 }, confidence: 0.89 },
            ],
          },
          {
            text: '1. Service A - $600',
            confidence: 0.9,
            bbox: { x: 0.12, y: 0.52, w: 0.5, h: 0.05 },
            words: [
              { text: '1.', bbox: { x: 0.12, y: 0.52, w: 0.05, h: 0.05 }, confidence: 0.88 },
              { text: 'Service', bbox: { x: 0.18, y: 0.52, w: 0.16, h: 0.05 }, confidence: 0.9 },
              { text: 'A', bbox: { x: 0.35, y: 0.52, w: 0.04, h: 0.05 }, confidence: 0.89 },
              { text: '-', bbox: { x: 0.4, y: 0.52, w: 0.03, h: 0.05 }, confidence: 0.88 },
              { text: '$600', bbox: { x: 0.44, y: 0.52, w: 0.14, h: 0.05 }, confidence: 0.92 },
            ],
          },
          {
            text: '2. Service B - $600',
            confidence: 0.9,
            bbox: { x: 0.12, y: 0.58, w: 0.5, h: 0.05 },
            words: [
              { text: '2.', bbox: { x: 0.12, y: 0.58, w: 0.05, h: 0.05 }, confidence: 0.88 },
              { text: 'Service', bbox: { x: 0.18, y: 0.58, w: 0.16, h: 0.05 }, confidence: 0.9 },
              { text: 'B', bbox: { x: 0.35, y: 0.58, w: 0.04, h: 0.05 }, confidence: 0.89 },
              { text: '-', bbox: { x: 0.4, y: 0.58, w: 0.03, h: 0.05 }, confidence: 0.88 },
              { text: '$600', bbox: { x: 0.44, y: 0.58, w: 0.14, h: 0.05 }, confidence: 0.92 },
            ],
          },
          {
            text: 'Notes: Thank you for your business.',
            confidence: 0.88,
            bbox: { x: 0.12, y: 0.66, w: 0.6, h: 0.05 },
            words: [
              { text: 'Notes:', bbox: { x: 0.12, y: 0.66, w: 0.12, h: 0.05 }, confidence: 0.87 },
              { text: 'Thank', bbox: { x: 0.25, y: 0.66, w: 0.12, h: 0.05 }, confidence: 0.87 },
              { text: 'you', bbox: { x: 0.38, y: 0.66, w: 0.1, h: 0.05 }, confidence: 0.85 },
              { text: 'for', bbox: { x: 0.5, y: 0.66, w: 0.08, h: 0.05 }, confidence: 0.86 },
              { text: 'your', bbox: { x: 0.6, y: 0.66, w: 0.1, h: 0.05 }, confidence: 0.86 },
              { text: 'business.', bbox: { x: 0.71, y: 0.66, w: 0.16, h: 0.05 }, confidence: 0.9 },
            ],
          },
        ],
      },
    ],
  },
  {
    page: 2,
    width: 1,
    height: 1.414,
    blocks: [
      {
        id: 'b3',
        bbox: { x: 0.08, y: 0.1, w: 0.84, h: 0.3 },
        lines: [
          {
            text: 'Support contact',
            confidence: 0.9,
            bbox: { x: 0.1, y: 0.12, w: 0.3, h: 0.05 },
            words: [
              { text: 'Support', bbox: { x: 0.1, y: 0.12, w: 0.16, h: 0.05 }, confidence: 0.9 },
              { text: 'contact', bbox: { x: 0.27, y: 0.12, w: 0.13, h: 0.05 }, confidence: 0.9 },
            ],
          },
          {
            text: 'Email: help@acme.com',
            confidence: 0.9,
            bbox: { x: 0.1, y: 0.18, w: 0.4, h: 0.05 },
            words: [
              { text: 'Email:', bbox: { x: 0.1, y: 0.18, w: 0.14, h: 0.05 }, confidence: 0.89 },
              { text: 'help@acme.com', bbox: { x: 0.25, y: 0.18, w: 0.24, h: 0.05 }, confidence: 0.91 },
            ],
          },
          {
            text: 'Phone: +1 555 333 222',
            confidence: 0.88,
            bbox: { x: 0.1, y: 0.24, w: 0.42, h: 0.05 },
            words: [
              { text: 'Phone:', bbox: { x: 0.1, y: 0.24, w: 0.15, h: 0.05 }, confidence: 0.87 },
              { text: '+1', bbox: { x: 0.26, y: 0.24, w: 0.06, h: 0.05 }, confidence: 0.86 },
              { text: '555', bbox: { x: 0.33, y: 0.24, w: 0.08, h: 0.05 }, confidence: 0.88 },
              { text: '333', bbox: { x: 0.42, y: 0.24, w: 0.08, h: 0.05 }, confidence: 0.88 },
              { text: '222', bbox: { x: 0.51, y: 0.24, w: 0.08, h: 0.05 }, confidence: 0.88 },
            ],
          },
        ],
      },
    ],
  },
];

const JOB_STATUSES: BatchJob['status'][] = ['queued', 'preprocessing', 'running', 'postprocessing', 'done'];

let jobs: BatchJob[] = [
  {
    id: generateId('job'),
    fileName: 'contract.pdf',
    type: 'ocr',
    status: 'done',
    progress: 100,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    attempt: 1,
    resultUrl: '#',
  },
  {
    id: generateId('job'),
    fileName: 'notes.md',
    type: 'convert',
    status: 'postprocessing',
    progress: 72,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date().toISOString(),
    attempt: 1,
  },
];

type ProgressCallback = (progress: ProgressState) => void;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function simulateConfidence(mode: OcrSettings['mode']) {
  if (mode === 'fast') return 0.86 + Math.random() * 0.04;
  if (mode === 'balanced') return 0.9 + Math.random() * 0.06;
  return 0.93 + Math.random() * 0.05;
}

export async function uploadAndExtractText(
  file: File,
  settings: OcrSettings,
  onProgress?: ProgressCallback
): Promise<OcrResult> {
  const steps: ProgressState[] = [
    { current: 1, total: 5, label: 'Uploading file' },
    { current: 2, total: 5, label: 'Preprocessing (deskew, denoise, enhance)' },
    { current: 3, total: 5, label: 'Recognizing text' },
    { current: 4, total: 5, label: 'Post-processing (spell check, cleanup)' },
    { current: 5, total: 5, label: 'Finalizing output' },
  ];

  for (const step of steps) {
    onProgress?.(step);
    const base = settings.mode === 'fast' ? 220 : settings.mode === 'balanced' ? 360 : 520;
    await delay(base + Math.random() * 120);
  }

  const isPdf = file.type === 'application/pdf';
  const confidence = simulateConfidence(settings.mode);

  const pages = isPdf
    ? DEMO_PAGES
    : [
        {
          page: 1,
          text:
            'DocText Suite demo text. Upload any PNG/JPG/PDF to see OCR flow. Includes preprocess toggles and structured data preview.',
          confidence,
          lowConfidenceRanges: [
            [12, 17] as [number, number],
            [58, 63] as [number, number],
          ],
        },
      ];

  const fullText = pages.map((p) => p.text).join('\\n\\n---\\n\\n');

  return {
    fullText,
    pages,
    layoutPages: LAYOUT_SAMPLE.slice(0, isPdf ? 2 : 1),
    language: settings.language === 'auto' ? 'en' : settings.language,
    avgConfidence: confidence,
    structured: STRUCTURED_SAMPLE,
    version: 'v1',
    status: 'done',
  };
}

const CONVERT_STEPS: ProgressState[] = [
  { current: 1, total: 3, label: 'Analyzing text' },
  { current: 2, total: 3, label: 'Generating document' },
  { current: 3, total: 3, label: 'Packaging download' },
];

export async function convertTextToFile(
  text: string,
  options: ConvertOptions,
  onProgress?: ProgressCallback
): Promise<Blob> {
  for (const step of CONVERT_STEPS) {
    onProgress?.(step);
    await delay(300 + Math.random() * 120);
  }

  const mimeTypes: Record<ConvertOptions['format'], string> = {
    txt: 'text/plain',
    md: 'text/markdown',
    json: 'application/json',
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };

  let content = text;
  if (options.format === 'json') {
    content = JSON.stringify(
      {
        content: text,
        meta: options.includeMetadata
          ? {
              generatedAt: new Date().toISOString(),
              pageSize: options.pageSize,
              length: text.length,
            }
          : undefined,
      },
      null,
      2
    );
  } else if (options.format === 'md') {
    content = `# DocText Suite Output\\n\\n${text}`;
  }

  return new Blob([content], { type: mimeTypes[options.format] });
}

export async function createBatchJobs(files: File[], settings: OcrSettings): Promise<BatchJob[]> {
  const newJobs: BatchJob[] = files.map((file) => {
    const id = generateId('job');
    return {
      id,
      fileName: file.name,
      type: 'ocr',
      status: 'queued',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attempt: 1,
      message: `Lang: ${settings.language}, Mode: ${settings.mode}`,
    };
  });

  jobs = [...newJobs, ...jobs].slice(0, 20);

  newJobs.forEach((job) => simulateJob(job.id));

  await delay(200);
  return newJobs;
}

function simulateJob(jobId: string) {
  let idx = 0;
  const timer = setInterval(() => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) {
      clearInterval(timer);
      return;
    }

    job.status = JOB_STATUSES[Math.min(idx, JOB_STATUSES.length - 1)];
    job.progress = Math.min(100, Math.round(((idx + 1) / JOB_STATUSES.length) * 100));
    job.updatedAt = new Date().toISOString();

    if (idx >= JOB_STATUSES.length - 1) {
      clearInterval(timer);
    }
    idx += 1;
  }, 550);
}

export async function getJobs(): Promise<BatchJob[]> {
  await delay(120);
  return jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

