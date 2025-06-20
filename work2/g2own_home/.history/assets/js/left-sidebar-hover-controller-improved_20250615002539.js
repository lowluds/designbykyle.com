/**
 * Enhanced Left Sidebar Controller - IMPROVED UX VERSION
 * Icons are always visible, hover makes them disappear and shows full sidebar
 */

class EnhancedLeftSidebarController extends LeftSidebarController {
    constructor() {
        super();
        
        // Hover system elements
        this.hoverZone = null;
        this.edgeIndicator = null;
        this.iconPreview = null;
        
        // State management
        this.hoverTimeout = null;
        this.hideTimeout = null;
        this.isHovering = false;
        this.hasUserDiscovered = localStorage.getItem('sidebar-discovered') === 'true';
        
        // Configuration
        this.config = {
            hoverDelay: 100,
            hideDelay: 300,
            previewIcons: [
                { icon: '🏠', tooltip: 'Dashboard', action: 'dashboard' },
                { icon: '🛒', tooltip: 'Marketplace', action: 'marketplace' },
                { icon: '📚', tooltip: 'My Library', action: 'library' },
                { icon: '👤', tooltip: 'Profile', action: 'profile' },
                { icon: '⚙️', tooltip: 'Settings', action: 'settings' }
            ]
        };
        
        // Initialize hover system
        this.initHoverSystem();
        
        console.log('✨ Enhanced Left Sidebar Controller initialized (Always-Visible Icons)');
    }
    
    initHoverSystem() {
        try {
            this.createHoverElements();
            this.setupHoverListeners();
            this.setupIconInteractions();
            this.hideOriginalElements();
            this.initUserTracking();
            
            console.log('🎯 Always-visible icon system initialized');
        } catch (error) {
            console.error('❌ Error initializing hover system:', error);
            this.fallbackToOriginal();
        }
    }
    
    createHoverElements() {
        // Create hover detection zone (larger for better UX)
        this.hoverZone = document.createElement('div');
        this.hoverZone.className = 'sidebar-hover-zone';
        this.hoverZone.setAttribute('data-testid', 'hover-zone');
        document.body.appendChild(this.hoverZone);
        
        // Create subtle edge indicator
        this.edgeIndicator = document.createElement('div');
        this.edgeIndicator.className = 'sidebar-edge-indicator';
        this.edgeIndicator.setAttribute('data-testid', 'edge-indicator');
        document.body.appendChild(this.edgeIndicator);
        
        // Create always-visible icon preview container
        this.iconPreview = document.createElement('div');
        this.iconPreview.className = 'sidebar-icon-preview';
        this.iconPreview.setAttribute('data-testid', 'icon-preview');
        
        // Add preview icons with enhanced structure
        this.config.previewIcons.forEach((iconConfig, index) => {
            const icon = document.createElement('div');
            icon.className = 'preview-icon loading';
            icon.setAttribute('data-tooltip', iconConfig.tooltip);
            icon.setAttribute('data-action', iconConfig.action);
            icon.setAttribute('tabindex', '0');
            icon.setAttribute('role', 'button');
            icon.setAttribute('aria-label', iconConfig.tooltip + ' - Click to navigate');
            
            // Enhanced icon content structure
            icon.innerHTML = '<div class="icon-content"><span class="icon-emoji">' + iconConfig.icon + '</span></div>';
            
            // Staggered loading animation
            setTimeout(() => {
                icon.classList.remove('loading');
            }, index * 100);
            
            this.iconPreview.appendChild(icon);
        });
        
        document.body.appendChild(this.iconPreview);
        
        console.log('📱 Always-visible icons created');
    }
    
    hideOriginalElements() {
        // Hide original floating toggle completely
        const originalToggle = document.querySelector('.sidebar-floating-toggle');
        if (originalToggle) {
            originalToggle.style.display = 'none';
        }
        
        // Add system classes
        document.body.classList.add('sidebar-system');
        if (this.hasUserDiscovered) {
            document.body.classList.add('user-discovered');
        }
        
        console.log('🔄 Original elements hidden, always-visible system active');
    }
    
