/**
 * G2Own Hybrid Speed Dial FAB - Preserves existing sidebar functionality
 * Adds modern FAB navigation while keeping all 5 current sidebar buttons
 */

class G2OwnHybridSpeedDialFAB {
    constructor() {
        this.isOpen = false;
        this.sidebarOpen = false;
        this.hasUserDiscovered = localStorage.getItem('fab-discovered') === 'true';
        
        // G2Own specific navigation actions
        this.actions = [
            { 
                icon: '🏠', 
                label: 'Home', 
                action: 'home',
                color: '#3B82F6',
                description: 'Back to homepage'
            },
            { 
                icon: '🛒', 
                label: 'Browse', 
                action: 'marketplace',
                color: '#10B981',
                description: 'Browse marketplace'
            },
            { 
                icon: '📚', 
                label: 'Library', 
                action: 'library',
                color: '#8B5CF6',
                description: 'My game library'
            },
            { 
                icon: '🛍️', 
                label: 'Cart', 
                action: 'cart',
                color: '#F59E0B',
                description: 'Shopping cart',
                badge: true
            },
            { 
                icon: '👤', 
                label: 'Menu', 
                action: 'sidebar',
                color: '#EF4444',
                description: 'Full navigation menu'
            }
        ];
        
        this.init();
    }
    
    init() {
        try {
            this.cleanupOverlaySystems();
            this.preserveSidebarFunctionality();
            this.createFAB();
            this.setupEventListeners();
            this.addStyles();
            this.initDiscoveryHints();
            
            console.log('✅ G2Own Hybrid Speed Dial FAB initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Hybrid Speed Dial FAB:', error);
            this.fallback();
        }
    }
    
