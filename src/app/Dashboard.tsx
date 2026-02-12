// src/app/Dashboard.tsx

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useLibrary } from "@/hooks/useLibrary";
import { AnalyticsSummary } from "@/components/analytics/AnalyticsSummary";
import { ProgressGrid } from "@/components/books/ProgressGrid";
import { ReadingHeatmap } from "@/components/heatmap/ReadingHeatmap";
import { useTheme } from "@/theme/ThemeProvider";


export default function Dashboard() {
    const {
        activeBooks,
        finishedBooks,
        sessions,
        averagePagesPerDay,
    } = useLibrary();

    const [view, setView] = useState<"active" | "finished">("active");

    function ThemeToggle() {
        const { theme, toggleTheme } = useTheme();

        return (
            <button
                onClick={toggleTheme}
                className="font-mono text-xs opacity-60 hover:opacity-100"
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

            <div className="px-6 py-4">
                <button
                    onClick={() => setView(v => (v === "active" ? "finished" : "active"))}
                    className="mb-4 text-sm font-mono opacity-70"
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
                        <ProgressGrid books={view === "active" ? activeBooks : finishedBooks} />
                    </motion.div>
                </AnimatePresence>
            </div>

            <ReadingHeatmap sessions={sessions} />
        </div>
    );

}
