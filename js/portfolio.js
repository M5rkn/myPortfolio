// ========== PORTFOLIO MODULE ==========
// Модальные окна проектов, галерея, лайки и просмотры

// Project data
const projectData = {
    1: {
        title: "Интернет-магазин",
        description: "Современный интернет-магазин с системой авторизации, корзиной и административной панелью.",
        technologies: ["Node.js", "MongoDB", "Express", "Bootstrap"],
        features: [
            "Система авторизации и регистрации",
            "Корзина покупок с сохранением",
            "Административная панель",
            "Система заказов и оплаты",
            "Адаптивный дизайн"
        ],
        images: [
            "/api/placeholder/600/400",
            "/api/placeholder/600/400",
            "/api/placeholder/600/400"
        ],
        liveUrl: "#",
        githubUrl: "#",
        views: 245,
        likes: 18
    },
    2: {
        title: "Лендинг с анимациями",
        description: "Креативный лендинг с parallax эффектами и плавными анимациями для повышения конверсии.",
        technologies: ["HTML", "SCSS", "JavaScript", "Parallax.js"],
        features: [
            "Parallax эффекты",
            "Плавные анимации",
            "Оптимизированная производительность",
            "Кроссбраузерная совместимость",
            "SEO оптимизация"
        ],
        images: [
            "/api/placeholder/600/400",
            "/api/placeholder/600/400"
        ],
        liveUrl: "#",
        githubUrl: "#",
        views: 189,
        likes: 24
    },
    3: {
        title: "Система авторизации",
        description: "Безопасная система авторизации с JWT токенами и двухфакторной аутентификацией.",
        technologies: ["Node.js", "JWT", "MongoDB", "bcrypt"],
        features: [
            "JWT аутентификация",
            "Двухфакторная аутентификация",
            "Восстановление пароля",
            "Ограничение попыток входа",
            "Логирование безопасности"
        ],
        images: [
            "/api/placeholder/600/400"
        ],
        liveUrl: "#",
        githubUrl: "#",
        views: 312,
        likes: 31
    },
    4: {
        title: "Корпоративный блог",
        description: "Многофункциональная блог-платформа с административной панелью и системой комментариев.",
        technologies: ["React", "Node.js", "PostgreSQL", "Redux"],
        features: [
            "Административная панель",
            "Система комментариев",
            "Категории и теги",
            "SEO оптимизация",
            "Система подписок"
        ],
        images: [
            "/api/placeholder/600/400",
            "/api/placeholder/600/400"
        ],
        liveUrl: "#",
        githubUrl: "#",
        views: 167,
        likes: 15
    },
    5: {
        title: "WordPress + Custom",
        description: "Кастомная тема WordPress с уникальным дизайном и расширенным функционалом.",
        technologies: ["WordPress", "PHP", "MySQL", "SCSS"],
        features: [
            "Кастомная тема",
            "Административные настройки",
            "Оптимизация скорости",
            "SEO плагины",
            "Безопасность"
        ],
        images: [
            "/api/placeholder/600/400"
        ],
        liveUrl: "#",
        githubUrl: "#",
        views: 134,
        likes: 9
    },
    6: {
        title: "Мобильное приложение",
        description: "Гибридное мобильное приложение с нативным функционалом и современным UI.",
        technologies: ["React Native", "Firebase", "Redux", "Expo"],
        features: [
            "Кроссплатформенность",
            "Push уведомления",
            "Offline режим",
            "Интеграция с API",
            "Нативная производительность"
        ],
        images: [
            "/api/placeholder/600/400",
            "/api/placeholder/600/400"
        ],
        liveUrl: "#",
        githubUrl: "#",
        views: 98,
        likes: 12
    }
};

// Current project ID for likes
let currentProjectId = null;

// Gallery functionality
let currentImageIndex = 0;
let galleryImages = [];

// Update modal stats
async function updateModalStats(projectId) {
    const project = projectData[projectId];
    if (!project) return;
    
    const viewsElement = secureQuerySelector('.modal-views');
    const likesElement = secureQuerySelector('.modal-likes');
    
    if (viewsElement) {
        viewsElement.textContent = project.views;
    }
    
    if (likesElement) {
        likesElement.textContent = project.likes;
    }
}

