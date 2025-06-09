# 📊 Настройка CRM интеграции

## Google Sheets CRM (Рекомендуется)

### Пошаговая настройка:

1. **Создайте Google Sheet**:
   - Перейдите на [Google Sheets](https://docs.google.com/spreadsheets/)
   - Создайте новую таблицу
   - Назовите её "CRM - Заявки с сайта"
   - Скопируйте ID из URL (например: `1BxiMVs0XRA5nFMdKvBdBZj...`)

2. **Создайте Service Account**:
   - Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
   - Создайте новый проект или выберите существующий
   - Включите Google Sheets API
   - Создайте Service Account:
     - IAM & Admin → Service Accounts → Create Service Account
     - Назовите: `crm-integration`
     - Создайте ключ (JSON format)

3. **Настройте переменные окружения**:
```bash
# В файле .env добавьте:
GOOGLE_SHEET_ID=your_sheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----"
```

4. **Дайте доступ Service Account к таблице**:
   - Откройте созданную Google Sheet
   - Нажмите "Поделиться"
   - Добавьте email вашего Service Account с правами "Редактор"

### Установка зависимостей:
```bash
npm install google-spreadsheet google-auth-library
```

## 🚀 Дополнительные CRM опции

### Airtable (Альтернатива)
```bash
# Установка
npm install airtable

# Переменные окружения
AIRTABLE_API_KEY=your_api_key
AIRTABLE_BASE_ID=your_base_id
AIRTABLE_TABLE_NAME=Leads
```

### Notion Database
```bash
# Установка
npm install @notionhq/client

# Переменные окружения
NOTION_TOKEN=your_integration_token
NOTION_DATABASE_ID=your_database_id
```

### Webhook для внешних CRM
```bash
# Переменные окружения
CRM_WEBHOOK_URL=https://your-crm.com/webhook
CRM_WEBHOOK_SECRET=your_webhook_secret
```

## 📈 Преимущества CRM интеграции

- ✅ Автоматическое сохранение всех заявок
- ✅ Трекинг IP адресов и User Agent
- ✅ Возможность анализа конверсии
- ✅ Экспорт данных для отчётов
- ✅ Интеграция с другими системами

## 🔧 Функции

Система автоматически сохраняет:
- Дату и время заявки
- Имя клиента
- Email
- Сообщение
- IP адрес
- User Agent (браузер)
- Статус заявки (Новая/В работе/Закрыта)

## ⚡ Быстрый старт

1. Скопируйте пример настроек:
```bash
cp .env.example .env
```

2. Заполните переменные CRM в .env файле

3. Перезапустите сервер:
```bash
npm restart
```

4. Проверьте логи - должно появиться "✅ Google Sheets CRM интеграция активна"

## 🎯 Следующие шаги

После настройки CRM рекомендую:
- Настроить автоматические отчёты
- Добавить сегментацию клиентов
- Интегрировать с email рассылками
- Настроить аналитику конверсий 