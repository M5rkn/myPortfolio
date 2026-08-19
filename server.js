const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const crypto = require('crypto');
const validator = require('validator');
const compression = require('compression');
const morgan = require('morgan');
const logger = require('./logger');
const { sql, initDB } = require('./db');
require('dotenv').config();

const telegramService = require('./telegramService');
const emailService = require('./emailService');

const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD_NEW = process.env.ADMIN_PASSWORD_NEW;

app.set('trust proxy', 1);

app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    noSniff: true,
    frameguard: { action: 'deny' },
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    permittedCrossDomainPolicies: false,
    dnsPrefetchControl: true
}));

app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Server', 'TechPortal');

    if (req.path.endsWith('.html') || req.path === '/') {
        res.setHeader('Content-Security-Policy',
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' https://unpkg.com/ https://cdn.jsdelivr.net/ https://cdnjs.cloudflare.com/ https://www.googletagmanager.com https://www.google-analytics.com; " +
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
            "font-src 'self' https://fonts.gstatic.com; " +
            "img-src 'self' data: blob: https://www.google-analytics.com; " +
            "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com; " +
            "base-uri 'self'; form-action 'self'; object-src 'none'; media-src 'self';"
        );
    }
    next();
});

app.use((req, res, next) => {
    if (req.path.endsWith('.html') || req.path === '/') {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
    next();
});

app.use(compression());

app.use(morgan('combined', {
    stream: logger.stream,
    skip: (req) => req.url.includes('/api/health')
}));

const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 150,
    message: { success: false, message: 'Слишком много запросов, попробуйте позже' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) =>
        req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|woff|woff2|svg|webp|html)$/) ||
        req.url === '/' || req.url === '/index.html' ||
        req.url === '/profile.html' || req.url === '/login.html' ||
        req.path === '/api/user/logout' || req.path === '/api/csrf-token'
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { success: false, message: 'API rate limit exceeded' },
    skip: (req) => req.path === '/api/user/logout'
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Слишком много попыток входа, попробуйте позже' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === 'GET' && req.path === '/api/csrf-token'
});

app.use(strictLimiter);

const isVercel = process.env.VERCEL;
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8080',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (isVercel && (origin.includes('vercel.app') || origin.includes('.vercel.app'))) {
            return callback(null, true);
        }
        if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
        console.warn(`CORS warning: Origin ${origin} not in whitelist`);
        return callback(null, !!isVercel);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['X-CSRF-Token'],
    preflightContinue: false,
    optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10kb', strict: true, type: 'application/json' }));
app.use(express.urlencoded({ extended: false, limit: '10kb', parameterLimit: 100 }));

app.use('/api', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
});

const sanitizeInput = (req, res, next) => {
    const sanitize = (obj) => {
        for (let key in obj) {
            if (typeof obj[key] === 'string') {
                obj[key] = obj[key].trim()
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/javascript:/gi, '')
                    .replace(/on\w+\s*=/gi, '')
                    .replace(/data:/gi, '');
                if (obj[key].length > 1000) obj[key] = obj[key].substring(0, 1000);
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitize(obj[key]);
            }
        }
    };
    if (req.body) sanitize(req.body);
    if (req.query) sanitize(req.query);
    if (req.params) sanitize(req.params);
    next();
};

app.use(sanitizeInput);

// CSRF
const csrfTokens = new Map();
const generateCSRFToken = () => crypto.randomBytes(32).toString('hex');

setInterval(() => {
    const now = Date.now();
    for (const [token, timestamp] of csrfTokens.entries()) {
        if (now - timestamp > 10 * 60 * 1000) csrfTokens.delete(token);
    }
}, 10 * 60 * 1000);

const validateCSRFToken = (req, res, next) => {
    const token = req.headers['x-csrf-token'];
    if (!token) return res.status(403).json({ success: false, message: 'CSRF token required' });
    if (csrfTokens.has(token) || token.match(/^[a-f0-9]{64}$/)) return next();
    if (!csrfTokens.has(token)) {
        return res.status(403).json({ success: false, message: 'CSRF token validation failed' });
    }
    next();
};

const tokenBlacklist = new Set();

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

if (process.env.NODE_ENV === 'production') {
    console.log('🔍 Vercel Debug Info:');
    console.log('- ADMIN_EMAIL exists:', !!process.env.ADMIN_EMAIL);
    console.log('- ADMIN_PASSWORD_NEW exists:', !!process.env.ADMIN_PASSWORD_NEW);
    console.log('- DATABASE_URL exists:', !!process.env.DATABASE_URL);
    if (!process.env.DATABASE_URL) {
        console.warn('⚠️ DATABASE_URL не настроен! Добавьте его в Vercel env vars.');
    }
}

