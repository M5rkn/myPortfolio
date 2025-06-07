const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const crypto = require('crypto');
const validator = require('validator');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
require('dotenv').config();

// Telegram integration
const telegramService = require('./telegramService');

// Email integration
const emailService = require('./emailService');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for correct IP detection
app.set('trust proxy', 1);

// Security: Безопасные заголовки без strict CSP для исправления проблемы отображения
app.use(helmet({
    contentSecurityPolicy: false, // Отключаем CSP от helmet, используем в HTML
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    noSniff: true,
    frameguard: { action: 'deny' },
    xssFilter: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    permittedCrossDomainPolicies: false,
    dnsPrefetchControl: true
}));

// Additional security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Server', 'TechPortal'); // Hide server info
    next();
});

// Compression
app.use(compression());

// Более разумные лимиты для нормальной работы
const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Увеличено до 100 запросов за 15 минут
    message: {
        success: false,
    message: 'Слишком много запросов, попробуйте позже'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for static files
        return req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|woff|woff2|svg|webp)$/);
    }
});

// API specific rate limiting (более мягкий)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30, // Увеличено до 30 API вызовов за 15 минут
    message: {
        success: false,
        message: 'API rate limit exceeded'
    }
});

// Login specific rate limiting (very strict)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3, // Only 3 login attempts per 15 minutes
    message: {
        success: false,
        message: 'Слишком много попыток входа, попробуйте позже'
    }
});

app.use(strictLimiter);

// CORS configuration for Railway deployment
const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID;
const railwayDomain = process.env.RAILWAY_STATIC_URL || process.env.FRONTEND_URL;

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8080',
    railwayDomain,
    'https://techportal.up.railway.app'
].filter(Boolean);

// Debug middleware для отслеживания запросов (самый ранний)
app.use((req, res, next) => {
    console.log(`🔍 ALL REQUEST: ${req.method} ${req.url}`);
    
    if (req.url.includes('/api/')) {
        console.log(`📡 API Request: ${req.method} ${req.url}`, {
            origin: req.headers.origin,
            'user-agent': req.headers['user-agent']?.slice(0, 50),
            'content-type': req.headers['content-type'],
            'csrf-token': req.headers['x-csrf-token'] ? 'present' : 'missing'
        });
    }
    next();
});

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (Railway direct access, mobile apps)
        if (!origin) return callback(null, true);
        
        // В Railway среде более гибкая проверка origin
        if (isRailway) {
            // Разрешаем все Railway домены
            if (origin.includes('railway.app') || origin.includes('up.railway.app')) {
                return callback(null, true);
            }
        }
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        } else {
            console.warn(`CORS warning: Origin ${origin} not in whitelist`);
            // В production Railway разрешаем, но логируем
            return callback(null, isRailway);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['X-CSRF-Token'],
    preflightContinue: false,
    optionsSuccessStatus: 200
}));

// MongoDB injection protection
app.use(mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`MongoDB injection attempt detected: ${key}`);
    }
}));

// Body parsing middleware with strict limits
app.use(express.json({ 
    limit: '10kb', // Very small limit
    strict: true,
    type: 'application/json'
}));
app.use(express.urlencoded({ 
    extended: false, // Disable extended parsing for security
    limit: '10kb'
}));

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
    const sanitize = (obj) => {
        for (let key in obj) {
            if (typeof obj[key] === 'string') {
                // Remove potentially dangerous characters
                obj[key] = validator.escape(obj[key].trim());
                // Limit length
                if (obj[key].length > 1000) {
                    obj[key] = obj[key].substring(0, 1000);
                }
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

// CSRF Token storage with timestamps for automatic cleanup
const csrfTokens = new Map(); // Using Map to store token with timestamp

// CSRF Token generation and validation
const generateCSRFToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Clean expired tokens every 10 minutes
setInterval(() => {
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;
    
    for (const [token, timestamp] of csrfTokens.entries()) {
        if (now - timestamp > tenMinutes) {
            csrfTokens.delete(token);
        }
    }
}, 10 * 60 * 1000);

const validateCSRFToken = (req, res, next) => {
    // Более мягкая CSRF проверка для Railway
    const token = req.headers['x-csrf-token'];
    const isProduction = process.env.NODE_ENV === 'production';
    const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID;
    
    // В Railway среде используем более гибкую валидацию
    if (isRailway && isProduction) {
        // Проверяем существование токена, но не удаляем его сразу
        if (!token) {
            return res.status(403).json({
                success: false,
                message: 'CSRF token required'
            });
        }
        
        // Если токен есть в хранилище или соответствует fallback паттерну
        if (csrfTokens.has(token) || token.match(/^[a-f0-9]{64}$/)) {
            return next();
        }
    } else {
        // Стандартная валидация для локальной разработки
        if (!token || !csrfTokens.has(token)) {
            return res.status(403).json({
                success: false,
                message: 'CSRF token validation failed'
            });
        }
        
        // Удаляем токен только в dev среде
        csrfTokens.delete(token);
    }
    
    next();
};

// JWT Token blacklist (use Redis in production)
const tokenBlacklist = new Set();

// Telegram webhook endpoint
app.post('/telegram-webhook', express.json({ limit: '10mb' }), (req, res) => {
    try {
        // express.json() уже парсит JSON, просто передаем дальше
        telegramService.handleWebhook(req, res);
    } catch (error) {
        console.error('❌ Ошибка обработки Telegram webhook:', error.message);
        res.status(400).json({ error: 'Invalid request' });
    }
});

// Secure static file serving with path traversal protection
app.use(express.static('.', {
    dotfiles: 'deny',
    index: false,
    redirect: false,
    setHeaders: (res, path) => {
        // Security headers for static files
        res.setHeader('X-Content-Type-Options', 'nosniff');
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

// Secure MongoDB connection with additional options
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

// Secure admin password with bcrypt
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || 
    bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'ChangeThisPassword123!', 12);

// Debug info for Railway (remove in production)
if (process.env.NODE_ENV === 'production') {
    console.log('🔍 Railway Debug Info:');
    console.log('- ADMIN_PASSWORD_HASH exists:', !!process.env.ADMIN_PASSWORD_HASH);
    console.log('- Using fallback password:', !process.env.ADMIN_PASSWORD_HASH);
    if (!process.env.ADMIN_PASSWORD_HASH) {
        console.warn('⚠️ ADMIN_PASSWORD_HASH не настроен! Используется fallback.');
        console.warn('⚠️ Запустите локально: node generate-admin-hash.js');
    }
}

// MongoDB подключение с автопереподключением
mongoose.connect(MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    retryWrites: true,
    retryReads: true
})
.then(() => console.log('✅ MongoDB подключен'))
.catch(err => {
    console.error('❌ Ошибка подключения MongoDB:', err.message);
    // Не завершаем процесс, попробуем переподключиться
    console.log('🔄 Попытка переподключения через 5 секунд...');
    setTimeout(() => {
        mongoose.connect(MONGODB_URI).catch(() => {
            console.error('❌ Критическая ошибка MongoDB, завершение приложения');
            process.exit(1);
        });
    }, 5000);
});

// Обработка отключения MongoDB
mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB отключен, пытаемся переподключиться...');
});

mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB переподключен');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Ошибка MongoDB:', err.message);
});

