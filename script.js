/**
 * TechPortal - Современное портфолио
 * Основной JavaScript файл
 * Версия: 2.1
 */

// Защитные функции (без заморозки прототипов — безопаснее для совместимости)
(function() {
    'use strict';
})();

let isSubmitting = false;
let csrfToken = '';
// Helper: выполнить задачу в режиме простоя браузера
function runWhenIdle(cb) {
    try {
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(cb, { timeout: 2000 });
        } else {
            setTimeout(cb, 200);
        }
    } catch (_) {
        setTimeout(cb, 200);
    }
}


// Initialize CSRF token
async function initCSRF() {
    try {
        const response = await fetch('/api/csrf-token');
        const data = await response.json();
        if (data.csrfToken) {
            csrfToken = data.csrfToken;
        }
    } catch (error) {
        // Удалено: console.warn('CSRF token fetch failed:', error);
    }
}

// Функция для показа уведомлений
function showToast(type, message) {
    // Удаляем существующие тосты
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${type === 'success' ? '✅' : '❌'}</span>
            <span class="toast-message">${message.replace(/\n/g, '<br>')}</span>
        </div>
    `;

    // Добавляем стили
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 999999;
        animation: slideInRight 0.3s ease forwards;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        max-width: 350px;
        width: calc(100vw - 40px);
        box-sizing: border-box;
        font-size: 14px;
        line-height: 1.4;
        pointer-events: auto;
        transform: translateX(100%);
    `;

    // Добавляем мобильные стили
    if (window.innerWidth <= 768) {
        toast.style.cssText += `
            top: 10px;
            right: 10px;
            left: 10px;
            width: auto;
            max-width: none;
            font-size: 13px;
            padding: 12px 16px;
        `;
    }

    // Добавляем CSS анимации если их нет
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { 
                    transform: translateX(100%); 
                    opacity: 0; 
                }
                to { 
                    transform: translateX(0); 
                    opacity: 1; 
                }
            }
            @keyframes slideOutRight {
                from { 
                    transform: translateX(0); 
                    opacity: 1; 
                }
                to { 
                    transform: translateX(100%); 
                    opacity: 0; 
                }
            }
            @keyframes slideInTop {
                from { 
                    transform: translateY(-100%); 
                    opacity: 0; 
                }
                to { 
                    transform: translateY(0); 
                    opacity: 1; 
                }
            }
            @keyframes slideOutTop {
                from { 
                    transform: translateY(0); 
                    opacity: 1; 
                }
                to { 
                    transform: translateY(-100%); 
                    opacity: 0; 
                }
            }
            .toast-content {
                display: flex;
                align-items: center;
                gap: 8px;
                word-wrap: break-word;
                overflow-wrap: break-word;
            }
            @media (max-width: 768px) {
                .toast {
                    animation: slideInTop 0.3s ease forwards !important;
                }
                .toast.hiding {
                    animation: slideOutTop 0.3s ease forwards !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    // Принудительно запускаем анимацию появления
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
    }, 50);

    // Автоматическое скрытие через 5 секунд (увеличили время)
    setTimeout(() => {
        toast.classList.add('hiding');
        const isMobile = window.innerWidth <= 768;
        toast.style.animation = isMobile ? 'slideOutTop 0.3s ease forwards' : 'slideOutRight 0.3s ease forwards';

        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 5000);
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    // Удалено: console.log('🔍 DEBUG DOM loaded, starting initialization');
    // Удалено: console.log('🔍 DEBUG Token on page load:', localStorage.getItem('authToken'));
    
    // Убираем прелоадер сразу
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('hidden');
        document.body.classList.remove('loading');
    }
    initCustomCursor();
    initSideNav();
    initMobileNav();
    initScrollProgress();
    initScrollIndicator();
    initPortfolioFilter();
    initLazyLoading();
    // Низкоприоритетные фичи переносим на idle для снижения TTI
    runWhenIdle(() => {
        try { initAdvancedCalculator(); } catch (_) {}
        try { initChatbot(); } catch (_) {}
        try { registerServiceWorker(); } catch (_) {}
    });
    // GSAP анимации инициализируем после загрузки GSAP
    if (typeof gsap !== 'undefined') {
        try { 
            initScrollAnimations(); 
            initHeroParallax();
        } catch (_) {}
    } else {
        // Если GSAP не загружен, ждем его загрузки
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (typeof gsap !== 'undefined') {
                    try { 
                        initScrollAnimations(); 
                        initHeroParallax();
                    } catch (_) {}
                }
            }, 100);
        });
    }
    // Анимация счетчика статистики
    initStatsCounter();
    initCalculator();
    initModal();
    initFAQ();
    initCVDownload();
    initAuthButton();
    initProjectViews();

    // Асинхронно инициализируем CSRF и форму
    initCSRFAndForm();

    // ProgressBar.js для технологий
    document.querySelectorAll('.tech-pb').forEach(function(el) {
        var value = parseFloat(el.getAttribute('data-progress')) || 0;
        var svg = el.querySelector('svg');
        el.innerHTML = '';
        var bar = new ProgressBar.Circle(el, {
            strokeWidth: 5,
            trailWidth: 5,
            trailColor: '#232b3e',
            color: 'url(#tech-gradient)',
            easing: 'easeInOut',
            duration: 1200,
            from: { color: '#61dafb' },
            to: { color: '#6366f1' },
            step: function(state, circle) {
                circle.path.setAttribute('stroke', 'url(#tech-gradient)');
            }
        });
        // Добавляем градиент в defs
        var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        var grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        grad.setAttribute('id', 'tech-gradient');
        grad.setAttribute('x1', '0'); grad.setAttribute('y1', '0'); grad.setAttribute('x2', '1'); grad.setAttribute('y2', '1');
        var stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%'); stop1.setAttribute('stop-color', '#61dafb');
        var stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%'); stop2.setAttribute('stop-color', '#6366f1');
        grad.appendChild(stop1); grad.appendChild(stop2); defs.appendChild(grad);
        el.querySelector('svg')?.prepend(defs);
        bar.animate(value);
        // Помещаем иконку в центр круга
        el.appendChild(svg);
        svg.style.position = 'absolute';
        svg.style.left = '50%';
        svg.style.top = '50%';
        svg.style.transform = 'translate(-50%, -50%)';
        svg.style.zIndex = '2';
        el.style.position = 'relative';
        el.style.width = '76px';
        el.style.height = '76px';
    });
});
// Просмотры проектов: бейдж и загрузка
function initProjectViews() {
    const workItems = document.querySelectorAll('.works-grid .work-item');
    if (!workItems.length) return;

    // Map project DOM to backend ids
    const mapIndexToId = (idx) => `project-${idx + 1}`; // порядок соответствует preview project-1..project-6

    workItems.forEach((item, idx) => {
        const badge = document.createElement('div');
        badge.className = 'view-badge';
        badge.innerHTML = `
            <svg class="eye-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="3.5" stroke="currentColor" stroke-width="1.6"/>
            </svg>
            <span class="view-count" data-count>—</span>
        `;
        item.appendChild(badge);

        const projectId = mapIndexToId(idx);

        // Загрузка текущего количества
        fetch(`/api/projects/${projectId}/views`, { headers: { 'Cache-Control': 'no-cache' } })
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(data => {
                const countEl = badge.querySelector('[data-count]');
                if (data && data.success) countEl.textContent = data.views;
                else countEl.textContent = '0';
            })
            .catch(() => {
                const countEl = badge.querySelector('[data-count]');
                countEl.textContent = '0';
            });

        // Инкремент при клике на кнопку проекта, если есть
        const btn = item.querySelector('.work-link');
        if (btn) {
            btn.addEventListener('click', async () => {
                try {
                    const res = await fetch(`/api/projects/${projectId}/view`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        const countEl = badge.querySelector('[data-count]');
                        if (data && data.success) countEl.textContent = data.views;
                    }
                } catch (_) {}
            });
        }
    });
}

// Отдельная функция для асинхронной инициализации формы
async function initCSRFAndForm() {
    // Загружаем CSRF токен
    await initCSRF();
    // Затем инициализируем форму
    initContactForm();
}

