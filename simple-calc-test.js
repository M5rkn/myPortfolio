// ПРОСТОЙ ТЕСТ КАЛЬКУЛЯТОРА
console.log('🧪 SIMPLE CALC TEST');

// Проверяем функции
console.log('toggleCalc exists:', typeof window.toggleCalc);
console.log('closeCalc exists:', typeof window.closeCalc);
console.log('calcTotal exists:', typeof window.calcTotal);

// Проверяем элементы
const toggle = document.getElementById('calculatorToggle');
const win = document.getElementById('calculatorWindow');
console.log('Toggle:', !!toggle);
console.log('Window:', !!win);

if(toggle) {
    console.log('Toggle onclick:', typeof toggle.onclick);
    console.log('Toggle style:', toggle.getAttribute('style'));
}

// Тест функции
if(typeof window.toggleCalc === 'function') {
    console.log('=== TESTING toggleCalc ===');
    window.toggleCalc();
    
    setTimeout(() => {
        const isActive = win && win.classList.contains('active');
        console.log('Window active after toggle:', isActive);
        
        if(isActive && typeof window.closeCalc === 'function') {
            window.closeCalc();
            setTimeout(() => {
                const isClosed = win && !win.classList.contains('active');
                console.log('Window closed:', isClosed);
            }, 100);
        }
    }, 100);
} else {
    console.log('❌ toggleCalc function not found');
}

// Экстренный фикс
window.emergencyFix = function() {
    const toggle = document.getElementById('calculatorToggle');
    const win = document.getElementById('calculatorWindow');
    
    if(toggle && win) {
        toggle.onclick = function() {
            console.log('Emergency click!');
            win.classList.toggle('active');
        };
        console.log('✅ Emergency fix applied');
    } else {
        console.log('❌ Elements not found');
    }
};

console.log('💊 Run emergencyFix() if needed'); 