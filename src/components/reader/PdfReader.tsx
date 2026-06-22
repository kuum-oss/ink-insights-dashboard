'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import 'pdfjs-dist/web/pdf_viewer.css';

// worker
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.entry';
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfjsWorker as any;

interface Props { url: string; initialPage?: number }

export default function PdfReader({ url, initialPage = 1 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(initialPage);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const loadingTask = (pdfjsLib as any).getDocument(url);
        const doc = await loadingTask.promise;
        if (!mounted) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setPageNum(Math.min(initialPage, doc.numPages));
      } catch (e) {
        console.error('Failed to load PDF', e);
      }
    })();
    return () => { mounted = false; };
  }, [url]);

  useEffect(() => {
    let cancelled = false;
    const renderPage = async (num: number) => {
      if (!pdfDoc) return;
      try {
        const page = await pdfDoc.getPage(num);
        if (cancelled) return;
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const renderContext = { canvasContext: context as any, viewport };
        await page.render(renderContext).promise;
      } catch (e) {
        console.error('Render error', e);
      }
    };
    renderPage(pageNum);
    return () => { cancelled = true; };
  }, [pdfDoc, pageNum, scale]);

  if (!url) return <div>Нет PDF</div>;

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <button onClick={() => setPageNum(p => Math.max(1, p-1))} className="px-2 py-1 rounded-md border">◀</button>
        <button onClick={() => setPageNum(p => Math.min(numPages, p+1))} className="px-2 py-1 rounded-md border">▶</button>
        <div className="text-sm">{pageNum} / {numPages}</div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="px-2 py-1 border rounded">-</button>
          <div className="text-sm">{(scale*100).toFixed(0)}%</div>
          <button onClick={() => setScale(s => Math.min(3, s + 0.1))} className="px-2 py-1 border rounded">+</button>
        </div>
      </div>
      <div className="border rounded-lg overflow-auto">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
