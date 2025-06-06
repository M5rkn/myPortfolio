// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background change on scroll with smooth transition
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(10, 10, 10, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.background = 'rgba(10, 10, 10, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Contact form handling
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');
        
        // Simple validation
        if (!name || !email || !message) {
            showNotification('Пожалуйста, заполните все поля', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Пожалуйста, введите корректный email', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Отправляем...';
        submitBtn.disabled = true;
        
        try {
            // Send to backend
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, message })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification(data.message, 'success');
                this.reset();
            } else {
                showNotification(data.message || 'Ошибка при отправке', 'error');
            }
        } catch (error) {
            console.error('Ошибка отправки:', error);
            showNotification('Ошибка подключения. Попробуйте позже.', 'error');
        } finally {
            // Restore button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' : 
                     type === 'error' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 
                     'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 20000;
        max-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .notification-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
        }
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .notification-close:hover {
            opacity: 0.7;
        }
    `;
    document.head.appendChild(style);
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Modal notification system
function showModalNotification(message, type = 'success') {
    // Remove existing modal notification
    const existingNotification = document.querySelector('.modal-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Get modal content container
    const modalContent = document.querySelector('.modal-content');
    if (!modalContent) return;
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `modal-notification ${type}`;
    notification.innerHTML = `
        <div class="modal-notification-content">
            <span class="modal-notification-message">${message}</span>
            <button class="modal-notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' : 
                     type === 'error' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 
                     'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
        color: white;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        z-index: 25000;
        max-width: 250px;
        font-size: 0.9rem;
        animation: modalSlideIn 0.3s ease;
    `;
    
    // Add modal notification styles
    if (!document.querySelector('#modal-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'modal-notification-styles';
        style.textContent = `
            @keyframes modalSlideIn {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes modalSlideOut {
                from { transform: translateY(0); opacity: 1; }
                to { transform: translateY(-20px); opacity: 0; }
            }
            .modal-notification-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 0.75rem;
            }
            .modal-notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0;
                width: 16px;
                height: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0.8;
            }
            .modal-notification-close:hover {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to modal
    modalContent.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.modal-notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'modalSlideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'modalSlideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animations
document.addEventListener('DOMContentLoaded', () => {
    // Add initial styles for animation
    const animatedElements = document.querySelectorAll('.portfolio-item, .skill-item, .contact-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Portfolio filter functionality (if needed in the future)
function filterPortfolio(category) {
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    portfolioItems.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
            }, 10);
        } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            setTimeout(() => {
                item.style.display = 'none';
            }, 300);
        }
    });
}

