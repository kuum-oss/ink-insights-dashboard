import db from '../../db';

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
    if (!bookId || !date || !pagesRead) return new Response(JSON.stringify({ error: 'bookId, date and pagesRead are required' }), { status: 400 });

    const stmt = db.prepare('INSERT INTO sessions (bookId, date, pagesRead, duration) VALUES (?, ?, ?, ?)');
    const info = stmt.run(Number(bookId), date, Number(pagesRead), Number(duration ?? 0));
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(info.lastInsertRowid);

    // update book progress
    try {
      db.prepare('UPDATE books SET progress = COALESCE(progress,0) + ? WHERE id = ?').run(Number(pagesRead), Number(bookId));
      // mark read if progress >= totalPages
      const book = db.prepare('SELECT id, progress, totalPages FROM books WHERE id = ?').get(Number(bookId));
      if (book && book.totalPages && book.progress >= book.totalPages) {
        db.prepare('UPDATE books SET read = 1 WHERE id = ?').run(Number(bookId));
      }
    } catch (e) {
      // ignore non-fatal
    }

    return new Response(JSON.stringify(session), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
