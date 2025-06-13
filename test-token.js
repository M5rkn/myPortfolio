// Тестовый скрипт для проверки токена
console.log('=== ТЕСТ ТОКЕНА ===');

const token = localStorage.getItem('authToken');
console.log('1. Токен существует:', !!token);

if (token) {
    console.log('2. Токен:', token.substring(0, 50) + '...');
    
    try {
        const parts = token.split('.');
        console.log('3. Части токена:', parts.length);
        
        if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            console.log('4. Payload токена:', payload);
            
            const now = Date.now();
            const exp = payload.exp * 1000;
            console.log('5. Текущее время:', new Date(now));
            console.log('6. Истекает:', new Date(exp));
            console.log('7. Токен истек:', now >= exp);
            
            if (payload.name) {
                console.log('8. Имя пользователя (raw):', payload.name);
                console.log('9. Имя пользователя (chars):', Array.from(payload.name).map(c => `${c}(${c.charCodeAt(0)})`).join(' '));
            }
        }
    } catch (error) {
        console.error('Ошибка парсинга токена:', error);
    }
} else {
    console.log('2. Токен отсутствует');
}

console.log('=== КОНЕЦ ТЕСТА ==='); 