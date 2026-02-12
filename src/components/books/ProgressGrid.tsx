import { Book } from "@/types/types";
import { BookCard } from "./BookCard";

interface Props {
    books: Book[];
}

export function ProgressGrid({ books }: Props) {
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
                <BookCard key={book.id} book={book} />
            ))}
        </div>
    );
}