// Open modal
function openProjectModal(projectId) {
    const project = projectData[projectId];
    if (!project) return;
    
    // Store current project ID
    currentProjectId = projectId;
    
    // Update modal content
    const modal = secureGetElementById('project-modal');
    const modalTitle = secureQuerySelector('.modal-title');
    const modalDescription = secureQuerySelector('.modal-description');
    const modalTechnologies = secureQuerySelector('.modal-technologies');
    const modalFeatures = secureQuerySelector('.modal-features');
    const modalGallery = secureQuerySelector('.modal-gallery');
    const modalLiveBtn = secureQuerySelector('.modal-live-btn');
    const modalGithubBtn = secureQuerySelector('.modal-github-btn');
    
    if (modalTitle) modalTitle.textContent = project.title;
    if (modalDescription) modalDescription.textContent = project.description;
    
    // Update technologies
    if (modalTechnologies) {
        modalTechnologies.innerHTML = project.technologies
            .map(tech => `<span class="tech-tag">${tech}</span>`)
            .join('');
    }
    
    // Update features
    if (modalFeatures) {
        modalFeatures.innerHTML = project.features
            .map(feature => `<li>${feature}</li>`)
            .join('');
    }
    
    // Update gallery
    if (modalGallery && project.images.length > 0) {
        galleryImages = project.images;
        currentImageIndex = 0;
        setupProjectGallery(projectId);
    }
    
    // Update buttons
    if (modalLiveBtn) modalLiveBtn.href = project.liveUrl;
    if (modalGithubBtn) modalGithubBtn.href = project.githubUrl;
    
    // Update stats
    updateModalStats(projectId);
    
    // Setup share button
    setupShareButton(project);
    
    // Show modal
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close modal
function closeProjectModal() {
    const modal = secureGetElementById('project-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }
}

// Increment likes
async function incrementLikes() {
    if (!currentProjectId) return;
    
    try {
        const response = await secureApiCall(`/api/projects/${currentProjectId}/like`, {
            method: 'POST'
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Update local data
            if (projectData[currentProjectId]) {
                projectData[currentProjectId].likes = data.likes;
            }
            
            // Update modal display
            updateModalStats(currentProjectId);
            
            // Show feedback
            const likeBtn = secureQuerySelector('.like-btn');
            if (likeBtn) {
                likeBtn.style.transform = 'scale(1.2)';
                likeBtn.style.color = '#ff6b6b';
                setTimeout(() => {
                    likeBtn.style.transform = 'scale(1)';
                    likeBtn.style.color = '';
                }, 200);
            }
            
            showModalNotification('Спасибо за лайк! ❤️', 'success');
        }
    } catch (error) {
        console.error('Error liking project:', error);
        showModalNotification('Ошибка при добавлении лайка', 'error');
    }
}

// Setup project gallery
function setupProjectGallery(projectId) {
    const project = projectData[projectId];
    if (!project || !project.images.length) return;
    
    const galleryContainer = secureQuerySelector('.modal-gallery');
    if (!galleryContainer) return;
    
    galleryImages = project.images;
    currentImageIndex = 0;
    
    function updateGallery() {
        const currentImage = galleryImages[currentImageIndex];
        
        galleryContainer.innerHTML = `
            <div class="gallery-main">
                <img src="${currentImage}" alt="${project.title} - изображение ${currentImageIndex + 1}" loading="lazy">
                ${galleryImages.length > 1 ? `
                    <button class="gallery-prev" aria-label="Предыдущее изображение">&lt;</button>
                    <button class="gallery-next" aria-label="Следующее изображение">&gt;</button>
                ` : ''}
            </div>
            ${galleryImages.length > 1 ? `
                <div class="gallery-thumbnails">
                    ${galleryImages.map((img, index) => `
                        <img src="${img}" 
                             alt="${project.title} - миниатюра ${index + 1}" 
                             class="gallery-thumb ${index === currentImageIndex ? 'active' : ''}"
                             data-index="${index}"
                             loading="lazy">
                    `).join('')}
                </div>
            ` : ''}
        `;
        
        // Add navigation event listeners
        const prevBtn = galleryContainer.querySelector('.gallery-prev');
        const nextBtn = galleryContainer.querySelector('.gallery-next');
        const thumbnails = galleryContainer.querySelectorAll('.gallery-thumb');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
                updateGallery();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
                updateGallery();
            });
        }
        
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                currentImageIndex = parseInt(thumb.dataset.index);
                updateGallery();
            });
        });
    }
    
    updateGallery();
}

