// ========== PORTFOLIO COMPONENT MODULE ==========
// Модуль портфолио с модальными окнами, фильтрацией и интерактивностью

// Portfolio filter functionality
function filterPortfolio(category) {
    const items = secureQuerySelectorAll('.portfolio-item');
    const buttons = secureQuerySelectorAll('.portfolio-filter-btn');
    
    // Update active button
    buttons.forEach(btn => btn.classList.remove('active'));
    const activeButton = secureQuerySelector(`[data-filter="${category}"]`);
    if (activeButton) activeButton.classList.add('active');
    
    // Filter items
    items.forEach(item => {
        const itemCategory = item.dataset.category;
        
        if (category === 'all' || itemCategory === category) {
            item.style.display = 'block';
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
        } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            setTimeout(() => {
                if (item.style.opacity === '0') {
                    item.style.display = 'none';
                }
            }, 300);
        }
    });
}

// Typing effect for text elements
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Update modal stats (views, likes)
async function updateModalStats(projectId) {
    try {
        const result = await window.ApiModule.secureApiCall(`/api/portfolio/${projectId}/stats`);
        
        if (result.success) {
            const viewsElement = secureQuerySelector('.modal-views');
            const likesElement = secureQuerySelector('.modal-likes');
            
            if (viewsElement) viewsElement.textContent = result.views || 0;
            if (likesElement) likesElement.textContent = result.likes || 0;
        }
    } catch (error) {
        console.warn('Failed to update modal stats:', error.message);
    }
}

// Open project modal with enhanced UI
function openProjectModal(projectId) {
    const modalOverlay = secureGetElementById('project-modal-overlay');
    const modalContent = secureGetElementById('project-modal-content');
    
    if (!modalOverlay || !modalContent) {
        console.error('Modal elements not found');
        return;
    }
    
    // Project data (in production, this would come from API)
    const projects = {
        'project-1': {
            title: 'Интернет-магазин электроники',
            description: 'Современный интернет-магазин с корзиной, фильтрами и админ-панелью',
            technologies: ['Node.js', 'MongoDB', 'Express', 'EJS'],
            features: ['Корзина покупок', 'Система фильтров', 'Админ-панель', 'Интеграция с платежами'],
            images: ['data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkludGVybmV0LW1hZ2F6aW48L3RleHQ+Cjwvc3ZnPg=='],
            liveUrl: '#',
            githubUrl: '#'
        },
        'project-2': {
            title: 'Лендинг с анимациями',
            description: 'Красивый лендинг с плавными анимациями и параллакс эффектами',
            technologies: ['HTML5', 'SCSS', 'JavaScript', 'GSAP'],
            features: ['Параллакс эффекты', 'Плавные анимации', 'Адаптивный дизайн', 'Оптимизация'],
            images: ['data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxlbmRpbmc8L3RleHQ+Cjwvc3ZnPg=='],
            liveUrl: '#',
            githubUrl: '#'
        },
        'project-3': {
            title: 'Система авторизации',
            description: 'Безопасная система регистрации и авторизации с JWT токенами',
            technologies: ['Node.js', 'JWT', 'MongoDB', 'bcrypt'],
            features: ['JWT авторизация', 'Безопасные пароли', 'Восстановление пароля', 'Двухфакторная аутентификация'],
            images: ['data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkF1dGggU3lzdGVtPC90ZXh0Pgo8L3N2Zz4='],
            liveUrl: '#',
            githubUrl: '#'
        }
    };
    
    const project = projects[projectId];
    if (!project) {
        console.error('Project not found:', projectId);
        return;
    }
    
    // Build modal content
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>${project.title}</h2>
            <button class="modal-close" onclick="closeProjectModal()">×</button>
        </div>
        
        <div class="modal-body">
            <div class="modal-gallery">
                <div class="gallery-main">
                    <img src="${project.images[0]}" alt="${project.title}" class="gallery-main-image">
                </div>
                ${project.images.length > 1 ? `
                    <div class="gallery-thumbnails">
                        ${project.images.map((img, index) => `
                            <img src="${img}" alt="Screenshot ${index + 1}" 
                                 class="gallery-thumb ${index === 0 ? 'active' : ''}" 
                                 onclick="switchGalleryImage(${index})">
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            
            <div class="modal-info">
                <p class="project-description">${project.description}</p>
                
                <div class="project-technologies">
                    <h4>Технологии:</h4>
                    <div class="tech-tags">
                        ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    </div>
                </div>
                
                <div class="project-features">
                    <h4>Особенности:</h4>
                    <ul>
                        ${project.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="project-stats">
                    <span class="stat-item">
                        <span class="stat-icon">👁</span>
                        <span class="modal-views">-</span> просмотров
                    </span>
                    <span class="stat-item">
                        <span class="stat-icon">❤</span>
                        <span class="modal-likes">-</span> лайков
                    </span>
                </div>
                
                <div class="project-actions">
                    <a href="${project.liveUrl}" class="btn btn-primary" target="_blank">
                        Посмотреть проект
                    </a>
                    <a href="${project.githubUrl}" class="btn btn-secondary" target="_blank">
                        GitHub
                    </a>
                    <button class="btn btn-accent like-btn" data-project-id="${projectId}" onclick="window.ApiModule.incrementLikes()">
                        ❤ Нравится
                    </button>
                    <button class="btn btn-outline share-btn" onclick="shareProject('${project.title}', '${project.description}')">
                        📤 Поделиться
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Show modal with animation
    modalOverlay.style.display = 'flex';
    modalOverlay.style.opacity = '0';
    
    setTimeout(() => {
        modalOverlay.style.opacity = '1';
        modalContent.style.transform = 'scale(1)';
    }, 10);
    
    // Update stats
    updateModalStats(projectId);
    
    // Setup gallery if multiple images
    if (project.images.length > 1) {
        setupProjectGallery(projectId);
    }
    
    // Setup share functionality
    setupShareButton(project);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

// Close project modal
function closeProjectModal() {
    const modalOverlay = secureGetElementById('project-modal-overlay');
    
    if (modalOverlay) {
        modalOverlay.style.opacity = '0';
        
        setTimeout(() => {
            modalOverlay.style.display = 'none';
            // Restore body scroll
            document.body.style.overflow = '';
        }, 300);
    }
}

// Setup project gallery navigation
function setupProjectGallery(projectId) {
    let currentImageIndex = 0;
    const galleryImages = secureQuerySelectorAll('.gallery-thumb');
    const mainImage = secureQuerySelector('.gallery-main-image');
    
    if (!galleryImages.length || !mainImage) return;
    
    function updateGallery() {
        // Update main image
        const selectedThumb = galleryImages[currentImageIndex];
        if (selectedThumb) {
            mainImage.src = selectedThumb.src;
            
            // Update active thumbnail
            galleryImages.forEach(thumb => thumb.classList.remove('active'));
            selectedThumb.classList.add('active');
        }
    }
    
    // Add click handlers to thumbnails
    galleryImages.forEach((thumb, index) => {
        thumb.addEventListener('click', () => {
            currentImageIndex = index;
            updateGallery();
        });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (secureGetElementById('project-modal-overlay').style.display === 'flex') {
            if (e.key === 'ArrowLeft' && currentImageIndex > 0) {
                currentImageIndex--;
                updateGallery();
            } else if (e.key === 'ArrowRight' && currentImageIndex < galleryImages.length - 1) {
                currentImageIndex++;
                updateGallery();
            }
        }
    });
}

// Setup share button functionality
function setupShareButton(project) {
    const shareButton = secureQuerySelector('.share-btn');
    if (!shareButton) return;
    
    shareButton.addEventListener('click', async () => {
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
            fallbackShare(project);
        }
    });
}

// Fallback share functionality
function fallbackShare(project) {
    const shareText = `${project.title}\n\n${project.description}\n\n${window.location.href}`;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(() => {
            window.FormsModule.showNotification('Ссылка скопирована в буфер обмена!', 'success');
        }).catch(() => {
            fallbackCopy(shareText);
        });
    } else {
        fallbackCopy(shareText);
    }
}

// Manual copy fallback
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
        document.execCommand('copy');
        window.FormsModule.showNotification('Информация скопирована!', 'success');
    } catch (error) {
        showShareModal(text);
    } finally {
        document.body.removeChild(textArea);
    }
}

