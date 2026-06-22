// src/hooks/useLibrary.ts

import { useMemo, useState, useEffect } from "react";
import { Book, ReadingSession, Note } from "@/types/types";

export function useLibrary() {
    const [books, setBooks] = useState<Book[]>([]);
    const [sessions, setSessions] = useState<ReadingSession[]>([]);
    const [notes, setNotes] = useState<Note[]>(() => {
        try {
            const raw = localStorage.getItem('notes');
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    });

    const [readingGoal, setReadingGoal] = useState<{ booksPerYear?: number }>(() => {
        try {
            const raw = localStorage.getItem('readingGoal');
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    });

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

    // books read count
    const booksRead = useMemo(() => finishedBooks.length, [finishedBooks]);

    // reading speed: pages per minute
    const avgPagesPerMinute = useMemo(() => {
        const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        if (totalMinutes === 0) return 0;
        return totalPagesRead / totalMinutes;
    }, [sessions, totalPagesRead]);

    // favorite genres (simple frequency)
    const favoriteGenres = useMemo(() => {
        const freq: Record<string, number> = {};
        books.forEach(b => {
            if (!b.genre) return;
            freq[b.genre] = (freq[b.genre] || 0) + 1;
        });
        return Object.entries(freq).sort((a, b) => b[1] - a[1]).map(([g]) => g);
    }, [books]);

    // persist readingGoal & notes
    useEffect(() => {
        try {
            localStorage.setItem('readingGoal', JSON.stringify(readingGoal));
            localStorage.setItem('notes', JSON.stringify(notes));
        } catch (e) {
            // ignore
        }
    }, [readingGoal, notes]);

    // recommend books: score by (genre match + short remaining time)
    const recommendBooks = (count = 5) => {
        const scored = books.map(b => {
            const remaining = Math.max(0, b.totalPages - b.currentPage);
            const estMinutes = avgPagesPerMinute > 0 ? Math.ceil(remaining / avgPagesPerMinute) : Infinity;
            const genreScore = favoriteGenres.includes(b.genre) ? 1 : 0;
            const score = genreScore * 1000 - estMinutes; // higher better
            return { book: b, remaining, estMinutes, score };
        });
        return scored.sort((a, b) => b.score - a.score).slice(0, count);
    };

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

    const addNote = (note: Omit<Note, 'id' | 'date'>) => {
        const n = { id: String(Date.now()), date: new Date().toISOString(), ...note } as Note;
        setNotes(prev => [...prev, n]);
    };

    const getNotesByBook = (bookId: string) => notes.filter(n => n.bookId === bookId).sort((a,b)=>b.date.localeCompare(a.date));

    const exportNotesCSV = () => {
        const headers = ['id','bookId','date','quote','text'];
        const rows = notes.map(n => [n.id, n.bookId, n.date, JSON.stringify(n.quote||''), JSON.stringify(n.text||'')]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'notes.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    const setReadingGoalBooksPerYear = (n?: number) => {
        setReadingGoal(prev => ({ ...prev, booksPerYear: n }));
    };

    return {
        books,
        activeBooks,
        finishedBooks,
        sessions,
        averagePagesPerDay,
        estimatedFinishDate,
        addSession,
        readingGoal,
        setReadingGoalBooksPerYear,
        booksRead,
        avgPagesPerMinute,
        favoriteGenres,
        recommendBooks,
        notes,
        addNote,
        getNotesByBook,
        exportNotesCSV,
    };
}
