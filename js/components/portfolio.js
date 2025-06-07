// ========== PORTFOLIO MODULE ==========
// Простая и надежная система модальных окон

// Данные проектов
const PROJECTS = {
    'project-1': {
        title: 'Интернет-магазин электроники',
        description: 'Современный интернет-магазин с корзиной, фильтрами и админ-панелью',
        technologies: ['Node.js', 'MongoDB', 'Express', 'EJS'],
        features: ['Корзина покупок', 'Система фильтров', 'Админ-панель', 'Интеграция с платежами'],
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNjY3ZWVhIiBvcGFjaXR5PSIwLjEiLz4KICA8Y2lyY2xlIGN4PSIyNTAiIGN5PSIxNTAiIHI9IjUwIiBmaWxsPSIjNjY3ZWVhIi8+CiAgPHRleHQgeD0iMjUwIiB5PSIyMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW50ZXJuZXQtbWFnYXppbjwvdGV4dD4KPC9zdmc+'
    },
    'project-2': {
        title: 'Лендинг с анимациями',
        description: 'Красивый лендинг с плавными анимациями и параллакс эффектами',
        technologies: ['HTML5', 'SCSS', 'JavaScript', 'GSAP'],
        features: ['Параллакс эффекты', 'Плавные анимации', 'Адаптивный дизайн', 'Оптимизация'],
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNDNlOTdiIiBvcGFjaXR5PSIwLjEiLz4KICA8cG9seWdvbiBwb2ludHM9IjIwMCwxMDAsMzAwLDEwMCwyNTAsMjAwIiBmaWxsPSIjNDNlOTdiIi8+CiAgPHRleHQgeD0iMjUwIiB5PSIyNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TGVuZGluZzwvdGV4dD4KPC9zdmc+'
    },
    'project-3': {
        title: 'Система авторизации',
        description: 'Безопасная система авторизации с JWT токенами и защитой от атак',
        technologies: ['Node.js', 'JWT', 'MongoDB', 'bcrypt'],
        features: ['JWT авторизация', 'Хеширование паролей', 'Защита от CSRF', 'Валидация данных'],
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjU2NTY1IiBvcGFjaXR5PSIwLjEiLz4KICA8cmVjdCB4PSIyMDAiIHk9IjEyMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSI2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZjU2NTY1IiBzdHJva2Utd2lkdGg9IjMiLz4KICA8Y2lyY2xlIGN4PSIyNTAiIGN5PSIxMDAiIHI9IjE1IiBmaWxsPSJub25lIiBzdHJva2U9IiNmNTY1NjUiIHN0cm9rZS13aWR0aD0iMyIvPgogIDx0ZXh0IHg9IjI1MCIgeT0iMjIwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkF1dGggU3lzdGVtPC90ZXh0Pgo8L3N2Zz4='
    },
    'project-4': {
        title: 'Корпоративный блог',
        description: 'Современный блог с админ-панелью для управления контентом',
        technologies: ['React', 'Node.js', 'Express', 'MongoDB'],
        features: ['Админ-панель', 'WYSIWYG редактор', 'SEO оптимизация', 'Комментарии'],
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjOGI1Y2Y2IiBvcGFjaXR5PSIwLjEiLz4KICA8cmVjdCB4PSIxNTAiIHk9IjEwMCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSI4MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOGI1Y2Y2IiBzdHJva2Utd2lkdGg9IjIiLz4KICA8bGluZSB4MT0iMTcwIiB5MT0iMTIwIiB4Mj0iMzMwIiB5Mj0iMTIwIiBzdHJva2U9IiM4YjVjZjYiIHN0cm9rZS13aWR0aD0iMiIvPgogIDxsaW5lIHgxPSIxNzAiIHkxPSIxNDAiIHgyPSIzMDAiIHkyPSIxNDAiIHN0cm9rZT0iIzhiNWNmNiIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPGxpbmUgeDE9IjE3MCIgeTE9IjE2MCIgeDI9IjI4MCIgeTI9IjE2MCIgc3Ryb2tlPSIjOGI1Y2Y2IiBzdHJva2Utd2lkdGg9IjIiLz4KICA8dGV4dCB4PSIyNTAiIHk9IjIyMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjIwIiBmaWxsPSIjMzMzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CbG9nPC90ZXh0Pgo8L3N2Zz4='
    },
    'project-5': {
        title: 'WordPress + Custom',
        description: 'Кастомная тема WordPress с функциональностью на заказ',
        technologies: ['WordPress', 'PHP', 'MySQL', 'ACF'],
        features: ['Кастомная тема', 'Плагины', 'ACF поля', 'SEO оптимизация'],
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjE3NTlhIiBvcGFjaXR5PSIwLjEiLz4KICA8Y2lyY2xlIGN4PSIyNTAiIGN5PSIxNTAiIHI9IjQwIiBmaWxsPSJub25lIiBzdHJva2U9IiMyMTc1OWEiIHN0cm9rZS13aWR0aD0iNCIvPgogIDx0ZXh0IHg9IjI1MCIgeT0iMTU1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiMyMTc1OWEiIHRleHQtYW5jaG9yPSJtaWRkbGUiPldQPC90ZXh0PgogIDx0ZXh0IHg9IjI1MCIgeT0iMjIwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPldvcmRQcmVzczwvdGV4dD4KPC9zdmc+'
    },
    'project-6': {
        title: 'PSD → верстка',
        description: 'Качественная верстка из дизайн-макетов Figma, PSD, Adobe XD',
        technologies: ['HTML5', 'CSS3', 'SCSS', 'JavaScript'],
        features: ['Пиксель в пиксель', 'Адаптивность', 'Кроссбраузерность', 'Валидная верстка'],
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmY2YjM1IiBvcGFjaXR5PSIwLjEiLz4KICA8cmVjdCB4PSIxODAiIHk9IjEwMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjgwIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjZiMzUiIHN0cm9rZS13aWR0aD0iMyIvPgogIDxyZWN0IHg9IjI2MCIgeT0iMTEwIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmNmIzNSIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgPHRleHQgeD0iMjUwIiB5PSIyMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UEVEK0hUTUw8L3RleHQ+Cjwvc3ZnPg=='
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
                <h2>${project.title}</h2>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            
            <div class="modal-body">
                <div class="modal-gallery">
                    <div class="gallery-main">
                        <img src="${project.image}" alt="${project.title}" class="gallery-main-image">
                    </div>
                </div>
                
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

// Экспорт функций
window.openModal = openModal;
window.closeModal = closeModal;
window.initPortfolio = initPortfolio;

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
    initializePortfolio: initPortfolio
}; 