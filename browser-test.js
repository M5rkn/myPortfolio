// 🔍 РАСШИРЕННЫЙ ТЕСТЕР TECHPORTAL - Вставьте этот код в консоль браузера (F12)

(function() {
    console.clear();
    console.log('%c🔍 ЗАПУСК РАСШИРЕННОЙ ДИАГНОСТИКИ TECHPORTAL', 'background: #0f4f0f; color: #00ff00; padding: 10px; font-size: 16px; font-weight: bold;');
    
    const results = [];
    let errors = [];
    let warnings = [];
    
    // Функция логирования
    function testLog(message, status = 'info', details = null) {
        const symbols = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        const colors = { 
            success: 'color: #00ff00; font-weight: bold;',
            error: 'color: #ff0000; font-weight: bold;', 
            warning: 'color: #ffff00; font-weight: bold;',
            info: 'color: #00aaff;'
        };
        
        console.log(`%c${symbols[status]} ${message}`, colors[status]);
        if (details) console.log(details);
        
        results.push({ message, status, details, timestamp: new Date().toISOString() });
    }

    // ТЕСТ 1: Проверка загрузки модулей
    testLog('ТЕСТ 1: Проверка модулей JavaScript', 'info');
    
    const requiredModules = [
        'SecurityModule',
        'ApiModule', 
        'NavigationModule',
        'FormsModule',
        'PortfolioModule',
        'ChatModule',

        'AnimationsModule',
        'ParticlesModule'
    ];
    
    let loadedModules = 0;
    const moduleDetails = {};
    
    requiredModules.forEach(moduleName => {
        const module = window[moduleName];
        if (module && typeof module === 'object') {
            testLog(`${moduleName} - загружен`, 'success');
            loadedModules++;
            
            // Проверяем функции модуля
            const functions = Object.keys(module).filter(key => typeof module[key] === 'function');
            moduleDetails[moduleName] = functions;
            
            if (functions.length > 0) {
                console.log(`   Функции: ${functions.join(', ')}`);
            }
        } else {
            testLog(`${moduleName} - НЕ ЗАГРУЖЕН`, 'error');
        }
    });
    
    testLog(`Итого модулей загружено: ${loadedModules}/${requiredModules.length}`, 
            loadedModules === requiredModules.length ? 'success' : 'warning');

    // ТЕСТ 2: Проверка критических DOM элементов
    testLog('ТЕСТ 2: Проверка DOM структуры', 'info');
    
    const criticalElements = [
        { selector: '#particles-js', name: 'Контейнер частиц', critical: true },
        { selector: '.navbar', name: 'Навигационная панель', critical: true },
        { selector: '.hero', name: 'Главная секция', critical: true },
        { selector: '.portfolio', name: 'Секция портфолио', critical: true },
        { selector: '.chat-widget', name: 'Виджет чата', critical: false },

        { selector: '.contact-form', name: 'Форма контактов', critical: false },
        { selector: '.preloader', name: 'Прелоадер', critical: false }
    ];
    
    let foundElements = 0;
    let criticalMissing = 0;
    
    criticalElements.forEach(element => {
        const domElement = document.querySelector(element.selector);
        if (domElement) {
            testLog(`${element.name} - найден`, 'success');
            foundElements++;
            
            // Дополнительные проверки
            const rect = domElement.getBoundingClientRect();
            const isVisible = rect.width > 0 && rect.height > 0;
            const hasContent = domElement.children.length > 0 || domElement.textContent.trim().length > 0;
            
            console.log(`   Видимость: ${isVisible ? '✅' : '❌'}, Содержимое: ${hasContent ? '✅' : '❌'}`);
            
        } else {
            const status = element.critical ? 'error' : 'warning';
            testLog(`${element.name} - НЕ НАЙДЕН`, status);
            if (element.critical) criticalMissing++;
        }
    });
    
    testLog(`DOM элементов найдено: ${foundElements}/${criticalElements.length}`, 
            criticalMissing === 0 ? 'success' : 'warning');

    // ТЕСТ 3: Анализ ошибок консоли
    testLog('ТЕСТ 3: Анализ ошибок консоли', 'info');
    
    // Проверяем буфер ошибок (если они перехватывались)
    if (window.capturedErrors && window.capturedErrors.length > 0) {
        testLog(`Найдено ошибок: ${window.capturedErrors.length}`, 'error');
        window.capturedErrors.slice(-3).forEach(error => {
            console.error(`   ${error.message || error}`);
        });
    } else {
        testLog('Перехваченных ошибок не найдено', 'success');
    }

    // ТЕСТ 4: Проверка сетевых ресурсов
    testLog('ТЕСТ 4: Проверка загрузки ресурсов', 'info');
    
    const resources = performance.getEntriesByType('resource');
    const failedResources = resources.filter(r => r.transferSize === 0 && r.decodedBodySize === 0);
    
    testLog(`Всего ресурсов: ${resources.length}`, 'info');
    
    if (failedResources.length > 0) {
        testLog(`Неудачных загрузок: ${failedResources.length}`, 'warning');
        failedResources.forEach(resource => {
            console.warn(`   Не загружен: ${resource.name}`);
        });
    } else {
        testLog('Все ресурсы загружены успешно', 'success');
    }

    // ТЕСТ 5: Функциональное тестирование
    testLog('ТЕСТ 5: Функциональное тестирование', 'info');
    
    // Тест частиц
    const particlesContainer = document.querySelector('#particles-js');
    if (particlesContainer) {
        const hasParticles = particlesContainer.children.length > 0 || 
                           (typeof particlesJS !== 'undefined') ||
                           particlesContainer.querySelector('.fallback-particle');
        testLog(`Частицы: ${hasParticles ? 'активны' : 'неактивны'}`, hasParticles ? 'success' : 'warning');
    }
    
    // Тест навигации
    if (window.NavigationModule) {
        try {
            const navLinks = document.querySelectorAll('.nav-link');
            const hamburger = document.querySelector('.hamburger');
            testLog(`Навигация: ${navLinks.length} ссылок, мобильное меню: ${hamburger ? 'есть' : 'нет'}`, 'success');
        } catch (error) {
            testLog(`Ошибка навигации: ${error.message}`, 'error');
        }
    }
    
    // Тест чата
    if (window.ChatModule) {
        const chatWidget = document.querySelector('.chat-widget');
        const chatToggle = chatWidget ? chatWidget.querySelector('.chat-toggle') : null;
        testLog(`Чат: виджет ${chatWidget ? 'найден' : 'не найден'}, кнопка ${chatToggle ? 'есть' : 'нет'}`, 
                chatWidget ? 'success' : 'warning');
    }
    


    // ТЕСТ 6: Проверка производительности
    testLog('ТЕСТ 6: Проверка производительности', 'info');
    
    if (performance.memory) {
        const memory = performance.memory;
        const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        const total = Math.round(memory.totalJSHeapSize / 1024 / 1024);
        const limit = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
        
        testLog(`Память: ${used}MB используется / ${total}MB выделено / ${limit}MB лимит`, 
                used < total * 0.8 ? 'success' : 'warning');
    }
    
    // Время загрузки
    const navTiming = performance.getEntriesByType('navigation')[0];
    if (navTiming) {
        const loadTime = Math.round(navTiming.loadEventEnd - navTiming.fetchStart);
        testLog(`Время загрузки страницы: ${loadTime}ms`, loadTime < 3000 ? 'success' : 'warning');
    }

    // ТЕСТ 7: Проверка безопасности
    testLog('ТЕСТ 7: Проверка безопасности', 'info');
    
    // Проверка CSP
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    testLog(`Content Security Policy: ${cspMeta ? 'установлен' : 'отсутствует'}`, 
            cspMeta ? 'success' : 'warning');
    
    // Проверка HTTPS
    const isHTTPS = location.protocol === 'https:';
    testLog(`HTTPS соединение: ${isHTTPS ? 'да' : 'нет'}`, isHTTPS ? 'success' : 'warning');
    
    // Проверка внешних ссылок
    const externalLinks = document.querySelectorAll('a[href^="http"]');
    let secureLinks = 0;
    externalLinks.forEach(link => {
        if (link.getAttribute('rel')?.includes('noopener')) secureLinks++;
    });
    testLog(`Безопасные внешние ссылки: ${secureLinks}/${externalLinks.length}`, 
            secureLinks === externalLinks.length ? 'success' : 'warning');

    // ИТОГОВЫЙ ОТЧЕТ
    console.log('\n');
    console.log('%c📊 ИТОГОВЫЙ ОТЧЕТ', 'background: #003300; color: #00ff00; padding: 10px; font-size: 14px; font-weight: bold;');
    
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    const warningCount = results.filter(r => r.status === 'warning').length;
    
    const totalScore = Math.round(
        (loadedModules / requiredModules.length) * 30 +
        (foundElements / criticalElements.length) * 30 +
        Math.max(0, 25 - errorCount * 5) +
        Math.max(0, 15 - warningCount * 2)
    );
    
    console.log(`%c🎯 ОБЩИЙ БАЛЛ: ${totalScore}/100`, 
                `color: ${totalScore >= 80 ? '#00ff00' : totalScore >= 60 ? '#ffff00' : '#ff0000'}; font-size: 18px; font-weight: bold;`);
    
    console.log(`%c✅ Успешно: ${successCount}`, 'color: #00ff00;');
    console.log(`%c❌ Ошибки: ${errorCount}`, 'color: #ff0000;');
    console.log(`%c⚠️ Предупреждения: ${warningCount}`, 'color: #ffff00;');
    
    // Рекомендации
    if (totalScore < 80) {
        console.log('\n%c💡 РЕКОМЕНДАЦИИ:', 'color: #00aaff; font-weight: bold;');
        
        if (errorCount > 0) {
            console.log('%c• Исправить критические ошибки', 'color: #ff0000;');
        }
        if (loadedModules < requiredModules.length) {
            console.log('%c• Проверить загрузку всех модулей', 'color: #ffff00;');
        }
        if (criticalMissing > 0) {
            console.log('%c• Восстановить отсутствующие DOM элементы', 'color: #ffff00;');
        }
        if (warningCount > 5) {
            console.log('%c• Уменьшить количество предупреждений', 'color: #ffff00;');
        }
    } else {
        console.log('\n%c🎉 Сайт работает отлично!', 'color: #00ff00; font-size: 16px; font-weight: bold;');
    }
    
    // Сохранение результатов в глобальную переменную
    window.diagnosticResults = {
        timestamp: new Date().toISOString(),
        score: totalScore,
        results: results,
        modules: moduleDetails,
        summary: {
            success: successCount,
            errors: errorCount,
            warnings: warningCount
        }
    };
    
    console.log('\n%c🔧 Результаты сохранены в window.diagnosticResults', 'color: #888;');
    console.log('%c📋 Для повторного запуска введите: location.reload() и вставьте код снова', 'color: #888;');
    
})();

