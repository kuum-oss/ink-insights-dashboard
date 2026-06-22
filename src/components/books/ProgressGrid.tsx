import { Book } from "@/types/types";
import { BookCard } from "./BookCard";

interface Props {
    books: Book[];
    onAddSession?: (session: import("@/types/types").ReadingSession) => void;
    onAddNote?: (note: Omit<import("@/types/types").Note, 'id' | 'date'>) => void;
    getNotesByBook?: (bookId: string) => import("@/types/types").Note[];
    exportNotes?: () => void;
    estimatedFinishDate?: (b: Book) => string | null;
    getFirstSessionDate?: (bookId: string) => string | null;
    onUpdateBook?: (id: string, updates: Partial<{ title: string; author: string; description: string; read: boolean; progress: number }>) => Promise<any> | void;
    onDeleteBook?: (id: string) => Promise<any> | void;
}

export function ProgressGrid({ books, onAddSession, onAddNote, getNotesByBook, exportNotes, estimatedFinishDate, getFirstSessionDate, onUpdateBook, onDeleteBook }: Props) {
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
                <BookCard key={book.id} book={book} onAddSession={onAddSession} onAddNote={onAddNote} getNotesByBook={getNotesByBook} exportNotes={exportNotes} estimatedFinishDate={estimatedFinishDate} getFirstSessionDate={getFirstSessionDate} onUpdateBook={onUpdateBook} onDeleteBook={onDeleteBook} />
            ))}
        </div>
    );
}
