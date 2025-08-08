/**
 * G2Own - Critical Consolidated JavaScript
 * Essential functionality for sidebar, buttons, and interactions
 */

class G2OwnWebsite {
    constructor() {
        this.init();
    }

    init() {
        this.setupResponsiveSidebar();
        this.setupCarousel();
        this.setupButtonStyling();
        console.log('G2Own optimized systems loaded');
    }

    // Critical sidebar functionality
    setupResponsiveSidebar() {
        const enforceButtonStyling = () => {
            const buttons = document.querySelectorAll('.nav-gaming-icon, .preview-icon, [data-action]');
            
            buttons.forEach(button => {
                if (button.closest('.nav-link') || button.classList.contains('preview-icon')) {
                    const style = button.style;
                    style.setProperty('background', '#000000', 'important');
                    style.setProperty('background-color', '#000000', 'important');
                    style.setProperty('border-color', 'rgba(239, 68, 68, 0.8)', 'important');
                }
            });
        };

        // Apply styling on load and resize
        document.addEventListener('DOMContentLoaded', enforceButtonStyling);
        window.addEventListener('resize', enforceButtonStyling);
        
        // Apply immediately if DOM is already loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', enforceButtonStyling);
        } else {
            enforceButtonStyling();
        }
    }

    // Basic carousel functionality
    setupCarousel() {
        const cards = document.querySelectorAll('.carousel-card');
        
        cards.forEach(card => {
            card.addEventListener('click', function(e) {
                // Make cards clickable
                console.log('Card clicked:', this);
                
                // Add click effect
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });
        });
    }

    // Button styling enforcement
    setupButtonStyling() {
        // Ensure consistent button styling
        const styleObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    this.enforceButtonStyles();
                }
            });
        });

        // Observe DOM changes
        styleObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Initial styling
        this.enforceButtonStyles();
    }

    enforceButtonStyles() {
        const buttons = document.querySelectorAll('.nav-gaming-icon, .preview-icon');
        
        buttons.forEach(button => {
            button.style.setProperty('background', '#000000', 'important');
            button.style.setProperty('background-color', '#000000', 'important');
            button.style.setProperty('border-color', 'rgba(239, 68, 68, 0.8)', 'important');
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.g2ownSite = new G2OwnWebsite();
});

// Fallback initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.g2ownSite) {
            window.g2ownSite = new G2OwnWebsite();
        }
    });
} else {
    window.g2ownSite = new G2OwnWebsite();
}
