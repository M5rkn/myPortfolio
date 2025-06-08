# CSS Architecture Documentation

## Структура CSS файлов

Этот проект использует модульную архитектуру CSS для лучшей организации, поддержки и масштабируемости кода.

### Файловая структура

```
/css
├── index.css          # Главный файл, импортирует все модули
├── main.css           # Переменные, reset, базовые стили
├── components.css     # Компоненты (навигация, кнопки, формы)
├── sections.css       # Секции сайта (hero, portfolio, services)
├── widgets.css        # Виджеты (чат, модалы)
├── animations.css     # Анимации и интерактивные эффекты
├── scrollbar.css      # Кастомные скроллбары
├── responsive.css     # Медиа-запросы и мобильная адаптация
└── README.md          # Документация
```

### Описание модулей

#### 1. `main.css` - Основа
- CSS переменные (цвета, размеры, отступы)
- Reset стили
- Типографика
- Утилитарные классы
- Базовая доступность

#### 2. `components.css` - Компоненты
- Preloader
- Навигация
- Кнопки всех типов
- Формы и поля ввода
- Мобильное меню

#### 3. `sections.css` - Секции
- Hero секция с particles.js
- Portfolio grid
- Services карточки
- About секция
- Contact форма
- Footer

#### 4. `widgets.css` - Виджеты
- Модальные окна
- Чат виджет
- Lazy loading изображений

#### 5. `animations.css` - Анимации
- 3D эффекты
- Scroll анимации
- Интерактивные элементы
- Текстовые эффекты
- Оптимизации производительности

#### 6. `scrollbar.css` - Скроллбары
- Кастомный дизайн скроллбаров
- Адаптивные размеры
- Тематические цвета
- Firefox поддержка

#### 7. `responsive.css` - Адаптивность
- Планшетные стили (768px-1024px)
- Мобильные стили (≤768px)
- Малые экраны (≤480px)
- Специальные случаи (landscape, touch)

### CSS Переменные

```css
:root {
  /* Цвета */
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  
  /* Фоны */
  --bg-primary: #0a0a0a;
  --bg-secondary: #1a1a1a;
  
  /* Текст */
  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
  
  /* Отступы */
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 2rem;
  --spacing-lg: 4rem;
  --spacing-xl: 8rem;
  
  /* Переходы */
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

### Принципы организации

#### 1. **Модульность**
Каждый файл отвечает за конкретную область функциональности

#### 2. **Последовательность импорта**
Файлы импортируются в порядке от общего к частному:
1. Переменные и основа
2. Компоненты
3. Секции
4. Виджеты
5. Анимации
6. Скролл
7. Адаптивность

#### 3. **CSS Переменные**
Все значения централизованы в `main.css` для легкого изменения темы

#### 4. **Mobile First**
Адаптивный дизайн с приоритетом мобильных устройств

#### 5. **Производительность**
- GPU ускорение для анимаций
- Оптимизация will-change
- Contain для изоляции
- Reduced motion поддержка

### Соглашения о именовании

#### BEM методология
```css
.block {}
.block__element {}
.block--modifier {}
```

#### Префиксы состояний
```css
.is-active {}
.has-error {}
.was-validated {}
```

#### Утилитарные классы
```css
.flex {}
.grid {}
.hidden {}
.fade-in {}
```

### Медиа-запросы

```css
/* Планшеты */
@media (min-width: 481px) and (max-width: 768px) {}

/* Мобильные */
@media (max-width: 768px) {}

/* Малые мобильные */
@media (max-width: 480px) {}

/* Очень малые */
@media (max-width: 360px) {}

/* Десктоп */
@media (min-width: 1200px) {}
```

### Доступность

- Поддержка `prefers-reduced-motion`
- Поддержка `prefers-contrast`
- Focus состояния
- Screen reader классы
- Skip links

### Оптимизация

#### Критический CSS
Основные стили загружаются первыми для быстрого рендеринга

#### Ленивая загрузка
Анимации и декоративные элементы загружаются по мере необходимости

#### Производительность
```css
.performance-optimized {
  contain: layout style paint;
  will-change: auto;
  transform: translate3d(0, 0, 0);
}
```

### Как добавить новые стили

1. **Определите категорию** - к какому модулю относится стиль
2. **Используйте переменные** - не хардкодьте значения
3. **Следуйте BEM** - для новых компонентов
4. **Тестируйте адаптивность** - проверьте на всех экранах
5. **Оптимизируйте** - добавьте необходимые оптимизации

### Инструменты разработки

#### Дебаг классы
```css
.debug { border: 1px solid red !important; }
.debug * { border: 1px solid blue !important; }
```

#### Утилиты видимости
```css
.hidden { display: none !important; }
.fade-in { animation: fadeIn 0.5s ease forwards; }
.slide-up { animation: slideUp 0.5s ease forwards; }
```

### Поддержка браузеров

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

### Производительность

- Общий размер CSS: ~150KB
- Критический CSS: ~30KB
- Время загрузки: <100ms
- Поддержка HTTP/2 для параллельной загрузки модулей 