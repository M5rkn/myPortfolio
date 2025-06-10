/**
 * TechPortal - Современное портфолио
 * Основной JavaScript файл
 * Версия: 2.1
 */

// Защитные функции
(function() {
    'use strict';

    // Защита от prototype pollution
    if (typeof Object.freeze === 'function') {
        Object.freeze(Object.prototype);
        Object.freeze(Array.prototype);
        Object.freeze(String.prototype);
    }
})();

let isSubmitting = false;
let csrfToken = '';

// Initialize CSRF token
async function initCSRF() {
    try {
        const response = await fetch('/api/csrf-token');
        const data = await response.json();
        if (data.csrfToken) {
            csrfToken = data.csrfToken;
        }
    } catch (error) {
        console.warn('CSRF token fetch failed:', error);
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
    // Инициализируем все компоненты сразу
    initPreloader();
    initCustomCursor();
    initSideNav();
    initMobileNav();
    initScrollProgress();
    initStatsCounter();
    initPortfolioFilter();
    initLazyLoading();
    initScrollAnimations();
    initCalculator();
    initAdvancedCalculator();
    initChatbot();
    initModal();
    initFAQ();
    initCVDownload();
    registerServiceWorker();

    // Асинхронно инициализируем CSRF и форму
    initCSRFAndForm();
});

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
            packageCards.forEach(c => c.classList.remove('selected'));

            // Выделяем текущую карточку
            card.classList.add('selected');

            // Сохраняем выбранный пакет
            selectedPackage = {
                name: card.querySelector('.package-title').textContent,
                price: parseInt(card.dataset.price),
                type: card.dataset.package
            };

            updateCalculation();
        });
    });

    // Обработчики для дополнительных услуг
    serviceCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const serviceName = checkbox.parentNode.querySelector('.service-name').textContent;
            const servicePrice = parseInt(checkbox.dataset.price);
            const serviceType = checkbox.dataset.service;

            if (checkbox.checked) {
                selectedServices.push({
                    name: serviceName,
                    price: servicePrice,
                    type: serviceType
                });
            } else {
                selectedServices = selectedServices.filter(service => service.type !== serviceType);
            }

            updateCalculation();
        });
    });

    // Функция обновления расчета
    function updateCalculation() {
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

        costBreakdown.innerHTML = breakdown;
        totalPrice.textContent = formatPrice(total);

        // Активируем/деактивируем кнопку отправки
        if (sendToFormBtn) {
            sendToFormBtn.disabled = !selectedPackage;
        }

        // Отправляем событие для интеграции с расширенным калькулятором
        const event = new CustomEvent('calculatorUpdated', {
            detail: {
                selectedPackage,
                selectedServices,
                total
            }
        });
        document.dispatchEvent(event);
    }

    // Функция форматирования цены
    function formatPrice(price) {
        return new Intl.NumberFormat('en-DE').format(price) + ' €';
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
        saveCalculationBtn.addEventListener('click', () => {
            const calculationData = getCurrentCalculation();

            if (calculationData) {
                // Проверяем авторизацию пользователя
                const token = getAuthToken();
                if (!token) {
                    showToast('error', 'Для сохранения расчетов необходимо войти в систему');
                    // Показываем ссылку на авторизацию
                    setTimeout(() => {
                        if (confirm('Хотите перейти к форме входа?')) {
                            window.open('/login.html', '_blank');
                        }
                    }, 1000);
                    return;
                }

                const name = prompt('Введите название для расчета:', calculationData.package.name);
                if (!name) return;

                const savedCalc = {
                    id: Date.now(),
                    name: name.trim(),
                    package: calculationData.package,
                    services: calculationData.services,
                    total: calculationData.total,
                    date: new Date().toLocaleDateString('ru-RU'),
                    userId: getUserIdFromToken(token)
                };

                savedCalcs.unshift(savedCalc);
                if (savedCalcs.length > 10) savedCalcs.pop(); // Лимит 10 расчетов

                localStorage.setItem('savedCalculations', JSON.stringify(savedCalcs));
                renderSavedCalculations();
                showToast('success', 'Расчет сохранен');
            }
        });
    }

    // Получить токен авторизации
    function getAuthToken() {
        try {
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
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.userId || payload.email || 'anonymous';
        } catch (error) {
            return 'anonymous';
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
    function renderSavedCalculations() {
        if (!savedCalculations) return;

        // Фильтруем расчеты по текущему пользователю
        const token = getAuthToken();
        const currentUserId = token ? getUserIdFromToken(token) : null;
        
        const userCalcs = currentUserId 
            ? savedCalcs.filter(calc => calc.userId === currentUserId || !calc.userId) // Показываем старые расчеты без userId
            : [];

        if (userCalcs.length === 0) {
            savedCalculations.innerHTML = `
                <div class="saved-item-placeholder">
                    <p>${currentUserId ? 'Ваши сохраненные расчеты появятся здесь' : 'Войдите в систему для сохранения расчетов'}</p>
                    ${!currentUserId ? '<a href="/login.html" target="_blank" style="color: #667eea; text-decoration: none;">Войти в систему</a>' : ''}
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
                <div class="saved-item-date">${calc.date}</div>
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
                
                const calcId = parseInt(item.dataset.calcId);
                const calc = userCalcs.find(c => c.id === calcId);
                if (calc) {
                    loadSavedCalculation(calc);
                    showToast('success', 'Расчет загружен');
                }
            });
        });

        // Добавляем обработчики для удаления
        savedCalculations.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Предотвращаем загрузку расчета
                
                const calcId = parseInt(btn.dataset.deleteId);
                savedCalcs = savedCalcs.filter(c => c.id !== calcId);
                localStorage.setItem('savedCalculations', JSON.stringify(savedCalcs));
                renderSavedCalculations();
                showToast('success', 'Расчет удален');
            });
        });
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
                     <img src="images/avatar.jpg" alt="Бот">
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

// Прелоадер с прогресс-баром
function initPreloader() {
    const preloader = document.getElementById('preloader');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const progressPercent = document.getElementById('progressPercent');

    if (!preloader || !progressFill) return;

    let progress = 0;
    const loadingSteps = [
        { text: 'Загрузка ресурсов...', duration: 300 },
        { text: 'Инициализация компонентов...', duration: 400 },
        { text: 'Подготовка интерфейса...', duration: 300 },
        { text: 'Финальная настройка...', duration: 200 },
        { text: 'Готово!', duration: 200 }
    ];

    let currentStep = 0;

    function updateProgress() {
        const targetProgress = Math.min(100, (currentStep + 1) * 20);
        const step = (targetProgress - progress) / 20;

        const interval = setInterval(() => {
            progress += step;
            progressFill.style.width = progress + '%';
            progressPercent.textContent = Math.round(progress) + '%';

            if (progress >= targetProgress) {
                clearInterval(interval);
                currentStep++;

                if (currentStep < loadingSteps.length) {
                    progressText.textContent = loadingSteps[currentStep].text;
                    setTimeout(() => {
                        updateProgress();
                    }, loadingSteps[currentStep].duration);
                } else {
                    // Завершение загрузки
                    setTimeout(() => {
                        preloader.classList.add('hidden');

                        // Запуск анимаций после загрузки страницы
                        document.querySelectorAll('.animate-on-load').forEach(el => {
                            el.classList.add('animate');
                        });
                    }, 500);
                }
            }
        }, 20);
    }

    // Запуск первого шага
    progressText.textContent = loadingSteps[0].text;

    // Начинаем прогресс после небольшой задержки
    setTimeout(() => {
        updateProgress();
    }, 200);

    // Fallback для быстрой загрузки
    window.addEventListener('load', function() {
        setTimeout(() => {
            if (!preloader.classList.contains('hidden')) {
                progress = 100;
                progressFill.style.width = '100%';
                progressPercent.textContent = '100%';
                progressText.textContent = 'Готово!';

                setTimeout(() => {
                    preloader.classList.add('hidden');

                    document.querySelectorAll('.animate-on-load').forEach(el => {
                        el.classList.add('animate');
                    });
                }, 300);
            }
        }, 2000);
    });
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

        document.addEventListener('mousemove', mouseMoveHandler);

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
        // Проверяем, открыто ли меню
        if (mobileNav.classList.contains('active')) {
            // Если открыто, закрываем
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
        } else {
            // Если закрыто, открываем
            mobileNav.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });

    // Добавляем обработчик на иконку меню отдельно (на всякий случай)
    if (menuIcon) {
        menuIcon.addEventListener('click', function(e) {
            // Проверяем, открыто ли меню
            if (mobileNav.classList.contains('active')) {
                // Если открыто, закрываем
                mobileNav.classList.remove('active');
                document.body.style.overflow = '';
            } else {
                // Если закрыто, открываем
                mobileNav.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
            e.stopPropagation(); // Предотвращаем всплытие события
        });
    }

    // Закрытие меню
    mobileNavClose.addEventListener('click', function() {
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Закрытие при клике на само меню (фон)
    mobileNav.addEventListener('click', function(e) {
        // Если клик был на само меню, а не на его содержимое
        if (e.target === mobileNav) {
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Закрытие по клику вне меню
    document.addEventListener('click', function(e) {
        if (mobileNav.classList.contains('active') &&
            !mobileNav.contains(e.target) &&
            e.target !== mobileNavToggle) {
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Плавный скролл при клике
    mobileNavLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            // Всегда закрываем меню при клике на любой пункт
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';

            // Если это якорная ссылка, делаем плавный скролл
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
            // Для внешних ссылок просто закрываем меню и позволяем перейти по ссылке
        });
    });
}

// Индикатор прогресса скролла
function initScrollProgress() {
    const scrollProgress = document.getElementById('scrollProgress');

    if (!scrollProgress) return;

    function updateScrollProgress() {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;

        scrollProgress.style.width = scrolled + '%';
    }

    window.addEventListener('scroll', updateScrollProgress);
    updateScrollProgress(); // Инициализация
}

// Счетчик статистики
function initStatsCounter() {
    const stats = document.querySelectorAll('.stat-number');

    if (!stats.length) return;

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const targetValue = parseInt(el.getAttribute('data-count'));
                const duration = 2000; // 2 секунды
                const frameDuration = 1000 / 60; // 60fps
                const totalFrames = Math.round(duration / frameDuration);
                let frame = 0;
                let currentValue = 0;

                const animate = () => {
                    frame++;
                    const progress = frame / totalFrames;
                    const easedProgress = progress < 0.5
                        ? 4 * progress * progress * progress
                        : 1 - Math.pow(-2 * progress + 2, 3) / 2; // Кубическая функция сглаживания

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

    stats.forEach(stat => {
        observer.observe(stat);
    });
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
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if (!animatedElements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '50px'
    });

    animatedElements.forEach(el => observer.observe(el));

    // Очистка при уничтожении
    return function cleanup() {
        animatedElements.forEach(el => observer.unobserve(el));
    };
}

// Регистрация Service Worker
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js').then(function(registration) {
                console.log('ServiceWorker успешно зарегистрирован:', registration.scope);
            }).catch(function(error) {
                console.log('Ошибка при регистрации ServiceWorker:', error);
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

    // Открытие модального окна
    workLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            const projectId = this.getAttribute('data-project');

            // Получение данных проекта
            const projectData = getProjectData(projectId);

            if (projectData) {
                // Заполнение модального окна
                document.getElementById('modalTitle').textContent = projectData.title;
                document.getElementById('modalDescription').textContent = projectData.description;
                document.getElementById('modalAbout').textContent = projectData.about;

                // Очистка тегов
                document.getElementById('modalTags').innerHTML = '';

                // Добавление тегов
                projectData.tags.forEach(function(tag) {
                    const tagElement = document.createElement('span');
                    tagElement.className = 'tag';
                    tagElement.textContent = tag;
                    document.getElementById('modalTags').appendChild(tagElement);
                });

                // Очистка стека технологий
                document.getElementById('modalTechStack').innerHTML = '';

                // Добавление стека технологий
                projectData.techStack.forEach(function(tech) {
                    const techElement = document.createElement('span');
                    techElement.className = 'tag';
                    techElement.textContent = tech;
                    document.getElementById('modalTechStack').appendChild(techElement);
                });

                // Очистка особенностей
                document.getElementById('modalFeatures').innerHTML = '';

                // Добавление особенностей
                projectData.features.forEach(function(feature) {
                    const featureElement = document.createElement('li');
                    featureElement.textContent = feature;
                    document.getElementById('modalFeatures').appendChild(featureElement);
                });

                // Установка изображения
                document.getElementById('modalImage').style.backgroundImage = 'url(' + projectData.image + ')';



                // Открытие модального окна
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });
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
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMzNjQ0ZmYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM4YjVjZjYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNhKSIvPjxjaXJjbGUgY3g9IjQwMCIgY3k9IjMwMCIgcj0iMTAwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48cGF0aCBkPSJNMzAwLDIwMCBDMzUwLDI1MCA0NTAsMjUwIDUwMCwzMDAgQzU1MCwzNTAgNDUwLDQ1MCAzMDAsNDAwIEMyMDAsMzUwIDI1MCwxNTAgMzAwLDIwMCBaIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMikiLz48L3N2Zz4=',
            liveLink: '#',
            githubLink: '#'
        },
        project2: {
            title: 'Интернет-магазин',
            description: 'Полнофункциональный онлайн-магазин с корзиной и оформлением заказов',
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
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmOTczMTYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmNDNmNWUiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNhKSIvPjxyZWN0IHg9IjMwMCIgeT0iMjAwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiByeD0iMjAiLz48cGF0aCBkPSJNMjAwLDQwMCBMMzAwLDMwMCBMNDAwLDQwMCBMNTAwLDMwMCBMNjAwLDQwMCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMikiIHN0cm9rZS13aWR0aD0iMTAiIGZpbGw9Im5vbmUiLz48L3N2Zz4=',
            liveLink: '#',
            githubLink: '#'
        },
        project3: {
            title: 'Система авторизации',
            description: 'Защищенная система входа с JWT токенами и восстановлением пароля',
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
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxMGI5ODEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwODg0OGEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNhKSIvPjxjaXJjbGUgY3g9IjQwMCIgY3k9IjMwMCIgcj0iMTUwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIgc3Ryb2tlLXdpZHRoPSIxMCIvPjxjaXJjbGUgY3g9IjQwMCIgY3k9IjMwMCIgcj0iODAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==',
            liveLink: '#',
            githubLink: '#'
        },
        project4: {
            title: 'Корпоративный блог',
            description: 'Многопользовательский блог с ролями и редактором контента',
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
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM4YjVjZjYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlYzQ4OTkiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNhKSIvPjxyZWN0IHg9IjIwMCIgeT0iMTUwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiByeD0iMTAiLz48cmVjdCB4PSIyMDAiIHk9IjI3NSIgd2lkdGg9IjQwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIgcng9IjEwIi8+PHJlY3QgeD0iMjAwIiB5PSI0NTAiIHdpZHRoPSI0MDAiIGhlaWdodD0iNTAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgcng9IjEwIi8+PC9zdmc+',
            liveLink: '#',
            githubLink: '#'
        },
        project5: {
            title: 'Кастомная WordPress тема',
            description: 'Уникальная тема с нестандартными блоками и интеграциями',
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
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMzYjgyZjYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMxZDRlZDAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNhKSIvPjxwYXRoIGQ9Ik00MDAsNTAwIEw1MDAsNDAwIEw2MDAsNTAwIEw3MDAsNDAwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIgc3Ryb2tlLXdpZHRoPSIyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTEwMCw1MDAgTDIwMCw0MDAgTDMwMCw1MDAgTDQwMCw0MDAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjIpIiBzdHJva2Utd2lkdGg9IjIwIiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=',
            liveLink: '#',
            githubLink: '#'
        },
        project6: {
            title: 'Адаптивная верстка',
            description: 'Точная pixel-perfect верстка с макета Figma с поддержкой всех устройств',
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
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmNTllMGIiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNkOTdmMDYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNhKSIvPjxjaXJjbGUgY3g9IjIwMCIgY3k9IjIwMCIgcj0iNTAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIvPjxjaXJjbGUgY3g9IjYwMCIgY3k9IjIwMCIgcj0iNTAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIvPjxwYXRoIGQ9Ik0yMDAsMzUwIEMyMDAsMzAwIDYwMCwzMDAgNjAwLDM1MCBDNjAwLDQwMCAyMDAsNDAwIDIwMCwzNTAgWiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjIpIi8+PC9zdmc+',
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
