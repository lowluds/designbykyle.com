/*!
 * Modern Hero Buttons Controller
 * Handles interactions for the modernized Explore Marketplace and Learn More buttons
 */

class ModernHeroButtonsController {
    constructor() {
        this.buttons = {
            explore: null,
            learn: null
        };
        this.particleAnimationId = null;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupButtons());
        } else {
            this.setupButtons();
        }
    }

    setupButtons() {
        // Get button references
        this.buttons.explore = document.querySelector('.hero-buttons .btn[data-action="explore"]');
        this.buttons.learn = document.querySelector('.hero-buttons .btn[data-action="learn"]');

        if (!this.buttons.explore || !this.buttons.learn) {
            console.warn('Hero buttons not found');
            return;
        }

        // Setup event listeners
        this.setupButtonEvents();
        this.setupMagneticEffect();
        this.setupParticleEffects();
    }

    setupButtonEvents() {
        // Explore Marketplace button
        this.buttons.explore.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleExploreClick();
        });

        // Learn More button
        this.buttons.learn.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleLearnMoreClick();
        });

        // Add ripple effect to all buttons
        [this.buttons.explore, this.buttons.learn].forEach(btn => {
            btn.addEventListener('click', (e) => this.createRippleEffect(e, btn));
        });
    }

    setupMagneticEffect() {
        const magneticBtn = this.buttons.explore;
        if (!magneticBtn) return;

        let magneticArea = 50; // Magnetic field radius

        magneticBtn.addEventListener('mousemove', (e) => {
            const rect = magneticBtn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            const distance = Math.sqrt(x * x + y * y);

            if (distance < magneticArea) {
                const strength = (magneticArea - distance) / magneticArea;
                const moveX = x * strength * 0.3;
                const moveY = y * strength * 0.3;

                magneticBtn.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.02)`;
            }
        });

        magneticBtn.addEventListener('mouseleave', () => {
            magneticBtn.style.transform = '';
        });
    }

    setupParticleEffects() {
        const exploreBtn = this.buttons.explore;
        const particlesContainer = exploreBtn?.querySelector('.btn-particles');
        
        if (!particlesContainer) return;

        exploreBtn.addEventListener('mouseenter', () => {
            this.startParticleAnimation(particlesContainer);
        });

        exploreBtn.addEventListener('mouseleave', () => {
            this.stopParticleAnimation();
        });
    }

    startParticleAnimation(container) {
        this.stopParticleAnimation(); // Clear any existing animation
        
        const createParticle = () => {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 3px;
                height: 3px;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 50%;
                pointer-events: none;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: particleFloat 2s ease-out forwards;
            `;
            
            container.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 2000);
        };

        // Create particles at intervals
        this.particleAnimationId = setInterval(createParticle, 300);
        
        // Add particle animation keyframes if not already added
        if (!document.querySelector('#particle-keyframes')) {
            const style = document.createElement('style');
            style.id = 'particle-keyframes';
            style.textContent = `
                @keyframes particleFloat {
                    0% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translateY(-20px) scale(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    stopParticleAnimation() {
        if (this.particleAnimationId) {
            clearInterval(this.particleAnimationId);
            this.particleAnimationId = null;
        }
    }

    createRippleEffect(event, button) {
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: translate(-50%, -50%);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            z-index: 0;
        `;

        button.style.position = 'relative';
        button.appendChild(ripple);

        // Add ripple animation if not already added
        if (!document.querySelector('#ripple-keyframes')) {
            const style = document.createElement('style');
            style.id = 'ripple-keyframes';
            style.textContent = `
                @keyframes ripple {
                    to {
                        width: 100px;
                        height: 100px;
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    handleExploreClick() {
        console.log('Explore Marketplace clicked');
        
        // Add click animation
        this.buttons.explore.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.buttons.explore.style.transform = '';
        }, 150);

        // Navigate to marketplace or show modal
        // For now, we'll scroll to categories section
        const categoriesSection = document.querySelector('#categories');
        if (categoriesSection) {
            categoriesSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }

        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('heroExploreClicked', {
            detail: { timestamp: Date.now() }
        }));
    }

    handleLearnMoreClick() {
        console.log('Learn More clicked');
        
        // Add click animation
        this.buttons.learn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.buttons.learn.style.transform = '';
        }, 150);

        // Navigate to about section or open modal
        // For now, we'll scroll to why choose us section
        const aboutSection = document.querySelector('#why-choose-us') || 
                           document.querySelector('.why-choose-us') ||
                           document.querySelector('#about');
        
        if (aboutSection) {
            aboutSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }

        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('heroLearnMoreClicked', {
            detail: { timestamp: Date.now() }
        }));
    }

    // Public method to destroy the controller
    destroy() {
        this.stopParticleAnimation();
        
        // Remove event listeners
        if (this.buttons.explore) {
            this.buttons.explore.style.transform = '';
        }
        if (this.buttons.learn) {
            this.buttons.learn.style.transform = '';
        }
    }
}

// Initialize the modern hero buttons controller
let modernHeroButtonsController;

try {
    modernHeroButtonsController = new ModernHeroButtonsController();
    console.log('Modern hero buttons controller initialized');
} catch (error) {
    console.warn('Failed to initialize modern hero buttons controller:', error);
}

// Export for global access
window.modernHeroButtonsController = modernHeroButtonsController;

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (modernHeroButtonsController) {
        modernHeroButtonsController.destroy();
    }
});
