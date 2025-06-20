/**
 * Scroll Indicator Manager
 * Shows indicator only after preloader completes and on hero page
 * Also manages hover-to-navigate visibility
 */

class ScrollIndicatorManager {    constructor() {
        this.scrollIndicator = document.getElementById('scroll-indicator');
        this.hoverToNavigate = document.getElementById('hover-to-navigate');
        this.heroSection = document.getElementById('hero');
        this.isVisible = false;
        this.preloaderComplete = false;
        
        // Ensure both elements start completely hidden during preloader
        if (this.scrollIndicator) {
            this.scrollIndicator.classList.add('hidden');
            this.scrollIndicator.classList.remove('preloader-complete');
        }
        
        if (this.hoverToNavigate) {
            this.hoverToNavigate.classList.add('hidden');
            this.hoverToNavigate.classList.remove('preloader-complete');
        }
        
        if (this.scrollIndicator && this.heroSection) {
            this.waitForPreloader();
        }
    }waitForPreloader() {
        const checkPreloader = () => {
            const preloader = document.querySelector('#preloader');
            const isPreloaderDone = !preloader || 
                                   preloader.style.display === 'none' || 
                                   window.getComputedStyle(preloader).display === 'none' ||
                                   window.getComputedStyle(preloader).opacity === '0' ||
                                   preloader.style.opacity === '0';            if (isPreloaderDone && !this.preloaderComplete) {
                // Longer delay to ensure preloader is completely gone
                setTimeout(() => {
                    this.preloaderComplete = true;
                    
                    // Add preloader-complete class to scroll indicator
                    if (this.scrollIndicator) {
                        this.scrollIndicator.classList.add('preloader-complete');
                    }
                    
                    // Add preloader-complete class to hover-to-navigate and remove hidden
                    if (this.hoverToNavigate) {
                        this.hoverToNavigate.classList.add('preloader-complete');
                        this.hoverToNavigate.classList.remove('hidden');
                    }
                    
                    this.init();
                    console.log('Preloader fully complete, scroll indicator and hover-to-navigate ready');
                }, 800); // Increased delay
            } else if (!this.preloaderComplete) {
                setTimeout(checkPreloader, 100);
            }
        };

        // Start checking after a delay
        setTimeout(checkPreloader, 1000);
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
            console.log('Showing indicator and hover-to-navigate');
            this.showIndicator();
        } else if (!shouldShow && this.isVisible) {
            console.log('Hiding indicator and hover-to-navigate');
            this.hideIndicator();
        }
    }    showIndicator() {
        console.log('Executing showIndicator');
        this.scrollIndicator.classList.remove('hidden');
        
        // Also show hover-to-navigate when at top
        if (this.hoverToNavigate) {
            this.hoverToNavigate.classList.remove('hidden');
            console.log('Showing hover-to-navigate');
        }
        
        this.isVisible = true;
        console.log('Indicator classes after show:', this.scrollIndicator.className);
    }

    hideIndicator() {
        console.log('Executing hideIndicator');
        this.scrollIndicator.classList.add('hidden');
        
        // Also hide hover-to-navigate when scrolling
        if (this.hoverToNavigate) {
            this.hoverToNavigate.classList.add('hidden');
            console.log('Hiding hover-to-navigate');
        }
        
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
