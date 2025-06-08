// ========== API UTILITIES MODULE ==========
// Модуль для безопасных API запросов с rate limiting

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
    const csrfToken = await window.SecurityModule.getCSRFToken();
    
    // Add security headers
    const secureOptions = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Cache-Control': 'no-cache',
            ...options.headers
        },
        credentials: 'include'
    };
    
    // Add timing attack protection
    await addRandomDelay();
    
    try {
        const response = await fetch(url, secureOptions);
        
        // Check for rate limiting headers
        const remaining = response.headers.get('RateLimit-Remaining');
        if (remaining && parseInt(remaining) < 5) {
            console.warn(`Rate limit warning: ${remaining} requests remaining`);
        }
        
        if (!response.ok) {
            // Handle different HTTP status codes
            switch (response.status) {
                case 429:
                    throw new Error('Rate limit exceeded. Please wait before trying again.');
                case 403:
                    throw new Error('Access denied. Please refresh the page.');
                case 401:
                    throw new Error('Authentication required. Please refresh the page.');
                case 500:
                    throw new Error('Server error. Please try again later.');
                default:
                    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
            }
        }
        
        // Try to parse JSON response
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            
            // Validate response structure
            if (typeof data !== 'object' || data === null) {
                throw new Error('Invalid response format');
            }
            
            return data;
        } else {
            return await response.text();
        }
        
    } catch (error) {
        // Add timing protection even for errors
        await addRandomDelay();
        
        console.error('API call failed:', {
            url,
            error: error.message,
            timestamp: new Date().toISOString()
        });
        
        throw error;
    }
}

// Specialized API functions
async function updateProjectViews() {
    // Пропускаем API вызовы в режиме разработки
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1') {
        console.log('🔧 Skipping API call in development mode: updateProjectViews');
        return;
    }
    
    try {
        const result = await secureApiCall('/api/portfolio/views', {
            method: 'POST',
            body: JSON.stringify({
                page: window.location.pathname,
                timestamp: Date.now()
            })
        });
        
        if (result.success) {
            console.log('Project views updated');
        }
    } catch (error) {
        console.warn('Failed to update project views:', error.message);
        // Non-critical error, don't throw
    }
}

async function incrementLikes() {
    try {
        const button = secureQuerySelector('.like-btn');
        if (!button) return;
        
        // Prevent spam clicking
        if (button.disabled) return;
        button.disabled = true;
        
        const projectId = button.dataset.projectId || 'unknown';
        
        const result = await secureApiCall('/api/portfolio/like', {
            method: 'POST',
            body: JSON.stringify({
                projectId,
                timestamp: Date.now()
            })
        });
        
        if (result.success) {
            // Update UI
            const likesCount = secureQuerySelector('.likes-count');
            if (likesCount && result.likes) {
                likesCount.textContent = result.likes;
            }
            
            // Add visual feedback
            button.classList.add('liked');
            setTimeout(() => {
                button.classList.remove('liked');
            }, 1000);
        }
        
    } catch (error) {
        console.error('Failed to increment likes:', error.message);
        
        // Show user-friendly error
        if (window.NotificationModule) {
            window.NotificationModule.showNotification('Не удалось поставить лайк. Попробуйте позже.', 'error');
        }
    } finally {
        // Re-enable button after delay
        setTimeout(() => {
            const button = secureQuerySelector('.like-btn');
            if (button) button.disabled = false;
        }, 2000);
    }
}

// Development helpers (только для localhost и Railway staging)
function initApiHelpers() {
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.includes('railway.app')) {
        
        // Добавляем функции в window для отладки
        window.resetRateLimit = () => rateLimiter.reset();
        window.rateLimitStats = () => {
            console.log('Rate Limiter Stats:', rateLimiter.getStats());
            return rateLimiter.getStats();
        };
        window.testApiCall = async (url, options) => {
            try {
                const result = await secureApiCall(url, options);
                console.log('API Test Result:', result);
                return result;
            } catch (error) {
                console.error('API Test Error:', error);
                return { error: error.message };
            }
        };
        
        console.log('🛠️ API Development helpers available:', 
                    'resetRateLimit(), rateLimitStats(), testApiCall()');
    }
}

// Export functions for other modules
window.ApiModule = {
    secureApiCall,
    updateProjectViews,
    incrementLikes,
    rateLimiter,
    initApiHelpers
}; 