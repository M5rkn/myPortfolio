// ========== MAIN APPLICATION ENTRY POINT ==========
// Главный файл инициализации приложения TechPortal

// Application configuration
const AppConfig = {
    version: '2.0.0',
    environment: window.location.hostname.includes('railway.app') ? 'production' : 'development',
    features: {
        animations: true,
        particles: true,
        chat: true,
        calculator: true,
        analytics: true
    }
};

// Application state
const AppState = {
    initialized: false,
    modulesLoaded: {},
    performanceMetrics: {
        loadStart: performance.now(),
        moduleLoadTimes: {}
    }
};

// Module loading with performance tracking
async function loadModule(moduleName, initFunction) {
    const startTime = performance.now();
    
    try {
        if (typeof initFunction === 'function') {
            await initFunction();
            AppState.modulesLoaded[moduleName] = true;
            
            const loadTime = performance.now() - startTime;
            AppState.performanceMetrics.moduleLoadTimes[moduleName] = loadTime;
            
            console.log(`✅ ${moduleName} loaded in ${loadTime.toFixed(2)}ms`);
        } else {
            throw new Error(`${moduleName} initialization function not found`);
        }
    } catch (error) {
        console.error(`❌ Failed to load ${moduleName}:`, error);
        AppState.modulesLoaded[moduleName] = false;
    }
}

// Check if all required modules are available
function checkModuleAvailability() {
    const requiredModules = [
        'SecurityModule',
        'NavigationModule', 
        'FormsModule',
        'PortfolioModule',
        'ChatModule',
        'CalculatorModule',
        'AnimationsModule',
        'ParticlesModule',
        'ApiModule'
    ];
    
    const missing = [];
    
    requiredModules.forEach(module => {
        try {
            if (!window[module] || typeof window[module] !== 'object') {
                missing.push(module);
            }
        } catch (error) {
            console.warn(`Error checking module ${module}:`, error);
            missing.push(module);
        }
    });
    
    if (missing.length > 0) {
        console.warn('Missing modules:', missing);
        console.warn('Available modules:', Object.keys(window).filter(key => key.endsWith('Module')));
        return false;
    }
    
    return true;
}

// Initialize hero section with typed effect
function initializeHeroEffects() {
    const heroSubtitle = secureQuerySelector('.hero-subtitle');
    if (heroSubtitle && window.PortfolioModule) {
        const originalText = heroSubtitle.textContent;
        setTimeout(() => {
            window.PortfolioModule.typeWriter(heroSubtitle, originalText, 80);
        }, 1000);
    }
}

// Initialize scroll-based animations and effects
function initializeScrollEffects() {
    let scrollTimeout;
    
    function optimizedScrollHandler() {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                // Update navigation scroll progress
                if (window.NavigationModule) {
                    window.NavigationModule.updateScrollProgress();
                }
                
                // Handle scroll animations
                if (window.AnimationsModule) {
                    window.AnimationsModule.handleScrollAnimations();
                }
                
                // Handle parallax effects
                if (window.NavigationModule) {
                    window.NavigationModule.handleParallax();
                }
                
                scrollTimeout = null;
            }, 16); // ~60fps
        }
    }
    
    window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
}

// Initialize preloader and loading sequence
function initializePreloader() {
    const preloader = secureGetElementById('preloader');
    if (!preloader) return;
    
    // Hide preloader after everything is loaded
    setTimeout(() => {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
            document.body.classList.add('loaded');
        }, 500);
    }, 2000); // 2 seconds minimum loading time
}

// Performance monitoring and optimization
function monitorPerformance() {
    // Track Core Web Vitals
    if ('web-vital' in window) {
        // This would integrate with a real monitoring service
        console.log('Performance monitoring enabled');
    }
    
    // Memory usage monitoring
    if (performance.memory) {
        const memoryInfo = {
            used: Math.round(performance.memory.usedJSHeapSize / 1048576),
            total: Math.round(performance.memory.totalJSHeapSize / 1048576),
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
        };
        
        console.log('Memory usage:', memoryInfo);
        
        // Warn if memory usage is high
        if (memoryInfo.used / memoryInfo.limit > 0.8) {
            console.warn('High memory usage detected');
        }
    }
}