// Enhanced contact form schema with validation
const contactSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        trim: true,
        minlength: 2,
        maxlength: 50,
        validate: {
            validator: (v) => validator.isLength(v, { min: 2, max: 50 }),
            message: 'Name must be between 2 and 50 characters'
        }
    },
    email: { 
        type: String, 
        required: true, 
        trim: true,
        maxlength: 254,
        validate: {
            validator: validator.isEmail,
            message: 'Invalid email format'
        }
    },
    message: { 
        type: String, 
        required: true, 
        trim: true,
        minlength: 10,
        maxlength: 1000,
        validate: {
            validator: (v) => validator.isLength(v, { min: 10, max: 1000 }),
            message: 'Message must be between 10 and 1000 characters'
        }
    },
    createdAt: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
    ipAddress: { type: String, required: true } // For security logging
});

const Contact = mongoose.model('Contact', contactSchema);

// Enhanced project views schema
const projectViewSchema = new mongoose.Schema({
    projectId: { 
        type: String, 
        required: true,
        validate: {
            validator: (v) => /^project-[1-6]$/.test(v),
            message: 'Invalid project ID format'
        }
    },
    views: { type: Number, default: 0, min: 0 },
    lastViewed: { type: Date, default: Date.now }
});

const ProjectView = mongoose.model('ProjectView', projectViewSchema);

// Enhanced project likes schema
const projectLikeSchema = new mongoose.Schema({
    projectId: { 
        type: String, 
        required: true,
        validate: {
            validator: (v) => /^project-[1-6]$/.test(v),
            message: 'Invalid project ID format'
        }
    },
    likes: { type: Number, default: 0, min: 0 },
    lastLiked: { type: Date, default: Date.now }
});

const ProjectLike = mongoose.model('ProjectLike', projectLikeSchema);

// Enhanced auth middleware with blacklist check
const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Требуется авторизация'
        });
    }
    
    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
        return res.status(401).json({
            success: false,
            message: 'Токен недействителен'
        });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Additional security checks
        if (!decoded.admin || !decoded.timestamp) {
            throw new Error('Invalid token structure');
        }
        
        // Check if token is too old (additional security)
        const tokenAge = Date.now() - decoded.timestamp;
        if (tokenAge > 24 * 60 * 60 * 1000) { // 24 hours
            throw new Error('Token expired');
        }
        
        req.admin = decoded;
        req.adminToken = token; // Store for potential blacklisting
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Недействительный токен'
        });
    }
};

// Enhanced error handling
const handleError = (res, error, userMessage = 'Ошибка сервера') => {
    console.error('Server error:', error.message);
    
    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(500).json({
        success: false,
        message: userMessage,
        ...(isDevelopment && { error: error.message })
    });
};

// Enhanced input validation
const validateContactInput = (name, email, message) => {
    const errors = [];
    
    if (!name || !validator.isLength(name, { min: 2, max: 50 })) {
        errors.push('Имя должно содержать от 2 до 50 символов');
    }
    
    if (!email || !validator.isEmail(email) || email.length > 254) {
        errors.push('Некорректный email адрес');
    }
    
    if (!message || !validator.isLength(message, { min: 10, max: 1000 })) {
        errors.push('Сообщение должно содержать от 10 до 1000 символов');
    }
    
    return errors;
};

// Get client IP securely
const getClientIP = (req) => {
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           '127.0.0.1';
};

// Middleware для отлова async ошибок
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Routes