// Декодирование кириллических имён
const decodeName = (name) => {
    if (!name || typeof name !== 'string') return name;
    if (/[ÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/.test(name)) {
        try {
            const decoded = Buffer.from(name, 'latin1').toString('utf8');
            if (/^[А-Яа-яЁё\w\s\-\.]+$/.test(decoded)) return decoded;
        } catch (e) {
            console.warn('Ошибка декодирования имени:', e.message);
        }
    }
    return name;
};

// Хелперы для работы с БД
const isValidId = (id) => {
    const n = parseInt(id);
    return !isNaN(n) && n > 0;
};

async function updateUserDailyStreak(userId, isAdmin = false, adminEmail = null) {
    try {
        let user;

        if (isAdmin && adminEmail) {
            const rows = await sql`SELECT * FROM users WHERE email = ${adminEmail.toLowerCase()} LIMIT 1`;
            if (rows.length === 0) {
                const created = await sql`
                    INSERT INTO users (name, email, password, role, daily_streak, is_active)
                    VALUES (${adminEmail.split('@')[0]}, ${adminEmail.toLowerCase()}, 'admin_placeholder', 'admin', 0, true)
                    ON CONFLICT (email) DO NOTHING
                    RETURNING *
                `;
                user = created[0] || (await sql`SELECT * FROM users WHERE email = ${adminEmail.toLowerCase()} LIMIT 1`)[0];
            } else {
                user = rows[0];
            }
        } else {
            const rows = await sql`SELECT * FROM users WHERE id = ${parseInt(userId)} LIMIT 1`;
            user = rows[0];
        }

        if (!user) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastVisit = user.last_visit_date ? new Date(user.last_visit_date) : null;
        if (lastVisit) lastVisit.setHours(0, 0, 0, 0);

        if (lastVisit && lastVisit.getTime() === today.getTime()) {
            return { streak: user.daily_streak, discount: user.bonus_discount, hasBonus: user.bonus_discount > 0 && user.streak_expiry > new Date() };
        }

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let newStreak = user.daily_streak;
        if (lastVisit && lastVisit.getTime() === yesterday.getTime()) {
            newStreak += 1;
        } else if (!lastVisit || lastVisit.getTime() < yesterday.getTime()) {
            newStreak = 1;
        }

        let bonusDiscount = user.bonus_discount;
        let streakExpiry = user.streak_expiry;

        if (!isAdmin && newStreak >= 7) {
            bonusDiscount = 15;
            streakExpiry = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        }

        await sql`
            UPDATE users SET
                daily_streak = ${newStreak},
                last_visit_date = NOW(),
                bonus_discount = ${bonusDiscount},
                streak_expiry = ${streakExpiry},
                updated_at = NOW()
            WHERE id = ${user.id}
        `;

        return { streak: newStreak, discount: bonusDiscount, hasBonus: bonusDiscount > 0 && streakExpiry > new Date() };
    } catch (error) {
        console.error('Error updating daily streak:', error);
    }
}

// Telegram webhook
app.post('/telegram-webhook', express.json({ limit: '10mb' }), (req, res) => {
    try {
        telegramService.handleWebhook(req, res);
    } catch (error) {
        console.error('❌ Ошибка Telegram webhook:', error.message);
        res.status(400).json({ error: 'Invalid request' });
    }
});

app.use(express.static('.', {
    dotfiles: 'deny',
    index: false,
    redirect: false,
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        if (filePath.endsWith('.js')) res.setHeader('Content-Type', 'application/javascript');
        else if (filePath.endsWith('.css')) res.setHeader('Content-Type', 'text/css');

        if (/(\.css|\.js|\.svg|\.png|\.jpg|\.jpeg|\.gif|\.webp|\.ico|\.woff2?|\.ttf)$/i.test(filePath)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (/(\.html)$/i.test(filePath)) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        } else {
            res.setHeader('Cache-Control', 'public, max-age=300');
        }
    }
}));

// Auth middleware
const authenticateAdmin = (req, res, next) => {
    const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, message: 'Требуется авторизация' });
    if (tokenBlacklist.has(token)) return res.status(401).json({ success: false, message: 'Токен недействителен' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (Date.now() - decoded.timestamp > 24 * 60 * 60 * 1000) throw new Error('Token expired');
        if (decoded.admin || decoded.role === 'admin') {
            req.admin = decoded;
            req.adminToken = token;
            return next();
        }
        throw new Error('Admin access required');
    } catch {
        return res.status(401).json({ success: false, message: 'Недействительный токен' });
    }
};

const authenticateUser = (req, res, next) => {
    const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, message: 'Требуется авторизация' });
    if (tokenBlacklist.has(token)) return res.status(401).json({ success: false, message: 'Токен недействителен' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (Date.now() - decoded.timestamp > 24 * 60 * 60 * 1000) throw new Error('Token expired');
        req.user = decoded;
        req.userToken = token;
        return next();
    } catch {
        return res.status(401).json({ success: false, message: 'Недействительный токен' });
    }
};

