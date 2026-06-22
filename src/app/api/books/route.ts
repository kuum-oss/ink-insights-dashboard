import db from '../../db';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get('q');
    const read = url.searchParams.get('read');
    const limit = Number(url.searchParams.get('limit') ?? 100);
    const offset = Number(url.searchParams.get('offset') ?? 0);

    let sql = 'SELECT * FROM books';
    const conditions: string[] = [];
    const params: any[] = [];

    if (q) {
      conditions.push('(title LIKE ? OR author LIKE ? OR description LIKE ?)');
      const like = `%${q}%`;
      params.push(like, like, like);
    }
    if (read === '1' || read === '0') {
      conditions.push('read = ?');
      params.push(Number(read));
    }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const stmt = db.prepare(sql);
    const rows = stmt.all(...params);
    return new Response(JSON.stringify(rows), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, author, description, coverUrl, totalPages, contentUrl } = body;
    if (!title) return new Response(JSON.stringify({ error: 'title is required' }), { status: 400 });

    const stmt = db.prepare('INSERT INTO books (title, author, description, coverUrl, totalPages, contentUrl) VALUES (?, ?, ?, ?, ?, ?)');
    const info = stmt.run(title, author ?? null, description ?? null, coverUrl ?? null, totalPages ?? 0, contentUrl ?? null);
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(info.lastInsertRowid);
    return new Response(JSON.stringify(book), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
