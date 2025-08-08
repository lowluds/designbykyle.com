// G2Own Particles Configuration - Advanced Interactive Background

class ParticleSystem {
    constructor() {
        this.config = {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: ['#ef4444', '#ffffff', '#dc2626', '#f87171']
                },
                shape: {
                    type: ['circle', 'triangle', 'polygon'],
                    stroke: {
                        width: 0,
                        color: '#000000'
                    },
                    polygon: {
                        nb_sides: 6
                    }
                },
                opacity: {
                    value: 0.6,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 2,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#ef4444',
                    opacity: 0.3,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: false,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: {
                        enable: true,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'grab'
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 200,
                        line_linked: {
                            opacity: 0.8
                        }
                    },
                    bubble: {
                        distance: 400,
                        size: 40,
                        duration: 2,
                        opacity: 0.8,
                        speed: 3
                    },
                    repulse: {
                        distance: 200,
                        duration: 0.4
                    },
                    push: {
                        particles_nb: 4
                    },
                    remove: {
                        particles_nb: 2
                    }
                }
            },
            retina_detect: true
        };
        
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeParticles();
            });
        } else {
            this.initializeParticles();
        }
        
        this.setupEventListeners();
    }

    initializeParticles() {
        const canvas = document.getElementById('particles-canvas');
        if (!canvas) {
            console.warn('Particles canvas not found');
            return;
        }

        // Adjust particle count based on device
        this.adjustForDevice();
        
        // Initialize particles.js
        if (typeof particlesJS !== 'undefined') {
            particlesJS('particles-canvas', this.config);
            console.log('Particles.js initialized successfully');
            
            // Add custom enhancements
            setTimeout(() => {
                this.enhanceParticles();
            }, 1000);
        } else {
            console.warn('Particles.js library not loaded');
            this.createFallbackParticles();
        }
    }

    adjustForDevice() {
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth < 1024;
        
        if (isMobile) {
            this.config.particles.number.value = 30;
            this.config.particles.line_linked.distance = 100;
            this.config.particles.move.speed = 1;
            this.config.interactivity.events.onhover.enable = false;
        } else if (isTablet) {
            this.config.particles.number.value = 50;
            this.config.particles.line_linked.distance = 120;
        }
        
        // Reduce particles for low-end devices
        if (this.isLowEndDevice()) {
            this.config.particles.number.value = Math.floor(this.config.particles.number.value * 0.5);
            this.config.particles.line_linked.enable = false;
        }
    }

    isLowEndDevice() {
        // Simple heuristic to detect low-end devices
        return navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
    }

    enhanceParticles() {
        if (!window.pJSDom || !window.pJSDom[0]) return;
        
        const pJS = window.pJSDom[0].pJS;
        
        // Add mouse trail effect
        this.addMouseTrail(pJS);
        
        // Add color cycling
        this.addColorCycling(pJS);
        
        // Add performance monitoring
        this.addPerformanceMonitoring(pJS);
    }

    addMouseTrail(pJS) {
        let mouseTrail = [];
        const maxTrailLength = 10;
        
        document.addEventListener('mousemove', (e) => {
            mouseTrail.push({
                x: e.clientX,
                y: e.clientY,
                time: Date.now()
            });
            
            // Remove old trail points
            mouseTrail = mouseTrail.filter(point => 
                Date.now() - point.time < 500
            ).slice(-maxTrailLength);
            
            // Attract nearby particles to mouse trail
            if (pJS.particles && pJS.particles.array) {
                pJS.particles.array.forEach(particle => {
                    mouseTrail.forEach(trailPoint => {
                        const dx = trailPoint.x - particle.x;
                        const dy = trailPoint.y - particle.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance < 100) {
                            const force = (100 - distance) / 100;
                            particle.vx += dx * force * 0.001;
                            particle.vy += dy * force * 0.001;
                        }
                    });
                });
            }
        });
    }

    addColorCycling(pJS) {
        const colors = ['#ef4444', '#dc2626', '#f87171', '#ffffff'];
        let colorIndex = 0;
        
        setInterval(() => {
            if (pJS.particles && pJS.particles.array) {
                pJS.particles.array.forEach((particle, index) => {
                    if (index % 20 === 0) { // Only change some particles
                        const newColor = colors[(colorIndex + index) % colors.length];
                        particle.color.value = newColor;
                        particle.color.rgb = this.hexToRgb(newColor);
                    }
                });
                colorIndex = (colorIndex + 1) % colors.length;
            }
        }, 3000);
    }

    addPerformanceMonitoring(pJS) {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const monitor = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                
                // Adjust particle count based on FPS
                if (fps < 30 && pJS.particles.number.value > 20) {
                    pJS.particles.number.value -= 5;
                    console.log(`Low FPS detected (${fps}), reducing particles to ${pJS.particles.number.value}`);
                } else if (fps > 50 && pJS.particles.number.value < 80) {
                    pJS.particles.number.value += 2;
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(monitor);
        };
        
        monitor();
    }

    setupEventListeners() {
        // Resize handler
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
        
        // Visibility change handler for performance
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // Battery API for mobile optimization
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                this.optimizeForBattery(battery);
            });
        }
    }

    handleResize() {
        if (window.pJSDom && window.pJSDom[0]) {
            const pJS = window.pJSDom[0].pJS;
            
            // Update canvas size
            pJS.canvas.size.w = window.innerWidth;
            pJS.canvas.size.h = window.innerHeight;
            pJS.canvas.el.width = window.innerWidth;
            pJS.canvas.el.height = window.innerHeight;
            
            // Adjust particle count for new size
            this.adjustForDevice();
            pJS.particles.number.value = this.config.particles.number.value;
            
            // Refresh particles
            pJS.fn.particlesRefresh();
        }
    }

    handleVisibilityChange() {
        if (window.pJSDom && window.pJSDom[0]) {
            const pJS = window.pJSDom[0].pJS;
            
            if (document.hidden) {
                // Pause animations when tab is not visible
                pJS.fn.vendors.interactivity.onMouseMove = () => {};
                pJS.particles.move.enable = false;
            } else {
                // Resume animations when tab becomes visible
                pJS.particles.move.enable = true;
                pJS.fn.particlesRefresh();
            }
        }
    }

    optimizeForBattery(battery) {
        const updateBatteryOptimization = () => {
            if (battery.level < 0.2 || !battery.charging) {
                // Low battery mode - reduce particles and effects
                if (window.pJSDom && window.pJSDom[0]) {
                    const pJS = window.pJSDom[0].pJS;
                    pJS.particles.number.value = Math.min(20, pJS.particles.number.value);
                    pJS.particles.line_linked.enable = false;
                    pJS.particles.move.speed = 1;
                    console.log('Battery optimization enabled');
                }
            }
        };
        
        battery.addEventListener('levelchange', updateBatteryOptimization);
        battery.addEventListener('chargingchange', updateBatteryOptimization);
        updateBatteryOptimization();
    }

    createFallbackParticles() {
        // Fallback CSS-only particles if particles.js fails to load
        const canvas = document.getElementById('particles-canvas');
        if (!canvas) return;
        
        console.log('Creating fallback particles...');
        
        const fallbackContainer = document.createElement('div');
        fallbackContainer.id = 'fallback-particles';
        fallbackContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
        `;
        
        // Create CSS particles
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 3px;
                height: 3px;
                background: #ef4444;
                border-radius: 50%;
                opacity: 0.6;
                animation: fallbackFloat ${3 + Math.random() * 4}s ease-in-out infinite;
                animation-delay: ${Math.random() * 2}s;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
            `;
            fallbackContainer.appendChild(particle);
        }
        
        canvas.parentNode.insertBefore(fallbackContainer, canvas);
        canvas.style.display = 'none';
        
        // Add fallback animation styles
        this.addFallbackStyles();
    }

    addFallbackStyles() {
        if (document.getElementById('fallback-particles-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'fallback-particles-styles';
        style.textContent = `
            @keyframes fallbackFloat {
                0%, 100% {
                    transform: translateY(0px) translateX(0px);
                    opacity: 0.6;
                }
                25% {
                    transform: translateY(-20px) translateX(10px);
                    opacity: 1;
                }
                50% {
                    transform: translateY(0px) translateX(-10px);
                    opacity: 0.8;
                }
                75% {
                    transform: translateY(10px) translateX(5px);
                    opacity: 0.4;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Utility functions
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Public API
    updateParticleCount(count) {
        if (window.pJSDom && window.pJSDom[0]) {
            const pJS = window.pJSDom[0].pJS;
            pJS.particles.number.value = count;
            pJS.fn.particlesRefresh();
        }
    }

    setParticleColor(color) {
        if (window.pJSDom && window.pJSDom[0]) {
            const pJS = window.pJSDom[0].pJS;
            pJS.particles.color.value = color;
            pJS.fn.particlesRefresh();
        }
    }

    pauseParticles() {
        if (window.pJSDom && window.pJSDom[0]) {
            window.pJSDom[0].pJS.particles.move.enable = false;
        }
    }

    resumeParticles() {
        if (window.pJSDom && window.pJSDom[0]) {
            window.pJSDom[0].pJS.particles.move.enable = true;
        }
    }
}

// Initialize the particle system
const particleSystem = new ParticleSystem();

// Export for global access
window.ParticleSystem = particleSystem;