const handleError = (res, error, userMessage = 'Ошибка сервера') => {
    console.error('Server error:', error.message);
    res.status(500).json({
        success: false,
        message: userMessage,
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
};

const validateContactInput = (name, email, message) => {
    const errors = [];
    if (!name || !validator.isLength(name, { min: 2, max: 50 })) errors.push('Имя должно содержать от 2 до 50 символов');
    if (!email || !validator.isEmail(email) || email.length > 254) errors.push('Некорректный email адрес');
    if (!message || !validator.isLength(message, { min: 10, max: 1000 })) errors.push('Сообщение должно содержать от 10 до 1000 символов');
    return errors;
};

const getClientIP = (req) => req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ===== ROUTES =====

app.get('/api/csrf-token', (req, res) => {
    const token = generateCSRFToken();
    csrfTokens.set(token, Date.now());
    if (csrfTokens.size > 100) {
        const oldest = Array.from(csrfTokens.keys())[0];
        csrfTokens.delete(oldest);
    }
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json({ success: true, csrfToken: token, timestamp: Date.now() });
});

app.get('/api/debug/users', asyncHandler(async (req, res) => {
    try {
        const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM users`;
        const users = await sql`SELECT id, email, name, role, is_active, created_at FROM users LIMIT 5`;
        res.json({ success: true, userCount: count, sampleUsers: users });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
}));

app.get('/api/debug/auth-status', (req, res) => {
    res.json({ success: true, ip: getClientIP(req), timestamp: new Date().toISOString(), message: 'Сервер доступен' });
});

// Admin login
app.post('/api/admin/login', loginLimiter, validateCSRFToken, asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ success: false, message: 'Email и пароль обязательны' });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: 'Некорректный email адрес' });
        }

        const clientIP = getClientIP(req);

        if (ADMIN_EMAIL && email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            const isValidPassword = ADMIN_PASSWORD_NEW && password === ADMIN_PASSWORD_NEW;
            if (!isValidPassword) {
                console.warn(`Failed admin login from IP: ${clientIP}`);
                return res.status(401).json({ success: false, message: 'Неверные данные для входа' });
            }

            const token = jwt.sign({
                userId: null, admin: true, email, name: email.split('@')[0],
                role: 'admin', isAdmin: true, timestamp: Date.now(),
                ip: clientIP, sessionId: crypto.randomBytes(16).toString('hex')
            }, JWT_SECRET, { expiresIn: '24h', issuer: 'TechPortal', audience: 'admin' });

            try {
                await Promise.race([
                    updateUserDailyStreak(null, true, email),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
                ]);
            } catch { /* продолжаем без стрика */ }

            return res.json({ success: true, message: 'Успешная авторизация', token });
        }

        const [user] = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase()} AND is_active = true LIMIT 1`;
        if (!user) return res.status(401).json({ success: false, message: 'Неверные данные для входа' });

        if (user.lock_until && new Date(user.lock_until) > new Date()) {
            return res.status(423).json({ success: false, message: 'Аккаунт временно заблокирован' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            const attempts = user.login_attempts + 1;
            const lockUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
            await sql`UPDATE users SET login_attempts = ${attempts}, lock_until = ${lockUntil} WHERE id = ${user.id}`;
            return res.status(401).json({ success: false, message: 'Неверные данные для входа' });
        }

        await sql`UPDATE users SET login_attempts = 0, lock_until = NULL, last_login = NOW(), updated_at = NOW() WHERE id = ${user.id}`;

        const token = jwt.sign({
            userId: user.id.toString(), email: user.email,
            name: decodeName(user.name), role: user.role, isAdmin: false,
            timestamp: Date.now(), ip: clientIP, sessionId: crypto.randomBytes(16).toString('hex')
        }, JWT_SECRET, { expiresIn: '24h', issuer: 'TechPortal', audience: 'user' });

        res.json({ success: true, message: 'Успешная авторизация', token, user: { email: user.email, role: user.role } });
    } catch (error) {
        handleError(res, error);
    }
}));

// User registration (admin route kept for compat)
app.post('/api/admin/register', loginLimiter, validateCSRFToken, asyncHandler(async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Имя, email и пароль обязательны' });
        if (name.length < 2 || name.length > 50) return res.status(400).json({ success: false, message: 'Имя должно содержать от 2 до 50 символов' });
        if (!validator.isEmail(email)) return res.status(400).json({ success: false, message: 'Некорректный email адрес' });
        if (password.length < 8 || password.length > 128) return res.status(400).json({ success: false, message: 'Пароль должен содержать от 8 до 128 символов' });
        if (ADMIN_EMAIL && email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return res.status(403).json({ success: false, message: 'Регистрация на этот email запрещена' });

        const [existing] = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()} LIMIT 1`;
        if (existing) return res.status(409).json({ success: false, message: 'Пользователь с таким email уже существует' });

        const hashedPassword = await bcrypt.hash(password, 12);
        await sql`INSERT INTO users (name, email, password, role) VALUES (${name.trim()}, ${email.toLowerCase()}, ${hashedPassword}, 'user')`;

        res.json({ success: true, message: 'Регистрация успешна! Теперь вы можете войти в систему.' });
    } catch (error) {
        if (error.code === '23505') return res.status(409).json({ success: false, message: 'Пользователь с таким email уже существует' });
        handleError(res, error);
    }
}));

app.post('/api/admin/logout', authenticateAdmin, (req, res) => {
    tokenBlacklist.add(req.adminToken);
    if (tokenBlacklist.size > 1000) tokenBlacklist.clear();
    res.json({ success: true, message: 'Выход выполнен' });
});

// User login
app.post('/api/user/login', loginLimiter, validateCSRFToken, asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: 'Email и пароль обязательны' });

        const [user] = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase()} LIMIT 1`;
        if (!user) return res.status(401).json({ success: false, message: 'Неверный email или пароль' });

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) return res.status(401).json({ success: false, message: 'Неверный email или пароль' });

        try {
            await Promise.race([
                updateUserDailyStreak(user.id.toString()),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
            ]);
        } catch { /* продолжаем */ }

        const token = jwt.sign({
            userId: user.id.toString(), email: user.email,
            name: decodeName(user.name), role: user.role || 'user',
            timestamp: Date.now()
        }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            success: true, message: 'Вход выполнен успешно', token,
            user: { id: user.id, name: decodeName(user.name), email: user.email, role: user.role || 'user' }
        });
    } catch (error) {
        handleError(res, error);
    }
}));

