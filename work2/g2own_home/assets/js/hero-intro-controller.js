/*!
 * Hero Intro Animation Controller
 * Manages the beautiful left-to-right slide-in animation sequence
 */

class HeroIntroController {
    constructor() {
        this.isIntroComplete = false;
        this.animationTimeout = null;
        this.init();
    }

    init() {
        // Wait for preloader to complete before starting intro
        window.addEventListener('g2ownLoaded', () => {
            setTimeout(() => this.startIntroSequence(), 200);
        });
        
        // Fallback: Start after DOM ready if no preloader
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => this.startIntroSequence(), 1000);
            });
        } else {
            setTimeout(() => this.startIntroSequence(), 1000);
        }
    }

    startIntroSequence() {
        // Ensure page-loaded class is present for animations
        document.body.classList.add('page-loaded');
        
        // Get the title lines
        const titleLine1 = document.querySelector('.hero-title .title-line-1');
        const titleLine2 = document.querySelector('.hero-title .title-line-2.gradient-text');
        const titleLine3 = document.querySelector('.hero-title .title-line-3');
        
        if (!titleLine1 || !titleLine2 || !titleLine3) {
            console.warn('Hero title lines not found, skipping intro animation');
            this.completeIntro();
            return;
        }
        
        // Trigger intro animations
        titleLine1.classList.add('animate-intro');
        titleLine2.classList.add('animate-intro');
        titleLine3.classList.add('animate-intro');
        
        // Calculate total animation duration
        // Line 1: 0.3s delay + 1.0s animation = 1.3s
        // Line 2: 0.7s delay + 1.0s animation = 1.7s
        // Line 3: 1.1s delay + 1.0s animation = 2.1s
        // Add 0.5s buffer for gradient animation start
        const totalDuration = 2600; // 2.1s + 0.5s = 2.6s
        
        // Mark intro as complete after all animations finish
        this.animationTimeout = setTimeout(() => {
            this.completeIntro();
        }, totalDuration);
        
        // Fallback: Force completion after max time
        setTimeout(() => {
            if (!this.isIntroComplete) {
                this.completeIntro();
            }
        }, 3000);
    }

    completeIntro() {
        if (this.isIntroComplete) return;
        
        this.isIntroComplete = true;
        document.body.classList.add('intro-complete');
        
        // Clear any pending timeouts
        if (this.animationTimeout) {
            clearTimeout(this.animationTimeout);
            this.animationTimeout = null;
        }
        
        // Dispatch custom event for other components
        document.dispatchEvent(new CustomEvent('heroIntroComplete', {
            detail: { timestamp: Date.now() }
        }));
        
        console.log('Hero intro animation completed - gradient animation should now be running');
    }

    // Public method to force complete intro (for debugging or fast loading)
    forceComplete() {
        this.completeIntro();
    }

    // Public method to check if intro is complete
    isComplete() {
        return this.isIntroComplete;
    }
}

// Initialize the hero intro controller
let heroIntroController;

// Initialize when script loads
try {
    heroIntroController = new HeroIntroController();
} catch (error) {
    console.warn('Hero intro animation failed to initialize:', error);
    // Fallback: Immediately mark as complete
    document.body.classList.add('page-loaded', 'intro-complete');
}

// Export for global access (debugging)
window.heroIntroController = heroIntroController;

// Accessibility: Skip intro if user prefers reduced motion
if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('page-loaded', 'intro-complete');
    if (heroIntroController) {
        heroIntroController.forceComplete();
    }
}
