/**
 * 📚 Примеры использования компонентов и функций
 * 
 * Этот файл содержит примеры того, как использовать новые компоненты,
 * функции валидации и бизнес-логику в приложении Ink Insights.
 */

// ============================================
// 1. ПРИМЕРЫ КОМПОНЕНТОВ UI
// ============================================

/** 
 * Пример 1: Button компонент с разными вариантами
 * 
 * Файл: src/components/ui/Button.tsx
 */
import { Button } from '@/components/ui/Button';

export function ButtonExamples() {
  return (
    <div className="space-y-4 p-6">
      {/* Primary (основной) */}
      <Button variant="primary">Сохранить книгу</Button>

      {/* Secondary (вторичный) */}
      <Button variant="secondary">Отмена</Button>

      {/* Success (успех) */}
      <Button variant="success">✓ Завершить</Button>

      {/* Danger (опасность) */}
      <Button variant="danger">🗑️ Удалить</Button>

      {/* Ghost (прозрачный) */}
      <Button variant="ghost">Дополнительное действие</Button>

      {/* Разные размеры */}
      <div className="flex gap-2">
        <Button size="sm">Маленький</Button>
        <Button size="md">Средний</Button>
        <Button size="lg">Большой</Button>
      </div>

      {/* С загрузкой */}
      <Button isLoading={true}>Загрузка...</Button>

      {/* Как ссылка */}
      <Button as="a" href="/books" variant="primary">
        Все книги
      </Button>
    </div>
  );
}

/**
 * Пример 2: Badge компонент для меток
 * 
 * Файл: src/components/ui/Badge.tsx
 */
import { Badge } from '@/components/ui/Badge';