// User register
app.post('/api/user/register', loginLimiter, validateCSRFToken, asyncHandler(async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Имя, email и пароль обязательны' });
        if (name.length < 2 || name.length > 50) return res.status(400).json({ success: false, message: 'Имя должно содержать от 2 до 50 символов' });
        if (!validator.isEmail(email)) return res.status(400).json({ success: false, message: 'Некорректный email адрес' });
        if (password.length < 8 || password.length > 128) return res.status(400).json({ success: false, message: 'Пароль должен содержать от 8 до 128 символов' });
        if (ADMIN_EMAIL && email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return res.status(403).json({ success: false, message: 'Регистрация на этот email запрещена' });

        const [existing] = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()} LIMIT 1`;
        if (existing) return res.status(409).json({ success: false, message: 'Пользователь с таким email уже существует' });

        const hashedPassword = await bcrypt.hash(password, 12);
        await sql`INSERT INTO users (name, email, password, role) VALUES (${name.trim()}, ${email.toLowerCase()}, ${hashedPassword}, 'user')`;

        res.json({ success: true, message: 'Регистрация успешна! Теперь вы можете войти в систему.' });
    } catch (error) {
        if (error.code === '23505') return res.status(409).json({ success: false, message: 'Пользователь с таким email уже существует' });
        handleError(res, error);
    }
}));

app.post('/api/user/logout', authenticateUser, asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
        tokenBlacklist.add(token);
        if (tokenBlacklist.size > 1000) {
            const arr = Array.from(tokenBlacklist);
            tokenBlacklist.clear();
            arr.slice(-500).forEach(t => tokenBlacklist.add(t));
        }
    }
    res.json({ success: true, message: 'Успешный выход' });
}));

// Contact form
app.post('/api/contact', apiLimiter, validateCSRFToken, async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const errors = validateContactInput(name, email, message);
        if (errors.length > 0) return res.status(400).json({ success: false, message: 'Ошибки валидации', errors });

        const spamPatterns = [/viagra|casino|poker|loan|credit/i, /http[s]?:\/\//i, /\b(?:\w+\.){2,}\w+\b/i];
        if (spamPatterns.some(p => p.test(name + ' ' + email + ' ' + message))) {
            return res.status(400).json({ success: false, message: 'Сообщение отклонено' });
        }

        const clientIP = getClientIP(req);
        const [{ count }] = await sql`
            SELECT COUNT(*)::int AS count FROM contacts
            WHERE ip_address = ${clientIP} AND created_at > NOW() - INTERVAL '1 hour'
        `;
        if (count >= 3) return res.status(429).json({ success: false, message: 'Слишком много сообщений с этого IP' });

        const [contact] = await sql`
            INSERT INTO contacts (name, email, message, ip_address)
            VALUES (${name.trim().slice(0, 50)}, ${validator.normalizeEmail(email.trim()).slice(0, 254)}, ${message.trim().slice(0, 1000)}, ${clientIP})
            RETURNING *
        `;

        telegramService.notifyNewContact(contact);
        res.json({ success: true, message: 'Сообщение отправлено! Я свяжусь с вами в ближайшее время.' });
    } catch (error) {
        handleError(res, error);
    }
});

// Admin: get contacts
app.get('/api/admin/contacts', authenticateAdmin, async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
        const offset = (page - 1) * limit;

        const [contacts, [{ total }]] = await Promise.all([
            sql`SELECT * FROM contacts ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
            sql`SELECT COUNT(*)::int AS total FROM contacts`
        ]);

        res.json({
            success: true,
            contacts: contacts.map(c => ({ ...c, name: decodeName(c.name) })),
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        handleError(res, error);
    }
});

