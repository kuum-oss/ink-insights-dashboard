import { useEffect, useState } from "react";

interface Settings {
    wGenre: number;
    wProgress: number;
    wRecency: number;
    wSpeed: number;
    abGroup: 'control' | 'variant';
}

const DEFAULT: Settings = { wGenre: 1.2, wProgress: 1.0, wRecency: 0.8, wSpeed: 0.6, abGroup: 'control' };

export function RecommendationSettings() {
    const [settings, setSettings] = useState<Settings>(DEFAULT);

    useEffect(() => {
        try {
            const raw = localStorage.getItem('recSettings');
            if (raw) setSettings(JSON.parse(raw));
        } catch (e) {}
    }, []);

    useEffect(() => {
        try { localStorage.setItem('recSettings', JSON.stringify(settings)); } catch (e) {}
    }, [settings]);

    function update<K extends keyof Settings>(k: K, v: Settings[K]) {
        setSettings(prev => ({ ...prev, [k]: v }));
    }

    return (
        <div className="rounded-md p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
                <div className="font-semibold">Настройки рекомендаций</div>
                <div className="text-xs opacity-60">A/B: {settings.abGroup}</div>
            </div>

            <div className="mt-3 space-y-2 text-sm">
                <label className="flex items-center justify-between gap-4">
                    <span>Вес жанра</span>
                    <input className="flex-1" type="range" min="0" max="3" step="0.1" value={settings.wGenre} onChange={e=>update('wGenre', Number(e.target.value))} />
                </label>
                <label className="flex items-center justify-between gap-4">
                    <span>Вес прогресса</span>
                    <input className="flex-1" type="range" min="0" max="3" step="0.1" value={settings.wProgress} onChange={e=>update('wProgress', Number(e.target.value))} />
                </label>
                <label className="flex items-center justify-between gap-4">
                    <span>Вес недавности</span>
                    <input className="flex-1" type="range" min="0" max="3" step="0.1" value={settings.wRecency} onChange={e=>update('wRecency', Number(e.target.value))} />
                </label>
                <label className="flex items-center justify-between gap-4">
                    <span>Вес скорости</span>
                    <input className="flex-1" type="range" min="0" max="3" step="0.1" value={settings.wSpeed} onChange={e=>update('wSpeed', Number(e.target.value))} />
                </label>

                <div className="flex items-center gap-2 pt-2">
                    <button onClick={()=>update('abGroup','control')} className={`px-2 py-1 rounded-md ${settings.abGroup==='control' ? 'bg-indigo-600 text-white' : 'border'}`}>Control</button>
                    <button onClick={()=>update('abGroup','variant')} className={`px-2 py-1 rounded-md ${settings.abGroup==='variant' ? 'bg-indigo-600 text-white' : 'border'}`}>Variant</button>
                </div>
            </div>
        </div>
    );
}