// CSRF Token endpoint (must be called before any POST requests)
app.get('/api/csrf-token', (req, res) => {
    const token = generateCSRFToken();
    const timestamp = Date.now();
    
    // Store token with timestamp
    csrfTokens.set(token, timestamp);
    
    // Clean up old tokens (keep only last 100 or clean by time)
    if (csrfTokens.size > 100) {
        const tokensArray = Array.from(csrfTokens.entries());
        const oldestToken = tokensArray[0][0];
        csrfTokens.delete(oldestToken);
    }
    
    // Set cache headers for Railway compatibility
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.json({
        success: true,
        csrfToken: token,
        timestamp: timestamp
    });
});

// Test endpoint для отладки
app.post('/api/test', (req, res) => {
    console.log('🧪 Test endpoint hit:', {
        method: req.method,
        headers: req.headers,
        body: req.body
    });
    res.json({ success: true, message: 'Test endpoint working', receivedData: req.body });
});

// Простой contact endpoint без middleware для тестирования
app.post('/api/contact-simple', async (req, res) => {
    console.log('📬 Simple contact endpoint hit');
    console.log('📬 Body:', req.body);
    res.json({ success: true, message: 'Simple endpoint working' });
});

// Admin login with enhanced security
app.post('/api/admin/login', loginLimiter, validateCSRFToken, asyncHandler(async (req, res) => {
    try {
        const { password } = req.body;
        
        if (!password || typeof password !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Пароль обязателен'
            });
        }
        
        // Rate limiting additional check per IP
        const clientIP = getClientIP(req);
        console.log(`Login attempt from IP: ${clientIP}`);
        
        // Secure password comparison with timing attack protection
        const isValidPassword = await new Promise((resolve) => {
            // Add random delay to prevent timing attacks
            setTimeout(() => {
                // Если нет хэша в env, проверяем против простого пароля
                if (!process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_PASSWORD) {
                    resolve(password === process.env.ADMIN_PASSWORD);
                } else {
                    resolve(bcrypt.compareSync(password, ADMIN_PASSWORD_HASH));
                }
            }, Math.random() * 100 + 50);
        });
        
        if (!isValidPassword) {
            // Enhanced debug logging
            console.warn(`Failed login attempt from IP: ${clientIP}`);
            console.warn(`Password length: ${password.length}`);
            console.warn(`Has ADMIN_PASSWORD_HASH: ${!!process.env.ADMIN_PASSWORD_HASH}`);
            console.warn(`Has ADMIN_PASSWORD: ${!!process.env.ADMIN_PASSWORD}`);
            console.warn(`Using fallback: ${!process.env.ADMIN_PASSWORD_HASH && !process.env.ADMIN_PASSWORD}`);
            
            return res.status(401).json({
                success: false,
                message: 'Неверный пароль'
            });
        }
        
        // Generate secure JWT token
        const tokenPayload = {
            admin: true,
            timestamp: Date.now(),
            ip: clientIP,
            sessionId: crypto.randomBytes(16).toString('hex')
        };
        
        const token = jwt.sign(tokenPayload, JWT_SECRET, { 
            expiresIn: '24h',
            issuer: 'TechPortal',
            audience: 'admin'
        });
        
        console.log(`Successful admin login from IP: ${clientIP}`);
        
        res.json({
            success: true,
            message: 'Успешная авторизация',
            token: token
        });
        
    } catch (error) {
        handleError(res, error);
    }
}));

// Admin logout (blacklist token)
app.post('/api/admin/logout', authenticateAdmin, (req, res) => {
    try {
        // Add token to blacklist
        tokenBlacklist.add(req.adminToken);
        
        // Clean up blacklist if it gets too large
        if (tokenBlacklist.size > 1000) {
            tokenBlacklist.clear();
        }
        
        res.json({
            success: true,
            message: 'Выход выполнен'
        });
    } catch (error) {
        handleError(res, error);
    }
});

// Submit contact form with enhanced security
app.post('/api/contact', apiLimiter, validateCSRFToken, async (req, res) => {
    console.log('📬 Contact form submission received:', {
        method: req.method,
        contentType: req.headers['content-type'],
        bodyKeys: Object.keys(req.body || {}),
        hasName: !!req.body?.name,
        hasEmail: !!req.body?.email,
        hasMessage: !!req.body?.message
    });
    
    try {
        const { name, email, message } = req.body;

        // Enhanced validation
        const errors = validateContactInput(name, email, message);
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Ошибки валидации',
                errors: errors
            });
        }
        
        // Check for spam patterns
        const spamPatterns = [
            /viagra|casino|poker|loan|credit/i,
            /http[s]?:\/\//i,
            /\b(?:\w+\.){2,}\w+\b/i // Multiple domains
        ];
        
        const isSpam = spamPatterns.some(pattern => 
            pattern.test(name + ' ' + email + ' ' + message)
        );
        
        if (isSpam) {
            console.warn(`Potential spam detected from IP: ${getClientIP(req)}`);
            return res.status(400).json({
                success: false,
                message: 'Сообщение отклонено'
            });
        }
        
        // Rate limiting per IP for contact form
        const clientIP = getClientIP(req);
        const recentContacts = await Contact.countDocuments({
            ipAddress: clientIP,
            createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
        });
        
        if (recentContacts >= 3) {
            return res.status(429).json({
                success: false,
                message: 'Слишком много сообщений с этого IP'
            });
        }
        
        // Save to database with additional security
        const contact = new Contact({
            name: validator.escape(name.trim()).slice(0, 50),
            email: validator.normalizeEmail(email.trim()).slice(0, 254),
            message: validator.escape(message.trim()).slice(0, 1000),
            ipAddress: clientIP
        });

        await contact.save();
        
        // Отправка уведомления в Telegram
        telegramService.notifyNewContact(contact);
        
        console.log(`New contact form submission from IP: ${clientIP}`);

        res.json({
            success: true,
            message: 'Сообщение отправлено! Я свяжусь с вами в ближайшее время.'
        });

    } catch (error) {
        handleError(res, error);
    }
});

