import Database from 'better-sqlite3';
import { resolve } from 'path';
import fs from 'fs';

const dataDir = resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbPath = resolve(dataDir, 'books.db');
const db = new Database(dbPath);

// create table if missing
db.exec(`
CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT,
  description TEXT,
  coverUrl TEXT,
  read INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
`);

// add coverUrl and totalPages columns if this DB was created earlier without them
try {
  const cols = db.prepare("PRAGMA table_info(books)").all();
  if (!cols.find((c: any) => c.name === 'coverUrl')) {
    db.exec("ALTER TABLE books ADD COLUMN coverUrl TEXT;");
  }
  if (!cols.find((c: any) => c.name === 'totalPages')) {
    db.exec("ALTER TABLE books ADD COLUMN totalPages INTEGER DEFAULT 0;");
  }
} catch (e) {
  // ignore
}

export default db;
