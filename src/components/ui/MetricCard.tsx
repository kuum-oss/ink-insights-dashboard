interface Props {
    label: string;
    value: number;
}

export function MetricCard({ label, value }: Props) {
    return (
        <div className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3">
            <div className="text-xs uppercase tracking-wide opacity-60">
                {label}
            </div>
            <div className="mt-1 font-mono text-3xl">
                {value}
            </div>
        </div>
    );
}