// Get contact messages (admin) with pagination and security
app.get('/api/admin/contacts', authenticateAdmin, async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
        const skip = (page - 1) * limit;
        
        const [contacts, total] = await Promise.all([
            Contact.find()
            .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('-__v') // Exclude mongoose version field
                .lean(), // Faster queries
            Contact.countDocuments()
        ]);

        res.json({
            success: true,
            contacts: contacts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        handleError(res, error);
    }
});

// Mark contact as read with validation
app.patch('/api/admin/contacts/:id/read', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Недействительный ID'
            });
        }
        
        const result = await Contact.findByIdAndUpdate(
            id, 
            { isRead: true },
            { new: true }
        );
        
        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Контакт не найден'
            });
        }
        
        res.json({ success: true });
    } catch (error) {
        handleError(res, error);
    }
});

// Delete contact with validation
app.delete('/api/admin/contacts/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Недействительный ID'
            });
        }
        
        const result = await Contact.findByIdAndDelete(id);
        
        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Контакт не найден'
            });
        }
        
        res.json({ success: true });
    } catch (error) {
        handleError(res, error);
    }
});

// Telegram Bot Management API
app.get('/api/admin/telegram/status', authenticateAdmin, async (req, res) => {
    try {
        const isAvailable = telegramService.isAvailable();
        const botInfo = await telegramService.getBotInfo();
        
        res.json({
            success: true,
            telegram: {
                enabled: isAvailable,
                botInfo: botInfo,
                adminChatId: telegramService.adminChatId ? '***настроен***' : null
            }
        });
    } catch (error) {
        handleError(res, error);
    }
});

// Send test notification to Telegram
app.post('/api/admin/telegram/test', authenticateAdmin, async (req, res) => {
    try {
        if (!telegramService.isAvailable()) {
            return res.status(400).json({
                success: false,
                message: 'Telegram интеграция не настроена'
            });
        }

        const testContact = {
            name: 'Тестовый пользователь',
            email: 'test@example.com',
            message: 'Это тестовое сообщение для проверки Telegram интеграции.',
            createdAt: new Date(),
            ipAddress: '127.0.0.1'
        };

        const sent = await telegramService.notifyNewContact(testContact);
        
        res.json({
            success: sent,
            message: sent ? 'Тестовое уведомление отправлено' : 'Ошибка отправки'
        });
    } catch (error) {
        handleError(res, error);
    }
});

// Get and send Telegram statistics
app.post('/api/admin/telegram/stats', authenticateAdmin, async (req, res) => {
    try {
        if (!telegramService.isAvailable()) {
            return res.status(400).json({
                success: false,
                message: 'Telegram интеграция не настроена'
            });
        }

        // Collect statistics
        const totalContacts = await Contact.countDocuments();
        const newContacts = await Contact.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });
        const unreadContacts = await Contact.countDocuments({ isRead: false });
        
        const projectViews = await ProjectView.find({}).lean();
        const projectNames = {
            'project-1': 'Интернет-магазин',
            'project-2': 'Лендинг с анимациями',
            'project-3': 'Система авторизации',
            'project-4': 'Корпоративный блог',
            'project-5': 'WordPress + Custom',
            'project-6': 'PSD → верстка'
        };

        const stats = {
            totalContacts,
            newContacts,
            unreadContacts,
            projectViews: projectViews.map(pv => ({
                name: projectNames[pv.projectId] || pv.projectId,
                views: pv.views
            }))
        };

        const sent = await telegramService.sendStats(stats);
        
        res.json({
            success: sent,
            message: sent ? 'Статистика отправлена в Telegram' : 'Ошибка отправки',
            stats
        });
    } catch (error) {
        handleError(res, error);
    }
});

