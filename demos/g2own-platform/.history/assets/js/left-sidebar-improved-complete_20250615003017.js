/**
 * Enhanced Left Sidebar Controller - Complete Implementation
 * Always-visible icons that disappear on hover to show full sidebar
 */

class ImprovedLeftSidebarController {
    constructor() {
        // Find existing sidebar
        this.sidebar = document.getElementById('left-sidebar');
        if (!this.sidebar) {
            console.error('❌ Left sidebar element not found');
            return;
        }
        
        // System elements
        this.hoverZone = null;
        this.edgeIndicator = null;
        this.iconPreview = null;
        
        // State management
        this.isHovering = false;
        this.hasUserDiscovered = localStorage.getItem('sidebar-discovered') === 'true';
        
        // Configuration
        this.config = {
            hoverDelay: 150,
            hideDelay: 300,
            previewIcons: [
                { icon: '🏠', tooltip: 'Dashboard', action: 'dashboard', color: 'blue' },
                { icon: '🛒', tooltip: 'Marketplace', action: 'marketplace', color: 'green' },
                { icon: '📚', tooltip: 'Library', action: 'library', color: 'purple' },
                { icon: '👤', tooltip: 'Profile', action: 'profile', color: 'orange' },
                { icon: '⚙️', tooltip: 'Settings', action: 'settings', color: 'gray' }
            ]
        };
        
        this.init();
    }
    
    init() {
        try {
            this.hideOriginalToggle();
            this.createHoverSystem();
            this.setupEventListeners();
            this.addSystemClasses();
            
            console.log('✅ Improved Left Sidebar initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing sidebar:', error);
            this.fallback();
        }
    }
    
    hideOriginalToggle() {
        const toggle = document.querySelector('.sidebar-floating-toggle');
        if (toggle) {
            toggle.style.display = 'none';
        }
    }
    
    createHoverSystem() {
        // Create hover detection zone
        this.hoverZone = this.createElement('div', {
            className: 'sidebar-hover-zone',
            style: {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100px',
                height: '100vh',
                zIndex: '1001',
                background: 'transparent',
                cursor: 'pointer'
            }
        });
        
        // Create edge indicator
        this.edgeIndicator = this.createElement('div', {
            className: 'sidebar-edge-indicator',
            style: {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '3px',
                height: '100vh',
                background: 'linear-gradient(180deg, transparent 0%, rgba(239,68,68,0.4) 20%, rgba(239,68,68,0.6) 80%, transparent 100%)',
                zIndex: '999',
                opacity: '0.8',
                transition: 'all 0.3s ease'
            }
        });
        
        // Create always-visible icons container
        this.iconPreview = this.createElement('div', {
            className: 'sidebar-icon-preview',
            style: {
                position: 'fixed',
                top: '50%',
                left: '15px',
                transform: 'translateY(-50%)',
                zIndex: '1002',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                opacity: '1',
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }
        });
        
        // Create individual icons
        this.config.previewIcons.forEach((iconConfig, index) => {
            const icon = this.createIcon(iconConfig, index);
            this.iconPreview.appendChild(icon);
        });
        
        // Append all elements
        document.body.appendChild(this.hoverZone);
        document.body.appendChild(this.edgeIndicator);
        document.body.appendChild(this.iconPreview);
        
        console.log('🎯 Hover system elements created');
    }
    
    createIcon(iconConfig, index) {
        const icon = this.createElement('div', {
            className: 'preview-icon',
            'data-action': iconConfig.action,
            'data-tooltip': iconConfig.tooltip,
            'data-color': iconConfig.color,
            tabIndex: '0',
            role: 'button',
            'aria-label': iconConfig.tooltip,
            style: {
                width: '60px',
                height: '60px',
                background: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(239,68,68,0.5)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
                fontSize: '24px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
                transition: 'all 0.3s ease',
                animation: `iconPulse 4s ease-in-out infinite ${index * 0.5}s`
            }
        });
        
        // Add icon content
        icon.innerHTML = `
            <span style="position: relative; z-index: 2;">${iconConfig.icon}</span>
            <div class="icon-background" style="
                position: absolute;
                inset: 0;
                background: linear-gradient(135deg, rgba(239,68,68,0.2), transparent);
                opacity: 0.7;
                transition: opacity 0.3s ease;
            "></div>
            <div class="icon-tooltip" style="
                position: absolute;
                left: calc(100% + 20px);
                top: 50%;
                transform: translateY(-50%);
                background: rgba(0,0,0,0.95);
                color: white;
                padding: 12px 16px;
                borderRadius: 10px;
                fontSize: 14px;
                fontWeight: 600;
                whiteSpace: nowrap;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                zIndex: 1000;
                border: 1px solid rgba(239,68,68,0.3);
                boxShadow: 0 8px 25px rgba(0,0,0,0.5);
                pointerEvents: none;
            ">${iconConfig.tooltip}</div>
        `;
        
        return icon;
    }
    
