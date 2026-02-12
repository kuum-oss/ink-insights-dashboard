import { ReadingSession } from "@/types/types";

interface Props {
    sessions: ReadingSession[];
}

export function ReadingHeatmap({ sessions }: Props) {
    const activity = aggregateSessions(sessions);

    return (
        <div className="px-6 py-8">
            <div className="mb-2 text-xs uppercase opacity-60">
                Активность чтения (90 дней)
            </div>

            <div className="grid grid-cols-15 gap-1">
                {activity.map(day => (
                    <div
                        key={day.date}
                        title={`${day.date}: ${day.pages} стр.`}
                        className={`w-3 h-3 rounded-sm ${
                            day.pages === 0
                                ? "bg-zinc-200 dark:bg-zinc-700"
                                : day.pages < 10
                                    ? "bg-zinc-400"
                                    : "bg-zinc-600"
                        }`}
                    />
                ))}
            </div>
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
