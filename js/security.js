// ========== SECURITY MODULE ==========
// Защита от различных атак и валидация данных

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

// Get CSRF token from server with Railway compatibility
async function getCSRFToken() {
    try {
        // Try to get cached token first
        let token = sessionStorage.getItem('csrf_token');
        const tokenTime = sessionStorage.getItem('csrf_token_time');
        
        // Extended cache time for Railway (10 minutes)
        const cacheTime = window.location.hostname.includes('railway.app') ? 10 * 60 * 1000 : 5 * 60 * 1000;
        
        if (token && tokenTime && (Date.now() - parseInt(tokenTime)) < cacheTime) {
            return token;
        }
        
        // Request new token from server with retry logic
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
            try {
                const response = await fetch('/api/csrf-token', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.token) {
                        sessionStorage.setItem('csrf_token', data.token);
                        sessionStorage.setItem('csrf_token_time', Date.now().toString());
                        return data.token;
                    }
                }
                
                // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
                retryCount++;
                
            } catch (error) {
                console.warn(`CSRF token request failed (attempt ${retryCount + 1}):`, error);
                retryCount++;
                
                if (retryCount < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
                }
            }
        }
        
        // Enhanced fallback for different environments
        if (window.location.hostname.includes('railway.app') || 
            window.location.hostname.includes('herokuapp.com') ||
            window.location.hostname.includes('vercel.app')) {
            // Generate secure fallback token
            const fallbackToken = 'fallback_' + Math.random().toString(36).substring(2, 15) + 
                                Math.random().toString(36).substring(2, 15) + '_' + Date.now();
            
            sessionStorage.setItem('csrf_token', fallbackToken);
            sessionStorage.setItem('csrf_token_time', Date.now().toString());
            
            console.warn('Using fallback CSRF token for production environment');
            return fallbackToken;
        }
        
        // For other production environments - return null
        console.error('Failed to get CSRF token after all retries');
        return null;
        
    } catch (error) {
        console.error('CSRF token error:', error);
        return null;
    }
}

// Email validation
function isValidEmail(email) {
    return validateInput(email, 'email');
}

// Rate limiting для API calls
const rateLimiter = {
    calls: new Map(),
    limit: 50, // увеличиваем лимит до 50 вызовов в минуту
    
    canMakeCall(endpoint) {
        // Разные лимиты для разных типов запросов
        let currentLimit = this.limit;
        
        if (endpoint.includes('/csrf-token')) {
            currentLimit = 100; // CSRF токены можно запрашивать чаще
        } else if (endpoint.includes('/like') || endpoint.includes('/view')) {
            currentLimit = 30; // Лайки и просмотры - средний лимит
        } else if (endpoint.includes('/contact')) {
            currentLimit = 5; // Контактные формы - строгий лимит
        }
        
        const now = Date.now();
        const minute = Math.floor(now / 60000);
        const key = `${endpoint}_${minute}`;
        
        const count = this.calls.get(key) || 0;
        if (count >= currentLimit) {
            console.warn(`Rate limit exceeded for ${endpoint}: ${count}/${currentLimit}`);
            return false;
        }
        
        this.calls.set(key, count + 1);
        
        // Очистка старых записей (оптимизировано)
        if (this.calls.size > 100) { // Очищаем только если слишком много записей
            this.calls.forEach((value, mapKey) => {
                const keyMinute = parseInt(mapKey.split('_').pop());
                if (minute - keyMinute > 2) { // Храним данные 2 минуты
                    this.calls.delete(mapKey);
                }
            });
        }
        
        return true;
    },
    
    // Функция для сброса rate limiter (для отладки)
    reset() {
        this.calls.clear();
        console.log('Rate limiter reset');
    },
    
    // Получить статистику вызовов
    getStats() {
        return {
            totalEntries: this.calls.size,
            calls: Array.from(this.calls.entries())
        };
    }
};

// Protection against timing attacks
function addRandomDelay() {
    const delay = Math.random() * 200 + 100; // 100-300ms
    return new Promise(resolve => setTimeout(resolve, delay));
}

// Secure API wrapper with timing attack protection
async function secureApiCall(url, options = {}) {
    // Check rate limiting with retry logic
    if (!rateLimiter.canMakeCall(url)) {
        // Ждем и пробуем еще раз через короткое время
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!rateLimiter.canMakeCall(url)) {
            throw new Error('Rate limit exceeded - please try again in a moment');
        }
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

// Security initialization
function initSecurity() {
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
    
    // Security event handlers
    window.addEventListener('error', (e) => {
        e.preventDefault();
        console.error('Application error occurred');
        return false;
    });
    
    window.addEventListener('unhandledrejection', (e) => {
        e.preventDefault();
        console.error('Promise rejection occurred');
    });
    
    window.addEventListener('beforeunload', () => {
        sessionStorage.removeItem('temp_data');
        
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
}

// Export functions
window.SecurityModule = {
    sanitizeHTML,
    validateInput,
    isValidURL,
    getCSRFToken,
    isValidEmail,
    rateLimiter,
    addRandomDelay,
    secureApiCall,
    initSecurity
}; 