// Typed text effect for hero section
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typed effect when page loads
document.addEventListener('DOMContentLoaded', () => {
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        const originalText = heroSubtitle.textContent;
        setTimeout(() => {
            typeWriter(heroSubtitle, originalText, 80);
        }, 1000);
    }
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.floating-cards .card');
    
    parallaxElements.forEach((element, index) => {
        const speed = 0.5 + (index * 0.1);
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px) rotate(${scrolled * 0.01}deg)`;
    });
});

// Project views functionality
async function updateProjectViews() {
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    portfolioItems.forEach(async (item, index) => {
        const projectId = `project-${index + 1}`;
        
        try {
            // Get current views
            const response = await fetch(`/api/projects/${projectId}/views`);
            const data = await response.json();
            
            if (data.success) {
                // Add views counter to project
                let viewsElement = item.querySelector('.project-views');
                if (!viewsElement) {
                    viewsElement = document.createElement('div');
                    viewsElement.className = 'project-views';
                    viewsElement.style.cssText = `
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        background: rgba(0, 0, 0, 0.7);
                        color: white;
                        padding: 0.25rem 0.5rem;
                        border-radius: 15px;
                        font-size: 0.75rem;
                        z-index: 10;
                    `;
                    item.querySelector('.portfolio-image').style.position = 'relative';
                    item.querySelector('.portfolio-image').appendChild(viewsElement);
                }
                
                viewsElement.innerHTML = `👁 ${data.views}`;
            }
        } catch (error) {
            console.error('Ошибка загрузки просмотров:', error);
        }
        
        // Add click handler to increment views
        item.addEventListener('click', async () => {
            try {
                const response = await fetch(`/api/projects/${projectId}/view`, {
                    method: 'POST'
                });
                const data = await response.json();
                
                if (data.success) {
                    const viewsElement = item.querySelector('.project-views');
                    if (viewsElement) {
                        viewsElement.innerHTML = `👁 ${data.views}`;
                    }
                }
            } catch (error) {
                console.error('Ошибка обновления просмотров:', error);
            }
        });
    });
}

// Removed theme toggle functionality - keeping only dark theme

// Preloader functionality
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.classList.add('fade-out');
        setTimeout(() => {
            preloader.style.display = 'none';
            // Start entrance animations
            initEntranceAnimations();
        }, 500);
    }, 1000);
});

// Enhanced entrance animations
function initEntranceAnimations() {
    // Animate hero content
    const heroContent = document.querySelector('.hero-content');
    const heroVisual = document.querySelector('.hero-visual');
    
    if (heroContent) {
        heroContent.style.animation = 'slideInLeft 0.8s ease forwards';
    }
    if (heroVisual) {
        heroVisual.style.animation = 'slideInRight 0.8s ease 0.2s forwards';
        heroVisual.style.opacity = '0';
        setTimeout(() => {
            heroVisual.style.opacity = '1';
        }, 200);
    }
    
    // Animate sections on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideInUp 0.6s ease forwards';
            }
        });
    }, observerOptions);
    
    // Observe all major sections
    document.querySelectorAll('.portfolio, .services, .about, .contact').forEach(section => {
        section.style.opacity = '0';
        observer.observe(section);
    });
}

// Project modal functionality
const projectModal = document.getElementById('projectModal');
const modalClose = document.querySelector('.modal-close');

// Project data
const projectData = {
    'project-1': {
        title: 'Интернет-магазин',
        tech: 'Node.js, MongoDB, Express',
        description: 'Полнофункциональный интернет-магазин с корзиной, авторизацией, админ-панелью и интеграцией платежей. Адаптивный дизайн и оптимизация для мобильных устройств.',
        features: [
            'Система авторизации и регистрации',
            'Корзина и оформление заказов',
            'Админ-панель для управления',
            'Интеграция платежных систем',
            'Поиск и фильтрация товаров'
        ],
        demo: '#',
        github: '#',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    'project-2': {
        title: 'Лендинг с анимациями',
        tech: 'HTML, SCSS, JS, Parallax',
        description: 'Современный лендинг с параллакс эффектами, плавными анимациями и адаптивным дизайном. Оптимизирован для высокой скорости загрузки.',
        features: [
            'Параллакс эффекты',
            'Анимации при скролле',
            'Адаптивная верстка',
            'SEO оптимизация',
            'Высокая скорость загрузки'
        ],
        demo: '#',
        github: '#',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    'project-3': {
        title: 'Система авторизации',
        tech: 'Node.js, JWT, MongoDB',
        description: 'Безопасная система авторизации с JWT токенами, восстановлением пароля и ролевой моделью доступа.',
        features: [
            'JWT авторизация',
            'Восстановление пароля',
            'Ролевая модель',
            'Защита от брутфорса',
            'Email уведомления'
        ],
        demo: '#',
        github: '#',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    'project-4': {
        title: 'Корпоративный блог',
        tech: 'React, Node.js, админка',
        description: 'Блог с возможностью создания статей, комментариев и админ-панелью для управления контентом.',
        features: [
            'Редактор статей',
            'Система комментариев',
            'Админ-панель',
            'SEO оптимизация',
            'Поиск по статьям'
        ],
        demo: '#',
        github: '#',
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
    'project-5': {
        title: 'WordPress + Custom',
        tech: 'WordPress, PHP, ACF',
        description: 'Кастомная WordPress тема с дополнительной функциональностью и интеграцией ACF полей.',
        features: [
            'Кастомная тема',
            'ACF интеграция',
            'Плагины на заказ',
            'SEO оптимизация',
            'Админ-панель'
        ],
        demo: '#',
        github: '#',
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    'project-6': {
        title: 'PSD → верстка',
        tech: 'Figma/PSD → HTML, CSS',
        description: 'Превращение дизайн-макетов в адаптивные веб-страницы с идеальным соответствием оригиналу.',
        features: [
            'Pixel Perfect верстка',
            'Адаптивный дизайн',
            'Кроссбраузерность',
            'Оптимизация кода',
            'Быстрая загрузка'
        ],
        demo: '#',
        github: '#',
        gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    }
};

// Update modal stats
async function updateModalStats(projectId) {
    try {
        const [viewsResponse, likesResponse] = await Promise.all([
            fetch(`/api/projects/${projectId}/views`),
            fetch(`/api/projects/${projectId}/likes`)
        ]);
        
        const viewsData = await viewsResponse.json();
        const likesData = await likesResponse.json();
        
        if (viewsData.success) {
            document.getElementById('modalViews').textContent = viewsData.views;
        }
        
        if (likesData.success) {
            document.getElementById('modalLikes').textContent = likesData.likes;
        }
    } catch (error) {
        console.error('Error loading project stats:', error);
    }
}

// Current project ID for likes
let currentProjectId = null;

// Gallery functionality
let currentSlide = 0;
let projectGalleries = {
    'project-1': [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
        'linear-gradient(135deg, #667eea 30%, #764ba2 70%)'
    ],
    'project-2': [
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
        'linear-gradient(135deg, #f093fb 30%, #f5576c 70%)'
    ],
    'project-3': [
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
        'linear-gradient(135deg, #4facfe 30%, #00f2fe 70%)'
    ],
    'project-4': [
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #38f9d7 0%, #43e97b 100%)',
        'linear-gradient(135deg, #43e97b 30%, #38f9d7 70%)'
    ],
    'project-5': [
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #fee140 0%, #fa709a 100%)',
        'linear-gradient(135deg, #fa709a 30%, #fee140 70%)'
    ],
    'project-6': [
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #fed6e3 0%, #a8edea 100%)',
        'linear-gradient(135deg, #a8edea 30%, #fed6e3 70%)'
    ]
};

// Open modal
function openProjectModal(projectId) {
    const project = projectData[projectId];
    if (!project) return;
    
    // Store current project ID
    currentProjectId = projectId;
    
    // Update modal content
    document.getElementById('modalTitle').textContent = project.title;
    document.getElementById('modalTech').textContent = project.tech;
    document.getElementById('modalDescription').textContent = project.description;
    document.getElementById('modalDemo').href = project.demo;
    document.getElementById('modalGithub').href = project.github;
    
    // Update features
    const featuresContainer = document.getElementById('modalFeatures');
    featuresContainer.innerHTML = '<h4>Возможности:</h4><ul>' + 
        project.features.map(feature => `<li>${feature}</li>`).join('') + 
        '</ul>';
    
    // Initialize gallery
    setupProjectGallery(projectId);
    
    // Reset like button state
    const likeBtn = document.getElementById('modalLikeBtn');
    likeBtn.classList.remove('liked');
    likeBtn.innerHTML = '<span class="like-icon">❤️</span> <span class="like-text">Нравится</span>';
    
    // Setup share button
    setupShareButton(project);
    
    // Get stats
    updateModalStats(projectId);
    
    // Show modal
    projectModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeProjectModal() {
    projectModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Increment likes function
async function incrementLikes() {
    if (!currentProjectId) return;
    
    const likeBtn = document.getElementById('modalLikeBtn');
    
    try {
        const response = await fetch(`/api/projects/${currentProjectId}/like`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update like button
            likeBtn.classList.add('liked');
            likeBtn.innerHTML = '<span class="like-icon">❤️</span> <span class="like-text">Нравится!</span>';
            
            // Update likes counter
            document.getElementById('modalLikes').textContent = data.likes;
            
            // Show modal notification
            showModalNotification('Спасибо за лайк! ❤️', 'success');
        }
    } catch (error) {
        console.error('Ошибка при добавлении лайка:', error);
        showModalNotification('Ошибка при добавлении лайка', 'error');
    }
}

// Setup project gallery
function setupProjectGallery(projectId) {
    const modalImage = document.getElementById('modalImage');
    const galleryNav = document.getElementById('modalGalleryNav');
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');
    const currentSlideSpan = document.getElementById('currentSlide');
    const totalSlidesSpan = document.getElementById('totalSlides');
    
    const gallery = projectGalleries[projectId] || [projectData[projectId]?.gradient];
    currentSlide = 0;
    
    if (gallery.length > 1) {
        galleryNav.style.display = 'flex';
        totalSlidesSpan.textContent = gallery.length;
        
        function updateGallery() {
            modalImage.style.background = gallery[currentSlide];
            currentSlideSpan.textContent = currentSlide + 1;
            prevBtn.disabled = currentSlide === 0;
            nextBtn.disabled = currentSlide === gallery.length - 1;
        }
        
        prevBtn.onclick = () => {
            if (currentSlide > 0) {
                currentSlide--;
                updateGallery();
            }
        };
        
        nextBtn.onclick = () => {
            if (currentSlide < gallery.length - 1) {
                currentSlide++;
                updateGallery();
            }
        };
        
        updateGallery();
    } else {
        galleryNav.style.display = 'none';
        modalImage.style.background = gallery[0];
    }
}

// Setup share button
function setupShareButton(project) {
    const shareBtn = document.getElementById('modalShareBtn');
    
    shareBtn.onclick = () => {
        if (navigator.share) {
            navigator.share({
                title: project.title,
                text: project.description,
                url: window.location.href
            }).then(() => {
                showModalNotification('Проект успешно поделен!', 'success');
            }).catch(() => {
                fallbackShare(project);
            });
        } else {
            fallbackShare(project);
        }
    };
}

// Fallback share functionality
function fallbackShare(project) {
    const shareData = {
        title: project.title,
        text: project.description,
        url: window.location.href
    };
    
    const shareText = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(() => {
            showModalNotification('Ссылка скопирована в буфер обмена!', 'success');
        });
    } else {
        // Create temporary textarea for copying
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showModalNotification('Ссылка скопирована в буфер обмена!', 'success');
    }
}

// Add click handlers to portfolio items
document.addEventListener('DOMContentLoaded', () => {
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    portfolioItems.forEach((item, index) => {
        const projectId = `project-${index + 1}`;
        item.addEventListener('click', (e) => {
            e.preventDefault();
            openProjectModal(projectId);
        });
    });
});

// Modal close handlers
modalClose?.addEventListener('click', closeProjectModal);
projectModal?.addEventListener('click', (e) => {
    if (e.target === projectModal) {
        closeProjectModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && projectModal.style.display === 'block') {
        closeProjectModal();
    }
});

// Enhanced animations for skills and services
function addHoverAnimations() {
    // Service items animation - более плавные эффекты
    document.querySelectorAll('.service-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-3px) scale(1.01)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Skill items animation - убираем движение по X
    document.querySelectorAll('.skill-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'scale(1.02)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'scale(1)';
        });
    });
}

// Service Worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW зарегистрирован: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW регистрация не удалась: ', registrationError);
            });
    });
}

// Lazy loading for images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Dynamic copyright year
document.addEventListener('DOMContentLoaded', () => {
    const footerText = document.querySelector('.footer p');
    if (footerText) {
        const currentYear = new Date().getFullYear();
        footerText.innerHTML = footerText.innerHTML.replace('2024', currentYear);
    }
    
    // Initialize project views
    updateProjectViews();
    
    // Add hover animations
    addHoverAnimations();
    
    // Initialize lazy loading
    lazyLoadImages();
    
    // Initialize chat and calculator
    initializeChatWidget();
    initializeCostCalculator();
});

// Chat Widget functionality
function initializeChatWidget() {
    const chatToggle = document.getElementById('chatToggle');
    const chatWindow = document.getElementById('chatWindow');
    const chatClose = document.getElementById('chatClose');
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');
    const chatMessages = document.getElementById('chatMessages');
    const chatNotification = document.getElementById('chatNotification');
    
    let chatOpen = false;
    let botResponses = [
        "Отличный вопрос! Расскажите подробнее о вашем проекте",
        "Да, такое возможно реализовать. Нужно обсудить детали",
        "🔥 Сейчас действуют стартовые цены! Воспользуйтесь калькулятором слева",
        "Обычно на такой проект уходит 2-4 недели",
        "Конечно! Все мои проекты адаптированы под мобильные устройства",
        "Да, предоставляю техподдержку после сдачи проекта",
        "Можете посмотреть примеры работ в разделе 'Работы'",
        "Свяжитесь со мной через форму обратной связи для детального обсуждения",
        "Я использую современные технологии: React, Node.js, MongoDB",
        "Все проекты включают SEO оптимизацию и быструю загрузку",
        "Предоставляю исходный код и документацию к проекту",
        "💥 Специальные цены для первых клиентов: лендинг от 50€!",
        "Качественная работа по доступным ценам для набора отзывов",
        "Возможна интеграция с любыми внешними API и сервисами"
    ];
    
    // Show notification after 5 seconds
    setTimeout(() => {
        chatNotification.style.display = 'block';
    }, 5000);
    
    chatToggle.addEventListener('click', () => {
        chatOpen = !chatOpen;
        chatWindow.classList.toggle('active', chatOpen);
        if (chatOpen) {
            chatNotification.style.display = 'none';
            chatInput.focus();
        }
    });
    
    chatClose.addEventListener('click', () => {
        chatOpen = false;
        chatWindow.classList.remove('active');
    });
    
    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Add user message
        addMessage(message, 'user');
        chatInput.value = '';
        
        // Simulate bot response
        setTimeout(() => {
            const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
            addMessage(randomResponse, 'bot');
        }, 1000 + Math.random() * 2000);
    }
    
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageDiv.innerHTML = `
            <div class="message-content">${text}</div>
            <div class="message-time">${timeStr}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// Cost Calculator functionality
function initializeCostCalculator() {
    const calculatorToggle = document.getElementById('calculatorToggle');
    const calculatorWindow = document.getElementById('calculatorWindow');
    const calculatorClose = document.getElementById('calculatorClose');
    const totalCostElement = document.getElementById('totalCost');
    const requestQuoteBtn = document.getElementById('requestQuote');
    
    let calculatorOpen = false;
    
    calculatorToggle.addEventListener('click', () => {
        calculatorOpen = !calculatorOpen;
        calculatorWindow.classList.toggle('active', calculatorOpen);
    });
    
    calculatorClose.addEventListener('click', () => {
        calculatorOpen = false;
        calculatorWindow.classList.remove('active');
    });
    
    // Calculate cost
    function calculateCost() {
        let total = 0;
        
        // Get base project cost
        const projectType = document.querySelector('input[name="projectType"]:checked');
        if (projectType) {
            total += parseInt(projectType.dataset.cost);
        }
        
        // Add feature costs
        const features = document.querySelectorAll('input[name="features"]:checked');
        features.forEach(feature => {
            total += parseInt(feature.dataset.cost);
        });
        
        totalCostElement.textContent = total.toLocaleString('de-DE') + '€';
    }
    
    // Add event listeners to all inputs
    document.querySelectorAll('.calc-option input').forEach(input => {
        input.addEventListener('change', calculateCost);
    });
    
    requestQuoteBtn.addEventListener('click', () => {
        const projectType = document.querySelector('input[name="projectType"]:checked');
        const features = Array.from(document.querySelectorAll('input[name="features"]:checked'))
            .map(f => f.value);
        
        if (!projectType) {
            showModalNotification('Выберите тип проекта', 'error');
            return;
        }
        
        const cost = totalCostElement.textContent;
        showModalNotification(`Заявка на ${cost} отправлена! Свяжемся в течение часа`, 'success');
        
        // Close calculator
        calculatorOpen = false;
        calculatorWindow.classList.remove('active');
        
        // Scroll to contact form
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    });
} 