app.patch('/api/admin/contacts/:id/read', authenticateAdmin, async (req, res) => {
    try {
        if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: 'Недействительный ID' });
        const [result] = await sql`UPDATE contacts SET is_read = true WHERE id = ${parseInt(req.params.id)} RETURNING id`;
        if (!result) return res.status(404).json({ success: false, message: 'Контакт не найден' });
        res.json({ success: true });
    } catch (error) {
        handleError(res, error);
    }
});

app.delete('/api/admin/contacts/:id', authenticateAdmin, async (req, res) => {
    try {
        if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: 'Недействительный ID' });
        const [result] = await sql`DELETE FROM contacts WHERE id = ${parseInt(req.params.id)} RETURNING id`;
        if (!result) return res.status(404).json({ success: false, message: 'Контакт не найден' });
        res.json({ success: true });
    } catch (error) {
        handleError(res, error);
    }
});

// Admin: reply to contact
app.post('/api/admin/contacts/:id/reply', authenticateAdmin, async (req, res) => {
    try {
        if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: 'Недействительный ID контакта' });
        const { subject, message } = req.body;
        if (!subject || !message) return res.status(400).json({ success: false, message: 'Тема и сообщение обязательны' });
        if (subject.length > 200 || message.length > 5000) return res.status(400).json({ success: false, message: 'Тема или сообщение слишком длинные' });

        const [contact] = await sql`SELECT * FROM contacts WHERE id = ${parseInt(req.params.id)} LIMIT 1`;
        if (!contact) return res.status(404).json({ success: false, message: 'Контакт не найден' });
        if (!emailService.isAvailable()) return res.status(400).json({ success: false, message: 'Email сервис не настроен.' });

        await emailService.sendReply(contact.email, subject, message, contact);
        await sql`UPDATE contacts SET is_read = true WHERE id = ${contact.id}`;

        if (telegramService.isAvailable()) {
            const msg = `📧 *Отправлен ответ клиенту*\n👤 *Клиент:* ${telegramService.escapeMarkdown(contact.name)}\n📧 *Email:* ${telegramService.escapeMarkdown(contact.email)}\n📝 *Тема:* ${telegramService.escapeMarkdown(subject)}`;
            telegramService.bot.sendMessage(telegramService.adminChatId, msg, { parse_mode: 'Markdown' }).catch(e => console.error('Telegram error:', e.message));
        }

        res.json({ success: true, message: 'Ответ успешно отправлен' });
    } catch (error) {
        handleError(res, error, 'Ошибка отправки ответа клиенту');
    }
});

// Telegram admin routes
app.get('/api/admin/telegram/status', authenticateAdmin, async (req, res) => {
    try {
        const botInfo = await telegramService.getBotInfo();
        res.json({ success: true, telegram: { enabled: telegramService.isAvailable(), botInfo, adminChatId: telegramService.adminChatId ? '***настроен***' : null } });
    } catch (error) {
        handleError(res, error);
    }
});

app.post('/api/admin/telegram/test', authenticateAdmin, async (req, res) => {
    try {
        if (!telegramService.isAvailable()) return res.status(400).json({ success: false, message: 'Telegram интеграция не настроена' });
        const sent = await telegramService.notifyNewContact({ name: 'Тестовый пользователь', email: 'test@example.com', message: 'Тестовое сообщение.', created_at: new Date(), ip_address: '127.0.0.1' });
        res.json({ success: sent, message: sent ? 'Тестовое уведомление отправлено' : 'Ошибка отправки' });
    } catch (error) {
        handleError(res, error);
    }
});

