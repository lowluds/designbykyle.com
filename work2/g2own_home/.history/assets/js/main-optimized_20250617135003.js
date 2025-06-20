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
    }    // Header/Navbar functionality
    setupNavbar() {
        // Navbar loading state management
        const navbar = document.getElementById('navbar');
        if (navbar) {
            // Remove loading state immediately
            navbar.classList.remove('navbar-loading');
            navbar.classList.add('navbar-loaded');
            
            // Ensure navbar is visible
            navbar.style.opacity = '1';
            navbar.style.visibility = 'visible';
            navbar.style.display = 'flex';
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
                if (targetSection) {
                    const targetElement = document.getElementById(targetSection);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });

        // Mobile menu toggle
        const mobileToggle = document.getElementById('nav-mobile-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (mobileToggle && navMenu) {
            mobileToggle.addEventListener('click', () => {
                const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
                mobileToggle.setAttribute('aria-expanded', !isExpanded);
                navMenu.classList.toggle('mobile-active');
            });
        }
    }

    // Sidebar functionality
    setupSidebar() {
        const sidebar = document.getElementById('left-sidebar');
        const sidebarToggle = document.getElementById('sidebar-toggle');
        
        if (sidebar && sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
            });
        }

        // Auth button functionality
        const authButton = document.getElementById('btn-auth-combined');
        if (authButton) {
            authButton.addEventListener('click', () => {
                // Open auth modal (if exists)
                const authModal = document.getElementById('auth-modal');
                if (authModal) {
                    authModal.style.display = 'flex';
                    authModal.setAttribute('aria-hidden', 'false');
                    document.body.style.overflow = 'hidden';
                }
            });
        }

        // Social auth buttons
        const socialButtons = document.querySelectorAll('.social-btn');
        socialButtons.forEach(button => {
            button.addEventListener('click', () => {
                const provider = button.getAttribute('data-provider');
                console.log(`Social login with ${provider}`);
                
                // Add click feedback
                button.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    button.style.transform = '';
                }, 150);
            });
        });

        // Sidebar navigation links
        const sidebarNavLinks = document.querySelectorAll('.sidebar-nav .nav-link');
        sidebarNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Remove active from all sidebar links
                sidebarNavLinks.forEach(l => l.classList.remove('active'));
                
                // Add active to clicked link
                link.classList.add('active');
                
                // Handle external links
                if (link.hasAttribute('target')) {
                    return; // Let the default behavior handle external links
                }
                
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
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
