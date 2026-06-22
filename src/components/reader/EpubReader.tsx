'use client';

import React, { useEffect, useRef, useState } from 'react';
import ePub from 'epubjs';

interface Props { url: string }

export default function EpubReader({ url }: Props) {
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const bookRef = useRef<any>(null);
  const renditionRef = useRef<any>(null);
  const [location, setLocation] = useState<string | null>(null);

  useEffect(() => {
    if (!url || !viewerRef.current) return;
    const book = ePub(url);
    bookRef.current = book;
    const rendition = book.renderTo(viewerRef.current, { width: '100%', height: '70vh' });
    renditionRef.current = rendition;
    rendition.display();

    rendition.on('relocated', (loc: any) => {
      setLocation(loc.start.cfi);
    });
    return () => {
      try { rendition.destroy(); } catch (e) {}
      try { book.destroy(); } catch (e) {}
    };
  }, [url]);

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <button onClick={() => renditionRef.current && renditionRef.current.prev()} className="px-2 py-1 rounded-md border">◀</button>
        <button onClick={() => renditionRef.current && renditionRef.current.next()} className="px-2 py-1 rounded-md border">▶</button>
        <div className="ml-auto text-sm">{location ? 'чтение...' : ''}</div>
      </div>
      <div ref={viewerRef} className="border rounded-lg overflow-auto" />
    </div>
  );
}