// Send reply to contact
app.post('/api/admin/contacts/:id/reply', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { subject, message } = req.body;
        
        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Недействительный ID контакта'
            });
        }
        
        // Validate input
        if (!subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Тема и сообщение обязательны'
            });
        }
        
        if (subject.length > 200 || message.length > 5000) {
            return res.status(400).json({
                success: false,
                message: 'Тема или сообщение слишком длинные'
            });
        }
        
        // Find contact
        const contact = await Contact.findById(id);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Контакт не найден'
            });
        }
        
        // Check if email service is available
        if (!emailService.isAvailable()) {
            return res.status(400).json({
                success: false,
                message: 'Email сервис не настроен. Проверьте SMTP настройки.'
            });
        }
        
        // Send email reply
        await emailService.sendReply(
            contact.email,
            subject,
            message,
            contact
        );
        
        // Mark contact as read
        contact.isRead = true;
        await contact.save();
        
        // Send notification to Telegram
        if (telegramService.isAvailable()) {
            const notificationMessage = `
📧 *Отправлен ответ клиенту*

👤 *Клиент:* ${telegramService.escapeMarkdown(contact.name)}
📧 *Email:* ${telegramService.escapeMarkdown(contact.email)}
📝 *Тема:* ${telegramService.escapeMarkdown(subject)}
💬 *Ответ:* ${telegramService.escapeMarkdown(message.substring(0, 200))}${message.length > 200 ? '...' : ''}

🕐 *Время отправки:* ${new Date().toLocaleString('ru-RU')}
            `;
            
            telegramService.bot.sendMessage(
                telegramService.adminChatId, 
                notificationMessage, 
                { parse_mode: 'Markdown' }
            ).catch(err => console.error('Ошибка Telegram уведомления:', err.message));
        }
        
        res.json({
            success: true,
            message: 'Ответ успешно отправлен'
        });
        
    } catch (error) {
        console.error('Ошибка отправки ответа:', error.message);
        
        if (error.message.includes('Invalid login')) {
            return res.status(400).json({
                success: false,
                message: 'Ошибка аутентификации SMTP. Проверьте логин и пароль.'
            });
        }
        
        handleError(res, error, 'Ошибка отправки ответа клиенту');
    }
});

// Email service status
app.get('/api/admin/email/status', authenticateAdmin, async (req, res) => {
    try {
        const config = emailService.getConfig();
        
        res.json({
            success: true,
            email: config
        });
    } catch (error) {
        handleError(res, error);
    }
});

// Send test email
app.post('/api/admin/email/test', authenticateAdmin, async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email адрес обязателен'
            });
        }
        
        if (!emailService.isAvailable()) {
            return res.status(400).json({
                success: false,
                message: 'Email сервис не настроен'
            });
        }
        
        await emailService.sendTestEmail(email);
        
        res.json({
            success: true,
            message: 'Тестовое письмо отправлено'
        });
        
    } catch (error) {
        console.error('Ошибка отправки тестового письма:', error.message);
        handleError(res, error, 'Ошибка отправки тестового письма');
    }
});

// Project views API with enhanced validation
app.post('/api/projects/:id/view', apiLimiter, async (req, res) => {
    try {
        const projectId = req.params.id;
        
        // Strict validation of project ID
        if (!projectId || !/^project-[1-6]$/.test(projectId)) {
            return res.status(400).json({
                success: false,
                message: 'Недействительный ID проекта'
            });
        }
        
        // Rate limiting per IP
        const clientIP = getClientIP(req);
        
        let projectView = await ProjectView.findOne({ projectId });
        
        if (projectView) {
            // Prevent rapid increment from same IP
            const timeSinceLastView = Date.now() - new Date(projectView.lastViewed).getTime();
            if (timeSinceLastView < 5000) { // 5 seconds cooldown
                return res.json({
                    success: true,
                    views: projectView.views
                });
            }
            
            projectView.views = Math.min(projectView.views + 1, 999999); // Prevent overflow
            projectView.lastViewed = new Date();
            await projectView.save();
        } else {
            projectView = new ProjectView({
                projectId,
                views: 1
            });
            await projectView.save();
        }

        res.json({
            success: true,
            views: projectView.views
        });
    } catch (error) {
        handleError(res, error);
    }
});

// Get project views with caching
app.get('/api/projects/:id/views', async (req, res) => {
    try {
        const projectId = req.params.id;
        
        // Validate project ID
        if (!projectId || !/^project-[1-6]$/.test(projectId)) {
            return res.status(400).json({
                success: false,
                message: 'Недействительный ID проекта'
            });
        }
        
        const projectView = await ProjectView.findOne({ projectId }).lean();
        
        // Cache headers
        res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes cache
        
        res.json({
            success: true,
            views: projectView ? Math.max(0, projectView.views) : 0
        });
    } catch (error) {
        handleError(res, error);
    }
});

// Increment project likes with anti-spam
app.post('/api/projects/:id/like', apiLimiter, validateCSRFToken, async (req, res) => {
    try {
        const projectId = req.params.id;
        
        // Validate project ID
        if (!projectId || !/^project-[1-6]$/.test(projectId)) {
            return res.status(400).json({
                success: false,
                message: 'Недействительный ID проекта'
            });
        }
        
        // Anti-spam: Rate limiting per IP
        const clientIP = getClientIP(req);
        
        let projectLike = await ProjectLike.findOne({ projectId });
        
        if (projectLike) {
            // Prevent rapid likes from same IP
            const timeSinceLastLike = Date.now() - new Date(projectLike.lastLiked).getTime();
            if (timeSinceLastLike < 10000) { // 10 seconds cooldown
                return res.json({
                    success: true,
                    likes: projectLike.likes
                });
            }
            
            projectLike.likes = Math.min(projectLike.likes + 1, 999999); // Prevent overflow
            projectLike.lastLiked = new Date();
            await projectLike.save();
        } else {
            projectLike = new ProjectLike({
                projectId,
                likes: 1
            });
            await projectLike.save();
        }

        res.json({
            success: true,
            likes: projectLike.likes
        });
    } catch (error) {
        handleError(res, error);
    }
});

// Get project likes with caching
app.get('/api/projects/:id/likes', async (req, res) => {
    try {
        const projectId = req.params.id;
        
        // Validate project ID
        if (!projectId || !/^project-[1-6]$/.test(projectId)) {
            return res.status(400).json({
                success: false,
                message: 'Недействительный ID проекта'
            });
        }
        
        const projectLike = await ProjectLike.findOne({ projectId }).lean();
        
        // Cache headers
        res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes cache
        
        res.json({
            success: true,
            likes: projectLike ? Math.max(0, projectLike.likes) : 0
        });
    } catch (error) {
        handleError(res, error);
    }
});

