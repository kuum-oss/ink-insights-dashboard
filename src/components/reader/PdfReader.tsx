'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import 'pdfjs-dist/web/pdf_viewer.css';

// worker
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.entry';
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfjsWorker as any;

interface Match {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  str: string;
}

interface Props { url: string; initialPage?: number }

export default function PdfReader({ url, initialPage = 1 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(initialPage);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [matches, setMatches] = useState<Match[]>([]);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number | null>(null);

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

  // search across pages and build approximate highlight rects
  async function runSearch(q: string) {
    if (!pdfDoc || !q.trim()) { setMatches([]); setCurrentMatchIndex(null); return; }
    setSearching(true);
    const lower = q.trim().toLowerCase();
    const found: Match[] = [];
    for (let p = 1; p <= pdfDoc.numPages; p++) {
      try {
        const page = await pdfDoc.getPage(p);
        const viewport = page.getViewport({ scale: 1 });
        const txt = await page.getTextContent({ disableCombineTextItems: false });
        for (const item of txt.items) {
          const str: string = item.str || '';
          const lstr = str.toLowerCase();
          if (lstr.includes(lower)) {
            // compute approximate position using transform
            const tx = item.transform;
            // tx: [a, b, c, d, e, f]
            const x = tx[4];
            const y = tx[5];
            // approximate width and height
            const width = (item.width || (str.length * 5)) * 1; // in text space
            const height = Math.abs(tx[3] || 10);
            // convert to viewport coordinates (scale later)
            const [vx, vy] = viewport.convertToViewportPoint(x, y);
            // viewport origin bottom-left — convert to top-left y
            const rect = {
              page: p,
              x: vx,
              y: viewport.height - vy,
              width: width * viewport.scale,
              height: height * viewport.scale,
              str,
            };
            found.push(rect);
          }
        }
      } catch (e) {
        // ignore page errors
      }
    }
    setMatches(found);
    setSearching(false);
    if (found.length > 0) {
      setCurrentMatchIndex(0);
      setPageNum(found[0].page);
      // scroll container to approximate position after render
      setTimeout(() => scrollToMatch(found[0]), 300);
    } else {
      setCurrentMatchIndex(null);
    }
  }

  function scrollToMatch(m: Match) {
    const c = containerRef.current;
    const canvas = canvasRef.current;
    if (!c || !canvas) return;
    // canvas is at (0,0) inside container; scroll so that box is visible
    const rectTop = m.y;
    const target = Math.max(0, rectTop - 100);
    c.scrollTo({ top: target, behavior: 'smooth' });
  }

  // helpers to navigate matches
  function gotoNextMatch() {
    if (!matches.length) return;
    const idx = currentMatchIndex === null ? 0 : (currentMatchIndex + 1) % matches.length;
    setCurrentMatchIndex(idx);
    const m = matches[idx];
    setPageNum(m.page);
    setTimeout(() => scrollToMatch(m), 300);
  }
  function gotoPrevMatch() {
    if (!matches.length) return;
    const idx = currentMatchIndex === null ? 0 : (currentMatchIndex - 1 + matches.length) % matches.length;
    setCurrentMatchIndex(idx);
    const m = matches[idx];
    setPageNum(m.page);
    setTimeout(() => scrollToMatch(m), 300);
  }

  if (!url) return <div>Нет PDF</div>;

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <button onClick={() => setPageNum(p => Math.max(1, p-1))} className="px-2 py-1 rounded-md border">◀</button>
        <button onClick={() => setPageNum(p => Math.min(numPages, p+1))} className="px-2 py-1 rounded-md border">▶</button>
        <div className="text-sm">{pageNum} / {numPages}</div>

        <div className="ml-2 flex items-center gap-2">
          <input className="px-2 py-1 rounded-md border" placeholder="Поиск в PDF" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{ if (e.key === 'Enter') runSearch(query); }} />
          <button onClick={()=>runSearch(query)} className="px-2 py-1 rounded-md border">Найти</button>
          <button onClick={()=>{ setQuery(''); setMatches([]); setCurrentMatchIndex(null); }} className="px-2 py-1 rounded-md border">Сброс</button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="px-2 py-1 border rounded">-</button>
          <div className="text-sm">{(scale*100).toFixed(0)}%</div>
          <button onClick={() => setScale(s => Math.min(3, s + 0.1))} className="px-2 py-1 border rounded">+</button>
        </div>
      </div>

      <div ref={containerRef} className="border rounded-lg overflow-auto relative" style={{ height: '70vh' }}>
        <canvas ref={canvasRef} />
        {/* highlights overlay */}
        {matches.filter(m=>m.page === pageNum).map((m, idx) => (
          <div key={idx} style={{ position: 'absolute', left: m.x, top: m.y, width: m.width, height: m.height, background: (currentMatchIndex !== null && matches[currentMatchIndex] === m) ? 'rgba(250,215,50,0.4)' : 'rgba(255,255,0,0.25)', pointerEvents: 'none', mixBlendMode: 'multiply', borderRadius: 2 }} />
        ))}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <div className="text-sm opacity-70">{searching ? 'Идет поиск...' : matches.length ? `${matches.length} найдено` : 'Не найдено'}</div>
        <div className="ml-auto flex gap-2">
          <button onClick={gotoPrevMatch} className="px-2 py-1 border rounded">◀</button>
          <button onClick={gotoNextMatch} className="px-2 py-1 border rounded">▶</button>
        </div>
      </div>
    </div>
  );
}
