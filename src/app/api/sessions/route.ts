import db from '../../db';
import { validateSession } from '@/services/validation';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get('limit') ?? 1000);
    const offset = Number(url.searchParams.get('offset') ?? 0);
    const rows = db.prepare('SELECT * FROM sessions ORDER BY date DESC LIMIT ? OFFSET ?').all(limit, offset);
    return new Response(JSON.stringify(rows), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bookId, date, pagesRead, duration } = body;
    
    const validationError = validateSession({ bookId, pagesRead, duration: duration ?? 1 });
    if (validationError) {
      return new Response(JSON.stringify({ error: validationError }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const stmt = db.prepare('INSERT INTO sessions (bookId, date, pagesRead, duration) VALUES (?, ?, ?, ?)');
    const info = stmt.run(Number(bookId), date, Number(pagesRead), Number(duration ?? 0));
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(info.lastInsertRowid);

    // update book progress
    try {
      const currentProgress = db.prepare('SELECT COALESCE(progress, 0) as progress FROM books WHERE id = ?').get(Number(bookId));
      const newProgress = (currentProgress?.progress || 0) + Number(pagesRead);
      
      db.prepare('UPDATE books SET progress = ? WHERE id = ?').run(newProgress, Number(bookId));
      
      const book = db.prepare('SELECT id, progress, totalPages FROM books WHERE id = ?').get(Number(bookId));
      if (book && book.totalPages && book.progress >= book.totalPages) {
        db.prepare('UPDATE books SET read = 1 WHERE id = ?').run(Number(bookId));
      }
    } catch (e) {
      console.error('Error updating book progress:', e);
    }

    return new Response(JSON.stringify(session), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
