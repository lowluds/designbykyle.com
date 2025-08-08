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
        this.isInitialized = false;
        
        // Wait for page to fully load including preloader
        this.waitForPageLoad();
    }    waitForPageLoad() {
        // Wait for preloader to complete and all content to load
        const checkAndInit = () => {
            const preloader = document.querySelector('#preloader');
            const isPreloaderDone = !preloader || 
                                   preloader.style.display === 'none' || 
                                   window.getComputedStyle(preloader).display === 'none' ||
                                   window.getComputedStyle(preloader).opacity === '0' ||
                                   preloader.style.opacity === '0';
            
            if (isPreloaderDone && this.scrollIndicator && this.heroSection && !this.isInitialized) {
                // Add a small delay to ensure everything is fully loaded
                setTimeout(() => {
                    this.init();
                    this.isInitialized = true;
                }, 300);
            } else if (!this.isInitialized) {
                setTimeout(checkAndInit, 200);
            }
        };

        // Start checking after the initial scripts load
        setTimeout(checkAndInit, 1000);
    }    init() {
        // Mark preloader as complete and enable scroll indicator
        this.scrollIndicator.classList.add('preloader-complete');
        
        // Force visibility and proper styling initially (only if at top)
        const scrollY = window.scrollY;
        if (scrollY === 0) {
            this.forceVisibility();
            this.isVisible = true;
        } else {
            this.hideIndicator();
            this.isVisible = false;
        }
        
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

        // Override any other scripts that might hide the scroll indicator
        this.overrideOtherControllers();
        
        console.log('Scroll Indicator Manager initialized after preloader - will show only when at top of hero section');
    }    forceVisibility() {
        if (!this.scrollIndicator) return;
        
        // Only force visibility if preloader is complete
        if (!this.scrollIndicator.classList.contains('preloader-complete')) {
            return;
        }
        
        // Apply styles directly to ensure visibility
        this.scrollIndicator.style.display = 'block';
        this.scrollIndicator.style.visibility = 'visible';
        this.scrollIndicator.style.opacity = '1';
        this.scrollIndicator.style.position = 'fixed';
        this.scrollIndicator.style.bottom = '1.5rem';
        this.scrollIndicator.style.left = '50%';
        this.scrollIndicator.style.transform = 'translateX(-50%)';
        this.scrollIndicator.style.zIndex = '99999';
        this.scrollIndicator.style.pointerEvents = 'auto';
        
        // Remove any hidden class
        this.scrollIndicator.classList.remove('hidden');
    }    overrideOtherControllers() {
        // Check every 500ms to ensure no other script is interfering
        // but only after preloader is complete
        setInterval(() => {
            if (!this.scrollIndicator || !this.scrollIndicator.classList.contains('preloader-complete')) return;
            
            const scrollY = window.scrollY;
            const shouldBeVisible = scrollY === 0;
            
            // If we're at the top but indicator is hidden by another script, show it
            if (shouldBeVisible && !this.isVisible) {
                const computedStyle = window.getComputedStyle(this.scrollIndicator);
                if (computedStyle.opacity === '0' || computedStyle.visibility === 'hidden') {
                    this.forceVisibility();
                    this.isVisible = true;
                }
            }
            
            // If we're scrolled but indicator is visible, hide it
            if (!shouldBeVisible && this.isVisible) {
                this.hideIndicator();
            }
        }, 500);
    }    handleScroll() {
        if (!this.scrollIndicator || !this.heroSection) return;
        
        const scrollY = window.scrollY;
        const heroHeight = this.heroSection.offsetHeight;
        
        // Debug logging
        console.log('Scroll detected:', scrollY, 'Hero height:', heroHeight);
        
        // Hide immediately when user starts scrolling (scrollY > 0)
        // Show only when at the very top (scrollY === 0) and in hero section
        const isAtTop = scrollY === 0;
        const isInHeroSection = scrollY < heroHeight;
        
        // Should show only when at the very top of the page
        const shouldShow = isAtTop && isInHeroSection;
        
        console.log('Should show indicator:', shouldShow, 'Current visibility:', this.isVisible);
        
        if (shouldShow && !this.isVisible) {
            console.log('Showing scroll indicator');
            this.showIndicator();
        } else if (!shouldShow && this.isVisible) {
            console.log('Hiding scroll indicator');
            this.hideIndicator();
        }
    }

    showIndicator() {
        if (!this.scrollIndicator) return;
        
        this.scrollIndicator.classList.remove('hidden');
        this.scrollIndicator.style.opacity = '1';
        this.scrollIndicator.style.visibility = 'visible';
        this.scrollIndicator.style.transform = 'translateX(-50%)';
        this.scrollIndicator.style.pointerEvents = 'auto';
        this.isVisible = true;
    }    hideIndicator() {
        if (!this.scrollIndicator) return;
        
        console.log('Executing hideIndicator');
        
        // Add hidden class
        this.scrollIndicator.classList.add('hidden');
        
        // Force hide with direct styles - very aggressive
        this.scrollIndicator.style.opacity = '0';
        this.scrollIndicator.style.visibility = 'hidden';
        this.scrollIndicator.style.display = 'none';
        this.scrollIndicator.style.transform = 'translateX(-50%) translateY(20px)';
        this.scrollIndicator.style.pointerEvents = 'none';
        
        this.isVisible = false;
        
        console.log('Scroll indicator hidden - opacity:', this.scrollIndicator.style.opacity);
    }

    // Optional: Add click functionality to scroll to next section
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
        
        // Add hover effect
        this.scrollIndicator.style.cursor = 'pointer';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.scrollIndicatorManager = new ScrollIndicatorManager();
    window.scrollIndicatorManager.addClickToScroll();
});

// Also handle if script loads after DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.scrollIndicatorManager) {
            window.scrollIndicatorManager = new ScrollIndicatorManager();
            window.scrollIndicatorManager.addClickToScroll();
        }
    });
} else {
    if (!window.scrollIndicatorManager) {
        window.scrollIndicatorManager = new ScrollIndicatorManager();
        window.scrollIndicatorManager.addClickToScroll();
    }
}
