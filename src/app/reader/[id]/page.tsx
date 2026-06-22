'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLibrary } from '@/hooks/useLibrary';
import dynamic from 'next/dynamic';

const PdfReader = dynamic(() => import('@/components/reader/PdfReader'), { ssr: false });
const EpubReader = dynamic(() => import('@/components/reader/EpubReader'), { ssr: false });

export default function ReaderPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { books, addSession, updateBook, estimatedFinishDate } = useLibrary();
  const book = books.find(b => b.id === id);
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState<number>(book?.currentPage ?? 0);
  const [textContent, setTextContent] = useState<string | null>(null);

  useEffect(() => {
    setCurrentPage(book?.currentPage ?? 0);
  }, [book?.currentPage]);

  useEffect(() => {
    // if contentUrl is a text file, fetch it
    if (book?.contentUrl && book.contentUrl.endsWith('.txt')) {
      fetch(book.contentUrl).then(r => r.text()).then(t => setTextContent(t)).catch(() => setTextContent(null));
    }
  }, [book?.contentUrl]);

  if (!book) return (
    <div className="p-6">Книга не найдена</div>
  );

  function saveProgressAndExit() {
    const pagesRead = Math.max(0, currentPage - (book?.currentPage ?? 0));
    if (pagesRead > 0) {
      addSession({ bookId: book.id, date: new Date().toISOString(), pagesRead, duration: 0 });
    }
    // optimistic update: set progress via API
    updateBook?.(book.id, { progress: currentPage });
    router.back();
  }

  const isPDF = !!book.contentUrl && book.contentUrl.endsWith('.pdf');
  const isTXT = !!book.contentUrl && book.contentUrl.endsWith('.txt');
  const isEPUB = !!book.contentUrl && book.contentUrl.endsWith('.epub');

  // text pagination: derive pages count
  const computedPages = React.useMemo(() => {
    if (book.totalPages && book.totalPages > 0) return book.totalPages;
    if (!textContent) return Math.max(1, book.totalPages || 1);
    // estimate 1200 chars per page
    return Math.max(1, Math.ceil(textContent.length / 1200));
  }, [book.totalPages, textContent]);

  const currentTextPage = React.useMemo(() => {
    if (!textContent) return '';
    const per = Math.ceil(textContent.length / computedPages);
    const start = Math.min(textContent.length - 1, Math.max(0, (currentPage) * per));
    const end = Math.min(textContent.length, start + per);
    return textContent.slice(start, end);
  }, [textContent, computedPages, currentPage]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold">{book.title}</h2>
            <div className="text-sm opacity-70">{book.author}</div>
          </div>
          <div className="flex gap-2">
            <div className="text-sm">{currentPage}/{book.totalPages} стр.</div>
            <button onClick={saveProgressAndExit} className="px-3 py-1 rounded-md bg-indigo-600 text-white">Сохранить и выйти</button>
          </div>
        </div>

        <div className="rounded-lg bg-white dark:bg-zinc-800 p-6 shadow-sm mb-4">
          <div className="prose dark:prose-invert">
            <p><em>Reader placeholder — здесь будет текст книги или интеграция с ридером.</em></p>
            <p>Используйте ползунок ниже, чтобы изменить текущую страницу во время чтения.</p>
          </div>

          <div className="mt-6">
            {isPDF ? (
              <div className="h-[70vh]">
                {/* better UX: use PdfReader component */}
                <PdfReader url={book.contentUrl as string} initialPage={currentPage || 1} />
              </div>
            ) : isEPUB ? (
              <div>
                <EpubReader url={book.contentUrl as string} />
              </div>
            ) : isTXT ? (
              <>
                <div className="rounded-md bg-white dark:bg-zinc-800 p-4 mb-3 h-64 overflow-auto whitespace-pre-wrap">
                  {currentTextPage}
                </div>
                <input type="range" min={0} max={Math.max(1, computedPages-1)} value={currentPage} onChange={e => setCurrentPage(Number(e.target.value))} className="w-full" />
                <div className="mt-2 text-sm">Страница {currentPage} из {computedPages}</div>
              </>
            ) : (
              <>
                <input type="range" min={0} max={book.totalPages || 1} value={currentPage} onChange={e => setCurrentPage(Number(e.target.value))} className="w-full" />
                <div className="mt-2 text-sm">{currentPage}/{book.totalPages} стр.</div>
              </>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <div>Прогноз окончания: {estimatedFinishDate ? (estimatedFinishDate(book) ?? '—') : '—'}</div>
            <div className="text-xs opacity-70">При выходе прогресс будет сохранён как сессия</div>
          </div>
        </div>

        <div>
          <button onClick={() => router.back()} className="px-3 py-1 rounded-md border mr-2">Отмена</button>
          <button onClick={saveProgressAndExit} className="px-3 py-1 rounded-md bg-indigo-600 text-white">Сохранить и выйти</button>
        </div>
      </div>
    </div>
  );
}
