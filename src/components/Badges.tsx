interface Badge { id: string; name: string; description: string; earned: boolean }

interface Props { badges: Badge[] }

export function Badges({ badges }: Props) {
    if (!badges || badges.length === 0) return null;

    return (
        <div className="px-6 py-4">
            <div className="flex gap-2">
                {badges.map(b => (
                    <div key={b.id} className={`p-2 rounded-md ${b.earned ? 'bg-amber-100 dark:bg-amber-800' : 'bg-zinc-50 dark:bg-zinc-900'} border`}>
                        <div className="text-sm font-medium">{b.name}</div>
                        <div className="text-xs opacity-70">{b.description}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
