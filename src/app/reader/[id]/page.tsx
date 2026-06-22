'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLibrary } from '@/hooks/useLibrary';

export default function ReaderPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { books, addSession, updateBook, estimatedFinishDate } = useLibrary();
  const book = books.find(b => b.id === id);
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState<number>(book?.currentPage ?? 0);

  useEffect(() => {
    setCurrentPage(book?.currentPage ?? 0);
  }, [book?.currentPage]);

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
            <input type="range" min={0} max={book.totalPages || 1} value={currentPage} onChange={e => setCurrentPage(Number(e.target.value))} className="w-full" />
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
