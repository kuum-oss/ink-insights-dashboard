import { useMemo } from "react";
import { Book } from "@/types/types";

interface Rec {
    book: Book;
    remaining: number;
    estMinutes: number;
}

interface Props {
    recommendations: Array<{ book: Book; remaining: number; estMinutes: number; score: number }>;
}

export function Recommendations({ recommendations }: Props) {
    if (recommendations.length === 0) {
        return (
            <div className="p-3 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                <div className="text-sm opacity-70">Рекомендации появятся, когда в библиотеке есть книги.</div>
            </div>
        );
    }

    return (
        <div className="p-3 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Рекомендованные книги</div>
                <div className="text-xs opacity-60">По прогнозу времени и жанру</div>
            </div>

            <div className="mt-3 space-y-2">
                {recommendations.map(r => (
                    <div key={r.book.id} className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">{r.book.title}</div>
                            <div className="text-xs opacity-70">Осталось {r.remaining} стр. · жанр: {r.book.genre || '—'}</div>
                        </div>
                        <div className="text-right text-xs opacity-80">
                            {isFinite(r.estMinutes) ? <div>{Math.ceil(r.estMinutes/60)} ч</div> : <div>—</div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
