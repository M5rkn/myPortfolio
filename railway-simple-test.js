// RAILWAY SIMPLE TEST
console.log('🚂 SIMPLE RAILWAY TEST');

// Основные проверки
console.log('Domain:', window.location.hostname);
console.log('Calculator initialized:', window.calculatorInitialized);
console.log('Railway ready:', window.railwayCalculatorReady);

// Элементы
const toggle = document.getElementById('calculatorToggle');
const window_el = document.getElementById('calculatorWindow');

console.log('Toggle exists:', !!toggle);
console.log('Window exists:', !!window_el);

if (toggle) {
    console.log('Toggle onclick:', typeof toggle.onclick);
}

// Простой тест
if (toggle && window_el) {
    console.log('=== SIMPLE TEST ===');
    
    // Прямой вызов
    if (toggle.onclick) {
        console.log('Calling onclick...');
        toggle.onclick();
        
        setTimeout(() => {
            const isActive = window_el.classList.contains('active');
            console.log('Result:', isActive ? '✅ WORKS!' : '❌ FAILED');
            
            if (isActive) {
                toggle.onclick(); // Закрываем
            }
        }, 200);
    } else {
        console.log('❌ No onclick handler');
    }
}

// Экстренный фикс
window.quickFix = function() {
    const toggle = document.getElementById('calculatorToggle');
    const window_el = document.getElementById('calculatorWindow');
    
    if (toggle && window_el) {
        toggle.onclick = function() {
            window_el.classList.toggle('active');
            console.log('Quick fix toggle');
        };
        console.log('✅ Quick fix applied');
    }
};

console.log('Run quickFix() if needed'); 