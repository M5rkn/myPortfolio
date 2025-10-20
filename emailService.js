const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = null;
        this.isEnabled = false;
        this.fromEmail = process.env.EMAIL_FROM;
        this.fromName = process.env.EMAIL_FROM_NAME || 'TechPortal';

        this.init();
    }

    init() {
        try {
            // Проверяем наличие необходимых переменных
            if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
                console.log('📧 Email: SMTP настройки не найдены, отправка email отключена');
                return;
            }

            // Создаем транспортер
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT) || 587,
                secure: (process.env.SMTP_PORT == '465'), // true для 465, false для других портов
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                },
                tls: {
                    rejectUnauthorized: false // Для самоподписанных сертификатов
                }
            });

            this.isEnabled = true;
            console.log('✅ Email сервис инициализирован');

            // Проверка подключения
            this.verifyConnection();

        } catch (error) {
            console.error('❌ Ошибка инициализации email сервиса:', error.message);
            this.isEnabled = false;
        }
    }

    async verifyConnection() {
        if (!this.transporter) return false;

        try {
            await this.transporter.verify();
            console.log('✅ SMTP соединение проверено успешно');
            return true;
        } catch (error) {
            console.error('❌ Ошибка SMTP соединения:', error.message);
            this.isEnabled = false;
            return false;
        }
    }

    // Отправка ответа клиенту
    async sendReply(to, subject, message, originalContact) {
        if (!this.isEnabled || !this.transporter) {
            throw new Error('Email сервис не настроен');
        }

        try {
            // Безопасность: проверяем email получателя
            if (!this.isValidEmail(to)) {
                throw new Error('Неверный email адрес получателя');
            }

            // Формируем HTML версию письма
            const htmlMessage = this.formatReplyHTML(message, originalContact);

            const mailOptions = {
                from: `"${this.fromName}" <${this.fromEmail}>`,
                to: to,
                subject: subject,
                text: message, // Текстовая версия
                html: htmlMessage, // HTML версия
                replyTo: process.env.SMTP_USER, // Для ответов
                headers: {
                    'X-Mailer': 'TechPortal Admin Panel',
                    'X-Priority': '3'
                }
            };

            const info = await this.transporter.sendMail(mailOptions);

            console.log('📧 Email отправлен:', {
                to: to,
                subject: subject,
                messageId: info.messageId
            });

            return {
                success: true,
                messageId: info.messageId,
                response: info.response
            };

        } catch (error) {
            console.error('❌ Ошибка отправки email:', error.message);
            throw error;
        }
    }

    // Форматирование HTML письма
    formatReplyHTML(message, originalContact) {
        const formattedMessage = message.replace(/\n/g, '<br>');

        return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ответ от TechPortal</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
        }
        .message {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin: 20px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .original-message {
            margin-top: 30px;
            padding: 15px;
            background: #f1f3f4;
            border-radius: 8px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>TechPortal</h1>
            <p>Ответ на ваше сообщение</p>
        </div>
        
        <p>Здравствуйте, ${this.escapeHtml(originalContact.name)}!</p>
        
        <p>Спасибо за ваше обращение. Вот мой ответ:</p>
        
        <div class="message">
            ${formattedMessage}
        </div>
        
        ${originalContact ? `
        <div class="original-message">
            <strong>Ваше исходное сообщение:</strong><br>
            <em>"${this.escapeHtml(originalContact.message)}"</em><br>
            <small>Отправлено: ${new Date(originalContact.createdAt).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}</small>
        </div>
        ` : ''}
        
        <div class="footer">
            <p>С уважением,<br>Команда TechPortal</p>
            <p>
                <small>
                    Это автоматическое письмо от ${process.env.SITE_URL || 'TechPortal'}<br>
                    Для ответа используйте кнопку "Ответить" в вашем почтовом клиенте
                </small>
            </p>
        </div>
    </div>
</body>
</html>
        `;
    }

    // Проверка валидности email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) && email.length <= 254;
    }

    // Экранирование HTML
    escapeHtml(text) {
        if (typeof text !== 'string') return text;
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Проверка доступности сервиса
    isAvailable() {
        return this.isEnabled && this.transporter !== null;
    }

    // Получение конфигурации (без паролей)
    getConfig() {
        return {
            enabled: this.isEnabled,
            fromEmail: this.fromEmail,
            fromName: this.fromName,
            smtpHost: process.env.SMTP_HOST || null,
            smtpPort: process.env.SMTP_PORT || null
        };
    }

    // Отправка тестового письма
    async sendTestEmail(to) {
        if (!this.isEnabled) {
            throw new Error('Email сервис не настроен');
        }

        const testMessage = `
Это тестовое письмо от TechPortal Admin Panel.

Если вы получили это письмо, значит email интеграция работает корректно.

Время отправки: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}
Сервер: ${process.env.SITE_URL || 'localhost'}
        `;

        return await this.sendReply(
            to,
            'Тестовое письмо от TechPortal',
            testMessage,
            {
                name: 'Администратор',
                message: 'Тестовое сообщение',
                createdAt: new Date()
            }
        );
    }
}

module.exports = new EmailService();
