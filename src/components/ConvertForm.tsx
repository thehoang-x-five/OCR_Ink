import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ConvertOptions, OutputFormat, Encoding, PageSize, ProgressState } from '@/types';
import { readTextFile } from '@/lib/api';
import { formatBytes } from '@/utils/file';

interface ConvertFormProps {
  inputText: string;
  onInputTextChange: (text: string) => void;
  options: ConvertOptions;
  onOptionsChange: (options: ConvertOptions) => void;
  onConvert: () => void;
  status: 'idle' | 'running' | 'done' | 'error';
  progress: ProgressState;
}

const formats: { value: OutputFormat; label: string; icon: JSX.Element }[] = [
  { value: 'txt', label: 'TXT', icon: <span className="text-xs">TXT</span> },
  { value: 'pdf', label: 'PDF', icon: <span className="text-xs text-destructive">PDF</span> },
  { value: 'docx', label: 'DOCX', icon: <span className="text-xs text-primary">DOC</span> },
  { value: 'md', label: 'Markdown', icon: <span className="text-xs">MD</span> },
  { value: 'json', label: 'JSON', icon: <span className="text-xs text-warning">{'{}'}</span> },
];

const encodings: { value: Encoding; label: string }[] = [
  { value: 'utf-8', label: 'UTF-8' },
  { value: 'utf-16', label: 'UTF-16' },
  { value: 'ascii', label: 'ASCII' },
];

const pageSizes: { value: PageSize; label: string }[] = [
  { value: 'a4', label: 'A4' },
  { value: 'letter', label: 'Letter' },
  { value: 'legal', label: 'Legal' },
];

const ConvertForm = ({
  inputText,
  onInputTextChange,
  options,
  onOptionsChange,
  onConvert,
  status,
  progress,
}: ConvertFormProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = useCallback(async (file: File) => {
    if (file.type === 'text/plain' || file.type === 'text/markdown' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const text = await readTextFile(file);
      onInputTextChange(text);
    }
  }, [onInputTextChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const updateOption = <K extends keyof ConvertOptions>(key: K, value: ConvertOptions[K]) => {
    onOptionsChange({ ...options, [key]: value });
  };

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCount = inputText.length;
  const isDisabled = status === 'running' || !inputText.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Text Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-foreground">Input Text</label>
          <span className="text-xs text-muted-foreground">
            {wordCount} words • {charCount} chars
          </span>
        </div>
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative rounded-xl border-2 transition-colors ${
            isDragging ? 'border-primary bg-primary-light/30' : 'border-border'
          }`}
        >
          <textarea
            value={inputText}
            onChange={(e) => onInputTextChange(e.target.value)}
            placeholder="Paste or type your text here, or drag & drop a .txt/.md file..."
            disabled={status === 'running'}
            className="w-full h-48 p-4 bg-transparent rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm font-mono disabled:opacity-50"
          />
          <AnimatePresence>
            {isDragging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-primary-light/50 rounded-xl"
              >
                <p className="text-sm font-medium text-primary">Drop file here</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Output Format */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Output Format</label>
        <div className="grid grid-cols-5 gap-2">
          {formats.map((format) => (
            <button
              key={format.value}
              onClick={() => updateOption('format', format.value)}
              disabled={status === 'running'}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
                options.format === format.value
                  ? 'bg-primary-light border-primary/30 ring-2 ring-primary/20'
                  : 'bg-card border-border hover:bg-muted'
              } disabled:opacity-50`}
            >
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold">
                {format.icon}
              </div>
              <span className="text-xs font-medium text-foreground">{format.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* File Name */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">File Name</label>
        <input
          type="text"
          value={options.fileName}
          onChange={(e) => updateOption('fileName', e.target.value)}
          placeholder="output"
          disabled={status === 'running'}
          className="input-modern"
        />
      </div>

      {/* Two Column Options */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Encoding</label>
          <select
            value={options.encoding}
            onChange={(e) => updateOption('encoding', e.target.value as Encoding)}
            disabled={status === 'running'}
            className="input-modern"
          >
            {encodings.map((enc) => (
              <option key={enc.value} value={enc.value}>{enc.label}</option>
            ))}
          </select>
        </div>

        {options.format === 'pdf' && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Page Size</label>
            <select
              value={options.pageSize}
              onChange={(e) => updateOption('pageSize', e.target.value as PageSize)}
              disabled={status === 'running'}
              className="input-modern"
            >
              {pageSizes.map((size) => (
                <option key={size.value} value={size.value}>{size.label}</option>
              ))}
            </select>
          </div>
        )}

        {options.format === 'pdf' && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Font Size</label>
            <input
              type="number"
              value={options.fontSize}
              onChange={(e) => updateOption('fontSize', parseInt(e.target.value) || 12)}
              min={8}
              max={24}
              disabled={status === 'running'}
              className="input-modern"
            />
          </div>
        )}

        <div className="col-span-2">
          <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
            options.includeMetadata
              ? 'bg-primary-light border-primary/30'
              : 'bg-card border-border hover:bg-muted'
          } ${status === 'running' ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <input
              type="checkbox"
              checked={options.includeMetadata}
              onChange={(e) => updateOption('includeMetadata', e.target.checked)}
              disabled={status === 'running'}
              className="sr-only"
            />
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              options.includeMetadata ? 'bg-primary border-primary' : 'border-border'
            }`}>
              {options.includeMetadata && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
                  <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-sm text-foreground">Include metadata</span>
          </label>
        </div>
      </div>

      {/* Progress */}
      <AnimatePresence>
        {status === 'running' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${(progress.step / progress.total) * 100}%` }}
              />
            </div>
            <p className="text-sm text-center text-muted-foreground">{progress.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Convert Button */}
      <button
        onClick={onConvert}
        disabled={isDisabled}
        className="w-full btn-gradient py-3 flex items-center justify-center gap-2"
      >
        {status === 'running' ? (
          <>
            <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
              <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Converting...
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Convert & Download
          </>
        )}
      </button>
    </motion.div>
  );
};

export default ConvertForm;
