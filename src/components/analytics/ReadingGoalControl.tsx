interface Props {
    booksRead: number;
    readingGoal?: { booksPerYear?: number };
    setGoal: (n?: number) => void;
}

export function ReadingGoalControl({ booksRead, readingGoal, setGoal }: Props) {
    const target = readingGoal?.booksPerYear ?? 0;
    const percent = target > 0 ? Math.min(100, Math.round((booksRead / target) * 100)) : 0;

    return (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-3">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-sm uppercase opacity-70">Годовая цель (книги)</div>
                    <div className="mt-1 font-semibold">{booksRead} / {target || '—'}</div>
                </div>
                <div className="w-28 text-right">
                    <div className="text-xs opacity-70">Прогресс</div>
                    <div className="mt-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div style={{ width: `${percent}%` }} className="h-2 bg-emerald-500" />
                    </div>
                    <div className="text-xs mt-1">{percent}%</div>
                </div>
            </div>

            <div className="mt-3 text-sm">
                <label className="flex items-center gap-2">
                    <span className="text-xs opacity-70">Цель книг в год</span>
                    <input type="number" min={0} value={target} onChange={e => setGoal(Number(e.target.value) || undefined)} className="ml-2 w-24 rounded-md border px-2 py-1 bg-white dark:bg-zinc-800" />
                </label>
            </div>
        </div>
    );
}
