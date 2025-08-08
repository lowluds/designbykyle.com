/*!
 * View All Categories Button Animation
 * Makes the button appear when scrolled to and disappear when scrolled away
 */

(function() {
    'use strict';
    
    function initViewAllButton() {
        const viewAllBtn = document.getElementById('view-all-categories');
        
        if (!viewAllBtn) {
            console.warn('View All Categories button not found');
            return;
        }
        
        // Create an intersection observer for the button
        const buttonObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const button = entry.target;
                const delay = button.dataset.delay ? parseInt(button.dataset.delay) : 0;
                
                if (entry.isIntersecting) {
                    // When the button comes into view
                    setTimeout(() => {
                        button.classList.add('animate-in');
                        button.classList.remove('animate-out');
                    }, delay);
                } else {
                    // When the button goes out of view
                    button.classList.add('animate-out');
                    button.classList.remove('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '-50px 0px -100px 0px' // Trigger when button is within this margin of the viewport
        });
        
        // Observe the button
        buttonObserver.observe(viewAllBtn);
        
        console.log('✅ View All Categories button animation initialized');
    }
    
    // Initialize when DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initViewAllButton);
    } else {
        initViewAllButton();
    }
})();
