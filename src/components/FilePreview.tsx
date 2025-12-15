import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createObjectUrl, revokeObjectUrl, isImageFile, isPdfFile } from '@/utils/file';

interface FilePreviewProps {
  file: File | null;
}

const FilePreview = ({ file }: FilePreviewProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file && isImageFile(file)) {
      const url = createObjectUrl(file);
      setPreviewUrl(url);
      return () => revokeObjectUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-muted/30 rounded-xl border-2 border-dashed border-border">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
              <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">Upload a file to preview</p>
        </div>
      </div>
    );
  }

  if (isPdfFile(file)) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-destructive/5 to-destructive/10 rounded-xl border border-destructive/20"
      >
        <div className="w-20 h-24 rounded-lg bg-card border border-border shadow-lg flex flex-col items-center justify-center mb-4 relative">
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs font-bold">
            PDF
          </div>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-destructive">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" />
            <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <p className="text-sm font-medium text-foreground mb-1">{file.name}</p>
        <p className="text-xs text-muted-foreground">PDF Document • Multi-page support</p>
      </motion.div>
    );
  }

  if (previewUrl) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-full flex items-center justify-center p-4 bg-muted/30 rounded-xl border border-border overflow-hidden"
      >
        <img
          src={previewUrl}
          alt="Preview"
          className="max-w-full max-h-[300px] object-contain rounded-lg shadow-lg"
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/20"
    >
      <div className="w-16 h-20 rounded-lg bg-card border border-border shadow-lg flex items-center justify-center mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-primary">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" />
          <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" />
          <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" />
          <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
      <p className="text-sm font-medium text-foreground mb-1">{file.name}</p>
      <p className="text-xs text-muted-foreground">Document ready for processing</p>
    </motion.div>
  );
};

export default FilePreview;
