import type { BatchJob, ConvertOptions, OcrLayoutPage, OcrPage, OcrResult, OcrSettings, ProgressState } from "@/types";
import { generateId } from '@/utils/file';

// Backend API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// API client for backend integration
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async extractOcr(file: File, settings: OcrSettings, sync: boolean = false): Promise<{ jobId?: string; result?: OcrResult }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('settings_json', JSON.stringify({
      parser: settings.parser || 'docling',
      parse_method: settings.parseMethod || 'auto',
      language: settings.language || 'auto',
      mode: settings.mode || 'balanced',
      preserveLayout: settings.preserveLayout ?? true,
      returnLayout: settings.returnLayout ?? true,
      startPage: settings.startPage,
      endPage: settings.endPage,
      preprocess: {
        autoOrientation: settings.preprocess?.autoOrient ?? true,
        deskew: settings.preprocess?.deskew ?? true,
        denoise: settings.preprocess?.denoise ?? false,
        binarize: settings.preprocess?.binarize ?? false,
        contrastBoost: settings.preprocess?.contrastBoost ?? false,
      },
      extract: {
        tables: settings.extract?.tables ?? true,
        equations: settings.extract?.equations ?? true,
        images: settings.extract?.images ?? false,
      }
    }));

    const url = new URL(`${this.baseUrl}/api/ocr/extract`);
    if (sync) {
      url.searchParams.set('sync', 'true');
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Network error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('Backend OCR response:', data);
    console.log('Sync mode:', sync);
    console.log('Has result:', !!data.result);
    
    if (sync && data.result) {
      console.log('Using backend result');
      const transformed = this.transformBackendResult(data.result);
      console.log('Transformed result:', transformed);
      return { result: transformed };
    } else {
      console.log('Got jobId:', data.jobId);
      return { jobId: data.jobId };
    }
  }

  async getJob(jobId: string): Promise<{ status: string; step: string; percent: number; message: string; result?: OcrResult; error?: string }> {
    const response = await fetch(`${this.baseUrl}/api/jobs/${jobId}`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Network error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    const data = await response.json();
    
    return {
      status: data.status,
      step: data.step,
      percent: data.percent,
      message: data.message,
      result: data.result ? this.transformBackendResult(data.result) : undefined,
      error: data.error
    };
  }

  async convertTextToFile(text: string, options: ConvertOptions): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        format: options.format,
        fileName: options.fileName || 'output',
        includeMetadata: options.includeMetadata ?? true,
        pdfOptions: options.format === 'pdf' ? {
          pageSize: options.pageSize || 'A4',
          fontSize: options.fontSize || 12
        } : undefined
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Network error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.blob();
  }

  async ragIngest(docId?: string, jobId?: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/rag/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ docId, jobId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Network error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }
  }

  async ragQuery(question: string, mode: string = 'hybrid', vlmEnhanced: boolean = true): Promise<{ answer: string; contexts: any[] }> {
    const response = await fetch(`${this.baseUrl}/api/rag/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question, mode, vlmEnhanced }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Network error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async checkHealth(): Promise<{ ok: boolean; version: string; parserDefault: string; enableRag: boolean; ollamaReachable: boolean }> {
    const response = await fetch(`${this.baseUrl}/api/health`);
    
    if (!response.ok) {
      throw new Error(`Health check failed: HTTP ${response.status}`);
    }

    return response.json();
  }

  private transformBackendResult(backendResult: any): OcrResult {
    console.log('Transforming backend result:', backendResult);
    
    // Transform backend result to frontend format
    const pages: OcrPage[] = backendResult.pages?.map((page: any) => ({
      page: page.page,
      text: page.text,
      confidence: page.confidence || 0.9,
      lowConfidenceRanges: [] // TODO: Extract from backend if available
    })) || [];

    const layoutPages: OcrLayoutPage[] = backendResult.layout?.pages?.map((page: any) => ({
      page: page.page,
      width: page.width || 1,
      height: page.height || 1.414,
      blocks: page.blocks?.map((block: any) => ({
        id: `block-${block.type}-${Math.random()}`,
        bbox: block.bbox,
        lines: block.lines?.map((line: any) => ({
          text: line.text,
          confidence: line.confidence || 0.9,
          bbox: line.bbox,
          words: line.words?.map((word: any) => ({
            text: word.text,
            bbox: word.bbox,
            confidence: word.confidence || 0.9
          })) || []
        })) || []
      })) || []
    })) || [];

    // Prefer enhancedText over fullText if available
    const displayText = backendResult.enhancedText || backendResult.fullText || '';
    
    console.log('=== BACKEND RESULT DEBUG ===');
    console.log('Has enhancedText:', !!backendResult.enhancedText);
    console.log('Has fullText:', !!backendResult.fullText);
    console.log('Enhanced text length:', backendResult.enhancedText?.length || 0);
    console.log('Full text length:', backendResult.fullText?.length || 0);
    console.log('Display text length:', displayText.length);
    console.log('Display text preview:', displayText.substring(0, 200));
    console.log('=========================');
    
    const result: OcrResult = {
      fullText: displayText,  // Use enhanced text as primary text
      pages,
      layoutPages,
      language: backendResult.meta?.language || 'auto',
      avgConfidence: backendResult.meta?.avgConfidence || 0.9,
      structured: {
        tables: backendResult.structured?.tables || [],
        keyValues: [], // TODO: Extract from structured data
        entities: [] // TODO: Extract from structured data
      },
      version: 'v1',
      status: 'done' as const
    };
    
    console.log('Transformed result fullText length:', result.fullText.length);
    console.log('Using enhanced text:', !!backendResult.enhancedText);
    return result;
  }
}

// Global API client instance
export const apiClient = new ApiClient();

// Job status types for batch processing
const JOB_STATUSES: BatchJob['status'][] = ['queued', 'preprocessing', 'running', 'postprocessing', 'done'];

// In-memory job store for batch processing UI
let jobs: BatchJob[] = [];

type ProgressCallback = (progress: ProgressState) => void;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function uploadAndExtractText(
  file: File,
  settings: OcrSettings,
  onProgress?: ProgressCallback
): Promise<OcrResult> {
  // Always use backend - no demo fallback
  onProgress?.({ current: 1, total: 3, label: 'Uploading to server...' });
  
  try {
    const result = await apiClient.extractOcr(file, settings, true);
    
    onProgress?.({ current: 2, total: 3, label: 'Processing with Docling...' });
    
    if (result.result) {
      onProgress?.({ current: 3, total: 3, label: 'Complete' });
      return result.result;
    }
    
    // If no result, throw error
    throw new Error('No result returned from backend');
  } catch (error) {
    console.error('OCR processing failed:', error);
    throw error;
  }
}



export async function convertTextToFile(
  text: string,
  options: ConvertOptions,
  onProgress?: ProgressCallback
): Promise<Blob> {
  // Try backend first
  onProgress?.({ current: 1, total: 2, label: 'Converting with backend...' });
  
  try {
    const blob = await apiClient.convertTextToFile(text, options);
    onProgress?.({ current: 2, total: 2, label: 'Complete' });
    return blob;
  } catch (error) {
    console.warn('Backend conversion failed:', error);
    
    // For PDF/DOCX, we need the backend - throw error
    if (options.format === 'pdf' || options.format === 'docx') {
      throw new Error(`Backend required for ${options.format.toUpperCase()} conversion. Please ensure the server is running.`);
    }
    
    // For simple text formats, we can do client-side conversion
    onProgress?.({ current: 2, total: 2, label: 'Using local conversion...' });
    
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
      content = `# Converted Output\n\n${text}`;
    }

    return new Blob([content], { type: mimeTypes[options.format] });
  }
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

