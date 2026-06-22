import { Book } from "@/types/types";
import { motion } from "framer-motion";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";

interface Props {
    book: Book;
    onAddSession?: (session: import("@/types/types").ReadingSession) => void;
}

export function BookCard({ book, onAddSession }: Props) {
    const progress = Math.round(
        (book.currentPage / book.totalPages) * 100
    );

    const [open, setOpen] = useState(false);
    const [pages, setPages] = useState(10);
    const [duration, setDuration] = useState(20);
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

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

                    <button aria-label={`Add reading session for ${book.title}`} onClick={() => setOpen(true)} className="self-end text-xs border border-zinc-400 px-2 py-1 rounded-md hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                        Add Session
                    </button>
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
        </>
    );
}
