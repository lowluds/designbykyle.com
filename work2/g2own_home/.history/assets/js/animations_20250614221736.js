// G2Own Advanced Animations - GSAP Powered Animations

class AdvancedAnimations {
    constructor() {
        this.isGSAPLoaded = false;
        this.animationQueue = [];
        this.init();
    }

    init() {
        this.checkGSAP();
        this.setupScrollTriggers();
        this.initializeMagneticEffects();
        this.initializeGlowEffects();
        this.initializeParallaxEffects();
        this.initializeTextAnimations();
        console.log('Advanced Animations initialized');
    }

    checkGSAP() {
        if (typeof gsap !== 'undefined') {
            this.isGSAPLoaded = true;
            this.processAnimationQueue();
        } else {
            // Fallback to CSS animations if GSAP is not loaded
            console.warn('GSAP not loaded, using CSS fallbacks');
            this.initializeCSSFallbacks();
        }
    }

    processAnimationQueue() {
        this.animationQueue.forEach(animation => {
            animation();
        });
        this.animationQueue = [];
    }

    addToQueue(animation) {
        if (this.isGSAPLoaded) {
            animation();
        } else {
            this.animationQueue.push(animation);
        }
    }

    // Magnetic Effects for Interactive Elements
    initializeMagneticEffects() {
        const magneticElements = document.querySelectorAll('.game-card, .category-card, .btn, button');
        
        magneticElements.forEach(element => {
            this.addMagneticEffect(element);
        });
    }

