const CACHE_NAME = 'techportal-v1.1-fixed';
const ALLOWED_ORIGINS = [
    self.location.origin,
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
];

const urlsToCache = [
    '/',
    '/styles.css',
    '/script.js',
    '/manifest.json'
];

// Secure URL validation
function isValidCacheUrl(url) {
    try {
        const parsedUrl = new URL(url);

        // Only allow HTTPS (except localhost)
        if (parsedUrl.protocol !== 'https:' &&
            !parsedUrl.hostname.includes('localhost') &&
            parsedUrl.hostname !== '127.0.0.1') {
            return false;
        }

        // Check allowed origins
        const isAllowedOrigin = ALLOWED_ORIGINS.some(origin =>
            parsedUrl.href.startsWith(origin)
        );

        if (!isAllowedOrigin) {
            return false;
        }

        // Block dangerous file types
        const dangerousExtensions = ['.php', '.asp', '.jsp', '.py', '.exe', '.bat'];
        const pathname = parsedUrl.pathname.toLowerCase();

        if (dangerousExtensions.some(ext => pathname.includes(ext))) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
}

// Secure request validation
function isValidRequest(request) {
    // Only cache GET requests to static resources
    if (request.method !== 'GET') {
        return false;
    }

    // Не кэшируем API запросы
    if (request.url.includes('/api/')) {
        return false;
    }

    // Кэшируем только статические ресурсы
    const staticExtensions = ['.css', '.js', '.html', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
    const hasStaticExtension = staticExtensions.some(ext => 
        request.url.toLowerCase().includes(ext)
    );

    return hasStaticExtension || request.url.includes('.html') || request.url.endsWith('/');
}

// Enhanced fetch with security checks
async function secureFetch(request) {
    try {
        // Простой fetch без излишних ограничений
        const response = await fetch(request);

        // Базовая валидация только для критических ошибок
        if (response.status >= 500) {
            throw new Error('Server error');
        }

        return response;
    } catch (error) {
        console.warn('Fetch failed, fallback:', error.message);
        // Возвращаем оригинальный запрос без кэширования
        return fetch(request);
    }
}

// Установка Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async (cache) => {
                const validUrls = urlsToCache.filter(url => isValidCacheUrl(url));

                // Cache URLs securely one by one
                for (const url of validUrls) {
                    try {
                        const request = new Request(url);
                        if (isValidRequest(request)) {
                            const response = await secureFetch(request);
                            await cache.put(request, response);
                        }
                    } catch (error) {
                        console.error(`Failed to cache ${url}:`, error.message);
                    }
                }

                // Skip waiting for immediate activation
                self.skipWaiting();
            })
    );
});

// Перехват fetch запросов с упрощенной логикой
self.addEventListener('fetch', (event) => {
    // Только для кэшируемых статических ресурсов
    if (!isValidRequest(event.request)) {
        return; // Браузер обработает остальные запросы
    }

    event.respondWith(
        caches.match(event.request)
            .then(async (response) => {
                // Возвращаем кэшированный ответ если есть
                if (response) {
                    // Обновляем кэш в фоне для следующего раза
                    secureFetch(event.request).then(freshResponse => {
                        if (freshResponse && freshResponse.ok) {
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(event.request, freshResponse.clone());
                            });
                        }
                    }).catch(() => {
                        // Игнорируем ошибки фонового обновления
                    });
                    
                    return response;
                }

                // Загружаем и кэшируем новый ресурс
                return secureFetch(event.request).then(freshResponse => {
                    if (freshResponse && freshResponse.ok) {
                        const responseToCache = freshResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return freshResponse;
                });
            })
            .catch(() => {
                // Простой fallback без кэширования
                return fetch(event.request);
            })
    );
});

// Активация Service Worker и очистка старых кешей
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            // Clean old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),

            // Claim all clients immediately
            self.clients.claim()
        ])
    );
});

// Handle errors securely
self.addEventListener('error', (event) => {
    console.error('Service Worker error:', event.error?.message || 'Unknown error');
    event.preventDefault();
});

// Handle unhandled promise rejections
self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker promise rejection:', event.reason?.message || 'Unknown rejection');
    event.preventDefault();
});