// Show share modal as last resort
function showShareModal(text) {
    const modal = document.createElement('div');
    modal.className = 'share-modal-overlay';
    modal.innerHTML = `
        <div class="share-modal">
            <h3>Поделиться проектом</h3>
            <textarea readonly>${text}</textarea>
            <div class="share-modal-actions">
                <button class="btn btn-primary" onclick="this.parentElement.parentElement.parentElement.remove()">
                    Закрыть
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Select text
    const textarea = modal.querySelector('textarea');
    textarea.focus();
    textarea.select();
}

// Initialize portfolio interactions
function addHoverAnimations() {
    const portfolioItems = secureQuerySelectorAll('.portfolio-item');
    
    portfolioItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-10px) scale(1.02)';
            item.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateY(0) scale(1)';
            item.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
        });
        
        // Click handler for modal
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const projectId = item.dataset.projectId || 'project-1';
            openProjectModal(projectId);
        });
        
        // Also handle portfolio link clicks
        const portfolioLink = item.querySelector('.portfolio-link');
        if (portfolioLink) {
            portfolioLink.addEventListener('click', (e) => {
                e.preventDefault();
                const projectId = item.dataset.projectId || 'project-1';
                openProjectModal(projectId);
            });
        }
    });
}

// Lazy loading for images
function lazyLoadImages() {
    const images = secureQuerySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize portfolio module
function initializePortfolio() {
    addHoverAnimations();
    lazyLoadImages();
    
    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeProjectModal();
        }
    });
    
    // Close modal on overlay click
    const modalOverlay = secureGetElementById('project-modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeProjectModal();
            }
        });
    }
    
    console.log('🎨 Portfolio module initialized');
}

// Export functions for other modules
window.PortfolioModule = {
    initializePortfolio,
    filterPortfolio,
    openProjectModal,
    closeProjectModal,
    typeWriter,
    addHoverAnimations
}; 