// New async job processing functions
export async function startAsyncOcrJob(file: File, settings: OcrSettings): Promise<string> {
  const result = await apiClient.extractOcr(file, settings, false);
  if (!result.jobId) {
    throw new Error('Failed to start OCR job');
  }
  return result.jobId;
}

export async function pollJobStatus(
  jobId: string, 
  onProgress?: (progress: { step: string; percent: number; message: string }) => void
): Promise<OcrResult> {
  const maxAttempts = 120; // 2 minutes with 1s intervals
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const jobStatus = await apiClient.getJob(jobId);
      
      onProgress?.({
        step: jobStatus.step,
        percent: jobStatus.percent,
        message: jobStatus.message
      });

      if (jobStatus.status === 'done' && jobStatus.result) {
        return jobStatus.result;
      }

      if (jobStatus.status === 'error') {
        throw new Error(jobStatus.error || 'Job failed');
      }

      // Wait 1 second before next poll
      await delay(1000);
      attempts++;
    } catch (error) {
      console.error('Error polling job status:', error);
      attempts++;
      await delay(1000);
    }
  }

  throw new Error('Job timeout - processing took too long');
}

// Enhanced batch processing with backend integration
export async function createBatchJobsWithBackend(files: File[], settings: OcrSettings): Promise<BatchJob[]> {
  const newJobs: BatchJob[] = [];

  for (const file of files) {
    try {
      const jobId = await startAsyncOcrJob(file, settings);
      const batchJob: BatchJob = {
        id: jobId,
        fileName: file.name,
        type: 'ocr',
        status: 'queued',
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attempt: 1,
        message: `Parser: ${settings.parser || 'docling'}, Method: ${settings.parseMethod || 'auto'}`,
      };
      newJobs.push(batchJob);
      
      // Start polling for this job
      pollJobStatus(jobId, (progress) => {
        const job = jobs.find(j => j.id === jobId);
        if (job) {
          job.status = progress.step as BatchJob['status'];
          job.progress = progress.percent;
          job.message = progress.message;
          job.updatedAt = new Date().toISOString();
        }
      }).then(() => {
        const job = jobs.find(j => j.id === jobId);
        if (job) {
          job.status = 'done';
          job.progress = 100;
          job.updatedAt = new Date().toISOString();
          job.resultUrl = `#job-${jobId}`;
        }
      }).catch((error) => {
        const job = jobs.find(j => j.id === jobId);
        if (job) {
          job.status = 'done'; // Mark as done even if failed
          job.progress = 100;
          job.message = `Error: ${error.message}`;
          job.updatedAt = new Date().toISOString();
        }
      });
    } catch (error) {
      // Fallback to demo mode for this file
      const id = generateId('job');
      const batchJob: BatchJob = {
        id,
        fileName: file.name,
        type: 'ocr',
        status: 'queued',
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attempt: 1,
        message: `Fallback mode: ${error}`,
      };
      newJobs.push(batchJob);
      simulateJob(id); // Use demo simulation
    }
  }

  jobs = [...newJobs, ...jobs].slice(0, 20);
  return newJobs;
}

