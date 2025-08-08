/*!
 * Benefit Cards Animation Fix
 * Ensures "Your Trusted Digital Marketplace" benefit cards animate properly
 */

(function() {
    'use strict';
    
    function initBenefitCardsAnimation() {
        const benefitCards = document.querySelectorAll('.benefit-card.animate-on-scroll');
        
        if (benefitCards.length === 0) {
            console.warn('No benefit cards found with animate-on-scroll class');
            return;
        }
        
        // Create a dedicated observer for benefit cards
        const benefitObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    const delay = card.dataset.delay ? parseInt(card.dataset.delay) : 0;
                    
                    setTimeout(() => {
                        card.classList.add('animate-in');
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, delay);
                    
                    // Unobserve after animation to prevent re-triggering
                    benefitObserver.unobserve(card);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px 0px'
        });
        
        // Observe all benefit cards
        benefitCards.forEach(card => {
            // Set initial state
            card.style.opacity = '0';
            card.style.transform = 'translateY(50px)';
            card.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            
            benefitObserver.observe(card);
        });
        
        console.log(`✅ Benefit cards animation initialized for ${benefitCards.length} cards`);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBenefitCardsAnimation);
    } else {
        initBenefitCardsAnimation();
    }
    
    // Also initialize after a short delay to ensure all other scripts have loaded
    setTimeout(initBenefitCardsAnimation, 500);
    
})();
