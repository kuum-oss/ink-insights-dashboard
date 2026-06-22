'use client';

import { useState } from 'react';

type Props = { addBook: (p: { title: string; author?: string; description?: string; totalPages?: number; coverUrl?: string; contentUrl?: string }) => Promise<any> };

export default function AddBookForm({ addBook }: Props) {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [totalPages, setTotalPages] = useState<number | ''>('');
    const [file, setFile] = useState<File | null>(null);
    const [contentFile, setContentFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadFile = async (f?: File): Promise<string | undefined> => {
        if (!f) return undefined;
        const fd = new FormData();
        fd.append('file', f);
        const res = await fetch('/api/books/upload', { method: 'POST', body: fd });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        return data.url;
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!title.trim()) { setError('Title is required'); return; }
        setLoading(true);
        try {
            const coverUrl = await uploadFile(file || undefined);
            const contentUrl = await uploadFile(contentFile || undefined);
            await addBook({ title: title.trim(), author: author.trim() || undefined, description: description.trim() || undefined, totalPages: typeof totalPages === 'number' && totalPages > 0 ? totalPages : undefined, coverUrl, contentUrl });
            setTitle(''); setAuthor(''); setDescription(''); setTotalPages(''); setFile(null); setContentFile(null);
        } catch (err: any) {
            setError(err?.message || 'Failed to add book');
        } finally { setLoading(false); }
    };

    const filePreview = file ? URL.createObjectURL(file) : null;
    return (
        <form onSubmit={submit} className="mb-6 p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-md">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="flex-1 min-w-0">
                    <input aria-label="Название" className="w-full px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent placeholder-zinc-400" placeholder="Название" value={title} onChange={e=>setTitle(e.target.value)} />
                    <div className="mt-2 flex gap-2">
                        <input aria-label="Автор" className="flex-1 px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent placeholder-zinc-400" placeholder="Автор" value={author} onChange={e=>setAuthor(e.target.value)} />
                        <input aria-label="Страницы" className="w-28 px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent placeholder-zinc-400" placeholder="Стр." value={totalPages===''? '': String(totalPages)} onChange={e=>{ const v = e.target.value; setTotalPages(v === '' ? '' : Number(v)); }} />
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <div className="w-28 h-36 bg-zinc-100 dark:bg-zinc-900 rounded-md overflow-hidden flex items-center justify-center">
                        {filePreview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={filePreview} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-xs text-zinc-500">No cover</div>
                        )}
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <label className="inline-block px-3 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent cursor-pointer text-sm">
                            Выбрать обложку
                            <input type="file" accept="image/*" className="sr-only" onChange={e=>setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
                        </label>
                        <label className="inline-block px-3 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent cursor-pointer text-sm">
                            Загрузить контент (PDF или TXT)
                            <input type="file" accept="application/pdf,text/plain" className="sr-only" onChange={e=>setContentFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
                        </label>
                    </div>
                </div>

                <div className="self-stretch flex items-center">
                    <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-60" disabled={loading} type="submit">{loading? 'Добавление...' : 'Добавить'}</button>
                </div>
            </div>

            <div className="mt-3">
                <textarea aria-label="Описание" className="w-full px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent placeholder-zinc-400" placeholder="Описание (опционально)" value={description} onChange={e=>setDescription(e.target.value)} />
            </div>

            {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
        </form>
    );
}
