/**
 * Left Sidebar with Arrow Expand - Professional Implementation
 * Sidebar is slightly open with expand arrow, fixes button interference
 */

class ArrowExpandSidebar {
    constructor() {
        this.sidebar = document.getElementById('left-sidebar');
        if (!this.sidebar) {
            console.error('❌ Left sidebar element not found');
            return;
        }
        
        this.isExpanded = false;
        this.expandArrow = null;
        this.overlayIcons = null;
        
        this.init();
    }
    
    init() {
        try {
            this.hideOriginalElements();
            this.setupPartiallyOpenSidebar();
            this.createExpandArrow();
            this.removeOverlayIcons();
            this.setupEventListeners();
            this.fixButtonLayering();
            
            console.log('✅ Arrow Expand Sidebar initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing arrow expand sidebar:', error);
            this.fallback();
        }
    }
    
    hideOriginalElements() {
        // Hide all previous overlay systems
        const elementsToHide = [
            '.sidebar-floating-toggle',
            '.sidebar-hover-zone',
            '.sidebar-edge-indicator', 
            '.sidebar-icon-preview'
        ];
        
        elementsToHide.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (el) el.style.display = 'none';
            });
        });
        
        // Remove system classes that interfere
        document.body.classList.remove('sidebar-system', 'user-discovered');
        
        console.log('🔄 Original overlay elements hidden');
    }
    
    removeOverlayIcons() {
        // Remove any overlay icons that are interfering with sidebar buttons
        const overlayElements = document.querySelectorAll('.sidebar-icon-preview, .preview-icon');
        overlayElements.forEach(el => {
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
        
        console.log('🗑️ Overlay icons removed to prevent interference');
    }
    
    setupPartiallyOpenSidebar() {
        // Set sidebar to partially open state (showing just icons)
        this.sidebar.style.transform = 'translateX(-240px)'; // Show 80px of 320px width
        this.sidebar.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        this.sidebar.style.position = 'fixed';
        this.sidebar.style.top = '0';
        this.sidebar.style.left = '0';
        this.sidebar.style.height = '100vh';
        this.sidebar.style.width = '320px';
        this.sidebar.style.zIndex = '999'; // Lower than expand arrow
        this.sidebar.style.overflow = 'hidden';
        this.sidebar.style.pointerEvents = 'auto';
        
        // Ensure sidebar content doesn't interfere
        const sidebarContainer = this.sidebar.querySelector('.sidebar-container');
        if (sidebarContainer) {
            sidebarContainer.style.position = 'relative';
            sidebarContainer.style.zIndex = '1';
        }
        
        console.log('📐 Sidebar set to partially open state');
    }
    
    createExpandArrow() {
        // Create expand arrow container
        this.expandArrow = document.createElement('div');
        this.expandArrow.className = 'sidebar-expand-arrow';
        this.expandArrow.setAttribute('role', 'button');
        this.expandArrow.setAttribute('aria-label', 'Expand navigation menu');
        this.expandArrow.setAttribute('tabindex', '0');
        
        this.expandArrow.innerHTML = `
            <div class="arrow-container">
                <div class="arrow-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                </div>
                <div class="arrow-bg"></div>
                <div class="arrow-hover-effect"></div>
            </div>
            <div class="expand-hint">Menu</div>
        `;
        
        // Position and style the arrow
        Object.assign(this.expandArrow.style, {
            position: 'fixed',
            top: '50%',
            left: '80px', // Positioned at edge of partially visible sidebar
            transform: 'translateY(-50%)',
            zIndex: '1001', // Higher than sidebar
            cursor: 'pointer',
            width: '40px',
            height: '60px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.3s ease'
        });
        
        document.body.appendChild(this.expandArrow);
        this.addArrowStyles();
        
        console.log('➡️ Expand arrow created');
    }
    
    addArrowStyles() {
        const arrowStyles = document.createElement('style');
        arrowStyles.id = 'sidebar-arrow-styles';
        arrowStyles.textContent = `
            .sidebar-expand-arrow .arrow-container {
                position: relative;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(20px);
                border: 2px solid rgba(239, 68, 68, 0.5);
                transition: all 0.3s ease;
                overflow: hidden;
            }
            
            .sidebar-expand-arrow:hover .arrow-container {
                background: rgba(239, 68, 68, 0.9);
                border-color: rgba(239, 68, 68, 0.8);
                transform: scale(1.1);
                box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
            }
            
            .sidebar-expand-arrow .arrow-icon {
                color: #ef4444;
                transition: all 0.3s ease;
                z-index: 2;
                position: relative;
            }
            
            .sidebar-expand-arrow:hover .arrow-icon {
                color: white;
                transform: translateX(2px);
            }
            
            .sidebar-expand-arrow.expanded .arrow-icon {
                transform: rotate(180deg);
            }
            
            .sidebar-expand-arrow .arrow-bg {
                position: absolute;
                inset: 0;
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), transparent);
                opacity: 0.7;
                transition: opacity 0.3s ease;
            }
            
            .sidebar-expand-arrow:hover .arrow-bg {
                opacity: 1;
            }
            
            .sidebar-expand-arrow .arrow-hover-effect {
                position: absolute;
                inset: 0;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
                opacity: 0;
                transform: scale(0.5);
                transition: all 0.3s ease;
            }
            
            .sidebar-expand-arrow:hover .arrow-hover-effect {
                opacity: 1;
                transform: scale(1);
            }
            
            .sidebar-expand-arrow .expand-hint {
                font-size: 11px;
                color: rgba(239, 68, 68, 0.8);
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                opacity: 0.8;
                transition: all 0.3s ease;
                white-space: nowrap;
            }
            
            .sidebar-expand-arrow:hover .expand-hint {
                color: #ef4444;
                opacity: 1;
            }
            
            .sidebar-expand-arrow.expanded .expand-hint {
                opacity: 0;
            }
            
            /* Pulsing animation for discoverability */
            @keyframes arrowPulse {
                0%, 100% {
                    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
                }
                50% {
                    box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
                }
            }
            
            .sidebar-expand-arrow .arrow-container {
                animation: arrowPulse 3s ease-in-out infinite;
            }
            
            .sidebar-expand-arrow.user-interacted .arrow-container {
                animation: none;
            }
            
            /* Focus states for accessibility */
            .sidebar-expand-arrow:focus {
                outline: none;
            }
            
            .sidebar-expand-arrow:focus .arrow-container {
                outline: 3px solid #ef4444;
                outline-offset: 4px;
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
                .sidebar-expand-arrow {
                    left: 60px !important;
                    width: 35px;
                    height: 50px;
                }
                
                .sidebar-expand-arrow .arrow-container {
                    width: 35px;
                    height: 35px;
                }
                
                .sidebar-expand-arrow .expand-hint {
                    font-size: 10px;
                }
            }
            
            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                .sidebar-expand-arrow .arrow-container {
                    animation: none;
                }
                
                .sidebar-expand-arrow,
                .sidebar-expand-arrow .arrow-container,
                .sidebar-expand-arrow .arrow-icon {
                    transition: none;
                }
            }
        `;
        
        document.head.appendChild(arrowStyles);
    }
    
    fixButtonLayering() {
        // Fix z-index issues with sidebar buttons
        const sidebarButtons = this.sidebar.querySelectorAll('button, a, .clickable, [role="button"]');
        sidebarButtons.forEach((button, index) => {
            button.style.position = 'relative';
            button.style.zIndex = '10'; // Higher than background elements
            button.style.pointerEvents = 'auto';
        });
        
        // Specifically fix navigation buttons
        const navButtons = this.sidebar.querySelectorAll('.sidebar-nav a, .sidebar-section button');
        navButtons.forEach(button => {
            button.style.zIndex = '20';
            button.style.position = 'relative';
        });
        
        // Fix authentication buttons
        const authButtons = this.sidebar.querySelectorAll('#sidebar-auth button');
        authButtons.forEach(button => {
            button.style.zIndex = '25';
            button.style.position = 'relative';
        });
        
        console.log('🔧 Button layering fixed, z-index issues resolved');
    }
    
    setupEventListeners() {
        // Arrow click handler
        this.expandArrow.addEventListener('click', () => {
            this.toggleSidebar();
        });
        
        // Arrow keyboard handler
        this.expandArrow.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleSidebar();
            }
        });
        
        // Arrow hover handler for additional expansion
        this.expandArrow.addEventListener('mouseenter', () => {
            if (!this.isExpanded) {
                this.expandSidebar();
            }
        });
        
        // Click outside to collapse
        document.addEventListener('click', (e) => {
            if (this.isExpanded && 
                !this.sidebar.contains(e.target) && 
                !this.expandArrow.contains(e.target)) {
                this.collapseSidebar();
            }
        });
        
        // Escape key to collapse
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isExpanded) {
                this.collapseSidebar();
            }
        });
        
        // Track user interaction for removing pulse
        this.expandArrow.addEventListener('click', () => {
            this.expandArrow.classList.add('user-interacted');
            localStorage.setItem('sidebar-arrow-discovered', 'true');
        }, { once: true });
        
        console.log('👂 Event listeners setup complete');
    }
    
    toggleSidebar() {
        if (this.isExpanded) {
            this.collapseSidebar();
        } else {
            this.expandSidebar();
        }
    }
    
    expandSidebar() {
        this.isExpanded = true;
        
        // Fully open sidebar
        this.sidebar.style.transform = 'translateX(0)';
        
        // Update arrow state
        this.expandArrow.classList.add('expanded');
        this.expandArrow.style.left = '280px'; // Move arrow to right edge of open sidebar
        
        // Add backdrop
        this.addBackdrop();
        
        console.log('📖 Sidebar expanded');
        this.emitEvent('sidebar:expanded');
    }
    
    collapseSidebar() {
        this.isExpanded = false;
        
        // Partially close sidebar
        this.sidebar.style.transform = 'translateX(-240px)';
        
        // Update arrow state
        this.expandArrow.classList.remove('expanded');
        this.expandArrow.style.left = '80px'; // Move arrow back to edge position
        
        // Remove backdrop
        this.removeBackdrop();
        
        console.log('📕 Sidebar collapsed');
        this.emitEvent('sidebar:collapsed');
    }
    
    addBackdrop() {
        if (!document.querySelector('.sidebar-backdrop')) {
            const backdrop = document.createElement('div');
            backdrop.className = 'sidebar-backdrop';
            backdrop.style.cssText = `
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.2);
                backdrop-filter: blur(2px);
                z-index: 998;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            document.body.appendChild(backdrop);
            
            // Trigger opacity transition
            requestAnimationFrame(() => {
                backdrop.style.opacity = '1';
            });
        }
    }
    
    removeBackdrop() {
        const backdrop = document.querySelector('.sidebar-backdrop');
        if (backdrop) {
            backdrop.style.opacity = '0';
            setTimeout(() => {
                if (backdrop.parentNode) {
                    backdrop.parentNode.removeChild(backdrop);
                }
            }, 300);
        }
    }
    
    emitEvent(eventName, data = {}) {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    }
    
    fallback() {
        console.warn('⚠️ Falling back to original sidebar');
        
        // Show original elements if they exist
        const originalToggle = document.querySelector('.sidebar-floating-toggle');
        if (originalToggle) {
            originalToggle.style.display = '';
        }
        
        // Reset sidebar
        if (this.sidebar) {
            this.sidebar.style.transform = '';
            this.sidebar.style.transition = '';
        }
    }
    
    destroy() {
        console.log('🧹 Cleaning up arrow expand sidebar');
        
        // Remove created elements
        if (this.expandArrow && this.expandArrow.parentNode) {
            this.expandArrow.parentNode.removeChild(this.expandArrow);
        }
        
        this.removeBackdrop();
        
        // Remove styles
        const styles = document.getElementById('sidebar-arrow-styles');
        if (styles) {
            styles.remove();
        }
        
        // Reset sidebar
        if (this.sidebar) {
            this.sidebar.style.transform = '';
            this.sidebar.style.transition = '';
        }
        
        // Show original elements
        this.fallback();
    }
    
    // Debug method
    getDebugInfo() {
        return {
            isExpanded: this.isExpanded,
            sidebarExists: !!this.sidebar,
            arrowExists: !!this.expandArrow,
            sidebarTransform: this.sidebar?.style.transform,
            arrowPosition: this.expandArrow?.style.left
        };
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Arrow Expand Sidebar');
    
    setTimeout(() => {
        try {
            // Clean up any existing controllers
            if (window.leftSidebarController && typeof window.leftSidebarController.destroy === 'function') {
                window.leftSidebarController.destroy();
            }
            
            // Initialize new controller
            window.leftSidebarController = new ArrowExpandSidebar();
            
            // Add debug function
            window.debugSidebar = () => console.log(window.leftSidebarController.getDebugInfo());
            
            console.log('✅ Arrow Expand Sidebar initialized successfully');
            console.log('💡 Type "debugSidebar()" in console for debug info');
            
        } catch (error) {
            console.error('❌ Failed to initialize arrow expand sidebar:', error);
        }
    }, 100);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ArrowExpandSidebar;
}
