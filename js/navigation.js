// ========== NAVIGATION MODULE ==========
// Навигация, мобильное меню, smooth scroll

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
    }
}

// Smooth scrolling for navigation links
function initSmoothScroll() {
    secureQuerySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
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

// Navbar background change on scroll with smooth transition
function initNavbarScroll() {
    const navbar = secureQuerySelector('.navbar');
    if (!navbar) return;
    
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    function updateNavbar() {
        const scrollY = window.scrollY;
        
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Auto-hide navbar on scroll down, show on scroll up
        if (scrollY > lastScrollY && scrollY > 200) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollY = scrollY;
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick, { passive: true });
}

// Dynamic scroll styling for sections
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
                const navLinks = secureQuerySelectorAll('.nav-link');
                navLinks.forEach(link => {
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
    
    // Обновление при скролле
    window.addEventListener('scroll', updateActiveSection, { passive: true });
}

// Initialize all navigation features
function initNavigation() {
    initMobileNavigation();
    initSmoothScroll();
    initNavbarScroll();
    initDynamicScrollStyling();
}

// Export navigation module
window.NavigationModule = {
    initMobileNavigation,
    initSmoothScroll,
    initNavbarScroll,
    initDynamicScrollStyling,
    initNavigation
}; 