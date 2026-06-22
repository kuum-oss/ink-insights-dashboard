interface Props {
    label: string;
    value: number | string;
    icon?: React.ReactNode;
    trend?: number;
    color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'blue' | 'violet';
    description?: string;
}

const colorGradients = {
    indigo: 'from-indigo-500/20 to-indigo-600/20 dark:from-indigo-900/30 dark:to-indigo-800/30 border-indigo-200 dark:border-indigo-700/50',
    emerald: 'from-emerald-500/20 to-emerald-600/20 dark:from-emerald-900/30 dark:to-emerald-800/30 border-emerald-200 dark:border-emerald-700/50',
    amber: 'from-amber-500/20 to-amber-600/20 dark:from-amber-900/30 dark:to-amber-800/30 border-amber-200 dark:border-amber-700/50',
    rose: 'from-rose-500/20 to-rose-600/20 dark:from-rose-900/30 dark:to-rose-800/30 border-rose-200 dark:border-rose-700/50',
    blue: 'from-blue-500/20 to-blue-600/20 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-700/50',
    violet: 'from-violet-500/20 to-violet-600/20 dark:from-violet-900/30 dark:to-violet-800/30 border-violet-200 dark:border-violet-700/50',
};

export function MetricCard({ label, value, icon, trend, color = 'indigo', description }: Props) {
    return (
        <div className={`rounded-xl border bg-gradient-to-br ${colorGradients[color]} px-6 py-4 backdrop-blur-sm transition-all hover:shadow-md`}>
            <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium opacity-70 uppercase tracking-wide">
                        {label}
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <div className="font-mono text-3xl font-bold">
                            {value}
                        </div>
                        {trend !== undefined && (
                            <div className={`text-sm font-medium ${trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                            </div>
                        )}
                    </div>
                    {description && (
                        <div className="mt-1 text-xs opacity-60">
                            {description}
                        </div>
                    )}
                </div>
                {icon && (
                    <div className="ml-3 flex-shrink-0 text-3xl opacity-60">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}
