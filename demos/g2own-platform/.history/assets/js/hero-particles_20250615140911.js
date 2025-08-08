/**
 * G2Own Hero Particles - Subtle Gaming Theme Background Effect
 * Very feint particles matching white, black, and red theme
 */

class G2OwnHeroParticles {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationId = null;
        this.isVisible = false;        // G2Own themed particle configuration - Enhanced Red & White Mix
        this.config = {
            particleCount: 100, // Increased for better visibility
            colors: [
                'rgba(255, 255, 255, 0.7)', // Bright white
                'rgba(239, 68, 68, 0.8)',   // Bright red (G2Own red)
                'rgba(255, 255, 255, 0.5)', // Medium white
                'rgba(220, 38, 38, 0.7)',   // Deep red
                'rgba(255, 255, 255, 0.8)', // Very bright white
                'rgba(248, 113, 113, 0.6)', // Light red
                'rgba(255, 255, 255, 0.6)', // Medium-bright white
                'rgba(185, 28, 28, 0.8)',   // Dark red
                'rgba(254, 226, 226, 0.4)', // Very light red-white
                'rgba(139, 0, 0, 0.9)'      // Boston red
            ],
            speed: {
                min: 0.2,
                max: 1.0
            },
            size: {
                min: 1.5,
                max: 3.5
            },
            connectionDistance: 140,
            connectionOpacity: 0.15 // More visible connections
        };
        
        this.init();
    }
    
    init() {
        try {
            this.createCanvas();
            this.setupParticles();
            this.setupEventListeners();
            this.startAnimation();
            
            console.log('✅ G2Own Hero Particles initialized');
        } catch (error) {
            console.error('❌ Error initializing hero particles:', error);
        }
    }
    
    createCanvas() {
        const heroSection = document.getElementById('hero');
        if (!heroSection) {
            throw new Error('Hero section not found');
        }
        
        // Create particle canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'hero-particles-canvas';        this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 10;
            opacity: 1;
        `;
        
        // Make hero section relative if it isn't already
        const heroStyles = getComputedStyle(heroSection);
        if (heroStyles.position === 'static') {
            heroSection.style.position = 'relative';
        }
        
        // Insert canvas as first child so it's behind content
        heroSection.insertBefore(this.canvas, heroSection.firstChild);
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        console.log('🎨 Hero particle canvas created');
    }
    
    resizeCanvas() {
        const heroSection = document.getElementById('hero');
        if (!heroSection) return;
        
        const rect = heroSection.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // Regenerate particles for new dimensions
        this.setupParticles();
    }
    
    setupParticles() {
        this.particles = [];
        
        for (let i = 0; i < this.config.particleCount; i++) {
            this.particles.push(this.createParticle());
        }
        
        console.log(`🎯 Created ${this.config.particleCount} hero particles`);
    }
    
    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * (this.config.speed.max - this.config.speed.min) + this.config.speed.min,
            vy: (Math.random() - 0.5) * (this.config.speed.max - this.config.speed.min) + this.config.speed.min,
            size: Math.random() * (this.config.size.max - this.config.size.min) + this.config.size.min,
            color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)],            opacity: Math.random() * 0.6 + 0.3, // More visible opacity range
            life: Math.random() * 100
        };
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Update life for subtle pulsing
            particle.life += 0.02;
            particle.opacity = (Math.sin(particle.life) * 0.2 + 0.3) * 0.4; // Very subtle pulsing
            
            // Wrap around edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
        });
    }
    
    drawParticles() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw connections first (behind particles)
        this.drawConnections();
        
        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }
      drawConnections() {
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)'; // More visible red connections
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.config.connectionDistance) {
                    const opacity = (1 - distance / this.config.connectionDistance) * this.config.connectionOpacity;
                    this.ctx.globalAlpha = opacity;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
        
        this.ctx.restore();
    }
    
    animate() {
        this.updateParticles();
        this.drawParticles();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    startAnimation() {
        if (!this.animationId) {
            this.animate();
            this.isVisible = true;
            console.log('▶️ Hero particles animation started');
        }
    }
    
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
            this.isVisible = false;
            console.log('⏹️ Hero particles animation stopped');
        }
    }
    
    setupEventListeners() {
        // Resize handling
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.resizeCanvas();
            }, 300);
        });
        
        // Intersection Observer for performance
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isVisible) {
                    this.startAnimation();
                } else if (!entry.isIntersecting && this.isVisible) {
                    this.stopAnimation();
                }
            });
        }, {
            threshold: 0.1
        });
        
        const heroSection = document.getElementById('hero');
        if (heroSection) {
            observer.observe(heroSection);
        }
        
        // Reduced motion support
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.config.speed.min = 0.05;
            this.config.speed.max = 0.1;
            this.config.connectionOpacity = 0.01;
        }
        
        console.log('👂 Hero particles event listeners setup');
    }
    
    // Public methods for control
    show() {
        if (this.canvas) {
            this.canvas.style.opacity = '0.7';
            this.startAnimation();
        }
    }
    
    hide() {
        if (this.canvas) {
            this.canvas.style.opacity = '0';
            this.stopAnimation();
        }
    }
    
    setOpacity(opacity) {
        if (this.canvas) {
            this.canvas.style.opacity = Math.max(0, Math.min(1, opacity));
        }
    }
    
    destroy() {
        console.log('🧹 Cleaning up hero particles');
        
        this.stopAnimation();
        
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        
        this.particles = [];
        this.canvas = null;
        this.ctx = null;
    }
    
    // Debug method
    getDebugInfo() {
        return {
            particleCount: this.particles.length,
            canvasSize: this.canvas ? `${this.canvas.width}x${this.canvas.height}` : 'none',
            isAnimating: !!this.animationId,
            isVisible: this.isVisible
        };
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing G2Own Hero Particles');
    
    setTimeout(() => {
        try {
            window.heroParticles = new G2OwnHeroParticles();
            
            // Debug function
            window.debugHeroParticles = () => console.log(window.heroParticles.getDebugInfo());
            
            console.log('✅ G2Own Hero Particles initialized successfully');
            console.log('💡 Type "debugHeroParticles()" in console for debug info');
            
        } catch (error) {
            console.error('❌ Failed to initialize hero particles:', error);
        }
    }, 500); // Wait for hero section to be ready
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = G2OwnHeroParticles;
}