// Дополнительные утилиты для ручного тестирования
window.testUtils = {
    // Быстрый тест чата
    testChat: function() {
        const widget = document.querySelector('.chat-widget');
        const toggle = widget?.querySelector('.chat-toggle');
        if (toggle) {
            console.log('🧪 Тестирую чат...');
            toggle.click();
            setTimeout(() => {
                console.log('✅ Чат протестирован');
                toggle.click();
            }, 2000);
        } else {
            console.log('❌ Чат не найден');
        }
    },
    
    // Быстрый тест навигации
    testNavigation: function() {
        const links = document.querySelectorAll('.nav-link');
        console.log(`🧪 Найдено навигационных ссылок: ${links.length}`);
        links.forEach((link, i) => {
            console.log(`${i + 1}. ${link.textContent} → ${link.href}`);
        });
    },
    
    // Мониторинг производительности
    startPerformanceMonitor: function() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        function monitor() {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                console.log(`📊 FPS: ${frameCount}, Память: ${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)}MB`);
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(monitor);
        }
        
        console.log('📊 Запущен мониторинг производительности...');
        requestAnimationFrame(monitor);
    }
};

console.log('\n%c🛠️ Доступны утилиты: testUtils.testChat(), testUtils.testNavigation(), testUtils.startPerformanceMonitor()', 'color: #888;'); 