// ========== ANIMATIONS MODULE ==========
// Анимации, эффекты, particles, 3D тилт

// Intersection Observer for animations
let observer;

// Initialize entrance animations
function initEntranceAnimations() {
    // Animate hero content
    const heroContent = secureQuerySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(50px)';
        
        setTimeout(() => {
            heroContent.style.transition = 'all 1s ease';
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 500);
    }
    
    // Setup observer for scroll animations
    if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });
    }
    
    // Observe all major sections
    const sectionsToAnimate = secureQuerySelectorAll('.portfolio-item, .skill-item, .contact-item, .service-card');
    sectionsToAnimate.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        if (observer) observer.observe(el);
    });
}

// Typed text effect for hero section
function typeWriter(element, text, speed = 100) {
    if (!element) return;
    
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

// Add hover animations
function addHoverAnimations() {
    // Portfolio items hover effect
    const portfolioItems = secureQuerySelectorAll('.portfolio-item');
    portfolioItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-10px) scale(1.02)';
            item.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateY(0) scale(1)';
            item.style.boxShadow = '0 5px 15px rgba(0,0,0,0.08)';
        });
    });
    
    // Service cards hover effect
    const serviceCards = secureQuerySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 5px 15px rgba(0,0,0,0.08)';
        });
    });
    
    // Button hover effects
    const buttons = secureQuerySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-2px)';
            btn.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.2)';
        });
    });
}

// Initialize particles.js
function initParticles() {
    if (typeof particlesJS === 'undefined') {
        console.warn('particles.js not loaded');
        return;
    }
    
    const particlesContainer = secureGetElementById('particles-js');
    if (!particlesContainer) return;
    
    particlesJS('particles-js', {
        particles: {
            number: {
                value: 120,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: '#667eea'
            },
            shape: {
                type: 'circle',
                stroke: {
                    width: 0,
                    color: '#000000'
                },
                polygon: {
                    nb_sides: 5
                }
            },
            opacity: {
                value: 0.6,
                random: false,
                anim: {
                    enable: false,
                    speed: 1,
                    opacity_min: 0.1,
                    sync: false
                }
            },
            size: {
                value: 3,
                random: true,
                anim: {
                    enable: false,
                    speed: 40,
                    size_min: 0.1,
                    sync: false
                }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: '#667eea',
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: 2,
                direction: 'none',
                random: false,
                straight: false,
                out_mode: 'out',
                bounce: false,
                attract: {
                    enable: false,
                    rotateX: 600,
                    rotateY: 1200
                }
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: {
                    enable: true,
                    mode: 'repulse'
                },
                onclick: {
                    enable: true,
                    mode: 'push'
                },
                resize: true
            },
            modes: {
                grab: {
                    distance: 400,
                    line_linked: {
                        opacity: 1
                    }
                },
                bubble: {
                    distance: 400,
                    size: 40,
                    duration: 2,
                    opacity: 8,
                    speed: 3
                },
                repulse: {
                    distance: 200,
                    duration: 0.4
                },
                push: {
                    particles_nb: 4
                },
                remove: {
                    particles_nb: 2
                }
            }
        },
        retina_detect: true
    });
}

// Magnetic buttons effect
function initMagneticButtons() {
    const magneticButtons = secureQuerySelectorAll('.btn-primary, .btn-secondary');
    
    magneticButtons.forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            button.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translate(0, 0)';
        });
    });
}

// 3D Tilt effect
function init3DTilt() {
    const tiltElements = secureQuerySelectorAll('.portfolio-item, .service-card');
    
    tiltElements.forEach(element => {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / centerY * -10;
            const rotateY = (x - centerX) / centerX * 10;
            
            element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        });
        
        // Add transition for smooth return
        element.style.transition = 'transform 0.3s ease';
    });
}

