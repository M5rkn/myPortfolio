// Jest test setup file
require('dotenv').config();

// Настройка переменных окружения для тестов
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/portfolio_test';
process.env.JWT_SECRET = 'test-secret-key-for-jwt';
process.env.ADMIN_PASSWORD = 'TestPassword123!';

// Увеличиваем timeout для тестов
jest.setTimeout(10000);

// Подавляем некоторые логи в тестах
const originalConsole = console;
global.console = {
    ...originalConsole,
    // Оставляем важные логи
    log: originalConsole.log,
    error: originalConsole.error,
    warn: originalConsole.warn,
    // Подавляем info в тестах
    info: jest.fn()
};
