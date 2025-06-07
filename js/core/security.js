// ========== SECURITY CORE MODULE ==========
// Модуль безопасности с валидацией и защитой от XSS, CSRF

// CRITICAL SECURITY: Freeze prototypes to prevent pollution
(function() {
    'use strict';
    
    // Secure DOM query functions
    function secureGetElementById(id) {
        try {
            if (typeof id !== 'string') {
                console.warn('Invalid element ID type');
                return null;
            }
            return document.getElementById(id);
        } catch (error) {
            console.error('Error in getElementById:', error);
            return null;
        }
    }
    
    function secureQuerySelector(selector) {
        try {
            if (typeof selector !== 'string') {
                console.warn('Invalid selector type');
                return null;
            }
            return document.querySelector(selector);
        } catch (error) {
            console.error('Error in querySelector:', error);
            return null;
        }
    }
    
    function secureQuerySelectorAll(selector) {
        try {
            if (typeof selector !== 'string') {
                console.warn('Invalid selector type');
                return [];
            }
            return document.querySelectorAll(selector);
        } catch (error) {
            console.error('Error in querySelectorAll:', error);
            return [];
        }
    }
    
    // Export secure functions to global scope
    window.secureGetElementById = secureGetElementById;
    window.secureQuerySelector = secureQuerySelector;
    window.secureQuerySelectorAll = secureQuerySelectorAll;
})();

// HTML Sanitization function для предотвращения XSS
function sanitizeHTML(str) {
    if (!str || typeof str !== 'string') return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// Enhanced input validation
function validateInput(input, type = 'text') {
    if (!input || typeof input !== 'string') return false;
    
    // Length check
    if (input.length > 10000) return false;
    
    const cleaned = input.trim();
    
    switch (type) {
        case 'email':
            if (cleaned.length > 254 || cleaned.length < 5) return false;
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned);
            
        case 'name':
            if (cleaned.length < 2 || cleaned.length > 50) return false;
            return /^[a-zA-Zа-яёА-ЯЁ\s-]+$/.test(cleaned);
            
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
        return ['http:', 'https:'].includes(parsedURL.protocol);
    } catch {
        return false;
    }
}

// CSRF Token generation and retrieval
let csrfToken = null;

function generateCSRFToken() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    const userAgent = navigator.userAgent.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
    
    const tokenData = `${timestamp}-${random}-${userAgent}`;
    
    // Simple hash function for client-side token
    let hash = 0;
    for (let i = 0; i < tokenData.length; i++) {
        const char = tokenData.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    
    return `csrf_${Math.abs(hash).toString(36)}_${timestamp}`;
}

async function getCSRFToken() {
    // Return cached token if still valid (valid for 30 minutes)
    if (csrfToken) {
        try {
            const tokenParts = csrfToken.split('_');
            const timestamp = parseInt(tokenParts[tokenParts.length - 1]);
            const now = Date.now();
            
            // Token is valid for 30 minutes
            if (now - timestamp < 30 * 60 * 1000) {
                return csrfToken;
            }
        } catch (error) {
            console.warn('Invalid CSRF token format, regenerating...');
        }
    }
    
    // Generate new token
    csrfToken = generateCSRFToken();
    
    // Store in sessionStorage for persistence across page loads
    try {
        sessionStorage.setItem('csrf_token', csrfToken);
    } catch (error) {
        console.warn('Could not store CSRF token in session storage');
    }
    
    return csrfToken;
}

// Try to restore token from sessionStorage on load
function restoreCSRFToken() {
    try {
        const storedToken = sessionStorage.getItem('csrf_token');
        if (storedToken) {
            const tokenParts = storedToken.split('_');
            const timestamp = parseInt(tokenParts[tokenParts.length - 1]);
            const now = Date.now();
            
            // Check if token is still valid (30 minutes)
            if (now - timestamp < 30 * 60 * 1000) {
                csrfToken = storedToken;
                console.log('🔒 CSRF token restored from session');
            } else {
                sessionStorage.removeItem('csrf_token');
            }
        }
    } catch (error) {
        console.warn('Could not restore CSRF token from session storage');
    }
}

// Security initialization function
function initializeSecurity() {
    // Restore CSRF token
    restoreCSRFToken();
    
    // Secure external links
    document.querySelectorAll('a[href^="http"]').forEach(link => {
        if (!link.href.includes(window.location.hostname)) {
            link.setAttribute('rel', 'noopener noreferrer');
            link.setAttribute('target', '_blank');
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
    
    // Security event handlers
    window.addEventListener('error', (e) => {
        console.error('Application error:', e.error);
    });
    
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Promise rejection:', e.reason);
    });
    
    console.log('🔒 Security module initialized');
}

// Export functions for other modules
window.SecurityModule = {
    sanitizeHTML,
    validateInput,
    isValidURL,
    getCSRFToken,
    initializeSecurity
}; 