// Калькулятор стоимости
function initCalculator() {
    const packageCards = document.querySelectorAll('.package-card');
    const serviceCheckboxes = document.querySelectorAll('.service-option input[type="checkbox"]');
    const costBreakdown = document.getElementById('costBreakdown');
    const totalPrice = document.getElementById('totalPrice');
    const sendToFormBtn = document.getElementById('sendToFormBtn');
    const resetCalculatorBtn = document.getElementById('resetCalculatorBtn');

    if (!packageCards.length || !costBreakdown || !totalPrice) return;

    let selectedPackage = null;
    let selectedServices = [];

    // Обработчики для пакетов услуг
    packageCards.forEach(card => {
        card.addEventListener('click', () => {
            // Убираем выделение с других карточек
            packageCards.forEach(c => {
                c.classList.remove('selected');
                if (typeof gsap !== 'undefined') {
                    gsap.to(c, { scale: 1, duration: 0.3 });
                }
            });

            // Выделяем текущую карточку
            card.classList.add('selected');
            
            // Анимация выбора
            if (typeof gsap !== 'undefined') {
                gsap.to(card, { scale: 1.05, duration: 0.3, yoyo: true, repeat: 1 });
            }

            // Сохраняем выбранный пакет
            selectedPackage = {
                name: card.querySelector('.package-title').textContent,
                price: parseInt(card.dataset.price),
                type: card.dataset.package
            };

            updateProgress();
            updateCalculation();
        });
    });

    // Обработчики для дополнительных услуг
    serviceCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const serviceName = checkbox.parentNode.querySelector('.service-name').textContent;
            const servicePrice = parseInt(checkbox.dataset.price);
            const serviceType = checkbox.dataset.service;
            const serviceOption = checkbox.closest('.service-option');

            if (checkbox.checked) {
                selectedServices.push({
                    name: serviceName,
                    price: servicePrice,
                    type: serviceType
                });
                // Анимация выбора
                if (typeof gsap !== 'undefined' && serviceOption) {
                    gsap.fromTo(serviceOption, 
                        { scale: 1 },
                        { scale: 1.02, duration: 0.2, yoyo: true, repeat: 1 }
                    );
                }
            } else {
                selectedServices = selectedServices.filter(service => service.type !== serviceType);
            }

            updateProgress();
            updateCalculation();
        });
    });
    
    // Функция обновления прогресса
    function updateProgress() {
        const progressFill = document.getElementById('calculatorProgress');
        const progressSteps = document.querySelectorAll('.progress-step');
        
        if (!progressFill) return;
        
        let progress = 0;
        let currentStep = 1;
        
        if (selectedPackage) {
            progress = 33;
            currentStep = 2;
        }
        
        if (selectedServices.length > 0) {
            progress = 66;
            currentStep = 3;
        }
        
        if (selectedPackage && selectedServices.length > 0) {
            progress = 100;
        }
        
        // Анимация прогресс-бара
        if (typeof gsap !== 'undefined') {
            gsap.to(progressFill, { width: progress + '%', duration: 0.5, ease: 'power2.out' });
        } else {
            progressFill.style.width = progress + '%';
        }
        
        // Обновление шагов
        progressSteps.forEach((step, index) => {
            if (index + 1 <= currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    // Функция обновления расчета
    async function updateCalculation() {
        let breakdown = '';
        let total = 0;

        if (selectedPackage) {
            breakdown += `
                <div class="breakdown-item">
                    <span>${selectedPackage.name}</span>
                    <span>${formatPrice(selectedPackage.price)}</span>
                </div>
            `;
            total += selectedPackage.price;
        } else {
            breakdown = `
                <div class="breakdown-item">
                    <span>Выберите тип проекта</span>
                    <span>—</span>
                </div>
            `;
        }

        selectedServices.forEach(service => {
            breakdown += `
                <div class="breakdown-item">
                    <span>${service.name}</span>
                    <span>+${formatPrice(service.price)}</span>
                </div>
            `;
            total += service.price;
        });

        // Получаем бонусную скидку пользователя
        const bonusDiscount = await getUserBonusDiscount();
        let finalTotal = total;
        let discountAmount = 0;
        if (bonusDiscount > 0 && total > 0) {
            discountAmount = (total * bonusDiscount) / 100;
            finalTotal = total - discountAmount;
            breakdown += `
                <div class="breakdown-item bonus-discount">
                    <span>🎉 Бонусная скидка ${bonusDiscount}%</span>
                    <span>-${formatPrice(discountAmount)}</span>
                </div>
            `;
        }

        costBreakdown.innerHTML = breakdown;
        totalPrice.textContent = formatPrice(finalTotal);

        // Активируем/деактивируем кнопку отправки
        if (sendToFormBtn) {
            sendToFormBtn.disabled = !selectedPackage;
        }

        // Отправляем событие для интеграции с расширенным калькулятором
        const event = new CustomEvent('calculatorUpdated', {
            detail: {
                selectedPackage,
                selectedServices,
                total: finalTotal,
                originalTotal: total,
                bonusDiscount
            }
        });
        document.dispatchEvent(event);
    }

    // Функция форматирования цены
    function formatPrice(price) {
        return new Intl.NumberFormat('en-DE').format(price) + ' €';
    }

    // Функция получения бонусной скидки пользователя
    async function getUserBonusDiscount() {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return 0;

            // Проверяем, что токен не истек
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                // Удалено: console.log('🔍 DEBUG getUserBonusDiscount - token payload:', payload);
                // Удалено: console.log('🔍 DEBUG getUserBonusDiscount - current time:', Date.now());
                // Удалено: console.log('🔍 DEBUG getUserBonusDiscount - token exp:', payload.exp * 1000);
                
                if (Date.now() >= payload.exp * 1000) {
                    // Удалено: console.log('🔍 DEBUG getUserBonusDiscount - token expired, removing');
                    localStorage.removeItem('authToken');
                    return 0;
                }
            } catch (error) {
                // Удалено: console.log('🔍 DEBUG getUserBonusDiscount - token parse error:', error);
                // Удалено: console.log('🔍 DEBUG getUserBonusDiscount - removing invalid token');
                localStorage.removeItem('authToken');
                return 0;
            }

            const response = await fetch('/api/user/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.bonus && data.bonus.hasActiveBonus) {
                    return data.bonus.bonusDiscount;
                }
            }
            
            return 0;
        } catch (error) {
            console.error('Error getting bonus discount:', error);
            return 0;
        }
    }

    // Функция генерации текста для формы
    function generateCalculationText() {
        if (!selectedPackage) return '';

        let text = '🧮 РАСЧЕТ СТОИМОСТИ ПРОЕКТА\n\n';
        text += `📋 Основной пакет:\n${selectedPackage.name} — ${formatPrice(selectedPackage.price)}\n\n`;

        if (selectedServices.length > 0) {
            text += '🔧 Дополнительные услуги:\n';
            selectedServices.forEach(service => {
                text += `• ${service.name} — ${formatPrice(service.price)}\n`;
            });
            text += '\n';
        }

        const total = selectedPackage.price + selectedServices.reduce((sum, service) => sum + service.price, 0);
        text += `💰 ИТОГО: ${formatPrice(total)}\n\n`;
        text += '* Окончательная стоимость может отличаться в зависимости от сложности проекта\n\n';
        text += '—————————————————————————\nСообщение от клиента:\n\n';

        return text;
    }

    // Отправка расчета в форму
    if (sendToFormBtn) {
        sendToFormBtn.addEventListener('click', () => {
            const calculationText = generateCalculationText();
            const messageTextarea = document.getElementById('message');

            if (messageTextarea) {
                messageTextarea.value = calculationText;
                messageTextarea.focus();

                // Плавная прокрутка к форме
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                }

                showToast('success', 'Расчет добавлен в форму обратной связи');
            }
        });
    }

    // Сброс калькулятора
    if (resetCalculatorBtn) {
        resetCalculatorBtn.addEventListener('click', () => {
            // Сбрасываем выбранный пакет
            packageCards.forEach(card => card.classList.remove('selected'));
            selectedPackage = null;

            // Сбрасываем дополнительные услуги
            serviceCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            selectedServices = [];

            // Обновляем расчет
            updateCalculation();

            showToast('success', 'Калькулятор сброшен');
        });
    }

    // Инициальный расчет
    updateCalculation();
}

// ===== УЛУЧШЕННЫЕ ФУНКЦИИ КАЛЬКУЛЯТОРА =====

