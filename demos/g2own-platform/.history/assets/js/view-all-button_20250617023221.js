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
                    (button.dataset.delay ? parseInt(button.dataset.delay) : 200) : 0;                if (entry.isIntersecting) {
                    // When the button comes into view - focus on icon animation
                    setTimeout(() => {
                        button.classList.add('animate-in');
                        button.classList.remove('animate-out');
                        
                        // Stagger animation of grid squares for a more dynamic effect
                        const gridSquares = button.querySelectorAll('.grid-square');
                        gridSquares.forEach((square, index) => {
                            square.style.animationDelay = `${index * 0.2}s`;
                        });
                        
                        // Add the icon animation classes
                        const icon = button.querySelector('.animated-grid-icon');
                        if (icon) {
                            icon.classList.add('icon-animated');
                        }
                    }, delay);
                } else {
                    // When the button goes out of view - smooth exit
                    setTimeout(() => {
                        button.classList.add('animate-out');
                        button.classList.remove('animate-in');
                        
                        // Remove icon animation classes
                        const icon = button.querySelector('.animated-grid-icon');
                        if (icon) {
                            icon.classList.remove('icon-animated');
                        }
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
        
        // Add magnetic effect for desktop users
        function addMagneticEffect(button) {
            button.addEventListener('mousemove', (e) => {
                if (window.innerWidth < 768) return; // Skip on mobile
                
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                // Calculate distance from center (0-1 range)
                const distance = Math.sqrt(x*x + y*y) / (rect.width/2);
                const maxMovement = 10; // Maximum pixels to move
                const movement = Math.min(distance * maxMovement, maxMovement);
                
                // Apply movement based on cursor position
                const moveX = (x / rect.width) * movement;
                const moveY = (y / rect.height) * movement;
                
                // Apply transforms
                button.style.transform = `translateY(${button.classList.contains('animate-out') ? '30px' : '0'}) 
                                          translateX(${moveX}px) translateY(${moveY}px)
                                          scale(${button.classList.contains('animate-out') ? '0.95' : '1'})`;
                
                // Make icon follow cursor more dramatically
                const icon = button.querySelector('.btn-icon');
                if (icon) {
                    icon.style.transform = `translateX(${moveX * 1.5}px) translateY(${moveY * 1.5}px)`;
                }
            });
            
            // Reset position when mouse leaves
            button.addEventListener('mouseleave', () => {
                button.style.transform = button.classList.contains('animate-out') ? 
                    'translateY(30px) scale(0.95)' : 
                    'translateY(0) scale(1)';
                    
                const icon = button.querySelector('.btn-icon');
                if (icon) {
                    icon.style.transform = '';
                }
            });
        }
        
        // Initialize magnetic effect
        addMagneticEffect(viewAllBtn);
    }
    
    // Initialize when DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initViewAllButton);
    } else {
        initViewAllButton();
    }
})();
