/*!
 * Lazy Loading System - Performance Optimized
 * Intelligent loading of components and assets
 */

class LazyComponentLoader {
    constructor() {
        this.loadedComponents = new Set();
        this.pendingComponents = new Map();
        this.imageObserver = null;
        this.componentQueue = [];
        this.isProcessing = false;
        
        this.init();
    }

    init() {
        // Initialize image lazy loading
        this.initImageLazyLoading();
        
        // Set up component lazy loading
        this.setupComponentLoading();
        
        // Preload critical components on idle
        this.schedulePreloading();
    }

    initImageLazyLoading() {
        // Optimized image observer
        this.imageObserver = new IntersectionObserver(
            this.handleImageIntersections.bind(this),
            {
                rootMargin: '100px 0px',
                threshold: 0.01
            }
        );

        // Observe all lazy images
        this.observeLazyImages();
    }

    observeLazyImages() {
        const lazyImages = document.querySelectorAll('img[data-src], .lazy-image');
        lazyImages.forEach(img => {
            this.imageObserver.observe(img);
        });
    }

    handleImageIntersections(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.loadImage(entry.target);
                this.imageObserver.unobserve(entry.target);
            }
        });
    }

    loadImage(img) {
        // Create new image element for preloading
        const imageLoader = new Image();
        
        imageLoader.onload = () => {
            // Use requestAnimationFrame for smooth transition
            requestAnimationFrame(() => {
                img.src = img.dataset.src || img.dataset.original;
                img.classList.remove('lazy-image');
                img.classList.add('loaded');
                
                // Add fade-in effect
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.3s ease';
                
                setTimeout(() => {
                    img.style.opacity = '1';
                }, 10);
            });
        };

        imageLoader.onerror = () => {
            img.classList.add('error');
        };

        // Start loading
        imageLoader.src = img.dataset.src || img.dataset.original;
    }

    setupComponentLoading() {
        // Set up auth component lazy loading
        this.setupAuthLazyLoading();
        
        // Set up navbar lazy loading
        this.setupNavbarLazyLoading();
        
        // Set up modal lazy loading
        this.setupModalLazyLoading();
    }

    setupAuthLazyLoading() {
        const authToggle = document.querySelector('.auth-toggle');
        if (!authToggle) return;

        // Load auth bridge only when user interacts with auth
        let authLoaded = false;
        const loadAuth = () => {
            if (authLoaded) return;
            authLoaded = true;
            
            this.queueComponentLoad('auth', () => {
                if (!window.authBridge) {
                    // Auth bridge should already be loaded, but ensure it's initialized
                    if (window.AuthenticationBridge) {
                        window.authBridge = new window.AuthenticationBridge();
                        this.loadedComponents.add('auth');
                    }
                }
            });
        };

        // Trigger auth loading on first interaction
        authToggle.addEventListener('click', loadAuth, { once: true });
        authToggle.addEventListener('mouseenter', loadAuth, { once: true });
        authToggle.addEventListener('focus', loadAuth, { once: true });
    }

    setupNavbarLazyLoading() {
        // Navbar controller should load when user scrolls or interacts
        let navbarLoaded = false;
        const loadNavbar = () => {
            if (navbarLoaded) return;
            navbarLoaded = true;
            
            this.queueComponentLoad('navbar', () => {
                if (window.NavbarController && !window.navbarController) {
                    window.navbarController = new window.NavbarController();
                    this.loadedComponents.add('navbar');
                }
            });
        };

        // Load navbar on first scroll or interaction
        document.addEventListener('scroll', loadNavbar, { once: true, passive: true });
        document.addEventListener('touchstart', loadNavbar, { once: true, passive: true });
        document.addEventListener('mousemove', loadNavbar, { once: true, passive: true });
    }

    setupModalLazyLoading() {
        // Load modal components only when needed
        document.addEventListener('click', (e) => {
            const modalTrigger = e.target.closest('[data-modal]');
            if (modalTrigger && !this.loadedComponents.has('modal')) {
                this.loadModalComponent(modalTrigger.dataset.modal);
            }
        });
    }

    queueComponentLoad(componentName, loadFunction) {
        this.componentQueue.push({ name: componentName, load: loadFunction });
        this.processComponentQueue();
    }

    processComponentQueue() {
        if (this.isProcessing || this.componentQueue.length === 0) return;
        
        this.isProcessing = true;
        
        // Use requestIdleCallback for non-blocking component loading
        if (window.requestIdleCallback) {
            requestIdleCallback(() => this.processNextComponent(), { timeout: 1000 });
        } else {
            setTimeout(() => this.processNextComponent(), 0);
        }
    }

    processNextComponent() {
        const component = this.componentQueue.shift();
        if (component) {
            try {
                component.load();
            } catch (error) {
                console.error(`Failed to load component: ${component.name}`, error);
            }
        }
        
        this.isProcessing = false;
        
        // Process next component if any
        if (this.componentQueue.length > 0) {
            this.processComponentQueue();
        }
    }

    loadModalComponent(modalType) {
        // Dynamically load modal components
        this.queueComponentLoad('modal', () => {
            // Load modal CSS and JS if not already loaded
            if (!document.querySelector('#modal-styles')) {
                const modalCSS = document.createElement('link');
                modalCSS.id = 'modal-styles';
                modalCSS.rel = 'stylesheet';
                modalCSS.href = 'assets/css/modals.css';
                document.head.appendChild(modalCSS);
            }
            
            this.loadedComponents.add('modal');
        });
    }

    schedulePreloading() {
        // Preload critical components on idle
        if (window.requestIdleCallback) {
            requestIdleCallback(() => {
                this.preloadCriticalComponents();
            }, { timeout: 3000 });
        } else {
            setTimeout(() => {
                this.preloadCriticalComponents();
            }, 2000);
        }
    }

    preloadCriticalComponents() {
        // Preload components that are likely to be used
        const viewport = window.innerHeight;
        const scrollPosition = window.scrollY;
        
        // If user is near auth section, preload auth
        const authSection = document.querySelector('.auth-toggle');
        if (authSection) {
            const authRect = authSection.getBoundingClientRect();
            if (authRect.top < viewport * 2) {
                this.queueComponentLoad('auth-preload', () => {
                    // Just ensure auth bridge is ready
                    if (window.AuthenticationBridge && !window.authBridge) {
                        window.authBridge = new window.AuthenticationBridge();
                    }
                });
            }
        }
        
        // Preload images that are close to viewport
        const nearbyImages = document.querySelectorAll('img[data-src]');
        nearbyImages.forEach(img => {
            const rect = img.getBoundingClientRect();
            if (rect.top < viewport * 1.5) {
                this.imageObserver.observe(img);
            }
        });
    }

    // Public methods
    loadComponentNow(componentName, loadFunction) {
        if (this.loadedComponents.has(componentName)) return;
        
        try {
            loadFunction();
            this.loadedComponents.add(componentName);
        } catch (error) {
            console.error(`Failed to load component immediately: ${componentName}`, error);
        }
    }

    isComponentLoaded(componentName) {
        return this.loadedComponents.has(componentName);
    }

    // Update image observations when new content is added
    updateImageObservations() {
        this.observeLazyImages();
    }

    // Clean up observers
    destroy() {
        if (this.imageObserver) {
            this.imageObserver.disconnect();
        }
        this.componentQueue = [];
        this.loadedComponents.clear();
        this.pendingComponents.clear();
    }
}

// Initialize lazy loading system
document.addEventListener('DOMContentLoaded', () => {
    window.lazyLoader = new LazyComponentLoader();
});

// Update observations when new content is loaded
window.addEventListener('g2own:content-updated', () => {
    if (window.lazyLoader) {
        window.lazyLoader.updateImageObservations();
    }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (window.lazyLoader) {
        window.lazyLoader.destroy();
    }
});

// Utility function to create lazy images
window.createLazyImage = function(src, alt, className = '') {
    const img = document.createElement('img');
    img.dataset.src = src;
    img.alt = alt;
    img.className = `lazy-image ${className}`;
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNGMEYwRjAiLz48L3N2Zz4=';
    
    if (window.lazyLoader && window.lazyLoader.imageObserver) {
        window.lazyLoader.imageObserver.observe(img);
    }
    
    return img;
};
