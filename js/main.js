// ========== MAIN APPLICATION FILE ==========
// Основная логика приложения и инициализация всех модулей

// Preloader functionality
function hidePreloader() {
    const preloader = secureGetElementById('preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
}

// Portfolio filter functionality (if needed in the future)
function filterPortfolio(category) {
    const portfolioItems = secureQuerySelectorAll('.portfolio-item');
    
    portfolioItems.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
            item.style.opacity = '1';
        } else {
            item.style.opacity = '0';
            setTimeout(() => {
                item.style.display = 'none';
            }, 300);
        }
    });
    
    // Update filter buttons
    const filterButtons = secureQuerySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === category) {
            btn.classList.add('active');
        }
    });
}

// Initialize visual effects
function initializeVisualEffects() {
    // Initialize all animation modules
    if (window.AnimationsModule) {
        AnimationsModule.initAnimations();
    }
    
    // Initialize scroll effects
    if (window.ScrollModule) {
        ScrollModule.initScroll();
    }
    
    // Initialize navigation
    if (window.NavigationModule) {
        NavigationModule.initNavigation();
    }
}

// Wait for all modules to load
function waitForModules() {
    return new Promise((resolve) => {
        const checkModules = () => {
            const requiredModules = [
                'SecurityModule',
                'UtilsModule', 
                'NavigationModule',
                'FormsModule',
                'PortfolioModule',
                'WidgetsModule',
                'AnimationsModule',
                'ScrollModule'
            ];
            
            const loadedModules = requiredModules.filter(module => window[module]);
            console.log(`📦 Modules loaded: ${loadedModules.length}/${requiredModules.length}`);
            
            if (loadedModules.length === requiredModules.length) {
                resolve();
            } else {
                setTimeout(checkModules, 50);
            }
        };
        checkModules();
    });
}

// Main DOMContentLoaded handler
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 TechPortal Application Starting...');
    
    // Wait for all modules to load
    await waitForModules();
    console.log('✅ All modules loaded successfully');
    
    // Start performance monitoring
    if (window.UtilsModule?.performance) {
        UtilsModule.performance.mark('app-start');
    }
    
    // Initialize security first
    if (window.SecurityModule) {
        SecurityModule.initSecurity();
        console.log('🔒 Security module initialized');
    }
    
    // Initialize utility functions
    if (window.UtilsModule) {
        UtilsModule.initUtils();
        console.log('🛠️ Utils module initialized');
    }
    
    // Initialize forms and validation
    if (window.FormsModule) {
        FormsModule.initForms();
        console.log('📝 Forms module initialized');
    }
    
    // Initialize portfolio functionality
    if (window.PortfolioModule) {
        PortfolioModule.initPortfolio();
        console.log('💼 Portfolio module initialized');
    }
    
    // Initialize widgets (chat and calculator)
    if (window.WidgetsModule) {
        WidgetsModule.initWidgets();
        console.log('🔧 Widgets module initialized');
    }
    
    // Initialize visual effects with small delay for particles.js to load
    setTimeout(() => {
        initializeVisualEffects();
        console.log('✨ Visual effects initialized');
    }, 100);
    
    // Hide preloader after all initialization
    setTimeout(() => {
        hidePreloader();
        console.log('🎨 Preloader hidden');
    }, 1500);
    
    // Development helpers (только для localhost)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Add debugging functions to window
        window.resetRateLimit = () => {
            if (window.SecurityModule?.rateLimiter) {
                SecurityModule.rateLimiter.reset();
            }
        };
        
        window.rateLimitStats = () => {
            if (window.SecurityModule?.rateLimiter) {
                const stats = SecurityModule.rateLimiter.getStats();
                console.log('Rate Limiter Stats:', stats);
                return stats;
            }
        };
        
        window.getModuleInfo = () => {
            const modules = [
                'SecurityModule',
                'NavigationModule', 
                'FormsModule',
                'PortfolioModule',
                'WidgetsModule',
                'AnimationsModule',
                'ScrollModule',
                'UtilsModule'
            ];
            
            const moduleInfo = {};
            modules.forEach(moduleName => {
                moduleInfo[moduleName] = !!window[moduleName];
            });
            
            console.table(moduleInfo);
            return moduleInfo;
        };
        
        console.log('🛠️ Development helpers available:');
        console.log('- resetRateLimit()');
        console.log('- rateLimitStats()');  
        console.log('- getModuleInfo()');
    }
    
    // Measure total initialization time
    if (window.UtilsModule?.performance) {
        UtilsModule.performance.measure('Total App Init', 'app-start');
    }
    
    console.log('✅ TechPortal Application Ready!');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden - pause heavy operations
        if (window.pJSDom && window.pJSDom[0]) {
            // Pause particles.js
            window.pJSDom[0].pJS.fn.vendors.stop();
        }
    } else {
        // Page is visible - resume operations
        if (window.pJSDom && window.pJSDom[0]) {
            // Resume particles.js
            window.pJSDom[0].pJS.fn.vendors.start();
        }
    }
});