    createElement(tag, attributes = {}) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else if (key === 'className') {
                element.className = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        
        return element;
    }
    
    setupEventListeners() {
        // Hover zone listeners
        this.hoverZone.addEventListener('mouseenter', () => {
            this.isHovering = true;
            clearTimeout(this.hideTimeout);
            
            setTimeout(() => {
                if (this.isHovering) {
                    this.hideIconsShowSidebar();
                }
            }, this.config.hoverDelay);
        });
        
        this.hoverZone.addEventListener('mouseleave', () => {
            this.isHovering = false;
            
            this.hideTimeout = setTimeout(() => {
                if (!this.isHovering) {
                    this.showIconsHideSidebar();
                }
            }, this.config.hideDelay);
        });
        
        // Sidebar listeners
        this.sidebar.addEventListener('mouseenter', () => {
            this.isHovering = true;
            clearTimeout(this.hideTimeout);
        });
        
        this.sidebar.addEventListener('mouseleave', (e) => {
            if (!this.sidebar.contains(e.relatedTarget) && !this.hoverZone.contains(e.relatedTarget)) {
                this.isHovering = false;
                this.hideTimeout = setTimeout(() => {
                    if (!this.isHovering) {
                        this.showIconsHideSidebar();
                    }
                }, this.config.hideDelay);
            }
        });
        
        // Icon interactions
        this.iconPreview.addEventListener('click', (e) => {
            const icon = e.target.closest('.preview-icon');
            if (icon) {
                this.handleIconClick(icon);
            }
        });
        
        // Icon hover effects
        this.iconPreview.addEventListener('mouseenter', (e) => {
            const icon = e.target.closest('.preview-icon');
            if (icon) {
                this.showTooltip(icon);
                this.addHoverEffect(icon);
            }
        }, true);
        
        this.iconPreview.addEventListener('mouseleave', (e) => {
            const icon = e.target.closest('.preview-icon');
            if (icon) {
                this.hideTooltip(icon);
                this.removeHoverEffect(icon);
            }
        }, true);
        
        console.log('👂 Event listeners setup complete');
    }
    
    hideIconsShowSidebar() {
        // Hide icons
        this.iconPreview.style.opacity = '0';
        this.iconPreview.style.transform = 'translateY(-50%) translateX(-50px)';
        this.iconPreview.style.pointerEvents = 'none';
        
        // Hide edge indicator
        this.edgeIndicator.style.opacity = '0';
        this.edgeIndicator.style.width = '0';
        
        // Show sidebar
        this.sidebar.style.transform = 'translateX(0)';
        this.sidebar.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        
        console.log('✨ Icons hidden, sidebar shown');
    }
    
    showIconsHideSidebar() {
        // Show icons
        this.iconPreview.style.opacity = '1';
        this.iconPreview.style.transform = 'translateY(-50%)';
        this.iconPreview.style.pointerEvents = 'all';
        
        // Show edge indicator
        this.edgeIndicator.style.opacity = '0.8';
        this.edgeIndicator.style.width = '3px';
        
        // Hide sidebar
        this.sidebar.style.transform = 'translateX(-100%)';
        this.sidebar.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        
        console.log('✨ Icons shown, sidebar hidden');
    }
    
    handleIconClick(icon) {
        const action = icon.getAttribute('data-action');
        const tooltip = icon.getAttribute('data-tooltip');
        
        console.log('🎯 Icon clicked:', action);
        
        // Show sidebar after click
        this.hideIconsShowSidebar();
        
        // Handle specific actions
        switch (action) {
            case 'dashboard':
                this.scrollToSection('#hero');
                break;
            case 'marketplace':
                this.scrollToSection('#marketplace');
                break;
            case 'library':
                this.scrollToSection('#featured-games');
                break;
            case 'profile':
                this.toggleProfile();
                break;
            case 'settings':
                this.openSettings();
                break;
        }
        
        this.showNotification(`Opening ${tooltip}`, 'info');
        this.markDiscovered();
    }
    
