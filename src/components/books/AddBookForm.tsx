'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

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
    const [isOpen, setIsOpen] = useState(false);

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
        if (!title.trim()) { setError('Название обязательно'); return; }
        setLoading(true);
        try {
            const coverUrl = await uploadFile(file || undefined);
            const contentUrl = await uploadFile(contentFile || undefined);
            await addBook({ title: title.trim(), author: author.trim() || undefined, description: description.trim() || undefined, totalPages: typeof totalPages === 'number' && totalPages > 0 ? totalPages : undefined, coverUrl, contentUrl });
            setTitle(''); setAuthor(''); setDescription(''); setTotalPages(''); setFile(null); setContentFile(null);
            setIsOpen(false);
        } catch (err: any) {
            setError(err?.message || 'Failed to add book');
        } finally { setLoading(false); }
    };

    const filePreview = file ? URL.createObjectURL(file) : null;
    return (
        <>
            <Button variant="primary" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? '✕ Отмена' : '➕ Добавить книгу'}
            </Button>

            {isOpen && (
                <form onSubmit={submit} className="mt-4 p-6 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-700 shadow-lg">
                    <h3 className="text-lg font-semibold mb-4">📚 Добавить новую книгу</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Left section - Text inputs */}
                        <div className="md:col-span-2 space-y-3">
                            <label className="block">
                                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Название *</span>
                                <input 
                                    aria-label="Название" 
                                    className="mt-1 w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                    placeholder="Название книги" 
                                    value={title} 
                                    onChange={e=>setTitle(e.target.value)} 
                                />
                            </label>

                            <div className="grid grid-cols-2 gap-3">
                                <label className="block">
                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Автор</span>
                                    <input 
                                        aria-label="Автор" 
                                        className="mt-1 w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                        placeholder="Имя автора" 
                                        value={author} 
                                        onChange={e=>setAuthor(e.target.value)} 
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Всего страниц</span>
                                    <input 
                                        aria-label="Страницы" 
                                        type="number"
                                        className="mt-1 w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                        placeholder="кол-во" 
                                        value={totalPages===''? '': String(totalPages)} 
                                        onChange={e=>{ const v = e.target.value; setTotalPages(v === '' ? '' : Number(v)); }} 
                                    />
                                </label>
                            </div>

                            <label className="block">
                                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Описание</span>
                                <textarea 
                                    aria-label="Описание" 
                                    className="mt-1 w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" 
                                    placeholder="Описание книги..." 
                                    rows={3}
                                    value={description} 
                                    onChange={e=>setDescription(e.target.value)} 
                                />
                            </label>
                        </div>

                        {/* Right section - File uploads */}
                        <div className="space-y-3">
                            <div>
                                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-2">Обложка книги</span>
                                <div className="w-full h-48 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700">
                                    {filePreview ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={filePreview} alt="preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-xs text-zinc-500 text-center px-2">
                                            <div className="text-2xl mb-1">🖼️</div>
                                            Нет обложки
                                        </div>
                                    )}
                                </div>
                                <label className="mt-2 inline-flex w-full justify-center">
                                    <Button variant="secondary" size="sm" as="span">
                                        📤 Выбрать обложку
                                    </Button>
                                    <input type="file" accept="image/*" className="sr-only" onChange={e=>setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
                                </label>
                            </div>

                            <label className="block">
                                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-2">Контент (PDF/TXT)</span>
                                <label className="inline-flex w-full">
                                    <Button variant="secondary" size="sm" as="span">
                                        📁 Загрузить файл
                                    </Button>
                                    <input type="file" accept="application/pdf,text/plain" className="sr-only" onChange={e=>setContentFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
                                </label>
                            </label>
                        </div>
                    </div>

                    {error && <div className="mt-4 p-3 rounded-lg bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 text-sm">{error}</div>}

                    <div className="mt-4 flex gap-2 justify-end">
                        <Button variant="ghost" onClick={() => setIsOpen(false)}>Отмена</Button>
                        <Button variant="primary" type="submit" isLoading={loading}>✓ Добавить книгу</Button>
                    </div>
                </form>
            )}
        </>
    );
}
