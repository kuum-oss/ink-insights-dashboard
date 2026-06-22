import Database from 'better-sqlite3';
import { resolve } from 'path';
import { validationRules, validateBook, validateSession, validateNote } from '@/services/validation';
import { businessLogic } from '@/services/businessLogic';

// Test database
const testDbPath = resolve(process.cwd(), 'data/test.db');
const testDb = new Database(testDbPath);

export function runDatabaseTests() {
  console.log('🧪 Запуск тестов БД...\n');

  // Setup test tables
  testDb.exec(`
    DROP TABLE IF EXISTS test_books;
    DROP TABLE IF EXISTS test_sessions;
    DROP TABLE IF EXISTS test_notes;

    CREATE TABLE test_books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT,
      totalPages INTEGER DEFAULT 0,
      currentPage INTEGER DEFAULT 0,
      progress INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE test_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bookId INTEGER NOT NULL,
      date TEXT NOT NULL,
      pagesRead INTEGER NOT NULL,
      duration INTEGER DEFAULT 0
    );

    CREATE TABLE test_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bookId INTEGER NOT NULL,
      date TEXT NOT NULL,
      quote TEXT,
      text TEXT
    );
  `);

  let passed = 0;
  let failed = 0;

  // Test 1: Insert book
  try {
    const stmt = testDb.prepare('INSERT INTO test_books (title, author, totalPages) VALUES (?, ?, ?)');
    const info = stmt.run('1984', 'George Orwell', 328);
    const book = testDb.prepare('SELECT * FROM test_books WHERE id = ?').get(info.lastInsertRowid);
    
    if (book && book.title === '1984') {
      console.log('✓ Test 1: Insert book - PASSED');
      passed++;
    } else {
      throw new Error('Book not found');
    }
  } catch (e) {
    console.error('✗ Test 1: Insert book - FAILED', e);
    failed++;
  }

  // Test 2: Update book progress
  try {
    testDb.prepare('UPDATE test_books SET currentPage = ?, progress = ? WHERE id = 1').run(100, 30);
    const book = testDb.prepare('SELECT * FROM test_books WHERE id = 1').get();
    
    if (book && book.currentPage === 100 && book.progress === 30) {
      console.log('✓ Test 2: Update book progress - PASSED');
      passed++;
    } else {
      throw new Error('Progress not updated');
    }
  } catch (e) {
    console.error('✗ Test 2: Update book progress - FAILED', e);
    failed++;
  }

  // Test 3: Insert reading session
  try {
    const stmt = testDb.prepare('INSERT INTO test_sessions (bookId, date, pagesRead, duration) VALUES (?, ?, ?, ?)');
    const info = stmt.run(1, new Date().toISOString(), 25, 45);
    const session = testDb.prepare('SELECT * FROM test_sessions WHERE id = ?').get(info.lastInsertRowid);
    
    if (session && session.pagesRead === 25) {
      console.log('✓ Test 3: Insert reading session - PASSED');
      passed++;
    } else {
      throw new Error('Session not found');
    }
  } catch (e) {
    console.error('✗ Test 3: Insert reading session - FAILED', e);
    failed++;
  }

  // Test 4: Query sessions for book
  try {
    testDb.prepare('INSERT INTO test_sessions (bookId, date, pagesRead, duration) VALUES (?, ?, ?, ?)').run(1, new Date().toISOString(), 30, 50);
    const sessions = testDb.prepare('SELECT * FROM test_sessions WHERE bookId = ?').all(1);
    
    if (sessions && sessions.length === 2) {
      console.log('✓ Test 4: Query sessions for book - PASSED');
      passed++;
    } else {
      throw new Error(`Expected 2 sessions, got ${sessions.length}`);
    }
  } catch (e) {
    console.error('✗ Test 4: Query sessions for book - FAILED', e);
    failed++;
  }

  // Test 5: Add note
  try {
    const stmt = testDb.prepare('INSERT INTO test_notes (bookId, date, text, quote) VALUES (?, ?, ?, ?)');
    const info = stmt.run(1, new Date().toISOString(), 'Great chapter', 'Freedom is slavery');
    const note = testDb.prepare('SELECT * FROM test_notes WHERE id = ?').get(info.lastInsertRowid);
    
    if (note && note.text === 'Great chapter') {
      console.log('✓ Test 5: Add note - PASSED');
      passed++;
    } else {
      throw new Error('Note not found');
    }
  } catch (e) {
    console.error('✗ Test 5: Add note - FAILED', e);
    failed++;
  }

  // Test 6: Delete book and cascade
  try {
    testDb.prepare('DELETE FROM test_sessions WHERE bookId = 1').run();
    testDb.prepare('DELETE FROM test_notes WHERE bookId = 1').run();
    testDb.prepare('DELETE FROM test_books WHERE id = 1').run();

    const book = testDb.prepare('SELECT * FROM test_books WHERE id = 1').get();
    const sessions = testDb.prepare('SELECT * FROM test_sessions WHERE bookId = 1').all();
    const notes = testDb.prepare('SELECT * FROM test_notes WHERE bookId = 1').all();
    
    if (!book && sessions.length === 0 && notes.length === 0) {
      console.log('✓ Test 6: Delete book and cascade - PASSED');
      passed++;
    } else {
      throw new Error('Delete cascade failed');
    }
  } catch (e) {
    console.error('✗ Test 6: Delete book and cascade - FAILED', e);
    failed++;
  }

  console.log(`\n📊 Результаты тестов БД: ${passed}/${passed + failed} пройдено\n`);
  testDb.close();

  return { passed, failed };
}

