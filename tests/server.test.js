const request = require('supertest');
const app = require('../server');

describe('Server Tests', () => {

    describe('GET /api/health', () => {
        it('должен возвращать статус OK', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'OK');
            expect(response.body).toHaveProperty('timestamp');
        });
    });

    describe('GET /', () => {
        it('должен возвращать главную страницу', async () => {
            const response = await request(app)
                .get('/')
                .expect(200);

            expect(response.text).toContain('TechPortal');
        });
    });

    describe('GET /api/csrf-token', () => {
        it('должен возвращать CSRF токен', async () => {
            const response = await request(app)
                .get('/api/csrf-token')
                .expect(200);

            expect(response.body).toHaveProperty('csrfToken');
            expect(response.body.csrfToken).toHaveLength(64);
        });
    });

    describe('POST /api/contact', () => {
        it('должен отклонять запрос без CSRF токена', async () => {
            const response = await request(app)
                .post('/api/contact')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    message: 'Test message'
                })
                .expect(403);

            expect(response.body.success).toBe(false);
        });

        it('должен валидировать email', async () => {
            // Сначала получаем CSRF токен
            const csrfResponse = await request(app)
                .get('/api/csrf-token');

            const response = await request(app)
                .post('/api/contact')
                .set('X-CSRF-Token', csrfResponse.body.csrfToken)
                .send({
                    name: 'Test User',
                    email: 'invalid-email',
                    message: 'Test message'
                })
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('Rate Limiting', () => {
        it('должен применять rate limiting', async () => {
            // Делаем много запросов подряд
            const promises = Array(50).fill().map(() =>
                request(app).get('/api/health')
            );

            const responses = await Promise.all(promises);

            // Некоторые запросы должны быть заблокированы
            const blockedRequests = responses.filter(res => res.status === 429);
            expect(blockedRequests.length).toBeGreaterThan(0);
        });
    });
});

describe('Security Tests', () => {
    describe('Headers', () => {
        it('должен устанавливать безопасные заголовки', async () => {
            const response = await request(app)
                .get('/')
                .expect(200);

            expect(response.headers['x-content-type-options']).toBe('nosniff');
            expect(response.headers['x-frame-options']).toBe('DENY');
            expect(response.headers['x-xss-protection']).toBe('1; mode=block');
        });
    });

    describe('Input Sanitization', () => {
        it('должен санитизировать входные данные', async () => {
            const csrfResponse = await request(app)
                .get('/api/csrf-token');

            const response = await request(app)
                .post('/api/contact')
                .set('X-CSRF-Token', csrfResponse.body.csrfToken)
                .send({
                    name: '<script>alert("xss")</script>Test',
                    email: 'test@example.com',
                    message: 'Normal message'
                })
                .expect(400); // Плохой email или другая ошибка валидации

            // Проверяем что скрипт не выполнился
            expect(response.body.message).not.toContain('<script>');
        });
    });
});
