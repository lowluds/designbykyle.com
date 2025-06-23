// Enhanced Portfolio Interactions
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize portfolio enhancements
    function initPortfolioEnhancements() {
        const portfolioCards = document.querySelectorAll('.portfolio-card');
        
        portfolioCards.forEach((card, index) => {
            // Add staggered entrance animation
            card.style.animationDelay = `${index * 0.1}s`;
            
            // Add mouse tracking for subtle rotation
            card.addEventListener('mousemove', handleMouseMove);
            card.addEventListener('mouseleave', handleMouseLeave);
            
            // Add click enhancement
            card.addEventListener('click', handleCardClick);
            
            // Add keyboard support
            card.setAttribute('tabindex', '0');
            card.addEventListener('keydown', handleKeyDown);
        });
        
        // Initialize intersection observer for scroll animations
        initScrollAnimations();
    }
    
    // Mouse tracking for 3D rotation effect
    function handleMouseMove(e) {
        if (window.innerWidth <= 768) return; // Disable on mobile
        
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const rotateX = (e.clientY - centerY) / 20;
        const rotateY = (centerX - e.clientX) / 20;
        
        card.style.transform = `
            translateY(-15px) 
            scale(1.02) 
            rotateX(${rotateX}deg) 
            rotateY(${rotateY}deg)
            perspective(1000px)
        `;
    }
    
    // Reset rotation on mouse leave
    function handleMouseLeave(e) {
        const card = e.currentTarget;
        card.style.transform = '';
    }
    
    // Enhanced click feedback
    function handleCardClick(e) {
        const card = e.currentTarget;
        
        // Add click animation class
        card.classList.add('clicking');
        
        // Create ripple effect
        createRippleEffect(e, card);
        
        // Remove animation class after animation
        setTimeout(() => {
            card.classList.remove('clicking');
        }, 300);
    }
    
    // Create ripple effect on click
    function createRippleEffect(e, card) {
        const ripple = document.createElement('div');
        const rect = card.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.className = 'portfolio-ripple';
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: portfolioRipple 0.6s ease-out;
            pointer-events: none;
            z-index: 10;
        `;
        
        card.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    // Keyboard navigation support
    function handleKeyDown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const link = e.currentTarget.querySelector('.portfolio-image a');
            if (link) {
                // Create synthetic click event for ripple effect
                const clickEvent = new MouseEvent('click', {
                    clientX: e.currentTarget.getBoundingClientRect().left + e.currentTarget.offsetWidth / 2,
                    clientY: e.currentTarget.getBoundingClientRect().top + e.currentTarget.offsetHeight / 2
                });
                handleCardClick(clickEvent);
                
                // Navigate to link
                setTimeout(() => {
                    link.click();
                }, 150);
            }
        }
    }
    
    // Scroll-triggered animations
    function initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Stagger animation for tech stack items
                    const techItems = entry.target.querySelectorAll('.tech-stack span');
                    techItems.forEach((item, index) => {
                        setTimeout(() => {
                            item.style.transform = 'translateY(0) scale(1)';
                            item.style.opacity = '1';
                        }, index * 100);
                    });
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        document.querySelectorAll('.portfolio-card').forEach(card => {
            observer.observe(card);
        });
    }
    
    // Enhanced tech stack interactions
    function initTechStackEnhancements() {
        const techItems = document.querySelectorAll('.tech-stack span');
        
        techItems.forEach(item => {
            // Add hover sound effect (optional)
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateY(-3px) scale(1.05)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.transform = '';
            });
            
            // Add click interaction for tech items
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                item.style.animation = 'techPulse 0.3s ease';
                
                setTimeout(() => {
                    item.style.animation = '';
                }, 300);
            });
        });
    }
    
    // Portfolio filtering (if needed in future)
    function initPortfolioFiltering() {
        // This can be expanded for category filtering
        const filterButtons = document.querySelectorAll('[data-filter]');
        const portfolioItems = document.querySelectorAll('.portfolio-item');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.dataset.filter;
                
                portfolioItems.forEach(item => {
                    if (filter === 'all' || item.classList.contains(filter)) {
                        item.style.display = 'block';
                        item.style.animation = 'slideInUp 0.5s ease-out';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes portfolioRipple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        @keyframes techPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        
        .portfolio-card.clicking {
            transform: translateY(-15px) scale(0.98) !important;
            transition: transform 0.1s ease !important;
        }
        
        .tech-stack span {
            transform: translateY(10px) scale(0.8);
            opacity: 0;
            transition: all 0.3s ease;
        }
        
        .portfolio-card.animate-in .tech-stack span {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
    
    // Initialize all enhancements
    initPortfolioEnhancements();
    initTechStackEnhancements();
    
    // Lazy loading enhancement for images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
});

// Export functions for external use
window.PortfolioEnhancements = {
    refreshAnimations: function() {
        // Re-initialize animations after dynamic content changes
        const event = new Event('DOMContentLoaded');
        document.dispatchEvent(event);
    },
    
    highlightCard: function(index) {
        const cards = document.querySelectorAll('.portfolio-card');
        if (cards[index]) {
            cards[index].focus();
            cards[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
};
