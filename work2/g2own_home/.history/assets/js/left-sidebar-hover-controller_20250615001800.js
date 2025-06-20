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
        // Create hover detection zone
        this.hoverZone = document.createElement('div');
        this.hoverZone.className = 'sidebar-hover-zone';
        this.hoverZone.setAttribute('data-testid', 'hover-zone');
        document.body.appendChild(this.hoverZone);
        
        // Create edge indicator
        this.edgeIndicator = document.createElement('div');
        this.edgeIndicator.className = 'sidebar-edge-indicator';
        this.edgeIndicator.setAttribute('data-testid', 'edge-indicator');
        document.body.appendChild(this.edgeIndicator);
        
        // Create icon preview container
        this.iconPreview = document.createElement('div');
        this.iconPreview.className = 'sidebar-icon-preview';
        this.iconPreview.setAttribute('data-testid', 'icon-preview');
        
        // Add preview icons
        this.config.previewIcons.forEach((iconConfig, index) => {
            const icon = document.createElement('div');
            icon.className = 'preview-icon';
            icon.setAttribute('data-tooltip', iconConfig.tooltip);
            icon.setAttribute('data-action', iconConfig.action);
            icon.setAttribute('tabindex', '0');
            icon.setAttribute('role', 'button');
            icon.setAttribute('aria-label', iconConfig.tooltip);
            icon.textContent = iconConfig.icon;
            icon.style.animationDelay = `${index * 50}ms`;
            
            this.iconPreview.appendChild(icon);
        });
        
        document.body.appendChild(this.iconPreview);
        
        // Create first-time hint for new users
        if (!this.hasUserDiscovered) {
            this.createFirstTimeHint();
        }
        
        console.log('📱 Hover elements created');
    }
    
    createFirstTimeHint() {
        this.firstTimeHint = document.createElement('div');
        this.firstTimeHint.className = 'sidebar-first-time-hint';
        this.firstTimeHint.setAttribute('data-testid', 'first-time-hint');
        this.firstTimeHint.setAttribute('aria-label', 'Hover near the left edge to open navigation');
        document.body.appendChild(this.firstTimeHint);
        
        // Auto-hide hint after 20 seconds
        setTimeout(() => {
            if (this.firstTimeHint && !this.hasUserDiscovered) {
                this.hideFirstTimeHint();
            }
        }, 20000);
    }
    
    hideOriginalElements() {
        // Hide original floating toggle
        const originalToggle = document.querySelector('.sidebar-floating-toggle');
        if (originalToggle) {
            originalToggle.style.display = 'none';
        }
        
        // Add system classes
        document.body.classList.add('sidebar-system');
        if (this.hasUserDiscovered) {
            document.body.classList.add('user-discovered');
        }
        
        console.log('🔄 Original elements hidden, system classes added');
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
            this.edgeIndicator.classList.add('hover-active');
            
            console.log('🖱️ Mouse entered hover zone');
            
            // Show preview with delay
            mouseEnterTimeout = setTimeout(() => {
                if (this.isHovering) {
                    this.showPreview();
                }
            }, this.config.hoverDelay);
        });
        
        this.hoverZone.addEventListener('mouseleave', (e) => {
            clearTimeout(mouseEnterTimeout);
            
            this.isHovering = false;
            this.edgeIndicator.classList.remove('hover-active');
            
            console.log('🖱️ Mouse left hover zone');
            
            // Hide with delay
            mouseLeaveTimeout = setTimeout(() => {
                if (!this.isHovering) {
                    this.hidePreview();
                }
            }, 300);
        });
        
        // Sidebar hover detection
        this.sidebar.addEventListener('mouseenter', () => {
            clearTimeout(this.hideTimeout);
            this.isHovering = true;
            this.showFullSidebar();
            console.log('🎪 Mouse entered sidebar - showing full sidebar');
        });
        
        this.sidebar.addEventListener('mouseleave', (e) => {
            if (!this.sidebar.contains(e.relatedTarget)) {
                this.isHovering = false;
                this.hideTimeout = setTimeout(() => {
                    if (!this.isHovering) {
                        this.hideSidebar();
                        console.log('👋 Mouse left sidebar - hiding');
                    }
                }, this.config.hideDelay);
            }
        });
        
        // Icon preview interactions
        this.iconPreview.addEventListener('mouseenter', () => {
            clearTimeout(this.hideTimeout);
            this.isHovering = true;
            console.log('📱 Mouse entered icon preview');
        });
        
        this.iconPreview.addEventListener('mouseleave', () => {
            this.isHovering = false;
            this.hideTimeout = setTimeout(() => {
                if (!this.isHovering) {
                    this.hidePreview();
                }
            }, 300);
        });
        
        // Individual icon interactions
        this.setupIconInteractions();
        
        console.log('👂 Hover listeners setup complete');
    }
    
    setupIconInteractions() {
        this.iconPreview.querySelectorAll('.preview-icon').forEach((icon, index) => {
            // Click handler
            icon.addEventListener('click', (e) => {
                e.preventDefault();
                const action = icon.getAttribute('data-action');
                this.handleIconAction(action, index);
                console.log(`🎯 Icon clicked: ${action}`);
            });
            
            // Keyboard handler
            icon.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const action = icon.getAttribute('data-action');
                    this.handleIconAction(action, index);
                }
            });
            
            // Hover effects
            icon.addEventListener('mouseenter', () => {
                this.createRipple(icon);
            });
        });
    }
    
    setupMagneticEffects() {
        // Enhanced magnetic effects with smooth animations
        this.iconPreview.querySelectorAll('.preview-icon').forEach(icon => {
            icon.addEventListener('mouseenter', () => {
                icon.style.transform = 'scale(1.15) translateX(8px)';
            });
            
            icon.addEventListener('mouseleave', () => {
                icon.style.transform = '';
            });
        });
    }
    
    initFirstTimeExperience() {
        if (!this.hasUserDiscovered) {
            const trackDiscovery = () => {
                this.markAsDiscovered();
                console.log('🎉 User discovered the sidebar!');
            };
            
            // Track various discovery methods
            this.hoverZone.addEventListener('mouseenter', trackDiscovery, { once: true });
            this.iconPreview.addEventListener('mouseenter', trackDiscovery, { once: true });
            this.sidebar.addEventListener('mouseenter', trackDiscovery, { once: true });
        }
    }
    
    markAsDiscovered() {
        this.hasUserDiscovered = true;
        localStorage.setItem('sidebar-discovered', 'true');
        document.body.classList.add('user-discovered');
        
        this.hideFirstTimeHint();
        this.showNotification('🎉 Navigation discovered! Hover near the left edge anytime.', 'success');
    }
    
    hideFirstTimeHint() {
        if (this.firstTimeHint) {
            this.firstTimeHint.classList.add('hidden');
            setTimeout(() => {
                if (this.firstTimeHint && this.firstTimeHint.parentNode) {
                    this.firstTimeHint.parentNode.removeChild(this.firstTimeHint);
                    this.firstTimeHint = null;
                }
            }, 500);
        }
    }
    
    setupSmartHiding() {
        let userActiveTimeout;
        let isUserActive = false;
        
        // Track mouse position for smart hiding
        document.addEventListener('mousemove', (e) => {
            if (e.clientX > 400 && !isUserActive) {
                isUserActive = true;
                this.setIndicatorsState('dimmed');
            } else if (e.clientX <= 150 && isUserActive) {
                isUserActive = false;
                this.setIndicatorsState('normal');
            }
            
            clearTimeout(userActiveTimeout);
            userActiveTimeout = setTimeout(() => {
                isUserActive = false;
                this.setIndicatorsState('normal');
            }, 5000);
        });
        
        // Hide during scrolling
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            this.setIndicatorsState('hidden');
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.setIndicatorsState('normal');
            }, 1000);
        });
    }
    
    // Main interaction methods
    showPreview() {
        this.isPreviewMode = true;
        this.iconPreview.classList.add('show');
        
        // Animate icons in sequence
        this.iconPreview.querySelectorAll('.preview-icon').forEach((icon, index) => {
            setTimeout(() => {
                icon.classList.add('animate-in');
            }, index * 50);
        });
        
        this.emitEvent('sidebar:preview-shown');
        console.log('📱 Preview icons shown');
    }
    
    showFullSidebar() {
        this.isPreviewMode = false;
        this.sidebar.classList.remove('hover-preview', 'mouse-left');
        this.sidebar.classList.add('hover-active');
        
        this.emitEvent('sidebar:full-shown');
        console.log('🎪 Full sidebar shown');
    }
    
    hidePreview() {
        this.isPreviewMode = false;
        this.sidebar.classList.remove('hover-preview');
        this.iconPreview.classList.remove('show');
        
        // Reset animations
        this.iconPreview.querySelectorAll('.preview-icon').forEach(icon => {
            icon.classList.remove('animate-in');
            icon.style.transform = '';
        });
        
        this.emitEvent('sidebar:preview-hidden');
        console.log('👋 Preview hidden');
    }
    
    hideSidebar() {
        this.sidebar.classList.remove('hover-active', 'hover-preview');
        this.sidebar.classList.add('mouse-left');
        this.iconPreview.classList.remove('show');
        
        this.emitEvent('sidebar:hidden');
        console.log('👋 Sidebar hidden');
    }
    
    setIndicatorsState(state) {
        const elements = [this.edgeIndicator, this.iconPreview];
        
        elements.forEach(element => {
            if (element) {
                element.classList.remove('normal', 'dimmed', 'hidden');
                if (state !== 'normal') {
                    element.classList.add(state);
                }
            }
        });
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
            this.showFullSidebar();
            this.showNotification(`Opening ${this.config.previewIcons[index].tooltip}`, 'info');
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
            console.warn(`⚠️ Section ${section} not found`);
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
    
    // Override parent methods
    open() {
        super.open();
        this.hideHoverElements();
        console.log('🔄 Sidebar opened manually - hiding hover elements');
    }
    
    close() {
        super.close();
        this.showHoverElements();
        console.log('🔄 Sidebar closed manually - showing hover elements');
    }
    
    hideHoverElements() {
        const elements = [this.edgeIndicator, this.iconPreview, this.hoverZone];
        elements.forEach(element => {
            if (element) element.style.display = 'none';
        });
    }
    
    showHoverElements() {
        if (this.edgeIndicator) this.edgeIndicator.style.display = 'block';
        if (this.iconPreview) this.iconPreview.style.display = 'flex';
        if (this.hoverZone) this.hoverZone.style.display = 'block';
    }
    
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
        [this.hoverZone, this.edgeIndicator, this.iconPreview, this.firstTimeHint]
            .forEach(element => {
                if (element && element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            });
        
        // Clear timeouts
        clearTimeout(this.hoverTimeout);
        clearTimeout(this.hideTimeout);
        
        // Remove body classes
        document.body.classList.remove('sidebar-system', 'user-discovered');
        
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
            isPreviewMode: this.isPreviewMode,
            hasUserDiscovered: this.hasUserDiscovered,
            elementsCreated: {
                hoverZone: !!this.hoverZone,
                edgeIndicator: !!this.edgeIndicator,
                iconPreview: !!this.iconPreview,
                firstTimeHint: !!this.firstTimeHint
            }
        };
    }
}

// Enhanced initialization with error handling
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded - initializing enhanced sidebar');
    
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
            
            console.log('✅ Enhanced Left Sidebar Controller initialized successfully');
            console.log('💡 Type "debugSidebar()" in console for debug info');
            
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

// Global error handler for sidebar
window.addEventListener('error', (e) => {
    if (e.message.includes('sidebar') || e.message.includes('hover')) {
        console.warn('⚠️ Sidebar error detected:', e.message);
        
        // Attempt recovery
        if (window.leftSidebarController && typeof window.leftSidebarController.fallbackToOriginal === 'function') {
            window.leftSidebarController.fallbackToOriginal();
        }
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedLeftSidebarController;
}
