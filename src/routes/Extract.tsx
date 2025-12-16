import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Card from '@/components/common/Card';
import Dropzone from '@/components/ocr/Dropzone';
import FilePreview from '@/components/ocr/FilePreview';
import OcrSettingsPanel from '@/components/ocr/OcrSettingsPanel';
import ProgressSteps from '@/components/ocr/ProgressSteps';
import TextResultEditor from '@/components/ocr/TextResultEditor';
import LayoutViewer from '@/components/ocr/LayoutViewer';
import { uploadAndExtractText } from '@/lib/api';
import type { AppOutletContext } from '@/App';
import type { OcrResult, OcrSettings, ProcessStatus, ProgressState } from '@/types';
import { downloadBlob, findMatches } from '@/utils/file';

const defaultSettings: OcrSettings = {
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
    qualityScore: 92,
  },
  layout: {
    preserveLayout: true,
    keepLineBreaks: true,
    detectColumns: true,
    detectHeadersFooters: true,
    detectLists: true,
    detectForms: true,
  },
  region: {
    mode: 'full',
    regions: [],
    activePage: 1,
  },
  post: {
    spellCorrection: true,
    customVocabulary: '',
    regexCleanup: {
      phone: true,
      email: true,
      date: true,
      id: false,
    },
    normalizeWhitespace: true,
    maskSensitive: false,
    highlightLowConfidence: true,
  },
  intelligence: {
    tableExtraction: true,
    keyValueExtraction: true,
    entityExtraction: true,
    template: 'none',
  },
  security: {
    retention: '30d',
    piiDetection: true,
    redaction: false,
  },
  output: {
    exportFormats: ['txt', 'md', 'json', 'pdf'],
    mergePages: true,
    includeConfidence: true,
  },
};

const Extract = () => {
  const { searchQuery, pushToast } = useOutletContext<AppOutletContext>();
  const [files, setFiles] = useState<File[]>([]);
  const [settings, setSettings] = useState<OcrSettings>(defaultSettings);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [status, setStatus] = useState<ProcessStatus>('idle');
  const [result, setResult] = useState<OcrResult | null>(null);
  const [editorText, setEditorText] = useState('');
  const [history, setHistory] = useState<OcrResult[]>([]);

  const uploadedFile = files[0] || null;
  const matches = useMemo(() => findMatches(editorText, searchQuery), [editorText, searchQuery]);

  const runOcr = async () => {
    if (!uploadedFile) {
      pushToast({ type: 'error', message: 'Upload a file first' });
      return;
    }
    setStatus('running');
    setResult(null);
    try {
      const data = await uploadAndExtractText(uploadedFile, settings, setProgress);
      setResult(data);
      setEditorText(data.fullText);
      setStatus('done');
      setHistory((prev) => [data, ...prev].slice(0, 5));
      pushToast({ type: 'success', title: 'OCR done', message: 'Text extracted successfully' });
    } catch (err) {
      console.error(err);
      setStatus('error');
      pushToast({ type: 'error', message: 'OCR failed (mock)' });
    }
  };

  const handleDownload = () => {
    if (!editorText) return;
    const blob = new Blob([editorText], { type: 'text/plain' });
    downloadBlob(blob, `${uploadedFile?.name || 'ocr-result'}.txt`);
    pushToast({ type: 'info', message: 'Downloaded text file' });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editorText);
    pushToast({ type: 'success', message: 'Copied to clipboard' });
  };

  const handleClear = () => {
    setEditorText('');
    setResult(null);
    setStatus('idle');
    setProgress(null);
  };

  return (
    <div className="space-y-6">
         <div className="grid gap-4 xl:grid-cols-[1.2fr_1.8fr] items-start">
        <div className="space-y-4 min-w-0">
          <Card title="Upload" description="Drag & drop or browse files">
            <Dropzone files={files} onFiles={setFiles} onError={(m) => pushToast({ type: 'error', message: m })} />
          </Card>
          <Card title="Preview">
            <FilePreview file={uploadedFile} result={result} />
          </Card>
          <Card title="Preprocess & Output">
            <OcrSettingsPanel settings={settings} onChange={setSettings} disabled={status === 'running'} />
          </Card>
        </div>

        <div className="space-y-4 min-w-0">
          <Card title="Progress" description="Upload → preprocess → recognize → post-process">
            <ProgressSteps progress={progress} status={status} />
            <div className="mt-3 rounded-lg border border-border/70 bg-muted/40 p-3 text-xs text-muted-foreground">
              Queue: upload → preprocess → recognize → postprocess → done. Retry or cancel supported (mock).
            </div>
          </Card>
          <Card title="Layout & Result" description="Edit text and view layout in sync">
            <div className="space-y-4">
              <LayoutViewer layoutPages={result?.layoutPages} fullText={editorText || result?.fullText || ''} text={editorText} />
              <TextResultEditor
                value={editorText}
                onChange={setEditorText}
                onCopy={handleCopy}
                onClear={handleClear}
                onDownload={handleDownload}
                searchQuery={searchQuery}
                matches={matches}
                lowConfidenceRanges={result?.pages?.[0]?.lowConfidenceRanges}
                result={result}
                status={status}
              />
            </div>
          </Card>
          <button
            onClick={runOcr}
            disabled={!uploadedFile || status === 'running'}
            className="btn-gradient flex items-center justify-center gap-2 w-full"
          >
            {status === 'running' ? 'Processing...' : 'Run OCR'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Extract;