    setupHoverListeners() {
        if (!this.hoverZone || !this.iconPreview || !this.sidebar) {
            console.error('❌ Missing required elements for hover listeners');
            return;
        }
        
        let mouseEnterTimeout;
        let mouseLeaveTimeout;
        
        // Main hover zone detection
        this.hoverZone.addEventListener('mouseenter', (e) => {
            clearTimeout(mouseLeaveTimeout);
            clearTimeout(this.hideTimeout);
            
            this.isHovering = true;
            
            console.log('🖱️ Mouse entered hover zone - hiding icons, showing sidebar');
            
            // Hide icons and show sidebar with delay
            mouseEnterTimeout = setTimeout(() => {
                if (this.isHovering) {
                    this.hideIconsAndShowSidebar();
                }
            }, this.config.hoverDelay);
        });
        
        this.hoverZone.addEventListener('mouseleave', (e) => {
            clearTimeout(mouseEnterTimeout);
            
            this.isHovering = false;
            
            console.log('🖱️ Mouse left hover zone - showing icons, hiding sidebar');
            
            // Show icons and hide sidebar with delay
            mouseLeaveTimeout = setTimeout(() => {
                if (!this.isHovering) {
                    this.showIconsAndHideSidebar();
                }
            }, this.config.hideDelay);
        });
        
        // Sidebar hover detection (keep sidebar open when directly hovering)
        this.sidebar.addEventListener('mouseenter', () => {
            clearTimeout(this.hideTimeout);
            this.isHovering = true;
            console.log('🎪 Mouse entered sidebar - keeping sidebar open');
        });
        
        this.sidebar.addEventListener('mouseleave', (e) => {
            if (!this.sidebar.contains(e.relatedTarget) && !this.hoverZone.contains(e.relatedTarget)) {
                this.isHovering = false;
                this.hideTimeout = setTimeout(() => {
                    if (!this.isHovering) {
                        this.showIconsAndHideSidebar();
                        console.log('👋 Mouse left sidebar completely - showing icons');
                    }
                }, this.config.hideDelay);
            }
        });
        
        console.log('👂 Enhanced hover listeners setup complete');
    }
    
    setupIconInteractions() {
        this.iconPreview.querySelectorAll('.preview-icon').forEach((icon, index) => {
            // Click handler
            icon.addEventListener('click', (e) => {
                e.preventDefault();
                const action = icon.getAttribute('data-action');
                this.handleIconAction(action, index);
                console.log('🎯 Icon clicked: ' + action);
            });
            
            // Keyboard handler
            icon.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const action = icon.getAttribute('data-action');
                    this.handleIconAction(action, index);
                }
            });
            