app.post('/api/admin/telegram/stats', authenticateAdmin, async (req, res) => {
    try {
        if (!telegramService.isAvailable()) return res.status(400).json({ success: false, message: 'Telegram интеграция не настроена' });

        const [[{ total: totalContacts }], [{ count: newContacts }], [{ count: unreadContacts }], projectViews] = await Promise.all([
            sql`SELECT COUNT(*)::int AS total FROM contacts`,
            sql`SELECT COUNT(*)::int AS count FROM contacts WHERE created_at > NOW() - INTERVAL '24 hours'`,
            sql`SELECT COUNT(*)::int AS count FROM contacts WHERE is_read = false`,
            sql`SELECT project_id, views FROM project_views`
        ]);

        const projectNames = { 'project-1': 'Интернет-магазин', 'project-2': 'Лендинг с анимациями', 'project-3': 'Система авторизации', 'project-4': 'Корпоративный блог', 'project-5': 'WordPress + Custom', 'project-6': 'PSD → верстка' };
        const stats = { totalContacts, newContacts, unreadContacts, projectViews: projectViews.map(pv => ({ name: projectNames[pv.project_id] || pv.project_id, views: pv.views })) };

        const sent = await telegramService.sendStats(stats);
        res.json({ success: sent, message: sent ? 'Статистика отправлена в Telegram' : 'Ошибка отправки', stats });
    } catch (error) {
        handleError(res, error);
    }
});

// Email admin routes
app.get('/api/admin/email/status', authenticateAdmin, async (req, res) => {
    res.json({ success: true, email: emailService.getConfig() });
});

app.post('/api/admin/email/test', authenticateAdmin, async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Email адрес обязателен' });
        if (!emailService.isAvailable()) return res.status(400).json({ success: false, message: 'Email сервис не настроен' });
        await emailService.sendTestEmail(email);
        res.json({ success: true, message: 'Тестовое письмо отправлено' });
    } catch (error) {
        handleError(res, error, 'Ошибка отправки тестового письма');
    }
});

// Project views
app.post('/api/projects/:id/view', apiLimiter, async (req, res) => {
    try {
        const projectId = req.params.id;
        if (!/^project-[1-6]$/.test(projectId)) return res.status(400).json({ success: false, message: 'Недействительный ID проекта' });

        const [existing] = await sql`SELECT * FROM project_views WHERE project_id = ${projectId} LIMIT 1`;

        if (existing) {
            const timeSince = Date.now() - new Date(existing.last_viewed).getTime();
            if (timeSince < 2000) return res.json({ success: true, views: existing.views });
            const [updated] = await sql`UPDATE project_views SET views = LEAST(views + 1, 999999), last_viewed = NOW() WHERE project_id = ${projectId} RETURNING views`;
            return res.json({ success: true, views: updated.views });
        }

        await sql`INSERT INTO project_views (project_id, views) VALUES (${projectId}, 1) ON CONFLICT (project_id) DO UPDATE SET views = project_views.views + 1, last_viewed = NOW()`;
        res.json({ success: true, views: 1 });
    } catch (error) {
        handleError(res, error);
    }
});

app.get('/api/projects/:id/views', async (req, res) => {
    try {
        const projectId = req.params.id;
        if (!/^project-[1-6]$/.test(projectId)) return res.status(400).json({ success: false, message: 'Недействительный ID проекта' });
        const [row] = await sql`SELECT views FROM project_views WHERE project_id = ${projectId} LIMIT 1`;
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.json({ success: true, views: row ? Math.max(0, row.views) : 0 });
    } catch (error) {
        handleError(res, error);
    }
});

app.post('/api/projects/:id/like', apiLimiter, validateCSRFToken, async (req, res) => {
    try {
        const projectId = req.params.id;
        if (!/^project-[1-6]$/.test(projectId)) return res.status(400).json({ success: false, message: 'Недействительный ID проекта' });

        const [existing] = await sql`SELECT * FROM project_likes WHERE project_id = ${projectId} LIMIT 1`;
        if (existing) {
            if (Date.now() - new Date(existing.last_liked).getTime() < 10000) return res.json({ success: true, likes: existing.likes });
            const [updated] = await sql`UPDATE project_likes SET likes = LEAST(likes + 1, 999999), last_liked = NOW() WHERE project_id = ${projectId} RETURNING likes`;
            return res.json({ success: true, likes: updated.likes });
        }

        await sql`INSERT INTO project_likes (project_id, likes) VALUES (${projectId}, 1) ON CONFLICT (project_id) DO UPDATE SET likes = project_likes.likes + 1, last_liked = NOW()`;
        res.json({ success: true, likes: 1 });
    } catch (error) {
        handleError(res, error);
    }
});

app.get('/api/projects/:id/likes', async (req, res) => {
    try {
        const projectId = req.params.id;
        if (!/^project-[1-6]$/.test(projectId)) return res.status(400).json({ success: false, message: 'Недействительный ID проекта' });
        const [row] = await sql`SELECT likes FROM project_likes WHERE project_id = ${projectId} LIMIT 1`;
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.json({ success: true, likes: row ? Math.max(0, row.likes) : 0 });
    } catch (error) {
        handleError(res, error);
    }
});

