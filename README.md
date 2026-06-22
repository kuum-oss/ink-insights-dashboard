# Ink Insights Dashboard

![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3-sky?logo=tailwind-css)

Минималистичный дашборд для отслеживания чтения: прогресс, заметки и аналитика с интерфейсом, удобным для E-Ink ридеров.

Ключевая идея — простая, но мощная панель для читателей: быстрый ввод сессий, заметки/цитаты, визуализация активности и встроенный ридер (PDF / EPUB / TXT).

---

## Быстрый старт

1. Клонировать и установить зависимости:

```bash
git clone <repo-url>
cd ink-insights-dashboard
npm install
```

2. Запустить в режиме разработки:

```bash
npm run dev
```

3. Открыть: http://localhost:3000

Совет: на главной есть кнопка "Demo mode" для быстрого наполнения примерными книгами и сессиями.

---

## Что внутри (кратко)

- Frontend: Next.js (App Router), React + TypeScript, Tailwind CSS.
- Backend: простой SQLite (better-sqlite3) через server-side API (Next.js route handlers).
- Хук `useLibrary` — бизнес-логика: загрузка книг, сессий, заметок, рекомендации, прогнозы.
- Reader: интеграция pdfjs (pdfjs-dist) и epub.js, текстовый reader для .txt.

---

## Фичи (основные)

- Карточки книг: обложка, прогресс-бар, % прочитано, оставшиеся страницы, кнопки Читать / Завершить / Редактировать / Удалить.
- Reading sessions: добавление сессий (дата, страницы, длительность) и накопление статистики.
- Reader: PDF (canvas + текстовый слой, поиск и подсветка), EPUB (epub.js), TXT (текст + разбиение по страницам).
- Heatmap активности, графики страниц по дням, рекомендации и уведомления.
- Demo mode для демонстрации возможностей.

---

## API (кратко)

- GET /api/books — список книг
- POST /api/books — создать книгу (title, author, totalPages, coverUrl, contentUrl)
- GET /api/books/:id — получить книгу
- PUT /api/books/:id — обновить (title, author, progress, read, ...)
- DELETE /api/books/:id — удалить
- GET /api/sessions — список сессий
- POST /api/sessions — добавить сессию (bookId, date, pagesRead, duration)
- GET /api/notes — список заметок
- POST /api/notes — добавить заметку (bookId, date, text, quote)
- POST /api/books/upload — загрузка файлов (обложка / PDF / EPUB / TXT) -> сохраняются в public/uploads и возвращают url

---

## Reader (коротко)

- PDF: рендер через pdfjs, canvas + текстовый слой для точного выделения и поиска. Наличие подсветки совпадений и навигации по найденным результатам.
- EPUB: встраивается через epub.js (prev/next, рендер в контейнер).
- TXT: загружается полностью и делится на виртуальные «страницы» для удобства перелистывания.

---

## Разработка и тестирование

- Код бизнес-логики — в `src/hooks/useLibrary.ts`.
- UI: `src/components/books/BookCard.tsx`, `ProgressGrid.tsx`.
- Reader: `src/components/reader/PdfReader.tsx`, `EpubReader.tsx`.

Рекомендации при локальной разработке:
- Убедитесь, что `data/` и `public/uploads` доступны для записи (DB и загруженные файлы).
- Если TypeScript жалуется на нативные модули (better-sqlite3, pdfjs-dist), можно добавить простые декларации (`declare module '...'`) в `src/types`.

---

## Что можно улучшить дальше

- Автосохранение позиции чтения (cfi / page) и восстановление при повторном открытии.
- Улучшения PDF: текстовый слой с поиском в WebWorker, thumbnails, аннотации.
- Заметки / highlights напрямую в Reader (epub.js annotations).
- Экспорт/импорт данных (JSON/PDF/CSV), OCR-поддержка для изображений.

---

## Вклад и коммиты

Если хотите помочь, создавайте PR с маленькими, целенаправленными патчами. Перед мерджем проверяйте локально `npm run dev` и делайте минимальные тесты функциональности.

---

## Лицензия

MIT

---

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
