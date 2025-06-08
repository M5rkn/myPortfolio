// ========== PORTFOLIO MODULE ==========
// Простая и надежная система модальных окон

// Данные проектов
const PROJECTS = {
    'project-1': {
        title: 'Интернет-магазин электроники',
        description: 'Современный интернет-магазин с корзиной, фильтрами и админ-панелью',
        technologies: ['Node.js', 'MongoDB', 'Express', 'EJS'],
        features: ['Корзина покупок', 'Система фильтров', 'Админ-панель', 'Интеграция с платежами'],
        icon: '🛒',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    'project-2': {
        title: 'Лендинг с анимациями',
        description: 'Красивый лендинг с плавными анимациями и параллакс эффектами',
        technologies: ['HTML5', 'SCSS', 'JavaScript', 'GSAP'],
        features: ['Параллакс эффекты', 'Плавные анимации', 'Адаптивный дизайн', 'Оптимизация'],
        icon: '🎨',
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
    'project-3': {
        title: 'Система авторизации',
        description: 'Безопасная система авторизации с JWT токенами и защитой от атак',
        technologies: ['Node.js', 'JWT', 'MongoDB', 'bcrypt'],
        features: ['JWT авторизация', 'Хеширование паролей', 'Защита от CSRF', 'Валидация данных'],
        icon: '🔐',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    'project-4': {
        title: 'Корпоративный блог',
        description: 'Современный блог с админ-панелью для управления контентом',
        technologies: ['React', 'Node.js', 'Express', 'MongoDB'],
        features: ['Админ-панель', 'WYSIWYG редактор', 'SEO оптимизация', 'Комментарии'],
        icon: '📝',
        gradient: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)'
    },
    'project-5': {
        title: 'WordPress + Custom',
        description: 'Кастомная тема WordPress с функциональностью на заказ',
        technologies: ['WordPress', 'PHP', 'MySQL', 'ACF'],
        features: ['Кастомная тема', 'Плагины', 'ACF поля', 'SEO оптимизация'],
        icon: '📱',
        gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)'
    },
    'project-6': {
        title: 'PSD → верстка',
        description: 'Качественная верстка из дизайн-макетов Figma, PSD, Adobe XD',
        technologies: ['HTML5', 'CSS3', 'SCSS', 'JavaScript'],
        features: ['Пиксель в пиксель', 'Адаптивность', 'Кроссбраузерность', 'Валидная верстка'],
        icon: '💻',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'
    }
};

// Главная функция открытия модального окна
function openModal(projectId) {
    console.log('Opening modal for:', projectId);
    
    const project = PROJECTS[projectId];
    if (!project) {
        console.error('Project not found:', projectId);
        return;
    }

    // Получаем или создаем модальное окно
    let modal = document.getElementById('project-modal-overlay');
    
    if (!modal) {
        // Создаем модальное окно если его нет
        modal = document.createElement('div');
        modal.id = 'project-modal-overlay';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }

    // Заполняем содержимое
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <div class="project-icon" style="background: ${project.gradient};">
                    ${project.icon}
                </div>
                <h2>${project.title}</h2>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            
            <div class="modal-body">
                <div class="modal-info">
                    <p class="project-description">${project.description}</p>
                    
                    <div class="project-technologies">
                        <h4>Технологии</h4>
                        <div class="tech-tags">
                            ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                        </div>
                    </div>
                    
                    <div class="project-features">
                        <h4>Особенности</h4>
                        <ul>
                            ${project.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="project-actions">
                        <button class="btn btn-primary" onclick="alert('Демо скоро будет доступно!')">
                            Посмотреть проект
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Показываем модальное окно
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Обработчик клика по overlay
    modal.onclick = function(e) {
        if (e.target === modal) {
            closeModal();
        }
    };
    
    console.log('Modal opened successfully');
}

// Функция закрытия модального окна
function closeModal() {
    console.log('Closing modal');
    
    const modal = document.getElementById('project-modal-overlay');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Удаляем модальное окно через 300ms
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
}

// Инициализация обработчиков событий
function initPortfolio() {
    console.log('Initializing portfolio...');
    
    // Обработчик для клавиши Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    // Добавляем обработчики клика на элементы портфолио
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    console.log('Found portfolio items:', portfolioItems.length);
    
    portfolioItems.forEach((item, index) => {
        const projectId = item.getAttribute('data-project-id');
        console.log(`Setting up item ${index + 1}:`, projectId);
        
        // Убираем предыдущие обработчики
        item.removeEventListener('click', handlePortfolioClick);
        
        // Добавляем новый обработчик
        item.addEventListener('click', handlePortfolioClick);
        
        // Также обработчики для ссылок "Подробнее"
        const link = item.querySelector('.portfolio-link');
        if (link) {
            link.removeEventListener('click', handlePortfolioClick);
            link.addEventListener('click', handlePortfolioClick);
        }
    });
    
    console.log('Portfolio initialized successfully!');
}

// Обработчик клика по элементу портфолио
function handlePortfolioClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const item = e.target.closest('.portfolio-item');
    if (!item) return;
    
    const projectId = item.getAttribute('data-project-id');
    console.log('Portfolio item clicked:', projectId);
    
    if (projectId) {
        openModal(projectId);
    }
}

// Функция typewriter эффекта
function typeWriter(element, text, speed = 80) {
    if (!element) return;
    
    element.textContent = '';
    let i = 0;
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Экспорт функций
window.openModal = openModal;
window.closeModal = closeModal;
window.initPortfolio = initPortfolio;
window.typeWriter = typeWriter;

// Инициализация при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
    initPortfolio();
}

// Экспорт модуля для совместимости
window.PortfolioModule = {
    openProjectModal: openModal,
    closeProjectModal: closeModal,
    initializePortfolio: initPortfolio,
    typeWriter: typeWriter
}; 