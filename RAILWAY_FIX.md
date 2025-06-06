# 🔧 Исправление проблемы авторизации на Railway

## Проблема
Авторизация админа не работает, потому что переменная `ADMIN_PASSWORD_HASH` не настроена в Railway.

## Решение

### Вариант 1: Использовать простой пароль (временно)
1. В Railway Dashboard → Variables добавьте:
   - `ADMIN_PASSWORD`: ваш_пароль_здесь
   - Удалите `ADMIN_PASSWORD_HASH` если есть

### Вариант 2: Настроить хэш пароля (рекомендуется)
1. Локально выполните:
```bash
node -e "
const bcrypt = require('bcrypt');
const password = 'ВАШ_ПАРОЛЬ_ЗДЕСЬ'; // Замените на свой пароль
const hash = bcrypt.hashSync(password, 12);
console.log('ADMIN_PASSWORD_HASH =', hash);
"
```

2. Скопируйте результат в Railway Variables:
   - Name: `ADMIN_PASSWORD_HASH`
   - Value: полученный хэш

3. Удалите переменную `ADMIN_PASSWORD` если есть

### Вариант 3: Быстрое исправление в коде
Временно измените дефолтный пароль в коде на ваш настоящий.

## Проверка
После настройки Railway автоматически перезапустится и авторизация заработает.

## Debug
Проверьте логи Railway на наличие сообщений:
- `ADMIN_PASSWORD_HASH exists: true/false`
- `Using fallback password: true/false` 