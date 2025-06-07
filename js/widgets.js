// ========== WIDGETS MODULE ==========
// Чат виджет и калькулятор стоимости

// Initialize chat widget
function initializeChatWidget() {
    const chatWidget = secureGetElementById('chat-widget');
    const chatToggle = secureGetElementById('chat-toggle');
    const chatMessages = secureGetElementById('chat-messages');
    const chatInput = secureGetElementById('chat-input');
    const chatSend = secureGetElementById('chat-send');
    const chatClose = secureGetElementById('chat-close');
    
    if (!chatWidget || !chatToggle) return;
    
    let isOpen = false;
    let messageCount = 0;
    
    // Smart response system
    function getSmartResponse(message) {
        const lowerMessage = message.toLowerCase().trim();
        
        // Приветствие
        if (lowerMessage.includes('привет') || lowerMessage.includes('здрав') || lowerMessage.includes('добрый')) {
            return {
                text: 'Привет! 👋 Меня зовут Алекс, я веб-разработчик. Чем могу помочь?',
                suggestions: ['Стоимость проекта', 'Сроки разработки', 'Портфолио', 'Контакты']
            };
        }
        
        // Стоимость
        if (lowerMessage.includes('сколько') || lowerMessage.includes('стоимость') || lowerMessage.includes('цена') || lowerMessage.includes('стоит')) {
            return {
                text: 'Стоимость зависит от сложности проекта:\n\n💡 Лендинг: от 15 000₽\n🛒 Интернет-магазин: от 50 000₽\n⚙️ Веб-приложение: от 80 000₽\n\nМожете воспользоваться калькулятором для точной оценки!',
                suggestions: ['Открыть калькулятор', 'Примеры работ', 'Связаться']
            };
        }
        
        // Сроки
        if (lowerMessage.includes('срок') || lowerMessage.includes('время') || lowerMessage.includes('быстро') || lowerMessage.includes('когда')) {
            return {
                text: 'Сроки разработки:\n\n⚡ Лендинг: 3-7 дней\n🛒 Интернет-магазин: 2-4 недели\n⚙️ Сложное приложение: 1-3 месяца\n\nТочные сроки зависят от требований к проекту.',
                suggestions: ['Техническое задание', 'Стоимость', 'Начать проект']
            };
        }
        
        // Технологии
        if (lowerMessage.includes('технологи') || lowerMessage.includes('стек') || lowerMessage.includes('язык') || lowerMessage.includes('фреймворк')) {
            return {
                text: 'Мой технологический стек:\n\n🎨 Frontend: HTML, CSS, JavaScript, React\n⚙️ Backend: Node.js, Express, Python\n🗄️ Базы данных: MongoDB, PostgreSQL\n☁️ Деплой: Railway, Vercel, AWS',
                suggestions: ['Портфолио', 'Начать проект', 'Стоимость']
            };
        }
        
        // Портфолио
        if (lowerMessage.includes('работ') || lowerMessage.includes('портфолио') || lowerMessage.includes('пример') || lowerMessage.includes('проект')) {
            return {
                text: 'В моем портфолио есть различные проекты:\n\n🛒 Интернет-магазины\n📄 Лендинги\n⚙️ Веб-приложения\n📱 Мобильные приложения\n\nПосмотрите раздел "Мои работы" выше!',
                suggestions: ['Посмотреть работы', 'Стоимость', 'Связаться']
            };
        }
        
        // Контакты
        if (lowerMessage.includes('контакт') || lowerMessage.includes('связ') || lowerMessage.includes('телефон') || lowerMessage.includes('email')) {
            return {
                text: 'Свяжитесь со мной любым удобным способом:\n\n📧 Email: contact@techportal.com\n📱 Telegram: @techportal\n📞 WhatsApp: +7 (999) 123-45-67\n\nИли заполните форму обратной связи!',
                suggestions: ['Написать email', 'Заполнить форму', 'Telegram']
            };
        }
        
        // Услуги
        if (lowerMessage.includes('услуг') || lowerMessage.includes('делаю') || lowerMessage.includes('создаю') || lowerMessage.includes('разрабатываю')) {
            return {
                text: 'Предоставляю следующие услуги:\n\n🎨 Создание сайтов с нуля\n🛒 Интернет-магазины\n⚙️ Веб-приложения\n📱 Мобильные приложения\n🔧 Доработка существующих проектов',
                suggestions: ['Стоимость', 'Портфолио', 'Начать проект']
            };
        }
        
        // Начать проект
        if (lowerMessage.includes('начать') || lowerMessage.includes('заказать') || lowerMessage.includes('хочу')) {
            return {
                text: 'Отлично! Чтобы начать проект:\n\n1️⃣ Расскажите о ваших целях\n2️⃣ Опишите функционал\n3️⃣ Укажите бюджет и сроки\n4️⃣ Получите коммерческое предложение\n\nМожем обсудить детали в Telegram или по email!',
                suggestions: ['Написать в Telegram', 'Заполнить бриф', 'Email']
            };
        }
        
        // Калькулятор
        if (lowerMessage.includes('калькулятор') || lowerMessage.includes('рассчитать') || lowerMessage.includes('посчитать')) {
            return {
                text: 'Калькулятор стоимости поможет получить предварительную оценку проекта. Выберите тип проекта, функции и получите расчет!',
                suggestions: ['Открыть калькулятор', 'Связаться', 'Портфолио']
            };
        }
        
        // Общий ответ
        return {
            text: 'Спасибо за сообщение! 😊\n\nЯ специализируюсь на создании современных веб-сайтов и приложений. Могу помочь с:\n\n• Разработкой сайтов\n• Интернет-магазинами\n• Веб-приложениями\n• Мобильными приложениями\n\nО чем хотели бы узнать подробнее?',
            suggestions: ['Стоимость', 'Портфолио', 'Связаться', 'Сроки разработки']
        };
    }
    
    // Send message function
    function sendMessage() {
        if (!chatInput || !chatMessages) return;
        
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Add user message
        addMessage(message, 'user');
        
        // Clear input
        chatInput.value = '';
        
        // Show typing indicator
        addMessage('Печатаю...', 'bot', true);
        
        // Get smart response
        setTimeout(() => {
            // Remove typing indicator
            const typingIndicator = chatMessages.querySelector('.typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
            
            const response = getSmartResponse(message);
            addMessage(response.text, 'bot');
            
            // Add suggestions
            if (response.suggestions && response.suggestions.length > 0) {
                addSuggestions(response.suggestions);
            }
        }, 1000 + Math.random() * 1000);
    }
    
    // Add message to chat
    function addMessage(text, sender, isTyping = false) {
        if (!chatMessages) return;
        
        messageCount++;
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message${isTyping ? ' typing-indicator' : ''}`;
        
        if (isTyping) {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            `;
        } else {
            const time = new Date().toLocaleTimeString('ru', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-text">${text.replace(/\n/g, '<br>')}</div>
                    <div class="message-time">${time}</div>
                </div>
            `;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Add entrance animation
        requestAnimationFrame(() => {
            messageDiv.classList.add('message-animate');
        });
    }
    
    // Add suggestions
    function addSuggestions(suggestions) {
        if (!chatMessages) return;
        
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'chat-suggestions';
        
        suggestions.forEach(suggestion => {
            const button = document.createElement('button');
            button.className = 'suggestion-btn';
            button.textContent = suggestion;
            button.addEventListener('click', () => {
                if (chatInput) {
                    chatInput.value = suggestion;
                    sendMessage();
                }
                suggestionsDiv.remove();
            });
            suggestionsDiv.appendChild(button);
        });
        
        chatMessages.appendChild(suggestionsDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Toggle chat
    function toggleChat() {
        if (!chatWidget) return;
        
        isOpen = !isOpen;
        
        if (isOpen) {
            chatWidget.classList.add('chat-open');
            if (chatInput) chatInput.focus();
            
            // Welcome message on first open
            if (messageCount === 0) {
                setTimeout(() => {
                    addMessage('Привет! 👋 Я Алекс, ваш персональный помощник.\n\nГотов ответить на вопросы о веб-разработке и помочь с оценкой проекта!', 'bot');
                    addSuggestions(['Стоимость проекта', 'Портфолио', 'Контакты', 'Сроки разработки']);
                }, 500);
            }
        } else {
            chatWidget.classList.remove('chat-open');
        }
    }
    
    // Event listeners
    if (chatToggle) {
        chatToggle.addEventListener('click', toggleChat);
    }
    
    if (chatSend) {
        chatSend.addEventListener('click', sendMessage);
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    if (chatClose) {
        chatClose.addEventListener('click', toggleChat);
    }
    
    // Click outside to close
    document.addEventListener('click', (e) => {
        if (isOpen && !chatWidget.contains(e.target) && e.target !== chatToggle) {
            toggleChat();
        }
    });
}

// Initialize cost calculator
function initializeCostCalculator() {
    const calculator = secureGetElementById('cost-calculator');
    const calculatorToggle = secureGetElementById('calculator-toggle');
    const calculatorClose = secureGetElementById('calculator-close');
    const calculateBtn = secureGetElementById('calculate-btn');
    
    if (!calculator || !calculatorToggle) return;
    
    let isCalculatorOpen = false;
    
    // Calculate cost function
    function calculateCost() {
        const projectType = secureQuerySelector('input[name="project-type"]:checked')?.value;
        const design = secureQuerySelector('input[name="design"]:checked')?.value;
        const features = Array.from(secureQuerySelectorAll('input[name="features"]:checked')).map(cb => cb.value);
        const pages = parseInt(secureGetElementById('pages')?.value) || 1;
        const deadline = secureQuerySelector('input[name="deadline"]:checked')?.value;
        
        if (!projectType) {
            showNotification('Выберите тип проекта', 'error');
            return;
        }
        
        // Base prices
        const basePrices = {
            landing: 15000,
            corporate: 35000,
            ecommerce: 50000,
            webapp: 80000,
            mobile: 100000
        };
        
        let totalCost = basePrices[projectType] || 0;
        
        // Design complexity
        const designMultipliers = {
            template: 1,
            custom: 1.5,
            premium: 2.2
        };
        
        if (design && designMultipliers[design]) {
            totalCost *= designMultipliers[design];
        }
        
        // Additional pages (for multi-page projects)
        if (projectType !== 'landing' && pages > 1) {
            const additionalPages = pages - 1;
            const pagePrice = projectType === 'corporate' ? 3000 : 
                            projectType === 'ecommerce' ? 5000 : 4000;
            totalCost += additionalPages * pagePrice;
        }
        
        // Features
        const featurePrices = {
            auth: 15000,
            payment: 20000,
            admin: 25000,
            api: 18000,
            search: 12000,
            chat: 10000,
            notifications: 8000,
            analytics: 7000,
            seo: 5000,
            responsive: 0 // включено в базовую стоимость
        };
        
        features.forEach(feature => {
            if (featurePrices[feature]) {
                totalCost += featurePrices[feature];
            }
        });
        
        // Deadline urgency
        const deadlineMultipliers = {
            week: 1.8,
            month: 1.3,
            months: 1,
            discuss: 1
        };
        
        if (deadline && deadlineMultipliers[deadline]) {
            totalCost *= deadlineMultipliers[deadline];
        }
        
        // Format and display result
        const formattedCost = totalCost.toLocaleString('ru-RU');
        const resultDiv = secureGetElementById('calculator-result');
        
        if (resultDiv) {
            resultDiv.innerHTML = `
                <div class="result-content">
                    <h3>Предварительная стоимость</h3>
                    <div class="cost-amount">${formattedCost} ₽</div>
                    <div class="cost-note">
                        * Точная стоимость определяется после обсуждения всех деталей проекта
                    </div>
                    <div class="result-actions">
                        <button class="btn btn-primary" onclick="openContactForm()">
                            Обсудить проект
                        </button>
                        <button class="btn btn-secondary" onclick="shareCalculation('${formattedCost}')">
                            Поделиться расчетом
                        </button>
                    </div>
                </div>
            `;
            
            // Animate result
            resultDiv.style.opacity = '0';
            resultDiv.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                resultDiv.style.transition = 'all 0.3s ease';
                resultDiv.style.opacity = '1';
                resultDiv.style.transform = 'translateY(0)';
            }, 100);
        }
        
        // Show success notification
        showNotification(`Стоимость рассчитана: ${formattedCost} ₽`, 'success');
        
        // Scroll to result
        if (resultDiv) {
            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    
    // Toggle calculator
    function toggleCalculator() {
        if (!calculator) return;
        
        isCalculatorOpen = !isCalculatorOpen;
        
        if (isCalculatorOpen) {
            calculator.classList.add('calculator-open');
            calculator.style.display = 'flex';
            
            // Focus first input
            const firstInput = calculator.querySelector('input');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 300);
            }
        } else {
            calculator.classList.remove('calculator-open');
            setTimeout(() => {
                calculator.style.display = 'none';
            }, 300);
        }
    }
    
    // Event listeners
    if (calculatorToggle) {
        calculatorToggle.addEventListener('click', toggleCalculator);
    }
    
    if (calculatorClose) {
        calculatorClose.addEventListener('click', toggleCalculator);
    }
    
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateCost);
    }
    
    // Auto-calculate on form changes
    const formInputs = calculator.querySelectorAll('input, select');
    formInputs.forEach(input => {
        input.addEventListener('change', () => {
            // Clear previous result
            const resultDiv = secureGetElementById('calculator-result');
            if (resultDiv) {
                resultDiv.innerHTML = '';
            }
        });
    });
    
    // Click outside to close
    document.addEventListener('click', (e) => {
        if (isCalculatorOpen && !calculator.contains(e.target) && e.target !== calculatorToggle) {
            toggleCalculator();
        }
    });
    
    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isCalculatorOpen) {
            toggleCalculator();
        }
    });
}

// Helper functions for calculator
function openContactForm() {
    const contactSection = secureGetElementById('contact');
    if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
        
        // Focus contact form
        setTimeout(() => {
            const nameField = secureGetElementById('name');
            if (nameField) nameField.focus();
        }, 500);
    }
}

function shareCalculation(cost) {
    const text = `Расчет стоимости веб-проекта: ${cost} ₽\n\nПолучите точную оценку на сайте TechPortal!`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Расчет стоимости проекта',
            text: text,
            url: window.location.href
        }).catch(console.error);
    } else {
        // Fallback - copy to clipboard
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                showNotification('Расчет скопирован в буфер обмена!', 'success');
            }).catch(() => {
                showNotification('Не удалось скопировать расчет', 'error');
            });
        }
    }
}

// Initialize widgets
function initWidgets() {
    initializeChatWidget();
    initializeCostCalculator();
}

// Export widgets module
window.WidgetsModule = {
    initializeChatWidget,
    initializeCostCalculator,
    openContactForm,
    shareCalculation,
    initWidgets
};