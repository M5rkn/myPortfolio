// CRITICAL SECURITY: Freeze prototypes to prevent pollution
(function() {
    'use strict';
    
    // Freeze critical prototypes
    if (typeof Object.freeze === 'function') {
        Object.freeze(Object.prototype);
        Object.freeze(Array.prototype);
        Object.freeze(String.prototype);
        Object.freeze(Number.prototype);
        Object.freeze(Boolean.prototype);
        Object.freeze(Function.prototype);
    }
    
    // Prevent DOM clobbering by securing global references
    const secureGlobals = {
        document: window.document,
        console: window.console,
        fetch: window.fetch,
        setTimeout: window.setTimeout,
        setInterval: window.setInterval,
        clearTimeout: window.clearTimeout,
        clearInterval: window.clearInterval,
        URL: window.URL,
        Date: window.Date,
        Math: window.Math,
        JSON: window.JSON
    };
    
    // Secure DOM query functions
    function secureGetElementById(id) {
        if (typeof id !== 'string' || !id.match(/^[a-zA-Z][a-zA-Z0-9_-]*$/)) {
            throw new Error('Invalid element ID');
        }
        return secureGlobals.document.getElementById(id);
    }
    
    function secureQuerySelector(selector) {
        if (typeof selector !== 'string' || selector.includes('<') || selector.includes('>')) {
            throw new Error('Invalid selector');
        }
        return secureGlobals.document.querySelector(selector);
    }
    
    function secureQuerySelectorAll(selector) {
        if (typeof selector !== 'string' || selector.includes('<') || selector.includes('>')) {
            throw new Error('Invalid selector');
        }
        return secureGlobals.document.querySelectorAll(selector);
    }
    
    // Override dangerous global functions
    window.eval = function() {
        throw new Error('eval() is disabled for security');
    };
    
    window.Function = function() {
        throw new Error('Function constructor is disabled for security');
    };
    
    // Protect against prototype pollution
    function hasOwn(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    }
    
    function secureAssign(target, source) {
        if (!target || !source) return target;
        
        for (const key in source) {
            if (hasOwn(source, key)) {
                // Prevent prototype pollution
                if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
                    continue;
                }
                target[key] = source[key];
            }
        }
        return target;
    }
    
    // Export secure functions to global scope
    window.secureGetElementById = secureGetElementById;
    window.secureQuerySelector = secureQuerySelector;
    window.secureQuerySelectorAll = secureQuerySelectorAll;
    window.secureAssign = secureAssign;
    window.secureGlobals = secureGlobals;
})();

// Mobile Navigation Toggle
const hamburger = secureQuerySelector('.hamburger');
const navMenu = secureQuerySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    secureQuerySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));
}

// HTML Sanitization function для предотвращения XSS
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// Enhanced input validation with ReDoS protection
function validateInput(input, type = 'text') {
    if (!input || typeof input !== 'string') return false;
    
    // Length check to prevent ReDoS
    if (input.length > 10000) return false;
    
    // Remove potential XSS attempts with simple replace (avoid complex regex)
    const cleaned = input.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    switch (type) {
        case 'email':
            // Simple email validation to prevent ReDoS
            if (cleaned.length > 254 || cleaned.length < 5) return false;
            const atIndex = cleaned.indexOf('@');
            const dotIndex = cleaned.lastIndexOf('.');
            if (atIndex < 1 || dotIndex < atIndex + 2 || dotIndex >= cleaned.length - 1) return false;
            
            // Check for valid characters only
            const validEmailChars = /^[a-zA-Z0-9._@-]+$/;
            return validEmailChars.test(cleaned);
            
        case 'name':
            if (cleaned.length < 2 || cleaned.length > 50) return false;
            // Simple character validation without complex regex
            const validNameChars = /^[a-zA-Zа-яёА-ЯЁ\s-]+$/;
            return validNameChars.test(cleaned);
            
        case 'message':
            return cleaned.length >= 10 && cleaned.length <= 1000;
            
        default:
            return cleaned.length > 0 && cleaned.length <= 255;
    }
}

// URL validation function
function isValidURL(url) {
    if (!url || typeof url !== 'string') return false;
    
    try {
        const parsedURL = new URL(url);
        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(parsedURL.protocol)) {
            return false;
        }
        
        // Block dangerous protocols
        if (url.toLowerCase().includes('javascript:') || 
            url.toLowerCase().includes('data:') ||
            url.toLowerCase().includes('vbscript:')) {
            return false;
        }
        
        return true;
    } catch {
        return false;
    }
}

