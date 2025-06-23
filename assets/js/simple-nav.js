/* Clean Apple-Inspired Navigation System */

document.addEventListener('DOMContentLoaded', function() {
    // Remove preload state to show content
    document.body.classList.remove('is-preload');
    
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
    }    function showSection(sectionId) {
        console.log('Showing section:', sectionId); // Debug log
        
        if (sectionId === 'home') {
            // Show home page (hero section)
            body.classList.remove('section-active');
            // Remove visible class from all sections
            sections.forEach(section => {
                section.classList.remove('visible');
            });
        } else {
            // Show specific section
            body.classList.add('section-active');
            
            // Remove visible class from all sections first
            sections.forEach(section => {
                section.classList.remove('visible');
            });
            
            // Add visible class only to the target section
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('visible');
            }
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
      function updateActiveNav(sectionId) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${sectionId}` || (sectionId === 'home' && href === '#home')) {
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
    
    // Add smooth button interactions
    const buttons = document.querySelectorAll('.cta-button');
    buttons.forEach(button => {
        button.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(0) scale(0.98)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = '';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
});
