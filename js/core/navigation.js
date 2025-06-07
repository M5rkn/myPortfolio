// ========== NAVIGATION CORE MODULE ==========
// Модуль навигации, скролла и мобильного меню

// Mobile Navigation Toggle
function initMobileNavigation() {
    const hamburger = secureQuerySelector('.hamburger');
    const navMenu = secureQuerySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        secureQuerySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }));
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}

// Smooth scroll functionality
function initSmoothScroll() {
    secureQuerySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = secureQuerySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Scroll progress indicator
function updateScrollProgress() {
    const scrollProgress = secureGetElementById('scroll-progress');
    if (!scrollProgress) return;
    
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    scrollProgress.style.width = Math.min(scrollPercent, 100) + '%';
}

// Dynamic scroll styling with section highlighting
function initDynamicScrollStyling() {
    const sections = secureQuerySelectorAll('section[id]');
    
    function updateActiveSection() {
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                // Убираем класс у всех секций
                sections.forEach(s => s.classList.remove('active-scroll'));
                // Добавляем класс к активной секции
                section.classList.add('active-scroll');
                
                // Обновляем активную ссылку в навигации
                secureQuerySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
                
                // Обновляем цвет scroll progress bar
                const progressBar = secureGetElementById('scroll-progress');
                if (progressBar) {
                    switch(sectionId) {
                        case 'portfolio':
                            progressBar.style.background = 'linear-gradient(90deg, #667eea, #764ba2)';
                            break;
                        case 'services':
                            progressBar.style.background = 'linear-gradient(90deg, #43e97b, #38f9d7)';
                            break;
                        case 'about':
                            progressBar.style.background = 'linear-gradient(90deg, #fa709a, #fee140)';
                            break;
                        case 'contact':
                            progressBar.style.background = 'linear-gradient(90deg, #4facfe, #00f2fe)';
                            break;
                        default:
                            progressBar.style.background = 'linear-gradient(90deg, #667eea, #764ba2)';
                    }
                }
            }
        });
    }
    
    // Инициализация
    updateActiveSection();
    
    // Обновление при скролле с throttling
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                updateActiveSection();
                scrollTimeout = null;
            }, 16); // ~60fps
        }
    });
}

// Auto-hide navbar on scroll
function initAutoHideNavbar() {
    const navbar = secureQuerySelector('.navbar');
    if (!navbar) return;
    
    let lastScrollTop = 0;
    let isScrolling = false;
    
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            isScrolling = true;
            
            requestAnimationFrame(() => {
                const scrollTop = window.pageYOffset;
                
                if (scrollTop > lastScrollTop && scrollTop > 100) {
                    // Scrolling down & past header
                    navbar.classList.add('navbar-hidden');
                } else {
                    // Scrolling up
                    navbar.classList.remove('navbar-hidden');
                }
                
                lastScrollTop = scrollTop;
                isScrolling = false;
            });
        }
    });
}

// Parallax effect for hero section
function handleParallax() {
    const heroSection = secureQuerySelector('#home');
    if (!heroSection) return;
    
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    
    // Apply parallax to background elements
    const parallaxElements = heroSection.querySelectorAll('.hero-gradient, #particles-js');
    parallaxElements.forEach(element => {
        element.style.transform = `translateY(${rate}px)`;
    });
}

// Dynamic copyright year
function updateCopyrightYear() {
    const footerText = secureQuerySelector('.footer p');
    if (footerText) {
        const currentYear = new Date().getFullYear();
        footerText.textContent = footerText.textContent.replace(/\d{4}/, currentYear);
    }
}

// Optimize scroll performance with debouncing
function optimizeScrollPerformance() {
    let scrollTimeout;
    
    function debounceScroll(func, delay) {
        return function(...args) {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => func.apply(this, args), delay);
        };
    }
    
    // Оптимизированные обработчики скролла
    const optimizedScrollHandler = debounceScroll(() => {
        updateScrollProgress();
        handleParallax();
    }, 10);
    
    window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
}

// Keyboard navigation support
function initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // ESC key closes mobile menu
        if (e.key === 'Escape') {
            const hamburger = secureQuerySelector('.hamburger');
            const navMenu = secureQuerySelector('.nav-menu');
            
            if (hamburger && hamburger.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        }
    });
}

// Initialize all navigation features
function initializeNavigation() {
    initMobileNavigation();
    initSmoothScroll();
    initDynamicScrollStyling();
    initAutoHideNavbar();
    optimizeScrollPerformance();
    initKeyboardNavigation();
    updateCopyrightYear();
    
    // Initial calls
    updateScrollProgress();
    
    console.log('🧭 Navigation module initialized');
}

// Export functions for other modules
window.NavigationModule = {
    initializeNavigation,
    updateScrollProgress,
    handleParallax,
    initMobileNavigation,
    initSmoothScroll
}; 