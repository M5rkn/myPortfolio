// Скопируйте и вставьте в консоль браузера для быстрой проверки

console.log('🧪 TechPortal Quick Test');

// 1. Проверка модулей
const modules = ['SecurityModule', 'ChatModule', 'PortfolioModule'];
modules.forEach(mod => {
    console.log(`${mod}: ${window[mod] ? '✅' : '❌'}`);
});

// 2. Проверка элементов
const elements = ['chatToggle', 'chatWindow'];
elements.forEach(id => {
    const el = document.getElementById(id);
    console.log(`#${id}: ${el ? '✅' : '❌'}`);
});

// 3. Тест кликов виджетов
console.log('\n🎯 Testing widget clicks...');

// Тест чата
setTimeout(() => {
    const chatToggle = document.getElementById('chatToggle');
    if (chatToggle) {
        chatToggle.click();
        console.log('Chat toggle clicked ✅');
        
        setTimeout(() => {
            const chatWindow = document.getElementById('chatWindow');
            console.log(`Chat window active: ${chatWindow?.classList.contains('active') ? '✅' : '❌'}`);
        }, 100);
    }
}, 1000);



// 4. Тест портфолио
setTimeout(() => {
    const portfolioItem = document.querySelector('.portfolio-item');
    if (portfolioItem) {
        portfolioItem.click();
        console.log('Portfolio item clicked ✅');
        
        setTimeout(() => {
            const modal = document.getElementById('project-modal-overlay');
            console.log(`Modal created: ${modal ? '✅' : '❌'}`);
        }, 100);
    }
}, 2000);

console.log('\n⏱️ Tests will run automatically in 1-3 seconds...'); 