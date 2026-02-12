import { Book } from "@/types/types";
import { motion } from "framer-motion";

interface Props {
    book: Book;
}

export function BookCard({ book }: Props) {
    const progress = Math.round(
        (book.currentPage / book.totalPages) * 100
    );

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 overflow-hidden"
        >
            <img
                src={book.coverUrl}
                alt={book.title}
                className="aspect-[3/4] w-full object-cover"
            />

            <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-zinc-900/80 text-zinc-100 flex flex-col justify-between p-3"
            >
                <div className="font-mono text-sm">
                    {progress}%
                </div>

                <button className="self-end text-xs border border-zinc-400 px-2 py-1 rounded-md hover:bg-zinc-700">
                    Add Session
                </button>
            </motion.div>
        </motion.div>
    );
}
