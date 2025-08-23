/*!
 * Performance-Optimized Intersection Observer
 * GPU-accelerated animations with minimal DOM thrashing
 */

class PerformantIntersectionObserver {
    constructor() {
        this.observers = new Map();
        this.animationQueue = [];
        this.isProcessing = false;
        this.init();
    }

    init() {
        // Single observer with optimized settings
        this.mainObserver = new IntersectionObserver(
            this.handleIntersections.bind(this),
            {
                rootMargin: '50px 0px',
                threshold: [0, 0.1, 0.25],
                // Use passive for better performance
            }
        );

        // Defer element observation to prevent blocking
        this.scheduleObservation();
    }

    scheduleObservation() {
        // Use requestIdleCallback for non-blocking observation
        if (window.requestIdleCallback) {
            requestIdleCallback(() => this.batchObserve(), { timeout: 2000 });
        } else {
            setTimeout(() => this.batchObserve(), 100);
        }
    }

    batchObserve() {        const elementsToObserve = [
            ...document.querySelectorAll('.category-card:not(.observed)'),
            ...document.querySelectorAll('.feature-card:not(.observed)'),
            ...document.querySelectorAll('.benefit-card:not(.observed)'),
            ...document.querySelectorAll('.animate-on-scroll:not(.observed)'),
            ...document.querySelectorAll('.stats-item:not(.observed)'),
            ...document.querySelectorAll('.testimonial-card:not(.observed)')
        ];

        // Process in small chunks to prevent frame drops
        const chunkSize = 8;
        let index = 0;

        const observeChunk = () => {
            const chunk = elementsToObserve.slice(index, index + chunkSize);
            
            chunk.forEach(el => {
                if (el && !el.classList.contains('observed')) {
                    this.mainObserver.observe(el);
                    el.classList.add('observed');
                }
            });
            
            index += chunkSize;
            if (index < elementsToObserve.length) {
                requestAnimationFrame(observeChunk);
            }
        };

        if (elementsToObserve.length > 0) {
            observeChunk();
        }
    }

    handleIntersections(entries) {
        // Queue animations to batch DOM updates
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
                this.queueAnimation(entry.target);
                this.mainObserver.unobserve(entry.target);
            }
        });

        this.processAnimationQueue();
    }

    queueAnimation(element) {
        this.animationQueue.push(element);
    }

    processAnimationQueue() {
        if (this.isProcessing || this.animationQueue.length === 0) return;
        
        this.isProcessing = true;
        
        requestAnimationFrame(() => {
            // Process all queued animations in a single frame
            const elements = this.animationQueue.splice(0);
            
            elements.forEach(element => {
                this.animateElement(element);
            });
            
            this.isProcessing = false;
        });
    }

    animateElement(element) {
        // Force GPU layer creation for smooth animations
        element.style.transform = 'translate3d(0, 0, 0)';
        element.style.willChange = 'transform, opacity';
        
        // Determine animation type based on element
        const animationType = this.getAnimationType(element);
        
        // Apply animation with GPU acceleration
        this.applyAnimation(element, animationType);
        
        // Clean up after animation
        setTimeout(() => {
            element.style.willChange = 'auto';
            element.classList.remove('animating');
        }, 600);
    }

    getAnimationType(element) {
        if (element.classList.contains('category-card')) {
            return 'slideUp';
        } else if (element.classList.contains('feature-card')) {
            return 'fadeInScale';
        } else if (element.classList.contains('stats-item')) {
            return 'countUp';
        } else {
            return 'fadeIn';
        }
    }

    applyAnimation(element, type) {
        element.classList.add('animating');
        
        switch (type) {
            case 'slideUp':
                element.style.opacity = '0';
                element.style.transform = 'translate3d(0, 30px, 0)';
                
                requestAnimationFrame(() => {
                    element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                    element.style.opacity = '1';
                    element.style.transform = 'translate3d(0, 0, 0)';
                });
                break;
                
            case 'fadeInScale':
                element.style.opacity = '0';
                element.style.transform = 'translate3d(0, 0, 0) scale(0.8)';
                
                requestAnimationFrame(() => {
                    element.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    element.style.opacity = '1';
                    element.style.transform = 'translate3d(0, 0, 0) scale(1)';
                });
                break;
                
            case 'countUp':
                this.animateCounter(element);
                break;
                
            default:
                element.style.opacity = '0';
                requestAnimationFrame(() => {
                    element.style.transition = 'opacity 0.4s ease-out';
                    element.style.opacity = '1';
                });
        }
    }

    animateCounter(element) {
        const target = parseInt(element.textContent) || 0;
        const duration = 1500;
        const startTime = performance.now();
        
        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth counting
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(target * easeOut);
            
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };
        
        requestAnimationFrame(updateCounter);
    }

    // Public method to observe new elements dynamically
    observeNewElements() {
        this.scheduleObservation();
    }

    // Clean up resources
    destroy() {
        if (this.mainObserver) {
            this.mainObserver.disconnect();
        }
        this.animationQueue = [];
        this.observers.clear();
    }
}

// Initialize with optimal timing
document.addEventListener('DOMContentLoaded', () => {
    // Use requestIdleCallback for non-blocking initialization
    if (window.requestIdleCallback) {
        requestIdleCallback(() => {
            window.performantObserver = new PerformantIntersectionObserver();
        }, { timeout: 1000 });
    } else {
        setTimeout(() => {
            window.performantObserver = new PerformantIntersectionObserver();
        }, 200);
    }
});

// Re-observe elements when new content is added
window.addEventListener('g2own:content-updated', () => {
    if (window.performantObserver) {
        window.performantObserver.observeNewElements();
    }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (window.performantObserver) {
        window.performantObserver.destroy();
    }
});