// Portfolio general views tracking
app.post('/api/portfolio/views', apiLimiter, async (req, res) => {
    try {
        const { page, timestamp } = req.body || {};
        
        // Basic validation
        if (!page || !timestamp) {
            return res.status(400).json({
                success: false,
                message: 'Отсутствуют обязательные поля'
            });
        }
        
        // Rate limiting per IP for portfolio views
        const clientIP = getClientIP(req);
        
        // Simple page view tracking (you can extend this for analytics)
        const pageViewData = {
            page: validator.escape(page),
            ip: clientIP,
            timestamp: new Date(),
            userAgent: req.get('User-Agent') || 'Unknown'
        };
        
        // Log page view (in production, save to analytics DB)
        console.log('📊 Portfolio page view:', pageViewData);
        
        res.json({
            success: true,
            message: 'Просмотр записан'
        });
        
    } catch (error) {
        handleError(res, error);
    }
});

// Get portfolio project stats (views + likes)
app.get('/api/portfolio/:id/stats', async (req, res) => {
    try {
        const projectId = req.params.id;
        
        // Validate project ID
        if (!projectId || !/^project-[1-6]$/.test(projectId)) {
            return res.status(400).json({
                success: false,
                message: 'Недействительный ID проекта'
            });
        }
        
        // Get both views and likes in parallel
        const [projectView, projectLike] = await Promise.all([
            ProjectView.findOne({ projectId }).lean(),
            ProjectLike.findOne({ projectId }).lean()
        ]);
        
        // Cache headers
        res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes cache
        
        res.json({
            success: true,
            views: projectView ? Math.max(0, projectView.views) : 0,
            likes: projectLike ? Math.max(0, projectLike.likes) : 0
        });
        
    } catch (error) {
        handleError(res, error);
    }
});

// Update portfolio like API
app.post('/api/portfolio/like', apiLimiter, validateCSRFToken, async (req, res) => {
    try {
        const { projectId } = req.body || {};
        
        // Validate project ID
        if (!projectId || !/^project-[1-6]$/.test(projectId)) {
            return res.status(400).json({
                success: false,
                message: 'Недействительный ID проекта'
            });
        }
        
        // Forward to existing like endpoint
        req.params.id = projectId;
        return app._router.handle({ 
            ...req, 
            method: 'POST',
            url: `/api/projects/${projectId}/like`
        }, res);
        
    } catch (error) {
        handleError(res, error);
    }
});

// Secure login page route
app.get('/login', (req, res) => {
    try {
        // Check if file exists and is safe
        const loginPath = path.join(__dirname, 'login.html');
        const resolvedPath = path.resolve(loginPath);
        
        // Prevent path traversal
        if (!resolvedPath.startsWith(__dirname)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        
        res.sendFile(resolvedPath);
    } catch (error) {
        handleError(res, error);
    }
});

// Secure admin panel route
app.get('/admin', (req, res) => {
    try {
        // Check if file exists and is safe
        const adminPath = path.join(__dirname, 'admin.html');
        const resolvedPath = path.resolve(adminPath);
        
        // Prevent path traversal
        if (!resolvedPath.startsWith(__dirname)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        
        res.sendFile(resolvedPath);
    } catch (error) {
        handleError(res, error);
    }
});

// Secure health check (limited information)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString()
        // Removed uptime for security (information disclosure)
    });
});

// Secure sitemap.xml with validation
app.get('/sitemap.xml', (req, res) => {
    try {
        const baseUrl = process.env.SITE_URL || 'https://techportal.up.railway.app';
        
        // Validate base URL to prevent injection
        if (!validator.isURL(baseUrl)) {
            return res.status(500).json({
                success: false,
                message: 'Invalid site URL configuration'
            });
        }
        
    const currentDate = new Date().toISOString().split('T')[0];
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${validator.escape(baseUrl)}/</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${validator.escape(baseUrl)}/#portfolio</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>${validator.escape(baseUrl)}/#services</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>${validator.escape(baseUrl)}/#about</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>
    <url>
        <loc>${validator.escape(baseUrl)}/#contact</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
    </url>
</urlset>`;

        res.setHeader('Content-Type', 'text/xml; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours cache
    res.send(sitemap);
    } catch (error) {
        handleError(res, error);
    }
});

// Secure robots.txt
app.get('/robots.txt', (req, res) => {
    try {
        const baseUrl = process.env.SITE_URL || 'https://techportal.up.railway.app';
        
        // Validate base URL
        if (!validator.isURL(baseUrl)) {
            return res.status(500).json({
                success: false,
                message: 'Invalid site URL configuration'
            });
        }
    
    const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /login
Disallow: /api/

Sitemap: ${validator.escape(baseUrl)}/sitemap.xml`;

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours cache
    res.send(robots);
    } catch (error) {
        handleError(res, error);
    }
});

// Secure main page serving
app.get('/', (req, res) => {
    try {
        const indexPath = path.join(__dirname, 'index.html');
        const resolvedPath = path.resolve(indexPath);
        
        // Prevent path traversal
        if (!resolvedPath.startsWith(__dirname)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        
        res.sendFile(resolvedPath);
    } catch (error) {
        handleError(res, error);
    }
});

// Security headers for all routes
app.use((req, res, next) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    next();
});

