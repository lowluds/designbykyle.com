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
    }

    handleScroll() {
        const scrollY = window.scrollY;
        
        // Hide immediately when user scrolls, show only when at top
        const shouldShow = scrollY === 0;
        
        if (shouldShow && !this.isVisible) {
            this.showIndicator();
        } else if (!shouldShow && this.isVisible) {
            this.hideIndicator();
        }
    }

    showIndicator() {
        this.scrollIndicator.classList.remove('hidden');
        this.isVisible = true;
    }

    hideIndicator() {
        this.scrollIndicator.classList.add('hidden');
        this.isVisible = false;
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
