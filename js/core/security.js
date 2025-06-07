// ========== SECURITY CORE MODULE ==========
// Модуль безопасности с валидацией и защитой от XSS, CSRF

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
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const data = await response.json();
                
                if (!data.token) {
                    throw new Error('No token received');
                }
                
                // Cache the token
                sessionStorage.setItem('csrf_token', data.token);
                sessionStorage.setItem('csrf_token_time', Date.now().toString());
                
                return data.token;
                
            } catch (error) {
                retryCount++;
                console.warn(`CSRF token fetch attempt ${retryCount} failed:`, error.message);
                
                if (retryCount < maxRetries) {
                    // Exponential backoff for Railway
                    const delay = Math.pow(2, retryCount) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    // Fallback: use timestamp-based token
                    const fallbackToken = btoa(Date.now() + ':' + Math.random()).replace(/[^a-zA-Z0-9]/g, '');
                    sessionStorage.setItem('csrf_token', fallbackToken);
                    sessionStorage.setItem('csrf_token_time', Date.now().toString());
                    console.warn('Using fallback CSRF token');
                    return fallbackToken;
                }
            }
        }
    } catch (error) {
        console.error('CSRF token error:', error);
        // Return fallback token
        const fallbackToken = btoa(Date.now() + ':' + Math.random()).replace(/[^a-zA-Z0-9]/g, '');
        return fallbackToken;
    }
}

// Security initialization function
function initializeSecurity() {
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
}

// Export functions for other modules
window.SecurityModule = {
    sanitizeHTML,
    validateInput,
    isValidURL,
    getCSRFToken,
    initializeSecurity
}; 