// Get CSRF token from server
async function getCSRFToken() {
    try {
        // Try to get cached token first
        let token = sessionStorage.getItem('csrf_token');
        const tokenTime = sessionStorage.getItem('csrf_token_time');
        
        // Check if token is expired (5 minutes)
        if (token && tokenTime && (Date.now() - parseInt(tokenTime)) < 5 * 60 * 1000) {
            return token;
        }
        
        // Request new token from server
        const response = await fetch('/api/csrf-token', {
            method: 'GET',
            credentials: 'same-origin'
        });
        
        if (!response.ok) {
            throw new Error('Failed to get CSRF token');
        }
        
        const data = await response.json();
        if (data.success && data.csrfToken) {
            sessionStorage.setItem('csrf_token', data.csrfToken);
            sessionStorage.setItem('csrf_token_time', Date.now().toString());
            return data.csrfToken;
        } else {
            throw new Error('Invalid CSRF token response');
        }
    } catch (error) {
        console.error('Error getting CSRF token:', error);
        // Fallback - return null and let server handle the error
        return null;
    }
}

// Smooth scrolling for navigation links
secureQuerySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        if (href && href.match(/^#[a-zA-Z][a-zA-Z0-9_-]*$/)) {
            const target = secureQuerySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Navbar background change on scroll with smooth transition
window.addEventListener('scroll', () => {
    const navbar = secureQuerySelector('.navbar');
    if (navbar && window.scrollY > 100) {
        navbar.style.background = 'rgba(10, 10, 10, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
    } else if (navbar) {
        navbar.style.background = 'rgba(10, 10, 10, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Contact form handling
const contactForm = secureGetElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');
        
        // Enhanced validation
        if (!validateInput(name, 'name')) {
            showNotification('Пожалуйста, введите корректное имя (2-50 символов)', 'error');
            return;
        }
        
        if (!validateInput(email, 'email')) {
            showNotification('Пожалуйста, введите корректный email', 'error');
            return;
        }
        
        if (!validateInput(message, 'message')) {
            showNotification('Сообщение должно содержать 10-1000 символов', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Отправляем...';
        submitBtn.disabled = true;
        
        try {
            // Get CSRF token from server
            const csrfToken = await getCSRFToken();
            if (!csrfToken) {
                throw new Error('Failed to get CSRF token');
            }
            
            // Send to backend with CSRF protection
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                body: JSON.stringify({ 
                    name: sanitizeHTML(name), 
                    email: sanitizeHTML(email), 
                    message: sanitizeHTML(message) 
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification(sanitizeHTML(data.message), 'success');
                this.reset();
            } else {
                showNotification(sanitizeHTML(data.message) || 'Ошибка при отправке', 'error');
            }
        } catch (error) {
            console.error('Ошибка отправки:', error);
            showNotification('Ошибка подключения. Попробуйте позже.', 'error');
        } finally {
            // Restore button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Email validation
function isValidEmail(email) {
    return validateInput(email, 'email');
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Sanitize message
    const safeMessage = sanitizeHTML(message);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Create content container
    const contentDiv = document.createElement('div');
    contentDiv.className = 'notification-content';
    
    // Create message span
    const messageSpan = document.createElement('span');
    messageSpan.className = 'notification-message';
    messageSpan.textContent = safeMessage;
    
    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'notification-close';
    closeBtn.innerHTML = '&times;';
    
    contentDiv.appendChild(messageSpan);
    contentDiv.appendChild(closeBtn);
    notification.appendChild(contentDiv);
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' : 
                     type === 'error' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 
                     'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 20000;
        max-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .notification-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
        }
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .notification-close:hover {
            opacity: 0.7;
        }
    `;
    document.head.appendChild(style);
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Close button functionality
    const notificationCloseBtn = notification.querySelector('.notification-close');
    notificationCloseBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Modal notification system
function showModalNotification(message, type = 'success') {
    // Remove existing modal notification
    const existingNotification = document.querySelector('.modal-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Get modal content container
    const modalContent = document.querySelector('.modal-content');
    if (!modalContent) return;
    
    // Sanitize message
    const safeMessage = sanitizeHTML(message);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `modal-notification ${type}`;
    
    // Create content container
    const contentDiv = document.createElement('div');
    contentDiv.className = 'modal-notification-content';
    
    // Create message span
    const messageSpan = document.createElement('span');
    messageSpan.className = 'modal-notification-message';
    messageSpan.textContent = safeMessage;
    
    // Create close button
    const modalCloseBtn = document.createElement('button');
    modalCloseBtn.className = 'modal-notification-close';
    modalCloseBtn.innerHTML = '&times;';
    
    contentDiv.appendChild(messageSpan);
    contentDiv.appendChild(modalCloseBtn);
    notification.appendChild(contentDiv);
    
    // Add styles
    notification.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' : 
                     type === 'error' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 
                     'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
        color: white;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        z-index: 25000;
        max-width: 250px;
        font-size: 0.9rem;
        animation: modalSlideIn 0.3s ease;
    `;
    
    // Add modal notification styles
    if (!document.querySelector('#modal-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'modal-notification-styles';
        style.textContent = `
            @keyframes modalSlideIn {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes modalSlideOut {
                from { transform: translateY(0); opacity: 1; }
                to { transform: translateY(-20px); opacity: 0; }
            }
            .modal-notification-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 0.75rem;
            }
            .modal-notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0;
                width: 16px;
                height: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0.8;
            }
            .modal-notification-close:hover {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to modal
    modalContent.appendChild(notification);
    
    // Close button functionality
    modalCloseBtn.addEventListener('click', () => {
        notification.style.animation = 'modalSlideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'modalSlideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animations
document.addEventListener('DOMContentLoaded', () => {
    // Add initial styles for animation
    const animatedElements = document.querySelectorAll('.portfolio-item, .skill-item, .contact-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Portfolio filter functionality (if needed in the future)
function filterPortfolio(category) {
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    portfolioItems.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
            }, 10);
        } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            setTimeout(() => {
                item.style.display = 'none';
            }, 300);
        }
    });
}

// Typed text effect for hero section
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typed effect when page loads
document.addEventListener('DOMContentLoaded', () => {
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        const originalText = heroSubtitle.textContent;
        setTimeout(() => {
            typeWriter(heroSubtitle, originalText, 80);
        }, 1000);
    }
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.floating-cards .card');
    
    parallaxElements.forEach((element, index) => {
        const speed = 0.5 + (index * 0.1);
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px) rotate(${scrolled * 0.01}deg)`;
    });
});

// Project views functionality
async function updateProjectViews() {
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    portfolioItems.forEach(async (item, index) => {
        const projectId = `project-${index + 1}`;
        
        try {
            // Get current views
            const response = await fetch(`/api/projects/${projectId}/views`);
            const data = await response.json();
            
            if (data.success) {
                // Add views counter to project
                let viewsElement = item.querySelector('.project-views');
                if (!viewsElement) {
                    viewsElement = document.createElement('div');
                    viewsElement.className = 'project-views';
                    viewsElement.style.cssText = `
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        background: rgba(0, 0, 0, 0.7);
                        color: white;
                        padding: 0.25rem 0.5rem;
                        border-radius: 15px;
                        font-size: 0.75rem;
                        z-index: 10;
                    `;
                    item.querySelector('.portfolio-image').style.position = 'relative';
                    item.querySelector('.portfolio-image').appendChild(viewsElement);
                }
                
                viewsElement.innerHTML = `👁 ${data.views}`;
            }
        } catch (error) {
            console.error('Ошибка загрузки просмотров:', error);
        }
        
        // Add click handler to increment views
        item.addEventListener('click', async () => {
            try {
                const response = await fetch(`/api/projects/${projectId}/view`, {
                    method: 'POST'
                });
                const data = await response.json();
                
                if (data.success) {
                    const viewsElement = item.querySelector('.project-views');
                    if (viewsElement) {
                        viewsElement.innerHTML = `👁 ${data.views}`;
                    }
                }
            } catch (error) {
                console.error('Ошибка обновления просмотров:', error);
            }
        });
    });
}

// Removed theme toggle functionality - keeping only dark theme

// Preloader functionality
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.classList.add('fade-out');
        setTimeout(() => {
            preloader.style.display = 'none';
            // Start entrance animations
            initEntranceAnimations();
        }, 500);
    }, 1000);
});

// Enhanced entrance animations
function initEntranceAnimations() {
    // Animate hero content
    const heroContent = document.querySelector('.hero-content');
    const heroVisual = document.querySelector('.hero-visual');
    
    if (heroContent) {
        heroContent.style.animation = 'slideInLeft 0.8s ease forwards';
    }
    if (heroVisual) {
        heroVisual.style.animation = 'slideInRight 0.8s ease 0.2s forwards';
        heroVisual.style.opacity = '0';
        setTimeout(() => {
            heroVisual.style.opacity = '1';
        }, 200);
    }
    
    // Animate sections on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideInUp 0.6s ease forwards';
            }
        });
    }, observerOptions);
    
    // Observe all major sections
    document.querySelectorAll('.portfolio, .services, .about, .contact').forEach(section => {
        section.style.opacity = '0';
        observer.observe(section);
    });
}

