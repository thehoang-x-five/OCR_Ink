import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Card from '@/components/common/Card';
import Dropzone from '@/components/ocr/Dropzone';
import JobsTable from '@/components/batch/JobsTable';
import { createBatchJobs, getJobs } from '@/lib/api';
import type { AppOutletContext } from '@/App';
import type { BatchJob, OcrSettings } from '@/types';

const batchDefaults: OcrSettings = {
  language: 'auto',
  mode: 'balanced',
  preprocess: {
    autoOrient: true,
    rotate: 0,
    deskew: true,
    denoise: true,
    deblur: false,
    binarize: false,
    contrastBoost: true,
    brightness: 0,
    shadowRemoval: false,
    removeLines: false,
    dpiNormalize: true,
    qualityScore: 90,
  },
  layout: {
    preserveLayout: true,
    keepLineBreaks: true,
    detectColumns: true,
    detectHeadersFooters: false,
    detectLists: true,
    detectForms: false,
  },
  region: { mode: 'full', regions: [], activePage: 1 },
  post: {
    spellCorrection: true,
    customVocabulary: '',
    regexCleanup: { phone: true, email: true, date: true, id: false },
    normalizeWhitespace: true,
    maskSensitive: false,
    highlightLowConfidence: true,
  },
  intelligence: { tableExtraction: true, keyValueExtraction: true, entityExtraction: true, template: 'invoice' },
  security: { retention: '30d', piiDetection: false, redaction: false },
  output: { exportFormats: ['txt', 'md', 'json'], mergePages: true, includeConfidence: true },
};

const BatchJobs = () => {
  const { pushToast } = useOutletContext<AppOutletContext>();
  const [files, setFiles] = useState<File[]>([]);
  const [jobs, setJobs] = useState<BatchJob[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const totalSizeMb = files.reduce((sum, f) => sum + f.size, 0) / 1_000_000;
  const typeCounts = files.reduce<Record<string, number>>((acc, file) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'unknown';
    acc[ext] = (acc[ext] || 0) + 1;
    return acc;
  }, {});
  const topTypes = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([ext, count]) => `${ext.toUpperCase()} ×${count}`)
    .join(', ');

  useEffect(() => {
    getJobs().then(setJobs);
  }, []);

  const createJobs = async () => {
    if (!files.length) {
      pushToast({ type: 'error', message: 'Select files first' });
      return;
    }
    setIsCreating(true);
    const created = await createBatchJobs(files, batchDefaults);
    setJobs((prev) => [...created, ...prev]);
    setFiles([]);
    setIsCreating(false);
    pushToast({ type: 'success', message: `${created.length} jobs queued` });
  };

  const handleRetry = (job: BatchJob) => {
    pushToast({ type: 'info', message: `Retrying ${job.fileName}` });
  };

  const handleDownload = (job: BatchJob) => {
    pushToast({ type: 'success', message: `Downloading ${job.fileName}` });
  };

  const handleCancel = (job: BatchJob) => {
    pushToast({ type: 'error', message: `Canceled ${job.fileName}` });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-2xl border border-border/70 bg-card/90 px-4 py-2 text-sm shadow-sm">
          <span className="text-muted-foreground">Files:</span>{' '}
          <span className="font-semibold text-foreground">{files.length || 0}</span>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card/90 px-4 py-2 text-sm shadow-sm">
          <span className="text-muted-foreground">Total size:</span>{' '}
          <span className="font-semibold text-foreground">
            {totalSizeMb ? `${totalSizeMb.toFixed(2)} MB` : '0 MB'}
          </span>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card/90 px-4 py-2 text-sm shadow-sm">
          <span className="text-muted-foreground">Types:</span>{' '}
          <span className="font-semibold text-foreground">
            {topTypes || '—'}
          </span>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card/90 px-4 py-2 text-sm shadow-sm">
          <span className="text-muted-foreground">Queued jobs:</span>{' '}
          <span className="font-semibold text-foreground">{jobs.length}</span>
        </div>
        <button className="btn-gradient ml-auto" onClick={createJobs} disabled={!files.length || isCreating}>
          {isCreating ? 'Queuing...' : 'Create jobs'}
        </button>
      </div>

      <Card title="Batch upload" description="Upload many files at once">
        <Dropzone files={files} onFiles={setFiles} multiple onError={(m) => pushToast({ type: 'error', message: m })} />
      </Card>

      <Card title="Job queue" description="History by day with actions">
        <JobsTable jobs={jobs} onRetry={handleRetry} onDownload={handleDownload} onCancel={handleCancel} />
      </Card>
    </div>
  );
};

export default BatchJobs;