// Setup share button
function setupShareButton(project) {
    const shareBtn = secureQuerySelector('.share-btn');
    if (!shareBtn) return;
    
    shareBtn.addEventListener('click', async () => {
        const shareData = {
            title: project.title,
            text: project.description,
            url: window.location.href
        };
        
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                fallbackShare(project);
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                fallbackShare(project);
            }
        }
    });
}

// Fallback share
function fallbackShare(project) {
    const shareText = `${project.title}\n${project.description}\n${window.location.href}`;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(() => {
            showModalNotification('Ссылка скопирована в буфер обмена!', 'success');
        }).catch(() => {
            fallbackCopy(shareText);
        });
    } else {
        fallbackCopy(shareText);
    }
}

// Fallback copy
function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showModalNotification('Ссылка скопирована!', 'success');
        } else {
            showShareModal(text);
        }
    } catch (err) {
        showShareModal(text);
    } finally {
        document.body.removeChild(textArea);
    }
}

// Show share modal
function showShareModal(text) {
    const shareModal = document.createElement('div');
    shareModal.className = 'share-modal';
    shareModal.innerHTML = `
        <div class="share-modal-content">
            <h3>Поделиться проектом</h3>
            <textarea readonly>${text}</textarea>
            <div class="share-modal-buttons">
                <button class="btn btn-primary copy-text-btn">Копировать</button>
                <button class="btn btn-secondary close-share-modal">Закрыть</button>
            </div>
        </div>
    `;
    
    shareModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10002;
    `;
    
    document.body.appendChild(shareModal);
    
    const copyBtn = shareModal.querySelector('.copy-text-btn');
    const closeBtn = shareModal.querySelector('.close-share-modal');
    const textarea = shareModal.querySelector('textarea');
    
    copyBtn.addEventListener('click', () => {
        textarea.select();
        try {
            document.execCommand('copy');
            showModalNotification('Текст скопирован!', 'success');
        } catch (err) {
            console.error('Copy failed:', err);
        }
    });
    
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(shareModal);
    });
    
    shareModal.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            document.body.removeChild(shareModal);
        }
    });
}

// Project views functionality
async function updateProjectViews() {
    try {
        // Get current views
        const response = await secureApiCall('/api/projects/views', {
            method: 'GET'
        });
        
        // Add views counter to project
        const portfolioItems = secureQuerySelectorAll('.portfolio-item');
        portfolioItems.forEach((item, index) => {
            const projectId = index + 1;
            
            // Add click handler to increment views and open modal
            const existingHandler = item.getAttribute('data-click-handler');
            if (!existingHandler) {
                item.addEventListener('click', async (e) => {
                    e.preventDefault();
                    
                    try {
                        // Increment views
                        const viewResponse = await secureApiCall(`/api/projects/${projectId}/view`, {
                            method: 'POST'
                        });
                        
                        if (viewResponse.ok) {
                            const viewData = await viewResponse.json();
                            
                            // Update local data
                            if (projectData[projectId]) {
                                projectData[projectId].views = viewData.views;
                            }
                        }
                    } catch (error) {
                        console.error('Error incrementing views:', error);
                    }
                    
                    // Open modal
                    openProjectModal(projectId);
                });
                
                item.setAttribute('data-click-handler', 'true');
            }
        });
        
    } catch (error) {
        console.error('Error updating project views:', error);
    }
}

// Initialize portfolio functionality
function initPortfolio() {
    // Setup modal close handlers
    const modal = secureGetElementById('project-modal');
    const closeBtn = secureQuerySelector('.modal-close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProjectModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeProjectModal();
            }
        });
    }
    
    // Setup like button
    const likeBtn = secureQuerySelector('.like-btn');
    if (likeBtn) {
        likeBtn.addEventListener('click', incrementLikes);
    }
    
    // Setup keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (modal && modal.classList.contains('active')) {
            if (e.key === 'Escape') {
                closeProjectModal();
            } else if (e.key === 'ArrowLeft' && galleryImages.length > 1) {
                currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
                if (currentProjectId) setupProjectGallery(currentProjectId);
            } else if (e.key === 'ArrowRight' && galleryImages.length > 1) {
                currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
                if (currentProjectId) setupProjectGallery(currentProjectId);
            }
        }
    });
    
    // Initialize project views
    updateProjectViews();
}

// Export portfolio module
window.PortfolioModule = {
    projectData,
    updateModalStats,
    openProjectModal,
    closeProjectModal,
    incrementLikes,
    setupProjectGallery,
    setupShareButton,
    updateProjectViews,
    initPortfolio
};