    addMagneticEffect(element) {
        let isHovering = false;
        
        element.addEventListener('mouseenter', () => {
            isHovering = true;
            this.addToQueue(() => {
                gsap.to(element, {
                    scale: 1.05,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        });

        element.addEventListener('mousemove', (e) => {
            if (!isHovering) return;
            
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const deltaX = (e.clientX - centerX) * 0.15;
            const deltaY = (e.clientY - centerY) * 0.15;
            
            this.addToQueue(() => {
                gsap.to(element, {
                    x: deltaX,
                    y: deltaY,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        });

        element.addEventListener('mouseleave', () => {
            isHovering = false;
            this.addToQueue(() => {
                gsap.to(element, {
                    x: 0,
                    y: 0,
                    scale: 1,
                    duration: 0.5,
                    ease: "elastic.out(1, 0.3)"
                });
            });
        });
    }

    // Glow Effects
    initializeGlowEffects() {
        const glowElements = document.querySelectorAll('.hover-glow, .nav-link, .btn');
        
        glowElements.forEach(element => {
            this.addGlowEffect(element);
        });
    }

    addGlowEffect(element) {
        element.addEventListener('mouseenter', () => {
            this.addToQueue(() => {
                gsap.to(element, {
                    filter: "drop-shadow(0 0 20px rgba(239, 68, 68, 0.6))",
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        });

        element.addEventListener('mouseleave', () => {
            this.addToQueue(() => {
                gsap.to(element, {
                    filter: "drop-shadow(0 0 0px rgba(239, 68, 68, 0))",
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        });
    }

    // Scroll-triggered Animations
    setupScrollTriggers() {
        if (!this.isGSAPLoaded) {
            this.setupCSSScrollAnimations();
            return;
        }

        // Animate elements on scroll
        const animateElements = document.querySelectorAll('.category-card, .game-card, #hero h1, #hero p');
        
        animateElements.forEach((element, index) => {
            gsap.fromTo(element, 
                {
                    opacity: 0,
                    y: 50,
                    scale: 0.9
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    delay: index * 0.1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: element,
                        start: "top 80%",
                        end: "bottom 20%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        });

        // Hero title special animation
        const heroTitle = document.querySelector('#hero h1');
        if (heroTitle) {
            gsap.fromTo(heroTitle,
                {
                    opacity: 0,
                    scale: 0.8,
                    rotateX: 45
                },
                {
                    opacity: 1,
                    scale: 1,
                    rotateX: 0,
                    duration: 1.2,
                    ease: "elastic.out(1, 0.3)",
                    delay: 0.5
                }
            );
        }
    }

    setupCSSScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        const elements = document.querySelectorAll('.category-card, .game-card');
        elements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            observer.observe(element);
        });
    }

    // Parallax Effects
    initializeParallaxEffects() {
        const parallaxElements = document.querySelectorAll('.bg-red-900\\/10, .bg-white\\/5, .bg-red-500\\/10');
        
        if (this.isGSAPLoaded) {
            parallaxElements.forEach((element, index) => {
                gsap.to(element, {
                    yPercent: -50,
                    ease: "none",
                    scrollTrigger: {
                        trigger: element,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true
                    }
                });
            });
        } else {
            this.setupCSSParallax();
        }
    }

    setupCSSParallax() {
        window.addEventListener('scroll', this.throttle(() => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.bg-red-900\\/10, .bg-white\\/5, .bg-red-500\\/10');
            
            parallaxElements.forEach((element, index) => {
                const speed = 0.5 + (index * 0.1);
                element.style.transform = `translateY(${scrolled * speed}px)`;
            });
        }, 16));
    }

    // Text Animations
    initializeTextAnimations() {
        this.animateCounters();
        this.animateTypewriter();
        this.animateTextReveal();
    }

    animateCounters() {
        const counters = document.querySelectorAll('[data-counter]');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-counter'));
            
            if (this.isGSAPLoaded) {
                gsap.fromTo(counter, 
                    { textContent: 0 },
                    {
                        textContent: target,
                        duration: 2,
                        ease: "power2.out",
                        snap: { textContent: 1 },
                        scrollTrigger: {
                            trigger: counter,
                            start: "top 80%"
                        }
                    }
                );
            } else {
                this.animateCounterCSS(counter, target);
            }
        });
    }

    animateCounterCSS(counter, target) {
        let current = 0;
        const increment = target / 60; // 60 frames for 1 second at 60fps
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = Math.floor(current);
        }, 16);
    }

    animateTypewriter() {
        const typewriterElements = document.querySelectorAll('[data-typewriter]');
        
        typewriterElements.forEach(element => {
            const text = element.getAttribute('data-typewriter');
            element.textContent = '';
            
            if (this.isGSAPLoaded) {
                gsap.to(element, {
                    text: text,
                    duration: text.length * 0.05,
                    ease: "none",
                    scrollTrigger: {
                        trigger: element,
                        start: "top 80%"
                    }
                });
            } else {
                this.typewriterCSS(element, text);
            }
        });
    }

    typewriterCSS(element, text) {
        let i = 0;
        const timer = setInterval(() => {
            element.textContent = text.slice(0, i + 1);
            i++;
            if (i >= text.length) {
                clearInterval(timer);
            }
        }, 50);
    }

    animateTextReveal() {
        const revealElements = document.querySelectorAll('.text-reveal');
        
        revealElements.forEach(element => {
            if (this.isGSAPLoaded) {
                const chars = element.textContent.split('');
                element.innerHTML = chars.map(char => `<span class="char">${char}</span>`).join('');
                
                gsap.fromTo(element.querySelectorAll('.char'),
                    {
                        opacity: 0,
                        y: 50,
                        rotateX: -90
                    },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: 0.6,
                        stagger: 0.02,
                        ease: "back.out(1.7)",
                        scrollTrigger: {
                            trigger: element,
                            start: "top 80%"
                        }
                    }
                );
            }
        });
    }

    // Page Transition Effects
    initializePageTransitions() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.smoothScrollToSection(targetId);
            });
        });
    }

    smoothScrollToSection(targetId) {
        const target = document.getElementById(targetId);
        if (!target) return;
        
        if (this.isGSAPLoaded) {
            gsap.to(window, {
                duration: 1.2,
                scrollTo: {
                    y: target,
                    offsetY: 80
                },
                ease: "power3.inOut"
            });
        } else {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // Loading Animations
    initializeLoadingAnimations() {
        const loadingElements = document.querySelectorAll('.loading-animation');
        
        loadingElements.forEach(element => {
            this.addToQueue(() => {
                gsap.fromTo(element,
                    {
                        opacity: 0,
                        scale: 0.8,
                        rotation: -10
                    },
                    {
                        opacity: 1,
                        scale: 1,
                        rotation: 0,
                        duration: 0.8,
                        ease: "elastic.out(1, 0.3)"
                    }
                );
            });
        });
    }

    // Button Click Animations
    initializeButtonAnimations() {
        const buttons = document.querySelectorAll('.btn, button');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.createClickRipple(e);
                this.animateButtonClick(button);
            });
        });
    }

    createClickRipple(e) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            pointer-events: none;
            transform: scale(0);
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        if (this.isGSAPLoaded) {
            gsap.to(ripple, {
                scale: 4,
                opacity: 0,
                duration: 0.6,
                ease: "power2.out",
                onComplete: () => ripple.remove()
            });
        } else {
            ripple.style.animation = 'rippleAnimation 0.6s ease-out forwards';
            setTimeout(() => ripple.remove(), 600);
        }
    }

    animateButtonClick(button) {
        this.addToQueue(() => {
            gsap.to(button, {
                scale: 0.95,
                duration: 0.1,
                yoyo: true,
                repeat: 1,
                ease: "power2.inOut"
            });
        });
    }

    // CSS Fallbacks
    initializeCSSFallbacks() {
        this.addCSSAnimations();
        this.setupCSSScrollAnimations();
    }

    addCSSAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes rippleAnimation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            @keyframes glowPulse {
                0%, 100% {
                    filter: drop-shadow(0 0 5px rgba(239, 68, 68, 0.3));
                }
                50% {
                    filter: drop-shadow(0 0 20px rgba(239, 68, 68, 0.8));
                }
            }
            
            .loading-animation {
                animation: fadeInUp 0.8s ease forwards;
            }
            
            .glow-hover:hover {
                animation: glowPulse 1s ease-in-out infinite;
            }
        `;
        document.head.appendChild(style);
    }

    // Performance Optimizations
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Public API
    animateElement(element, animation = 'fadeInUp') {
        if (this.isGSAPLoaded) {
            switch (animation) {
                case 'fadeInUp':
                    gsap.fromTo(element, 
                        { opacity: 0, y: 30 },
                        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
                    );
                    break;
                case 'scaleIn':
                    gsap.fromTo(element,
                        { opacity: 0, scale: 0.8 },
                        { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" }
                    );
                    break;
                case 'slideInLeft':
                    gsap.fromTo(element,
                        { opacity: 0, x: -50 },
                        { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }
                    );
                    break;
                default:
                    gsap.fromTo(element,
                        { opacity: 0 },
                        { opacity: 1, duration: 0.6, ease: "power2.out" }
                    );
            }
        } else {
            element.style.animation = `${animation} 0.6s ease forwards`;
        }
    }

    pauseAllAnimations() {
        if (this.isGSAPLoaded) {
            gsap.globalTimeline.pause();
        }
    }

    resumeAllAnimations() {
        if (this.isGSAPLoaded) {
            gsap.globalTimeline.resume();
        }
    }
}

// Initialize animations
document.addEventListener('DOMContentLoaded', () => {
    const advancedAnimations = new AdvancedAnimations();
    window.AdvancedAnimations = advancedAnimations;
});

// Export for global access
window.AdvancedAnimations = AdvancedAnimations;
