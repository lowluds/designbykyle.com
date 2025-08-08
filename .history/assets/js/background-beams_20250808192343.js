/**
 * Animated Background Beams with Collision Effects
 * Inspired by Aceternity UI - Pure Vanilla JavaScript Implementation
 * Creates immersive animated beams that explode on collision
 */

class BackgroundBeamsWithCollision {
    constructor(container) {
        this.container = container;
        this.beams = [];
        this.explosions = [];
        this.animationId = null;
        this.collisionDetector = null;
        
        // Dynamic beam configurations that adapt to container width
        this.generateBeamConfigs();

        this.init();
    }

    generateBeamConfigs() {
        // Get container width or use default
        const containerWidth = this.container ? this.container.offsetWidth : 1200;
        const beamCount = Math.max(8, Math.floor(containerWidth / 100)); // At least 8 beams, more for wider screens
        
        this.beamConfigs = [];
        
        for (let i = 0; i < beamCount; i++) {
            // Distribute beams evenly across the width with some randomness
            const baseX = (containerWidth / beamCount) * i + (containerWidth / beamCount) * 0.1;
            const randomOffset = (Math.random() - 0.5) * 50; // ±25px random offset
            const xPosition = Math.max(20, Math.min(containerWidth - 20, baseX + randomOffset));
            
            const heights = ['h-6', 'h-8', 'h-10', 'h-12', 'h-14', 'h-16', 'h-20'];
            const randomHeight = heights[Math.floor(Math.random() * heights.length)];
            
            this.beamConfigs.push({
                initialX: xPosition,
                translateX: xPosition,
                duration: Math.random() * 4000 + 4000, // 4-8 seconds
                repeatDelay: Math.random() * 3000 + 2000, // 2-5 seconds
                delay: Math.random() * 5000, // 0-5 seconds initial delay
                height: randomHeight
            });
        }
    }

    init() {
        this.setupContainer();
        this.createCollisionArea();
        this.createBeams();
        this.startAnimationLoop();
        this.startCollisionDetection();
        this.setupResizeHandler();
    }

