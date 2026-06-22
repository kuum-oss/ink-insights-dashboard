'use client';

import { useState } from 'react';

type Props = { addBook: (p: { title: string; author?: string; description?: string; totalPages?: number; coverUrl?: string }) => Promise<any> };

export default function AddBookForm({ addBook }: Props) {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [totalPages, setTotalPages] = useState<number | ''>('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadFile = async (): Promise<string | undefined> => {
        if (!file) return undefined;
        const fd = new FormData();
        fd.append('file', file);
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
            const coverUrl = await uploadFile();
            await addBook({ title: title.trim(), author: author.trim() || undefined, description: description.trim() || undefined, totalPages: typeof totalPages === 'number' && totalPages > 0 ? totalPages : undefined, coverUrl });
            setTitle(''); setAuthor(''); setDescription(''); setTotalPages(''); setFile(null);
        } catch (err: any) {
            setError(err?.message || 'Failed to add book');
        } finally { setLoading(false); }
    };

    return (
        <form onSubmit={submit} className="mb-4 p-3 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <div className="flex flex-col sm:flex-row gap-2">
                <input className="flex-1 px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent" placeholder="Название" value={title} onChange={e=>setTitle(e.target.value)} />
                <input className="w-48 px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent" placeholder="Автор" value={author} onChange={e=>setAuthor(e.target.value)} />
                <input className="w-36 px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent" placeholder="Стр." value={totalPages===''? '': String(totalPages)} onChange={e=>{ const v = e.target.value; setTotalPages(v === '' ? '' : Number(v)); }} />
                <button className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50" disabled={loading} type="submit">{loading? 'Добавление...' : 'Добавить'}</button>
            </div>
            <div className="mt-2">
                <input className="w-full px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent" placeholder="Описание (опционально)" value={description} onChange={e=>setDescription(e.target.value)} />
            </div>

            <div className="mt-2 flex items-center gap-2">
                <input type="file" accept="image/*" onChange={e=>setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
                {file && <div className="text-sm">{file.name}</div>}
            </div>

            {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
        </form>
    );
}
