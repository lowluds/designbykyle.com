/**
 * Responsive System Controller for G2Own
 * Handles dynamic responsive behavior and sidebar interactions
 */

class ResponsiveController {
    constructor() {
        this.currentBreakpoint = '';
        this.sidebar = null;
        this.mainContent = null;
        this.sidebarToggle = null;
        this.mobileOverlay = null;
        this.resizeTimeout = null;
        this.isSidebarOpen = false;
        
        this.breakpoints = {
            'mobile-xs': 320,
            'mobile': 480,
            'tablet-sm': 600,
            'tablet': 768,
            'laptop': 1024,
            'desktop': 1200,
            'desktop-lg': 1440,
            'desktop-xl': 1920
        };
        
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.updateResponsiveState();
        this.initSidebarBehavior();
        
        console.log('Responsive controller initialized');
    }
    
    cacheElements() {
        this.sidebar = document.querySelector('.left-sidebar');
        this.mainContent = document.querySelector('.main-content') || document.querySelector('main') || document.body;
        this.sidebarToggle = document.querySelector('.sidebar-toggle') || document.querySelector('[data-sidebar-toggle]');
        this.mobileToggle = document.querySelector('.sidebar-floating-toggle');
        this.mobileOverlay = document.querySelector('.mobile-overlay');
        this.footerButtons = document.querySelectorAll('.footer-link, .social-link');
        this.navButtons = document.querySelectorAll('.nav-link');
        this.containers = document.querySelectorAll('.container');
    }
    
