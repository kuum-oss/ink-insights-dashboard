import { Book } from "@/types/types";
import { motion } from "framer-motion";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";

interface Props {
    book: Book;
    onAddSession?: (session: import("@/types/types").ReadingSession) => void;
    onAddNote?: (note: Omit<import("@/types/types").Note, 'id' | 'date'>) => void;
    getNotesByBook?: (bookId: string) => import("@/types/types").Note[];
    exportNotes?: () => void;
}

export function BookCard({ book, onAddSession, onAddNote, getNotesByBook, exportNotes }: Props) {
    const progress = Math.round(
        (book.currentPage / Math.max(1, book.totalPages)) * 100
    );

    const [open, setOpen] = useState(false);
    const [openNotes, setOpenNotes] = useState(false);
    const [pages, setPages] = useState(10);
    const [duration, setDuration] = useState(20);
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

    const [noteText, setNoteText] = useState('');
    const [quote, setQuote] = useState('');

    function submit() {
        const session = {
            bookId: book.id,
            date: new Date(date).toISOString(),
            pagesRead: Number(pages),
            duration: Number(duration),
        };

        onAddSession?.(session);
        setOpen(false);
    }

    function submitNote() {
        if (!noteText.trim()) return;
        onAddNote?.({ bookId: book.id, text: noteText.trim(), quote: quote.trim() || undefined });
        setNoteText('');
        setQuote('');
    }

    const notes = getNotesByBook ? getNotesByBook(book.id) : [];

    return (
        <>
            <motion.div
                whileHover={{ scale: 1.03 }}
                whileFocus={{ scale: 1.03 }}
                tabIndex={0}
                className="relative rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 overflow-hidden shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
                {/* cover with fallback */}
                <div className="relative">
                    <img
                        src={book.coverUrl || undefined}
                        alt={book.title}
                        onError={(e:any)=>{ e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="320"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="18">No Cover</text></svg>'; }}
                        className="w-full h-64 object-cover"
                        loading="lazy"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
                        <div className="text-white text-xs font-medium">{book.genre || ''}</div>
                        <div className="flex justify-end gap-2">
                            <button aria-label={`Notes for ${book.title}`} onClick={() => setOpenNotes(true)} className="text-xs bg-white/10 backdrop-blur-sm text-white px-2 py-1 rounded-md hover:bg-white/20 focus:outline-none">Notes</button>
                            <button aria-label={`Add reading session for ${book.title}`} onClick={() => setOpen(true)} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-md hover:bg-indigo-500 focus:outline-none">Add</button>
                        </div>
                    </div>
                </div>

                <div className="p-3">
                    <div className="flex items-start justify-between">
                        <div className="min-w-0">
                            <div className="text-sm font-semibold truncate">{book.title}</div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{book.author || '—'}</div>
                        </div>
                        <div className="ml-3 text-xs text-zinc-600 dark:text-zinc-300">{progress}%</div>
                    </div>

                    <div className="mt-3">
                        <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-700 overflow-hidden">
                            <div className="h-2 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-300" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
                        </div>
                    </div>
                </div>
            </motion.div>

            <Modal isOpen={open} onClose={() => setOpen(false)} title={`Add session — ${book.title}`}>
                <div className="space-y-3">
                    <label className="block text-sm">
                        Дата
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full rounded-md border px-2 py-1 bg-white dark:bg-zinc-800" />
                    </label>

                    <label className="block text-sm">
                        Страницы
                        <input type="number" value={pages} min={1} onChange={e => setPages(Number(e.target.value))} className="mt-1 block w-full rounded-md border px-2 py-1 bg-white dark:bg-zinc-800" />
                    </label>

                    <label className="block text-sm">
                        Длительность (мин)
                        <input type="number" value={duration} min={1} onChange={e => setDuration(Number(e.target.value))} className="mt-1 block w-full rounded-md border px-2 py-1 bg-white dark:bg-zinc-800" />
                    </label>

                    <div className="flex justify-end gap-2 pt-2">
                        <button onClick={() => setOpen(false)} className="px-3 py-1 rounded-md border hover:bg-zinc-100 dark:hover:bg-zinc-800">Отмена</button>
                        <button onClick={submit} className="px-3 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-500">Сохранить</button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={openNotes} onClose={() => setOpenNotes(false)} title={`Notes — ${book.title}`}>
                <div className="space-y-3">
                    <label className="block text-sm">
                        Quote (optional)
                        <input value={quote} onChange={e=>setQuote(e.target.value)} className="mt-1 block w-full rounded-md border px-2 py-1 bg-white dark:bg-zinc-800" />
                    </label>

                    <label className="block text-sm">
                        Note
                        <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} className="mt-1 block w-full rounded-md border px-2 py-1 bg-white dark:bg-zinc-800" />
                    </label>

                    <div className="flex justify-between items-center gap-2 pt-2">
                        <div className="flex gap-2">
                            <button onClick={exportNotes} className="px-3 py-1 rounded-md border hover:bg-zinc-100 dark:hover:bg-zinc-800">Export</button>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={() => setOpenNotes(false)} className="px-3 py-1 rounded-md border hover:bg-zinc-100 dark:hover:bg-zinc-800">Close</button>
                            <button onClick={submitNote} className="px-3 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-500">Save note</button>
                        </div>
                    </div>

                    <div className="mt-2">
                        <div className="text-sm font-semibold">Existing notes</div>
                        <div className="mt-2 space-y-2 text-sm">
                            {notes.length === 0 ? (
                                <div className="opacity-60">No notes</div>
                            ) : (
                                notes.map(n => (
                                    <div key={n.id} className="p-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                        <div className="text-xs opacity-60">{new Date(n.date).toLocaleString()}</div>
                                        {n.quote && <div className="mt-1 italic">“{n.quote}”</div>}
                                        <div className="mt-1">{n.text}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}
