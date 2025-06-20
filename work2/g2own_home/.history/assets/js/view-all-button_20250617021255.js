/*!
 * View All Categories Button Animation
 * Makes the button appear only once when scrolled to
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
                if (entry.isIntersecting) {
                    const button = entry.target;
                    const delay = button.dataset.delay ? parseInt(button.dataset.delay) : 0;
                    
                    setTimeout(() => {
                        button.classList.add('animate-in');
                    }, delay);
                    
                    // Unobserve after animation to prevent re-triggering
                    buttonObserver.unobserve(button);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px' // Only trigger when the top of the element is 100px into the viewport
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
