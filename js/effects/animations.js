// ========== ANIMATIONS EFFECTS MODULE ==========
// Модуль анимаций, 3D эффектов и визуальных улучшений

// Entrance animations observer
let animationObserver;

// Initialize entrance animations
function initEntranceAnimations() {
    // Create intersection observer for scroll animations
    animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Add stagger delay for multiple elements
                const delay = Array.from(entry.target.parentElement.children).indexOf(entry.target) * 100;
                entry.target.style.transitionDelay = `${delay}ms`;
                
                animationObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe elements for animations
    const animatedElements = secureQuerySelectorAll(
        '.portfolio-item, .service-item, .skill-item, .contact-item, .hero-visual, .section-title'
    );
    
    animatedElements.forEach(el => {
        // Set initial state
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        // Start observing
        animationObserver.observe(el);
    });
}

// Scroll-triggered animations
function handleScrollAnimations() {
    const scrollY = window.pageYOffset;
    const windowHeight = window.innerHeight;
    
    // Parallax for hero elements
    const heroElements = secureQuerySelectorAll('.floating-cards .card');
    heroElements.forEach((card, index) => {
        const speed = 0.5 + (index * 0.2);
        const yPos = -(scrollY * speed);
        card.style.transform = `translateY(${yPos}px) rotateX(${scrollY * 0.1}deg)`;
    });
    
    // Scale effect for services section
    const servicesSection = secureQuerySelector('#services');
    if (servicesSection) {
        const rect = servicesSection.getBoundingClientRect();
        const scale = Math.max(0.8, Math.min(1, 1 - Math.abs(rect.top) / windowHeight));
        servicesSection.style.transform = `scale(${scale})`;
    }
    
    // Rotation effect for portfolio items on scroll
    const portfolioItems = secureQuerySelectorAll('.portfolio-item');
    portfolioItems.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        const isVisible = rect.top < windowHeight && rect.bottom > 0;
        
        if (isVisible) {
            const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
            const rotation = (progress - 0.5) * 5; // ±2.5 degrees
            item.style.transform = `rotateY(${rotation}deg)`;
        }
    });
}

// 3D Tilt effect for cards
function init3DTilt() {
    const tiltElements = secureQuerySelectorAll('.portfolio-item, .service-item, .hero-visual');
    
    tiltElements.forEach(element => {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / centerY * -10;
            const rotateY = (x - centerX) / centerX * 10;
            
            element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });
}

// Magnetic button effect
function initMagneticButtons() {
    const magneticButtons = secureQuerySelectorAll('.btn, .portfolio-item, .nav-link');
    
    magneticButtons.forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            const distance = Math.sqrt(x * x + y * y);
            const maxDistance = Math.max(rect.width, rect.height);
            
            if (distance < maxDistance) {
                const strength = (maxDistance - distance) / maxDistance;
                const magnetX = x * strength * 0.3;
                const magnetY = y * strength * 0.3;
                
                button.style.transform = `translate(${magnetX}px, ${magnetY}px)`;
            }
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translate(0px, 0px)';
        });
    });
}

// Text reveal animations
function initTextReveal() {
    const textElements = secureQuerySelectorAll('.hero-title, .section-title');
    
    textElements.forEach(element => {
        const text = element.textContent;
        element.innerHTML = '';
        
        // Split text into spans
        const characters = text.split('').map(char => {
            if (char === ' ') return '<span class="char">&nbsp;</span>';
            return `<span class="char">${char}</span>`;
        }).join('');
        
        element.innerHTML = characters;
        
        // Animate characters
        const chars = element.querySelectorAll('.char');
        chars.forEach((char, index) => {
            char.style.opacity = '0';
            char.style.transform = 'translateY(50px)';
            char.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            char.style.transitionDelay = `${index * 50}ms`;
        });
        
        // Trigger animation when in view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    chars.forEach(char => {
                        char.style.opacity = '1';
                        char.style.transform = 'translateY(0)';
                    });
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(element);
    });
}

// Floating particles background
function initFloatingParticles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'floating-particles';
    canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        opacity: 0.3;
    `;
    
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    const particles = [];
    const particleCount = 50;
    
    // Resize canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Particle class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(102, 126, 234, ${this.opacity})`;
            ctx.fill();
        }
    }
    
    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Glitch text effect
function initGlitchEffect() {
    const glitchElements = secureQuerySelectorAll('.glitch-text');
    
    glitchElements.forEach(element => {
        const originalText = element.textContent;
        element.dataset.text = originalText;
        
        element.addEventListener('mouseenter', () => {
            let iteration = 0;
            const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
            
            const interval = setInterval(() => {
                element.textContent = originalText
                    .split('')
                    .map((char, index) => {
                        if (index < iteration) {
                            return originalText[index];
                        }
                        return glitchChars[Math.floor(Math.random() * glitchChars.length)];
                    })
                    .join('');
                
                iteration += 1/3;
                
                if (iteration >= originalText.length) {
                    clearInterval(interval);
                    element.textContent = originalText;
                }
            }, 30);
        });
    });
}

// Breathing animation for elements
function initBreathingAnimation() {
    const breathingElements = secureQuerySelectorAll('.breathe');
    
    breathingElements.forEach(element => {
        element.style.animation = 'breathe 3s ease-in-out infinite';
        
        // Add CSS keyframes dynamically
        if (!document.querySelector('#breathe-keyframes')) {
            const style = document.createElement('style');
            style.id = 'breathe-keyframes';
            style.textContent = `
                @keyframes breathe {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
            `;
            document.head.appendChild(style);
        }
    });
}

// Performance optimization - disable animations on low-end devices
function optimizeAnimations() {
    // Check if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('reduced-motion');
        return;
    }
    
    // Check device performance
    const isLowEndDevice = navigator.hardwareConcurrency <= 2 || 
                          navigator.deviceMemory <= 2 ||
                          /Android|iPhone/i.test(navigator.userAgent);
    
    if (isLowEndDevice) {
        document.body.classList.add('low-performance');
        
        // Disable heavy animations
        const heavyAnimations = secureQuerySelectorAll('.floating-particles, .glitch-text');
        heavyAnimations.forEach(el => el.style.display = 'none');
    }
}

// Initialize all animations
function initializeAnimations() {
    optimizeAnimations();
    
    // Core animations
    initEntranceAnimations();
    init3DTilt();
    initMagneticButtons();
    
    // Enhanced effects (only on capable devices)
    if (!document.body.classList.contains('low-performance')) {
        initTextReveal();
        initFloatingParticles();
        initGlitchEffect();
        initBreathingAnimation();
    }
    
    console.log('✨ Animations module initialized');
}

// Export functions for other modules
window.AnimationsModule = {
    initializeAnimations,
    handleScrollAnimations,
    initEntranceAnimations,
    init3DTilt,
    initMagneticButtons
}; 