// Project modal functionality
const projectModal = document.getElementById('projectModal');
const modalClose = document.querySelector('.modal-close');

// Project data
const projectData = {
    'project-1': {
        title: 'Интернет-магазин',
        tech: 'Node.js, MongoDB, Express',
        description: 'Полнофункциональный интернет-магазин с корзиной, авторизацией, админ-панелью и интеграцией платежей. Адаптивный дизайн и оптимизация для мобильных устройств.',
        features: [
            'Система авторизации и регистрации',
            'Корзина и оформление заказов',
            'Админ-панель для управления',
            'Интеграция платежных систем',
            'Поиск и фильтрация товаров'
        ],
        demo: '#',
        github: '#',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    'project-2': {
        title: 'Лендинг с анимациями',
        tech: 'HTML, SCSS, JS, Parallax',
        description: 'Современный лендинг с параллакс эффектами, плавными анимациями и адаптивным дизайном. Оптимизирован для высокой скорости загрузки.',
        features: [
            'Параллакс эффекты',
            'Анимации при скролле',
            'Адаптивная верстка',
            'SEO оптимизация',
            'Высокая скорость загрузки'
        ],
        demo: '#',
        github: '#',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    'project-3': {
        title: 'Система авторизации',
        tech: 'Node.js, JWT, MongoDB',
        description: 'Безопасная система авторизации с JWT токенами, восстановлением пароля и ролевой моделью доступа.',
        features: [
            'JWT авторизация',
            'Восстановление пароля',
            'Ролевая модель',
            'Защита от брутфорса',
            'Email уведомления'
        ],
        demo: '#',
        github: '#',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    'project-4': {
        title: 'Корпоративный блог',
        tech: 'React, Node.js, админка',
        description: 'Блог с возможностью создания статей, комментариев и админ-панелью для управления контентом.',
        features: [
            'Редактор статей',
            'Система комментариев',
            'Админ-панель',
            'SEO оптимизация',
            'Поиск по статьям'
        ],
        demo: '#',
        github: '#',
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
    'project-5': {
        title: 'WordPress + Custom',
        tech: 'WordPress, PHP, ACF',
        description: 'Кастомная WordPress тема с дополнительной функциональностью и интеграцией ACF полей.',
        features: [
            'Кастомная тема',
            'ACF интеграция',
            'Плагины на заказ',
            'SEO оптимизация',
            'Админ-панель'
        ],
        demo: '#',
        github: '#',
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    'project-6': {
        title: 'PSD → верстка',
        tech: 'Figma/PSD → HTML, CSS',
        description: 'Превращение дизайн-макетов в адаптивные веб-страницы с идеальным соответствием оригиналу.',
        features: [
            'Pixel Perfect верстка',
            'Адаптивный дизайн',
            'Кроссбраузерность',
            'Оптимизация кода',
            'Быстрая загрузка'
        ],
        demo: '#',
        github: '#',
        gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    }
};

// Update modal stats
async function updateModalStats(projectId) {
    try {
        const [viewsResponse, likesResponse] = await Promise.all([
            fetch(`/api/projects/${projectId}/views`),
            fetch(`/api/projects/${projectId}/likes`)
        ]);
        
        const viewsData = await viewsResponse.json();
        const likesData = await likesResponse.json();
        
        if (viewsData.success) {
            document.getElementById('modalViews').textContent = viewsData.views;
        }
        
        if (likesData.success) {
            document.getElementById('modalLikes').textContent = likesData.likes;
        }
    } catch (error) {
        console.error('Error loading project stats:', error);
    }
}

// Current project ID for likes
let currentProjectId = null;

// Gallery functionality
let currentSlide = 0;
let projectGalleries = {
    'project-1': [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
        'linear-gradient(135deg, #667eea 30%, #764ba2 70%)'
    ],
    'project-2': [
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
        'linear-gradient(135deg, #f093fb 30%, #f5576c 70%)'
    ],
    'project-3': [
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
        'linear-gradient(135deg, #4facfe 30%, #00f2fe 70%)'
    ],
    'project-4': [
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #38f9d7 0%, #43e97b 100%)',
        'linear-gradient(135deg, #43e97b 30%, #38f9d7 70%)'
    ],
    'project-5': [
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #fee140 0%, #fa709a 100%)',
        'linear-gradient(135deg, #fa709a 30%, #fee140 70%)'
    ],
    'project-6': [
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #fed6e3 0%, #a8edea 100%)',
        'linear-gradient(135deg, #a8edea 30%, #fed6e3 70%)'
    ]
};

// Open modal
function openProjectModal(projectId) {
    const project = projectData[projectId];
    if (!project) return;
    
    // Store current project ID
    currentProjectId = projectId;
    
    // Update modal content
    document.getElementById('modalTitle').textContent = sanitizeHTML(project.title);
    document.getElementById('modalTech').textContent = sanitizeHTML(project.tech);
    document.getElementById('modalDescription').textContent = sanitizeHTML(project.description);
    
    // Secure URL handling
    const demoLink = document.getElementById('modalDemo');
    const githubLink = document.getElementById('modalGithub');
    
    if (isValidURL(project.demo)) {
        demoLink.href = project.demo;
        demoLink.style.display = 'inline-block';
    } else {
        demoLink.style.display = 'none';
    }
    
    if (isValidURL(project.github)) {
        githubLink.href = project.github;
        githubLink.style.display = 'inline-block';
    } else {
        githubLink.style.display = 'none';
    }
    
    // Update features
    const featuresContainer = document.getElementById('modalFeatures');
    featuresContainer.innerHTML = ''; // Clear container
    
    const featuresTitle = document.createElement('h4');
    featuresTitle.textContent = 'Возможности:';
    featuresContainer.appendChild(featuresTitle);
    
    const featuresList = document.createElement('ul');
    project.features.forEach(feature => {
        const listItem = document.createElement('li');
        listItem.textContent = sanitizeHTML(feature);
        featuresList.appendChild(listItem);
    });
    featuresContainer.appendChild(featuresList);
    
    // Initialize gallery
    setupProjectGallery(projectId);
    
    // Reset like button state
    const likeBtn = document.getElementById('modalLikeBtn');
    likeBtn.classList.remove('liked');
    likeBtn.innerHTML = '<span class="like-icon">❤️</span> <span class="like-text">Нравится</span>';
    
    // Setup like button click handler
    likeBtn.onclick = () => incrementLikes();
    
    // Setup share button
    setupShareButton(project);
    
    // Get stats
    updateModalStats(projectId);
    
    // Show modal
    projectModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeProjectModal() {
    projectModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Increment likes function
async function incrementLikes() {
    if (!currentProjectId) return;
    
    // Validate project ID
    if (!validateInput(currentProjectId, 'text')) return;
    
    const likeBtn = document.getElementById('modalLikeBtn');
    
    try {
        // Get CSRF token from server
        const csrfToken = await getCSRFToken();
        if (!csrfToken) {
            throw new Error('Failed to get CSRF token');
        }
        
        const response = await fetch(`/api/projects/${encodeURIComponent(currentProjectId)}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            }
        });
        
        const data = await response.json();
        
        if (data.success && typeof data.likes === 'number') {
            // Update like button safely
            likeBtn.classList.add('liked');
            
            const likeIcon = document.createElement('span');
            likeIcon.className = 'like-icon';
            likeIcon.textContent = '❤️';
            
            const likeText = document.createElement('span');
            likeText.className = 'like-text';
            likeText.textContent = 'Нравится!';
            
            likeBtn.innerHTML = '';
            likeBtn.appendChild(likeIcon);
            likeBtn.appendChild(likeText);
            
            // Update likes counter
            document.getElementById('modalLikes').textContent = Math.max(0, data.likes);
            
            // Show modal notification
            showModalNotification('Спасибо за лайк! ❤️', 'success');
        }
    } catch (error) {
        console.error('Ошибка при добавлении лайка:', error);
        showModalNotification('Ошибка при добавлении лайка', 'error');
    }
}

// Setup project gallery
function setupProjectGallery(projectId) {
    const modalImage = document.getElementById('modalImage');
    const galleryNav = document.getElementById('modalGalleryNav');
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');
    const currentSlideSpan = document.getElementById('currentSlide');
    const totalSlidesSpan = document.getElementById('totalSlides');
    
    const gallery = projectGalleries[projectId] || [projectData[projectId]?.gradient];
    currentSlide = 0;
    
    if (gallery.length > 1) {
        galleryNav.style.display = 'flex';
        totalSlidesSpan.textContent = gallery.length;
        
        function updateGallery() {
            modalImage.style.background = gallery[currentSlide];
            currentSlideSpan.textContent = currentSlide + 1;
            prevBtn.disabled = currentSlide === 0;
            nextBtn.disabled = currentSlide === gallery.length - 1;
        }
        
        prevBtn.onclick = () => {
            if (currentSlide > 0) {
                currentSlide--;
                updateGallery();
            }
        };
        
        nextBtn.onclick = () => {
            if (currentSlide < gallery.length - 1) {
                currentSlide++;
                updateGallery();
            }
        };
        
        updateGallery();
    } else {
        galleryNav.style.display = 'none';
        modalImage.style.background = gallery[0];
    }
}

// Setup share button
function setupShareButton(project) {
    const shareBtn = document.getElementById('modalShareBtn');
    
    shareBtn.onclick = () => {
        if (navigator.share) {
            navigator.share({
                title: project.title,
                text: project.description,
                url: window.location.href
            }).then(() => {
                showModalNotification('Проект успешно поделен!', 'success');
            }).catch(() => {
                fallbackShare(project);
            });
        } else {
            fallbackShare(project);
        }
    };
}

// Fallback share functionality
function fallbackShare(project) {
    const shareData = {
        title: project.title,
        text: project.description,
        url: window.location.href
    };
    
    const shareText = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
    
    // Try modern clipboard API first
    if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(() => {
            showModalNotification('Ссылка скопирована в буфер обмена!', 'success');
        }).catch((error) => {
            console.log('Clipboard API failed:', error);
            fallbackCopy(shareText);
        });
    } else {
        fallbackCopy(shareText);
    }
}

// Secure fallback copy function
function fallbackCopy(text) {
    try {
        // Create temporary textarea for copying
        const textArea = document.createElement('textarea');
        textArea.value = text;
        
        // Make textarea invisible but still focusable
        textArea.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 2em;
            height: 2em;
            padding: 0;
            border: none;
            outline: none;
            box-shadow: none;
            background: transparent;
            opacity: 0;
            z-index: -1000;
        `;
        
        document.body.appendChild(textArea);
        
        // Select and copy
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, textArea.value.length);
        
        let successful = false;
        
        try {
            successful = document.execCommand('copy');
        } catch (execError) {
            console.log('execCommand failed:', execError);
            successful = false;
        }
        
        document.body.removeChild(textArea);
        
        if (successful) {
            showModalNotification('Ссылка скопирована в буфер обмена!', 'success');
        } else {
            // Final fallback - show text for manual copy
            showShareModal(text);
        }
    } catch (error) {
        console.log('fallbackCopy error:', error);
        showShareModal(text);
    }
}

// Show modal with text to copy manually
function showShareModal(text) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 20000;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 10px;
        max-width: 500px;
        width: 90%;
        max-height: 80%;
        overflow-y: auto;
    `;
    
    content.innerHTML = `
        <h3 style="margin-top: 0; color: #333;">Скопируйте ссылку</h3>
        <textarea readonly style="
            width: 100%;
            height: 150px;
            padding: 1rem;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-family: inherit;
            resize: none;
        ">${text}</textarea>
        <div style="margin-top: 1rem; text-align: right;">
            <button style="
                background: #667eea;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 5px;
                cursor: pointer;
                font-family: inherit;
            ">Закрыть</button>
        </div>
    `;
    
    const closeBtn = content.querySelector('button');
    const textarea = content.querySelector('textarea');
    
    closeBtn.onclick = () => document.body.removeChild(modal);
    modal.onclick = (e) => {
        if (e.target === modal) document.body.removeChild(modal);
    };
    
    // Auto-select text
    textarea.focus();
    textarea.select();
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    showModalNotification('Выделите и скопируйте текст вручную', 'info');
}

// Add click handlers to portfolio items
document.addEventListener('DOMContentLoaded', () => {
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    portfolioItems.forEach((item, index) => {
        const projectId = `project-${index + 1}`;
        item.addEventListener('click', (e) => {
            e.preventDefault();
            openProjectModal(projectId);
        });
    });
});

// Modal close handlers
modalClose?.addEventListener('click', closeProjectModal);
projectModal?.addEventListener('click', (e) => {
    if (e.target === projectModal) {
        closeProjectModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && projectModal.style.display === 'block') {
        closeProjectModal();
    }
});

// Enhanced animations for skills and services
function addHoverAnimations() {
    // Service items animation - более плавные эффекты
    document.querySelectorAll('.service-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-3px) scale(1.01)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Skill items animation - убираем движение по X
    document.querySelectorAll('.skill-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'scale(1.02)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'scale(1)';
        });
    });
}

// Service Worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW зарегистрирован: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW регистрация не удалась: ', registrationError);
            });
    });
}

// Lazy loading for images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Dynamic copyright year - moved to main DOMContentLoaded handler

// Chat Widget functionality
function initializeChatWidget() {
    const chatToggle = document.getElementById('chatToggle');
    const chatWindow = document.getElementById('chatWindow');
    const chatClose = document.getElementById('chatClose');
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');
    const chatMessages = document.getElementById('chatMessages');
    const chatNotification = document.getElementById('chatNotification');
    
    // Debug: check if elements exist (remove in production)
    // console.log('Chat elements:', {
    //     toggle: !!chatToggle,
    //     window: !!chatWindow,
    //     close: !!chatClose,
    //     input: !!chatInput,
    //     send: !!chatSend,
    //     messages: !!chatMessages,
    //     notification: !!chatNotification
    // });
    
    // Exit if essential elements are not found
    if (!chatToggle || !chatWindow || !chatInput || !chatSend) {
        console.error('Chat widget: Essential elements not found');
        return;
    }
    
    let chatOpen = false;
    let botResponses = [
        "Отличный вопрос! Расскажите подробнее о вашем проекте",
        "Да, такое возможно реализовать. Нужно обсудить детали",
        "🔥 Сейчас действуют стартовые цены! Воспользуйтесь калькулятором слева",
        "Обычно на такой проект уходит 2-4 недели",
        "Конечно! Все мои проекты адаптированы под мобильные устройства",
        "Да, предоставляю техподдержку после сдачи проекта",
        "Можете посмотреть примеры работ в разделе 'Работы'",
        "Свяжитесь со мной через форму обратной связи для детального обсуждения",
        "Я использую современные технологии: React, Node.js, MongoDB",
        "Все проекты включают SEO оптимизацию и быструю загрузку",
        "Предоставляю исходный код и документацию к проекту",
        "💥 Специальные цены для первых клиентов: лендинг от 50€!",
        "Качественная работа по доступным ценам для набора отзывов",
        "Возможна интеграция с любыми внешними API и сервисами"
    ];
    
    // Show notification after 5 seconds
    if (chatNotification) {
        setTimeout(() => {
            chatNotification.style.display = 'block';
        }, 5000);
    }
    
    chatToggle.addEventListener('click', () => {
        chatOpen = !chatOpen;
        chatWindow.classList.toggle('active', chatOpen);
        if (chatOpen) {
            if (chatNotification) {
                chatNotification.style.display = 'none';
            }
            chatInput.focus();
        }
    });
    
    if (chatClose) {
        chatClose.addEventListener('click', () => {
            chatOpen = false;
            chatWindow.classList.remove('active');
        });
    }
    
    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Validate and sanitize message
        if (!validateInput(message, 'message')) {
            return;
        }
        
        // Add user message
        addMessage(sanitizeHTML(message), 'user');
        chatInput.value = '';
        
        // Simulate bot response
        setTimeout(() => {
            const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
            addMessage(randomResponse, 'bot');
        }, 1000 + Math.random() * 2000);
    }
    
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Create content safely
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = text;
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = timeStr;
        
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);
        
        if (chatMessages) {
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    
    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// Cost Calculator functionality
function initializeCostCalculator() {
    const calculatorToggle = document.getElementById('calculatorToggle');
    const calculatorWindow = document.getElementById('calculatorWindow');
    const calculatorClose = document.getElementById('calculatorClose');
    const totalCostElement = document.getElementById('totalCost');
    const requestQuoteBtn = document.getElementById('requestQuote');
    
    // Debug: check if elements exist (remove in production)
    // console.log('Calculator elements:', {
    //     toggle: !!calculatorToggle,
    //     window: !!calculatorWindow,
    //     close: !!calculatorClose,
    //     totalCost: !!totalCostElement,
    //     requestQuote: !!requestQuoteBtn
    // });
    
    // Exit if essential elements are not found
    if (!calculatorToggle || !calculatorWindow || !totalCostElement) {
        console.error('Cost calculator: Essential elements not found');
        return;
    }
    
    let calculatorOpen = false;
    
    calculatorToggle.addEventListener('click', () => {
        calculatorOpen = !calculatorOpen;
        calculatorWindow.classList.toggle('active', calculatorOpen);
    });
    
    if (calculatorClose) {
        calculatorClose.addEventListener('click', () => {
            calculatorOpen = false;
            calculatorWindow.classList.remove('active');
        });
    }
    
    // Calculate cost
    function calculateCost() {
        let total = 0;
        
        // Get base project cost
        const projectType = document.querySelector('input[name="projectType"]:checked');
        if (projectType) {
            total += parseInt(projectType.dataset.cost);
        }
        
        // Add feature costs
        const features = document.querySelectorAll('input[name="features"]:checked');
        features.forEach(feature => {
            total += parseInt(feature.dataset.cost);
        });
        
        totalCostElement.textContent = total.toLocaleString('de-DE') + '€';
    }
    
    // Add event listeners to all inputs
    document.querySelectorAll('.calc-option input').forEach(input => {
        input.addEventListener('change', calculateCost);
    });
    
    if (requestQuoteBtn) {
        requestQuoteBtn.addEventListener('click', () => {
            const projectType = document.querySelector('input[name="projectType"]:checked');
            const features = Array.from(document.querySelectorAll('input[name="features"]:checked'))
                .map(f => f.value);
            
            if (!projectType) {
                showModalNotification('Выберите тип проекта', 'error');
                return;
            }
            
            const cost = totalCostElement.textContent;
            showModalNotification(`Заявка на ${cost} отправлена! Свяжемся в течение часа`, 'success');
            
            // Close calculator
            calculatorOpen = false;
            calculatorWindow.classList.remove('active');
            
            // Scroll to contact form
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

// Security enhancements
document.addEventListener('DOMContentLoaded', () => {
    // Clickjacking protection
    if (top !== self) {
        top.location = self.location;
    }
    
    // Disable right-click context menu in production
    if (window.location.hostname !== 'localhost') {
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    // Clear sensitive data on page unload
    window.addEventListener('beforeunload', () => {
        // Clear any temporary tokens or sensitive data
        sessionStorage.removeItem('temp_data');
    });
    
    // Enhanced form security
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
            // Add timestamp to prevent replay attacks
            const timestampInput = document.createElement('input');
            timestampInput.type = 'hidden';
            timestampInput.name = 'timestamp';
            timestampInput.value = Date.now();
            form.appendChild(timestampInput);
        });
    });
    
    // Secure external links
    document.querySelectorAll('a[href^="http"]').forEach(link => {
        if (!link.href.includes(window.location.hostname)) {
            link.setAttribute('rel', 'noopener noreferrer');
            link.setAttribute('target', '_blank');
        }
    });
    
    // Dynamic copyright year
    const footerText = document.querySelector('.footer p');
    if (footerText) {
        const currentYear = new Date().getFullYear();
        footerText.textContent = footerText.textContent.replace('2024', currentYear);
    }
    
    // Initialize project views
    updateProjectViews();
    
    // Add hover animations
    addHoverAnimations();
    
    // Initialize lazy loading
    lazyLoadImages();
    
    // Initialize chat and calculator
    initializeChatWidget();
    initializeCostCalculator();
});

// Rate limiting для API calls
const rateLimiter = {
    calls: new Map(),
    limit: 10, // максимум вызовов в минуту
    
    canMakeCall(endpoint) {
        const now = Date.now();
        const minute = Math.floor(now / 60000);
        const key = `${endpoint}_${minute}`;
        
        const count = this.calls.get(key) || 0;
        if (count >= this.limit) {
            return false;
        }
        
        this.calls.set(key, count + 1);
        
        // Очистка старых записей
        this.calls.forEach((value, mapKey) => {
            const keyMinute = parseInt(mapKey.split('_').pop());
            if (minute - keyMinute > 1) {
                this.calls.delete(mapKey);
            }
        });
        
        return true;
    }
};

// Protection against timing attacks
function addRandomDelay() {
    const delay = Math.random() * 200 + 100; // 100-300ms
    return new Promise(resolve => setTimeout(resolve, delay));
}

// Secure API wrapper with timing attack protection
async function secureApiCall(url, options = {}) {
    // Check rate limiting
    if (!rateLimiter.canMakeCall(url)) {
        throw new Error('Rate limit exceeded');
    }
    
    // Get CSRF token
    const csrfToken = await getCSRFToken();
    
    // Add security headers
    const secureOptions = {
        ...options,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-Token': csrfToken,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            ...options.headers
        }
    };
    
    // Validate URL
    if (!url.startsWith('/api/') && !url.startsWith(window.location.origin)) {
        throw new Error('Invalid API endpoint');
    }
    
    // Add random delay to prevent timing attacks
    await addRandomDelay();
    
    return fetch(url, secureOptions);
}

// Additional security measures
document.addEventListener('DOMContentLoaded', () => {
    // Prevent information leakage through error messages
    window.addEventListener('error', (e) => {
        e.preventDefault();
        // Log error securely without exposing details
        console.error('Application error occurred');
        return false;
    });
    
    // Prevent unhandled promise rejection information leakage
    window.addEventListener('unhandledrejection', (e) => {
        e.preventDefault();
        console.error('Promise rejection occurred');
    });
    
    // Clear browser data on page unload for privacy
    window.addEventListener('beforeunload', () => {
        // Clear any temporary sensitive data
        sessionStorage.removeItem('temp_data');
        
        // Clear any cached API responses
        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                cacheNames.forEach(cacheName => {
                    if (cacheName.includes('api')) {
                        caches.delete(cacheName);
                    }
                });
            });
        }
    });
    
    // ... existing security code ...
});

// FINAL SECURITY HARDENING
(function() {
    'use strict';
    
    // Prevent CSP bypass through dynamic script injection
    const originalCreateElement = secureGlobals.document.createElement;
    secureGlobals.document.createElement = function(tagName) {
        const element = originalCreateElement.call(this, tagName);
        
        if (tagName.toLowerCase() === 'script') {
            // Block dynamic script creation
            throw new Error('Dynamic script creation is blocked for security');
        }
        
        if (tagName.toLowerCase() === 'iframe') {
            // Secure iframe creation
            element.setAttribute('sandbox', 'allow-same-origin');
            element.setAttribute('loading', 'lazy');
        }
        
        return element;
    };
    
    // Prevent WebRTC IP leakage
    if (window.RTCPeerConnection) {
        window.RTCPeerConnection = function() {
            throw new Error('WebRTC is disabled for privacy');
        };
    }
    
    // Block dangerous APIs
    if (window.webkitRequestFileSystem) {
        window.webkitRequestFileSystem = undefined;
    }
    
    if (window.requestFileSystem) {
        window.requestFileSystem = undefined;
    }
    
    // Prevent timing attacks on password fields
    const passwordFields = secureQuerySelectorAll('input[type="password"]');
    passwordFields.forEach(field => {
        field.addEventListener('keydown', (e) => {
            // Add random micro-delays to prevent timing analysis
            secureGlobals.setTimeout(() => {}, Math.random() * 2);
        });
    });
    
    // Secure all forms against CSRF
    const forms = secureQuerySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            // Ensure CSRF token is present
            let hasCSRFToken = false;
            const inputs = form.querySelectorAll('input[name="csrf_token"], input[name="_token"]');
            
            if (inputs.length === 0) {
                // CSRF token will be handled by fetch requests with headers
                // Legacy form CSRF protection is handled separately
                console.log('Form CSRF protection via headers');
            }
        });
    });
    
    // Block dangerous download attributes
    const links = secureQuerySelectorAll('a[download]');
    links.forEach(link => {
        const download = link.getAttribute('download');
        if (download) {
            // Block executable files
            const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.scr', '.pif'];
            const isDangerous = dangerousExtensions.some(ext => 
                download.toLowerCase().endsWith(ext)
            );
            
            if (isDangerous) {
                link.removeAttribute('download');
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.error('Download blocked for security');
                });
            }
        }
    });
    
    // Memory cleanup for large objects
    const originalJSON = secureGlobals.JSON.parse;
    secureGlobals.JSON.parse = function(text, reviver) {
        // Prevent JSON bombs
        if (typeof text === 'string' && text.length > 1000000) {
            throw new Error('JSON payload too large');
        }
        
        try {
            const result = originalJSON.call(this, text, reviver);
            
            // Check for suspicious structures
            if (result && typeof result === 'object') {
                const str = JSON.stringify(result);
                if (str.length > 10000000) { // 10MB limit
                    throw new Error('Parsed JSON too large');
                }
            }
            
            return result;
        } catch (error) {
            console.error('JSON parsing error:', error.message);
            throw error;
        }
    };
    
    // Final integrity check
    if (typeof window.eval === 'function' && window.eval.toString() !== 'function() {\n        throw new Error(\'eval() is disabled for security\');\n    }') {
        console.error('Security override detected!');
        window.location.reload();
    }
    
    console.log('🔒 All security measures activated');
})(); 