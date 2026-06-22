// src/hooks/useLibrary.ts

import { useMemo, useState, useEffect } from "react";
import { Book, ReadingSession, Note } from "@/types/types";

function mapServerBook(b: any): Book {
    return {
        id: String(b.id),
        title: b.title || '',
        author: b.author || '',
        coverUrl: b.coverUrl || '',
        contentUrl: b.contentUrl || undefined,
        totalPages: b.totalPages ?? (b.progress ? b.progress : 0),
        currentPage: b.progress ?? 0,
        genre: b.genre || '',
    };
}

export function useLibrary() {
    const [books, setBooks] = useState<Book[]>([]);
    const [sessions, setSessions] = useState<ReadingSession[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);

    const [readingGoal, setReadingGoal] = useState<{ booksPerYear?: number }>(() => {
        try {
            const raw = localStorage.getItem('readingGoal');
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    });

    // load books, sessions and notes from API on mount
    useEffect(() => {
        let mounted = true;
        async function loadAll() {
            try {
                const [booksRes, sessionsRes, notesRes] = await Promise.all([
                    fetch('/api/books'),
                    fetch('/api/sessions'),
                    fetch('/api/notes'),
                ]);

                if (booksRes.ok) {
                    const data = await booksRes.json();
                    if (mounted) setBooks(data.map(mapServerBook));
                }

                if (sessionsRes.ok) {
                    const sdata = await sessionsRes.json();
                    if (mounted) setSessions(sdata.map((s: any) => ({ bookId: String(s.bookId), date: s.date, pagesRead: Number(s.pagesRead), duration: Number(s.duration || 0) })));
                }

                if (notesRes.ok) {
                    const ndata = await notesRes.json();
                    if (mounted) setNotes(ndata.map((n: any) => ({ id: String(n.id), bookId: String(n.bookId), date: n.date, text: n.text, quote: n.quote })));
                }
            } catch (e) {
                // ignore
            }
        }
        loadAll();
        return () => { mounted = false; };
    }, []);

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

    // persist readingGoal
    useEffect(() => {
        try {
            localStorage.setItem('readingGoal', JSON.stringify(readingGoal));
        } catch (e) {
            // ignore
        }
    }, [readingGoal]);

    const getRecSettings = () => {
        try {
            const raw = localStorage.getItem('recSettings');
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        return { wGenre: 1.2, wProgress: 1.0, wRecency: 0.8, wSpeed: 0.6, abGroup: 'control' };
    };

    const recommendBooks = (count = 5) => {
        const settings = getRecSettings();
        const wGenre = Number(settings.wGenre ?? 1.2);
        const wProgress = Number(settings.wProgress ?? 1.0);
        const wRecency = Number(settings.wRecency ?? 0.8);
        const wSpeed = Number(settings.wSpeed ?? 0.6);
        const ab = settings.abGroup ?? 'control';

        const lastSessionByBook: Record<string, string | null> = {};
        sessions.forEach(s => {
            const prev = lastSessionByBook[s.bookId];
            if (!prev || s.date > prev) lastSessionByBook[s.bookId] = s.date;
        });

        const scored = books.map(b => {
            const remaining = Math.max(0, b.totalPages - b.currentPage);
            const progressRatio = b.totalPages > 0 ? 1 - remaining / b.totalPages : 0;
            const estMinutes = avgPagesPerMinute > 0 ? remaining / avgPagesPerMinute : Infinity;
            const genreScore = favoriteGenres.includes(b.genre) ? 1 : 0;
            const last = lastSessionByBook[b.id];
            let daysSince = 9999;
            if (last) {
                const d1 = new Date();
                const d2 = new Date(last);
                daysSince = Math.round((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
            } else {
                daysSince = 999;
            }
            const recencyScore = Math.max(0, 1 - Math.min(daysSince, 30) / 30);
            const maxMinutes = 60 * 10;
            const speedScore = isFinite(estMinutes) ? Math.max(0, 1 - Math.min(estMinutes, maxMinutes) / maxMinutes) : 0;
            const raw = wGenre * genreScore + wProgress * progressRatio + wRecency * recencyScore + wSpeed * speedScore;
            const abBoost = ab === 'variant' && b.totalPages < 300 ? 0.15 : 0;
            const score = Math.round((raw + abBoost) * 100);
            return { book: b, remaining, estMinutes, score };
        });

        return scored.sort((a, b) => b.score - a.score).slice(0, count);
    };

    const getPriorityNotifications = (minScore = 60, count = 3) => {
        const recs = recommendBooks(20);
        return recs.filter(r => r.score >= minScore).slice(0, count);
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

    const getFirstSessionDate = (bookId: string): string | null => {
        const bookSessions = sessions.filter(s => s.bookId === bookId).sort((a,b)=>a.date.localeCompare(b.date));
        if (bookSessions.length === 0) return null;
        return bookSessions[0].date.split('T')[0];
    };

    const addSession = async (session: ReadingSession) => {
        try {
            const res = await fetch('/api/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(session) });
            if (!res.ok) {
                // fallback to local update
                setSessions(prev => [...prev, session]);
                setBooks(prev => prev.map(b => b.id === session.bookId ? { ...b, currentPage: b.currentPage + session.pagesRead } : b));
                return;
            }
            const created = await res.json();
            const s = { bookId: String(created.bookId), date: created.date, pagesRead: Number(created.pagesRead), duration: Number(created.duration || 0) } as ReadingSession;
            setSessions(prev => [s, ...prev]);
            setBooks(prev => prev.map(b => b.id === s.bookId ? { ...b, currentPage: b.currentPage + s.pagesRead } : b));
        } catch (e) {
            // network error, apply locally
            setSessions(prev => [...prev, session]);
            setBooks(prev => prev.map(b => b.id === session.bookId ? { ...b, currentPage: b.currentPage + session.pagesRead } : b));
        }
    };

    const addNote = async (note: Omit<Note, 'id' | 'date'>) => {
        try {
            const payload = { ...note, date: new Date().toISOString() };
            const res = await fetch('/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!res.ok) {
                const n = { id: String(Date.now()), date: payload.date, ...note } as Note;
                setNotes(prev => [...prev, n]);
                return;
            }
            const created = await res.json();
            const n = { id: String(created.id), bookId: String(created.bookId), date: created.date, text: created.text, quote: created.quote } as Note;
            setNotes(prev => [n, ...prev]);
        } catch (e) {
            const n = { id: String(Date.now()), date: new Date().toISOString(), ...note } as Note;
            setNotes(prev => [...prev, n]);
        }
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

    // new: addBook / updateBook / deleteBook (call API and update state)
    const addBook = async (payload: { title: string; author?: string; description?: string; totalPages?: number }) => {
        const res = await fetch('/api/books', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to add book');
        const data = await res.json();
        const mapped = mapServerBook(data);
        setBooks(prev => [mapped, ...prev]);
        return mapped;
    };

    const updateBook = async (id: string, updates: Partial<{ title: string; author: string; description: string; read: boolean; progress: number; }>) => {
        const res = await fetch(`/api/books/${id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error('Failed to update book');
        const data = await res.json();
        const mapped = mapServerBook(data);
        setBooks(prev => prev.map(b => b.id === id ? mapped : b));
        return mapped;
    };

    const deleteBook = async (id: string) => {
        const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
        if (res.status !== 204) throw new Error('Failed to delete');
        setBooks(prev => prev.filter(b => b.id !== id));
    };

    const setReadingGoalBooksPerYear = (n?: number) => {
        setReadingGoal(prev => ({ ...prev, booksPerYear: n }));
    };

    const seedDemo = async () => {
        try {
            // sample books
            const demo = [
                { title: '1984', author: 'George Orwell', totalPages: 328 },
                { title: 'The Hobbit', author: 'J.R.R. Tolkien', totalPages: 310 },
                { title: 'Test Book from CLI', author: 'Demo', totalPages: 120 },
            ];
            for (const b of demo) {
                await addBook(b);
            }
            // add some sessions for the first book
            const allBooks = await fetch('/api/books').then(r => r.json());
            if (allBooks && allBooks.length) {
                const first = allBooks[0];
                await fetch('/api/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookId: first.id, date: new Date().toISOString(), pagesRead: 25, duration: 30 }) });
            }
            // refetch
            const bres = await fetch('/api/books');
            if (bres.ok) setBooks((await bres.json()).map(mapServerBook));
            const sres = await fetch('/api/sessions');
            if (sres.ok) setSessions((await sres.json()).map((s: any) => ({ bookId: String(s.bookId), date: s.date, pagesRead: Number(s.pagesRead), duration: Number(s.duration || 0) })));
        } catch (e) {
            // ignore
        }
    };

    return {
        books,
        activeBooks,
        finishedBooks,
        sessions,
        averagePagesPerDay,
        estimatedFinishDate,
        getFirstSessionDate,
        addSession,
        readingGoal,
        setReadingGoalBooksPerYear,
        booksRead,
        avgPagesPerMinute,
        favoriteGenres,
        recommendBooks,
        getPriorityNotifications,
        notes,
        addNote,
        getNotesByBook,
        exportNotesCSV,
        // new
        addBook,
        updateBook,
        deleteBook,
        seedDemo,
    };
}
