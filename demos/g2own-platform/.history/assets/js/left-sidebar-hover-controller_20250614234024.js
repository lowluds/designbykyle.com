// Enhanced Left Sidebar Controller with Hover System
// Extends the existing LeftSidebarController with hover-triggered functionality

class EnhancedLeftSidebarController extends LeftSidebarController {
    constructor() {
        super();
        
        // Hover system elements
        this.hoverZone = null;
        this.edgeIndicator = null;
        this.iconPreview = null;
        this.firstTimeHint = null;
        this.breadcrumb = null;
        
        // State management
        this.hoverTimeout = null;
        this.hideTimeout = null;
        this.isHovering = false;
        this.isPreviewMode = false;
        this.hasUserDiscovered = localStorage.getItem('sidebar-discovered') === 'true';
        this.mousePosition = { x: 0, y: 0 };
        
        // Initialize enhanced features
        this.initHoverSystem();
    }
    
    initHoverSystem() {
        console.log('Initializing enhanced hover system...');
        this.createHoverElements();
        this.setupHoverListeners();
        this.setupMagneticEffects();
        this.initFirstTimeExperience();
        this.setupSmartHiding();
        this.setupPerformanceOptimizations();
    }
    
    createHoverElements() {
        // Create hover detection zone
        this.hoverZone = document.createElement('div');
        this.hoverZone.className = 'sidebar-hover-zone';
        document.body.appendChild(this.hoverZone);
        
        // Create edge indicator
        this.edgeIndicator = document.createElement('div');
        this.edgeIndicator.className = 'sidebar-edge-indicator sidebar-indicators';
        document.body.appendChild(this.edgeIndicator);
        
        // Create icon preview strip
        this.iconPreview = document.createElement('div');
        this.iconPreview.className = 'sidebar-icon-preview sidebar-indicators';
        this.iconPreview.innerHTML = `
            <div class="preview-icon" data-tooltip="Dashboard" data-action="dashboard" tabindex="0" role="button" aria-label="Go to Dashboard">🏠</div>
            <div class="preview-icon" data-tooltip="Marketplace" data-action="marketplace" tabindex="0" role="button" aria-label="Browse Marketplace">🛒</div>
            <div class="preview-icon" data-tooltip="Library" data-action="library" tabindex="0" role="button" aria-label="View Library">📚</div>
            <div class="preview-icon" data-tooltip="Profile" data-action="profile" tabindex="0" role="button" aria-label="User Profile">👤</div>
            <div class="preview-icon" data-tooltip="Settings" data-action="settings" tabindex="0" role="button" aria-label="Settings">⚙️</div>
        `;
        document.body.appendChild(this.iconPreview);
        
        // Create breadcrumb trail
        this.breadcrumb = document.createElement('div');
        this.breadcrumb.className = 'sidebar-breadcrumb sidebar-indicators';
        this.breadcrumb.innerHTML = `
            <div class="breadcrumb-dot" role="presentation"></div>
            <div class="breadcrumb-dot" role="presentation"></div>
            <div class="breadcrumb-dot" role="presentation"></div>
        `;
        document.body.appendChild(this.breadcrumb);
        
        // Create first-time hint (only for new users)
        if (!this.hasUserDiscovered) {
            this.firstTimeHint = document.createElement('div');
            this.firstTimeHint.className = 'sidebar-first-time-hint';
            this.firstTimeHint.setAttribute('role', 'tooltip');
            this.firstTimeHint.setAttribute('aria-label', 'Hover here to access navigation menu');
            document.body.appendChild(this.firstTimeHint);
            
            // Auto-hide hint after 10 seconds
            setTimeout(() => {
                if (this.firstTimeHint && !this.hasUserDiscovered) {
                    this.firstTimeHint.classList.add('hidden');
                }
            }, 10000);
        }
        
        // Add system wrapper class
        document.body.classList.add('sidebar-system');
        if (this.hasUserDiscovered) {
            document.body.classList.add('user-discovered');
        }
        
        console.log('Hover elements created successfully');
    }
    