// Улучшенный калькулятор с дополнительными фишками
function initAdvancedCalculator() {
    const saveCalculationBtn = document.getElementById('saveCalculationBtn');
    const savedCalculations = document.getElementById('savedCalculations');
    const toggleComparisonBtn = document.getElementById('toggleComparisonBtn');
    const comparisonTable = document.getElementById('comparisonTable');
    const projectTimeline = document.getElementById('projectTimeline');

    let isComparisonMode = false;
    let savedCalcs = JSON.parse(localStorage.getItem('savedCalculations') || '[]');

    // Инициализация сохраненных расчетов
    renderSavedCalculations();

    // Обновляем кнопку сохранения при изменении калькулятора
    document.addEventListener('calculatorUpdated', (event) => {
        const { selectedPackage } = event.detail;

        if (saveCalculationBtn) {
            saveCalculationBtn.disabled = !selectedPackage;
        }

        // Обновляем временную шкалу
        if (selectedPackage) {
            updateProjectTimeline(selectedPackage.type);
        }
    });

    // Сохранение расчета
    if (saveCalculationBtn) {
        saveCalculationBtn.addEventListener('click', async () => {
            const calculationData = getCurrentCalculation();

            if (!calculationData) {
                showToast('error', 'Выберите тип проекта для сохранения расчета');
                return;
            }

            if (calculationData) {
                // Проверяем авторизацию пользователя
                const token = getAuthToken();
                if (!token) {
                    showToast('error', 'Для сохранения расчетов необходимо войти в систему');
                    return;
                }

                const name = prompt('Введите название для расчета:', calculationData.package.name);
                if (!name) return;

                try {
                    // Сохраняем через API
                    const response = await fetch('/api/user/calculations', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            name: name.trim(),
                            package: calculationData.package,
                            services: calculationData.services,
                            total: calculationData.total,
                            date: new Date().toLocaleDateString('ru-RU')
                        })
                    });

                    if (response.ok) {
                        showToast('success', 'Расчет сохранен');
                        // Обновляем локальный список для отображения
                        renderSavedCalculations();
                    } else if (response.status === 401) {
                        localStorage.removeItem('authToken');
                        showToast('error', 'Сессия истекла. Войдите в систему заново');
                        setTimeout(() => {
                            window.location.href = '/login.html';
                        }, 2000);
                    } else {
                        showToast('error', 'Ошибка сохранения расчета');
                    }
                } catch (error) {
                    console.error('Error saving calculation:', error);
                    showToast('error', 'Ошибка сохранения расчета');
                }
            }
        });
    }

    // Получить токен авторизации
    function getAuthToken() {
        try {
            // Проверяем localStorage для токена (где он сохраняется при входе)
            let token = localStorage.getItem('authToken');
            if (token) return token;
            
            // Для обратной совместимости проверяем sessionStorage
            const tokenData = sessionStorage.getItem('adminToken');
            if (!tokenData) return null;
            
            const parsed = JSON.parse(tokenData);
            if (parsed.expires && parsed.expires < Date.now()) {
                sessionStorage.removeItem('adminToken');
                return null;
            }
            
            return parsed.token;
        } catch (error) {
            return null;
        }
    }

    // Получить ID пользователя из токена
    function getUserIdFromToken(token) {
        try {
            if (!token) return null;
            const payload = JSON.parse(atob(token.split('.')[1]));
            
            // Проверяем срок действия токена
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                return null;
            }
            
            return payload.userId || payload.email || payload.id || null;
        } catch (error) {
            // Удалено: console.log('Ошибка декодирования токена:', error);
            return null;
        }
    }

    // Сравнение пакетов
    if (toggleComparisonBtn) {
        toggleComparisonBtn.addEventListener('click', () => {
            isComparisonMode = !isComparisonMode;

            if (isComparisonMode) {
                toggleComparisonBtn.innerHTML = '<span>Скрыть сравнение</span>';
                comparisonTable.style.display = 'block';
                renderComparisonTable();
            } else {
                toggleComparisonBtn.innerHTML = '<span>Включить сравнение</span>';
                comparisonTable.style.display = 'none';
            }
        });
    }

    // Функция отображения сохраненных расчетов
    async function renderSavedCalculations() {
        if (!savedCalculations) return;

        const token = getAuthToken();
        
        if (!token) {
            savedCalculations.innerHTML = `
                <div class="saved-item-placeholder">
                    <p>Войдите в систему для сохранения расчетов</p>
                    <a href="/login.html" target="_blank" style="color: #667eea; text-decoration: none;">Войти в систему</a>
                </div>
            `;
            return;
        }

        try {
            // Загружаем расчеты через API
            const response = await fetch('/api/user/calculations', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const userCalcs = await response.json();
                
                if (userCalcs.length === 0) {
                    savedCalculations.innerHTML = `
                        <div class="saved-item-placeholder">
                            <p>Ваши сохраненные расчеты появятся здесь</p>
                        </div>
                    `;
                    return;
                }

                savedCalculations.innerHTML = userCalcs.map(calc => `
                    <div class="saved-item" data-calc-id="${calc.id}">
                        <div class="saved-item-header">
                            <span class="saved-item-name">${calc.name}</span>
                            <span class="saved-item-price">${formatPrice(calc.total)}</span>
                        </div>
                        <div class="saved-item-date">${new Date(calc.createdAt).toLocaleDateString('ru-RU')}</div>
                        <div class="saved-item-actions">
                            <button class="delete-btn" data-delete-id="${calc.id}">Удалить</button>
                        </div>
                    </div>
                `).join('');

                // Добавляем обработчики для загрузки сохраненных расчетов
                savedCalculations.querySelectorAll('.saved-item').forEach(item => {
                    // Обработчик клика по элементу (загрузка)
                    item.addEventListener('click', (e) => {
                        // Игнорируем клик если это кнопка удаления
                        if (e.target.classList.contains('delete-btn')) return;
                        
                        const calcId = item.dataset.calcId;
                        const calc = userCalcs.find(c => c._id === calcId);
                        if (calc) {
                            loadSavedCalculation(calc);
                            showToast('success', 'Расчет загружен');
                        }
                    });
                });

                // Добавляем обработчики для удаления
                savedCalculations.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        e.stopPropagation(); // Предотвращаем загрузку расчета
                        
                        if (!confirm('Удалить этот расчет?')) return;
                        
                        const calcId = btn.dataset.deleteId;
                        
                        try {
                            const deleteResponse = await fetch(`/api/user/calculations/${calcId}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            });

                            if (deleteResponse.ok) {
                                renderSavedCalculations();
                                showToast('success', 'Расчет удален');
                            } else {
                                showToast('error', 'Ошибка удаления расчета');
                            }
                        } catch (error) {
                            console.error('Error deleting calculation:', error);
                            showToast('error', 'Ошибка удаления расчета');
                        }
                    });
                });
            } else if (response.status === 401) {
                localStorage.removeItem('authToken');
                savedCalculations.innerHTML = `
                    <div class="saved-item-placeholder">
                        <p>Сессия истекла. Войдите в систему заново</p>
                        <a href="/login.html" target="_blank" style="color: #667eea; text-decoration: none;">Войти в систему</a>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading calculations:', error);
            savedCalculations.innerHTML = `
                <div class="saved-item-placeholder">
                    <p>Ошибка загрузки расчетов</p>
                </div>
            `;
        }
    }

    // Функция загрузки сохраненного расчета
    function loadSavedCalculation(calc) {
        // Сброс текущего состояния
        document.querySelectorAll('.package-card').forEach(card => {
            card.classList.remove('selected');
            if (card.dataset.package === calc.package.type) {
                card.classList.add('selected');
            }
        });

        // Установка чекбоксов услуг
        document.querySelectorAll('.service-option input[type="checkbox"]').forEach(checkbox => {
            const serviceType = checkbox.dataset.service;
            checkbox.checked = calc.services.some(service => service.type === serviceType);
        });

        // Отправляем событие обновления
        const event = new CustomEvent('calculatorUpdated', {
            detail: {
                selectedPackage: calc.package,
                selectedServices: calc.services,
                total: calc.total
            }
        });
        document.dispatchEvent(event);
    }

    // Функция отображения таблицы сравнения
    function renderComparisonTable() {
        if (!comparisonTable) return;

        const packages = [
            { name: 'Лендинг', price: 50, features: ['Адаптивная верстка', 'SEO базовое', 'Контактная форма', 'Оптимизация скорости'] },
            { name: 'Многостраничный', price: 90, features: ['До 10 страниц', 'Адаптивная верстка', 'CMS', 'SEO оптимизация'] },
            { name: 'Интернет-магазин', price: 140, features: ['Каталог товаров', 'Корзина и оплата', 'Админ панель', 'Интеграции'] }
        ];

        const allFeatures = [...new Set(packages.flatMap(p => p.features))];

        comparisonTable.innerHTML = `
            <div class="comparison-header">
                <div>Функции</div>
                <div>Лендинг</div>
                <div>Многостр.</div>
                <div>Магазин</div>
            </div>
            ${allFeatures.map(feature => `
                <div class="comparison-row">
                    <div class="comparison-feature">${feature}</div>
                    ${packages.map(pkg => `
                        <div class="comparison-value ${pkg.features.includes(feature) ? 'comparison-check' : 'comparison-cross'}">
                            ${pkg.features.includes(feature) ? '✓' : '✗'}
                        </div>
                    `).join('')}
                </div>
            `).join('')}
            <div class="comparison-row" style="font-weight: 600; background: var(--color-bg-secondary);">
                <div class="comparison-feature">Цена</div>
                ${packages.map(pkg => `
                    <div class="comparison-value">${pkg.price} €</div>
                `).join('')}
            </div>
        `;
    }

    // Функция обновления временной шкалы
    function updateProjectTimeline(projectType) {
        if (!projectTimeline) return;

        const timelines = {
            landing: [
                { phase: 'Планирование', duration: '1-2 дня', description: 'Анализ требований, создание ТЗ' },
                { phase: 'Дизайн', duration: '2-3 дня', description: 'Создание макетов, согласование стиля' },
                { phase: 'Верстка', duration: '3-4 дня', description: 'HTML/CSS код, адаптивность' },
                { phase: 'Функционал', duration: '1-2 дня', description: 'JavaScript, формы, анимации' },
                { phase: 'Тестирование', duration: '1 день', description: 'Проверка во всех браузерах' }
            ],
            multipage: [
                { phase: 'Планирование', duration: '2-3 дня', description: 'Структура сайта, ТЗ' },
                { phase: 'Дизайн', duration: '4-5 дней', description: 'Дизайн всех страниц' },
                { phase: 'Верстка', duration: '5-7 дней', description: 'Верстка всех страниц' },
                { phase: 'CMS', duration: '2-3 дня', description: 'Настройка системы управления' },
                { phase: 'Наполнение', duration: '1-2 дня', description: 'Добавление контента' },
                { phase: 'Тестирование', duration: '1-2 дня', description: 'Полное тестирование' }
            ],
            ecommerce: [
                { phase: 'Планирование', duration: '3-4 дня', description: 'Архитектура, ТЗ, интеграции' },
                { phase: 'Дизайн', duration: '5-7 дней', description: 'Дизайн всех страниц и процессов' },
                { phase: 'Backend', duration: '7-10 дней', description: 'Система каталога, корзины, заказов' },
                { phase: 'Frontend', duration: '5-7 дней', description: 'Интерфейс магазина' },
                { phase: 'Платежи', duration: '2-3 дня', description: 'Настройка платежных систем' },
                { phase: 'Тестирование', duration: '2-3 дня', description: 'Тестирование всех процессов' }
            ],
            custom: [
                { phase: 'Анализ', duration: '3-5 дней', description: 'Глубокий анализ требований' },
                { phase: 'Прототип', duration: '5-7 дней', description: 'Создание рабочего прототипа' },
                { phase: 'Разработка', duration: '10-15 дней', description: 'Основная разработка' },
                { phase: 'Интеграции', duration: '3-5 дней', description: 'Подключение внешних сервисов' },
                { phase: 'Тестирование', duration: '3-4 дня', description: 'Комплексное тестирование' },
                { phase: 'Оптимизация', duration: '2-3 дня', description: 'Финальная оптимизация' }
            ]
        };

        const timeline = timelines[projectType];
        if (!timeline) return;

        projectTimeline.innerHTML = `
            <div class="timeline-container">
                <div class="timeline-line"></div>
                ${timeline.map(item => `
                    <div class="timeline-item">
                        <div class="timeline-phase">${item.phase}</div>
                        <div class="timeline-duration">${item.duration}</div>
                        <div class="timeline-description">${item.description}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Функция получения текущего расчета
    function getCurrentCalculation() {
        const selectedPackageCard = document.querySelector('.package-card.selected');
        if (!selectedPackageCard) return null;

        const selectedPackage = {
            name: selectedPackageCard.querySelector('.package-title').textContent,
            price: parseInt(selectedPackageCard.dataset.price),
            type: selectedPackageCard.dataset.package
        };

        const selectedServices = [];
        document.querySelectorAll('.service-option input[type="checkbox"]:checked').forEach(checkbox => {
            selectedServices.push({
                name: checkbox.parentNode.querySelector('.service-name').textContent,
                price: parseInt(checkbox.dataset.price),
                type: checkbox.dataset.service
            });
        });

        const total = selectedPackage.price + selectedServices.reduce((sum, service) => sum + service.price, 0);

        return { package: selectedPackage, services: selectedServices, total };
    }

    // Функция форматирования цены (используем существующую)
    function formatPrice(price) {
        return new Intl.NumberFormat('en-DE').format(price) + ' €';
    }
}

// ===== ЧАТБОТ =====

// Инициализация чатбота
function initChatbot() {
    const chatbotContainer = document.getElementById('chatbotContainer');
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotMessages = document.getElementById('chatbotMessages');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotSendBtn = document.getElementById('chatbotSendBtn');
    const chatbotTyping = document.getElementById('chatbotTyping');

    if (!chatbotContainer || !chatbotToggle) return;

    let isOpen = false;

    // База знаний для чатбота
    const chatbotKnowledge = {
        'цена': 'Стоимость проектов:\n• Лендинг: от 50€\n• Многостраничный сайт: от 90€\n• Интернет-магазин: от 140€\n• Кастомное решение: от 110€\n\nИспользуйте калькулятор выше для точного расчета! 💰',
        'сроки': 'Сроки разработки:\n• Лендинг: 7-12 дней\n• Многостраничный: 15-20 дней\n• Интернет-магазин: 25-35 дней\n• Кастомное решение: 28-40 дней\n\nТочные сроки зависят от сложности проекта. ⏱️',
        'технологии': 'Используемые технологии:\n• Frontend: HTML5, CSS3, JavaScript, React\n• Backend: Node.js, Express.js, MongoDB\n• Инструменты: Git, Webpack, ESLint\n• Хостинг: Railway, Vercel, AWS\n\nВсегда использую современные и надежные решения! ⚙️',
        'процесс': 'Процесс работы:\n1. Обсуждение требований\n2. Создание технического задания\n3. Дизайн и согласование\n4. Разработка\n5. Тестирование\n6. Запуск и передача\n\nВы участвуете на каждом этапе! 📋',
        'портфолио': 'В моем портфолио есть:\n• Лендинги для бизнеса\n• Корпоративные сайты\n• Интернет-магазины\n• Веб-приложения\n\nПосмотрите секцию "Мои работы" выше! 💼',
        'поддержка': 'Предоставляю:\n• Техническую поддержку 6 месяцев\n• Обучение работе с сайтом\n• Исправление багов\n• Консультации по развитию\n\nВаш сайт всегда будет работать стабильно! 🛠️',
        'контакты': 'Связаться со мной:\n• Email: info@techportal.dev\n• Telegram: @techportal_dev\n• Телефон: +7 (999) 123-45-67\n\nОтвечу в течение 2-4 часов! 📞'
    };

    // Открытие/закрытие чатбота
    chatbotToggle.addEventListener('click', () => {
        isOpen = !isOpen;
        chatbotContainer.classList.toggle('active', isOpen);

        if (isOpen && chatbotInput) {
            setTimeout(() => chatbotInput.focus(), 300);
        }
    });

    // Обработка быстрых кнопок
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('quick-btn')) {
            const question = e.target.dataset.question;
            if (question) {
                sendUserMessage(question);
                setTimeout(() => sendBotResponse(question), 800);
            }
        }
    });

    // Отправка сообщения пользователя
    function sendUserMessage(message) {
        if (!chatbotMessages) return;

        const messageElement = document.createElement('div');
        messageElement.className = 'message message-user';
        messageElement.innerHTML = `
            <div class="message-avatar">
                <img src="images/user-avatar.jpg" alt="Вы" onerror="this.style.display='none'">
            </div>
            <div class="message-content">
                <p>${message}</p>
            </div>
        `;

        chatbotMessages.appendChild(messageElement);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // Отправка ответа бота
    function sendBotResponse(query) {
        if (!chatbotMessages) return;

        // Показываем индикатор печатания
        showTypingIndicator();

        setTimeout(() => {
            hideTypingIndicator();

            const response = getBotResponse(query);

            function createBotMessage() {
                const messageElement = document.createElement('div');
                messageElement.className = 'message message-bot';
                messageElement.innerHTML = `
                 <div class="message-avatar">
                     <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                         <circle cx="12" cy="8" r="4" fill="#667eea"/>
                         <path d="M12 14c-4 0-7 2.5-7 5.5V21h14v-1.5c0-3-5.5-7-5.5z" fill="#667eea"/>
                         <circle cx="9" cy="7" r="1" fill="white"/>
                         <circle cx="15" cy="7" r="1" fill="white"/>
                         <path d="M9.5 9.5c.5.5 1.5.5 2 0s1.5 0 2 0" stroke="white" stroke-width="1" stroke-linecap="round"/>
                     </svg>
                 </div>
                 <div class="message-content">
                     <p>${response}</p>
                 </div>
             `;
                return messageElement;
            }

            chatbotMessages.appendChild(createBotMessage());
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }, 1500);
    }

    // Получение ответа бота
    function getBotResponse(query) {
        const lowerQuery = query.toLowerCase();

        // Поиск по ключевым словам
        for (const [key, response] of Object.entries(chatbotKnowledge)) {
            if (lowerQuery.includes(key)) {
                return response;
            }
        }

        // Дополнительные ключевые слова
        if (lowerQuery.includes('привет') || lowerQuery.includes('здравствуй')) {
            return 'Привет! 👋 Рад вас видеть! Чем могу помочь? Спросите о ценах, сроках или технологиях.';
        }

        if (lowerQuery.includes('спасибо') || lowerQuery.includes('благодар')) {
            return 'Пожалуйста! 😊 Если есть еще вопросы - обращайтесь!';
        }

        if (lowerQuery.includes('заказ') || lowerQuery.includes('хочу')) {
            return 'Отлично! 🎉 Заполните форму обратной связи ниже или напишите мне напрямую. Обсудим ваш проект детально!';
        }

        // Ответ по умолчанию
        return 'Интересный вопрос! 🤔 Я могу рассказать о:\n• Ценах и сроках\n• Технологиях разработки\n• Процессе работы\n• Поддержке проектов\n\nИли напишите мне напрямую для детального обсуждения!';
    }

    // Индикатор печатания
    function showTypingIndicator() {
        if (chatbotTyping) {
            chatbotTyping.style.display = 'flex';
        }
    }

    function hideTypingIndicator() {
        if (chatbotTyping) {
            chatbotTyping.style.display = 'none';
        }
    }

    // Функция обработки отправки сообщения
    function handleSendMessage() {
        if (!chatbotInput) return;

        const message = chatbotInput.value.trim();
        if (message) {
            sendUserMessage(message);
            chatbotInput.value = '';
            setTimeout(() => sendBotResponse(message), 800);
        }
    }

    // Обработка ввода текста
    if (chatbotInput && chatbotSendBtn) {
        chatbotSendBtn.addEventListener('click', handleSendMessage);

        chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSendMessage();
            }
        });
    }

    // Автоматическое появление уведомления через 10 секунд
    setTimeout(() => {
        if (!isOpen) {
            const notification = document.getElementById('chatbotNotification');
            if (notification) {
                notification.style.opacity = '1';
                notification.style.transform = 'translateX(0) scale(1)';

                setTimeout(() => {
                    notification.style.opacity = '0';
                    notification.style.transform = 'translateX(10px) scale(0.8)';
                }, 5000);
            }
        }
    }, 10000);
}

