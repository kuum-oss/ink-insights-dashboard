import { useState } from "react";

interface Props {
    items: Array<{ book: { id: string; title: string }, remaining: number; estMinutes: number; score: number }>;
}

export function Notifications({ items }: Props) {
    const [dismissed, setDismissed] = useState<Record<string, boolean>>({});

    if (!items || items.length === 0) return null;

    return (
        <div className="px-6 pt-4">
            <div className="space-y-2">
                {items.map(it => {
                    if (dismissed[it.book.id]) return null;
                    return (
                        <div key={it.book.id} className="flex items-center justify-between rounded-md p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                            <div>
                                <div className="font-medium">Рекомендуется читать: {it.book.title}</div>
                                <div className="text-xs opacity-70">Осталось {it.remaining} стр. · Приоритет {it.score}%</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setDismissed(prev => ({ ...prev, [it.book.id]: true }))} className="text-xs px-2 py-1 rounded-md border hover:bg-amber-100 dark:hover:bg-amber-800">Dismiss</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
