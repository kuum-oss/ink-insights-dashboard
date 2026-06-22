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
  const textLayerRef = useRef<HTMLDivElement | null>(null);
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

  // render page + text layer
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

        // build text layer
        const textContent = await page.getTextContent({ disableCombineTextItems: false });
        const textLayer = textLayerRef.current;
        if (textLayer) {
          textLayer.innerHTML = '';
          textLayer.style.width = `${viewport.width}px`;
          textLayer.style.height = `${viewport.height}px`;
          // create spans
          const canvasCtx = (canvas.getContext('2d') as CanvasRenderingContext2D);
          const fontScale = viewport.scale;
          for (let i = 0; i < textContent.items.length; i++) {
            const item: any = textContent.items[i];
            const tx = item.transform; // [a,b,c,d,e,f]
            const x = tx[4];
            const y = tx[5];
            const viewportPoint = viewport.convertToViewportPoint(x, y);
            const left = viewportPoint[0];
            const top = viewport.height - viewportPoint[1];
            // measure width using canvas measureText (approx)
            const fontSize = Math.abs(tx[0]) * fontScale || 10;
            canvasCtx.font = `${fontSize}px sans-serif`;
            const measured = canvasCtx.measureText(item.str || '').width * fontScale;
            const span = document.createElement('span');
            span.textContent = item.str || '';
            span.style.position = 'absolute';
            span.style.left = `${left}px`;
            span.style.top = `${top - fontSize}px`;
            span.style.whiteSpace = 'pre';
            span.style.fontSize = `${fontSize}px`;
            span.style.lineHeight = '1';
            span.style.pointerEvents = 'auto';
            span.style.userSelect = 'text';
            span.style.color = 'transparent';
            span.style.textShadow = '0 0 0 black'; // keep text visible but selectable
            span.dataset['textItemIndex'] = String(i);
            span.dataset['page'] = String(num);
            span.style.width = `${measured}px`;
            textLayer.appendChild(span);
          }

          // after text layer built, if there's an active query and current page matches, compute highlights from spans
          if (query.trim()) {
            const spans = Array.from(textLayer.querySelectorAll('span')) as HTMLSpanElement[];
            const foundRects: Match[] = [];
            spans.forEach(sp => {
              if (sp.textContent && sp.textContent.toLowerCase().includes(query.toLowerCase())) {
                const r = sp.getBoundingClientRect();
                // containerRef is scrollable; get position relative to container's content box
                const containerRect = containerRef.current?.getBoundingClientRect();
                const canvasRect = canvasRef.current?.getBoundingClientRect();
                if (!containerRect || !canvasRect) return;
                const left = sp.offsetLeft;
                const top = sp.offsetTop;
                foundRects.push({ page: num, x: left, y: top, width: sp.offsetWidth, height: sp.offsetHeight, str: sp.textContent || '' });
              }
            });
            setMatches(foundRects);
            if (foundRects.length > 0) {
              setCurrentMatchIndex(0);
            } else {
              setCurrentMatchIndex(null);
            }
          } else {
            setMatches([]);
            setCurrentMatchIndex(null);
          }
        }
      } catch (e) {
        console.error('Render error', e);
      }
    };
    renderPage(pageNum);
    return () => { cancelled = true; };
  }, [pdfDoc, pageNum, scale, query]);

  // simplified search that navigates to pages with matches (keeps previous scanning fallback)
  async function runSearch(q: string) {
    if (!pdfDoc || !q.trim()) { setMatches([]); setCurrentMatchIndex(null); return; }
    setSearching(true);
    const lower = q.trim().toLowerCase();
    const pagesWithMatches: number[] = [];
    for (let p = 1; p <= pdfDoc.numPages; p++) {
      try {
        const page = await pdfDoc.getPage(p);
        const txt = await page.getTextContent({ disableCombineTextItems: false });
        const joined = txt.items.map((it: any) => it.str || '').join(' ');
        if (joined.toLowerCase().includes(lower)) pagesWithMatches.push(p);
      } catch (e) {}
    }
    setSearching(false);
    if (pagesWithMatches.length > 0) {
      setPageNum(pagesWithMatches[0]);
      // textLayer will compute precise spans/highlights for that page
    } else {
      setMatches([]);
      setCurrentMatchIndex(null);
    }
  }

  function scrollToMatch(m: Match) {
    const c = containerRef.current;
    if (!c) return;
    const target = Math.max(0, m.y - 100);
    c.scrollTo({ top: target, behavior: 'smooth' });
  }

  function gotoNextMatch() {
    if (!matches.length) return;
    const idx = currentMatchIndex === null ? 0 : (currentMatchIndex + 1) % matches.length;
    setCurrentMatchIndex(idx);
    const m = matches[idx];
    setPageNum(m.page);
    setTimeout(() => scrollToMatch(m), 200);
  }
  function gotoPrevMatch() {
    if (!matches.length) return;
    const idx = currentMatchIndex === null ? 0 : (currentMatchIndex - 1 + matches.length) % matches.length;
    setCurrentMatchIndex(idx);
    const m = matches[idx];
    setPageNum(m.page);
    setTimeout(() => scrollToMatch(m), 200);
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
        <div ref={textLayerRef} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }} />
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
