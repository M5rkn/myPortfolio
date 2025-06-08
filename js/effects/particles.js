// ========== PARTICLES EFFECTS MODULE ==========
// Модуль для частиц particles.js с оптимизацией производительности

// Initialize particles.js with performance optimization
function initParticles() {
    // Check if particles.js library is loaded
    if (typeof particlesJS === 'undefined') {
        console.warn('particles.js library not loaded');
        return;
    }
    
    const particlesContainer = secureGetElementById('particles-js');
    if (!particlesContainer) {
        console.warn('Particles container not found');
        return;
    }
    
    // Performance-based configuration
    const isLowEndDevice = navigator.hardwareConcurrency <= 2 || 
                          navigator.deviceMemory <= 2 ||
                          /Android|iPhone/i.test(navigator.userAgent);
    
    const isMobile = window.innerWidth <= 768;
    
    // Reduce particle count on low-end devices or mobile
    const particleCount = isLowEndDevice ? 30 : isMobile ? 50 : 80;
    const moveSpeed = isLowEndDevice ? 1 : 2;
    
    // Particles.js configuration
    const particlesConfig = {
        "particles": {
            "number": {
                "value": particleCount,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": ["#667eea", "#764ba2", "#f093fb", "#f5576c"]
            },
            "shape": {
                "type": "circle",
                "stroke": {
                    "width": 0,
                    "color": "#000000"
                }
            },
            "opacity": {
                "value": 0.6,
                "random": true,
                "anim": {
                    "enable": true,
                    "speed": 1,
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 3,
                "random": true,
                "anim": {
                    "enable": true,
                    "speed": 2,
                    "size_min": 0.1,
                    "sync": false
                }
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#667eea",
                "opacity": 0.4,
                "width": 1
            },
            "move": {
                "enable": true,
                "speed": moveSpeed,
                "direction": "none",
                "random": false,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
                "attract": {
                    "enable": false,
                    "rotateX": 600,
                    "rotateY": 1200
                }
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": !isLowEndDevice, // Disable hover on low-end devices
                    "mode": "repulse"
                },
                "onclick": {
                    "enable": true,
                    "mode": "push"
                },
                "resize": true
            },
            "modes": {
                "grab": {
                    "distance": 140,
                    "line_linked": {
                        "opacity": 1
                    }
                },
                "bubble": {
                    "distance": 200,
                    "size": 80,
                    "duration": 2,
                    "opacity": 8,
                    "speed": 3
                },
                "repulse": {
                    "distance": 100,
                    "duration": 0.4
                },
                "push": {
                    "particles_nb": 4
                },
                "remove": {
                    "particles_nb": 2
                }
            }
        },
        "retina_detect": true
    };
    
    // Initialize particles
    particlesJS('particles-js', particlesConfig);
    
    // Performance monitoring
    monitorParticlesPerformance();
    
    console.log('🌟 Particles initialized with performance optimization');
}

// Monitor particles performance and adjust if needed
function monitorParticlesPerformance() {
    let frameCount = 0;
    let lastTime = performance.now();
    let hasReducedParticles = false; // Флаг для предотвращения спама
    
    function checkFPS() {
        const currentTime = performance.now();
        frameCount++;
        
        if (currentTime - lastTime >= 1000) {
            const fps = frameCount;
            frameCount = 0;
            lastTime = currentTime;
            
            // If FPS is too low, reduce particles (только один раз)
            if (fps < 30 && window.pJSDom && window.pJSDom[0] && !hasReducedParticles) {
                const pJS = window.pJSDom[0].pJS;
                if (pJS.particles.array.length > 20) {
                    // Remove some particles
                    pJS.particles.array.splice(0, 10);
                    console.warn('🌌 Particles optimized for better performance');
                    hasReducedParticles = true; // Больше не будем оптимизировать
                    return; // Останавливаем мониторинг
                }
            }
        }
        
        // Останавливаем мониторинг через 10 секунд для экономии ресурсов
        if (currentTime - performance.now() < 10000) {
            requestAnimationFrame(checkFPS);
        }
    }
    
    requestAnimationFrame(checkFPS);
}

