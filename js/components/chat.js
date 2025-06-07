// ========== CHAT COMPONENT MODULE ==========
// Модуль чат-виджета с умными ответами и интерактивностью

// Initialize chat widget
function initializeChatWidget() {
    const chatToggle = secureGetElementById('chatToggle');
    const chatWindow = secureGetElementById('chatWindow');
    const chatClose = secureGetElementById('chatClose');
    const chatInput = secureGetElementById('chatInput');
    const chatSend = secureGetElementById('chatSend');
    
    if (!chatToggle || !chatWindow) {
        console.warn('Chat elements not found');
        return;
    }
    
    // Toggle chat window
    chatToggle.addEventListener('click', () => {
        chatWindow.classList.toggle('active');
        if (chatWindow.classList.contains('active')) {
            chatInput?.focus();
        }
    });
    
    // Close chat
    if (chatClose) {
        chatClose.addEventListener('click', () => {
            chatWindow.classList.remove('active');
        });
    }
    
    // Send message handlers
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
        
        // Auto-resize textarea
        chatInput.addEventListener('input', () => {
            chatInput.style.height = 'auto';
            chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
        });
    }
    
    // Add welcome message (проверяем дублирование)
    const chatMessages = secureGetElementById('chatMessages');
    if (chatMessages && chatMessages.children.length === 0) {
        setTimeout(() => {
            addMessage('Привет! Я помогу с вопросами по веб-разработке. Что вас интересует?', 'bot');
        }, 1000);
    }
}

