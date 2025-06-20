/**
 * G2Own Navbar Icon Animation Controller
 * Enhanced interactive animations for navbar icons
 */

class NavbarIconAnimations {
    constructor() {
        this.initializeAnimations();
        this.setupInteractiveFeatures();
        this.setupCartAnimation();
        this.setupSearchAnimation();
    }

    initializeAnimations() {
        // Add entrance animations when page loads
        this.staggerIconEntrance();
        
        // Setup scroll-based animations
        this.setupScrollAnimations();
        
        // Setup click animations
        this.setupClickAnimations();
    }

    staggerIconEntrance() {
        const icons = document.querySelectorAll('.nav-gaming-icon');
        
        icons.forEach((icon, index) => {
            icon.style.opacity = '0';
            icon.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                icon.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                icon.style.opacity = '1';
                icon.style.transform = 'translateY(0)';
            }, index * 100 + 300); // Stagger by 100ms, start after 300ms
        });
    }

    setupInteractiveFeatures() {
        // Enhanced hover effects with sound simulation
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const icon = link.querySelector('.nav-gaming-icon');
            
            link.addEventListener('mouseenter', () => {
                this.triggerHoverEffect(icon, link.dataset.section);
            });
            
            link.addEventListener('mouseleave', () => {
                this.resetIcon(icon);
            });
        });
    }

    triggerHoverEffect(icon, section) {
        // Remove any existing animation classes
        icon.classList.remove('icon-clicked', 'icon-active');
        
        // Add section-specific effects
        switch(section) {
            case 'marketplace':
                this.addRippleEffect(icon);
                break;
            case 'games':
                this.addGlowEffect(icon);
                break;
            case 'digital-goods':
                this.addSparkleEffect(icon);
                break;
            case 'support':
                this.addShieldEffect(icon);
                break;
        }
    }

    addRippleEffect(icon) {
        const ripple = document.createElement('div');
        ripple.className = 'icon-ripple';
        ripple.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: radial-gradient(circle, rgba(255, 68, 68, 0.4) 0%, transparent 70%);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: rippleExpand 0.6s ease-out;
            pointer-events: none;
            z-index: -1;
        `;
        
        const parent = icon.parentElement;
        parent.style.position = 'relative';
        parent.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }

    addGlowEffect(icon) {
        icon.style.filter = 'drop-shadow(0 0 10px rgba(255, 107, 107, 0.8))';
        
        setTimeout(() => {
            icon.style.filter = '';
        }, 800);
    }

    addSparkleEffect(icon) {
        for(let i = 0; i < 3; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.className = 'icon-sparkle';
                sparkle.style.cssText = `
                    position: absolute;
                    top: ${Math.random() * 100}%;
                    left: ${Math.random() * 100}%;
                    width: 4px;
                    height: 4px;
                    background: #ff4444;
                    border-radius: 50%;
                    animation: sparkleFloat 1s ease-out forwards;
                    pointer-events: none;
                    z-index: 10;
                `;
                
                const parent = icon.parentElement;
                parent.style.position = 'relative';
                parent.appendChild(sparkle);
                
                setTimeout(() => sparkle.remove(), 1000);
            }, i * 200);
        }
    }

    addShieldEffect(icon) {
        const shield = document.createElement('div');
        shield.className = 'shield-effect';
        shield.style.cssText = `
            position: absolute;
            top: -5px;
            left: -5px;
            right: -5px;
            bottom: -5px;
            border: 2px solid rgba(255, 68, 68, 0.5);
            border-radius: 8px;
            animation: shieldPulse 1s ease-in-out;
            pointer-events: none;
            z-index: -1;
        `;
        
        const parent = icon.parentElement;
        parent.style.position = 'relative';
        parent.appendChild(shield);
        
        setTimeout(() => shield.remove(), 1000);
    }

    resetIcon(icon) {
        icon.style.filter = '';
        icon.classList.remove('icon-clicked', 'icon-active');
    }

    setupClickAnimations() {
        const clickableElements = document.querySelectorAll('.nav-link, .search-toggle, .cart-toggle, .login-signup-btn');
        
        clickableElements.forEach(element => {
            element.addEventListener('click', (e) => {
                const icon = element.querySelector('.nav-gaming-icon, .auth-icon');
                if (icon) {
                    this.triggerClickAnimation(icon);
                }
            });
        });
    }

    triggerClickAnimation(icon) {
        icon.classList.add('icon-clicked');
        
        // Create click wave effect
        const wave = document.createElement('div');
        wave.className = 'click-wave';
        wave.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            background: rgba(255, 68, 68, 0.3);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: waveExpand 0.4s ease-out;
            pointer-events: none;
            z-index: 5;
        `;
        
        const parent = icon.parentElement;
        parent.style.position = 'relative';
        parent.appendChild(wave);
        
        setTimeout(() => {
            wave.remove();
            icon.classList.remove('icon-clicked');
        }, 400);
    }

    setupCartAnimation() {
        const cartToggle = document.getElementById('cart-toggle');
        const cartCount = document.getElementById('cart-count');
        
        if (cartToggle && cartCount) {
            // Simulate cart update animation
            const originalCount = parseInt(cartCount.textContent) || 0;
            
            cartToggle.addEventListener('click', () => {
                this.animateCartUpdate(cartCount);
            });
        }
    }

    animateCartUpdate(cartCount) {
        cartCount.style.animation = 'cartCountPop 0.5s ease-in-out';
        
        setTimeout(() => {
            cartCount.style.animation = '';
        }, 500);
    }

    setupSearchAnimation() {
        const searchToggle = document.getElementById('search-toggle');
        const searchDropdown = document.getElementById('search-dropdown');
        
        if (searchToggle && searchDropdown) {
            searchToggle.addEventListener('click', () => {
                const icon = searchToggle.querySelector('.nav-gaming-icon');
                this.animateSearchToggle(icon, searchDropdown);
            });
        }
    }

    animateSearchToggle(icon, dropdown) {
        const isOpen = dropdown.classList.contains('active');
        
        if (!isOpen) {
            icon.style.transform = 'scale(1.2) rotate(90deg)';
        } else {
            icon.style.transform = 'scale(1) rotate(0deg)';
        }
        
        setTimeout(() => {
            icon.style.transform = '';
        }, 300);
    }

    setupScrollAnimations() {
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            const navbar = document.querySelector('.navbar');
            const icons = navbar.querySelectorAll('.nav-gaming-icon');
            
            if (currentScrollY > 100) {
                icons.forEach(icon => {
                    icon.style.transform = 'scale(0.9)';
                });
            } else {
                icons.forEach(icon => {
                    icon.style.transform = 'scale(1)';
                });
            }
            
            lastScrollY = currentScrollY;
        });
    }
}

// Add required CSS animations via JavaScript
const animationStyles = `
    @keyframes rippleExpand {
        from {
            width: 0;
            height: 0;
            opacity: 1;
        }
        to {
            width: 60px;
            height: 60px;
            opacity: 0;
        }
    }

    @keyframes sparkleFloat {
        0% {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        100% {
            opacity: 0;
            transform: translateY(-20px) scale(0);
        }
    }

    @keyframes shieldPulse {
        0%, 100% {
            opacity: 0;
            transform: scale(1);
        }
        50% {
            opacity: 1;
            transform: scale(1.1);
        }
    }

    @keyframes waveExpand {
        from {
            width: 20px;
            height: 20px;
            opacity: 0.8;
        }
        to {
            width: 40px;
            height: 40px;
            opacity: 0;
        }
    }

    @keyframes cartCountPop {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.3);
        }
    }

    .icon-clicked {
        animation: iconClick 0.2s ease-in-out !important;
    }

    @keyframes iconClick {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(0.9);
        }
        100% {
            transform: scale(1);
        }
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = animationStyles;
document.head.appendChild(styleSheet);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new NavbarIconAnimations();
    });
} else {
    new NavbarIconAnimations();
}