    setupHoverListeners() {
        let mouseEnterTimeout;
        let mouseLeaveTimeout;
        
        // Track mouse position globally
        document.addEventListener('mousemove', (e) => {
            this.mousePosition = { x: e.clientX, y: e.clientY };
        });
        
        // Main hover zone interactions
        this.hoverZone.addEventListener('mouseenter', (e) => {
            clearTimeout(mouseLeaveTimeout);
            clearTimeout(this.hideTimeout);
            
            this.isHovering = true;
            this.edgeIndicator.classList.add('hover-active');
            
            // Show preview after short delay
            mouseEnterTimeout = setTimeout(() => {
                if (this.isHovering) {
                    this.showPreview();
                }
            }, 200);
        });
        
        this.hoverZone.addEventListener('mouseleave', (e) => {
            clearTimeout(mouseEnterTimeout);
            
            this.isHovering = false;
            this.edgeIndicator.classList.remove('hover-active');
            
            // Hide with delay
            mouseLeaveTimeout = setTimeout(() => {
                if (!this.isHovering) {
                    this.hidePreview();
                }
            }, 300);
        });
        
        // Advanced hover detection for sidebar itself
        this.sidebar.addEventListener('mouseenter', () => {
            clearTimeout(this.hideTimeout);
            this.isHovering = true;
            this.showFullSidebar();
        });
        
        this.sidebar.addEventListener('mouseleave', (e) => {
            // Check if mouse is moving to a child element or preview icons
            if (!this.sidebar.contains(e.relatedTarget) && !this.iconPreview.contains(e.relatedTarget)) {
                this.isHovering = false;
                this.hideTimeout = setTimeout(() => {
                    if (!this.isHovering) {
                        this.hideSidebar();
                    }
                }, 500);
            }
        });
        
        // Icon preview interactions
        this.iconPreview.addEventListener('mouseenter', () => {
            clearTimeout(this.hideTimeout);
            this.isHovering = true;
        });
        
        this.iconPreview.addEventListener('mouseleave', (e) => {
            // Only hide if not moving to sidebar
            if (!this.sidebar.contains(e.relatedTarget)) {
                this.isHovering = false;
                this.hideTimeout = setTimeout(() => {
                    if (!this.isHovering) {
                        this.hidePreview();
                    }
                }, 300);
            }
        });
        
        // Click and keyboard handlers for preview icons
        this.iconPreview.querySelectorAll('.preview-icon').forEach((icon, index) => {
            // Click handlers
            icon.addEventListener('click', () => {
                this.handlePreviewIconClick(icon.dataset.action);
            });
            
            // Keyboard handlers
            icon.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handlePreviewIconClick(icon.dataset.action);
                }
            });
        });
        
        console.log('Hover listeners setup complete');
    }
    
    setupMagneticEffects() {
        this.iconPreview.querySelectorAll('.preview-icon').forEach(icon => {
            icon.addEventListener('mouseenter', () => {
                icon.classList.add('magnetic');
                this.createRipple(icon);
            });
            
            icon.addEventListener('mouseleave', () => {
                icon.classList.remove('magnetic');
            });
            
            // Enhanced magnetic effect based on distance
            icon.addEventListener('mousemove', (e) => {
                const rect = icon.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const distance = Math.sqrt(
                    Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
                );
                
                if (distance < 50) {
                    const intensity = (50 - distance) / 50;
                    icon.style.transform = `scale(${1 + intensity * 0.1})`;
                }
            });
        });
    }
    
    initFirstTimeExperience() {
        if (!this.hasUserDiscovered) {
            // Track user interaction
            const trackDiscovery = () => {
                this.hasUserDiscovered = true;
                localStorage.setItem('sidebar-discovered', 'true');
                document.body.classList.add('user-discovered');
                
                if (this.firstTimeHint) {
                    this.firstTimeHint.classList.add('hidden');
                    setTimeout(() => {
                        if (this.firstTimeHint && this.firstTimeHint.parentNode) {
                            this.firstTimeHint.parentNode.removeChild(this.firstTimeHint);
                            this.firstTimeHint = null;
                        }
                    }, 500);
                }
                
                this.emitEvent('sidebar:discovered');
            };
            
            // Track various discovery methods
            this.hoverZone.addEventListener('mouseenter', trackDiscovery, { once: true });
            this.iconPreview.addEventListener('mouseenter', trackDiscovery, { once: true });
            this.sidebar.addEventListener('mouseenter', trackDiscovery, { once: true });
        }
    }
    
    setupSmartHiding() {
        let userActiveTimeout;
        let scrollTimeout;
        
        // Hide indicators when user is actively using the main content
        document.addEventListener('mousemove', (e) => {
            // If mouse is far from left edge, reduce indicator visibility
            if (e.clientX > 200 && !this.isHovering) {
                clearTimeout(userActiveTimeout);
                this.setIndicatorsState('dimmed');
                
                userActiveTimeout = setTimeout(() => {
                    this.setIndicatorsState('normal');
                }, 3000);
            }
        });
        
        // Hide indicators during scrolling
        window.addEventListener('scroll', () => {
            if (!this.isHovering) {
                this.setIndicatorsState('hidden');
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    this.setIndicatorsState('normal');
                }, 1000);
            }
        });
        
        // Hide on window blur/focus
        window.addEventListener('blur', () => {
            this.setIndicatorsState('dimmed');
        });
        
        window.addEventListener('focus', () => {
            this.setIndicatorsState('normal');
        });
    }
    
    setupPerformanceOptimizations() {
        // Use requestAnimationFrame for smooth animations
        this.rafId = null;
        
        // Throttle mouse events
        this.throttledMouseMove = this.throttle((e) => {
            this.handleMouseMove(e);
        }, 16); // 60fps
        
        document.addEventListener('mousemove', this.throttledMouseMove);
        
        // Intersection Observer for visibility detection
        if ('IntersectionObserver' in window) {
            this.visibilityObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.target === this.hoverZone && !entry.isIntersecting) {
                        this.hideSidebar();
                    }
                });
            });
            
            this.visibilityObserver.observe(this.hoverZone);
        }
    }
    
    showPreview() {
        this.isPreviewMode = true;
        this.sidebar.classList.add('hover-preview');
        this.sidebar.classList.remove('mouse-left');
        this.iconPreview.classList.add('show');
        this.breadcrumb.classList.add('show');
        
        // Animate icons in sequence
        this.iconPreview.querySelectorAll('.preview-icon').forEach((icon, index) => {
            setTimeout(() => {
                icon.style.transform = 'translateY(0) scale(1)';
                icon.style.opacity = '1';
            }, index * 50);
        });
        
        this.emitEvent('sidebar:preview-shown');
        console.log('Preview mode activated');
    }
    
    showFullSidebar() {
        this.isPreviewMode = false;
        this.sidebar.classList.remove('hover-preview');
        this.sidebar.classList.add('hover-active');
        this.sidebar.classList.remove('mouse-left');
        
        this.emitEvent('sidebar:full-shown');
        console.log('Full sidebar activated');
    }
    
    hidePreview() {
        this.isPreviewMode = false;
        this.sidebar.classList.remove('hover-preview');
        this.iconPreview.classList.remove('show');
        this.breadcrumb.classList.remove('show');
        
        this.emitEvent('sidebar:preview-hidden');
        console.log('Preview mode hidden');
    }
    
    hideSidebar() {
        this.sidebar.classList.remove('hover-active', 'hover-preview');
        this.sidebar.classList.add('mouse-left');
        this.iconPreview.classList.remove('show');
        this.breadcrumb.classList.remove('show');
        
        // Reset icon animations
        this.iconPreview.querySelectorAll('.preview-icon').forEach(icon => {
            icon.style.transform = '';
            icon.style.opacity = '';
        });
        
        this.emitEvent('sidebar:hidden');
        console.log('Sidebar hidden');
    }
    
    setIndicatorsState(state) {
        const elements = [this.edgeIndicator, this.iconPreview, this.breadcrumb];
        
        elements.forEach(element => {
            if (element) {
                element.classList.remove('normal', 'dimmed', 'hidden');
                element.classList.add(state);
            }
        });
    }
    
    handlePreviewIconClick(action) {
        console.log('Preview icon clicked:', action);
        
        const actions = {
            dashboard: () => this.navigateToSection('#dashboard'),
            marketplace: () => this.navigateToSection('#marketplace'),
            library: () => this.navigateToSection('#library'),
            profile: () => this.showProfileMenu(),
            settings: () => this.showSettingsModal()
        };
        
        if (actions[action]) {
            actions[action]();
        }
        
        this.showFullSidebar();
    }
    
    createRipple(element) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        
        element.style.position = 'relative';
        element.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }
    
    navigateToSection(section) {
        console.log('Navigating to:', section);
        this.emitEvent('sidebar:navigation', { section });
        
        // Smooth scroll to section
        const element = document.querySelector(section);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    showProfileMenu() {
        console.log('Showing profile menu');
        this.emitEvent('sidebar:profile-menu');
        
        // If logged in, show profile section
        if (this.isLoggedIn) {
            this.showFullSidebar();
            const profileSection = this.sidebar.querySelector('#sidebar-profile');
            if (profileSection) {
                profileSection.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            // Show sign-in modal
            this.showAuthModal('signin');
        }
    }
    
    // Utility functions
    throttle(func, delay) {
        let timeoutId;
        let lastExecTime = 0;
        return function (...args) {
            const currentTime = Date.now();
            
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    }
    
    handleMouseMove(e) {
        // Custom mouse move handling if needed
        this.mousePosition = { x: e.clientX, y: e.clientY };
    }
    
    // Override parent methods to work with hover system
    open() {
        super.open();
        this.hideHoverElements();
    }
    
    close() {
        super.close();
        this.showHoverElements();
    }
    
    hideHoverElements() {
        const elements = [this.edgeIndicator, this.iconPreview, this.breadcrumb];
        elements.forEach(element => {
            if (element) element.style.display = 'none';
        });
    }
    
    showHoverElements() {
        if (this.edgeIndicator) this.edgeIndicator.style.display = 'block';
        if (this.iconPreview) this.iconPreview.style.display = 'flex';
        if (this.breadcrumb) this.breadcrumb.style.display = 'flex';
    }
    
    // Enhanced event emitter
    emitEvent(eventName, data = {}) {
        const event = new CustomEvent(eventName, {
            detail: { ...data, timestamp: Date.now() }
        });
        document.dispatchEvent(event);
        console.log(`Event emitted: ${eventName}`, data);
    }
    
    // Cleanup method
    destroy() {
        // Clear timeouts
        clearTimeout(this.hoverTimeout);
        clearTimeout(this.hideTimeout);
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
        
        // Remove event listeners
        if (this.throttledMouseMove) {
            document.removeEventListener('mousemove', this.throttledMouseMove);
        }
        
        // Disconnect observers
        if (this.visibilityObserver) {
            this.visibilityObserver.disconnect();
        }
        
        // Remove created elements
        [this.hoverZone, this.edgeIndicator, this.iconPreview, this.breadcrumb, this.firstTimeHint]
            .forEach(element => {
                if (element && element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            });
        
        // Remove body classes
        document.body.classList.remove('sidebar-system', 'user-discovered');
        
        // Call parent cleanup if it exists
        if (super.destroy) {
            super.destroy();
        }
        
        console.log('Enhanced sidebar controller destroyed');
    }
}

// Initialize enhanced controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Enhanced Left Sidebar Controller...');
    
    // Remove old controller if it exists
    if (window.leftSidebarController) {
        if (typeof window.leftSidebarController.destroy === 'function') {
            window.leftSidebarController.destroy();
        }
    }
    
    // Initialize enhanced controller
    try {
        window.leftSidebarController = new EnhancedLeftSidebarController();
        console.log('Enhanced Left Sidebar Controller initialized successfully');
    } catch (error) {
        console.error('Error initializing enhanced sidebar:', error);
        
        // Fallback to basic controller
        console.log('Falling back to basic sidebar controller...');
        window.leftSidebarController = new LeftSidebarController();
    }
});

// Global error handling
window.addEventListener('error', (e) => {
    if (e.message.includes('sidebar') || e.filename.includes('sidebar')) {
        console.warn('Sidebar error detected, checking fallback:', e);
        
        // Ensure we have some form of sidebar controller
        if (!window.leftSidebarController) {
            console.log('Initializing fallback sidebar controller...');
            window.leftSidebarController = new LeftSidebarController();
        }
    }
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedLeftSidebarController;
}
