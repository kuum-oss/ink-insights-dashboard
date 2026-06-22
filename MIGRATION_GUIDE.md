# 🚀 Руководство по использованию новых компонентов

## Быстрый старт

### 1. Используя новые Button компоненты

**ДО** (старый подход):
```tsx
<button className="px-3 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-500">
  Сохранить
</button>
```

**ПОСЛЕ** (новый подход):
```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="md">
  Сохранить
</Button>
```

### 2. Используя Badge компоненты

**ДО** (старый подход):
```tsx
<span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-900">
  ✓ Завершено
</span>
```

**ПОСЛЕ** (новый подход):
```tsx
import { Badge } from '@/components/ui/Badge';

<Badge variant="success" icon="✓">
  Завершено
</Badge>
```

### 3. Валидация данных

**ДО** (простая проверка):
```tsx
if (!title) return error('title is required');
```

**ПОСЛЕ** (детальная валидация):
```tsx
import { validateBook } from '@/services/validation';

const error = validateBook({ title, author, totalPages });
if (error) return { error };
```

### 4. Бизнес-логика

**ДО** (не было):
```tsx
// Нужно было считать вручную
```

**ПОСЛЕ** (готовые функции):
```tsx
import { businessLogic } from '@/services/businessLogic';

const progress = businessLogic.calculateProgress(currentPage, totalPages);
const avgPages = businessLogic.averagePagesPerDay(sessions);
const recommendation = businessLogic.getReadingRecommendation(sessions);
```

---

## Миграция компонентов

### BookCard.tsx
```tsx
// Было (старые стили):
<button onClick={submit} className="px-2 py-1 text-xs rounded-md bg-indigo-600 text-white hover:bg-indigo-500">
  Читать
</button>

// Стало (новые компоненты):
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

<a href={`/reader/${book.id}`}>
  <Button variant="primary" size="sm">📖 Читать</Button>
</a>

<Badge variant="info" size="sm" icon="⭐">
  {book.totalPages ? Math.round(...) : '—'}/5
</Badge>
```

### AnalyticsSummary.tsx
```tsx
// Было (одноцветные):
<MetricCard label="Книг за год" value={booksRead} />

// Стало (цветные с иконками):
<MetricCard 
  label="📚 Книг за год" 
  value={booksRead}
  color="indigo"
  icon="📚"
/>
```

### AddBookForm.tsx
```tsx
// Было (всегда видимая форма):
<form onSubmit={submit} className="mb-6 p-4 rounded-2xl ...">
  <div className="flex flex-col sm:flex-row gap-3 items-center">
    {/* поля */}
  </div>
</form>

// Стало (коллапсируемая форма):
<Button variant="primary" onClick={() => setIsOpen(!isOpen)}>
  {isOpen ? '✕ Отмена' : '➕ Добавить книгу'}
</Button>

{isOpen && (
  <form onSubmit={submit} className="mt-4 p-6 rounded-2xl ...">
    <h3 className="text-lg font-semibold mb-4">📚 Добавить новую книгу</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* поля в трёх колончной сетке */}
    </div>
  </form>
)}
```

---

## API Валидация

Все API endpoints теперь автоматически валидируют данные:

```bash
# Успешный запрос
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"1984","author":"Orwell","totalPages":328}'

# Ошибка валидации
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"","author":"Orwell"}'
# → {"error":"Название обязательно"}
```

---

## Примеры кода

### Полный пример компонента

```tsx
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MetricCard } from '@/components/ui/MetricCard';
import { businessLogic } from '@/services/businessLogic';
import { validateBook } from '@/services/validation';

export function BookComponent({ book, sessions }) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progress = businessLogic.calculateProgress(book.currentPage, book.totalPages);
  const avgPages = businessLogic.averagePagesPerDay(sessions);
  const recommendation = businessLogic.getReadingRecommendation(sessions);

  async function handleAddBook(title: string) {
    const validationError = validateBook({ title, totalPages: 100 });
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, totalPages: 100 })
      });
      
      const data = await response.json();
      if (!response.ok) {
        setError(data.error);
      } else {
        console.log('Book added:', data);
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">{book.title}</h1>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <MetricCard label="Прогресс" value={`${progress}%`} color="indigo" />
        <MetricCard label="Стр/день" value={avgPages} color="emerald" />
      </div>

      <div className="flex gap-2 mb-6">
        <Badge variant="success" icon="✓">Завершено</Badge>
        <Badge variant="info" icon="📖">{book.totalPages} стр.</Badge>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
        <p className="text-sm">💡 {recommendation}</p>
      </div>

      <div className="flex gap-2">
        <Button variant="primary" isLoading={isSaving}>
          Сохранить
        </Button>
        <Button variant="ghost">Отмена</Button>
      </div>
    </div>
  );
}
```

---

## Перепроверка

После внедрения новых компонентов:

- [ ] Все кнопки используют `<Button>` компонент
- [ ] Все метки используют `<Badge>` компонент
- [ ] Все метрики используют новый `<MetricCard>`
- [ ] Все запросы валидируют данные через `validate*` функции
- [ ] API endpoints возвращают детальные сообщения об ошибках
- [ ] Бизнес-логика используется для всех расчётов

---

## Структура папок

```
src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx ✨ новое
│   │   ├── Badge.tsx ✨ новое
│   │   ├── MetricCard.tsx 🔄 улучшено
│   │   └── Modal.tsx
│   ├── books/
│   │   ├── BookCard.tsx 🔄 улучшено
│   │   └── AddBookForm.tsx 🔄 улучшено
│   └── analytics/
│       └── AnalyticsSummary.tsx 🔄 улучшено
├── services/
│   ├── validation.ts ✨ новое
│   ├── businessLogic.ts ✨ новое
│   ├── tests.ts ✨ новое
│   └── runTests.ts ✨ новое
└── app/
    └── api/
        ├── books/route.ts 🔄 улучшено
        ├── sessions/route.ts 🔄 улучшено
        └── notes/route.ts 🔄 улучшено
```

---

## FAQ

**Q: Нужно ли обновлять все старые компоненты?**
A: Постепенно да, но это не критично. Новые компоненты полностью совместимы со старыми.

**Q: Как запустить тесты?**
A: Создайте npm скрипт в package.json:
```json
"scripts": {
  "test:db": "node -r ts-node/register src/services/runTests.ts"
}
```

**Q: Поддерживается ли Dark mode?**
A: Да! Все компоненты используют `dark:` префиксы Tailwind.

**Q: Можно ли изменить цвета?**
A: Да, через цветовые схемы `color` prop в MetricCard и вариант `variant` в Badge.

---

## Контакт и поддержка

Для вопросов или проблем смотрите:
- `IMPROVEMENTS.md` - полное описание
- `EXAMPLES.md` - практические примеры
- `src/services/tests.ts` - примеры использования

Создано с ❤️ для улучшения проекта Ink Insights Dashboard.
