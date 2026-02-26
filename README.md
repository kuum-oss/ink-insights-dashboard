# E-Ink Insights Dashboard


![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.3-sky?logo=tailwind-css)


Минималистичный аналитический дашборд для отслеживания прогресса чтения, вдохновлённый эстетикой **E-Ink устройств (PocketBook)** и принципами функционального минимализма.

Проект построен на **Next.js (App Router)** с акцентом на:

* читаемость,
* строгую типизацию,
* чистую архитектуру,
* адаптацию под экраны с низкой частотой обновления.

---

## ✨ Основные возможности

* 📚 **Визуализация прогресса чтения**

  * текущие книги
  * завершённые книги
* 📊 **Аналитика**

  * книг прочитано за период
  * среднее количество страниц в день
  * текущий reading-streak (дни подряд)
* 🗓 **Reading Heatmap**

  * календарь активности чтения за последние 90 дней (GitHub-style)
* 🕯 **Темы оформления**

  * Paper Mode (светлая)
  * Night Mode (тёмная)
* 📆 **Estimated Finish Date**

  * расчёт даты завершения книги на основе средней скорости чтения

---

## 🧱 Технологический стек

* **Next.js 14+** (App Router)
* **React 18**
* **TypeScript (strict)**
* **Tailwind CSS**
* **Framer Motion** (минимальные анимации)
* **JetBrains Mono** (цифры и метрики)

---

## 🧠 Архитектура

Проект следует принципам:

* разделения ответственности
* Container / Presenter
* минимального состояния в UI

### Ключевые решения:

* бизнес-логика вынесена в кастомный хук `useLibrary`
* UI-компоненты максимально «глупые»
* строгие типы для всех доменных сущностей
* client/server boundary явно обозначен (`"use client"`)

---

## 📁 Структура проекта

```
src/
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx
│  └─ Dashboard.tsx
├─ components/
│  ├─ analytics/
│  ├─ books/
│  ├─ heatmap/
│  └─ ui/
├─ hooks/
│  └─ useLibrary.ts
├─ theme/
│  └─ ThemeProvider.tsx
├─ types/
│  └─ types.ts
└─ utils/
   └─ date.ts
```

---

## 📦 Модель данных

```ts
interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  totalPages: number;
  currentPage: number;
  genre: string;
}

interface ReadingSession {
  bookId: string;
  date: string; // ISO
  pagesRead: number;
  duration: number; // minutes
}
```

---

## 🚀 Запуск проекта

### Предварительные требования

Убедитесь, что у вас установлен [Node.js](https://nodejs.org/) (рекомендуется версия 18 или новее).

### Установка

1. Склонируйте репозиторий:
   ```bash
   git clone <repository-url>
   cd ink-insights-dashboard
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```

### Разработка

Запустите сервер разработки:
```bash
npm run dev
```

Проект будет доступен по адресу: [http://localhost:3000](http://localhost:3000) (или на другом свободном порту, например 3001).

### Сборка и запуск в продакшене

1. Соберите проект:
   ```bash
   npm run build
   ```

2. Запустите собранное приложение:
   ```bash
   npm run start
   ```

---

## 🖥 Особенности для E-Ink

* высокий контраст цветов
* минимум анимаций
* поддержка `prefers-reduced-motion`
* приоритет типографики над декоративными элементами

---

## 🧭 Планы развития

* LocalStorage / IndexedDB
* Импорт статистики из PocketBook
* Offline-first режим
* Экспорт данных (CSV / JSON)
* Полноценный E-Ink режим без hover-анимаций

---

## 📄 Лицензия

MIT

---

## 👤 Автор

Разработано как архитектурный и исследовательский проект
с фокусом на чистый frontend и реальные пользовательские устройства.
