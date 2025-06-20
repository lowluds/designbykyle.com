/*!
 * Category Cards Quick Fix
 * Immediate loading enhancement for Discover Digital Goods section
 */

(function() {
    'use strict';
    
    function initializeCategoryCardsQuickFix() {
        console.log('🎯 Initializing Category Cards Quick Fix...');
        
        // Enhanced observer settings for immediate loading
        const observerOptions = {
            threshold: [0, 0.05, 0.1, 0.25], // Multiple thresholds for better triggering
            rootMargin: '400px 0px 300px 0px' // Very generous margins for early loading
        };

        const categoryObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0) {
                    const card = entry.target;
                    const delay = parseInt(card.dataset.delay) || 0;
                    
                    console.log(`🎴 Animating category card with delay: ${delay}ms`);
                    
                    // Immediate animation for category cards
                    setTimeout(() => {
                        card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0) scale(1)';
                        card.classList.add('animate-in');
                        
                        // Add enhanced hover effects
                        enhanceCategoryCard(card);
                    }, delay);
                    
                    // Stop observing once animated
                    categoryObserver.unobserve(card);
                }
            });
        }, observerOptions);

        // Find all category cards
        const categoryCards = document.querySelectorAll('.category-card');
        
        if (categoryCards.length === 0) {
            console.warn('⚠️ No category cards found');
            return;
        }
        
        categoryCards.forEach((card, index) => {
            // Set initial hidden state
            card.style.opacity = '0';
            card.style.transform = 'translateY(50px) scale(0.95)';
            card.style.transition = 'none'; // Prevent flash
            
            // Ensure delay attribute exists
            if (!card.dataset.delay) {
                card.dataset.delay = (index + 1) * 100;
            }
            
            // Start observing
            categoryObserver.observe(card);
        });
        
        console.log(`✅ Enhanced observer set up for ${categoryCards.length} category cards`);
    }

    function enhanceCategoryCard(card) {
        // Add enhanced hover effects
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
            card.style.boxShadow = '0 20px 40px rgba(220, 20, 60, 0.2)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = '';
        });
        
        // Add click ripple effect
        card.addEventListener('click', function(e) {
            const ripple = document.createElement('div');
            ripple.classList.add('ripple');
            
            const rect = this.getBoundingClientRect();
            const size = 60;
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(220, 20, 60, 0.3);
                transform: scale(0);
                animation: ripple 0.6s linear;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeCategoryCardsQuickFix);
    } else {
        // DOM is already ready
        initializeCategoryCardsQuickFix();
    }

    // Also initialize on window load as fallback
    window.addEventListener('load', () => {
        // Small delay to ensure all other scripts are loaded
        setTimeout(initializeCategoryCardsQuickFix, 100);
    });

})();
