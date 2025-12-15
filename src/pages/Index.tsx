import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type {
  TabType,
  OcrSettings as OcrSettingsType,
  OcrResult,
  ConvertOptions,
  ProgressState,
  ProcessStatus,
  ToastMessage,
} from '@/types';
import { uploadAndExtractText, convertTextToFile } from '@/lib/api';
import { downloadBlob, generateId } from '@/utils/file';

import Header from '@/components/Header';
import Tabs from '@/components/Tabs';
import Dropzone from '@/components/Dropzone';
import FilePreview from '@/components/FilePreview';
import OcrSettingsPanel from '@/components/OcrSettings';
import ProgressSteps from '@/components/ProgressSteps';
import TextResultEditor from '@/components/TextResultEditor';
import ConvertForm from '@/components/ConvertForm';
import Toast from '@/components/Toast';

const defaultOcrSettings: OcrSettingsType = {
  language: 'auto',
  mode: 'balanced',
  preprocess: {
    deskew: true,
    denoise: true,
    binarize: false,
    contrastBoost: false,
  },
  region: { type: 'full' },
  output: {
    keepLineBreaks: true,
    preserveLayout: false,
    detectTables: true,
  },
};

const defaultConvertOptions: ConvertOptions = {
  format: 'txt',
  fileName: 'output',
  encoding: 'utf-8',
  includeMetadata: false,
  pageSize: 'a4',
  fontSize: 12,
};

const defaultProgress: ProgressState = { step: 0, text: '', total: 5 };

const Index = () => {
  // Tab state
  const [selectedTab, setSelectedTab] = useState<TabType>('extract');

  // Extract tab state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [ocrSettings, setOcrSettings] = useState<OcrSettingsType>(defaultOcrSettings);
  const [ocrStatus, setOcrStatus] = useState<ProcessStatus>('idle');
  const [ocrProgress, setOcrProgress] = useState<ProgressState>(defaultProgress);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);

  // Convert tab state
  const [convertInputText, setConvertInputText] = useState('');
  const [convertOptions, setConvertOptions] = useState<ConvertOptions>(defaultConvertOptions);
  const [convertStatus, setConvertStatus] = useState<ProcessStatus>('idle');
  const [convertProgress, setConvertProgress] = useState<ProgressState>({ step: 0, text: '', total: 3 });

  // Toast state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // OCR handlers
  const handleRunOcr = async () => {
    if (!uploadedFile) return;

    setOcrStatus('running');
    setOcrResult(null);

    try {
      const result = await uploadAndExtractText(uploadedFile, ocrSettings, setOcrProgress);
      setOcrResult(result);
      setOcrStatus('done');
      addToast('success', 'Text extracted successfully!');
    } catch (error) {
      setOcrStatus('error');
      setOcrProgress({ step: ocrProgress.step, text: 'Processing failed', total: 5 });
      addToast('error', 'Failed to extract text. Please try again.');
    }
  };

  const handleCopyResult = () => {
    if (ocrResult) {
      navigator.clipboard.writeText(ocrResult.fullText);
      addToast('success', 'Text copied to clipboard!');
    }
  };

  const handleClearResult = () => {
    setOcrResult(null);
    setOcrStatus('idle');
    setOcrProgress(defaultProgress);
  };

  const handleDownloadResult = () => {
    if (ocrResult) {
      const blob = new Blob([ocrResult.fullText], { type: 'text/plain' });
      downloadBlob(blob, 'extracted-text.txt');
      addToast('success', 'File downloaded!');
    }
  };

  // Convert handlers
  const handleConvert = async () => {
    if (!convertInputText.trim()) return;

    setConvertStatus('running');

    try {
      const blob = await convertTextToFile(convertInputText, convertOptions, setConvertProgress);
      const fileName = `${convertOptions.fileName || 'output'}.${convertOptions.format}`;
      downloadBlob(blob, fileName);
      setConvertStatus('done');
      addToast('success', `File "${fileName}" downloaded!`);
    } catch (error) {
      setConvertStatus('error');
      addToast('error', 'Conversion failed. Please try again.');
    }
  };

  const handleFileError = (message: string) => {
    addToast('error', message);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <Tabs activeTab={selectedTab} onTabChange={setSelectedTab} />
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {selectedTab === 'extract' ? (
            <motion.div
              key="extract"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="grid lg:grid-cols-2 gap-6"
            >
              {/* Left Column - Input & Settings */}
              <div className="space-y-6">
                {/* Upload Card */}
                <div className="card-elevated p-5">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-primary">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Upload Document
                  </h2>
                  <Dropzone
                    file={uploadedFile}
                    onFileSelect={setUploadedFile}
                    onError={handleFileError}
                    disabled={ocrStatus === 'running'}
                  />
                </div>

                {/* Preview Card */}
                <div className="card-elevated p-5">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-accent">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    Preview
                  </h2>
                  <div className="min-h-[200px]">
                    <FilePreview file={uploadedFile} />
                  </div>
                </div>

                {/* OCR Settings Card */}
                <div className="card-elevated p-5">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-primary">
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    OCR Settings
                  </h2>
                  <OcrSettingsPanel
                    settings={ocrSettings}
                    onSettingsChange={setOcrSettings}
                    disabled={ocrStatus === 'running'}
                  />
                </div>

                {/* Run OCR Button */}
                <button
                  onClick={handleRunOcr}
                  disabled={!uploadedFile || ocrStatus === 'running'}
                  className="w-full btn-gradient py-3.5 text-base flex items-center justify-center gap-2"
                >
                  {ocrStatus === 'running' ? (
                    <>
                      <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                        <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      Run OCR
                    </>
                  )}
                </button>
              </div>

              {/* Right Column - Progress & Result */}
              <div className="space-y-6">
                {/* Progress Card */}
                <AnimatePresence>
                  {ocrStatus === 'running' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="card-elevated p-5"
                    >
                      <h2 className="text-lg font-semibold text-foreground mb-4">Processing</h2>
                      <ProgressSteps progress={ocrProgress} status={ocrStatus} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Result Card */}
                <div className="card-elevated p-5 min-h-[400px]">
                  <TextResultEditor
                    result={ocrResult}
                    onCopy={handleCopyResult}
                    onClear={handleClearResult}
                    onDownload={handleDownloadResult}
                    isLoading={ocrStatus === 'running'}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="convert"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="max-w-2xl mx-auto"
            >
              <div className="card-elevated p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-primary">
                    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <polyline points="16 6 12 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Convert Text to File
                </h2>
                <ConvertForm
                  inputText={convertInputText}
                  onInputTextChange={setConvertInputText}
                  options={convertOptions}
                  onOptionsChange={setConvertOptions}
                  onConvert={handleConvert}
                  status={convertStatus}
                  progress={convertProgress}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-muted-foreground">
            DocText OCR & Converter • Fast, accurate text extraction and conversion
          </p>
        </div>
      </footer>

      {/* Toast Notifications */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default Index;