// ===== Модули =====

// Быстрая инициализация без задержек
function initPreloader() {
    const preloader = document.getElementById('preloader');
    
    if (preloader) {
        // Мгновенно убираем прелоадер
                        preloader.classList.add('hidden');
        document.body.classList.remove('loading');

        // Запуск анимаций
                        document.querySelectorAll('.animate-on-load').forEach(el => {
                            el.classList.add('animate');
                        });
    }
}

// Кастомный курсор
function initCustomCursor() {
    const cursor = document.getElementById('customCursor');
    const follower = document.getElementById('customCursorFollower');

    if (!cursor || !follower) return;

    // Только для устройств с мышью
    if (window.matchMedia('(pointer: fine)').matches) {
        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;
        let followerX = 0, followerY = 0;
        let animationFrameId = null;

        const mouseMoveHandler = function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        document.addEventListener('mousemove', mouseMoveHandler, { passive: true });

        const updateCursor = () => {
            cursorX += (mouseX - cursorX) * 0.2;
            cursorY += (mouseY - cursorY) * 0.2;
            followerX += (mouseX - followerX) * 0.1;
            followerY += (mouseY - followerY) * 0.1;

            cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
            follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;

            animationFrameId = requestAnimationFrame(updateCursor);
        };

        animationFrameId = requestAnimationFrame(updateCursor);

        // Эффекты при наведении на интерактивные элементы
        const interactiveElements = document.querySelectorAll('a, button, .work-card, .service-card, input, textarea, [data-cursor="pointer"]');

        interactiveElements.forEach(function(el) {
            el.addEventListener('mouseenter', function() {
                cursor.classList.add('cursor-hover');
                follower.classList.add('follower-hover');
            });

            el.addEventListener('mouseleave', function() {
                cursor.classList.remove('cursor-hover');
                follower.classList.remove('follower-hover');
            });
        });

        // Специальные эффекты для разных типов элементов
        document.querySelectorAll('[data-cursor="view"]').forEach(el => {
            el.addEventListener('mouseenter', function() {
                cursor.classList.add('cursor-view');
                follower.classList.add('follower-view');
            });

            el.addEventListener('mouseleave', function() {
                cursor.classList.remove('cursor-view');
                follower.classList.remove('follower-view');
            });
        });

        // Очистка при уничтожении
        return function cleanup() {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            document.removeEventListener('mousemove', mouseMoveHandler);
        };
    } else {
        cursor.style.display = 'none';
        follower.style.display = 'none';
    }
}

