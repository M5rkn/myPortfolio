// ========== SCROLL MODULE ==========
// Скролл эффекты, progress bar, параллакс

// Update scroll progress bar
function updateScrollProgress() {
    const progressBar = secureGetElementById('scroll-progress');
    if (!progressBar) return;
    
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    progressBar.style.width = `${scrollPercent}%`;
}

// Auto-hide scroll elements
function initAutoHideScroll() {
    const autoHideElements = secureQuerySelectorAll('.chat-messages, .calculator-content, .modal-content');
    
    autoHideElements.forEach(element => {
        element.classList.add('auto-hide-scroll');
    });
}

// Calculator scroll enhancement
function enhanceCalculatorScroll() {
    const calculatorWindow = secureGetElementById('calculator-window');
    const calculatorContent = secureGetElementById('calculator-content');
    
    if (calculatorWindow) {
        calculatorWindow.classList.add('scrollable-card');
    }
    
    if (calculatorContent) {
        calculatorContent.classList.add('scrollable-card');
        
        // Добавляем обработчик для динамического изменения цвета скролла
        calculatorContent.addEventListener('scroll', () => {
            const scrollPercentage = calculatorContent.scrollTop / 
                (calculatorContent.scrollHeight - calculatorContent.clientHeight);
            
            // Меняем оттенок скролла в зависимости от позиции
            const hue = 200 + (scrollPercentage * 60); // От голубого к фиолетовому
            calculatorContent.style.setProperty('--scroll-color', `hsl(${hue}, 70%, 60%)`);
        });
    }
    
    // Добавляем rainbow эффект при активном использовании
    const calcSections = secureQuerySelectorAll('.calc-section');
    calcSections.forEach(section => {
        section.addEventListener('mouseenter', () => {
            section.classList.add('rainbow-scroll');
        });
        
        section.addEventListener('mouseleave', () => {
            setTimeout(() => {
                section.classList.remove('rainbow-scroll');
            }, 1000);
        });
    });
}

// Portfolio scroll enhancement
function enhancePortfolioScroll() {
    const portfolioGrid = secureQuerySelector('.portfolio-grid');
    
    if (portfolioGrid) {
        // Добавляем scrollable-card класс
        portfolioGrid.classList.add('scrollable-card');
        
        // Динамический скролл индикатор
        portfolioGrid.addEventListener('scroll', () => {
            const scrollPercentage = portfolioGrid.scrollTop / 
                (portfolioGrid.scrollHeight - portfolioGrid.clientHeight);
            
            // Подсвечиваем карточки при прокрутке
            const portfolioItems = secureQuerySelectorAll('.portfolio-item');
            portfolioItems.forEach((item, index) => {
                const itemTop = item.offsetTop - portfolioGrid.scrollTop;
                const itemHeight = item.offsetHeight;
                const containerHeight = portfolioGrid.clientHeight;
                
                if (itemTop >= 0 && itemTop <= containerHeight - itemHeight) {
                    item.style.transform = 'scale(1.02)';
                    item.style.filter = 'brightness(1.1)';
                } else {
                    item.style.transform = 'scale(1)';
                    item.style.filter = 'brightness(1)';
                }
            });
        });
    }
}

// Infinite scroll for portfolio (if needed)
function initInfiniteScroll() {
    const portfolioGrid = secureQuerySelector('.portfolio-grid');
    if (!portfolioGrid) return;
    
    let loading = false;
    
    portfolioGrid.addEventListener('scroll', () => {
        if (loading) return;
        
        const { scrollTop, scrollHeight, clientHeight } = portfolioGrid;
        
        if (scrollTop + clientHeight >= scrollHeight - 5) {
            loading = true;
            // Load more portfolio items (if applicable)
            // This would connect to an API endpoint
            setTimeout(() => {
                loading = false;
            }, 1000);
        }
    });
}

// Scroll-based reveal animations
function initScrollReveal() {
    const revealElements = secureQuerySelectorAll('.reveal-on-scroll');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(element => {
        revealObserver.observe(element);
    });
}

// Smooth scroll to section with offset
function scrollToSection(sectionId, offset = 80) {
    const section = secureGetElementById(sectionId);
    if (!section) return;
    
    const offsetTop = section.offsetTop - offset;
    
    window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
    });
}

