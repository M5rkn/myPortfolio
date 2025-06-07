// ========== UTILS MODULE ==========
// Утилитарные функции, хелперы и lazy loading

// Lazy load images
function lazyLoadImages() {
    const lazyImages = secureQuerySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    
                    // Create a new image to preload
                    const newImage = new Image();
                    newImage.onload = () => {
                        image.src = image.dataset.src;
                        image.classList.add('loaded');
                        image.removeAttribute('data-src');
                    };
                    newImage.src = image.dataset.src;
                    
                    imageObserver.unobserve(image);
                }
            });
        }, {
            rootMargin: '50px'
        });
        
        lazyImages.forEach(image => {
            imageObserver.observe(image);
        });
    } else {
        // Fallback for older browsers
        lazyImages.forEach(image => {
            image.src = image.dataset.src;
            image.removeAttribute('data-src');
        });
    }
}

// Debounce function for performance optimization
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Format numbers with locale
function formatNumber(number, locale = 'ru-RU') {
    return new Intl.NumberFormat(locale).format(number);
}

// Format currency
function formatCurrency(amount, currency = 'RUB', locale = 'ru-RU') {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// Format date
function formatDate(date, options = {}, locale = 'ru-RU') {
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(new Date(date));
}

// Get device type
function getDeviceType() {
    const width = window.innerWidth;
    
    if (width <= 480) return 'mobile';
    if (width <= 768) return 'tablet';
    if (width <= 1024) return 'laptop';
    return 'desktop';
}

// Check if device supports touch
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Check if device is mobile
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Get browser info
function getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';
    
    if (userAgent.indexOf('Chrome') > -1) {
        browserName = 'Chrome';
        browserVersion = userAgent.match(/Chrome\/(\d+)/)?.[1];
    } else if (userAgent.indexOf('Firefox') > -1) {
        browserName = 'Firefox';
        browserVersion = userAgent.match(/Firefox\/(\d+)/)?.[1];
    } else if (userAgent.indexOf('Safari') > -1) {
        browserName = 'Safari';
        browserVersion = userAgent.match(/Version\/(\d+)/)?.[1];
    } else if (userAgent.indexOf('Edge') > -1) {
        browserName = 'Edge';
        browserVersion = userAgent.match(/Edge\/(\d+)/)?.[1];
    }
    
    return { browserName, browserVersion };
}

// Copy text to clipboard
function copyToClipboard(text) {
    if (navigator.clipboard) {
        return navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            return successful ? Promise.resolve() : Promise.reject();
        } catch (err) {
            document.body.removeChild(textArea);
            return Promise.reject(err);
        }
    }
}

// Generate unique ID
function generateUID(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Scroll to element smoothly
function scrollToElement(element, offset = 0, behavior = 'smooth') {
    if (typeof element === 'string') {
        element = secureQuerySelector(element);
    }
    
    if (!element) return;
    
    const elementPosition = element.offsetTop - offset;
    
    window.scrollTo({
        top: elementPosition,
        behavior: behavior
    });
}

// Wait for element to exist
function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const element = secureQuerySelector(selector);
        if (element) {
            resolve(element);
            return;
        }
        
        const observer = new MutationObserver((mutations, obs) => {
            const element = secureQuerySelector(selector);
            if (element) {
                obs.disconnect();
                resolve(element);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
    });
}

// Get scroll position
function getScrollPosition() {
    return {
        x: window.pageXOffset || document.documentElement.scrollLeft,
        y: window.pageYOffset || document.documentElement.scrollTop
    };
}

// Set scroll position
function setScrollPosition(x = 0, y = 0, behavior = 'auto') {
    window.scrollTo({
        left: x,
        top: y,
        behavior: behavior
    });
}

// Check if element is in viewport
function isInViewport(element, threshold = 0) {
    if (typeof element === 'string') {
        element = secureQuerySelector(element);
    }
    
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    return (
        rect.top >= -threshold &&
        rect.left >= -threshold &&
        rect.bottom <= windowHeight + threshold &&
        rect.right <= windowWidth + threshold
    );
}

// Get element position relative to document
function getElementPosition(element) {
    if (typeof element === 'string') {
        element = secureQuerySelector(element);
    }
    
    if (!element) return { top: 0, left: 0 };
    
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    return {
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft
    };
}

// Local storage helpers
const storage = {
    set(key, value, expiry = null) {
        const item = {
            value: value,
            expiry: expiry ? Date.now() + expiry : null
        };
        localStorage.setItem(key, JSON.stringify(item));
    },
    
    get(key) {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;
        
        try {
            const item = JSON.parse(itemStr);
            
            if (item.expiry && Date.now() > item.expiry) {
                localStorage.removeItem(key);
                return null;
            }
            
            return item.value;
        } catch (e) {
            return null;
        }
    },
    
    remove(key) {
        localStorage.removeItem(key);
    },
    
    clear() {
        localStorage.clear();
    }
};

// Session storage helpers
const sessionStore = {
    set(key, value) {
        sessionStorage.setItem(key, JSON.stringify(value));
    },
    
    get(key) {
        const itemStr = sessionStorage.getItem(key);
        if (!itemStr) return null;
        
        try {
            return JSON.parse(itemStr);
        } catch (e) {
            return null;
        }
    },
    
    remove(key) {
        sessionStorage.removeItem(key);
    },
    
    clear() {
        sessionStorage.clear();
    }
};

// Performance monitoring
const performance = {
    marks: {},
    
    mark(name) {
        this.marks[name] = Date.now();
    },
    
    measure(name, startMark) {
        const endTime = Date.now();
        const startTime = this.marks[startMark];
        
        if (!startTime) {
            console.warn(`Start mark '${startMark}' not found`);
            return 0;
        }
        
        const duration = endTime - startTime;
        console.log(`${name}: ${duration}ms`);
        return duration;
    }
};

// Update dynamic copyright year
function updateCopyrightYear() {
    const footerText = secureQuerySelector('.footer p, footer p');
    if (footerText) {
        const currentYear = new Date().getFullYear();
        footerText.textContent = footerText.textContent.replace(/\d{4}/, currentYear);
    }
}

// Initialize utility functions
function initUtils() {
    lazyLoadImages();
    updateCopyrightYear();
    
    // Log device info for debugging
    if (window.location.hostname === 'localhost') {
        console.log('Device Info:', {
            type: getDeviceType(),
            isMobile: isMobile(),
            isTouch: isTouchDevice(),
            browser: getBrowserInfo()
        });
    }
}

// Export utils module
window.UtilsModule = {
    lazyLoadImages,
    debounce,
    throttle,
    formatNumber,
    formatCurrency,
    formatDate,
    getDeviceType,
    isTouchDevice,
    isMobile,
    getBrowserInfo,
    copyToClipboard,
    generateUID,
    scrollToElement,
    waitForElement,
    getScrollPosition,
    setScrollPosition,
    isInViewport,
    getElementPosition,
    storage,
    sessionStore,
    performance,
    updateCopyrightYear,
    initUtils
}; 