const winston = require('winston');
const path = require('path');

// Определяем уровни логирования
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
};

// Цвета для разных уровней
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white'
};

winston.addColors(colors);

// Формат логов
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

// Создаем транспорты
const transports = [
    // Логи в консоль
    new winston.transports.Console({
        format: format,
        level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
    }),

    // Логи ошибок в файл
    new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        )
    }),

    // Все логи в файл
    new winston.transports.File({
        filename: 'logs/combined.log',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        )
    })
];

// Создаем logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels,
    format,
    transports,
    exitOnError: false
});

// HTTP middleware для логирования запросов
logger.stream = {
    write: (message) => {
        logger.http(message.trim());
    }
};

// Функция для логирования ошибок с контекстом
logger.logError = (error, context = {}) => {
    logger.error({
        message: error.message,
        stack: error.stack,
        ...context
    });
};

// Функция для логирования безопасности
logger.logSecurity = (event, details = {}) => {
    logger.warn({
        type: 'SECURITY_EVENT',
        event,
        timestamp: new Date().toISOString(),
        ...details
    });
};

module.exports = logger;
