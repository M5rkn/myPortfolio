// ТЕСТ INLINE ONCLICK
console.log('🎯 INLINE TEST');

const toggle = document.getElementById('calculatorToggle');
console.log('Toggle found:', !!toggle);

if(toggle) {
    console.log('Has onclick:', typeof toggle.onclick);
    console.log('Onclick value:', toggle.onclick);
    
    // Прямой вызов
    if(toggle.onclick) {
        console.log('Calling inline onclick...');
        toggle.onclick();
    } else {
        console.log('❌ No inline onclick');
    }
} else {
    console.log('❌ Toggle not found');
} 