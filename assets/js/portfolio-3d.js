// 3D Portfolio Cards - Interactive Features
document.addEventListener('DOMContentLoaded', function() {
    
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const portfolioObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Stagger animation for child elements
                const cards = entry.target.querySelectorAll('.portfolio-card');
                cards.forEach((card, index) => {
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, index * 150);
                });
                
                portfolioObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe portfolio grid
    const portfolioGrid = document.querySelector('.portfolio-grid');
    if (portfolioGrid) {
        portfolioObserver.observe(portfolioGrid);
    }

    // 3D Mouse Movement Effect
    function handle3DMovement(card) {
        card.addEventListener('mousemove', function(e) {
            if (window.innerWidth <= 768) return; // Disable on mobile
            
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `
                translateY(-20px) 
                rotateX(${rotateX}deg) 
                rotateY(${rotateY}deg) 
                scale(1.02)
            `;
        });
        
        card.addEventListener('mouseleave', function() {
            card.style.transform = 'translateY(0) rotateX(0) rotateY(0) scale(1)';
        });
    }

    // Apply 3D movement to all portfolio cards
    const portfolioCards = document.querySelectorAll('.portfolio-card');
    portfolioCards.forEach(handle3DMovement);

    // Enhanced Click Effects
    portfolioCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('div');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: radial-gradient(circle, rgba(243, 156, 18, 0.3) 0%, transparent 70%);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
                z-index: 10;
            `;
            
            this.style.position = 'relative';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Add ripple animation CSS
    const rippleCSS = document.createElement('style');
    rippleCSS.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleCSS);

    // Tech Stack Hover Effects
    const techTags = document.querySelectorAll('.tech-stack span');
    techTags.forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.1)';
            this.style.boxShadow = '0 8px 20px rgba(243, 156, 18, 0.4)';
        });
        
        tag.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 2px 5px rgba(243, 156, 18, 0.3)';
        });
    });

    // Parallax scrolling for portfolio section
    function handleParallax() {
        const workSection = document.querySelector('#work.panel');
        if (!workSection) return;
        
        const rect = workSection.getBoundingClientRect();
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.1;
        
        if (rect.top <= window.innerHeight && rect.bottom >= 0) {
            workSection.style.backgroundPositionY = rate + 'px';
        }
    }

    // Throttled scroll handler
    let ticking = false;
    function updateParallax() {
        if (!ticking) {
            requestAnimationFrame(() => {
                handleParallax();
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', updateParallax);

    // Magnetic effect for preview overlays
    const previewOverlays = document.querySelectorAll('.preview-overlay');
    previewOverlays.forEach(overlay => {
        const parent = overlay.closest('.portfolio-card');
        
        parent.addEventListener('mousemove', function(e) {
            if (window.innerWidth <= 768) return;
            
            const rect = this.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
            const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
            
            const content = overlay.querySelector('.preview-content');
            if (content) {
                content.style.transform = `translate(${x}px, ${y}px)`;
            }
        });
        
        parent.addEventListener('mouseleave', function() {
            const content = overlay.querySelector('.preview-content');
            if (content) {
                content.style.transform = 'translate(0, 0)';
            }
        });
    });

    // Loading state simulation (for demonstration)
    function simulateLoading() {
        portfolioCards.forEach((card, index) => {
            card.classList.add('loading');
            setTimeout(() => {
                card.classList.remove('loading');
            }, 1000 + (index * 200));
        });
    }

    // Performance optimization for mobile
    function optimizeForMobile() {
        if (window.innerWidth <= 768) {
            // Reduce animation complexity on mobile
            portfolioCards.forEach(card => {
                card.style.willChange = 'transform';
                card.style.backfaceVisibility = 'hidden';
            });
        }
    }

    // Responsive handling
    window.addEventListener('resize', () => {
        optimizeForMobile();
    });

    // Initial optimization
    optimizeForMobile();

    // Touch device optimizations
    if ('ontouchstart' in window) {
        portfolioCards.forEach(card => {
            card.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            });
            
            card.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.classList.remove('touch-active');
                }, 150);
            });
        });
        
        // Add touch-specific styles
        const touchCSS = document.createElement('style');
        touchCSS.textContent = `
            .portfolio-card.touch-active {
                transform: scale(0.98);
                transition: transform 0.1s ease;
            }
            
            @media (hover: none) and (pointer: coarse) {
                .portfolio-card:hover {
                    transform: none;
                }
                
                .portfolio-card:active {
                    transform: scale(0.95);
                }
            }
        `;
        document.head.appendChild(touchCSS);
    }

    // Accessibility improvements
    portfolioCards.forEach(card => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', 'View project details');
        
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const link = this.querySelector('a');
                if (link) {
                    link.click();
                }
            }
        });
        
        card.addEventListener('focus', function() {
            this.style.outline = '2px solid #f39c12';
            this.style.outlineOffset = '2px';
        });
        
        card.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });

    // Image lazy loading enhancement
    const images = document.querySelectorAll('.portfolio-image img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
            this.closest('.portfolio-card').classList.remove('loading');
        });
        
        img.addEventListener('error', function() {
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMUExQTFBIi8+CjxwYXRoIGQ9Ik0xNTAgMTAwTDEyMCA4MEgxODBMMTUwIDEwMFoiIGZpbGw9IiNGMzlDMTIiLz4KPHN2Zz4K';
        });
    });

    console.log('3D Portfolio Cards initialized successfully!');
});

// Export functions for external use
window.PortfolioCards = {
    refresh: function() {
        // Reinitialize if needed
        const event = new Event('DOMContentLoaded');
        document.dispatchEvent(event);
    }
};
