// src/types/types.ts

export interface Book {
    id: string;
    title: string;
    author: string;
    coverUrl: string;
    totalPages: number;
    currentPage: number;
    genre: string;
}

export interface ReadingSession {
    bookId: string;
    date: string; // ISO
    pagesRead: number;
    duration: number; // minutes
}
