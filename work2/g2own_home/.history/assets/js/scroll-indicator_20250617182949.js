/**
 * Scroll Indicator Manager
 * Shows indicator only after preloader completes and on hero page
 */

class ScrollIndicatorManager {
    constructor() {
        this.scrollIndicator = document.getElementById('scroll-indicator');
        this.heroSection = document.getElementById('hero');
        this.isVisible = false;
        this.preloaderComplete = false;
        
        if (this.scrollIndicator && this.heroSection) {
            // Hide indicator initially during preloader
            this.scrollIndicator.classList.add('hidden');
            this.waitForPreloader();
        }
    }

    waitForPreloader() {
        const checkPreloader = () => {
            const preloader = document.querySelector('#preloader');
            const isPreloaderDone = !preloader || 
                                   preloader.style.display === 'none' || 
                                   window.getComputedStyle(preloader).display === 'none' ||
                                   window.getComputedStyle(preloader).opacity === '0' ||
                                   preloader.style.opacity === '0';
            
            if (isPreloaderDone && !this.preloaderComplete) {
                // Small delay to ensure preloader is fully gone
                setTimeout(() => {
                    this.preloaderComplete = true;
                    this.init();
                }, 300);
            } else if (!this.preloaderComplete) {
                setTimeout(checkPreloader, 100);
            }
        };

        // Start checking after a brief delay
        setTimeout(checkPreloader, 500);
    }

    init() {
        console.log('Preloader complete, initializing scroll indicator');
        
        // Add scroll event listener
        window.addEventListener('scroll', () => {
            this.handleScroll();
        }, { passive: true });

        // Initial check
        this.handleScroll();
    }    handleScroll() {
        // Don't show indicator if preloader hasn't completed
        if (!this.preloaderComplete) {
            return;
        }
        
        const scrollY = window.scrollY;
        
        // Debug logging
        console.log('Scroll detected:', scrollY, 'Current visibility:', this.isVisible);
        
        // Hide immediately when user scrolls, show only when at top
        const shouldShow = scrollY === 0;
        
        console.log('Should show indicator:', shouldShow);
        
        if (shouldShow && !this.isVisible) {
            console.log('Showing indicator');
            this.showIndicator();
        } else if (!shouldShow && this.isVisible) {
            console.log('Hiding indicator');
            this.hideIndicator();
        }
    }showIndicator() {
        console.log('Executing showIndicator');
        this.scrollIndicator.classList.remove('hidden');
        this.isVisible = true;
        console.log('Indicator classes after show:', this.scrollIndicator.className);
    }

    hideIndicator() {
        console.log('Executing hideIndicator');
        this.scrollIndicator.classList.add('hidden');
        this.isVisible = false;
        console.log('Indicator classes after hide:', this.scrollIndicator.className);
    }

    // Add click functionality to scroll to next section
    addClickToScroll() {
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const scrollManager = new ScrollIndicatorManager();
    scrollManager.addClickToScroll();
});