export function runValidationTests() {
  console.log('🧪 Запуск тестов валидации...\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Valid book
  try {
    const validBook = { title: 'Test Book', author: 'Author', totalPages: 100 };
    const error = validateBook(validBook);
    if (error === null) {
      console.log('✓ Validation 1: Valid book - PASSED');
      passed++;
    } else {
      throw new Error(error);
    }
  } catch (e) {
    console.error('✗ Validation 1: Valid book - FAILED', e);
    failed++;
  }

  // Test 2: Invalid book (empty title)
  try {
    const invalidBook = { title: '', author: 'Author' };
    const error = validateBook(invalidBook);
    if (error !== null) {
      console.log('✓ Validation 2: Empty title error - PASSED');
      passed++;
    } else {
      throw new Error('Should have failed');
    }
  } catch (e) {
    console.error('✗ Validation 2: Empty title error - FAILED', e);
    failed++;
  }

  // Test 3: Invalid session (negative pages)
  try {
    const invalidSession = { bookId: 1, pagesRead: -5, duration: 30 };
    const error = validateSession(invalidSession);
    if (error !== null) {
      console.log('✓ Validation 3: Negative pages error - PASSED');
      passed++;
    } else {
      throw new Error('Should have failed');
    }
  } catch (e) {
    console.error('✗ Validation 3: Negative pages error - FAILED', e);
    failed++;
  }

  console.log(`\n📊 Результаты тестов валидации: ${passed}/${passed + failed} пройдено\n`);
  return { passed, failed };
}

export function runBusinessLogicTests() {
  console.log('🧪 Запуск тестов бизнес-логики...\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Calculate progress
  try {
    const progress = businessLogic.calculateProgress(50, 100);
    if (progress === 50) {
      console.log('✓ Logic 1: Calculate progress - PASSED');
      passed++;
    } else {
      throw new Error(`Expected 50, got ${progress}`);
    }
  } catch (e) {
    console.error('✗ Logic 1: Calculate progress - FAILED', e);
    failed++;
  }

  // Test 2: Average pages per day
  try {
    const sessions = [
      { bookId: '1', date: '2024-01-01', pagesRead: 20, duration: 30 },
      { bookId: '1', date: '2024-01-02', pagesRead: 25, duration: 40 },
      { bookId: '1', date: '2024-01-03', pagesRead: 30, duration: 50 },
    ];
    const avg = businessLogic.averagePagesPerDay(sessions);
    if (avg === 25) {
      console.log('✓ Logic 2: Average pages per day - PASSED');
      passed++;
    } else {
      throw new Error(`Expected 25, got ${avg}`);
    }
  } catch (e) {
    console.error('✗ Logic 2: Average pages per day - FAILED', e);
    failed++;
  }

  // Test 3: Reading speed
  try {
    const sessions = [
      { bookId: '1', date: '2024-01-01', pagesRead: 60, duration: 60 },
    ];
    const speed = businessLogic.readingSpeed(sessions);
    if (speed === 60) {
      console.log('✓ Logic 3: Reading speed (pages/hour) - PASSED');
      passed++;
    } else {
      throw new Error(`Expected 60, got ${speed}`);
    }
  } catch (e) {
    console.error('✗ Logic 3: Reading speed - FAILED', e);
    failed++;
  }

  console.log(`\n📊 Результаты тестов логики: ${passed}/${passed + failed} пройдено\n`);
  return { passed, failed };
}