// User profile
app.get('/api/user/profile', authenticateUser, asyncHandler(async (req, res) => {
    try {
        if (!req.user.userId || req.user.isAdmin || req.user.role === 'admin') {
            return res.status(403).json({ success: false, message: 'Доступ только для обычных пользователей' });
        }

        await updateUserDailyStreak(req.user.userId);

        const [user] = await sql`SELECT id, name, email, role, daily_streak, bonus_discount, streak_expiry, created_at FROM users WHERE id = ${parseInt(req.user.userId)} LIMIT 1`;
        if (!user) return res.status(404).json({ success: false, message: 'Пользователь не найден' });

        const hasActiveBonus = user.bonus_discount > 0 && user.streak_expiry && new Date(user.streak_expiry) > new Date();
        if (!hasActiveBonus && user.bonus_discount > 0) {
            await sql`UPDATE users SET bonus_discount = 0, streak_expiry = NULL WHERE id = ${user.id}`;
        }

        const [[{ count: calculationsCount }], [{ count: ordersCount }]] = await Promise.all([
            sql`SELECT COUNT(*)::int AS count FROM calculations WHERE user_id = ${req.user.userId}`,
            sql`SELECT COUNT(*)::int AS count FROM orders WHERE user_id = ${req.user.userId}`
        ]);

        const joinDays = Math.ceil((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24));

        res.json({
            success: true,
            user: { name: decodeName(user.name), email: user.email, createdAt: user.created_at },
            stats: { calculationsCount, ordersCount, joinDays },
            bonus: {
                dailyStreak: user.daily_streak,
                bonusDiscount: hasActiveBonus ? user.bonus_discount : 0,
                hasActiveBonus,
                streakExpiry: user.streak_expiry,
                daysUntilBonus: Math.max(0, 7 - user.daily_streak)
            }
        });
    } catch (error) {
        handleError(res, error, 'Ошибка загрузки профиля');
    }
}));

// Admin profile
app.get('/api/admin/profile', authenticateUser, asyncHandler(async (req, res) => {
    try {
        if (!req.user.isAdmin && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Доступ только для администраторов' });
        }

        const streakInfo = await updateUserDailyStreak(null, true, req.user.email);

        const [adminUser] = await sql`SELECT created_at FROM users WHERE email = ${req.user.email} LIMIT 1`;
        const joinDays = adminUser ? Math.ceil((new Date() - new Date(adminUser.created_at)) / (1000 * 60 * 60 * 24)) : 1;

        const [[{ count: totalUsers }], [{ count: totalCalculations }], [{ count: totalContacts }]] = await Promise.all([
            sql`SELECT COUNT(*)::int AS count FROM users WHERE role != 'admin'`,
            sql`SELECT COUNT(*)::int AS count FROM calculations`,
            sql`SELECT COUNT(*)::int AS count FROM contacts`
        ]);

        res.json({
            success: true,
            user: { name: req.user.name, email: req.user.email, role: 'admin' },
            stats: { calculationsCount: totalCalculations, ordersCount: 0, joinDays, totalUsers },
            bonus: { dailyStreak: streakInfo?.streak || 0, bonusDiscount: 0, hasActiveBonus: false, streakExpiry: null, daysUntilBonus: 0 }
        });
    } catch (error) {
        handleError(res, error, 'Ошибка загрузки профиля');
    }
}));

// Calculations
app.get('/api/user/calculations', authenticateUser, asyncHandler(async (req, res) => {
    try {
        const userIdentifier = req.user.userId || req.user.email || 'admin';
        const calculations = await sql`SELECT * FROM calculations WHERE user_id = ${userIdentifier} ORDER BY created_at DESC LIMIT 50`;
        res.json(calculations);
    } catch (error) {
        handleError(res, error, 'Ошибка загрузки расчетов');
    }
}));

app.post('/api/user/calculations', authenticateUser, asyncHandler(async (req, res) => {
    try {
        const userIdentifier = req.user.userId || req.user.email || 'admin';
        const { name, package: pkg, services, total, date } = req.body;
        if (!name || !pkg || !services || !total || !date) return res.status(400).json({ success: false, message: 'Все поля обязательны' });

        const [calculation] = await sql`
            INSERT INTO calculations (user_id, name, package, services, total, date)
            VALUES (${userIdentifier}, ${name.trim()}, ${JSON.stringify(pkg)}, ${JSON.stringify(services)}, ${total}, ${date})
            RETURNING *
        `;
        res.json({ success: true, message: 'Расчет сохранен', calculation });
    } catch (error) {
        handleError(res, error, 'Ошибка сохранения расчета');
    }
}));

app.delete('/api/user/calculations/:id', authenticateUser, asyncHandler(async (req, res) => {
    try {
        const userIdentifier = req.user.userId || req.user.email || 'admin';
        if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: 'ID расчета обязателен' });
        const [result] = await sql`DELETE FROM calculations WHERE id = ${parseInt(req.params.id)} AND user_id = ${userIdentifier} RETURNING id`;
        if (!result) return res.status(404).json({ success: false, message: 'Расчет не найден' });
        res.json({ success: true, message: 'Расчет удален' });
    } catch (error) {
        handleError(res, error, 'Ошибка удаления расчета');
    }
}));