    bindEvents() {
        // Window resize with debouncing
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.updateResponsiveState();
                this.updateSidebarBehavior();
                this.updateButtonSizes();
            }, 100);
        });
        
        // Orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.updateResponsiveState();
                this.updateSidebarBehavior();
            }, 500);
        });
        
        // Sidebar toggle functionality
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
        
        // Touch events for mobile sidebar
        this.initTouchEvents();
    }
    
    getCurrentBreakpoint() {
        const width = window.innerWidth;
        
        if (width < this.breakpoints.mobile) return 'mobile-xs';
        if (width < this.breakpoints['tablet-sm']) return 'mobile';
        if (width < this.breakpoints.tablet) return 'tablet-sm';
        if (width < this.breakpoints.laptop) return 'tablet';
        if (width < this.breakpoints.desktop) return 'laptop';
        if (width < this.breakpoints['desktop-lg']) return 'desktop';
        if (width < this.breakpoints['desktop-xl']) return 'desktop-lg';
        return 'desktop-xl';
    }
    
    updateResponsiveState() {
        const newBreakpoint = this.getCurrentBreakpoint();
        
        if (newBreakpoint !== this.currentBreakpoint) {
            const oldBreakpoint = this.currentBreakpoint;
            this.currentBreakpoint = newBreakpoint;
            
            // Update body class
            document.body.className = document.body.className.replace(/breakpoint-\w+/g, '');
            document.body.classList.add(`breakpoint-${newBreakpoint}`);
            
            // Trigger breakpoint change event
            this.onBreakpointChange(newBreakpoint, oldBreakpoint);
            
            console.log(`Breakpoint changed: ${oldBreakpoint} → ${newBreakpoint}`);
        }
        
        this.updateViewportProperties();
    }
    
    updateViewportProperties() {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        
        // Update CSS custom properties
        document.documentElement.style.setProperty('--vw', `${vw}px`);
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        document.documentElement.style.setProperty('--current-breakpoint', `"${this.currentBreakpoint}"`);
    }
    
    onBreakpointChange(newBreakpoint, oldBreakpoint) {
        // Handle sidebar behavior based on breakpoint
        this.updateSidebarBehavior();
        
        // Update button sizes
        this.updateButtonSizes();
        
        // Update navigation behavior
        this.updateNavigationBehavior();
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('breakpointChange', {
            detail: { newBreakpoint, oldBreakpoint }
        }));
    }
      updateSidebarBehavior() {
        if (!this.sidebar) return;
        
        const isMobile = ['mobile-xs', 'mobile'].includes(this.currentBreakpoint);
        const isTablet = ['tablet-sm', 'tablet'].includes(this.currentBreakpoint);
        
        if (isMobile) {
            // Mobile: Hide sidebar by default, show as overlay
            this.sidebar.classList.add('mobile-mode');
            this.sidebar.classList.remove('desktop-mode', 'tablet-mode');
            // Don't add sidebar-hidden to body, let CSS handle it
        } else if (isTablet) {
            // Tablet: Show sidebar
            this.sidebar.classList.add('tablet-mode');
            this.sidebar.classList.remove('mobile-mode', 'desktop-mode');
            this.sidebar.classList.remove('mobile-active'); // Ensure not in mobile state
        } else {
            // Desktop: Full sidebar
            this.sidebar.classList.add('desktop-mode');
            this.sidebar.classList.remove('mobile-mode', 'tablet-mode');
            this.sidebar.classList.remove('mobile-active'); // Ensure not in mobile state
        }
        
        // Force layout recalculation
        setTimeout(() => {
            this.updateMainContentMargin();
        }, 50);
    }
      updateMainContentMargin() {
        if (!this.mainContent) return;
        
        const sidebar = this.sidebar;
        if (!sidebar) {
            // No sidebar, use full width
            this.mainContent.style.marginLeft = '0';
            this.mainContent.style.width = '100vw';
            return;
        }
        
        const isMobile = ['mobile-xs', 'mobile'].includes(this.currentBreakpoint);
        const isTablet = ['tablet-sm', 'tablet'].includes(this.currentBreakpoint);
        
        if (isMobile) {
            // Mobile: always full width, sidebar is overlay
            this.mainContent.style.marginLeft = '0';
            this.mainContent.style.width = '100vw';
        } else {
            // Desktop/Tablet: adjust for sidebar
            const isCollapsed = sidebar.classList.contains('collapsed');
            const sidebarWidth = isCollapsed ? 
                getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width-collapsed').trim() :
                getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width').trim();
            
            this.mainContent.style.marginLeft = sidebarWidth;
            this.mainContent.style.width = `calc(100vw - ${sidebarWidth})`;
        }
    }
    
    updateButtonSizes() {
        if (!this.footerButtons.length) return;
        
        const baseSize = this.getResponsiveButtonSize();
        const iconSize = baseSize * 0.4;
        
        this.footerButtons.forEach(button => {
            button.style.width = `${baseSize}px`;
            button.style.height = `${baseSize}px`;
            
            const icon = button.querySelector('i');
            if (icon) {
                icon.style.fontSize = `${iconSize}px`;
            }
        });
    }
    
    getResponsiveButtonSize() {
        const width = window.innerWidth;
        
        switch (this.currentBreakpoint) {
            case 'mobile-xs': return Math.max(28, width * 0.08);
            case 'mobile': return Math.max(32, width * 0.07);
            case 'tablet-sm': return Math.max(36, width * 0.06);
            case 'tablet': return Math.max(40, width * 0.05);
            case 'laptop': return Math.max(42, width * 0.04);
            case 'desktop': return Math.max(44, width * 0.035);
            case 'desktop-lg': return Math.max(46, width * 0.03);
            case 'desktop-xl': return Math.max(48, width * 0.025);
            default: return 40;
        }
    }
    
    updateNavigationBehavior() {
        const isMobile = ['mobile-xs', 'mobile'].includes(this.currentBreakpoint);
        
        // Add touch-friendly classes for mobile
        if (isMobile) {
            document.body.classList.add('touch-device');
            this.enableTouchOptimizations();
        } else {
            document.body.classList.remove('touch-device');
            this.disableTouchOptimizations();
        }
    }
    
    enableTouchOptimizations() {
        // Increase touch targets
        this.navButtons.forEach(button => {
            button.style.minHeight = '44px';
            button.style.padding = '12px 16px';
        });
        
        this.footerButtons.forEach(button => {
            button.style.minWidth = '44px';
            button.style.minHeight = '44px';
        });
    }
    
    disableTouchOptimizations() {
        // Reset touch optimizations
        this.navButtons.forEach(button => {
            button.style.minHeight = '';
            button.style.padding = '';
        });
        
        this.footerButtons.forEach(button => {
            button.style.minWidth = '';
            button.style.minHeight = '';
        });
    }
    
    initTouchEvents() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        // Swipe to open/close sidebar on mobile
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipeGesture();
        });
    }
    
    handleSwipeGesture() {
        const swipeThreshold = 100;
        const swipeDistance = touchEndX - touchStartX;
        
        if (Math.abs(swipeDistance) < swipeThreshold) return;
        
        const isMobile = ['mobile-xs', 'mobile'].includes(this.currentBreakpoint);
        if (!isMobile || !this.sidebar) return;
        
        if (swipeDistance > 0 && touchStartX < 50) {
            // Swipe right from left edge - open sidebar
            this.openSidebar();
        } else if (swipeDistance < 0 && this.sidebar.classList.contains('mobile-active')) {
            // Swipe left when sidebar is open - close sidebar
            this.closeSidebar();
        }
    }
      toggleSidebar() {
        if (!this.sidebar) return;
        
        const isMobile = ['mobile-xs', 'mobile'].includes(this.currentBreakpoint);
        
        if (isMobile) {
            if (this.sidebar.classList.contains('mobile-active')) {
                this.closeSidebar();
            } else {
                this.openSidebar();
            }
        } else {
            this.sidebar.classList.toggle('collapsed');
            document.body.classList.toggle('sidebar-collapsed');
        }
        
        // Update main content margin after animation
        setTimeout(() => {
            this.updateMainContentMargin();
        }, 300);
    }
    
    openSidebar() {
        if (!this.sidebar) return;
        
        const isMobile = ['mobile-xs', 'mobile'].includes(this.currentBreakpoint);
        
        if (isMobile) {
            this.sidebar.classList.add('mobile-active');
            if (this.mobileOverlay) {
                this.mobileOverlay.classList.add('active');
            }
            this.isSidebarOpen = true;
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        } else {
            this.sidebar.classList.remove('collapsed');
            document.body.classList.remove('sidebar-collapsed');
        }
        
        setTimeout(() => {
            this.updateMainContentMargin();
        }, 300);
    }
    
    closeSidebar() {
        if (!this.sidebar) return;
        
        const isMobile = ['mobile-xs', 'mobile'].includes(this.currentBreakpoint);
        
        if (isMobile) {
            this.sidebar.classList.remove('mobile-active');
            if (this.mobileOverlay) {
                this.mobileOverlay.classList.remove('active');
            }
            this.isSidebarOpen = false;
            document.body.style.overflow = ''; // Restore scroll
        } else {
            this.sidebar.classList.add('collapsed');
            document.body.classList.add('sidebar-collapsed');
        }
        
        setTimeout(() => {
            this.updateMainContentMargin();
        }, 300);
    }
    
    initSidebarBehavior() {
        // Initialize sidebar behavior and event listeners
        if (this.mobileToggle) {
            this.mobileToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
        
        if (this.mobileOverlay) {
            this.mobileOverlay.addEventListener('click', () => {
                this.closeSidebar();
            });
        }
        
        // Close sidebar on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isSidebarOpen) {
                this.closeSidebar();
            }
        });
        
        // Initial sidebar state setup
        this.updateSidebarBehavior();
    }
    
    // Public API methods
    getBreakpoint() {
        return this.currentBreakpoint;
    }
    
    isMobile() {
        return ['mobile-xs', 'mobile'].includes(this.currentBreakpoint);
    }
    
    isTablet() {
        return ['tablet-sm', 'tablet'].includes(this.currentBreakpoint);
    }
    
    isDesktop() {
        return ['laptop', 'desktop', 'desktop-lg', 'desktop-xl'].includes(this.currentBreakpoint);
    }
}

// Initialize responsive controller when DOM is ready
let responsiveController;

function initResponsiveSystem() {
    responsiveController = new ResponsiveController();
    
    // Make it globally accessible
    window.responsiveController = responsiveController;
    
    console.log('G2Own Responsive System initialized');
}

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initResponsiveSystem);
} else {
    initResponsiveSystem();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponsiveController;
}
