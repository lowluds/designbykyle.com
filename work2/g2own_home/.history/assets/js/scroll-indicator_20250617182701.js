/**
 * Scroll Indicator Manager
 * Shows indicator only on hero page, hides immediately when user scrolls
 */

class ScrollIndicatorManager {
    constructor() {
        this.scrollIndicator = document.getElementById('scroll-indicator');
        this.heroSection = document.getElementById('hero');
        this.isVisible = true;
        
        if (this.scrollIndicator && this.heroSection) {
            this.init();
        }
    }

    init() {
        // Add scroll event listener
        window.addEventListener('scroll', () => {
            this.handleScroll();
        }, { passive: true });

        // Initial check
        this.handleScroll();
    }    handleScroll() {
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
    }    showIndicator() {
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
