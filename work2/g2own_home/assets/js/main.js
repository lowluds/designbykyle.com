// G2Own Main JavaScript - Core Functionality

class G2OwnWebsite {
    constructor() {
        this.analytics = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeScrollAnimations();
        this.initializeNavigation();
        this.initializeAnimations();
        this.initializeParticles();
        this.initializeAnalytics();
        console.log('G2Own Website initialized');
    }

    // Initialize analytics integration
    initializeAnalytics() {
        // Wait for analytics to be available
        const checkAnalytics = () => {
            if (window.G2ownAnalytics) {
                this.analytics = window.G2ownAnalytics;
                this.setupAnalyticsTracking();
                console.log('Analytics integration initialized');
            } else {
                setTimeout(checkAnalytics, 100);
            }
        };
        checkAnalytics();
    }

    setupAnalyticsTracking() {
        if (!this.analytics) return;

        // Track initial page load
        this.analytics.trackPageView();

        // Track category interactions
        this.setupCategoryTracking();
        
        // Track navigation events
        this.setupNavigationTracking();
        
        // Track scroll engagement
        this.setupScrollTracking();
    }

    setupCategoryTracking() {
        if (!this.analytics) return;

        // Track category card clicks
        document.addEventListener('click', (e) => {
            const categoryCard = e.target.closest('.category-card, .game-category-card');
            if (categoryCard) {
                const categoryName = categoryCard.querySelector('h3, .category-title')?.textContent || 'Unknown';
                const categoryType = categoryCard.dataset.category || 'general';
                
                this.analytics.trackCategoryClick(categoryName, categoryType);
            }
        });
    }

