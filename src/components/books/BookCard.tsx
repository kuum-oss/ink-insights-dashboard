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
        (book.currentPage / book.totalPages) * 100
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
                whileHover={{ scale: 1.02 }}
                whileFocus={{ scale: 1.02 }}
                tabIndex={0}
                className="relative rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
                <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="aspect-[3/4] w-full object-cover"
                />

                <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    whileFocus={{ opacity: 1 }}
                    className="absolute inset-0 bg-zinc-900/80 text-zinc-100 flex flex-col justify-between p-3 transition-opacity duration-150"
                >
                    <div className="font-mono text-sm">
                        {progress}%
                    </div>

                    <div className="flex gap-2 self-end">
                        <button aria-label={`Notes for ${book.title}`} onClick={() => setOpenNotes(true)} className="text-xs border border-zinc-400 px-2 py-1 rounded-md hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">Notes</button>
                        <button aria-label={`Add reading session for ${book.title}`} onClick={() => setOpen(true)} className="text-xs border border-zinc-400 px-2 py-1 rounded-md hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">Add Session</button>
                    </div>
                </motion.div>
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