            // Individual icon hover (shows tooltip)
            icon.addEventListener('mouseenter', () => {
                this.createRipple(icon);
            });
        });
        
        console.log('🎮 Icon interactions setup complete');
    }
    
    initUserTracking() {
        if (!this.hasUserDiscovered) {
            const trackDiscovery = () => {
                this.markAsDiscovered();
                console.log('🎉 User discovered the sidebar system!');
            };
            
            // Track when user first interacts with any icon or hovers
            this.iconPreview.addEventListener('click', trackDiscovery, { once: true });
            this.hoverZone.addEventListener('mouseenter', trackDiscovery, { once: true });
        }
    }
    
    markAsDiscovered() {
        this.hasUserDiscovered = true;
        localStorage.setItem('sidebar-discovered', 'true');
        document.body.classList.add('user-discovered');
        
        this.showNotification('🎉 Navigation discovered! Icons are always available on the left.', 'success');
    }
    
    // Main UX Methods - Icons hide on hover, sidebar shows
    hideIconsAndShowSidebar() {
        // Add transition class for smooth animations
        document.body.classList.add('sidebar-transitioning');
        
        // Hide icons
        this.iconPreview.classList.add('hide-on-hover');
        
        // Hide edge indicator
        this.edgeIndicator.classList.add('hover-active');
        
        // Show full sidebar
        this.sidebar.classList.remove('mouse-left');
        this.sidebar.classList.add('hover-active');
        
        this.emitEvent('sidebar:icons-hidden-sidebar-shown');
        
        // Remove transition class after animation
        setTimeout(() => {
            document.body.classList.remove('sidebar-transitioning');
        }, 600);
        
        console.log('✨ Icons hidden, sidebar shown');
    }
    
    showIconsAndHideSidebar() {
        // Add transition class
        document.body.classList.add('sidebar-transitioning');
        
        // Show icons
        this.iconPreview.classList.remove('hide-on-hover');
        
        // Show edge indicator
        this.edgeIndicator.classList.remove('hover-active');
        
        // Hide sidebar
        this.sidebar.classList.remove('hover-active');
        this.sidebar.classList.add('mouse-left');
        
        this.emitEvent('sidebar:icons-shown-sidebar-hidden');
        
        // Remove transition class after animation
        setTimeout(() => {
            document.body.classList.remove('sidebar-transitioning');
        }, 600);
        
        console.log('✨ Icons shown, sidebar hidden');
    }
    
    handleIconAction(action, index) {
        const actions = {
            dashboard: () => this.navigateToSection('#hero'),
            marketplace: () => this.navigateToSection('#marketplace'),
            library: () => this.navigateToSection('#featured-games'),
            profile: () => this.showProfileMenu(),
            settings: () => this.showSettingsModal()
        };
        
        if (actions[action]) {
            actions[action]();
            // Show sidebar after clicking icon
            this.hideIconsAndShowSidebar();
            this.showNotification('Opening ' + this.config.previewIcons[index].tooltip, 'info');
        }
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
        console.log('🧭 Navigating to:', section);
        this.emitEvent('sidebar:navigation', { section });
        
        const element = document.querySelector(section);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            console.warn('⚠️ Section ' + section + ' not found');
        }
    }
    
    showProfileMenu() {
        console.log('👤 Showing profile menu');
        this.emitEvent('sidebar:profile-menu');
        
        // Toggle user profile section in sidebar
        const profileSection = document.getElementById('sidebar-profile');
        if (profileSection) {
            profileSection.classList.toggle('hidden');
        }
    }
    
    // Override parent methods to work with new system
    open() {
        super.open();
        this.hideIconsAndShowSidebar();
        console.log('🔄 Sidebar opened manually');
    }
    
    close() {
        super.close();
        this.showIconsAndHideSidebar();
        console.log('🔄 Sidebar closed manually');
    }
    
    // Fallback method
    fallbackToOriginal() {
        console.warn('⚠️ Falling back to original sidebar controller');
        
        // Show original floating toggle
        const originalToggle = document.querySelector('.sidebar-floating-toggle');
        if (originalToggle) {
            originalToggle.style.display = '';
        }
        
        // Remove system classes
        document.body.classList.remove('sidebar-system', 'user-discovered');
        
        // Clean up hover elements
        this.destroy();
    }
    
    // Cleanup method
    destroy() {
        console.log('🧹 Cleaning up enhanced sidebar controller');
        
        // Remove created elements
        [this.hoverZone, this.edgeIndicator, this.iconPreview]
            .forEach(element => {
                if (element && element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            });
        
        // Clear timeouts
        clearTimeout(this.hoverTimeout);
        clearTimeout(this.hideTimeout);
        
        // Remove body classes
        document.body.classList.remove('sidebar-system', 'user-discovered', 'sidebar-transitioning');
        
        // Show original elements
        const originalToggle = document.querySelector('.sidebar-floating-toggle');
        if (originalToggle) {
            originalToggle.style.display = '';
        }
        
        // Call parent cleanup
        if (super.destroy) {
            super.destroy();
        }
    }
    
    // Debug method
    getDebugInfo() {
        return {
            isHovering: this.isHovering,
            hasUserDiscovered: this.hasUserDiscovered,
            iconsVisible: !this.iconPreview?.classList.contains('hide-on-hover'),
            sidebarVisible: this.sidebar?.classList.contains('hover-active'),
            elementsCreated: {
                hoverZone: !!this.hoverZone,
                edgeIndicator: !!this.edgeIndicator,
                iconPreview: !!this.iconPreview
            }
        };
    }
}

// Enhanced initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded - initializing always-visible icon sidebar');
    
    // Wait for base controller to load
    setTimeout(() => {
        try {
            // Check if base controller exists
            if (typeof LeftSidebarController === 'undefined') {
                console.error('❌ Base LeftSidebarController not found');
                return;
            }
            
            // Remove old controller if it exists
            if (window.leftSidebarController) {
                if (typeof window.leftSidebarController.destroy === 'function') {
                    window.leftSidebarController.destroy();
                }
            }
            
            // Initialize enhanced controller
            window.leftSidebarController = new EnhancedLeftSidebarController();
            
            // Add debug access
            window.debugSidebar = () => console.log(window.leftSidebarController.getDebugInfo());
            
            console.log('✅ Always-Visible Icon Sidebar Controller initialized successfully');
            console.log('💡 Type "debugSidebar()" in console for debug info');
            console.log('🎯 Icons are now always visible on the left side!');
            
        } catch (error) {
            console.error('❌ Failed to initialize enhanced sidebar:', error);
            console.log('🔄 Falling back to base controller...');
            
            // Fallback to base controller
            if (typeof LeftSidebarController !== 'undefined') {
                window.leftSidebarController = new LeftSidebarController();
            }
        }
    }, 200);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedLeftSidebarController;
}
