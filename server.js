const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Слишком много запросов, попробуйте позже'
});
app.use(limiter);

// CORS
app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('.'));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'; // Измените в production!

mongoose.connect(MONGODB_URI)
.then(() => console.log('✅ MongoDB подключен'))
.catch(err => console.error('❌ Ошибка подключения MongoDB:', err));

// Contact form schema
const contactSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false }
});

const Contact = mongoose.model('Contact', contactSchema);

// Project views schema
const projectViewSchema = new mongoose.Schema({
    projectId: { type: String, required: true },
    views: { type: Number, default: 0 },
    lastViewed: { type: Date, default: Date.now }
});

const ProjectView = mongoose.model('ProjectView', projectViewSchema);

// Project likes schema
const projectLikeSchema = new mongoose.Schema({
    projectId: { type: String, required: true },
    likes: { type: Number, default: 0 },
    lastLiked: { type: Date, default: Date.now }
});

const ProjectLike = mongoose.model('ProjectLike', projectLikeSchema);

// Order schema
const orderSchema = new mongoose.Schema({
    customer: {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
        phone: { type: String, trim: true },
        message: { type: String, trim: true }
    },
    items: [{
        id: Number,
        projectType: {
            value: String,
            label: String,
            cost: Number
        },
        features: [{
            value: String,
            label: String,
            cost: Number
        }],
        totalCost: Number,
        createdAt: String
    }],
    totalAmount: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'], 
        default: 'pending' 
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// Auth middleware
const authenticateAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.adminToken;
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Требуется авторизация'
        });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Недействительный токен'
        });
    }
};

// Routes

// Admin login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { password } = req.body;
        
        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Пароль обязателен'
            });
        }
        
        // Simple password check (в production лучше использовать хеш)
        if (password !== ADMIN_PASSWORD) {
            return res.status(401).json({
                success: false,
                message: 'Неверный пароль'
            });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { admin: true, timestamp: Date.now() },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            message: 'Успешная авторизация',
            token: token
        });
        
    } catch (error) {
        console.error('Ошибка авторизации:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера'
        });
    }
});

// Submit order
app.post('/api/orders', async (req, res) => {
    try {
        const { customer, items, totalAmount } = req.body;

        // Validation
        if (!customer || !customer.name || !customer.email || !items || !totalAmount) {
            return res.status(400).json({
                success: false,
                message: 'Все обязательные поля должны быть заполнены'
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Корзина не может быть пустой'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customer.email)) {
            return res.status(400).json({
                success: false,
                message: 'Некорректный email адрес'
            });
        }

        // Save to database
        const order = new Order({
            customer: {
                name: customer.name.slice(0, 100),
                email: customer.email.slice(0, 100),
                phone: customer.phone ? customer.phone.slice(0, 20) : '',
                message: customer.message ? customer.message.slice(0, 1000) : ''
            },
            items: items,
            totalAmount: totalAmount
        });

        await order.save();

        res.json({
            success: true,
            message: 'Заказ успешно оформлен! Мы свяжемся с вами в ближайшее время.',
            orderId: order._id
        });

    } catch (error) {
        console.error('Ошибка при сохранении заказа:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера. Попробуйте позже.'
        });
    }
});

// Submit contact form
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Validation
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Все поля обязательны для заполнения'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Некорректный email адрес'
            });
        }

        // Save to database
        const contact = new Contact({
            name: name.slice(0, 100),
            email: email.slice(0, 100),
            message: message.slice(0, 1000)
        });

        await contact.save();

        res.json({
            success: true,
            message: 'Сообщение отправлено! Я свяжусь с вами в ближайшее время.'
        });

    } catch (error) {
        console.error('Ошибка при сохранении заявки:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера. Попробуйте позже.'
        });
    }
});

// Get contact messages (admin)
app.get('/api/admin/contacts', authenticateAdmin, async (req, res) => {
    try {
        const contacts = await Contact.find()
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            success: true,
            contacts: contacts
        });
    } catch (error) {
        console.error('Ошибка получения заявок:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера'
        });
    }
});

// Mark contact as read
app.patch('/api/admin/contacts/:id/read', authenticateAdmin, async (req, res) => {
    try {
        await Contact.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Delete contact
app.delete('/api/admin/contacts/:id', authenticateAdmin, async (req, res) => {
    try {
        await Contact.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Get orders (admin)
app.get('/api/admin/orders', authenticateAdmin, async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(100);

        res.json({
            success: true,
            orders: orders
        });
    } catch (error) {
        console.error('Ошибка получения заказов:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера'
        });
    }
});

// Update order status
app.patch('/api/admin/orders/:id/status', authenticateAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Недопустимый статус заказа'
            });
        }

        await Order.findByIdAndUpdate(req.params.id, { 
            status: status,
            updatedAt: new Date()
        });
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Delete order
app.delete('/api/admin/orders/:id', authenticateAdmin, async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Project views API
app.post('/api/projects/:id/view', async (req, res) => {
    try {
        const projectId = req.params.id;
        
        let projectView = await ProjectView.findOne({ projectId });
        
        if (projectView) {
            projectView.views += 1;
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
        console.error('Ошибка обновления просмотров:', error);
        res.status(500).json({ success: false });
    }
});

// Get project views
app.get('/api/projects/:id/views', async (req, res) => {
    try {
        const projectView = await ProjectView.findOne({ projectId: req.params.id });
        
        res.json({
            success: true,
            views: projectView ? projectView.views : 0
        });
    } catch (error) {
        res.status(500).json({ success: false, views: 0 });
    }
});

// Increment project likes
app.post('/api/projects/:id/like', async (req, res) => {
    try {
        const projectId = req.params.id;
        
        let projectLike = await ProjectLike.findOne({ projectId });
        
        if (projectLike) {
            projectLike.likes += 1;
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
        console.error('Ошибка обновления лайков:', error);
        res.status(500).json({ success: false });
    }
});

// Get project likes
app.get('/api/projects/:id/likes', async (req, res) => {
    try {
        const projectLike = await ProjectLike.findOne({ projectId: req.params.id });
        
        res.json({
            success: true,
            likes: projectLike ? projectLike.likes : 0
        });
    } catch (error) {
        res.status(500).json({ success: false, likes: 0 });
    }
});

// Login page route
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Admin panel route (now requires auth check on frontend)
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Generate sitemap.xml
app.get('/sitemap.xml', (req, res) => {
    const baseUrl = process.env.SITE_URL || 'https://your-site.railway.app';
    const currentDate = new Date().toISOString().split('T')[0];
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseUrl}/</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${baseUrl}/#portfolio</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>${baseUrl}/#services</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>${baseUrl}/#about</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>
    <url>
        <loc>${baseUrl}/#contact</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
    </url>
</urlset>`;

    res.set('Content-Type', 'text/xml');
    res.send(sitemap);
});

// robots.txt
app.get('/robots.txt', (req, res) => {
    const baseUrl = process.env.SITE_URL || 'https://your-site.railway.app';
    
    const robots = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`;

    res.set('Content-Type', 'text/plain');
    res.send(robots);
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Страница не найдена'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📱 Открыть: http://localhost:${PORT}`);
}); 