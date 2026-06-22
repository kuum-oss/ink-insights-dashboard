import { Book, ReadingSession } from '@/types/types';

export const businessLogic = {
  /**
   * Вычисляет предполагаемую дату завершения книги
   */
  estimateFinishDate(book: Book, sessions: ReadingSession[]): Date | null {
    if (!book.totalPages || book.currentPage >= book.totalPages) return null;

    const bookSessions = sessions.filter(s => String(s.bookId) === String(book.id));
    if (bookSessions.length === 0) return null;

    const totalPagesRead = bookSessions.reduce((sum, s) => sum + s.pagesRead, 0);
    const totalDaysSpent = new Set(bookSessions.map(s => s.date.split('T')[0])).size;

    if (totalDaysSpent === 0) return null;

    const avgPagesPerDay = totalPagesRead / totalDaysSpent;
    if (avgPagesPerDay <= 0) return null;

    const remainingPages = book.totalPages - book.currentPage;
    const daysRemaining = Math.ceil(remainingPages / avgPagesPerDay);

    const finishDate = new Date();
    finishDate.setDate(finishDate.getDate() + daysRemaining);

    return finishDate;
  },

  /**
   * Вычисляет среднюю скорость чтения (страницы в час)
   */
  readingSpeed(sessions: ReadingSession[]): number {
    if (sessions.length === 0) return 0;

    const totalPages = sessions.reduce((sum, s) => sum + s.pagesRead, 0);
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);

    if (totalMinutes === 0) return 0;

    return Math.round((totalPages / totalMinutes) * 60 * 100) / 100;
  },

  /**
   * Вычисляет среднее количество страниц в день
   */
  averagePagesPerDay(sessions: ReadingSession[]): number {
    if (sessions.length === 0) return 0;

    const totalPages = sessions.reduce((sum, s) => sum + s.pagesRead, 0);
    const uniqueDays = new Set(sessions.map(s => s.date.split('T')[0]));

    if (uniqueDays.size === 0) return 0;

    return Math.round(totalPages / uniqueDays.size * 100) / 100;
  },

  /**
   * Вычисляет текущую серию дней с чтением
   */
  currentReadingStreak(sessions: ReadingSession[]): number {
    if (sessions.length === 0) return 0;

    const dates = Array.from(new Set(sessions.map(s => s.date.split('T')[0]))).sort();

    let streak = 1;
    for (let i = dates.length - 1; i > 0; i--) {
      const current = new Date(dates[i]);
      const prev = new Date(dates[i - 1]);
      const diff = (current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

      if (diff === 1) streak++;
      else break;
    }

    return streak;
  },

  /**
   * Определяет, достигнута ли дневная цель чтения
   */
  isDailyGoalMet(dailyGoal: number, sessionsToday: ReadingSession[]): boolean {
    const todayPages = sessionsToday.reduce((sum, s) => sum + s.pagesRead, 0);
    return todayPages >= dailyGoal;
  },

  /**
   * Рассчитывает прогресс в процентах
   */
  calculateProgress(currentPage: number, totalPages: number): number {
    if (totalPages <= 0) return 0;
    return Math.min(100, Math.max(0, Math.round((currentPage / totalPages) * 100)));
  },

  /**
   * Определяет, нужна ли поощрительная рекомендация
   */
  shouldRecommend(book: Book, sessions: ReadingSession[]): boolean {
    const progress = this.calculateProgress(book.currentPage, book.totalPages);
    const bookSessions = sessions.filter(s => String(s.bookId) === String(book.id));
    
    // Рекомендуем, если:
    // 1. Прогресс между 20% и 80%
    // 2. Было минимум 3 сессии
    return progress >= 20 && progress <= 80 && bookSessions.length >= 3;
  },

  /**
   * Получает рекомендацию по стилю чтения
   */
  getReadingRecommendation(sessions: ReadingSession[]): string {
    if (sessions.length === 0) return 'Начните с первой книги!';

    const speed = this.readingSpeed(sessions);
    const avgPages = this.averagePagesPerDay(sessions);
    const streak = this.currentReadingStreak(sessions);

    if (streak >= 30) return '🔥 Потрясающая серия! Продолжайте в том же духе!';
    if (streak >= 7) return '⭐ Отличная недельная серия!';
    if (avgPages > 50) return '🚀 Вы читаете быстро - 50+ страниц в день!';
    if (avgPages > 20) return '📚 Хороший темп чтения!';
    if (avgPages > 0) return '✓ Продолжайте читать регулярно!';

    return '💡 Советуем планировать чтение каждый день';
  },

  /**
   * Определяет жанр на основе содержания (простая версия)
   */
  inferGenre(title: string, description: string): string {
    const text = (title + ' ' + description).toLowerCase();
    
    const genres: { [key: string]: string[] } = {
      '🎨 Фантастика': ['фантастика', 'fantasy', 'sci-fi', 'космос'],
      '💀 Ужас': ['ужас', 'horror', 'страх', 'ужасы'],
      '❤️ Романтика': ['любовь', 'romance', 'романтик', 'амур'],
      '🔎 Детектив': ['детектив', 'mystery', 'убийство', 'преступление'],
      '🌍 История': ['история', 'historical', 'век', 'эпоха'],
      '📖 Проза': ['проза', 'роман', 'novel', 'prose'],
    };

    for (const [genre, keywords] of Object.entries(genres)) {
      if (keywords.some(kw => text.includes(kw))) {
        return genre;
      }
    }

    return '📚 Общее';
  },
};
