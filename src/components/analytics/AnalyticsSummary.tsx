import { ReadingSession } from "@/types/types";
import { MetricCard } from "@/components/ui/MetricCard";
import { ReadingGoalControl } from "@/components/analytics/ReadingGoalControl";

interface Props {
    booksRead: number;
    pagesPerDay: number;
    sessions: ReadingSession[];
    readingGoal?: { booksPerYear?: number };
    setReadingGoal?: (n?: number) => void;
}

export function AnalyticsSummary({
                                     booksRead,
                                     pagesPerDay,
                                     sessions,
                                     readingGoal,
                                     setReadingGoal,
                                 }: Props) {
    const currentStreak = calculateStreak(sessions);
    const avgSessionTime = calculateAvgSessionTime(sessions);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard 
                    label="📚 Книг за год" 
                    value={booksRead}
                    color="indigo"
                    icon="📚"
                />
                <MetricCard 
                    label="📖 Страниц в день" 
                    value={pagesPerDay}
                    color="emerald"
                    icon="📖"
                />
                <MetricCard 
                    label="🔥 Стрик (дни)" 
                    value={currentStreak}
                    color="rose"
                    icon="🔥"
                />
                <MetricCard 
                    label="⏱️ Среднее время сессии" 
                    value={`${avgSessionTime} мин`}
                    color="amber"
                    icon="⏱️"
                />
            </div>

            <ReadingGoalControl 
                booksRead={booksRead} 
                readingGoal={readingGoal} 
                setGoal={setReadingGoal ?? (() => {})} 
            />
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

function calculateAvgSessionTime(sessions: ReadingSession[]): number {
    if (sessions.length === 0) return 0;
    const total = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    return Math.round(total / sessions.length);
}
