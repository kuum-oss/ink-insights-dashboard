import { useState } from "react";
import { ReadingSession } from "@/types/types";

interface Props {
    sessions: ReadingSession[];
}

export function ReadingHeatmap({ sessions }: Props) {
    const activity = aggregateSessions(sessions);
    const [selected, setSelected] = useState<string | null>(null);

    function sessionsByDate(date: string) {
        const key = date.split("T")[0];
        return sessions.filter(s => s.date.startsWith(key));
    }

    function exportCSV() {
        const headers = ["bookId", "date", "pagesRead", "duration"];
        const rows = sessions.map(s => [s.bookId, s.date, String(s.pagesRead), String(s.duration)]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sessions.csv';
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="px-6 py-8">
            <div className="mb-2 flex items-center justify-between">
                <div className="text-xs uppercase opacity-60">Активность чтения (90 дней)</div>
                <div>
                    <button onClick={exportCSV} className="text-xs px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200">Export CSV</button>
                </div>
            </div>

            <div className="grid grid-cols-15 gap-1" role="list" aria-label="Reading activity heatmap">
                {activity.map(day => (
                    <div
                        key={day.date}
                        role="listitem"
                        tabIndex={0}
                        onClick={() => setSelected(selected === day.date ? null : day.date)}
                        aria-label={`${day.date}: ${day.pages} стр.`}
                        title={`${day.date}: ${day.pages} стр.`}
                        className={`w-4 h-4 rounded-sm transition-transform transform hover:scale-110 focus:scale-110 cursor-pointer ${
                            day.pages === 0
                                ? "bg-zinc-200 dark:bg-zinc-700"
                                : day.pages < 5
                                    ? "bg-zinc-300 dark:bg-zinc-600"
                                    : day.pages < 15
                                        ? "bg-amber-400 dark:bg-amber-600"
                                        : "bg-emerald-600 dark:bg-emerald-400"
                        } ${selected === day.date ? 'ring-2 ring-indigo-400' : ''}`}
                    />
                ))}
            </div>

            <div className="mt-3 flex items-center gap-4 text-xs opacity-75">
                <div className="flex items-center gap-1">
                    <span className="w-4 h-4 bg-zinc-200 rounded-sm border" />
                    <span>Нет</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-4 h-4 bg-amber-400 rounded-sm" />
                    <span>Низкая</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-4 h-4 bg-emerald-600 rounded-sm" />
                    <span>Высокая</span>
                </div>
            </div>

            {selected && (
                <div className="mt-4 bg-white dark:bg-zinc-800 rounded-md p-3 border border-zinc-200 dark:border-zinc-700">
                    <div className="text-sm font-semibold">Детали за {selected}</div>
                    <div className="mt-2 space-y-2 text-sm">
                        {sessionsByDate(selected).length === 0 ? (
                            <div className="opacity-60">Сессий не найдено</div>
                        ) : (
                            sessionsByDate(selected).map((s, idx) => (
                                <div key={idx} className="flex justify-between">
                                    <div>Книга: {s.bookId}</div>
                                    <div>{s.pagesRead} стр. · {s.duration} мин</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function aggregateSessions(sessions: ReadingSession[]) {
    const days: Record<string, number> = {};

    sessions.forEach(s => {
        const d = s.date.split("T")[0];
        days[d] = (days[d] || 0) + s.pagesRead;
    });

    const result = [];
    for (let i = 89; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = date.toISOString().split("T")[0];

        result.push({
            date: key,
            pages: days[key] || 0,
        });
    }

    return result;
}