    setupResizeHandler() {
        // Handle window resize to regenerate beam positions
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.regenerateBeams();
            }, 300);
        });
    }

    regenerateBeams() {
        // Clear existing beams
        this.beams.forEach(beam => {
            beam.isActive = false;
            if (beam.element.parentNode) {
                beam.element.parentNode.removeChild(beam.element);
            }
        });
        this.beams = [];

        // Generate new beam configurations and create new beams
        this.generateBeamConfigs();
        this.createBeams();
    }

    setupContainer() {
        // Ensure container has relative positioning
        this.container.style.position = 'relative';
        this.container.style.overflow = 'hidden';
        
        // Add subtle background overlay for depth (behind original hero elements)
        const overlay = document.createElement('div');
        overlay.className = 'beams-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(
                180deg,
                rgba(99, 102, 241, 0.005) 0%,
                rgba(139, 92, 246, 0.008) 50%,
                rgba(168, 85, 247, 0.005) 100%
            );
            pointer-events: none;
            z-index: 1;
        `;
        this.container.appendChild(overlay);
    }

    createCollisionArea() {
        this.collisionArea = document.createElement('div');
        this.collisionArea.className = 'collision-area';
        this.collisionArea.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: transparent;
            pointer-events: none;
            z-index: 5;
        `;
        this.container.appendChild(this.collisionArea);
    }

    createBeams() {
        this.beamConfigs.forEach((config, index) => {
            setTimeout(() => {
                this.createBeam(config);
            }, config.delay);
        });
    }

    createBeam(config) {
        const beam = document.createElement('div');
        beam.className = 'animated-beam';
        
        // Get height value from config
        const heightMap = {
            'h-6': '24px',
            'h-8': '32px',
            'h-10': '40px',
            'h-12': '48px',
            'h-14': '56px',
            'h-16': '64px',
            'h-20': '80px'
        };
        
        const beamHeight = heightMap[config.height] || '56px';
        
        beam.style.cssText = `
            position: absolute;
            left: ${config.initialX}px;
            top: -200px;
            width: 2px;
            height: ${beamHeight};
            background: linear-gradient(
                to bottom,
                transparent 0%,
                rgba(139, 92, 246, 0.8) 20%,
                rgba(99, 102, 241, 0.9) 50%,
                rgba(168, 85, 247, 0.8) 80%,
                transparent 100%
            );
            border-radius: 1px;
            box-shadow: 
                0 0 10px rgba(99, 102, 241, 0.5),
                0 0 20px rgba(139, 92, 246, 0.3),
                0 0 30px rgba(168, 85, 247, 0.2);
            pointer-events: none;
            z-index: 1.5;
        `;

        this.container.appendChild(beam);

        // Store beam data
        const beamData = {
            element: beam,
            config: config,
            startTime: Date.now(),
            isActive: true
        };

        this.beams.push(beamData);
        this.animateBeam(beamData);
    }

    animateBeam(beamData) {
        const animate = () => {
            if (!beamData.isActive) return;

            const elapsed = Date.now() - beamData.startTime;
            const progress = (elapsed % beamData.config.duration) / beamData.config.duration;
            
            // Calculate position
            const containerHeight = this.container.offsetHeight;
            const startY = -200;
            const endY = containerHeight + 100;
            const currentY = startY + (endY - startY) * progress;
            
            beamData.element.style.transform = `translateY(${currentY}px)`;

            // Check for collision
            if (currentY >= containerHeight - 50 && !beamData.collided) {
                beamData.collided = true;
                this.createExplosion(
                    beamData.config.initialX + 1, // Center of beam
                    containerHeight - 20
                );
            }

            // Reset beam when animation completes
            if (progress >= 0.98) {
                setTimeout(() => {
                    beamData.startTime = Date.now();
                    beamData.collided = false;
                }, beamData.config.repeatDelay);
            }

            requestAnimationFrame(animate);
        };

        animate();
    }

    createExplosion(x, y) {
        const explosion = document.createElement('div');
        explosion.className = 'beam-explosion';
        explosion.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 4px;
            height: 4px;
            pointer-events: none;
            z-index: 10;
        `;

        // Create central flash
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 40px;
            height: 4px;
            background: linear-gradient(
                90deg,
                transparent,
                rgba(99, 102, 241, 0.8),
                rgba(139, 92, 246, 1),
                rgba(99, 102, 241, 0.8),
                transparent
            );
            border-radius: 2px;
            filter: blur(1px);
            animation: explosionFlash 1.5s ease-out forwards;
        `;
        explosion.appendChild(flash);

        // Create particle sparks
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            const angle = (Math.PI * 2 * i) / 15;
            const distance = Math.random() * 60 + 20;
            const size = Math.random() * 3 + 1;
            
            particle.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                width: ${size}px;
                height: ${size}px;
                background: linear-gradient(
                    45deg,
                    rgba(99, 102, 241, 1),
                    rgba(139, 92, 246, 1)
                );
                border-radius: 50%;
                transform: translate(-50%, -50%);
                animation: explodeParticle ${Math.random() * 0.8 + 0.5}s ease-out forwards;
                --particle-x: ${Math.cos(angle) * distance}px;
                --particle-y: ${Math.sin(angle) * distance}px;
            `;
            explosion.appendChild(particle);
        }

        this.container.appendChild(explosion);

        // Clean up explosion after animation
        setTimeout(() => {
            if (explosion.parentNode) {
                explosion.parentNode.removeChild(explosion);
            }
        }, 2000);
    }

    startAnimationLoop() {
        // Main animation loop for any additional effects
        const loop = () => {
            // Future: Add any frame-by-frame animations here
            this.animationId = requestAnimationFrame(loop);
        };
        loop();
    }

    startCollisionDetection() {
        // Collision detection runs at 60fps for smooth effects
        this.collisionDetector = setInterval(() => {
            // Collision detection is handled in individual beam animations
            // This can be used for future collision detection improvements
        }, 16);
    }

    destroy() {
        // Clean up animations and intervals
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.collisionDetector) {
            clearInterval(this.collisionDetector);
        }
        
        // Mark all beams as inactive
        this.beams.forEach(beam => {
            beam.isActive = false;
        });
        
        // Clear arrays
        this.beams = [];
        this.explosions = [];
    }
}

// CSS animations for explosion effects
const style = document.createElement('style');
style.textContent = `
    @keyframes explosionFlash {
        0% {
            opacity: 0;
            transform: translate(-50%, -50%) scaleX(0);
        }
        20% {
            opacity: 1;
            transform: translate(-50%, -50%) scaleX(1);
        }
        100% {
            opacity: 0;
            transform: translate(-50%, -50%) scaleX(1.2);
        }
    }

    @keyframes explodeParticle {
        0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
        100% {
            opacity: 0;
            transform: translate(-50%, -50%) 
                       translateX(var(--particle-x)) 
                       translateY(var(--particle-y)) 
                       scale(0);
        }
    }
    
    .animated-beam {
        transition: filter 0.3s ease;
    }
    
    .animated-beam:hover {
        filter: brightness(1.3) saturate(1.2);
    }
`;
document.head.appendChild(style);

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize beams for hero section
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        // Small delay to ensure hero section is fully rendered
        setTimeout(() => {
            window.heroBeams = new BackgroundBeamsWithCollision(heroSection);
        }, 500);
    }
});

// Export for manual initialization
window.BackgroundBeamsWithCollision = BackgroundBeamsWithCollision;