// Smart response system
function getSmartResponse(message) {
    const msg = message.toLowerCase();
    
    // Услуги и цены
    if (msg.includes('цена') || msg.includes('стоимость') || msg.includes('сколько')) {
        return 'Стоимость проекта зависит от сложности:\n\n' +
               '🔹 Лендинг: от 15,000₽\n' +
               '🔹 Корпоративный сайт: от 30,000₽\n' +
               '🔹 Интернет-магазин: от 50,000₽\n' +
               '🔹 Веб-приложение: от 80,000₽\n\n' +
               'Воспользуйтесь калькулятором для точного расчёта!';
    }
    
    if (msg.includes('сроки') || msg.includes('время') || msg.includes('когда')) {
        return 'Сроки разработки:\n\n' +
               '⏰ Лендинг: 3-7 дней\n' +
               '⏰ Корпоративный сайт: 1-2 недели\n' +
               '⏰ Интернет-магазин: 2-4 недели\n' +
               '⏰ Веб-приложение: 1-3 месяца\n\n' +
               'Точные сроки обсуждаются индивидуально.';
    }
    
    // Технологии
    if (msg.includes('технологи') || msg.includes('node') || msg.includes('react')) {
        return 'Используемые технологии:\n\n' +
               '💻 Frontend: HTML5, CSS3, JavaScript, React\n' +
               '⚙️ Backend: Node.js, Express.js\n' +
               '🗄️ Базы данных: MongoDB, PostgreSQL\n' +
               '🔧 Инструменты: Git, Docker, Railway\n\n' +
               'Выбираю лучшие решения для каждого проекта!';
    }
    
    // SEO и оптимизация
    if (msg.includes('seo') || msg.includes('оптимизация') || msg.includes('google')) {
        return 'SEO оптимизация включает:\n\n' +
               '🎯 Техническое SEO\n' +
               '📱 Мобильная адаптация\n' +
               '⚡ Оптимизация скорости\n' +
               '📊 Аналитика и метрики\n' +
               '🔍 Семантическая разметка\n\n' +
               'Ваш сайт будет найден в поисковиках!';
    }
    
    // Портфолио
    if (msg.includes('работы') || msg.includes('портфолио') || msg.includes('примеры')) {
        return 'В моём портфолио есть:\n\n' +
               '🛒 Интернет-магазины\n' +
               '🏢 Корпоративные сайты\n' +
               '📄 Лендинги\n' +
               '⚙️ Веб-приложения\n' +
               '🔐 Системы авторизации\n\n' +
               'Посмотрите секцию "Работы" выше для деталей!';
    }
    
    // Связь и контакты
    if (msg.includes('связ') || msg.includes('контакт') || msg.includes('телефон') || msg.includes('email')) {
        return 'Связаться со мной можно:\n\n' +
               '📧 Email: contact@techportal.dev\n' +
               '💬 Telegram: @techportal_dev\n' +
               '📞 Телефон: +7 (XXX) XXX-XX-XX\n\n' +
               'Или заполните форму в разделе "Контакты"!';
    }
    
    // Поддержка и обслуживание
    if (msg.includes('поддержка') || msg.includes('обслуживание') || msg.includes('обновление')) {
        return 'Поддержка включает:\n\n' +
               '🔧 Техническая поддержка\n' +
               '🔄 Обновления контента\n' +
               '🛡️ Резервное копирование\n' +
               '📈 Мониторинг производительности\n' +
               '🔒 Обновления безопасности\n\n' +
               'Ваш сайт всегда будет работать стабильно!';
    }
    
    // Приветствие
    if (msg.includes('привет') || msg.includes('здравствуй') || msg.includes('добр')) {
        const greetings = [
            'Привет! 😊 Расскажите о вашем проекте!',
            'Здравствуйте! 👋 Чем могу помочь?',
            'Добро пожаловать! ✨ Какой сайт планируете?'
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    // Благодарность
    if (msg.includes('спасибо') || msg.includes('благодар')) {
        return 'Пожалуйста! 😊 Буду рад помочь с вашим проектом. Есть ещё вопросы?';
    }
    
    // Дефолтный ответ
    const defaultResponses = [
        'Интересный вопрос! 🤔 Напишите мне на email contact@techportal.dev для подробного обсуждения.',
        'Давайте обсудим это подробнее! 💬 Заполните форму в разделе "Контакты".',
        'Хороший вопрос! ✨ Свяжитесь со мной для детального разговора о проекте.',
        'Это требует индивидуального подхода. 🎯 Напишите в Telegram: @techportal_dev'
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Send message function
function sendMessage() {
    const chatInput = secureGetElementById('chatInput');
    const message = chatInput?.value.trim();
    
    if (!message || !chatInput) return;
    
    // Add user message
    addMessage(message, 'user');
    
    // Clear input
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Generate response with delay
    setTimeout(() => {
        hideTypingIndicator();
        const response = getSmartResponse(message);
        addMessage(response, 'bot');
    }, 1000 + Math.random() * 1000); // 1-2 seconds delay
}

// Add message to chat
function addMessage(text, sender) {
    const chatMessages = secureGetElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = sender === 'bot' ? '💬' : '👤';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    // Format message text (support for line breaks)
    const formattedText = text.replace(/\n/g, '<br>');
    content.innerHTML = window.SecurityModule.sanitizeHTML(formattedText);
    
    const timestamp = document.createElement('div');
    timestamp.className = 'message-timestamp';
    timestamp.textContent = new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    messageDiv.appendChild(timestamp);
    
    // Add with animation
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(20px)';
    chatMessages.appendChild(messageDiv);
    
    // Animate in
    setTimeout(() => {
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    }, 10);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Bounce effect for chat toggle if window is closed
    const chatWindow = secureGetElementById('chatWindow');
    const chatToggle = secureGetElementById('chatToggle');
    
    if (sender === 'bot' && !chatWindow?.classList.contains('active') && chatToggle) {
        chatToggle.classList.add('bounce');
        setTimeout(() => {
            chatToggle.classList.remove('bounce');
        }, 1000);
    }
}

// Show typing indicator
function showTypingIndicator() {
    const chatMessages = secureGetElementById('chatMessages');
    if (!chatMessages) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot typing-indicator';
    typingDiv.id = 'typing-indicator';
    
    typingDiv.innerHTML = `
        <div class="message-avatar">💬</div>
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    const typingIndicator = secureGetElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Initialize chat animations
function initializeChatAnimations() {
    const chatToggle = secureGetElementById('chatToggle');
    
    if (chatToggle) {
        // Pulse animation every 30 seconds
        setInterval(() => {
            const chatWindow = secureGetElementById('chatWindow');
            if (!chatWindow?.classList.contains('active')) {
                chatToggle.classList.add('pulse');
                setTimeout(() => {
                    chatToggle.classList.remove('pulse');
                }, 2000);
            }
        }, 30000);
    }
}

// Initialize chat module
function initializeChat() {
    // Проверяем не инициализирован ли уже чат
    if (window.ChatModule?.initialized) {
        console.log('💬 Chat already initialized, skipping');
        return;
    }
    
    initializeChatWidget();
    initializeChatAnimations();
    
    // Помечаем как инициализированный
    if (window.ChatModule) {
        window.ChatModule.initialized = true;
    }
    
    console.log('💬 Chat module initialized');
}

// Export functions for other modules
window.ChatModule = {
    initializeChat,
    sendMessage,
    addMessage,
    getSmartResponse
}; 