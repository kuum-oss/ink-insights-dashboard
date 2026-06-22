import { ReadingSession } from "@/types/types";

interface Props { sessions: ReadingSession[] }

export function PagesPerDayChart({ sessions }: Props) {
    // aggregate last 30 days
    const daysCount = 30;
    const map: Record<string, number> = {};
    for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        map[d.toISOString().split('T')[0]] = 0;
    }

    sessions.forEach(s => {
        const key = s.date.split('T')[0];
        if (key in map) map[key] += s.pagesRead;
    });

    const values = Object.entries(map).map(([date, pages]) => ({ date, pages }));
    const max = Math.max(...values.map(v => v.pages), 1);

    // simple SVG line chart
    const width = 720;
    const height = 160;
    const padding = 24;

    const points = values.map((v, i) => {
        const x = padding + (i / (values.length - 1)) * (width - padding * 2);
        const y = padding + (1 - v.pages / max) * (height - padding * 2);
        return `${x},${y}`;
    }).join(' ');

    function exportCSV() {
        const headers = ['date','pages'];
        const rows = values.map(v => [v.date, String(v.pages)]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'pages-per-day.csv'; a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="mt-6 px-6">
            <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Страниц в день (30 дней)</div>
                <button onClick={exportCSV} className="text-xs px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200">Export CSV</button>
            </div>
            <div className="mt-2 rounded-md bg-white dark:bg-zinc-800 p-3 border border-zinc-200 dark:border-zinc-700">
                <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                    <polyline points={points} fill="none" stroke="#2563EB" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                    {values.map((v, i) => {
                        const x = padding + (i / (values.length - 1)) * (width - padding * 2);
                        const y = padding + (1 - v.pages / max) * (height - padding * 2);
                        return <circle key={v.date} cx={x} cy={y} r={2.5} fill="#2563EB" />;
                    })}
                </svg>
            </div>
        </div>
    );
}
