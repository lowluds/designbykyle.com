/**
 * Scroll Indicator Manager
 * Handles the visibility of the scroll indicator based on scroll position
 */

class ScrollIndicatorManager {
    constructor() {
        this.scrollIndicator = document.getElementById('scroll-indicator');
        this.heroSection = document.getElementById('hero');
        this.isVisible = true;
        this.scrollThreshold = 0.8; // Hide when 80% of hero is scrolled
        
        if (this.scrollIndicator && this.heroSection) {
            this.init();
        }
    }

    init() {
        // Add scroll event listener with throttling for performance
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

        // Initial check
        this.handleScroll();
    }

    handleScroll() {
        const scrollY = window.scrollY;
        const heroHeight = this.heroSection.offsetHeight;
        const windowHeight = window.innerHeight;
        
        // Calculate how much of the hero section has been scrolled
        const heroScrollProgress = scrollY / (heroHeight - windowHeight);
        
        // Show indicator when at top, hide when scrolled past threshold
        const shouldShow = heroScrollProgress < this.scrollThreshold;
        
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

    // Optional: Add click functionality to scroll to next section
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
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const scrollManager = new ScrollIndicatorManager();
    scrollManager.addClickToScroll(); // Enable click-to-scroll functionality
});

// Also initialize if script loads after DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ScrollIndicatorManager().addClickToScroll();
    });
} else {
    new ScrollIndicatorManager().addClickToScroll();
}
