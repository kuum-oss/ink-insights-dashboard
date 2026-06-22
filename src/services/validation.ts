import { Book, ReadingSession, Note } from '@/types/types';

export const validationRules = {
  book: {
    title: (val: any) => {
      if (!val || typeof val !== 'string') return 'Название обязательно';
      if (val.trim().length < 2) return 'Название должно быть не менее 2 символов';
      if (val.length > 255) return 'Название не должно быть длиннее 255 символов';
      return null;
    },
    author: (val: any) => {
      if (val && typeof val !== 'string') return 'Автор должен быть строкой';
      if (val && val.length > 255) return 'Имя автора не должно быть длиннее 255 символов';
      return null;
    },
    totalPages: (val: any) => {
      if (val !== undefined && val !== null) {
        if (typeof val !== 'number' || !Number.isInteger(val)) return 'Количество страниц должно быть целым числом';
        if (val < 0) return 'Количество страниц не может быть отрицательным';
        if (val > 999999) return 'Количество страниц слишком большое';
      }
      return null;
    },
    progress: (val: any) => {
      if (val !== undefined && val !== null) {
        if (typeof val !== 'number' || !Number.isInteger(val)) return 'Прогресс должен быть целым числом';
        if (val < 0) return 'Прогресс не может быть отрицательным';
        if (val > 100) return 'Прогресс не может быть больше 100%';
      }
      return null;
    },
  },
  session: {
    bookId: (val: any) => {
      if (!val) return 'Book ID обязателен';
      return null;
    },
    pagesRead: (val: any) => {
      if (typeof val !== 'number' || !Number.isInteger(val)) return 'Страницы должны быть числом';
      if (val < 1) return 'Прочитано должно быть минимум 1 страница';
      if (val > 9999) return 'Слишком много страниц за одну сессию';
      return null;
    },
    duration: (val: any) => {
      if (typeof val !== 'number' || !Number.isInteger(val)) return 'Длительность должна быть числом';
      if (val < 1) return 'Длительность должна быть минимум 1 минута';
      if (val > 9999) return 'Длительность слишком велика';
      return null;
    },
  },
  note: {
    bookId: (val: any) => {
      if (!val) return 'Book ID обязателен';
      return null;
    },
    text: (val: any) => {
      if (!val || typeof val !== 'string') return 'Текст заметки обязателен';
      if (val.trim().length === 0) return 'Заметка не может быть пустой';
      if (val.length > 5000) return 'Заметка слишком длинная';
      return null;
    },
  },
};

export function validateBook(data: any): string | null {
  const errors = [];
  
  const titleError = validationRules.book.title(data.title);
  if (titleError) errors.push(titleError);
  
  const authorError = validationRules.book.author(data.author);
  if (authorError) errors.push(authorError);
  
  const totalPagesError = validationRules.book.totalPages(data.totalPages);
  if (totalPagesError) errors.push(totalPagesError);
  
  return errors.length > 0 ? errors.join('; ') : null;
}

export function validateSession(data: any): string | null {
  const errors = [];
  
  const bookIdError = validationRules.session.bookId(data.bookId);
  if (bookIdError) errors.push(bookIdError);
  
  const pagesError = validationRules.session.pagesRead(data.pagesRead);
  if (pagesError) errors.push(pagesError);
  
  const durationError = validationRules.session.duration(data.duration);
  if (durationError) errors.push(durationError);
  
  return errors.length > 0 ? errors.join('; ') : null;
}

export function validateNote(data: any): string | null {
  const errors = [];
  
  const bookIdError = validationRules.note.bookId(data.bookId);
  if (bookIdError) errors.push(bookIdError);
  
  const textError = validationRules.note.text(data.text);
  if (textError) errors.push(textError);
  
  return errors.length > 0 ? errors.join('; ') : null;
}