export function BadgeExamples() {
  return (
    <div className="space-y-4 p-6">
      {/* Разные варианты */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant="default">По умолчанию</Badge>
        <Badge variant="success" icon="✓">Завершено</Badge>
        <Badge variant="warning" icon="⚠️">В прогрессе</Badge>
        <Badge variant="danger" icon="✗">Ошибка</Badge>
        <Badge variant="info" icon="ℹ️">Информация</Badge>
      </div>

      {/* Разные размеры */}
      <div className="flex gap-2">
        <Badge size="sm">Маленький</Badge>
        <Badge size="md">Средний</Badge>
      </div>

      {/* Для статистики */}
      <div className="flex gap-2">
        <Badge variant="info" icon="📚">25 книг</Badge>
        <Badge variant="success" icon="🔥">7 дней</Badge>
        <Badge variant="warning" icon="📖">42 стр./день</Badge>
      </div>
    </div>
  );
}

/**
 * Пример 3: MetricCard компонент для метрик
 * 
 * Файл: src/components/ui/MetricCard.tsx
 */
import { MetricCard } from '@/components/ui/MetricCard';

export function MetricCardExamples() {
  return (
    <div className="grid grid-cols-2 gap-4 p-6">
      {/* Простая метрика */}
      <MetricCard label="Книг в год" value={25} />

      {/* С иконкой и цветом */}
      <MetricCard 
        label="📚 Прочитано" 
        value={42}
        color="indigo"
        icon="📚"
      />

      {/* С трендом */}
      <MetricCard 
        label="📖 Страниц в день" 
        value={35}
        color="emerald"
        trend={12}
      />

      {/* С описанием */}
      <MetricCard 
        label="🔥 Текущий стрик" 
        value={7}
        color="rose"
        description="дней подряд"
        icon="🔥"
      />

      {/* Отрицательный тренд */}
      <MetricCard 
        label="Времени на книгу"
        value="15 дн"
        color="amber"
        trend={-8}
        description="осталось до конца"
      />
    </div>
  );
}

// ============================================
// 2. ПРИМЕРЫ ВАЛИДАЦИИ
// ============================================

import { 
  validateBook, 
  validateSession, 
  validateNote,
  validationRules 
} from '@/services/validation';

export function ValidationExamples() {
  // Пример 1: Валидация книги
  function addBook(title: string, author: string, pages: number) {
    const error = validateBook({ title, author, totalPages: pages });
    
    if (error) {
      console.error('Ошибка валидации:', error);
      // Название: "Название обязательно"
      // Автор: "Имя автора не должно быть длиннее 255 символов"
      // Страницы: "Количество страниц должно быть целым числом"
      return false;
    }

    // Продолжить с сохранением
    return true;
  }

  // Пример 2: Валидация сессии чтения
  function logReadingSession(bookId: number, pages: number, minutes: number) {
    const error = validateSession({ bookId, pagesRead: pages, duration: minutes });
    
    if (error) {
      console.error('Ошибка сессии:', error);
      // "Страницы должны быть числом"
      // "Прочитано должно быть минимум 1 страница"
      // "Длительность должна быть числом"
      return false;
    }

    return true;
  }

  // Пример 3: Валидация заметки
  function saveNote(bookId: number, text: string) {
    const error = validateNote({ bookId, text });
    
    if (error) {
      console.error('Ошибка заметки:', error);
      // "Текст заметки обязателен"
      // "Заметка не может быть пустой"
      // "Заметка слишком длинная"
      return false;
    }

    return true;
  }

  // Пример 4: Использование отдельных правил
  function checkTitle(title: string) {
    const error = validationRules.book.title(title);
    return error;
  }
}

// ============================================
// 3. ПРИМЕРЫ БИЗНЕС-ЛОГИКИ
// ============================================

import { businessLogic } from '@/services/businessLogic';
import type { Book, ReadingSession } from '@/types/types';

export function BusinessLogicExamples() {
  // Пример 1: Расчёт прогресса
  function showProgress(currentPage: number, totalPages: number) {
    const progress = businessLogic.calculateProgress(currentPage, totalPages);
    console.log(`Прогресс: ${progress}%`); // 50%
    
    return progress;
  }

  // Пример 2: Средняя скорость чтения
  function calculateReadingSpeed(sessions: ReadingSession[]) {
    const speed = businessLogic.readingSpeed(sessions);
    console.log(`Скорость: ${speed} страниц в час`);
    
    return speed;
  }

  // Пример 3: Среднее количество страниц в день
  function calculateDailyAverage(sessions: ReadingSession[]) {
    const avg = businessLogic.averagePagesPerDay(sessions);
    console.log(`В среднем: ${avg} страниц в день`);
    
    return avg;
  }

  // Пример 4: Текущая серия дней
  function getStreak(sessions: ReadingSession[]) {
    const streak = businessLogic.currentReadingStreak(sessions);
    console.log(`Стрик: ${streak} дней`);
    
    if (streak >= 30) console.log('🔥 Потрясающая серия!');
    else if (streak >= 7) console.log('⭐ Отличная неделя!');
  }

  // Пример 5: Предполагаемая дата завершения
  function estimateCompletion(book: Book, sessions: ReadingSession[]) {
    const finishDate = businessLogic.estimateFinishDate(book, sessions);
    
    if (finishDate) {
      console.log(`Вероятно завершите: ${finishDate.toLocaleDateString('ru-RU')}`);
      
      const daysLeft = Math.ceil(
        (finishDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      console.log(`Осталось: ${daysLeft} дней`);
    }
    
    return finishDate;
  }

  // Пример 6: Рекомендация по чтению
  function getRecommendation(sessions: ReadingSession[]) {
    const recommendation = businessLogic.getReadingRecommendation(sessions);
    console.log(recommendation);
    // "🔥 Потрясающая серия! Продолжайте в том же духе!"
    // "⭐ Отличная недельная серия!"
    // "📚 Хороший темп чтения!"
    
    return recommendation;
  }

  // Пример 7: Определение жанра
  function detectGenre(title: string, description: string) {
    const genre = businessLogic.inferGenre(title, description);
    console.log(`Жанр: ${genre}`);
    // "🎨 Фантастика"
    // "💀 Ужас"
    // "❤️ Романтика"
    // "📚 Общее"
    
    return genre;
  }
}

// ============================================
// 4. ИНТЕГРАЦИЯ В КОМПОНЕНТЫ
// ============================================

export function BookCardWithNewComponents() {
  return (
    <div className="p-4 border rounded-lg">
      {/* Заголовок с иконкой */}
      <h2 className="text-xl font-bold mb-4">📚 Моя книга</h2>

      {/* Метрики используя новые компоненты */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <MetricCard 
          label="Прогресс" 
          value="50%"
          color="indigo"
        />
        <MetricCard 
          label="Время" 
          value="15 дн"
          color="amber"
        />
      </div>

      {/* Бейджи для статусов */}
      <div className="flex gap-2 mb-4">
        <Badge variant="info" icon="📖">300 стр.</Badge>
        <Badge variant="warning" icon="⏱️">15 мин/день</Badge>
        <Badge variant="success" icon="🔥">7 дней</Badge>
      </div>

      {/* Кнопки */}
      <div className="flex gap-2">
        <Button variant="primary">Продолжить чтение</Button>
        <Button variant="success">Завершить книгу</Button>
        <Button variant="ghost">Удалить</Button>
      </div>
    </div>
  );
}

// ============================================
// 5. ПРИМЕРЫ API ЗАПРОСОВ
// ============================================

/**
 * Все API endpoints автоматически валидируют данные.
 * Если данные невалидны, сервер вернёт ошибку 400.
 */

export async function APIExamples() {
  // ✅ Успешная стрим добавления книги
  const addBookSuccess = async () => {
    const response = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '1984',
        author: 'George Orwell',
        totalPages: 328,
        description: 'Dystopian novel'
      })
    });
    
    const data = await response.json();
    console.log('✓ Книга добавлена:', data);
  };

  // ❌ Ошибка валидации (пустое название)
  const addBookError = async () => {
    const response = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '',
        author: 'George Orwell'
      })
    });
    
    const data = await response.json();
    console.error('✗ Ошибка:', data.error);
    // "Название обязательно"
  };

  // ✅ Добавление сессии чтения
  const addSession = async () => {
    const response = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookId: 1,
        date: new Date().toISOString(),
        pagesRead: 25,
        duration: 45
      })
    });
    
    const data = await response.json();
    console.log('✓ Сессия добавлена:', data);
  };

  // ✅ Добавление заметки
  const addNote = async () => {
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookId: 1,
        date: new Date().toISOString(),
        text: 'Отличное описание антиутопии',
        quote: 'Война - это мир'
      })
    });
    
    const data = await response.json();
    console.log('✓ Заметка добавлена:', data);
  };
}

