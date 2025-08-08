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
                const delay = entry.isIntersecting ? 
                    (button.dataset.delay ? parseInt(button.dataset.delay) : 200) : 0;
                  if (entry.isIntersecting) {
                    // When the button comes into view - enhanced animation
                    setTimeout(() => {
                        button.classList.add('animate-in');
                        button.classList.remove('animate-out');
                        
                        // Add animation to grid squares on entrance
                        const gridSquares = button.querySelectorAll('.grid-square');
                        gridSquares.forEach((square, index) => {
                            square.style.animationDelay = `${index * 0.2}s`;
                        });
                        
                        // Activate sparkles
                        const sparkles = button.querySelectorAll('.sparkle');
                        sparkles.forEach(sparkle => {
                            sparkle.style.opacity = '1';
                        });
                    }, delay);
                } else {
                    // When the button goes out of view - smooth exit
                    setTimeout(() => {
                        button.classList.add('animate-out');
                        button.classList.remove('animate-in');
                        
                        // Fade out sparkles
                        const sparkles = button.querySelectorAll('.sparkle');
                        sparkles.forEach(sparkle => {
                            sparkle.style.opacity = '0';
                        });
                    }, 100); // Small delay before hiding to make it feel more natural
                }
            });
        }, {
            threshold: [0, 0.1, 0.5], // Multiple thresholds for smoother transitions
            rootMargin: '-20px 0px -150px 0px' // Adjusted margins for better visibility control
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
