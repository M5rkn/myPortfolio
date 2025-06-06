# Инструкция по деплою

## Railway (рекомендуется)

1. Подключите GitHub репозиторий к Railway
2. Установите переменные окружения:
   ```
   NODE_ENV=production
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-secret-key
   ADMIN_PASSWORD=your-secure-password
   SITE_URL=https://your-app.up.railway.app
   ```
3. Railway автоматически запустит приложение

## Docker

```bash
# Сборка образа
docker build -t portfolio-app .

# Запуск контейнера
docker run -p 8080:8080 \
  -e NODE_ENV=production \
  -e MONGODB_URI=your-mongodb-uri \
  -e JWT_SECRET=your-secret \
  portfolio-app
```

## Локальный деплой

```bash
# Установка зависимостей
npm ci --only=production

# Настройка переменных окружения
cp env.example .env
# Отредактируйте .env файл

# Запуск
npm start
```

## Переменные окружения

- `NODE_ENV` - Режим работы (production/development)
- `PORT` - Порт сервера (по умолчанию 3000)
- `MONGODB_URI` - Строка подключения к MongoDB
- `JWT_SECRET` - Секретный ключ для JWT токенов
- `ADMIN_PASSWORD` - Пароль администратора
- `SITE_URL` - URL вашего сайта для SEO
- `FRONTEND_URL` - URL фронтенда для CORS

## Мониторинг

- Health check: `GET /api/health`
- Логи безопасности выводятся в консоль
- Автоматическая очистка токенов и кэша

## Безопасность

- Все пароли хэшируются с bcrypt
- JWT токены с коротким временем жизни
- Rate limiting на все endpoints
- CSRF защита
- Валидация всех входящих данных
- Защита от NoSQL инъекций 