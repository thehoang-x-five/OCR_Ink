import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { OcrLayoutPage } from '@/types';
import { downloadBlob } from '@/utils/file';

type ExportType = 'txt' | 'txt-layout' | 'json-layout';

interface LayoutViewerProps {
  layoutPages?: OcrLayoutPage[];
  fullText: string;
  text: string;
}

const LayoutViewer = ({ layoutPages, fullText, text }: LayoutViewerProps) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [zoom, setZoom] = useState(110);
  const [preserveLayout, setPreserveLayout] = useState(true);
  const [showBoxes, setShowBoxes] = useState(true);
  const [highlightLow, setHighlightLow] = useState(true);
  const [mergePages, setMergePages] = useState(false);

  const textLayout = useMemo<OcrLayoutPage[]>(() => {
    if (!text.trim()) return [];
    const lines = text.split('\n');
    const lineHeight = 0.05;
    const gap = 0.015;
    const pages: OcrLayoutPage[] = [
      {
        page: 1,
        width: 1,
        height: 1.414,
        blocks: [
          {
            id: 'text-block',
            bbox: { x: 0.05, y: 0.05, w: 0.9, h: 0.9 },
            lines: lines.map((ln, idx) => {
              const words = ln.trim().split(/\s+/).filter(Boolean);
              const y = 0.08 + idx * (lineHeight + gap);
              const wordWidth = words.length ? Math.min(0.9 / words.length, 0.2) : 0.1;
              let xCursor = 0.05;
              return {
                text: ln,
                confidence: 0.9,
                bbox: { x: 0.05, y, w: 0.9, h: lineHeight },
                words: words.map((w) => {
                  const bbox = { x: xCursor, y, w: wordWidth, h: lineHeight };
                  xCursor += wordWidth + 0.01;
                  return { text: w, bbox, confidence: 0.9 };
                }),
              };
            }),
          },
        ],
      },
    ];
    return pages;
  }, [text]);

  const effectivePages = textLayout.length ? textLayout : layoutPages || [];
  const hasLayout = effectivePages.length > 0;
  const activePage = effectivePages[pageIndex];
  const pagesToRender = mergePages && effectivePages.length ? effectivePages : activePage ? [activePage] : [];

  const aspectRatio = useMemo(() => {
    if (!pagesToRender.length) return 1.3;
    const p = pagesToRender[0];
    return p.height / p.width;
  }, [pagesToRender]);

  const exportData = (type: ExportType) => {
    if (!effectivePages.length) return;
    if (type === 'json-layout') {
      downloadBlob(new Blob([JSON.stringify(effectivePages, null, 2)], { type: 'application/json' }), 'ocr-layout.json');
      return;
    }
    // txt-layout: concatenate words by lines respecting ordering
    const content = effectivePages
      .map((page) =>
        page.blocks
          .map((block) => block.lines.map((line) => line.words.map((w) => w.text).join(' ')).join('\n'))
          .join('\n\n')
      )
      .join('\n\n---\n\n');
    downloadBlob(new Blob([content], { type: 'text/plain' }), 'ocr-layout.txt');
  };

  const wordClasses = (conf: number) => {
    if (!highlightLow) return '';
    if (conf < 0.8) return 'bg-red-200/70 text-red-800';
    if (conf < 0.9) return 'bg-amber-200/70 text-amber-900';
    return 'bg-emerald-100/50 text-emerald-800';
  };

  const renderPage = (page: OcrLayoutPage) => {
    if (!preserveLayout) {
      const text = page.blocks
        .map((b) => b.lines.map((l) => l.text).join('\n'))
        .filter(Boolean)
        .join('\n\n');
      return (
        <div className="rounded-lg border border-border/60 bg-muted/40 p-3 text-xs text-foreground/80 whitespace-pre-wrap">
          {text || 'No text in this page'}
        </div>
      );
    }

    const canvasStyle = {
      width: `${zoom}%`,
      minWidth: `${zoom}%`,
      paddingTop: `${aspectRatio * 100}%`,
    } as React.CSSProperties;

    return (
      <div className="relative w-full overflow-auto rounded-lg border border-border/70 bg-white shadow-inner max-h-[70vh]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(15,23,42,0.03),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(15,23,42,0.04),transparent_28%)] pointer-events-none" />
        <div className="relative" style={canvasStyle}>
          <div className="absolute inset-0">
            {page.blocks.map((block) =>
              block.lines.map((line, idx) =>
                line.words.map((word, wIdx) => {
                  const left = `${word.bbox.x * 100}%`;
                  const top = `${word.bbox.y * 100}%`;
                  const width = `${word.bbox.w * 100}%`;
                  const height = `${word.bbox.h * 100}%`;
                  return (
                    <div
                      key={`${block.id}-${idx}-${wIdx}`}
                      className={`absolute flex items-center justify-center rounded-sm text-[10px] leading-tight px-1 ${wordClasses(
                        word.confidence
                      )} ${showBoxes ? 'border border-primary/40 shadow-[0_0_0_1px_rgba(59,130,246,0.2)]' : ''}`}
                      style={{ left, top, width, height }}
                      title={`Conf: ${(word.confidence * 100).toFixed(1)}%`}
                    >
                      {word.text}
                    </div>
                  );
                })
              )
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <label className="flex items-center gap-2 rounded-full border border-border/70 bg-muted/60 px-3 py-1">
          Preserve layout
          <input type="checkbox" checked={preserveLayout} onChange={(e) => setPreserveLayout(e.target.checked)} />
        </label>
        <label className="flex items-center gap-2 rounded-full border border-border/70 bg-muted/60 px-3 py-1">
          Show boxes
          <input type="checkbox" checked={showBoxes} onChange={(e) => setShowBoxes(e.target.checked)} />
        </label>
        <label className="flex items-center gap-2 rounded-full border border-border/70 bg-muted/60 px-3 py-1">
          Highlight low-conf
          <input type="checkbox" checked={highlightLow} onChange={(e) => setHighlightLow(e.target.checked)} />
        </label>
        <label className="flex items-center gap-2 rounded-full border border-border/70 bg-muted/60 px-3 py-1">
          Merge pages
          <input type="checkbox" checked={mergePages} onChange={(e) => setMergePages(e.target.checked)} />
        </label>
        <div className="flex items-center gap-2 rounded-full border border-border/70 bg-muted/60 px-3 py-1">
          Zoom
          <input type="range" min={60} max={160} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
          <span className="font-semibold">{zoom}%</span>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border/70 bg-muted/60 px-3 py-1">
          Page
          <select
            className="input-modern text-xs"
            value={pageIndex}
            disabled={!layoutPages?.length || mergePages}
            onChange={(e) => setPageIndex(Number(e.target.value))}
          >
            {(layoutPages || []).map((p, idx) => (
              <option key={p.page} value={idx}>
                Page {p.page}
              </option>
            ))}
          </select>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            className="rounded-lg border border-border px-3 py-1.5 text-xs hover:border-primary hover:text-primary"
            onClick={() => exportData('txt-layout')}
            disabled={!effectivePages.length}
          >
            Export (layout)
          </button>
          <button
            className="rounded-lg border border-border px-3 py-1.5 text-xs hover:border-primary hover:text-primary"
            onClick={() => exportData('json-layout')}
            disabled={!effectivePages.length}
          >
            Export JSON
          </button>
        </div>
      </div>

      {!hasLayout && (
        <div className="rounded-lg border border-dashed border-border/70 bg-muted/40 p-4 text-sm text-muted-foreground">
          No structured layout returned. Showing plain text fallback.
        </div>
      )}

      {hasLayout && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Layout viewer {mergePages ? '(merged)' : `(page ${activePage?.page || 1})`}</span>
            <span>Blocks: {pagesToRender.reduce((sum, p) => sum + p.blocks.length, 0)}</span>
          </div>
          <div className="overflow-hidden rounded-xl border border-border/70 bg-card/80 p-3">
            <div className="flex flex-col gap-4">
              {pagesToRender.map((p) => (
                <div key={p.page} className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Page {p.page}</span>
                    <span>Blocks: {p.blocks.length}</span>
                  </div>
                  {renderPage(p)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayoutViewer;