// Glitch text effect
function initGlitchEffect() {
    const glitchElements = secureQuerySelectorAll('.glitch-text');
    
    glitchElements.forEach(element => {
        const text = element.getAttribute('data-text') || element.textContent;
        
        element.addEventListener('mouseenter', () => {
            let iterations = 0;
            const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            
            const interval = setInterval(() => {
                element.textContent = text.split("")
                    .map((letter, index) => {
                        if (index < iterations) {
                            return text[index];
                        }
                        return letters[Math.floor(Math.random() * 26)];
                    })
                    .join("");
                
                if (iterations >= text.length) {
                    clearInterval(interval);
                }
                
                iterations += 1 / 3;
            }, 30);
        });
    });
}

// Breathing animation for hero subtitle
function initBreathingAnimation() {
    const breathingElements = secureQuerySelectorAll('.breathe');
    
    breathingElements.forEach(element => {
        setInterval(() => {
            element.style.transform = 'scale(1.05)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 1000);
        }, 2000);
        
        element.style.transition = 'transform 1s ease-in-out';
    });
}

// Floating cards animation
function initFloatingCards() {
    const floatingCards = secureQuerySelectorAll('.floating-cards .card');
    
    floatingCards.forEach((card, index) => {
        const delay = index * 2000; // Stagger the animations
        const duration = 3000 + Math.random() * 2000; // Random duration
        
        setInterval(() => {
            card.style.transform = `translateY(${Math.sin(Date.now() / duration) * 20}px) rotateZ(${Math.sin(Date.now() / duration) * 5}deg)`;
        }, 50);
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.animation = `float ${duration}ms ease-in-out infinite`;
        }, delay);
    });
}

// Parallax effect for elements
function handleParallax() {
    const parallaxElements = secureQuerySelectorAll('.parallax');
    const scrollTop = window.pageYOffset;
    
    parallaxElements.forEach(element => {
        const speed = element.dataset.speed || 0.5;
        const yPos = -(scrollTop * speed);
        element.style.transform = `translateY(${yPos}px)`;
    });
}

// Scroll animations handler
function handleScrollAnimations() {
    const animatedElements = secureQuerySelectorAll('.animate-on-scroll');
    
    animatedElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('animated');
        }
    });
}

// Performance optimization for animations
function optimizeAnimations() {
    // Reduce animations on low-end devices
    const isLowEndDevice = navigator.hardwareConcurrency <= 2 || 
                          navigator.deviceMemory <= 4;
    
    if (isLowEndDevice) {
        // Disable heavy animations
        const heavyAnimations = secureQuerySelectorAll('.heavy-animation');
        heavyAnimations.forEach(element => {
            element.style.animation = 'none';
            element.style.transition = 'none';
        });
        
        // Reduce particle count
        if (window.pJSDom && window.pJSDom[0]) {
            window.pJSDom[0].pJS.particles.number.value = 30;
        }
    }
    
    // Respect user's motion preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Disable animations for users who prefer reduced motion
        const style = document.createElement('style');
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize typed effect for hero
function initHeroTypedEffect() {
    const heroSubtitle = secureQuerySelector('.hero-subtitle');
    if (heroSubtitle) {
        const originalText = heroSubtitle.textContent;
        setTimeout(() => {
            typeWriter(heroSubtitle, originalText, 80);
        }, 1000);
    }
}

// Initialize all animations
function initAnimations() {
    initEntranceAnimations();
    addHoverAnimations();
    initMagneticButtons();
    init3DTilt();
    initGlitchEffect();
    initBreathingAnimation();
    initFloatingCards();
    initHeroTypedEffect();
    optimizeAnimations();
    
    // Initialize particles with delay to ensure DOM is ready
    setTimeout(() => {
        initParticles();
    }, 100);
}

// Export animations module
window.AnimationsModule = {
    initEntranceAnimations,
    typeWriter,
    addHoverAnimations,
    initParticles,
    initMagneticButtons,
    init3DTilt,
    initGlitchEffect,
    initBreathingAnimation,
    initFloatingCards,
    handleParallax,
    handleScrollAnimations,
    optimizeAnimations,
    initHeroTypedEffect,
    initAnimations
}; 