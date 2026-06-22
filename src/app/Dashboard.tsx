// src/app/Dashboard.tsx
'use client';

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useLibrary } from "@/hooks/useLibrary";
import { AnalyticsSummary } from "@/components/analytics/AnalyticsSummary";
import { ProgressGrid } from "@/components/books/ProgressGrid";
import { ReadingHeatmap } from "@/components/heatmap/ReadingHeatmap";
import { PagesPerDayChart } from "@/components/analytics/PagesPerDayChart";
import { Recommendations } from "@/components/analytics/Recommendations";
import { Notifications } from "@/components/Notifications";
import { useTheme } from "@/theme/ThemeProvider";
import AddBookForm from "@/components/books/AddBookForm";


export default function Dashboard() {
    const {
        activeBooks,
        finishedBooks,
        sessions,
        averagePagesPerDay,
        addSession,
        addNote,
        getNotesByBook,
        exportNotesCSV,
        avgPagesPerMinute,
        favoriteGenres,
        recommendBooks,
        getPriorityNotifications,
        addBook,
    updateBook,
    deleteBook,
    seedDemo,
    } = useLibrary();

    const [view, setView] = useState<"active" | "finished">("active");

    function ThemeToggle() {
        const { theme, toggleTheme } = useTheme();

        return (
            <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="inline-flex items-center px-3 py-1 rounded-md text-sm font-mono bg-transparent hover:bg-zinc-200 dark:hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
                {theme === "paper" ? "Paper mode" : "Night mode"}
            </button>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
            <div className="max-w-6xl mx-auto px-6 py-8">
                <header className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-extrabold">Ink Insights</h1>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">Отслеживайте прогресс чтения и заметки</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                    </div>
                </header>

                <AnalyticsSummary
                    booksRead={finishedBooks.length}
                    pagesPerDay={averagePagesPerDay}
                    sessions={sessions}
                />

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <main className="lg:col-span-2">
                        <PagesPerDayChart sessions={sessions} />

                        <div className="mt-4">
                            <div className="flex items-center gap-3">
                                <AddBookForm addBook={addBook} />
                                <button onClick={() => seedDemo?.()} className="px-3 py-1 rounded-md bg-yellow-100 text-sm">Demo mode</button>
                            </div>

                            <div className="mb-3 flex items-center justify-between mt-3">
                                <div className="text-sm font-semibold">{view === 'active' ? 'Читаю сейчас' : 'Прочитано'}</div>
                                <button
                                    onClick={() => setView(v => (v === "active" ? "finished" : "active"))}
                                    aria-pressed={view === "finished"}
                                    className="text-sm font-mono px-3 py-1 rounded-md bg-transparent hover:bg-zinc-200 dark:hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                >
                                    {view === "active" ? "Переключить" : "Переключить"}
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={view}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <ProgressGrid books={view === "active" ? activeBooks : finishedBooks} onAddSession={addSession} onAddNote={addNote} getNotesByBook={getNotesByBook} exportNotes={exportNotesCSV} onUpdateBook={updateBook} onDeleteBook={deleteBook} />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </main>

                    <aside className="space-y-4">
                        <div className="rounded-lg p-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                            <div className="font-semibold">Уведомления</div>
                            <div className="mt-3">
                                <Notifications items={getPriorityNotifications(60, 3)} />
                            </div>
                        </div>

                        <div className="rounded-lg p-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                            <div className="font-semibold">Рекомендации</div>
                            <div className="mt-3">
                                <Recommendations recommendations={recommendBooks(4)} />
                            </div>

                            <div className="mt-4 text-sm">
                                <div>Средняя скорость: {avgPagesPerMinute > 0 ? avgPagesPerMinute.toFixed(2) : '—'} стр/мин</div>
                                <div>Любимые жанры: {favoriteGenres.slice(0,3).join(', ') || '—'}</div>
                            </div>
                        </div>
                    </aside>
                </div>

                <div className="mt-8">
                    <ReadingHeatmap sessions={sessions} />
                </div>
            </div>
        </div>
    );

}