import db from '../../db';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get('limit') ?? 1000);
    const offset = Number(url.searchParams.get('offset') ?? 0);
    const rows = db.prepare('SELECT * FROM notes ORDER BY date DESC LIMIT ? OFFSET ?').all(limit, offset);
    return new Response(JSON.stringify(rows), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bookId, date, quote, text } = body;
    if (!bookId || !date || !text) return new Response(JSON.stringify({ error: 'bookId, date and text are required' }), { status: 400 });

    const stmt = db.prepare('INSERT INTO notes (bookId, date, quote, text) VALUES (?, ?, ?, ?)');
    const info = stmt.run(Number(bookId), date, quote ?? null, text);
    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(info.lastInsertRowid);
    return new Response(JSON.stringify(note), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