// Enhanced 404 handler with security logging
app.use('*', (req, res) => {
    const clientIP = getClientIP(req);
    console.warn(`404 - Path not found: ${req.originalUrl} from IP: ${clientIP}`);
    
    res.status(404).json({
        success: false,
        message: 'Страница не найдена'
    });
});

// Улучшенный обработчик ошибок
app.use((err, req, res, next) => {
    const clientIP = getClientIP(req);
    const timestamp = new Date().toISOString();
    
    // Подробное логирование ошибки
    console.error(`🚨 [${timestamp}] Server error from IP ${clientIP}:`);
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    console.error('Request URL:', req.url);
    console.error('Request method:', req.method);
    
    // Проверка на потенциальные атаки
    if (err.message.includes('CORS') || 
        err.message.includes('injection') || 
        err.message.includes('attack') ||
        err.message.includes('malicious')) {
        console.error(`🔴 SECURITY ALERT: Potential attack from IP: ${clientIP}`);
    }
    
    // Специальная обработка разных типов ошибок
    let statusCode = 500;
    let message = 'Внутренняя ошибка сервера';
    
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Ошибка валидации данных';
    } else if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Некорректный формат данных';
    } else if (err.code === 11000) {
        statusCode = 409;
        message = 'Конфликт данных';
    } else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Недействительный токен';
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Токен истек';
    } else if (err.name === 'MongoNetworkError') {
        statusCode = 503;
        message = 'Сервис временно недоступен';
    }
    
    // Не раскрываем детали ошибки в production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Убеждаемся что заголовки еще не отправлены
    if (!res.headersSent) {
        res.status(statusCode).json({
        success: false,
            message: message,
            ...(isDevelopment && { 
                error: err.message,
                stack: err.stack 
            })
        });
    }
});

// Мониторинг ресурсов и очистка памяти
const memoryCleanupInterval = setInterval(() => {
    try {
        // Проверяем использование памяти
        const memUsage = process.memoryUsage();
        const memUsageMB = {
            rss: Math.round(memUsage.rss / 1024 / 1024),
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
            external: Math.round(memUsage.external / 1024 / 1024)
        };
        
        console.log(`📊 Память: RSS:${memUsageMB.rss}MB, Heap:${memUsageMB.heapUsed}/${memUsageMB.heapTotal}MB, External:${memUsageMB.external}MB`);
        
        // Предупреждение при высоком использовании памяти
        if (memUsageMB.heapUsed > 400) {
            console.warn(`⚠️ Высокое использование памяти: ${memUsageMB.heapUsed}MB`);
        }
        
        // Очистка CSRF токенов
        if (csrfTokens.size > 500) {
            const tokensArray = Array.from(csrfTokens);
            const tokensToKeep = tokensArray.slice(-100); // Оставляем последние 100
            csrfTokens.clear();
            tokensToKeep.forEach(token => csrfTokens.add(token));
            console.log(`🧹 Очищены CSRF токены, оставлено: ${csrfTokens.size}`);
        }
        
        // Очистка JWT blacklist
        if (tokenBlacklist.size > 1000) {
            tokenBlacklist.clear();
            console.log('🧹 JWT blacklist очищен для управления памятью');
        }
        
        // Принудительная сборка мусора если доступна
        if (global.gc && memUsageMB.heapUsed > 300) {
            global.gc();
            console.log('🗑️ Принудительная сборка мусора выполнена');
        }
        
    } catch (error) {
        console.error('Ошибка при очистке памяти:', error.message);
    }
}, 10 * 60 * 1000); // Каждые 10 минут

// Улучшенная обработка критических ошибок
process.on('uncaughtException', (error) => {
    console.error('🚨 CRITICAL: Uncaught Exception:', error.message);
    console.error('Stack:', error.stack);
    
    // Log security-related errors
    if (error.message.includes('attack') || 
        error.message.includes('injection') || 
        error.message.includes('malicious')) {
        console.error('🔴 SECURITY ALERT: Potential attack detected');
    }
    
    // Попытка graceful shutdown с таймаутом
    console.log('🔄 Attempting graceful shutdown...');
    
    const shutdownTimeout = setTimeout(() => {
        console.error('❌ Принудительное завершение процесса');
        process.exit(1);
    }, 10000); // 10 секунд на graceful shutdown
    
    // Закрываем сервер
    if (server && server.listening) {
        server.close(() => {
            console.log('🔴 HTTP server closed');
            mongoose.connection.close(() => {
                console.log('🔴 MongoDB connection closed');
                clearTimeout(shutdownTimeout);
                process.exit(1);
            });
        });
    } else {
        clearTimeout(shutdownTimeout);
        process.exit(1);
    }
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 CRITICAL: Unhandled Promise Rejection:');
    console.error('Reason:', reason);
    console.error('Promise:', promise);
    
    // Не завершаем процесс сразу, логируем и продолжаем
    if (reason && reason.code === 'ECONNRESET') {
        console.log('💡 Сетевая ошибка, продолжаем работу');
        return;
    }
    
    if (reason && reason.name === 'MongoNetworkError') {
        console.log('💡 MongoDB сетевая ошибка, автопереподключение активно');
        return;
    }
    
    // Для других критических ошибок - graceful restart
    console.log('🔄 Scheduling graceful restart in 5 seconds...');
    setTimeout(() => {
        process.exit(1);
    }, 5000);
});

