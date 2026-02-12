import { ReadingSession } from "@/types/types";
import { MetricCard } from "@/components/ui/MetricCard";

interface Props {
    booksRead: number;
    pagesPerDay: number;
    sessions: ReadingSession[];
}

export function AnalyticsSummary({
                                     booksRead,
                                     pagesPerDay,
                                     sessions,
                                 }: Props) {
    const currentStreak = calculateStreak(sessions);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 pt-6">
            <MetricCard label="Книг за год" value={booksRead} />
            <MetricCard label="Страниц в день" value={pagesPerDay} />
            <MetricCard label="Текущий стрик (дни)" value={currentStreak} />
        </div>
    );
}

function calculateStreak(sessions: ReadingSession[]): number {
    if (sessions.length === 0) return 0;

    const dates = Array.from(
        new Set(sessions.map(s => s.date.split("T")[0]))
    ).sort();

    let streak = 1;
    for (let i = dates.length - 1; i > 0; i--) {
        const current = new Date(dates[i]);
        const prev = new Date(dates[i - 1]);

        const diff =
            (current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

        if (diff === 1) streak++;
        else break;
    }

    return streak;
}
