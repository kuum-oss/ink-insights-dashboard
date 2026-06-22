# Ink Insights Dashboard

![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3-sky?logo=tailwind-css)

Краткое описание

Ink Insights — минималистичное приложение для отслеживания чтения: книги, сессии, заметки и аналитика. Подходит для локальной работы и демонстрации UX (включая E‑Ink режимы). Встроенный ридер поддерживает PDF, EPUB и TXT.

Содержание README
- Быстрый старт
- Стек
- Команды для разработки
- Работа с локальной БД (SQLite)
- Ключевые API
- Reader: возможности
- Разработка и структура кода
- Бэкапы и восстановление

---

## Стек

- Next.js (App Router)
- React + TypeScript (strict)
- Tailwind CSS, Framer Motion
- PDF: pdfjs-dist (canvas + текстовый слой)
- EPUB: epub.js
- DB: SQLite (better-sqlite3), файл `data/books.db`
- Загрузки: `public/uploads`

---

## Быстрый старт (локально)

1) Клонировать и установить зависимости

```bash
git clone <repo-url>
cd ink-insights-dashboard
npm install
```

2) Создать папки и запустить dev сервер

```bash
mkdir -p data public/uploads backups
npm run dev
```

3) Открыть UI: http://localhost:3000

Нажмите "Demo mode" для моментального наполнения тестовыми данными.

---

## Команды

- npm run dev — запуск в режиме разработки
- npm run build — сборка
- npm run start — запуск собранного приложения
- npx tsc --noEmit — TypeScript check
- npm run lint — линтинг

---

## Локальная БД (SQLite)

Файл базы: `data/books.db`.

Основные SQL‑команды:

```bash
# Список таблиц
sqlite3 data/books.db ".tables"

# Схема таблицы books
sqlite3 data/books.db ".schema books"

# Просмотреть последние 20 сессий
sqlite3 -header -column data/books.db "SELECT * FROM sessions ORDER BY date DESC LIMIT 20;"

# Экспорт books в CSV
sqlite3 -header -csv data/books.db "SELECT * FROM books;" > books.csv
```

Бэкап и восстановление:

```bash
# безопасный бэкап (работает при запущенном сервере)
sqlite3 data/books.db ".backup 'backups/books-$(date +%F).db'"

# копирование (остановите сервер для консистентности)
mkdir -p backups && cp data/books.db backups/books-$(date +%F).db

# дамп SQL
sqlite3 data/books.db .dump > dump.sql

# восстановление
sqlite3 data/books.db < dump.sql
```

Рекомендуется использовать `.backup` для live‑бэкапов и GUI (DB Browser) для инспекции.

---

## API (кратко)

- GET /api/books
- POST /api/books { title, author, totalPages, coverUrl?, contentUrl? }
- GET /api/books/:id
- PUT /api/books/:id { progress?, read?, ... }
- DELETE /api/books/:id
- GET /api/sessions
- POST /api/sessions { bookId, date, pagesRead, duration }
- GET /api/notes
- POST /api/notes { bookId, date, text, quote }
- POST /api/books/upload — загрузка файлов (возвращает url в public/uploads)

---

## Reader (возможности)

- PDF: canvas рендер + текстовый слой, поиск, подсветка, навигация и зум.
- EPUB: чтение через epub.js (prev/next), возможность расширения (TOC, закладки).
- TXT: разделение на виртуальные страницы, удобное перелистывание.

---

## Структура кода (важные файлы)

- src/hooks/useLibrary.ts — бизнес-логика
- src/components/books/BookCard.tsx — UI карточки книги
- src/components/books/ProgressGrid.tsx — сетка карточек
- src/components/reader/PdfReader.tsx — PDF reader (pdfjs)
- src/components/reader/EpubReader.tsx — EPUB reader (epub.js)
- src/app/api/* — серверные route handlers (API)

---

## Дев‑советы

- Убедитесь, что `data/` и `public/uploads` доступны для записи.
- Для нативных типов (better‑sqlite3, pdfjs) можно добавить простые d.ts в `src/types`.
- Используйте .backup для бэкапов при работающем сервере.

---

## Дальнейшие улучшения

- Сохранение позиции чтения (page / CFI) и восстановление
- Поиск PDF в WebWorker, thumbnails, аннотации и highlights
- Экспорт/импорт данных (JSON / CSV)

---

## Лицензия

MIT

---

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>