// Боковая навигация
function initSideNav() {
    const sideNav = document.getElementById('sideNav');
    const sideNavLinks = document.querySelectorAll('.side-nav-link');

    if (!sideNav || !sideNavLinks.length) return;

    // Использование Intersection Observer для определения активного раздела
    const sections = document.querySelectorAll('section[id]');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.3
    };

    const sectionObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');

                sideNavLinks.forEach(link => {
                    link.classList.remove('active');

                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // Плавный скролл при клике
    sideNavLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            if (link.classList.contains('external')) return;

            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Мобильная навигация
function initMobileNav() {
    const mobileNavToggle = document.getElementById('mobileNavToggle');
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavClose = document.getElementById('mobileNavClose');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const menuIcon = document.querySelector('.menu-icon');

    if (!mobileNavToggle || !mobileNav || !mobileNavClose) return;

    // Открытие/закрытие меню при клике на кнопку меню
    mobileNavToggle.addEventListener('click', function() {
        if (mobileNav.classList.contains('active')) {
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
            mobileNavToggle.style.display = 'flex';
        } else {
            mobileNav.classList.add('active');
            document.body.style.overflow = 'hidden';
            mobileNavToggle.style.display = 'none';
        }
    });

    // Добавляем обработчик на иконку меню отдельно (на всякий случай)
    if (menuIcon) {
        menuIcon.addEventListener('click', function(e) {
            if (mobileNav.classList.contains('active')) {
                mobileNav.classList.remove('active');
                document.body.style.overflow = '';
                mobileNavToggle.style.display = 'flex';
            } else {
                mobileNav.classList.add('active');
                document.body.style.overflow = 'hidden';
                mobileNavToggle.style.display = 'none';
            }
            e.stopPropagation();
        });
    }

    // Закрытие меню
    mobileNavClose.addEventListener('click', function() {
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
        mobileNavToggle.style.display = 'flex';
    });

    // Закрытие при клике на само меню (фон)
    mobileNav.addEventListener('click', function(e) {
        if (e.target === mobileNav) {
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
            mobileNavToggle.style.display = 'flex';
        }
    });

    // Закрытие по клику вне меню
    document.addEventListener('click', function(e) {
        if (mobileNav.classList.contains('active') &&
            !mobileNav.contains(e.target) &&
            e.target !== mobileNavToggle) {
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
            mobileNavToggle.style.display = 'flex';
        }
    });

    // Плавный скролл при клике
    mobileNavLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            if (mobileNav.classList.contains('active')) {
                mobileNav.classList.remove('active');
                document.body.style.overflow = '';
                mobileNavToggle.style.display = 'flex';
            }

            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();

                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);

                if (targetSection) {
                    setTimeout(function() {
                        window.scrollTo({
                            top: targetSection.offsetTop,
                            behavior: 'smooth'
                        });
                    }, 300);
                }
            }
        });
    });
}

// Индикатор прогресса скролла
// Инициализация кнопки скролла
function initScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (!scrollIndicator) return;

    scrollIndicator.addEventListener('click', function() {
        const worksSection = document.getElementById('works');
        if (worksSection) {
            worksSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });

    // Анимация появления при скролле
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(scrollIndicator,
            { opacity: 0, y: -20 },
            { opacity: 0.7, y: 0, duration: 1, delay: 1, ease: 'power2.out' }
        );
    }
}

function initScrollProgress() {
    const scrollProgress = document.getElementById('scrollProgress');

    if (!scrollProgress) return;

    function updateScrollProgress() {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;

        scrollProgress.style.width = scrolled + '%';
    }

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress(); // Инициализация
}

// Счетчик статистики
// Анимация цифр в статистике с поддержкой GSAP
function initStatsCounter() {
    const stats = document.querySelectorAll('.stat-number[data-count]');

    if (!stats.length) return;

    // Используем GSAP если доступен
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        
        stats.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count')) || 0;
            
            ScrollTrigger.create({
                trigger: stat.closest('.stat') || stat,
                start: 'top 80%',
                once: true,
                onEnter: () => {
                    gsap.to({ value: 0 }, {
                        value: target,
                        duration: 2,
                        ease: 'power2.out',
                        onUpdate: function() {
                            stat.textContent = Math.round(this.targets()[0].value);
                        }
                    });
                }
            });
        });
    } else {
        // Fallback на IntersectionObserver с улучшенной анимацией
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const targetValue = parseInt(el.getAttribute('data-count')) || 0;
                    const duration = 2000;
                    const frameDuration = 1000 / 60;
                    const totalFrames = Math.round(duration / frameDuration);
                    let frame = 0;
                    let currentValue = 0;

                    const animate = () => {
                        frame++;
                        const progress = frame / totalFrames;
                        const easedProgress = progress < 0.5
                            ? 4 * progress * progress * progress
                            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

                        currentValue = Math.round(easedProgress * targetValue);
                        el.textContent = currentValue;

                        if (frame < totalFrames) {
                            requestAnimationFrame(animate);
                        } else {
                            el.textContent = targetValue;
                        }
                    };

                    requestAnimationFrame(animate);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        stats.forEach(stat => observer.observe(stat));
    }
}

// Фильтрация портфолио
function initPortfolioFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const workItems = document.querySelectorAll('.work-item');

    if (!filterButtons.length || !workItems.length) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Убираем активный класс со всех кнопок
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Добавляем активный класс на текущую кнопку
            this.classList.add('active');

            const filterValue = this.getAttribute('data-filter');

            workItems.forEach(item => {
                if (filterValue === 'all') {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.classList.remove('filtered-out');
                    }, 10);
                } else {
                    if (item.classList.contains(filterValue)) {
                        item.style.display = 'block';
                        setTimeout(() => {
                            item.classList.remove('filtered-out');
                        }, 10);
                    } else {
                        item.classList.add('filtered-out');
                        setTimeout(() => {
                            item.style.display = 'none';
                        }, 300);
                    }
                }
            });
        });
    });
}

// Ленивая загрузка изображений
function initLazyLoading() {
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
        });
    } else {
        // Fallback для старых браузеров
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
        document.body.appendChild(script);
    }
}