// Error handling and recovery
function setupErrorHandling() {
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        
        // Try to recover from common errors
        if (event.error?.message?.includes('particlesJS')) {
            console.warn('Particles error detected, switching to fallback');
            if (window.ParticlesModule) {
                window.ParticlesModule.createFallbackParticles();
            }
        }
    });
    
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        event.preventDefault(); // Prevent default browser behavior
    });
}

// Main application initialization
async function initializeApplication() {
    console.log('🚀 TechPortal v' + AppConfig.version + ' initializing...');
    
    try {
        // 1. Setup error handling first
        setupErrorHandling();
        
        // 2. Check module availability
        if (!checkModuleAvailability()) {
            throw new Error('Required modules missing');
        }
        
        // 3. Initialize core security module first
        await loadModule('Security', window.SecurityModule.initializeSecurity);
        
        // 4. Initialize API utilities
        await loadModule('API', window.ApiModule.initApiHelpers);
        
        // 5. Initialize navigation and forms (core functionality)
        await loadModule('Navigation', window.NavigationModule.initializeNavigation);
        await loadModule('Forms', window.FormsModule.initializeForms);
        
        // 6. Initialize content modules
        await loadModule('Portfolio', window.PortfolioModule.initializePortfolio);
        await loadModule('Chat', window.ChatModule.initializeChat);
        await loadModule('Calculator', window.CalculatorModule.initializeCalculator);
        
        // 7. Initialize visual effects (after core functionality)
        if (AppConfig.features.animations) {
            await loadModule('Animations', window.AnimationsModule.initializeAnimations);
        }
        
        if (AppConfig.features.particles) {
            await loadModule('Particles', window.ParticlesModule.initializeParticles);
        }
        
        // 8. Initialize additional features
        initializeHeroEffects();
        initializeScrollEffects();
        
        // 9. Update project views
        if (window.ApiModule) {
            window.ApiModule.updateProjectViews();
        }
        
        // 10. Setup performance monitoring
        setTimeout(monitorPerformance, 5000);
        
        // 11. Mark application as initialized
        AppState.initialized = true;
        
        // 12. Hide preloader
        initializePreloader();
        
        // 13. Calculate total initialization time
        const totalTime = performance.now() - AppState.performanceMetrics.loadStart;
        console.log(`🎉 TechPortal initialized successfully in ${totalTime.toFixed(2)}ms`);
        
        // 14. Log performance metrics
        console.table(AppState.performanceMetrics.moduleLoadTimes);
        
        // 15. Development helpers
        if (AppConfig.environment === 'development') {
            window.App = {
                config: AppConfig,
                state: AppState,
                modules: {
                    security: window.SecurityModule,
                    navigation: window.NavigationModule,
                    forms: window.FormsModule,
                    portfolio: window.PortfolioModule,
                    chat: window.ChatModule,
                    calculator: window.CalculatorModule,
                    animations: window.AnimationsModule,
                    particles: window.ParticlesModule,
                    api: window.ApiModule
                }
            };
            console.log('🛠️ Development tools available in window.App');
        }
        
    } catch (error) {
        console.error('❌ Application initialization failed:', error);
        
        // Fallback: try to initialize basic functionality
        try {
            if (window.SecurityModule) {
                window.SecurityModule.initializeSecurity();
            }
            if (window.NavigationModule) {
                window.NavigationModule.initializeNavigation();
            }
            if (window.FormsModule) {
                window.FormsModule.initializeForms();
            }
            
            console.warn('⚠️ Running in fallback mode with limited functionality');
        } catch (fallbackError) {
            console.error('💥 Complete initialization failure:', fallbackError);
        }
    }
}

// DOM Content Loaded handler
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure all scripts are loaded
    setTimeout(initializeApplication, 100);
});

// Backup initialization for older browsers
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
    // DOM already loaded
    setTimeout(initializeApplication, 100);
}

// Export for debugging
window.TechPortalApp = {
    init: initializeApplication,
    config: AppConfig,
    state: AppState
}; 