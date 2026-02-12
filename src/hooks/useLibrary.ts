// src/hooks/useLibrary.ts

import { useMemo, useState } from "react";
import { Book, ReadingSession } from "@/types/types";

export function useLibrary() {
    const [books, setBooks] = useState<Book[]>([]);
    const [sessions, setSessions] = useState<ReadingSession[]>([]);

    const activeBooks = useMemo(
        () => books.filter(b => b.currentPage < b.totalPages),
        [books]
    );

    const finishedBooks = useMemo(
        () => books.filter(b => b.currentPage >= b.totalPages),
        [books]
    );

    const totalPagesRead = useMemo(
        () => sessions.reduce((sum, s) => sum + s.pagesRead, 0),
        [sessions]
    );

    const averagePagesPerDay = useMemo(() => {
        if (sessions.length === 0) return 0;
        const days = new Set(sessions.map(s => s.date.split("T")[0]));
        return Math.round(totalPagesRead / days.size);
    }, [sessions, totalPagesRead]);

    const estimatedFinishDate = (book: Book): string | null => {
        if (averagePagesPerDay === 0) return null;
        const remaining = book.totalPages - book.currentPage;
        const days = Math.ceil(remaining / averagePagesPerDay);
        const finish = new Date();
        finish.setDate(finish.getDate() + days);
        return finish.toISOString().split("T")[0];
    };

    const addSession = (session: ReadingSession) => {
        setSessions(prev => [...prev, session]);
        setBooks(prev =>
            prev.map(b =>
                b.id === session.bookId
                    ? { ...b, currentPage: b.currentPage + session.pagesRead }
                    : b
            )
        );
    };

    return {
        books,
        activeBooks,
        finishedBooks,
        sessions,
        averagePagesPerDay,
        estimatedFinishDate,
        addSession,
    };
}