// Scroll-based navbar styling
function updateNavbarOnScroll() {
    const navbar = secureQuerySelector('.navbar');
    if (!navbar) return;
    
    const scrolled = window.pageYOffset > 50;
    
    if (scrolled) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// Reading progress for long content
function initReadingProgress() {
    const readingProgressBar = secureGetElementById('reading-progress');
    if (!readingProgressBar) return;
    
    const content = secureQuerySelector('main') || document.body;
    
    function updateReadingProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = content.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        readingProgressBar.style.width = `${Math.min(scrollPercent, 100)}%`;
    }
    
    window.addEventListener('scroll', updateReadingProgress, { passive: true });
    updateReadingProgress(); // Initial call
}

// Scroll momentum for mobile
function initScrollMomentum() {
    if (!('ontouchstart' in window)) return;
    
    const scrollableElements = secureQuerySelectorAll('.scrollable-content, .modal-content, .chat-messages');
    
    scrollableElements.forEach(element => {
        element.style.webkitOverflowScrolling = 'touch';
        element.style.overflowScrolling = 'touch';
    });
}

// Scroll snap for sections
function initScrollSnap() {
    const sections = secureQuerySelectorAll('section');
    if (sections.length === 0) return;
    
    // Add scroll snap to body
    document.body.style.scrollSnapType = 'y proximity';
    
    sections.forEach(section => {
        section.style.scrollSnapAlign = 'start';
        section.style.scrollSnapStop = 'normal';
    });
}

// Performance optimization for scroll events
function optimizeScrollPerformance() {
    let scrollTimeout;
    let ticking = false;
    
    function debounceScroll(func, delay) {
        return function(...args) {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => func.apply(this, args), delay);
        };
    }
    
    function throttleScroll(func) {
        return function(...args) {
            if (!ticking) {
                requestAnimationFrame(() => {
                    func.apply(this, args);
                    ticking = false;
                });
                ticking = true;
            }
        };
    }
    
    // Optimized scroll handlers
    const optimizedScrollHandler = throttleScroll(() => {
        updateScrollProgress();
        updateNavbarOnScroll();
    });
    
    const debouncedScrollHandler = debounceScroll(() => {
        // Less frequent updates
        if (typeof handleScrollAnimations === 'function') {
            handleScrollAnimations();
        }
        if (typeof handleParallax === 'function') {
            handleParallax();
        }
    }, 10);
    
    window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
    window.addEventListener('scroll', debouncedScrollHandler, { passive: true });
}

// Scroll to top button
function initScrollToTop() {
    const scrollToTopBtn = secureGetElementById('scroll-to-top');
    if (!scrollToTopBtn) return;
    
    function toggleScrollToTopBtn() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    }
    
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    window.addEventListener('scroll', toggleScrollToTopBtn, { passive: true });
    toggleScrollToTopBtn(); // Initial call
}

// Intersection Observer for lazy content loading
function initLazyContentLoading() {
    const lazyElements = secureQuerySelectorAll('.lazy-content');
    
    const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                // Load content
                if (element.dataset.src) {
                    element.src = element.dataset.src;
                    element.removeAttribute('data-src');
                }
                
                element.classList.add('loaded');
                lazyObserver.unobserve(element);
            }
        });
    }, {
        rootMargin: '50px'
    });
    
    lazyElements.forEach(element => {
        lazyObserver.observe(element);
    });
}

// Initialize all scroll functionality
function initScroll() {
    updateScrollProgress();
    initAutoHideScroll();
    enhanceCalculatorScroll();
    enhancePortfolioScroll();
    initScrollReveal();
    initReadingProgress();
    initScrollMomentum();
    initScrollToTop();
    initLazyContentLoading();
    optimizeScrollPerformance();
    
    // Optional features
    // initScrollSnap(); // Uncomment if scroll snap is desired
    // initInfiniteScroll(); // Uncomment if infinite scroll is needed
}

// Export scroll module
window.ScrollModule = {
    updateScrollProgress,
    initAutoHideScroll,
    enhanceCalculatorScroll,
    enhancePortfolioScroll,
    initInfiniteScroll,
    initScrollReveal,
    scrollToSection,
    updateNavbarOnScroll,
    initReadingProgress,
    initScrollMomentum,
    initScrollSnap,
    optimizeScrollPerformance,
    initScrollToTop,
    initLazyContentLoading,
    initScroll
}; 