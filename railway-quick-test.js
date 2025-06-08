// RAILWAY QUICK TEST V2
// Вставьте в консоль на Railway.com после деплоя

console.log('🚂 RAILWAY QUICK TEST V2');

// 1. Проверка домена и флагов
console.log('Domain:', window.location.hostname);
console.log('Is Railway:', window.location.hostname.includes('railway.app'));
console.log('Calculator initialized:', window.calculatorInitialized);
console.log('Railway calculator ready:', window.railwayCalculatorReady);

// 2. Проверка элементов
const toggle = document.getElementById('calculatorToggle');
const window_el = document.getElementById('calculatorWindow');
console.log('Toggle element:', !!toggle);
console.log('Window element:', !!window_el);

if (toggle) {
    console.log('Toggle ID:', toggle.id);
    console.log('Toggle classes:', toggle.className);
    console.log('Toggle onclick:', typeof toggle.onclick);
    
    // Проверяем event listeners (если доступно)
    const listeners = getEventListeners ? getEventListeners(toggle) : 'not available';
    console.log('Event listeners:', listeners);
    
    if (listeners && listeners.click) {
        console.log('Number of click handlers:', listeners.click.length);
    }
}

// 3. Тест CSS активного состояния
if (window_el) {
    console.log('=== CSS TEST ===');
    console.log('Normal display:', getComputedStyle(window_el).display);
    
    window_el.classList.add('active');
    console.log('Active display:', getComputedStyle(window_el).display);
    window_el.classList.remove('active');
}

// 4. Тест клика
if (toggle && window_el) {
    console.log('=== CLICK TEST ===');
    console.log('Before click - active:', window_el.classList.contains('active'));
    
    // Прямой вызов onclick
    if (toggle.onclick) {
        console.log('Calling onclick directly...');
        toggle.onclick();
        
        setTimeout(() => {
            console.log('After onclick - active:', window_el.classList.contains('active'));
            
            if (window_el.classList.contains('active')) {
                console.log('✅ SUCCESS: onclick works!');
                // Закрываем обратно
                toggle.onclick();
            } else {
                console.log('❌ FAILED: onclick not working');
            }
        }, 100);
    } else {
        console.log('❌ No onclick handler found');
    }
}

// 5. Суперэкстренный фикс
window.superFix = function() {
    console.log('🚨 SUPER EMERGENCY FIX');
    
    const toggle = document.getElementById('calculatorToggle');
    const window_el = document.getElementById('calculatorWindow');
    
    if (toggle && window_el) {
        // Полностью пересоздаем элемент
        const parent = toggle.parentNode;
        const newToggle = document.createElement('div');
        newToggle.id = 'calculatorToggle';
        newToggle.className = 'calculator-toggle';
        newToggle.innerHTML = '<span class="calculator-icon">💰</span><span class="calculator-text">Калькулятор</span>';
        
        newToggle.onclick = function() {
            console.log('Super fix click!');
            const isActive = window_el.classList.contains('active');
            if (isActive) {
                window_el.classList.remove('active');
                console.log('Closed');
            } else {
                window_el.classList.add('active');
                console.log('Opened');
            }
        };
        
        parent.replaceChild(newToggle, toggle);
        console.log('✅ Super fix applied!');
    }
};

console.log('💡 Commands:');
console.log('- superFix() - recreate calculator completely');
console.log('- Check console for Railway initialization logs'); 