/**
 * G2Own - Consolidated & Optimized JavaScript
 * Replaces multiple redundant JS files for better performance
 */

class G2OwnWebsite {
    constructor() {
        this.resizeTimer = null;
        this.init();
    }

    init() {
        this.setupResponsiveSidebar();
        this.setupCarousel();
        this.setupButtonStyling();
        this.optimizePerformance();
        this.setupAccessibility();
    }

    // Consolidated sidebar functionality
    setupResponsiveSidebar() {
        const enforceButtonStyling = () => {
            // Use more efficient selectors and batch DOM operations
            const buttons = document.querySelectorAll('.nav-gaming-icon, .preview-icon, [data-action]');
            
            // Batch style updates to avoid layout thrashing
            requestAnimationFrame(() => {
                buttons.forEach(button => {
                    if (button.closest('.nav-link') || button.classList.contains('preview-icon')) {
                        const style = button.style;
                        style.setProperty('background', '#000000', 'important');
                        style.setProperty('background-color', '#000000', 'important');
                        style.setProperty('border-color', 'rgba(239, 68, 68, 0.8)', 'important');
                    }
                });
            });
        };

        // Debounced resize handler for better performance
        const handleResize = () => {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(enforceButtonStyling, 100);
        };

        // Use passive event listener for better scroll performance
        window.addEventListener('resize', handleResize, { passive: true });
        
        // Initial setup
        enforceButtonStyling();

        // Watch for sidebar state changes
        this.observeSidebarChanges();
    }

    // Efficient sidebar state observer
    observeSidebarChanges() {
        const sidebar = document.querySelector('.left-sidebar');
        if (sidebar) {
            const observer = new MutationObserver((mutations) => {
                let shouldUpdate = false;
                
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && 
                        (mutation.attributeName === 'class' || mutation.attributeName === 'style')) {
                        shouldUpdate = true;
                    }
                });
                
                if (shouldUpdate) {
                    // Debounce updates
                    clearTimeout(this.observerTimer);
                    this.observerTimer = setTimeout(() => {
                        this.setupButtonStyling();
                    }, 50);
                }
            });
            
            observer.observe(sidebar, {
                attributes: true,
                attributeFilter: ['class', 'style']
            });
            
            this.sidebarObserver = observer;
        }
    }

    // Optimized carousel with performance improvements
    setupCarousel() {
        const cards = document.querySelectorAll('.carousel-card, .modern-card');
        
        // Use event delegation for better performance
        const container = document.querySelector('.carousel-container') || document.body;
        
        container.addEventListener('mouseenter', (e) => {
            if (e.target.classList.contains('carousel-card') || e.target.classList.contains('modern-card')) {
                this.handleCardHover(e);
            }
        }, { passive: true });
        
        container.addEventListener('mouseleave', (e) => {
            if (e.target.classList.contains('carousel-card') || e.target.classList.contains('modern-card')) {
                this.handleCardLeave(e);
            }
        }, { passive: true });
        
        // Touch support for mobile
        container.addEventListener('touchstart', (e) => {
            if (e.target.classList.contains('carousel-card') || e.target.classList.contains('modern-card')) {
                this.handleTouchStart(e);
            }
        }, { passive: true });

        // Make cards clickable (remove Buy Now buttons functionality)
        cards.forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', this.handleCardClick.bind(this), { passive: true });
        });
    }

    handleCardHover(e) {
        // Use CSS classes instead of inline styles for better performance
        e.target.classList.add('card-hover');
    }

    handleCardLeave(e) {
        e.target.classList.remove('card-hover', 'card-touch');
    }

    handleTouchStart(e) {
        e.target.classList.add('card-touch');
        setTimeout(() => {
            e.target.classList.remove('card-touch');
        }, 150);
    }

    handleCardClick(e) {
        // Add click animation
        e.target.classList.add('card-click');
        setTimeout(() => {
            e.target.classList.remove('card-click');
        }, 200);
        
        // You can add navigation logic here
        console.log('Card clicked:', e.target);
    }

    // Consolidated button styling using CSS injection (more efficient)
    setupButtonStyling() {
        // Check if style already exists
        if (document.getElementById('g2own-button-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'g2own-button-styles';
        style.textContent = `
            .preview-icon, 
            .nav-gaming-icon {
                background: #000000 !important;
                background-color: #000000 !important;
                border-color: rgba(239, 68, 68, 0.8) !important;
            }
            
            .card-hover {
                transform: translateY(-10px) scale(1.02) !important;
                box-shadow: 0 20px 40px rgba(239, 68, 68, 0.3) !important;
            }
            
            .card-touch {
                transform: scale(0.95) !important;
            }
            
            .card-click {
                transform: scale(0.98) !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Performance optimizations
    optimizePerformance() {
        // Preload critical images lazily
        this.lazyLoadImages();
        
        // Setup intersection observer for performance
        this.setupIntersectionObserver();
        
        // Remove unused event listeners on page unload
        window.addEventListener('beforeunload', this.cleanup.bind(this));
        
        // Optimize scroll performance
        this.optimizeScrolling();
    }

    // Lazy load images for better performance
    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            images.forEach(img => {
                img.src = img.dataset.src;
                img.classList.remove('lazy');
            });
        }
    }

    // Setup intersection observer for animations
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                }
            });
        }, observerOptions);
        
        // Observe elements that need animation on scroll
        const animatedElements = document.querySelectorAll('.hero-badge, .carousel-card, .preview-icon');
        animatedElements.forEach(el => observer.observe(el));
        
        this.intersectionObserver = observer;
    }

    // Optimize scrolling performance
    optimizeScrolling() {
        let ticking = false;
        
        const updateScroll = () => {
            // Add any scroll-based animations here
            ticking = false;
        };
        
        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(updateScroll);
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    // Accessibility improvements
    setupAccessibility() {
        // Add focus management
        this.setupFocusManagement();
        
        // Add keyboard navigation
        this.setupKeyboardNavigation();
        
        // Respect reduced motion preferences
        this.respectReducedMotion();
    }

    setupFocusManagement() {
        // Ensure proper focus indicators
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        focusableElements.forEach(element => {
            element.addEventListener('focus', () => {
                element.classList.add('has-focus');
            });
            
            element.addEventListener('blur', () => {
                element.classList.remove('has-focus');
            });
        });
    }

    setupKeyboardNavigation() {
        // Add keyboard support for carousel
        document.addEventListener('keydown', (e) => {
            if (e.target.classList.contains('carousel-card')) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleCardClick(e);
                }
            }
        });
    }

    respectReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            document.body.classList.add('reduced-motion');
        }
        
        prefersReducedMotion.addEventListener('change', (e) => {
            if (e.matches) {
                document.body.classList.add('reduced-motion');
            } else {
                document.body.classList.remove('reduced-motion');
            }
        });
    }

    // Cleanup function
    cleanup() {
        // Clean up observers and timers
        if (this.sidebarObserver) {
            this.sidebarObserver.disconnect();
        }
        
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        if (this.resizeTimer) {
            clearTimeout(this.resizeTimer);
        }
        
        if (this.observerTimer) {
            clearTimeout(this.observerTimer);
        }
    }
}

// Utility functions for global use
window.G2OwnUtils = {
    // Debounce function for performance
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function for scroll events
    throttle: (func, limit) => {
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
};

// Initialize when DOM is ready - optimized
const initializeWebsite = () => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new G2OwnWebsite();
        });
    } else {
        new G2OwnWebsite();
    }
};

// Check if we're in a modern browser environment
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    initializeWebsite();
}

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = G2OwnWebsite;
}