// ============================================
// 6. ПОЛНЫЙ ПРИМЕР: КОМПОНЕНТ КНИГИ
// ============================================

export function CompleteBookExample({ book, sessions }: any) {
  const progress = businessLogic.calculateProgress(
    book.currentPage, 
    book.totalPages
  );
  
  const avgPages = businessLogic.averagePagesPerDay(sessions);
  const finishDate = businessLogic.estimateFinishDate(book, sessions);
  const recommendation = businessLogic.getReadingRecommendation(sessions);

  return (
    <div className="rounded-lg border p-6 max-w-2xl mx-auto">
      {/* Заголовок */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{book.title}</h1>
        <Badge variant="info" icon="✍️">{book.author}</Badge>
      </div>

      {/* Метрики */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <MetricCard 
          label="Прогресс" 
          value={`${progress}%`}
          color="indigo"
        />
        <MetricCard 
          label="Страниц в день" 
          value={avgPages}
          color="emerald"
        />
        <MetricCard 
          label="Осталось дней" 
          value={finishDate ? 
            Math.ceil((finishDate.getTime() - new Date().getTime()) / 86400000) 
            : '—'}
          color="amber"
        />
      </div>

      {/* Рекомендация */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          💡 {recommendation}
        </p>
      </div>

      {/* Действия */}
      <div className="flex gap-2">
        <Button variant="primary">📖 Продолжить</Button>
        <Button variant="success">✓ Завершить</Button>
        <Button variant="ghost">ℹ️ Детали</Button>
      </div>
    </div>
  );
}
