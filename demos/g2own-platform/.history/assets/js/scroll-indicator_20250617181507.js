/**
 * Modern Scroll Indicator Manager
 * Red-themed, text-only scroll indicator that appears after preloader
 */

class ScrollIndicatorManager {
    constructor() {
        this.scrollIndicator = document.getElementById('scroll-indicator');
        this.heroSection = document.getElementById('hero');
        this.isVisible = false;
        this.isInitialized = false;
        this.lastScrollY = 0;
        
        // Wait for page to fully load including preloader
        this.waitForPageLoad();
    }

    waitForPageLoad() {
        const checkAndInit = () => {
            const preloader = document.querySelector('#preloader');
            const isPreloaderDone = !preloader || 
                                   preloader.style.display === 'none' || 
                                   window.getComputedStyle(preloader).display === 'none' ||
                                   window.getComputedStyle(preloader).opacity === '0' ||
                                   preloader.style.opacity === '0';
            
            if (isPreloaderDone && this.scrollIndicator && this.heroSection && !this.isInitialized) {
                // Small delay to ensure everything is fully loaded
                setTimeout(() => {
                    this.init();
                    this.isInitialized = true;
                }, 200);
            } else if (!this.isInitialized) {
                setTimeout(checkAndInit, 100);
            }
        };

        // Start checking
        setTimeout(checkAndInit, 500);
    }

    init() {
        // Mark preloader as complete
        this.scrollIndicator.classList.add('preloader-complete');
        
        // Set initial state based on scroll position
        const scrollY = window.scrollY;
        if (scrollY === 0) {
            this.showIndicator();
        } else {
            this.hideIndicator();
        }
        
        // Optimized scroll event listener with throttling
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        // Add click functionality
        this.addClickToScroll();
        
        console.log('Modern Scroll Indicator initialized');
    }

    handleScroll() {
        if (!this.scrollIndicator || !this.heroSection) return;
        
        const scrollY = window.scrollY;
        const shouldShow = scrollY === 0;
        
        // Only update if state changes
        if (shouldShow && !this.isVisible) {
            this.showIndicator();
        } else if (!shouldShow && this.isVisible) {
            this.hideIndicator();
        }
        
        this.lastScrollY = scrollY;
    }

    showIndicator() {
        if (!this.scrollIndicator || this.isVisible) return;
        
        this.scrollIndicator.classList.remove('hidden');
        this.scrollIndicator.style.display = 'block';
        this.scrollIndicator.style.visibility = 'visible';
        this.scrollIndicator.style.opacity = '1';
        this.scrollIndicator.style.transform = 'translateX(-50%)';
        this.scrollIndicator.style.pointerEvents = 'auto';
        
        this.isVisible = true;
    }

    hideIndicator() {
        if (!this.scrollIndicator || !this.isVisible) return;
        
        this.scrollIndicator.classList.add('hidden');
        this.scrollIndicator.style.opacity = '0';
        this.scrollIndicator.style.visibility = 'hidden';
        this.scrollIndicator.style.transform = 'translateX(-50%) translateY(10px)';
        this.scrollIndicator.style.pointerEvents = 'none';
        
        // Hide completely after transition
        setTimeout(() => {
            if (this.scrollIndicator.classList.contains('hidden')) {
                this.scrollIndicator.style.display = 'none';
            }
        }, 400);
        
        this.isVisible = false;
    }

    addClickToScroll() {
        if (!this.scrollIndicator) return;
        
        this.scrollIndicator.addEventListener('click', () => {
            const nextSection = this.heroSection.nextElementSibling;
            if (nextSection) {
                nextSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
        
        this.scrollIndicator.style.cursor = 'pointer';
    }
}

// Initialize when ready
const initScrollIndicator = () => {
    if (!window.scrollIndicatorManager) {
        window.scrollIndicatorManager = new ScrollIndicatorManager();
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollIndicator);
} else {
    initScrollIndicator();
}