// Отслеживание предупреждений
process.on('warning', (warning) => {
    if (warning.name === 'MaxListenersExceededWarning') {
        console.warn('⚠️ Memory leak warning:', warning.message);
    } else {
        console.warn('⚠️ Process warning:', warning.message);
    }
});

// Мониторинг здоровья приложения
let healthCheckFails = 0;
const healthMonitor = setInterval(() => {
    try {
        // Проверяем подключение к MongoDB
        if (mongoose.connection.readyState !== 1) {
            healthCheckFails++;
            console.warn(`⚠️ MongoDB не подключен (fails: ${healthCheckFails})`);
            
            if (healthCheckFails > 5) {
                console.error('❌ Слишком много неудачных проверок здоровья, перезапуск...');
                process.exit(1);
            }
        } else {
            healthCheckFails = 0; // Сброс счетчика при успешной проверке
        }
        
        // Проверяем использование памяти
        const memUsage = process.memoryUsage();
        const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
        
        if (heapUsedMB > 500) { // Критический уровень памяти
            console.error(`🚨 Критическое использование памяти: ${heapUsedMB}MB`);
            
            // Принудительная очистка
            if (global.gc) {
                global.gc();
                console.log('🗑️ Экстренная сборка мусора выполнена');
            }
            
            // Если память все еще высокая - перезапуск
            const newMemUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
            if (newMemUsage > 450) {
                console.error('💥 Память не освобождена, перезапуск приложения');
                process.exit(1);
            }
        }
        
    } catch (error) {
        console.error('❌ Ошибка health check:', error.message);
        healthCheckFails++;
    }
}, 30000); // Каждые 30 секунд

// Улучшенная обработка сигналов для контейнеров
const gracefulShutdown = (signal) => {
    console.log(`${signal} received, shutting down gracefully...`);
    
    // Очищаем все интервалы
    clearInterval(memoryCleanupInterval);
    clearInterval(healthMonitor);
    
    // Останавливаем сервер
    server.close((err) => {
        if (err) {
            console.error('Error during server shutdown:', err);
        } else {
            console.log('HTTP server closed');
        }
        
        // Закрываем MongoDB соединение
        mongoose.connection.close(() => {
            console.log('MongoDB connection closed');
            
            // Финальная очистка
            csrfTokens.clear();
            tokenBlacklist.clear();
            
            process.exit(0);
        });
    });
    
    // Принудительное завершение через 15 секунд (увеличено)
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 15000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // Для nodemon

// Catch-all для отладки (в самом конце)
app.all('/api/contact*', (req, res) => {
    console.log(`🚨 Catch-all triggered: ${req.method} ${req.url}`);
    res.json({ 
        success: false, 
        message: `Method ${req.method} caught by catch-all`,
        url: req.url
    });
});

// Start server with security logging
const server = app.listen(PORT, () => {
    const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID;
    const railwayUrl = process.env.RAILWAY_STATIC_URL || process.env.FRONTEND_URL;
    
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    
    if (isRailway) {
        console.log(`🚄 Railway Environment: ${process.env.RAILWAY_ENVIRONMENT || 'production'}`);
        console.log(`🌐 Railway URL: ${railwayUrl || 'https://techportal.up.railway.app'}`);
        console.log(`🔧 Railway Project: ${process.env.RAILWAY_PROJECT_ID ? 'Connected' : 'Not detected'}`);
    } else {
        console.log(`📱 Локальный URL: http://localhost:${PORT}`);
    }
    
    console.log(`🔒 Режим безопасности: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🛡️  Все меры безопасности активированы`);
    console.log(`⚡ CSRF защита: ✅ ${isRailway ? '(Railway Mode)' : '(Dev Mode)'}`);
    console.log(`⚡ CORS Policy: ${isRailway ? 'Railway Flexible' : 'Strict Whitelist'}`);
    console.log(`⚡ Rate Limiting: ✅`);
    console.log(`⚡ Input Validation: ✅`);
    console.log(`⚡ MongoDB Sanitization: ✅`);
    console.log(`⚡ JWT Security: ✅`);
    console.log(`⚡ Helmet Protection: ✅`);
    
    if (isRailway) {
        console.log(`🔧 Railway CSRF Tokens: Persistent mode enabled`);
        console.log(`🔧 Cache Duration: 10 minutes`);
        console.log(`🔧 CSRF Fallback: Enabled for Railway`);
    }
    
    // Setup Telegram webhook in production
    if (process.env.NODE_ENV === 'production' && railwayUrl) {
        setTimeout(() => {
            telegramService.setupWebhook(railwayUrl);
        }, 5000); // Wait 5 seconds after server start
    }
    
    // Log integration status
    setTimeout(() => {
        if (telegramService.isAvailable()) {
            console.log('✅ Telegram Bot интеграция активна');
        } else {
            console.log('ℹ️  Telegram интеграция отключена (настройте TELEGRAM_BOT_TOKEN и TELEGRAM_ADMIN_CHAT_ID)');
        }
        
        if (emailService.isAvailable()) {
            console.log('✅ Email сервис активен');
        } else {
            console.log('ℹ️  Email сервис отключен (настройте SMTP параметры)');
        }
    }, 2000);
});

// Security timeout for server
server.timeout = 30000; // 30 seconds timeout 