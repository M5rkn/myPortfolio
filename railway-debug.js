// RAILWAY.COM DEBUG SCRIPT
// Вставьте этот код в консоль браузера на Railway.com

console.log('🚂 RAILWAY CALCULATOR DEBUG');
console.log('Domain:', window.location.hostname);
console.log('Protocol:', window.location.protocol);

// 1. Проверка базовых элементов
const toggle = document.getElementById('calculatorToggle');
const window_el = document.getElementById('calculatorWindow');
const close_el = document.getElementById('calculatorClose');

console.log('=== BASIC ELEMENTS ===');
console.log('Toggle:', toggle);
console.log('Window:', window_el);
console.log('Close:', close_el);

// 2. Проверка CSS загрузки и правил
console.log('\n=== CSS ANALYSIS ===');
if (window_el) {
    const styles = getComputedStyle(window_el);
    console.log('Window computed styles:', {
        display: styles.display,
        position: styles.position,
        bottom: styles.bottom,
        left: styles.left,
        zIndex: styles.zIndex,
        width: styles.width,
        background: styles.background
    });
    
    // Проверяем активное состояние
    window_el.classList.add('active');
    const activeStyles = getComputedStyle(window_el);
    console.log('Active state display:', activeStyles.display);
    window_el.classList.remove('active');
}

// 3. Проверка обработчиков событий
console.log('\n=== EVENT HANDLERS ===');
if (toggle) {
    const listeners = getEventListeners ? getEventListeners(toggle) : 'Not available in this browser';
    console.log('Toggle listeners:', listeners);
    
    // Проверяем вручную
    console.log('Testing manual click...');
    try {
        toggle.click();
        setTimeout(() => {
            if (window_el) {
                console.log('After manual click - active:', window_el.classList.contains('active'));
                console.log('After manual click - display:', getComputedStyle(window_el).display);
            }
        }, 100);
    } catch (error) {
        console.error('Manual click failed:', error);
    }
}

// 4. Проверка модулей и инициализации
console.log('\n=== MODULES CHECK ===');
console.log('CalculatorModule:', window.CalculatorModule);
console.log('Calculator initialized:', window.calculatorInitialized);
console.log('SecurityModule:', typeof window.secureGetElementById);

// 5. Проверка CSP и ошибок
console.log('\n=== CSP & ERRORS ===');
const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
console.log('CSP meta tag:', cspMeta ? cspMeta.content : 'Not found');

// Проверяем последние ошибки в консоли
console.log('Check Console tab for any JavaScript errors');

// 6. Проверка загрузки CSS файлов
console.log('\n=== CSS FILES ===');
const stylesheets = Array.from(document.styleSheets);
const cssFiles = stylesheets.map(sheet => ({
    href: sheet.href,
    rules: sheet.cssRules ? sheet.cssRules.length : 'Access denied'
}));
console.log('Loaded CSS files:', cssFiles);

// 7. Тест принудительного создания правила
console.log('\n=== FORCE CSS TEST ===');
try {
    const style = document.createElement('style');
    style.textContent = `
        .calculator-window.active {
            display: block !important;
            position: absolute !important;
            bottom: 70px !important;
            left: 0 !important;
            z-index: 9999 !important;
            background: red !important;
            width: 300px !important;
            height: 200px !important;
        }
    `;
    document.head.appendChild(style);
    console.log('Force CSS injected. Try clicking calculator now.');
    
    // Удаляем через 10 секунд
    setTimeout(() => {
        document.head.removeChild(style);
        console.log('Force CSS removed');
    }, 10000);
} catch (error) {
    console.error('Force CSS injection failed:', error);
}

// 8. Network проверка
console.log('\n=== NETWORK INFO ===');
console.log('User Agent:', navigator.userAgent);
console.log('Connection:', navigator.connection ? {
    effectiveType: navigator.connection.effectiveType,
    downlink: navigator.connection.downlink
} : 'Not available');

// 9. Финальные рекомендации
console.log('\n=== RECOMMENDATIONS FOR RAILWAY ===');
console.log('1. Check Network tab for 304/404 responses on CSS files');
console.log('2. Look for "Failed to load resource" errors');
console.log('3. Check if Railway compresses/minifies CSS');
console.log('4. Try hard refresh: Ctrl+Shift+R');
console.log('5. Check Railway dashboard for build logs');
console.log('6. Verify environment variables in Railway');

// 10. Простой фикс - принудительная инициализация
window.forceFixCalculator = function() {
    console.log('🔧 FORCE FIX CALCULATOR');
    
    const toggle = document.getElementById('calculatorToggle');
    const window_el = document.getElementById('calculatorWindow');
    
    if (!toggle || !window_el) {
        console.error('Elements not found');
        return;
    }
    
    // Удаляем все обработчики
    const newToggle = toggle.cloneNode(true);
    toggle.parentNode.replaceChild(newToggle, toggle);
    
    // Добавляем простой обработчик
    newToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const isActive = window_el.classList.contains('active');
        console.log('Current state:', isActive);
        
        if (isActive) {
            window_el.classList.remove('active');
            window_el.style.display = 'none';
        } else {
            window_el.classList.add('active');
            window_el.style.display = 'block';
            window_el.style.position = 'absolute';
            window_el.style.bottom = '70px';
            window_el.style.left = '0';
            window_el.style.zIndex = '9999';
        }
        
        console.log('New state:', window_el.classList.contains('active'));
    });
    
    console.log('✅ Force fix applied. Try calculator now.');
};

console.log('\n💡 To apply emergency fix, run: forceFixCalculator()'); 