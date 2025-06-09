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
            <span class="toast-message">${message}</span>
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
        z-index: 10000;
        animation: slideInRight 0.3s ease forwards;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    // Добавляем CSS анимации если их нет
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            .toast-content {
                display: flex;
                align-items: center;
                gap: 8px;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    // Автоматическое скрытие через 4 секунды
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 4000);
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
    initModal();
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

// ===== Модули =====

// Прелоадер
function initPreloader() {
    const preloader = document.getElementById('preloader');
    
    if (!preloader) return;
    
    window.addEventListener('load', function() {
        setTimeout(function() {
            preloader.classList.add('hidden');
            
            // Запуск анимаций после загрузки страницы
            document.querySelectorAll('.animate-on-load').forEach(el => {
                el.classList.add('animate');
            });
        }, 500);
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
        
        function updateCursor() {
            cursorX += (mouseX - cursorX) * 0.2;
            cursorY += (mouseY - cursorY) * 0.2;
            followerX += (mouseX - followerX) * 0.1;
            followerY += (mouseY - followerY) * 0.1;
            
            cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
            follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
            
            animationFrameId = requestAnimationFrame(updateCursor);
        }
        
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
                
                function animate() {
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
                }
                
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
                
                // Установка ссылок
                const liveLink = document.getElementById('modalLiveLink');
                const githubLink = document.getElementById('modalGithubLink');
                
                if (projectData.liveLink) {
                    liveLink.style.display = '';
                    liveLink.href = projectData.liveLink;
                } else {
                    liveLink.style.display = 'none';
                }
                
                if (projectData.githubLink) {
                    githubLink.style.display = '';
                    githubLink.href = projectData.githubLink;
                } else {
                    githubLink.style.display = 'none';
                }
                
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
                    name: formData.get('name'),
                    email: formData.get('email'),
                    message: formData.get('message')
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Network response was not ok');
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
            techStack: ['React', 'Node.js', 'MongoDB', 'Redux', 'Draft.js'],
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
            techStack: ['WordPress', 'PHP', 'JavaScript', 'ACF Pro', 'SCSS', 'Gulp'],
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