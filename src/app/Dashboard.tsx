// src/app/Dashboard.tsx
'use client';

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useLibrary } from "@/hooks/useLibrary";
import { AnalyticsSummary } from "@/components/analytics/AnalyticsSummary";
import { ProgressGrid } from "@/components/books/ProgressGrid";
import { ReadingHeatmap } from "@/components/heatmap/ReadingHeatmap";
import { PagesPerDayChart } from "@/components/analytics/PagesPerDayChart";
import { useTheme } from "@/theme/ThemeProvider";


export default function Dashboard() {
    const {
        activeBooks,
        finishedBooks,
        sessions,
        averagePagesPerDay,
        addSession,
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

        <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
            <AnalyticsSummary
                booksRead={finishedBooks.length}
                pagesPerDay={averagePagesPerDay}
                sessions={sessions}
            />

            <PagesPerDayChart sessions={sessions} />

            <div className="px-6 py-4">
                <button
                    onClick={() => setView(v => (v === "active" ? "finished" : "active"))}
                    aria-pressed={view === "finished"}
                    className="mb-4 text-sm font-mono px-3 py-1 rounded-md bg-transparent hover:bg-zinc-200 dark:hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                    {view === "active" ? "Читаю сейчас" : "Прочитано"}
                </button>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={view}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                    >
                        <ProgressGrid books={view === "active" ? activeBooks : finishedBooks} onAddSession={addSession} />
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="px-6">
                <div className="mt-4 mb-2 text-sm font-semibold">Рекомендации и прогнозы</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeBooks.slice(0,4).map(b => (
                        <div key={b.id} className="rounded-md p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                            <div className="font-semibold">{b.title}</div>
                            <div className="text-xs opacity-70">Осталось: {b.totalPages - b.currentPage} стр.</div>
                            <div className="text-xs mt-1">Прогноз завершения: {estimatedFinishDate(b) ?? '—'}</div>
                        </div>
                    ))}
                </div>
            </div>

            <ReadingHeatmap sessions={sessions} />
        </div>
    );

}