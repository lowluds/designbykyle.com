// Scroll Progress Bar and Section Indicators
document.addEventListener('DOMContentLoaded', function() {
    
    // Create scroll progress bar
    function createScrollProgress() {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'scroll-progress';
        progressContainer.innerHTML = '<div class="scroll-progress-bar"></div>';
        document.body.appendChild(progressContainer);
        
        return {
            container: progressContainer,
            bar: progressContainer.querySelector('.scroll-progress-bar')
        };
    }
    
    // Create section indicators
    function createSectionIndicators() {
        const indicators = document.createElement('div');
        indicators.className = 'section-indicators';          const sections = [
            { id: 'home', name: 'Home' },
            { id: 'about', name: 'About' },
            { id: 'work', name: 'Work' },
            { id: 'testimonials', name: 'Testimonials' },
            { id: 'contact', name: 'Contact' }
        ];
        
        sections.forEach(section => {
            const indicator = document.createElement('div');
            indicator.className = 'section-indicator';
            indicator.setAttribute('data-section', section.name);
            indicator.setAttribute('data-target', section.id);
            
            indicator.addEventListener('click', () => {
                const targetElement = document.getElementById(section.id);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
            
            indicators.appendChild(indicator);
        });
        
        document.body.appendChild(indicators);
        return indicators;
    }
    
    // Initialize components
    const progress = createScrollProgress();
    const sectionIndicators = createSectionIndicators();      // Get all section elements
    const sections = ['home', 'about', 'work', 'testimonials', 'contact'].map(id => ({
        id,
        element: document.getElementById(id)
    })).filter(section => section.element);
    
    // Update progress and active section
    function updateScrollProgress() {
        // Calculate scroll progress
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = Math.min((scrollTop / docHeight) * 100, 100);
        
        // Update progress bar
        progress.bar.style.width = scrollPercent + '%';
        
        // Show/hide progress bar based on scroll position
        if (scrollTop > 100) {
            progress.container.classList.remove('hidden');
            progress.container.classList.add('visible');
        } else {
            progress.container.classList.add('hidden');
            progress.container.classList.remove('visible');
        }
        
        // Update active section indicator
        updateActiveSectionIndicator(scrollTop);
    }
    
    // Update active section indicator
    function updateActiveSectionIndicator(scrollTop) {
        let activeSection = null;
        const offset = window.innerHeight * 0.3; // 30% of viewport height
        
        sections.forEach(section => {
            const rect = section.element.getBoundingClientRect();
            const elementTop = rect.top + scrollTop;
            
            if (scrollTop + offset >= elementTop && 
                scrollTop + offset < elementTop + rect.height) {
                activeSection = section.id;
            }
        });
        
        // Update indicator states
        const indicators = document.querySelectorAll('.section-indicator');
        indicators.forEach(indicator => {
            const target = indicator.getAttribute('data-target');
            if (target === activeSection) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
    
    // Throttled scroll handler for better performance
    let isScrolling = false;
    function handleScroll() {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                updateScrollProgress();
                isScrolling = false;
            });
            isScrolling = true;
        }
    }
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial update
    updateScrollProgress();
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('#nav a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href !== '#') {
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Update URL without triggering scroll
                    history.pushState(null, null, href);
                }
            }
        });
    });
    
    // Handle direct navigation via URL hash
    if (window.location.hash) {
        setTimeout(() => {
            const targetElement = document.querySelector(window.location.hash);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 100);
    }
    
    // Add progress bar click navigation
    progress.container.addEventListener('click', (e) => {
        const rect = progress.container.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const progressWidth = rect.width;
        const scrollPercent = (clickX / progressWidth) * 100;
        
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const targetScroll = (scrollPercent / 100) * docHeight;
        
        window.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });
    });
    
    // Add visual feedback for progress bar interaction
    progress.container.addEventListener('mouseenter', () => {
        progress.container.style.cursor = 'pointer';
        progress.container.style.height = '6px';
    });
    
    progress.container.addEventListener('mouseleave', () => {
        progress.container.style.height = '4px';
    });
    
    // Intersection Observer for more accurate section detection
    const observerOptions = {
        threshold: [0.1, 0.5, 0.9],
        rootMargin: '-20% 0px -20% 0px'
    };
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                const indicators = document.querySelectorAll('.section-indicator');
                indicators.forEach(indicator => {
                    const target = indicator.getAttribute('data-target');
                    if (target === entry.target.id) {
                        indicator.classList.add('active');
                    } else {
                        indicator.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);
    
    // Observe all sections
    sections.forEach(section => {
        if (section.element) {
            sectionObserver.observe(section.element);
        }
    });
});

// Export functions for external use
window.ScrollProgress = {
    updateProgress: function() {
        const event = new Event('scroll');
        window.dispatchEvent(event);
    },
    
    scrollToSection: function(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
};