    setupNavigationTracking() {
        if (!this.analytics) return;

        // Track all navigation clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href) {
                // Determine source context
                let source = 'unknown';
                if (link.closest('.navbar')) source = 'navbar';
                else if (link.closest('.sidebar')) source = 'sidebar';
                else if (link.closest('.footer')) source = 'footer';
                else if (link.closest('.hero')) source = 'hero';
                else source = 'content';

                this.analytics.trackNavigation(link.href, source);
            }
        });
    }

    setupScrollTracking() {
        if (!this.analytics) return;

        let scrollDepthMarkers = [25, 50, 75, 90];
        let trackedDepths = new Set();

        const trackScrollDepth = () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );

            scrollDepthMarkers.forEach(marker => {
                if (scrollPercent >= marker && !trackedDepths.has(marker)) {
                    trackedDepths.add(marker);
                    this.analytics.trackEvent('scroll_depth', {
                        depth_percentage: marker,
                        page_section: this.analytics.getCurrentSection()
                    });
                }
            });
        };

        window.addEventListener('scroll', this.throttle(trackScrollDepth, 500));
    }

    // Core functionality continues...

    setupEventListeners() {
        // DOM Content Loaded
        document.addEventListener('DOMContentLoaded', () => {
            this.onDOMReady();
        });

        // Window Load
        window.addEventListener('load', () => {
            this.onWindowLoad();
        });

        // Window Resize
        window.addEventListener('resize', this.debounce(() => {
            this.onWindowResize();
        }, 250));

        // Window Scroll
        window.addEventListener('scroll', this.throttle(() => {
            this.onWindowScroll();
        }, 16));
    }    onDOMReady() {
        // Initialize components that need DOM to be ready
        this.initializeMobileMenu();
        this.initializeSearchFunctionality();
        this.addLoadingClass();
        this.initializeScrollAnimations();
    }

    onWindowLoad() {
        // Remove loading states and initialize heavy components
        this.removeLoadingClass();
        this.initializeHeavyAnimations();
        this.initializeIntersectionObserver();
    }

    onWindowResize() {
        // Handle responsive behavior
        this.updateCarouselDimensions();
        this.updateParticleCount();
    }

    onWindowScroll() {
        // Handle scroll-based animations
        this.updateNavbarOnScroll();
        this.updateScrollProgress();
    }

    // Navigation functionality
    initializeNavigation() {
        const navbar = document.getElementById('navbar');
        const navLinks = document.querySelectorAll('.nav-link');
        
        // Add active class to current section
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    const targetId = link.getAttribute('href').substring(1);
                    this.smoothScrollTo(targetId);
                    this.setActiveNavLink(link);
                }
            });
        });        // Legacy navbar functionality disabled - using NavbarController instead
        // this.updateNavbarOnScroll();
    }

    updateNavbarOnScroll() {
        // Legacy function - disabled to prevent conflicts with NavbarController
        /*
        const navbar = document.getElementById('navbar');
        const scrollY = window.scrollY;
        
        if (scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Update active nav link based on current section
        this.updateActiveNavLink();
        */
    }

    updateActiveNavLink() {
        // Legacy function - disabled to prevent conflicts with NavbarController
        /*
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        
        let currentSection = '';
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom >= 100) {
                currentSection = section.id;
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }        });
        */
    }

    setActiveNavLink(activeLink) {
        // Legacy function - disabled to prevent conflicts with NavbarController
        /*
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
        */
    }

    smoothScrollTo(targetId) {
        const target = document.getElementById(targetId);
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for navbar height
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'            });
        }
    }

    // Mobile menu functionality - disabled to prevent conflicts with NavbarController
    initializeMobileMenu() {
        // Legacy function - disabled
        /*
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                this.toggleMobileMenu();
            });

            // Close mobile menu when clicking on links
            const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
            mobileNavLinks.forEach(link => {
                link.addEventListener('click', () => {
                    this.closeMobileMenu();
                });
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                    this.closeMobileMenu();
                }
            });
        }
        */
    }

    toggleMobileMenu() {
        // Legacy function - disabled
        /*
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        mobileMenuBtn.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        
        // Toggle body scroll lock
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        */
    }

    closeMobileMenu() {
        // Legacy function - disabled
        /*        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        mobileMenuBtn.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
        */
    }

    // Scroll animations
    initializeScrollAnimations() {
        // Add fade-in classes to elements that should animate on scroll
        const animateElements = document.querySelectorAll('.animate-fade-in, .slide-in-up, .scale-in');
        
        animateElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
        });
    }

    initializeIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements for scroll animations
        const elementsToObserve = document.querySelectorAll(
            '.animate-fade-in, .slide-in-up, .scale-in, .category-card, .game-card'
        );
        
        elementsToObserve.forEach(element => {
            observer.observe(element);
        });
    }

    animateElement(element) {
        element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
        
        // Add additional classes for enhanced animations
        if (element.classList.contains('category-card')) {
            setTimeout(() => {
                element.classList.add('animate-in');
            }, 100);
        }
    }

    // Animation initialization
    initializeAnimations() {
        // Add hover effects to interactive elements
        this.addHoverEffects();
        this.initializeTextAnimations();
        this.initializeButtonAnimations();
    }

    addHoverEffects() {
        // Magnetic effect for buttons
        const magneticElements = document.querySelectorAll('.btn, .game-card, .category-card');
        
        magneticElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.addMagneticEffect(e.target);
            });
            
            element.addEventListener('mouseleave', (e) => {
                this.removeMagneticEffect(e.target);
            });
        });
    }

    addMagneticEffect(element) {
        element.style.transition = 'transform 0.3s ease';
        element.addEventListener('mousemove', this.handleMagneticMove);
    }

    removeMagneticEffect(element) {
        element.removeEventListener('mousemove', this.handleMagneticMove);
        element.style.transform = 'translateX(0) translateY(0)';
    }

    handleMagneticMove(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = (e.clientX - centerX) * 0.1;
        const deltaY = (e.clientY - centerY) * 0.1;
        
        e.currentTarget.style.transform = `translateX(${deltaX}px) translateY(${deltaY}px)`;
    }

    initializeTextAnimations() {
        // Animate text elements on load
        const heroTitle = document.querySelector('#hero h1');
        if (heroTitle) {
            setTimeout(() => {
                heroTitle.classList.add('text-glow');
            }, 500);
        }
    }

    initializeButtonAnimations() {
        // Add ripple effect to buttons
        const buttons = document.querySelectorAll('.btn, button');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.createRippleEffect(e);
            });
        });
    }

    createRippleEffect(e) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        // Add ripple styles
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.3)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.pointerEvents = 'none';
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Search functionality
    initializeSearchFunctionality() {
        const searchInputs = document.querySelectorAll('input[type="search"], .search-input');
        
        searchInputs.forEach(input => {
            input.addEventListener('input', this.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        });
    }

    handleSearch(query) {
        console.log('Searching for:', query);
        // Implement search logic here
        // This would typically involve API calls or filtering existing data
    }

    // Particles initialization
    initializeParticles() {
        // This will be called from particles-config.js
        // Just ensure the canvas is ready
        const canvas = document.getElementById('particles-canvas');
        if (canvas) {
            canvas.style.opacity = '0';
            setTimeout(() => {
                canvas.style.transition = 'opacity 2s ease';
                canvas.style.opacity = '1';
            }, 1000);
        }
    }

    // Heavy animations for after page load
    initializeHeavyAnimations() {
        // Add floating animations to background elements
        this.addFloatingAnimations();
        this.initializeParallaxEffects();
    }

    addFloatingAnimations() {
        const floatingElements = document.querySelectorAll('.bg-red-900\\/10, .bg-white\\/5, .bg-red-500\\/10');
        
        floatingElements.forEach((element, index) => {
            element.style.animation = `float ${3 + index}s ease-in-out infinite`;
            element.style.animationDelay = `${index * 0.5}s`;
        });
    }

    initializeParallaxEffects() {
        window.addEventListener('scroll', this.throttle(() => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.bg-red-900\\/10, .bg-white\\/5');
            
            parallaxElements.forEach((element, index) => {
                const speed = 0.5 + (index * 0.1);
                element.style.transform = `translateY(${scrolled * speed}px)`;
            });
        }, 16));
    }

    // Carousel functionality (will be enhanced by carousel.js)
    initializeCarousel() {
        // Basic carousel setup - detailed implementation in carousel.js
        const track = document.getElementById('carousel-track');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        if (track && prevBtn && nextBtn) {
            console.log('Carousel elements found, initializing...');
            // Carousel logic will be handled by carousel.js
        }
    }

    updateCarouselDimensions() {
        // Handle responsive carousel updates
        const carousel = document.getElementById('game-carousel');
        if (carousel) {
            // Update dimensions based on screen size
        }
    }

    updateParticleCount() {
        // Adjust particle count based on screen size for performance
        const isMobile = window.innerWidth < 768;
        if (window.pJSDom && window.pJSDom[0]) {
            const particleCount = isMobile ? 30 : 80;
            window.pJSDom[0].pJS.particles.number.value = particleCount;
        }
    }

    // Loading states
    addLoadingClass() {
        document.body.classList.add('loading');
    }

    removeLoadingClass() {
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
    }

    updateScrollProgress() {
        const scrollTop = document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;
        
        // Update any scroll progress indicators
        const progressBars = document.querySelectorAll('.scroll-progress');
        progressBars.forEach(bar => {
            bar.style.width = scrollPercent + '%';
        });
    }

    // Utility functions
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

    // Public API methods
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    addToCart(productId) {
        console.log('Adding to cart:', productId);
        // Implement cart functionality
        this.showNotification('Product added to cart!', 'success');
    }

    showNotification(message, type = 'info') {
        // Create and show notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '0.5rem',
            color: 'white',
            background: type === 'success' ? '#22c55e' : '#ef4444',
            zIndex: '9999',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// Initialize the website
const g2ownWebsite = new G2OwnWebsite();

// Add ripple animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .loading {
        overflow: hidden;
    }
    
    .loaded {
        overflow-x: hidden;
    }
    
    .notification {
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    }
`;
document.head.appendChild(style);

// Export for use in other modules
window.G2OwnWebsite = g2ownWebsite;