// Handle window resize (add after modules are loaded)
setTimeout(() => {
    if (window.UtilsModule?.debounce) {
        window.addEventListener('resize', UtilsModule.debounce(() => {
            // Update device type on resize
            const deviceType = UtilsModule.getDeviceType();
            document.body.className = document.body.className.replace(/device-\w+/g, '');
            document.body.classList.add(`device-${deviceType}`);
            
            // Refresh particles.js on significant resize
            if (window.pJSDom && window.pJSDom[0]) {
                window.pJSDom[0].pJS.fn.vendors.resize();
            }
        }, 250));
    }
}, 1000);

// Handle orientation change for mobile
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        // Recalculate viewport after orientation change
        if (window.ScrollModule?.updateScrollProgress) {
            ScrollModule.updateScrollProgress();
        }
        
        // Update mobile menu if open
        const navMenu = secureQuerySelector('.nav-menu');
        const hamburger = secureQuerySelector('.hamburger');
        
        if (navMenu?.classList.contains('active')) {
            navMenu.classList.remove('active');
            hamburger?.classList.remove('active');
        }
    }, 100);
});

// Handle network status changes
window.addEventListener('online', () => {
    if (window.FormsModule?.showNotification) {
        FormsModule.showNotification('Соединение восстановлено', 'success');
    }
});

window.addEventListener('offline', () => {
    if (window.FormsModule?.showNotification) {
        FormsModule.showNotification('Нет соединения с интернетом', 'error');
    }
});

// Global error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    
    // Log error in development
    if (window.location.hostname === 'localhost') {
        console.trace('Error trace:', e);
    }
    
    // Show user-friendly message in production
    if (window.FormsModule?.showNotification && window.location.hostname !== 'localhost') {
        FormsModule.showNotification('Произошла ошибка. Попробуйте обновить страницу.', 'error');
    }
});

// Global promise rejection handling
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    e.preventDefault(); // Prevent default browser error handling
});

// Performance monitoring
if ('PerformanceObserver' in window) {
    const perfObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
            if (entry.entryType === 'largest-contentful-paint') {
                console.log('LCP:', entry.startTime);
            }
            
            if (entry.entryType === 'first-input') {
                console.log('FID:', entry.processingStart - entry.startTime);
            }
            
            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
                console.log('CLS score:', entry.value);
            }
        });
    });
    
    try {
        perfObserver.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (e) {
        console.warn('Performance observer not fully supported');
    }
}

// Service Worker registration (if available)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Expose global utilities
window.TechPortal = {
    version: '2.0.0',
    modules: {
        security: window.SecurityModule,
        navigation: window.NavigationModule,
        forms: window.FormsModule,
        portfolio: window.PortfolioModule,
        widgets: window.WidgetsModule,
        animations: window.AnimationsModule,
        scroll: window.ScrollModule,
        utils: window.UtilsModule
    },
    
    // Public API methods
    scrollToSection: (sectionId) => {
        if (window.ScrollModule?.scrollToSection) {
            ScrollModule.scrollToSection(sectionId);
        }
    },
    
    openProject: (projectId) => {
        if (window.PortfolioModule?.openProjectModal) {
            PortfolioModule.openProjectModal(projectId);
        }
    },
    
    showNotification: (message, type = 'info') => {
        if (window.FormsModule?.showNotification) {
            FormsModule.showNotification(message, type);
        }
    },
    
    toggleChat: () => {
        const chatToggle = secureGetElementById('chat-toggle');
        if (chatToggle) chatToggle.click();
    },
    
    toggleCalculator: () => {
        const calculatorToggle = secureGetElementById('calculator-toggle');
        if (calculatorToggle) calculatorToggle.click();
    }
};

// Make filter function globally available for future use
window.filterPortfolio = filterPortfolio;

console.log('📦 Main application file loaded'); 