// Orders
app.get('/api/user/orders', authenticateUser, asyncHandler(async (req, res) => {
    try {
        if (!req.user.userId || req.user.isAdmin) {
            return res.status(403).json({ success: false, message: 'Доступ только для обычных пользователей' });
        }
        const orders = await sql`SELECT * FROM orders WHERE user_id = ${req.user.userId} ORDER BY created_at DESC LIMIT 20`;
        res.json(orders);
    } catch (error) {
        handleError(res, error, 'Ошибка загрузки заказов');
    }
}));

// Test streak
app.get('/api/test-streak', authenticateUser, asyncHandler(async (req, res) => {
    try {
        let streakInfo;
        if (req.user.isAdmin || req.user.role === 'admin') {
            streakInfo = await updateUserDailyStreak(null, true, req.user.email);
            res.json({ success: true, message: 'Стрик админа обновлен', userType: 'admin', streak: streakInfo });
        } else {
            streakInfo = await updateUserDailyStreak(req.user.userId);
            res.json({ success: true, message: 'Стрик пользователя обновлен', userType: 'user', streak: streakInfo });
        }
    } catch (error) {
        handleError(res, error, 'Ошибка тестирования стрика');
    }
}));

// Static pages
app.get('/login', (req, res) => res.sendFile(path.resolve(__dirname, 'login.html')));
app.get('/admin', (req, res) => res.sendFile(path.resolve(__dirname, 'admin.html')));
app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, 'index.html')));

app.get('/api/health', async (req, res) => {
    try {
        await sql`SELECT 1`;
        res.json({ status: 'OK', db: 'connected', timestamp: new Date().toISOString() });
    } catch {
        res.status(503).json({ status: 'ERROR', db: 'disconnected', timestamp: new Date().toISOString() });
    }
});

app.get('/sitemap.xml', (req, res) => {
    const baseUrl = process.env.SITE_URL || 'https://my-portfolio-mark-182d.vercel.app';
    const currentDate = new Date().toISOString().split('T')[0];
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>${baseUrl}/</loc><lastmod>${currentDate}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>
    <url><loc>${baseUrl}/#portfolio</loc><lastmod>${currentDate}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
    <url><loc>${baseUrl}/#services</loc><lastmod>${currentDate}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
    <url><loc>${baseUrl}/#contact</loc><lastmod>${currentDate}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>
</urlset>`;
    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(sitemap);
});

app.get('/robots.txt', (req, res) => {
    const baseUrl = process.env.SITE_URL || 'https://my-portfolio-mark-182d.vercel.app';
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /login\nDisallow: /api/\n\nSitemap: ${baseUrl}/sitemap.xml`);
});

// 404
app.use('*', (req, res) => {
    console.warn(`404 - ${req.originalUrl} from IP: ${getClientIP(req)}`);
    res.status(404).json({ success: false, message: 'Страница не найдена' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(`🚨 Server error from IP ${getClientIP(req)}:`, err.message);
    if (res.headersSent) return;

    let statusCode = 500;
    let message = 'Внутренняя ошибка сервера';
    if (err.name === 'ValidationError') { statusCode = 400; message = 'Ошибка валидации данных'; }
    else if (err.name === 'JsonWebTokenError') { statusCode = 401; message = 'Недействительный токен'; }
    else if (err.name === 'TokenExpiredError') { statusCode = 401; message = 'Токен истек'; }
    else if (err.code === '23505') { statusCode = 409; message = 'Конфликт данных'; }

    res.status(statusCode).json({
        success: false, message,
        ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
});

module.exports = app;

if (require.main === module) {
    initDB()
        .then(() => {
            const server = app.listen(PORT, () => {
                console.log(`🚀 Сервер запущен на порту ${PORT}`);
                console.log(`🔒 Режим: ${process.env.NODE_ENV || 'development'}`);
                console.log('🐘 База данных: Neon Postgres');

                setTimeout(() => {
                    if (telegramService.isAvailable()) console.log('✅ Telegram Bot активен');
                    else console.log('ℹ️  Telegram отключен');
                    if (emailService.isAvailable()) console.log('✅ Email сервис активен');
                    else console.log('ℹ️  Email сервис отключен');
                }, 2000);
            });

            server.timeout = 30000;

            const gracefulShutdown = (signal) => {
                console.log(`${signal} received, shutting down...`);
                server.close(() => {
                    console.log('HTTP server closed');
                    process.exit(0);
                });
                setTimeout(() => process.exit(1), 15000);
            };

            process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
            process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        })
        .catch(err => {
            console.error('❌ Ошибка инициализации БД:', err.message);
            process.exit(1);
        });
}
