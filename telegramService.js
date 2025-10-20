const TelegramBot = require('node-telegram-bot-api');

class TelegramService {
    constructor() {
        this.bot = null;
        this.adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
        this.isEnabled = false;

        this.init();
    }

    init() {
        try {
            const token = process.env.TELEGRAM_BOT_TOKEN;

            if (!token || !this.adminChatId) {
                console.log('Telegram: токен или admin chat ID не настроены, Telegram интеграция отключена');
                return;
            }

            // Создаем бота с polling только в development
            const isDev = process.env.NODE_ENV !== 'production';
            this.bot = new TelegramBot(token, {
                polling: isDev,
                webHook: !isDev
            });

            this.isEnabled = true;
            console.log('✅ Telegram Bot инициализирован');

            // Настройка команд
            this.setupCommands();

        } catch (error) {
            console.error('❌ Ошибка инициализации Telegram бота:', error.message);
            this.isEnabled = false;
        }
    }

    setupCommands() {
        if (!this.bot) return;

        // Команда /start
        this.bot.onText(/\/start/, (msg) => {
            const chatId = msg.chat.id;
            const welcomeMessage = `
🎯 *TechPortal Bot*

Привет! Я бот портфолио TechPortal.

*Доступные команды:*
/status - Статус сайта
/stats - Статистика сайта
/help - Помощь

_Этот бот используется для уведомлений и управления._
            `;

            this.bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
        });

        // Команда /help
        this.bot.onText(/\/help/, (msg) => {
            const chatId = msg.chat.id;
            const helpMessage = `
📖 *Помощь TechPortal Bot*

*Команды:*
/start - Запуск бота
/status - Проверить статус сайта
/stats - Показать статистику
/help - Эта справка

*Функции:*
• Уведомления о новых сообщениях
• Мониторинг статуса сайта
• Статистика проектов

_Для дополнительной помощи обратитесь к администратору._
            `;

            this.bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
        });

        // Команда /status
        this.bot.onText(/\/status/, (msg) => {
            const chatId = msg.chat.id;
            const statusMessage = `
✅ *Статус сайта: Активен*

🌐 Сайт: ${process.env.SITE_URL || 'https://techportal.up.railway.app'}
⚡ Сервер: Railway
🔄 Uptime: ${Math.floor(process.uptime() / 60)} минут

_Последняя проверка: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}_
            `;

            this.bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
        });

        console.log('📋 Telegram команды настроены');
    }

    // Отправка уведомления о новом сообщении
    async notifyNewContact(contact) {
        if (!this.isEnabled || !this.bot) return false;

        try {
            const message = `
🔔 *Новое сообщение с сайта!*

👤 *Имя:* ${this.escapeMarkdown(contact.name)}
📧 *Email:* ${this.escapeMarkdown(contact.email)}
💬 *Сообщение:*
${this.escapeMarkdown(contact.message)}

🕐 *Время:* ${new Date(contact.createdAt).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}
🌐 *IP:* ${contact.ipAddress || 'N/A'}

_Ответьте клиенту через панель администратора или напрямую по email._
            `;

            await this.bot.sendMessage(this.adminChatId, message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });

            console.log('📬 Telegram уведомление о новом контакте отправлено');
            return true;

        } catch (error) {
            console.error('❌ Ошибка отправки Telegram уведомления:', error.message);
            return false;
        }
    }

    // Отправка статистики
    async sendStats(stats) {
        if (!this.isEnabled || !this.bot) return false;

        try {
            const message = `
📊 *Статистика TechPortal*

📝 *Контакты:*
• Всего: ${stats.totalContacts}
• Новые: ${stats.newContacts}
• Непрочитанные: ${stats.unreadContacts}

👁 *Просмотры проектов:*
${stats.projectViews.map(p => `• ${p.name}: ${p.views}`).join('\n')}

🕐 *Обновлено:* ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}
            `;

            await this.bot.sendMessage(this.adminChatId, message, {
                parse_mode: 'Markdown'
            });

            return true;

        } catch (error) {
            console.error('❌ Ошибка отправки статистики:', error.message);
            return false;
        }
    }

    // Отправка уведомления об ошибке
    async notifyError(error, context = '') {
        if (!this.isEnabled || !this.bot) return false;

        try {
            const message = `
🚨 *Ошибка на сайте!*

⚠️ *Контекст:* ${context}
📝 *Ошибка:* ${this.escapeMarkdown(error.message)}
🕐 *Время:* ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}

_Требуется внимание администратора._
            `;

            await this.bot.sendMessage(this.adminChatId, message, {
                parse_mode: 'Markdown'
            });

            return true;

        } catch (telegramError) {
            console.error('❌ Ошибка отправки уведомления об ошибке:', telegramError.message);
            return false;
        }
    }

    // Настройка webhook для production
    async setupWebhook(webhookUrl) {
        if (!this.bot || process.env.NODE_ENV !== 'production') return;

        try {
            await this.bot.setWebHook(`${webhookUrl}/telegram-webhook`);
            console.log('🔗 Telegram webhook настроен:', `${webhookUrl}/telegram-webhook`);
        } catch (error) {
            console.error('❌ Ошибка настройки webhook:', error.message);
        }
    }

    // Обработка webhook
    handleWebhook(req, res) {
        if (!this.bot) {
            return res.status(500).json({ error: 'Bot not initialized' });
        }

        try {
            this.bot.processUpdate(req.body);
            res.status(200).json({ ok: true });
        } catch (error) {
            console.error('❌ Ошибка обработки webhook:', error.message);
            res.status(500).json({ error: 'Webhook processing failed' });
        }
    }

    // Экранирование Markdown символов
    escapeMarkdown(text) {
        if (typeof text !== 'string') return text;
        return text.replace(/([_*\\[\]()~`>#+-=|{}.!])/g, '\\$1');
    }

    // Проверка доступности бота
    isAvailable() {
        return this.isEnabled && this.bot !== null;
    }

    // Получение информации о боте
    async getBotInfo() {
        if (!this.bot) return null;

        try {
            return await this.bot.getMe();
        } catch (error) {
            console.error('❌ Ошибка получения информации о боте:', error.message);
            return null;
        }
    }
}

module.exports = new TelegramService();