// Create enhanced fallback particles if particles.js fails
function createFallbackParticles() {
    const container = secureGetElementById('particles-js');
    if (!container) return;
    
    container.style.position = 'absolute';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.overflow = 'hidden';
    container.style.pointerEvents = 'none';
    
    const particleCount = window.innerWidth <= 768 ? 15 : 25;
    
    // Create CSS-only particles with enhanced visual effects
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'fallback-particle';
        
        const size = Math.random() * 6 + 2;
        const opacity = Math.random() * 0.6 + 0.2;
        const hue = Math.random() * 60 + 200; // Blue to purple range
        const duration = Math.random() * 15 + 15;
        const delay = Math.random() * 8;
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: hsla(${hue}, 70%, 60%, ${opacity});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: 
                float ${duration}s infinite ease-in-out,
                pulse ${duration * 0.5}s infinite ease-in-out,
                fadeInOut ${duration * 1.2}s infinite ease-in-out;
            animation-delay: ${delay}s, ${delay * 0.7}s, ${delay * 1.3}s;
            box-shadow: 0 0 ${size * 2}px hsla(${hue}, 70%, 60%, ${opacity * 0.5});
        `;
        
        container.appendChild(particle);
    }
    
    // Add enhanced CSS animations
    if (!document.querySelector('#fallback-particles-style')) {
        const style = document.createElement('style');
        style.id = 'fallback-particles-style';
        style.textContent = `
            @keyframes float {
                0%, 100% {
                    transform: translateY(0px) translateX(0px) rotate(0deg);
                }
                25% {
                    transform: translateY(-30px) translateX(15px) rotate(90deg);
                }
                50% {
                    transform: translateY(-15px) translateX(-25px) rotate(180deg);
                }
                75% {
                    transform: translateY(-40px) translateX(8px) rotate(270deg);
                }
            }
            
            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.2);
                }
            }
            
            @keyframes fadeInOut {
                0%, 100% {
                    opacity: 0.3;
                }
                50% {
                    opacity: 0.8;
                }
            }
            
            .fallback-particle {
                will-change: transform, opacity;
            }
        `;
        document.head.appendChild(style);
    }
    
    console.log('✨ Fallback particles created with enhanced effects');
}

// Lazy loading particles.js library for better performance
async function lazyLoadParticles() {
    try {
        // Check if already loaded
        if (typeof particlesJS !== 'undefined') {
            initParticles();
            return;
        }
        
        console.log('Loading particles.js...');
        
        // Create and load script
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js';
        script.async = true;
        
        // Promise wrapper for script loading
        const loadPromise = new Promise((resolve, reject) => {
            script.onload = () => {
                console.log('particles.js loaded successfully');
                resolve();
            };
            script.onerror = () => {
                console.error('Failed to load particles.js');
                reject(new Error('Failed to load particles.js'));
            };
        });
        
        // Add script to DOM
        document.head.appendChild(script);
        
        // Wait for loading
        await loadPromise;
        
        // Small delay to ensure library is ready
        setTimeout(() => {
            if (typeof particlesJS !== 'undefined') {
                initParticles();
            } else {
                console.warn('particles.js not available, using fallback');
                createFallbackParticles();
            }
        }, 100);
        
    } catch (error) {
        console.error('Error loading particles:', error);
        createFallbackParticles();
    }
}

// Responsive particles - adjust on window resize
function handleParticlesResize() {
    if (window.pJSDom && window.pJSDom[0]) {
        const pJS = window.pJSDom[0].pJS;
        const isMobile = window.innerWidth <= 768;
        
        // Adjust particle count based on screen size
        const newCount = isMobile ? 30 : 60;
        
        if (pJS.particles.array.length !== newCount) {
            pJS.particles.array.length = 0; // Clear existing
            pJS.fn.particlesCreate(); // Recreate with new settings
        }
    }
}

// Pause particles when tab is not visible (performance optimization)
function handleVisibilityChange() {
    if (window.pJSDom && window.pJSDom[0]) {
        const pJS = window.pJSDom[0].pJS;
        
        if (document.hidden) {
            pJS.fn.particlesEmpty();
        } else {
            pJS.fn.particlesCreate();
        }
    }
}

// Initialize particles module
function initializeParticles() {
    // Add event listeners
    window.addEventListener('resize', handleParticlesResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Start particles with delay to allow page to load
    setTimeout(() => {
        lazyLoadParticles();
    }, 1000);
    
    console.log('🌌 Particles module initialized');
}

// Export functions for other modules
window.ParticlesModule = {
    initializeParticles,
    initParticles,
    createFallbackParticles,
    lazyLoadParticles
}; 