    cleanupOverlaySystems() {
        // Remove ONLY overlay systems that interfere, PRESERVE sidebar
        const overlayElements = [
            '.sidebar-hover-zone',
            '.sidebar-edge-indicator', 
            '.sidebar-icon-preview',
            '.sidebar-expand-arrow',
            '.sidebar-backdrop'
        ];
        
        overlayElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (el && el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            });
        });
        
        // Clean up interfering body classes
        document.body.classList.remove('sidebar-system', 'user-discovered');
        
        console.log('🧹 Overlay systems cleaned, sidebar preserved');
    }
    
    preserveSidebarFunctionality() {
        const sidebar = document.getElementById('left-sidebar');
        if (!sidebar) {
            console.error('❌ Sidebar not found for preservation');
            return;
        }
        
        // Ensure sidebar is properly positioned but hidden initially
        sidebar.style.position = 'fixed';
        sidebar.style.top = '0';
        sidebar.style.left = '0';
        sidebar.style.height = '100vh';
        sidebar.style.width = '320px';
        sidebar.style.zIndex = '999';
        sidebar.style.transform = 'translateX(-100%)';
        sidebar.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        sidebar.style.overflow = 'auto';
        
        // Ensure all sidebar buttons are clickable
        this.fixSidebarButtons();
        
        // Show any hidden floating toggle
        const originalToggle = sidebar.querySelector('.sidebar-floating-toggle');
        if (originalToggle) {
            originalToggle.style.display = 'block';
        }
        
        console.log('💾 Sidebar functionality preserved with all 5 buttons');
    }
    
    fixSidebarButtons() {
        const sidebar = document.getElementById('left-sidebar');
        if (!sidebar) return;
        
        // Fix z-index and pointer events for all interactive elements
        const interactiveElements = sidebar.querySelectorAll(`
            button, 
            a, 
            .clickable, 
            [role="button"],
            .sidebar-nav a,
            .sidebar-section button,
            #sidebar-auth button,
            .auth-button,
            .nav-link
        `);
        
        interactiveElements.forEach((element, index) => {
            element.style.position = 'relative';
            element.style.zIndex = '20';
            element.style.pointerEvents = 'auto';
            element.style.cursor = 'pointer';
        });
        
        console.log(`🔧 Fixed ${interactiveElements.length} sidebar buttons for interaction`);
    }
    
    createFAB() {
        const fabContainer = document.createElement('div');
        fabContainer.className = 'g2own-hybrid-speed-dial-fab';
        fabContainer.id = 'g2ownHybridFAB';
        
        fabContainer.innerHTML = `
            <!-- Backdrop for closing -->
            <div class="fab-backdrop"></div>
            
            <!-- Action Items -->
            <div class="fab-actions-container">
                ${this.actions.map((action, index) => `
                    <div class="fab-action-item" 
                         data-action="${action.action}"
                         data-label="${action.label}"
                         style="--action-color: ${action.color}; --action-delay: ${index * 0.1}s;">
                        
                        <div class="fab-action-content">
                            <div class="fab-action-icon">${action.icon}</div>
                            ${action.badge ? '<div class="fab-action-badge">2</div>' : ''}
                        </div>
                        
                        <div class="fab-action-tooltip">
                            <div class="fab-tooltip-content">
                                <span class="fab-tooltip-label">${action.label}</span>
                                <span class="fab-tooltip-description">${action.description}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <!-- Main FAB Trigger -->
            <button class="fab-main-trigger" 
                    aria-label="Open quick navigation"
                    aria-expanded="${this.isOpen}">
                <div class="fab-trigger-content">
                    <div class="fab-trigger-icon">
                        <div class="fab-icon-line fab-icon-line-1"></div>
                        <div class="fab-icon-line fab-icon-line-2"></div>
                        <div class="fab-icon-line fab-icon-line-3"></div>
                    </div>
                    <div class="fab-trigger-bg"></div>
                </div>
            </button>
            
            <!-- Discovery Hint -->
            <div class="fab-discovery-hint ${this.hasUserDiscovered ? 'hidden' : ''}">
                <div class="fab-hint-content">
                    <span class="fab-hint-text">Quick Nav</span>
                    <div class="fab-hint-arrow"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(fabContainer);
        this.fabContainer = fabContainer;
        this.mainTrigger = fabContainer.querySelector('.fab-main-trigger');
        
        console.log('🎯 Hybrid Speed Dial FAB created');
    }
    
    addStyles() {
        const fabStyles = document.createElement('style');
        fabStyles.id = 'g2own-hybrid-fab-styles';
        fabStyles.textContent = `
            /* G2Own Hybrid Speed Dial FAB Styles */
            .g2own-hybrid-speed-dial-fab {
                position: fixed;
                bottom: 32px;
                right: 32px;
                z-index: 1000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            /* Backdrop */
            .fab-backdrop {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.2);
                backdrop-filter: blur(4px);
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                z-index: -1;
            }
            
            .g2own-hybrid-speed-dial-fab.open .fab-backdrop {
                opacity: 1;
                visibility: visible;
            }
            
            /* Main FAB Trigger */
            .fab-main-trigger {
                width: 64px;
                height: 64px;
                border: none;
                border-radius: 50%;
                background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
                box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
                cursor: pointer;
                position: relative;
                overflow: hidden;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 10;
            }
            
            .fab-main-trigger:hover {
                transform: scale(1.1);
                box-shadow: 0 12px 35px rgba(239, 68, 68, 0.5);
            }
            
            .fab-main-trigger:active {
                transform: scale(0.95);
            }
            
            .fab-trigger-content {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            }
            
            /* FAB Icon Animation */
            .fab-trigger-icon {
                width: 24px;
                height: 18px;
                position: relative;
                transition: transform 0.3s ease;
            }
            
            .fab-icon-line {
                position: absolute;
                left: 0;
                width: 24px;
                height: 2px;
                background: white;
                border-radius: 1px;
                transition: all 0.3s ease;
            }
            
            .fab-icon-line-1 { top: 0; }
            .fab-icon-line-2 { top: 8px; }
            .fab-icon-line-3 { top: 16px; }
            
            /* Open state animation */
            .g2own-hybrid-speed-dial-fab.open .fab-icon-line-1 {
                transform: rotate(45deg) translate(5px, 5px);
            }
            
            .g2own-hybrid-speed-dial-fab.open .fab-icon-line-2 {
                opacity: 0;
                transform: scale(0);
            }
            
            .g2own-hybrid-speed-dial-fab.open .fab-icon-line-3 {
                transform: rotate(-45deg) translate(7px, -6px);
            }
            
            /* FAB Background Effects */
            .fab-trigger-bg {
                position: absolute;
                inset: 0;
                background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
                border-radius: 50%;
                opacity: 0;
                transform: scale(0.5);
                transition: all 0.3s ease;
            }
            
            .fab-main-trigger:hover .fab-trigger-bg {
                opacity: 1;
                transform: scale(1);
            }
            
            /* Actions Container */
            .fab-actions-container {
                position: absolute;
                bottom: 80px;
                right: 8px;
                display: flex;
                flex-direction: column;
                gap: 16px;
                align-items: flex-end;
            }
            
            /* Individual Action Items */
            .fab-action-item {
                display: flex;
                align-items: center;
                gap: 16px;
                opacity: 0;
                transform: translateY(20px) scale(0.8);
                transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                transition-delay: var(--action-delay);
                cursor: pointer;
            }
            
            .g2own-hybrid-speed-dial-fab.open .fab-action-item {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
            
            .fab-action-content {
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: var(--action-color);
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 6px 20px rgba(0,0,0,0.15);
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .fab-action-item:hover .fab-action-content {
                transform: scale(1.1);
                box-shadow: 0 8px 30px rgba(0,0,0,0.25);
            }
            
            .fab-action-icon {
                font-size: 24px;
                z-index: 2;
                position: relative;
            }
            
            /* Action Badge */
            .fab-action-badge {
                position: absolute;
                top: -4px;
                right: -4px;
                background: #EF4444;
                color: white;
                font-size: 12px;
                font-weight: bold;
                padding: 2px 6px;
                border-radius: 10px;
                min-width: 18px;
                text-align: center;
                box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
                z-index: 3;
            }
            
            /* Tooltips */
            .fab-action-tooltip {
                opacity: 0;
                visibility: hidden;
                transform: translateX(10px);
                transition: all 0.3s ease;
                z-index: 5;
            }
            
            .fab-action-item:hover .fab-action-tooltip {
                opacity: 1;
                visibility: visible;
                transform: translateX(0);
            }
            
            .fab-tooltip-content {
                background: rgba(0, 0, 0, 0.9);
                backdrop-filter: blur(20px);
                color: white;
                padding: 12px 16px;
                border-radius: 12px;
                white-space: nowrap;
                box-shadow: 0 8px 25px rgba(0,0,0,0.3);
                border: 1px solid rgba(255,255,255,0.1);
            }
            
            .fab-tooltip-label {
                display: block;
                font-weight: 600;
                font-size: 14px;
                margin-bottom: 2px;
            }
            
            .fab-tooltip-description {
                display: block;
                font-size: 12px;
                opacity: 0.8;
            }
            
            /* Discovery Hint */
            .fab-discovery-hint {
                position: absolute;
                top: -45px;
                right: 0;
                transition: all 0.3s ease;
            }
            
            .fab-discovery-hint.hidden {
                opacity: 0;
                visibility: hidden;
            }
            
            .fab-hint-content {
                background: rgba(239, 68, 68, 0.9);
                color: white;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 600;
                position: relative;
                box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
            }
            
            .fab-hint-arrow {
                position: absolute;
                top: 100%;
                right: 16px;
                width: 0;
                height: 0;
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-top: 6px solid rgba(239, 68, 68, 0.9);
            }
            
            /* Pulsing Animation */
            @keyframes fabPulse {
                0%, 100% {
                    box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
                }
                50% {
                    box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4), 0 0 0 8px rgba(239, 68, 68, 0.2);
                }
            }
            
            .fab-main-trigger:not(.user-discovered) {
                animation: fabPulse 3s ease-in-out infinite;
            }
            
            /* Ensure sidebar doesn't conflict with FAB */
            #left-sidebar.sidebar-open {
                z-index: 998 !important;
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                .g2own-hybrid-speed-dial-fab {
                    bottom: 24px;
                    right: 24px;
                }
                
                .fab-main-trigger {
                    width: 56px;
                    height: 56px;
                }
                
                .fab-action-content {
                    width: 48px;
                    height: 48px;
                }
                
                .fab-action-icon {
                    font-size: 20px;
                }
            }
            
            /* Accessibility */
            @media (prefers-reduced-motion: reduce) {
                .fab-main-trigger {
                    animation: none;
                }
                
                .fab-action-item,
                .fab-main-trigger,
                .fab-action-content {
                    transition-duration: 0.1s;
                }
            }
            
            /* Focus States */
            .fab-main-trigger:focus {
                outline: 3px solid #EF4444;
                outline-offset: 4px;
            }
        `;
        
        document.head.appendChild(fabStyles);
        console.log('🎨 Hybrid FAB styles added');
    }
    
    setupEventListeners() {
        // Main trigger click
        this.mainTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFAB();
        });
        
        // Action item clicks
        this.fabContainer.addEventListener('click', (e) => {
            const actionItem = e.target.closest('.fab-action-item');
            if (actionItem) {
                e.stopPropagation();
                this.handleActionClick(actionItem);
            }
        });
        
        // Backdrop click to close
        this.fabContainer.querySelector('.fab-backdrop').addEventListener('click', () => {
            this.closeFAB();
        });
        
        // Outside click to close
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.fabContainer.contains(e.target)) {
                this.closeFAB();
            }
            
            // Close sidebar if clicking outside
            if (this.sidebarOpen && !this.isSidebarClick(e.target)) {
                this.hideSidebar();
            }
        });
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.isOpen) this.closeFAB();
                if (this.sidebarOpen) this.hideSidebar();
            }
        });
        
        // Track discovery
        this.mainTrigger.addEventListener('click', () => {
            this.markDiscovered();
        }, { once: true });
        
        console.log('👂 Hybrid FAB event listeners setup');
    }
    
    isSidebarClick(target) {
        const sidebar = document.getElementById('left-sidebar');
        return sidebar && sidebar.contains(target);
    }
    
    toggleFAB() {
        if (this.isOpen) {
            this.closeFAB();
        } else {
            this.openFAB();
        }
    }
    
    openFAB() {
        this.isOpen = true;
        this.fabContainer.classList.add('open');
        this.mainTrigger.setAttribute('aria-expanded', 'true');
        
        console.log('🌟 Hybrid Speed Dial FAB opened');
        this.emitEvent('fab:opened');
    }
    
    closeFAB() {
        this.isOpen = false;
        this.fabContainer.classList.remove('open');
        this.mainTrigger.setAttribute('aria-expanded', 'false');
        
        console.log('🌙 Hybrid Speed Dial FAB closed');
        this.emitEvent('fab:closed');
    }
    
    showSidebar() {
        const sidebar = document.getElementById('left-sidebar');
        if (sidebar) {
            this.sidebarOpen = true;
            sidebar.style.transform = 'translateX(0)';
            sidebar.classList.add('sidebar-open');
            
            // Add backdrop for sidebar
            this.addSidebarBackdrop();
            
            console.log('📖 Original sidebar with 5 buttons shown');
            this.emitEvent('sidebar:opened');
        }
    }
    
    hideSidebar() {
        const sidebar = document.getElementById('left-sidebar');
        if (sidebar) {
            this.sidebarOpen = false;
            sidebar.style.transform = 'translateX(-100%)';
            sidebar.classList.remove('sidebar-open');
            
            // Remove backdrop
            this.removeSidebarBackdrop();
            
            console.log('📕 Original sidebar hidden');
            this.emitEvent('sidebar:closed');
        }
    }
    
    addSidebarBackdrop() {
        if (!document.querySelector('.sidebar-backdrop-hybrid')) {
            const backdrop = document.createElement('div');
            backdrop.className = 'sidebar-backdrop-hybrid';
            backdrop.style.cssText = `
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(2px);
                z-index: 997;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            document.body.appendChild(backdrop);
            
            requestAnimationFrame(() => {
                backdrop.style.opacity = '1';
            });
        }
    }
    
    removeSidebarBackdrop() {
        const backdrop = document.querySelector('.sidebar-backdrop-hybrid');
        if (backdrop) {
            backdrop.style.opacity = '0';
            setTimeout(() => {
                if (backdrop.parentNode) {
                    backdrop.parentNode.removeChild(backdrop);
                }
            }, 300);
        }
    }
    
    handleActionClick(actionItem) {
        const action = actionItem.getAttribute('data-action');
        const label = actionItem.getAttribute('data-label');
        
        console.log(`🎯 Hybrid FAB action clicked: ${action}`);
        
        // Handle specific actions for G2Own
        switch (action) {
            case 'home':
                this.scrollToSection('#hero');
                break;
            case 'marketplace':
                this.scrollToSection('#marketplace');
                break;
            case 'library':
                this.scrollToSection('#featured-games');
                break;
            case 'cart':
                this.openCart();
                break;
            case 'sidebar':
                this.showSidebar();
                break;
        }
        
        this.showNotification(`Opening ${label}`, 'info');
        this.closeFAB();
        
        this.emitEvent('fab:action', { action, label });
    }
    
    scrollToSection(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    openCart() {
        console.log('🛍️ Opening shopping cart');
        this.showNotification('Cart functionality coming soon!', 'info');
    }
    
    markDiscovered() {
        if (!this.hasUserDiscovered) {
            this.hasUserDiscovered = true;
            localStorage.setItem('fab-discovered', 'true');
            
            const hint = this.fabContainer.querySelector('.fab-discovery-hint');
            if (hint) {
                hint.classList.add('hidden');
            }
            
            this.mainTrigger.classList.add('user-discovered');
            
            console.log('🎉 User discovered Hybrid FAB system');
        }
    }
    
    initDiscoveryHints() {
        if (!this.hasUserDiscovered) {
            this.mainTrigger.style.animation = 'fabPulse 3s ease-in-out infinite';
        } else {
            this.mainTrigger.classList.add('user-discovered');
        }
    }
    
    showNotification(message, type) {
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 120px;
            right: 32px;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 1001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
    
    emitEvent(eventName, data = {}) {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    }
    
    updateCartBadge(count) {
        const badge = this.fabContainer.querySelector('.fab-action-badge');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'block' : 'none';
        }
    }
    
    fallback() {
        console.warn('⚠️ Hybrid FAB initialization failed, showing sidebar');
        
        const sidebar = document.getElementById('left-sidebar');
        if (sidebar) {
            sidebar.style.transform = 'translateX(-240px)';
        }
    }
    
    destroy() {
        console.log('🧹 Cleaning up Hybrid Speed Dial FAB');
        
        if (this.fabContainer) {
            this.fabContainer.remove();
        }
        
        this.removeSidebarBackdrop();
        
        const styles = document.getElementById('g2own-hybrid-fab-styles');
        if (styles) {
            styles.remove();
        }
        
        this.fallback();
    }
    
    getDebugInfo() {
        return {
            isOpen: this.isOpen,
            sidebarOpen: this.sidebarOpen,
            hasUserDiscovered: this.hasUserDiscovered,
            actionsCount: this.actions.length,
            fabExists: !!this.fabContainer,
            sidebarExists: !!document.getElementById('left-sidebar')
        };
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing G2Own Hybrid Speed Dial FAB');
    
    setTimeout(() => {
        try {
            // Clean up any existing controllers
            if (window.leftSidebarController && typeof window.leftSidebarController.destroy === 'function') {
                window.leftSidebarController.destroy();
            }
            
            if (window.speedDialFAB && typeof window.speedDialFAB.destroy === 'function') {
                window.speedDialFAB.destroy();
            }
            
            // Initialize Hybrid Speed Dial FAB
            window.hybridSpeedDialFAB = new G2OwnHybridSpeedDialFAB();
            
            // Debug function
            window.debugHybridFAB = () => console.log(window.hybridSpeedDialFAB.getDebugInfo());
            
            console.log('✅ G2Own Hybrid Speed Dial FAB initialized successfully');
            console.log('💡 Type "debugHybridFAB()" in console for debug info');
            
        } catch (error) {
            console.error('❌ Failed to initialize Hybrid Speed Dial FAB:', error);
        }
    }, 100);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = G2OwnHybridSpeedDialFAB;
}
