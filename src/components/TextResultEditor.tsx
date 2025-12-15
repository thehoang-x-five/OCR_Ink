import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { OcrResult } from '@/types';

interface TextResultEditorProps {
  result: OcrResult | null;
  onCopy: () => void;
  onClear: () => void;
  onDownload: () => void;
  isLoading?: boolean;
}

const TextResultEditor = ({ result, onCopy, onClear, onDownload, isLoading }: TextResultEditorProps) => {
  const [selectedPage, setSelectedPage] = useState<number | 'all'>('all');
  const [showLowConfidence, setShowLowConfidence] = useState(false);

  const displayText = result
    ? selectedPage === 'all'
      ? result.fullText
      : result.pages?.find((p) => p.page === selectedPage)?.text || ''
    : '';

  const lines = displayText.split('\n');

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-border">
          <div className="skeleton h-5 w-24 rounded" />
          <div className="flex gap-2">
            <div className="skeleton h-8 w-8 rounded" />
            <div className="skeleton h-8 w-8 rounded" />
            <div className="skeleton h-8 w-8 rounded" />
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton h-4 rounded" style={{ width: `${Math.random() * 40 + 60}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-muted/30 rounded-xl border-2 border-dashed border-border">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" />
              <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" />
              <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" />
              <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">Extracted text will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col"
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-foreground">Result</h3>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-success-light rounded-full">
            <span className="text-xs font-medium text-success">
              {(result.avgConfidence * 100).toFixed(1)}% confidence
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {result.language.toUpperCase()} • {result.processingTime}ms
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowLowConfidence(!showLowConfidence)}
            className={`p-2 rounded-lg transition-colors ${
              showLowConfidence ? 'bg-warning-light text-warning' : 'hover:bg-muted text-muted-foreground'
            }`}
            title="Highlight low confidence"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </button>
          <button
            onClick={onCopy}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            title="Copy text"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          </button>
          <button
            onClick={onDownload}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            title="Download"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
          <button
            onClick={onClear}
            className="p-2 rounded-lg hover:bg-destructive-light text-muted-foreground hover:text-destructive transition-colors"
            title="Clear"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Page Tabs (if multi-page) */}
      <AnimatePresence>
        {result.pages && result.pages.length > 1 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-1 mb-3 overflow-x-auto pb-2"
          >
            <button
              onClick={() => setSelectedPage('all')}
              className={`toggle-chip whitespace-nowrap ${selectedPage === 'all' ? 'active' : ''}`}
            >
              All Pages
            </button>
            {result.pages.map((page) => (
              <button
                key={page.page}
                onClick={() => setSelectedPage(page.page)}
                className={`toggle-chip whitespace-nowrap ${selectedPage === page.page ? 'active' : ''}`}
              >
                Page {page.page}
                <span className="ml-1 text-xs opacity-70">{(page.confidence * 100).toFixed(0)}%</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text Area */}
      <div className="flex-1 overflow-auto bg-card rounded-xl border border-border p-4 custom-scrollbar">
        <div className="text-editor">
          {lines.map((line, index) => (
            <div key={index} className="flex">
              <span className="w-8 text-right pr-4 text-muted-foreground/50 select-none text-xs leading-6">
                {index + 1}
              </span>
              <span className="flex-1 leading-6 break-all">{line || '\u00A0'}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TextResultEditor;
