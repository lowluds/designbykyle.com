/* Clean Apple-Inspired Navigation System */

document.addEventListener('DOMContentLoaded', function() {
    // Get all navigation elements
    const navLinks = document.querySelectorAll('#nav a[href^="#"]');
    const sections = document.querySelectorAll('.panel');
    const body = document.body;
    
    // Initialize - show home section only
    initializeSection();
    
    // Add click handlers to navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            console.log('Navigating to:', targetId); // Debug log
            
            // Show the target section
            showSection(targetId);
            
            // Update active navigation state
            updateActiveNav(targetId);
            
            // Update browser URL
            history.pushState(null, null, `#${targetId}`);
        });
    });
    
    function initializeSection() {
        console.log('Initializing sections...'); // Debug log
        const hash = window.location.hash.substring(1) || 'home';
        showSection(hash);
        updateActiveNav(hash);
    }
    
    function showSection(sectionId) {
        console.log('Showing section:', sectionId); // Debug log
        
        if (sectionId === 'home') {
            // Show home page (hero section)
            body.classList.remove('section-active');
            sections.forEach(section => {
                if (section.id === 'home') {
                    section.style.display = 'flex';
                    section.style.visibility = 'visible';
                    section.style.opacity = '1';
                } else {
                    section.style.display = 'none';
                    section.style.visibility = 'hidden';
                    section.style.opacity = '0';
                }
            });
        } else {
            // Show other sections
            body.classList.add('section-active');
            sections.forEach(section => {
                if (section.id === sectionId) {
                    section.style.display = 'block';
                    section.style.visibility = 'visible';
                    section.style.opacity = '1';
                } else {
                    section.style.display = 'none';
                    section.style.visibility = 'hidden';
                    section.style.opacity = '0';
                }
            });
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    
    function updateActiveNav(sectionId) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }
    
    // Handle browser back/forward
    window.addEventListener('popstate', function() {
        const hash = window.location.hash.substring(1) || 'home';
        showSection(hash);
        updateActiveNav(hash);
    });
    
    // Debug: Log all sections found
    console.log('Sections found:', sections.length);
    sections.forEach(section => {
        console.log('Section ID:', section.id);
    });
});
                    section.style.display = 'block';
                    setTimeout(() => {
                        section.style.opacity = '1';
                    }, 10);
                } else {
                    section.style.display = 'none';
                    section.style.opacity = '0';
                }
            });
            
            // Scroll to top of section
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    
    // Set active navigation state
    function setActiveNav(sectionId) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }
    
    // Update page title based on section
    function updatePageTitle(sectionId) {
        const titles = {
            'home': 'Kyle L. - Full-Stack Web Developer',
            'about': 'About & Services - Kyle L.',
            'work': 'Portfolio - Kyle L.',
            'contact': 'Contact - Kyle L.'
        };
        
        document.title = titles[sectionId] || titles.home;
    }
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', function() {
        const hash = window.location.hash.substring(1) || 'home';
        showSection(hash);
        setActiveNav(hash);
        updatePageTitle(hash);
    });
    
    // Handle initial page load with hash
    const initialHash = window.location.hash.substring(1) || 'home';
    if (initialHash !== 'home') {
        showSection(initialHash);
        setActiveNav(initialHash);
        updatePageTitle(initialHash);
    }
    
    // Smooth button interactions
    const buttons = document.querySelectorAll('.cta-button');
    buttons.forEach(button => {
        // Touch feedback
        button.addEventListener('mousedown', function(e) {
            this.style.transform = 'translateY(0) scale(0.98)';
        });
        
        button.addEventListener('mouseup', function(e) {
            this.style.transform = '';
        });
        
        button.addEventListener('mouseleave', function(e) {
            this.style.transform = '';
        });
        
        // Handle keyboard navigation
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Navigation blur effect on scroll (for content sections)
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        const nav = document.getElementById('nav');
        
        if (window.scrollY > 0) {
            nav.style.background = 'rgba(29, 29, 31, 0.85)';
        } else {
            nav.style.background = 'rgba(29, 29, 31, 0.72)';
        }
        
        // Clear timeout if it exists
        clearTimeout(scrollTimeout);
        
        // Add scroll class for animations
        nav.classList.add('scrolling');
        
        // Remove scroll class after scrolling stops
        scrollTimeout = setTimeout(() => {
            nav.classList.remove('scrolling');
        }, 150);
    });
    
    // Prevent default link behavior for external links in nav
    const externalLinks = document.querySelectorAll('#nav a[href^="http"]');
    externalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Allow default behavior for external links
            // but add subtle feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // Accessibility: Skip to main content
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--accent-blue);
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 10000;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Performance optimization: Preload section content
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => {
        observer.observe(section);
    });
});