// Анимации при скролле
// GSAP анимации при скролле
function initScrollAnimations() {
    // Проверяем наличие GSAP
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        // Fallback на IntersectionObserver если GSAP не загружен
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        if (!animatedElements.length) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '50px' });
        animatedElements.forEach(el => observer.observe(el));
        return;
    }

    // Регистрируем ScrollTrigger плагин
    gsap.registerPlugin(ScrollTrigger);

    // Анимация появления секций
    gsap.utils.toArray('.section').forEach((section, index) => {
        gsap.fromTo(section, 
            {
                opacity: 0,
                y: 60
            },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });

    // Анимация карточек работ
    gsap.utils.toArray('.work-item').forEach((item, index) => {
        gsap.fromTo(item,
            {
                opacity: 0,
                y: 50,
                scale: 0.9
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                ease: 'back.out(1.2)',
                delay: index * 0.1,
                scrollTrigger: {
                    trigger: item,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });

    // Анимация карточек услуг
    gsap.utils.toArray('.service-card').forEach((card, index) => {
        gsap.fromTo(card,
            {
                opacity: 0,
                x: -30
            },
            {
                opacity: 1,
                x: 0,
                duration: 0.7,
                ease: 'power2.out',
                delay: index * 0.1,
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });

    // Анимация отзывов
    gsap.utils.toArray('.review-card').forEach((card, index) => {
        gsap.fromTo(card,
            {
                opacity: 0,
                y: 40
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power2.out',
                delay: index * 0.15,
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });
}

// Параллакс эффект для hero секции
function initHeroParallax() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    
    gsap.registerPlugin(ScrollTrigger);
    
    const heroSection = document.querySelector('.hero-section');
    const heroVisual = document.querySelector('.hero-visual');
    const blobAnimation = document.querySelector('.blob-animation');
    const rotatingTech = document.querySelector('.rotating-tech');
    
    if (!heroSection) return;

    // Параллакс для визуального блока
    if (heroVisual) {
        gsap.to(heroVisual, {
            y: -100,
            ease: 'none',
            scrollTrigger: {
                trigger: heroSection,
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    }

    // Параллакс для blob анимации
    if (blobAnimation) {
        gsap.to(blobAnimation, {
            y: -50,
            scale: 1.1,
            ease: 'none',
            scrollTrigger: {
                trigger: heroSection,
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    }

    // Параллакс для вращающихся технологий
    if (rotatingTech) {
        gsap.to(rotatingTech, {
            rotation: 360,
            ease: 'none',
            scrollTrigger: {
                trigger: heroSection,
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    }
}


// Регистрация Service Worker
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js').then(function(registration) {
                // Удалено: console.log('ServiceWorker успешно зарегистрирован:', registration.scope);
            }).catch(function(error) {
                // Удалено: console.log('Ошибка при регистрации ServiceWorker:', error);
            });
        });
    }
}

// Модальные окна
function initModal() {
    const modal = document.getElementById('projectModal');
    const modalClose = document.getElementById('modalClose');
    const workLinks = document.querySelectorAll('.work-link');

    if (!modal || !modalClose) return;

    // Закрытие модального окна
    modalClose.addEventListener('click', function() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Клик вне модального окна
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Открытие модального окна при клике на карточку
    const workItems = document.querySelectorAll('.work-item');
    
    workItems.forEach(function(item) {
        item.addEventListener('click', function(e) {
            // Предотвращаем двойное срабатывание если кликнули на ссылку
            if (e.target.closest('.work-link')) return;
            
            const projectId = this.getAttribute('data-project') || 
                             this.querySelector('.work-link')?.getAttribute('data-project');
            
            if (projectId) {
                openProjectModal(projectId);
            }
        });
    });
    
    // Открытие модального окна при клике на ссылку
    workLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const projectId = this.getAttribute('data-project');

            if (projectId) {
                openProjectModal(projectId);
            }
        });
    });
    
    // Функция для открытия модального окна
    function openProjectModal(projectId) {
            // Получение данных проекта
            const projectData = getProjectData(projectId);

            if (projectData) {
                // Заполнение модального окна
                document.getElementById('modalTitle').textContent = projectData.title;
                document.getElementById('modalDescription').textContent = projectData.description;
                document.getElementById('modalAbout').textContent = projectData.about || projectData.description;
                document.getElementById('modalTask').textContent = projectData.task || 'Создание современного веб-приложения с использованием передовых технологий.';

                // Очистка тегов
                document.getElementById('modalTags').innerHTML = '';

                // Добавление тегов
                if (projectData.tags && projectData.tags.length > 0) {
                    projectData.tags.forEach(function(tag) {
                        const tagElement = document.createElement('span');
                        tagElement.className = 'tag';
                        tagElement.textContent = tag;
                        document.getElementById('modalTags').appendChild(tagElement);
                    });
                }

                // Очистка стека технологий
                document.getElementById('modalTechStack').innerHTML = '';

                // Добавление стека технологий
                if (projectData.techStack && projectData.techStack.length > 0) {
                    projectData.techStack.forEach(function(tech) {
                        const techElement = document.createElement('span');
                        techElement.className = 'tag';
                        techElement.textContent = tech;
                        document.getElementById('modalTechStack').appendChild(techElement);
                    });
                }

                // Очистка результатов
                document.getElementById('modalResult').innerHTML = '';

                // Добавление результатов
                if (projectData.result && projectData.result.length > 0) {
                    projectData.result.forEach(function(result) {
                        const resultElement = document.createElement('li');
                        resultElement.textContent = result;
                        document.getElementById('modalResult').appendChild(resultElement);
                    });
                } else if (projectData.features && projectData.features.length > 0) {
                    // Fallback на features если result не указан
                    projectData.features.forEach(function(feature) {
                        const featureElement = document.createElement('li');
                        featureElement.textContent = feature;
                        document.getElementById('modalResult').appendChild(featureElement);
                    });
                }

                // Очистка ссылок
                document.getElementById('modalLinks').innerHTML = '';

                // Добавление ссылок
                if (projectData.liveLink && projectData.liveLink !== '#') {
                    const liveLinkElement = document.createElement('a');
                    liveLinkElement.href = projectData.liveLink;
                    liveLinkElement.target = '_blank';
                    liveLinkElement.rel = 'noopener noreferrer';
                    liveLinkElement.className = 'btn btn-primary';
                    liveLinkElement.innerHTML = '<span>Посмотреть проект</span><svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                    document.getElementById('modalLinks').appendChild(liveLinkElement);
                }

                if (projectData.githubLink && projectData.githubLink !== '#') {
                    const githubLinkElement = document.createElement('a');
                    githubLinkElement.href = projectData.githubLink;
                    githubLinkElement.target = '_blank';
                    githubLinkElement.rel = 'noopener noreferrer';
                    githubLinkElement.className = 'btn btn-secondary';
                    githubLinkElement.innerHTML = '<span>GitHub</span><svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                    document.getElementById('modalLinks').appendChild(githubLinkElement);
                }

                // Установка изображения
                if (projectData.image) {
                    document.getElementById('modalImage').style.backgroundImage = 'url(' + projectData.image + ')';
                }

                // Анимация открытия модального окна с GSAP
                if (typeof gsap !== 'undefined') {
                    gsap.fromTo(modal.querySelector('.modal-container'),
                        { opacity: 0, scale: 0.9, y: 50 },
                        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.2)' }
                    );
                }

                // Открытие модального окна
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
    }
}

// Форма обратной связи
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (isSubmitting) return;
        isSubmitting = true;

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Отправляем...</span>';
        submitBtn.disabled = true;

        try {
            const formData = new FormData(form);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');

            // Клиентская валидация для лучшего UX
            const clientErrors = [];

            if (!name || name.trim().length < 2 || name.trim().length > 50) {
                clientErrors.push('Имя должно содержать от 2 до 50 символов');
            }

            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
                clientErrors.push('Введите корректный email адрес');
            }

            if (!message || message.trim().length < 10 || message.trim().length > 1000) {
                clientErrors.push('Сообщение должно содержать от 10 до 1000 символов');
            }

            if (clientErrors.length > 0) {
                throw new Error(clientErrors.join('\n'));
            }

            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };

            // Добавляем CSRF токен если есть
            if (csrfToken) {
                headers['X-CSRF-Token'] = csrfToken;
            }

            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    message: message.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                // Если есть ошибки валидации, показываем их подробно
                if (data.errors && Array.isArray(data.errors)) {
                    const errorMessage = data.errors.join('\n');
                    throw new Error(errorMessage);
                }
                throw new Error(data.message || 'Ошибка отправки');
            }

            showToast('success', data.message || 'Сообщение отправлено!');
            form.reset();

        } catch (error) {
            console.error('Error:', error);

            // Если ошибка связана с CSRF токеном, пробуем обновить его
            if (error.message.includes('CSRF') || error.message.includes('csrf')) {
                await initCSRF();
                showToast('error', 'Попробуйте отправить сообщение еще раз');
            } else {
                showToast('error', error.message || 'Произошла ошибка при отправке');
            }

        } finally {
            isSubmitting = false;
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Данные проектов
function getProjectData(projectId) {
    const projects = {
        project1: {
            title: 'Современный лендинг',
            description: 'Одностраничный сайт с параллакс эффектами и плавными анимациями',
            task: 'Создать современный одностраничный лендинг для IT-компании с интерактивными анимациями, параллакс эффектами и высокой производительностью.',
            about: 'Лендинг для IT-компании с современным дизайном, плавными анимациями и высокой скоростью загрузки. Адаптирован для всех устройств и оптимизирован для SEO.',
            tags: ['React', 'GSAP'],
            techStack: ['React', 'GSAP', 'Styled Components', 'Webpack', 'HTML5', 'CSS3'],
            features: [
                'Плавные анимации при скролле',
                'Параллакс эффекты',
                'Адаптивный дизайн',
                'Оптимизированная производительность',
                'Высокая конверсия'
            ],
            result: [
                'Увеличение конверсии на 40%',
                'Время загрузки менее 2 секунд',
                '100% адаптивность для всех устройств',
                'SEO-оптимизация: топ-3 в поисковой выдаче'
            ],
            image: '/images/project-placeholder.jpg',
            liveLink: '#',
            githubLink: '#'
        },
        project2: {
            title: 'Интернет-магазин',
            description: 'Полнофункциональный онлайн-магазин с корзиной и оформлением заказов',
            task: 'Разработать полнофункциональный интернет-магазин с системой управления товарами, корзиной, оплатой и административной панелью.',
            about: 'Современный интернет-магазин с функциями добавления товаров в корзину, оформления заказов, онлайн-оплаты и личным кабинетом пользователя.',
            tags: ['Node.js', 'MongoDB'],
            techStack: ['Node.js', 'Express', 'MongoDB', 'React', 'Redux', 'Stripe API'],
            features: [
                'Каталог товаров с фильтрацией',
                'Корзина и оформление заказов',
                'Интеграция с платежными системами',
                'Личный кабинет пользователя',
                'Административная панель'
            ],
            result: [
                'Увеличение продаж на 60%',
                'Безопасная обработка платежей',
                'Удобная админ-панель для управления',
                'Масштабируемая архитектура'
            ],
            image: '/images/project-placeholder.jpg',
            liveLink: '#',
            githubLink: '#'
        },
        project3: {
            title: 'Система авторизации',
            description: 'Защищенная система входа с JWT токенами и восстановлением пароля',
            task: 'Разработать безопасную систему аутентификации с поддержкой JWT токенов, социальных сетей и двухфакторной аутентификации.',
            about: 'Надежная система авторизации с JWT токенами, социальными сетями, двухфакторной аутентификацией и восстановлением пароля.',
            tags: ['React', 'Firebase'],
            techStack: ['React', 'Firebase Auth', 'JWT', 'Node.js', 'Express'],
            features: [
                'Регистрация и вход с валидацией',
                'JWT токены для аутентификации',
                'Авторизация через соцсети',
                'Двухфакторная аутентификация',
                'Восстановление пароля'
            ],
            result: [
                'Безопасная аутентификация пользователей',
                'Поддержка OAuth провайдеров',
                'Защита от CSRF и XSS атак',
                'Удобный UX для пользователей'
            ],
            image: '/images/project-placeholder.jpg',
            liveLink: '#',
            githubLink: '#'
        },
        project4: {
            title: 'Корпоративный блог',
            description: 'Многопользовательский блог с ролями и редактором контента',
            task: 'Создать корпоративный блог с системой управления контентом, ролями пользователей и модерацией.',
            about: 'Полнофункциональный корпоративный блог с системой ролей, богатым редактором контента и модерацией комментариев.',
            tags: ['React', 'Node.js'],
            techStack: ['React', 'Node.js', 'MongoDB', 'Redux'],
            features: [
                'Многопользовательский доступ',
                'Система ролей и прав',
                'Богатый редактор контента',
                'Комментарии и модерация',
                'Статистика просмотров'
            ],
            result: [
                'Увеличение вовлеченности на 50%',
                'Удобная система управления контентом',
                'Модерация комментариев в реальном времени',
                'Аналитика и статистика'
            ],
            image: '/images/project-placeholder.jpg',
            liveLink: '#',
            githubLink: '#'
        },
        project5: {
            title: 'Кастомная WordPress тема',
            description: 'Уникальная тема с нестандартными блоками и интеграциями',
            task: 'Разработать кастомную WordPress тему с гибким конструктором блоков и интеграцией с WooCommerce.',
            about: 'Кастомная WordPress тема с использованием Advanced Custom Fields и собственных типов записей для создания гибкого и расширяемого сайта.',
            tags: ['WordPress', 'Custom Theme'],
            techStack: ['WordPress', 'JavaScript', 'ACF Pro', 'SCSS', 'Gulp'],
            features: [
                'Гибкий конструктор блоков',
                'Пользовательские типы записей',
                'Интеграция с WooCommerce',
                'Оптимизация загрузки',
                'Кастомная админка'
            ],
            result: [
                'Уникальный дизайн без ограничений',
                'Быстрая загрузка страниц',
                'Удобное управление контентом',
                'SEO-оптимизация из коробки'
            ],
            image: '/images/project-placeholder.jpg',
            liveLink: '#',
            githubLink: '#'
        },
        project6: {
            title: 'Адаптивная верстка',
            description: 'Точная pixel-perfect верстка с макета Figma с поддержкой всех устройств',
            task: 'Выполнить pixel-perfect верстку по макету Figma с полной адаптацией для всех устройств.',
            about: 'Pixel-perfect верстка по дизайну из Figma с адаптацией для всех типов устройств, анимациями и соблюдением стандартов доступности.',
            tags: ['Figma', 'HTML/CSS'],
            techStack: ['HTML5', 'CSS3', 'SCSS', 'JavaScript', 'Gulp', 'Figma'],
            features: [
                'Pixel-perfect верстка',
                'Адаптивный и отзывчивый дизайн',
                'Кроссбраузерная совместимость',
                'Оптимизация изображений',
                'Соблюдение стандартов доступности'
            ],
            result: [
                '100% соответствие макету',
                'Работа на всех устройствах',
                'Высокая производительность',
                'Соответствие стандартам WCAG'
            ],
            image: '/images/project-placeholder.jpg',
            liveLink: '#',
            githubLink: '#'
        }
    };

    return projects[projectId] || null;
}

// Вспомогательные функции
function debounce(func, wait = 20, immediate = true) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

function throttle(func, limit = 300) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Утилиты для создания HTML элементов
function createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);

    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'classList' && Array.isArray(value)) {
            value.forEach(cls => element.classList.add(cls));
        } else if (key === 'dataset' && typeof value === 'object') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                element.dataset[dataKey] = dataValue;
            });
        } else if (key.startsWith('on') && typeof value === 'function') {
            const eventName = key.toLowerCase().substring(2);
            element.addEventListener(eventName, value);
        } else {
            element.setAttribute(key, value);
        }
    });

    if (typeof children === 'string') {
        element.textContent = children;
    } else if (Array.isArray(children)) {
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });
    }

    return element;
}

