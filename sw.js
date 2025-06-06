const CACHE_NAME = 'techportal-v1.0.0';
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
    // Only cache GET requests
    if (request.method !== 'GET') {
        return false;
    }
    
    // Validate URL
    if (!isValidCacheUrl(request.url)) {
        return false;
    }
    
    // Block requests with dangerous headers
    const dangerousHeaders = ['x-forwarded-for', 'x-real-ip', 'host'];
    for (const header of dangerousHeaders) {
        if (request.headers.has(header)) {
            return false;
        }
    }
    
    return true;
}

// Enhanced fetch with security checks
async function secureFetch(request) {
    // Clone request for security
    const clonedRequest = request.clone();
    
    // Add security headers
    const secureHeaders = new Headers(clonedRequest.headers);
    secureHeaders.set('X-Requested-With', 'ServiceWorker');
    secureHeaders.set('Cache-Control', 'max-age=3600');
    
    const secureRequest = new Request(clonedRequest.url, {
        method: clonedRequest.method,
        headers: secureHeaders,
        mode: 'cors',
        credentials: 'omit', // Don't send credentials
        cache: 'default'
    });
    
    try {
        const response = await fetch(secureRequest);
        
        // Validate response
        if (!response.ok || response.status >= 400) {
            throw new Error('Invalid response');
        }
        
        // Check content type
        const contentType = response.headers.get('content-type') || '';
        const allowedTypes = [
            'text/html',
            'text/css', 
            'application/javascript',
            'text/javascript',
            'application/json',
            'image/',
            'font/'
        ];
        
        const isAllowedType = allowedTypes.some(type => 
            contentType.toLowerCase().includes(type.toLowerCase())
        );
        
        if (!isAllowedType) {
            throw new Error('Invalid content type');
        }
        
        return response;
    } catch (error) {
        console.error('Secure fetch failed:', error.message);
        return new Response('Resource not available', { status: 503 });
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

// Перехват fetch запросов с усиленной безопасностью
self.addEventListener('fetch', (event) => {
    // Only handle valid requests
    if (!isValidRequest(event.request)) {
        return; // Let browser handle invalid requests
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(async (response) => {
                // Return cached response if valid
                if (response) {
                    // Validate cached response
                    const cacheDate = response.headers.get('date');
                    if (cacheDate) {
                        const age = Date.now() - new Date(cacheDate).getTime();
                        // Refresh cache if older than 24 hours
                        if (age > 24 * 60 * 60 * 1000) {
                            return secureFetch(event.request);
                        }
                    }
                    return response;
                }
                
                // Fetch and cache new response
                return secureFetch(event.request);
            })
            .catch(() => {
                // Return fallback for errors
                return new Response('Service temporarily unavailable', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: { 'Content-Type': 'text/plain' }
                });
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