    showTooltip(icon) {
        const tooltip = icon.querySelector('.icon-tooltip');
        if (tooltip) {
            tooltip.style.opacity = '1';
            tooltip.style.visibility = 'visible';
            tooltip.style.transform = 'translateY(-50%) translateX(10px)';
        }
    }
    
    hideTooltip(icon) {
        const tooltip = icon.querySelector('.icon-tooltip');
        if (tooltip) {
            tooltip.style.opacity = '0';
            tooltip.style.visibility = 'hidden';
            tooltip.style.transform = 'translateY(-50%)';
        }
    }
    
    addHoverEffect(icon) {
        icon.style.transform = 'scale(1.1)';
        icon.style.borderColor = 'rgba(239,68,68,0.8)';
        icon.style.boxShadow = '0 12px 30px rgba(239,68,68,0.3)';
        icon.style.color = '#f87171';
        
        const background = icon.querySelector('.icon-background');
        if (background) {
            background.style.opacity = '1';
        }
    }
    
    removeHoverEffect(icon) {
        icon.style.transform = '';
        icon.style.borderColor = '';
        icon.style.boxShadow = '';
        icon.style.color = '';
        
        const background = icon.querySelector('.icon-background');
        if (background) {
            background.style.opacity = '0.7';
        }
    }
    
    scrollToSection(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    toggleProfile() {
        const profile = document.getElementById('sidebar-profile');
        if (profile) {
            profile.classList.toggle('hidden');
        }
    }
    
    openSettings() {
        console.log('⚙️ Opening settings');
        // Could open a settings modal or navigate to settings page
    }
    
    showNotification(message, type) {
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
        // Could implement actual notification system here
    }
    
    markDiscovered() {
        if (!this.hasUserDiscovered) {
            this.hasUserDiscovered = true;
            localStorage.setItem('sidebar-discovered', 'true');
            
            // Stop pulsing animations
            this.iconPreview.querySelectorAll('.preview-icon').forEach(icon => {
                icon.style.animation = 'none';
            });
            
            console.log('🎉 User discovered sidebar system');
        }
    }
    
    addSystemClasses() {
        document.body.classList.add('sidebar-system');
        if (this.hasUserDiscovered) {
            document.body.classList.add('user-discovered');
        }
        
        // Initialize with sidebar hidden
        this.sidebar.style.transform = 'translateX(-100%)';
        this.sidebar.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    }
    
    fallback() {
        console.warn('⚠️ Falling back to original toggle');
        const toggle = document.querySelector('.sidebar-floating-toggle');
        if (toggle) {
            toggle.style.display = '';
        }
    }
    
    destroy() {
        [this.hoverZone, this.edgeIndicator, this.iconPreview].forEach(element => {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        
        document.body.classList.remove('sidebar-system', 'user-discovered');
        
        const toggle = document.querySelector('.sidebar-floating-toggle');
        if (toggle) {
            toggle.style.display = '';
        }
    }
}

// CSS Animations
const style = document.createElement('style');
style.textContent = `
    @keyframes iconPulse {
        0%, 100% {
            box-shadow: 0 8px 25px rgba(0,0,0,0.4);
        }
        50% {
            box-shadow: 0 8px 25px rgba(239,68,68,0.2), 0 0 0 4px rgba(239,68,68,0.1);
        }
    }
    
    .sidebar-system .sidebar-floating-toggle {
        display: none !important;
    }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Improved Left Sidebar');
    
    setTimeout(() => {
        try {
            window.leftSidebarController = new ImprovedLeftSidebarController();
            window.debugSidebar = () => console.log({
                isHovering: window.leftSidebarController.isHovering,
                hasUserDiscovered: window.leftSidebarController.hasUserDiscovered,
                elementsCreated: {
                    hoverZone: !!window.leftSidebarController.hoverZone,
                    edgeIndicator: !!window.leftSidebarController.edgeIndicator,
                    iconPreview: !!window.leftSidebarController.iconPreview
                }
            });
            
            console.log('✅ Improved Left Sidebar initialized successfully');
            console.log('💡 Type "debugSidebar()" in console for debug info');
            
        } catch (error) {
            console.error('❌ Failed to initialize improved sidebar:', error);
        }
    }, 100);
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImprovedLeftSidebarController;
}
