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
        this.setupNavbar();
        this.setupFooter();
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

    // Header/Navbar functionality
    setupNavbar() {
        // Navbar loading state management
        const navbar = document.getElementById('navbar');
        if (navbar) {
            // Remove loading state
            navbar.classList.remove('navbar-loading');
            navbar.classList.add('navbar-loaded');
        }

        // Search functionality
        const searchToggle = document.getElementById('search-toggle');
        const searchDropdown = document.getElementById('search-dropdown');
        const searchInput = document.getElementById('search-input');

        if (searchToggle && searchDropdown) {
            searchToggle.addEventListener('click', () => {
                searchDropdown.classList.toggle('active');
                if (searchDropdown.classList.contains('active') && searchInput) {
                    searchInput.focus();
                }
            });

            // Close search on outside click
            document.addEventListener('click', (e) => {
                if (!searchToggle.contains(e.target) && !searchDropdown.contains(e.target)) {
                    searchDropdown.classList.remove('active');
                }
            });
        }

        // Navigation link active states
        const navLinks = document.querySelectorAll('.nav-center .nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active from all links
                navLinks.forEach(l => l.classList.remove('active'));
                
                // Add active to clicked link
                link.classList.add('active');
                
                // Smooth scroll to section
                const targetSection = link.getAttribute('data-section');
                const targetElement = document.getElementById(targetSection);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    // Footer functionality
    setupFooter() {
        // Newsletter form
        const newsletterForm = document.querySelector('.footer-newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = newsletterForm.querySelector('input[type="email"]').value;
                if (email) {
                    console.log('Newsletter subscription for:', email);
                    // Add success feedback
                    const button = newsletterForm.querySelector('button');
                    const originalText = button.textContent;
                    button.textContent = 'Subscribed!';
                    button.style.background = '#22c55e';
                    
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.style.background = '';
                        newsletterForm.reset();
                    }, 2000);
                }
            });
        }

        // Social links hover effects
        const socialLinks = document.querySelectorAll('.footer-social a');
        socialLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                link.style.transform = 'translateY(-2px) scale(1.05)';
            });
            
            link.addEventListener('mouseleave', () => {
                link.style.transform = '';
            });
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
