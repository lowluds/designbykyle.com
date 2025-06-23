/* Apple-Inspired Simple Navigation */

document.addEventListener('DOMContentLoaded', function() {
    
    // Clean navigation system
    const navLinks = document.querySelectorAll('#nav a[href^="#"]');
    const sections = document.querySelectorAll('.panel');
    const body = document.body;
    
    // Initialize - show only home section
    showSection('home');
    
    // Navigation click handlers
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            
            // Update active state
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section
            showSection(targetId);
            
            // Update URL without scrolling
            history.pushState(null, null, `#${targetId}`);
        });
    });
    
    // Function to show specific section
    function showSection(sectionId) {
        if (sectionId === 'home') {
            // Show hero section, hide others
            body.classList.remove('section-active');
            sections.forEach(section => {
                if (section.id === 'home') {
                    section.style.display = 'flex';
                } else {
                    section.style.display = 'none';
                }
            });
        } else {
            // Show other sections, hide hero
            body.classList.add('section-active');
            sections.forEach(section => {
                if (section.id === sectionId) {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });
        }
        
        // Update page title
        updatePageTitle(sectionId);
    }
    
    // Update page title based on section
    function updatePageTitle(sectionId) {
        const titles = {
            'home': 'Kyle L. - Full-Stack Web Developer',
            'about': 'Services - Kyle L.',
            'work': 'Portfolio - Kyle L.',
            'testimonials': 'Testimonials - Kyle L.',
            'contact': 'Contact - Kyle L.'
        };
        
        document.title = titles[sectionId] || titles.home;
    }
    
    // Handle browser back/forward
    window.addEventListener('popstate', function() {
        const hash = window.location.hash.substring(1) || 'home';
        showSection(hash);
        
        // Update active nav state
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${hash}`) {
                link.classList.add('active');
            }
        });
    });
    
    // Set initial active state
    const currentHash = window.location.hash.substring(1) || 'home';
    navLinks.forEach(link => {
        if (link.getAttribute('href') === `#${currentHash}`) {
            link.classList.add('active');
        }
    });
    
    // Smooth button interactions
    const buttons = document.querySelectorAll('.cta-button');
    buttons.forEach(button => {
        button.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(0) scale(0.98)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-2px) scale(1)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add scroll-based nav transparency (optional enhancement)
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', function() {
        const nav = document.getElementById('nav');
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            // Scrolling down - hide nav
            nav.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up - show nav
            nav.style.transform = 'translateY(0)';
        }
        
        lastScrollY = currentScrollY;
    });
    
    // Keyboard navigation support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Return to home on escape
            showSection('home');
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#home') {
                    link.classList.add('active');
                }
            });
            history.pushState(null, null, '#home');
        }
    });
    
    // Simple stats counter animation
    function animateStats() {
        const stats = document.querySelectorAll('.stat-number');
        stats.forEach(stat => {
            const finalText = stat.textContent;
            const number = parseInt(finalText.replace(/\D/g, ''));
            const suffix = finalText.replace(/\d/g, '');
            
            if (!isNaN(number) && number > 0) {
                let current = 0;
                const increment = number / 30;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= number) {
                        current = number;
                        clearInterval(timer);
                    }
                    stat.textContent = Math.floor(current) + suffix;
                }, 50);
            }
        });
    }
    
    // Run stats animation after a delay
    setTimeout(animateStats, 1000);
    
    // Performance optimization - disable animations on low-end devices
    if ('connection' in navigator && navigator.connection.saveData) {
        document.body.classList.add('reduce-motion');
    }
    
});

// Utility functions
window.simpleFolio = {
    // Public API for external use
    showSection: function(sectionId) {
        const event = new CustomEvent('section-change', { detail: { sectionId } });
        document.dispatchEvent(event);
    },
    
    // Analytics helper
    trackEvent: function(eventName, data = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, data);
        }
        console.log('Event:', eventName, data);
    }
};