// Утилиты для форматирования
function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date);
}

// Утилита для получения случайного ID
function generateId(prefix = '') {
    return `${prefix}${Math.random().toString(36).substring(2, 11)}`;
}

// Функция для скачивания CV
function initCVDownload() {
    const downloadCVBtn = document.getElementById('downloadCVBtn');

    if (!downloadCVBtn) return;

    downloadCVBtn.addEventListener('click', function(e) {
        e.preventDefault();

        // Создаем ссылку на CV и запускаем скачивание
        const link = document.createElement('a');
        link.href = 'cv.pdf';
        link.download = 'TechPortal_CV.pdf';
        link.target = '_blank';

        // Скрываем ссылку, добавляем в DOM, кликаем и удаляем
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
            document.body.removeChild(link);

            // Показываем уведомление об успешном скачивании
            showToast('Скачивание началось', 'Ваш файл скачивается', 'success');
        }, 100);
    });
}

// FAQ аккордеон
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    if (!faqItems.length) return;

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Закрыть все открытые элементы
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            // Переключить текущий элемент
            if (!isActive) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    });
}

// Функция для декодирования имен пользователей (исправление кодировки)
function decodeName(name) {
    if (!name || typeof name !== 'string') return name;
    
    // Удалено: console.log('🔍 DEBUG decodeName input:', name);
    // Удалено: console.log('🔍 DEBUG decodeName chars:', Array.from(name).map(c => `${c}(${c.charCodeAt(0)})`).join(' '));
    
    try {
        // Метод 1: Попытка декодирования UTF-8 из неправильно интерпретированных байтов
        const bytes = new Uint8Array(name.length);
        for (let i = 0; i < name.length; i++) {
            bytes[i] = name.charCodeAt(i) & 0xFF; // Берем только младший байт
        }
        const decoded = new TextDecoder('utf-8').decode(bytes);
        
        // Удалено: console.log('🔍 DEBUG decodeName method 1 result:', decoded);
        
        // Проверяем, содержит ли результат кириллицу или латиницу
        if (/[\u0400-\u04FF]/.test(decoded) || /^[a-zA-Z0-9\s]+$/.test(decoded)) {
            return decoded;
        }
    } catch (e) {
        // Удалено: console.log('🔍 DEBUG decodeName method 1 error:', e);
    }
    
    try {
        // Метод 2: Декодирование через escape/unescape (для старых браузеров)
        const decoded = decodeURIComponent(escape(name));
        // Удалено: console.log('🔍 DEBUG decodeName method 2 result:', decoded);
        
        if (/[\u0400-\u04FF]/.test(decoded) || /^[a-zA-Z0-9\s]+$/.test(decoded)) {
            return decoded;
        }
    } catch (e) {
        // Удалено: console.log('🔍 DEBUG decodeName method 2 error:', e);
    }
    
    // Метод 3: Полный словарь замен для всех русских символов
    const replacements = {
        // Специальные случаи
        'ÑÐµÑÑ28': 'тест28',
        'ÑÐµÑÑ': 'тест',
        'ÑÐµÑ': 'тес',
        'Ð³ÐµÐ¹': 'гей',
        'Ñ‚ÐµÑÑ‚': 'тест',
        'Ð´Ð»Ð´Ð¾': 'длдо',
        'Ð°Ð°Ð°': 'ааа',
        'Ð°Ð´Ð¼Ð¸Ð½': 'админ',
        'ÐÐ´Ð¼Ð¸Ð½': 'Админ',
        'Ð¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÐµÐ»ÑŒ': 'пользователь',
        
        // Полный алфавит кириллицы
        'Ð°': 'а', 'Ð±': 'б', 'Ð²': 'в', 'Ð³': 'г', 'Ð´': 'д', 'Ðµ': 'е', 'Ñ': 'ё',
        'Ð¶': 'ж', 'Ð·': 'з', 'Ð¸': 'и', 'Ð¹': 'й', 'Ðº': 'к', 'Ð»': 'л', 'Ð¼': 'м',
        'Ð½': 'н', 'Ð¾': 'о', 'Ð¿': 'п', 'Ñ€': 'р', 'Ñ': 'с', 'Ñ‚': 'т', 'Ñƒ': 'у',
        'Ñ„': 'ф', 'Ñ…': 'х', 'Ñ†': 'ц', 'Ñ‡': 'ч', 'Ñˆ': 'ш', 'Ñ‰': 'щ', 'ÑŠ': 'ъ',
        'Ñ‹': 'ы', 'ÑŒ': 'ь', 'Ñ': 'э', 'ÑŽ': 'ю', 'Ñ': 'я',
        
        // Заглавные буквы (искаженные -> правильные)
        'А': 'А', 'Б': 'Б', 'В': 'В', 'Г': 'Г', 'Д': 'Д', 'Е': 'Е', 'Ё': 'Ё',
        'Ж': 'Ж', 'З': 'З', 'И': 'И', 'Й': 'Й', 'К': 'К', 'Л': 'Л', 'М': 'М',
        'Н': 'Н', 'О': 'О', 'П': 'П', 'Р': 'Р', 'С': 'С', 'Т': 'Т', 'У': 'У',
        'Ф': 'Ф', 'Х': 'Х', 'Ц': 'Ц', 'Ч': 'Ч', 'Ш': 'Ш', 'Щ': 'Щ', 'Ъ': 'Ъ',
        'Ы': 'Ы', 'Ь': 'Ь', 'Э': 'Э', 'Ю': 'Ю', 'Я': 'Я'
    };
    
    let result = name;
    for (const [corrupted, correct] of Object.entries(replacements)) {
        result = result.replace(new RegExp(corrupted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), correct);
    }
    
    // Удалено: console.log('🔍 DEBUG decodeName final result:', result);
    return result;
}

