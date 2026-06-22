import { Book } from "@/types/types";
import { BookCard } from "./BookCard";

interface Props {
    books: Book[];
    onAddSession?: (session: import("@/types/types").ReadingSession) => void;
    onAddNote?: (note: Omit<import("@/types/types").Note, 'id' | 'date'>) => void;
    getNotesByBook?: (bookId: string) => import("@/types/types").Note[];
    exportNotes?: () => void;
}

export function ProgressGrid({ books, onAddSession, onAddNote, getNotesByBook, exportNotes }: Props) {
    if (books.length === 0) {
        return (
            <div className="text-sm opacity-50">
                Здесь пусто. Иногда это нормально.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {books.map(book => (
                <BookCard key={book.id} book={book} onAddSession={onAddSession} onAddNote={onAddNote} getNotesByBook={getNotesByBook} exportNotes={exportNotes} />
            ))}
        </div>
    );
}
