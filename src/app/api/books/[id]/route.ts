import db from '../../../../db';

export async function GET(req: Request) {
  try {
    const parts = req.url.split('/');
    const id = Number(parts[parts.length - 1]);
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(id);
    if (!book) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    return new Response(JSON.stringify(book), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const parts = req.url.split('/');
    const id = Number(parts[parts.length - 1]);
    const body = await req.json();
    const { title, author, description, read, progress } = body;

    const updates: string[] = [];
    const params: any[] = [];
    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (author !== undefined) { updates.push('author = ?'); params.push(author); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (read !== undefined) { updates.push('read = ?'); params.push(read ? 1 : 0); }
    if (progress !== undefined) { updates.push('progress = ?'); params.push(progress); }

    if (!updates.length) return new Response(JSON.stringify({ error: 'No fields to update' }), { status: 400 });

    const sql = `UPDATE books SET ${updates.join(', ')} WHERE id = ?`;
    params.push(id);
    db.prepare(sql).run(...params);
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(id);
    if (!book) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    return new Response(JSON.stringify(book), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const parts = req.url.split('/');
    const id = Number(parts[parts.length - 1]);
    const info = db.prepare('DELETE FROM books WHERE id = ?').run(id);
    if (info.changes === 0) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    return new Response(null, { status: 204 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
