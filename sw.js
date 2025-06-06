const CACHE_NAME = 'techportal-v1.0.0';
const urlsToCache = [
    '/',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Кеш открыт');
                return cache.addAll(urlsToCache);
            })
    );
});

// Перехват fetch запросов
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Возвращаем кешированный ресурс или загружаем из сети
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

// Активация Service Worker и очистка старых кешей
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Удаляем старый кеш:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
}); 