// Инициализация кнопки авторизации
function initAuthButton() {
    // Удалено: console.log('🔍 DEBUG initAuthButton called');
    // Удалено: console.log('🔍 DEBUG Token in initAuthButton:', localStorage.getItem('authToken'));
    
    const authLink = document.getElementById('authLink');
    const authText = document.getElementById('authText');
    const authLinkMobile = document.getElementById('authLinkMobile');
    const authTextMobile = document.getElementById('authTextMobile');

    // Удалено: console.log('🔍 DEBUG Auth elements found:', {
    //     authLink: !!authLink,
    //     authText: !!authText,
    //     authLinkMobile: !!authLinkMobile,
    //     authTextMobile: !!authTextMobile
    // });

    if (!authLink || !authText || !authLinkMobile || !authTextMobile) {
        // Удалено: console.log('🔍 DEBUG Missing auth elements, returning');
        return;
    }

    // Проверяем авторизацию при загрузке страницы
    // Удалено: console.log('🔍 DEBUG Calling checkAuthStatus');
    
    // Добавляем небольшую задержку для гарантии загрузки localStorage
    setTimeout(() => {
        // Удалено: console.log('🔍 DEBUG Delayed checkAuthStatus call');
    checkAuthStatus();
    }, 100);

    function checkAuthStatus() {
        const token = localStorage.getItem('authToken');
        // Удалено: console.log('🔍 DEBUG checkAuthStatus - token exists:', !!token);
        // Удалено: console.log('🔍 DEBUG checkAuthStatus - token value:', token ? token.substring(0, 50) + '...' : 'null');
        
        if (!token) {
            // Удалено: console.log('🔍 DEBUG No token found');
            updateAuthButton(false);
            return;
        }
        
        const isExpired = isTokenExpired(token);
        // Удалено: console.log('🔍 DEBUG Token expired:', isExpired);
        
        if (isExpired) {
            // Удалено: console.log('🔍 DEBUG Token expired, removing');
            localStorage.removeItem('authToken');
            updateAuthButton(false);
            return;
        }
        
        // Удалено: console.log('🔍 DEBUG Token valid, updating auth button');
        updateAuthButton(true);
    }

    function updateAuthButton(isLoggedIn) {
        // Удалено: console.log('🔍 DEBUG updateAuthButton called with isLoggedIn:', isLoggedIn);
        
        if (isLoggedIn) {
            const token = localStorage.getItem('authToken');
            const userInfo = getUserFromToken(token);
            
            // Удалено: console.log('🔍 DEBUG userInfo from token:', userInfo);
            
            if (userInfo) {
                // Показываем аватарку пользователя
                const firstLetter = userInfo.name.charAt(0).toUpperCase();
                // Удалено: console.log('🔍 DEBUG Setting user avatar with letter:', firstLetter);
                
                // Обновляем боковую навигацию
                authText.innerHTML = `<div class="user-avatar">${firstLetter}</div>`;
                authLink.href = 'profile.html';
                authLink.onclick = null;
                
                // Обновляем мобильную навигацию
                authTextMobile.innerHTML = `<div class="user-avatar-mobile">${firstLetter}</div> ${userInfo.name}`;
                authLinkMobile.href = 'profile.html';
                authLinkMobile.onclick = null;
                
                // Удалено: console.log('🔍 DEBUG Auth button updated for logged in user');
            } else {
                // Удалено: console.log('🔍 DEBUG No userInfo, showing login');
                updateAuthButton(false);
            }
        } else {
            // Удалено: console.log('🔍 DEBUG Setting login state');
            authText.textContent = 'Войти';
            authTextMobile.textContent = 'Войти';
            authLink.href = 'login.html';
            authLinkMobile.href = 'login.html';
            authLink.onclick = authLinkMobile.onclick = null;
        }
    }
    
    function getUserFromToken(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            
            // Удалено: console.log('🔍 DEBUG Token payload:', payload); // Отладка
            
            // Проверяем срок действия токена
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                // Удалено: console.log('🔍 DEBUG Token expired');
                return null;
            }
            
            // Декодируем имя пользователя если нужно
            let decodedName = payload.name || payload.email?.split('@')[0];
            if (decodedName && typeof decodedName === 'string') {
                decodedName = decodeName(decodedName);
            }
            
            const userInfo = {
                userId: payload.userId,
                email: payload.email,
                name: decodedName,
                isAdmin: payload.isAdmin === true || payload.admin === true || payload.role === 'admin',
                role: payload.role
            };
            
            // Удалено: console.log('🔍 DEBUG Parsed user info:', userInfo); // Отладка
            
            return userInfo;
        } catch (error) {
            console.error('Error parsing token:', error);
            return null;
        }
    }

    function isTokenExpired(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return Date.now() >= payload.exp * 1000;
        } catch (error) {
            return true;
        }
    }

    async function logout() {
        try {
            const token = localStorage.getItem('authToken');
            
            // Если есть токен, уведомляем сервер о выходе
            if (token) {
                // Делаем запрос на сервер без ожидания ответа
                fetch('/api/user/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }).catch(() => {
                    // Игнорируем ошибки - выход все равно произойдет локально
                });
            }
        } catch (error) {
            // Игнорируем ошибки сети
        }
        
        // Всегда очищаем локальные данные
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
        sessionStorage.clear();
        
        updateAuthButton(false);
        showToast('success', 'Вы успешно вышли из аккаунта');
        
        // Обновляем сохраненные расчеты если мы на странице калькулятора
        if (document.querySelector('.calculator-section')) {
            const renderFunction = window.renderSavedCalculations;
            if (typeof renderFunction === 'function') {
                renderFunction();
            }
        }
        
        // Очищаем кэши браузера
        try {
            if ('caches' in window) {
                caches.keys().then(names => {
                    names.forEach(name => {
                        caches.delete(name);
                    });
                });
            }
        } catch (error) {
            // Игнорируем ошибки кэша
        }
    }
}

// Custom Cursor
(function() {
  const cursor = document.querySelector('.custom-cursor');
  const hoverEffect = document.querySelector('.cursor-hover-effect');
  if (!cursor || !hoverEffect) return;
  const inner = cursor.querySelector('.cursor-inner');
  const outer = cursor.querySelector('.cursor-outer');
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let outerX = mouseX, outerY = mouseY;

  // Движение курсора
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    inner.style.left = mouseX + 'px';
    inner.style.top = mouseY + 'px';
    hoverEffect.style.left = mouseX + 'px';
    hoverEffect.style.top = mouseY + 'px';
  }, { passive: true });

  // Плавное следование внешнего круга
  function animate() {
    outerX += (mouseX - outerX) * 0.85;
    outerY += (mouseY - outerY) * 0.85;
    if (outer) {
      outer.style.left = outerX + 'px';
      outer.style.top = outerY + 'px';
    }
    requestAnimationFrame(animate);
  }
  animate();

  // Наведение на интерактивные элементы
  const hoverElements = 'a, button, .btn, input, textarea, select, label, .work-link, .auth-link, .auth-link-mobile';
  document.body.addEventListener('pointerover', e => {
    if (e.target.closest(hoverElements)) {
      cursor.style.opacity = '0';
      hoverEffect.classList.add('active');
    }
  });
  document.body.addEventListener('pointerout', e => {
    if (e.target.closest(hoverElements)) {
      cursor.style.opacity = '1';
      hoverEffect.classList.remove('active');
    }
  });

  // Скрытие курсора при уходе мыши
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    hoverEffect.classList.remove('active');
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
  });
})();
