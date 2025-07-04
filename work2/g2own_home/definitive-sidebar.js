/*!
 * DEFINITIVE SIDEBAR CONTROLLER
 * Single source of truth for sidebar functionality
 * Replaces all other sidebar scripts to avoid conflicts
 */

(function() {
    'use strict';
    
    console.log('🎯 DEFINITIVE SIDEBAR: Loading...');    // Configuration
    const config = {
        sidebarSelector: '#left-sidebar',
        hoverZoneSelector: '#sidebar-hover-zone',
        toggleSelector: '#sidebar-floating-toggle',
        floatingIconsSelector: '#floating-sidebar-icons',
        hoverToNavigateSelector: '#hover-to-navigate',
        mobileBreakpoint: 768,
        hoverDelay: 300,
        debugMode: true
    };    // State
    let elements = {
        sidebar: null,
        hoverZone: null,
        toggleButton: null,
        floatingIcons: null,
        hoverToNavigate: null,
        overlay: null
    };
    
    let state = {
        isMobile: false,
        isVisible: false,
        hideTimeout: null
    };
    
    // Logging
    function log(message, type = 'info') {
        if (!config.debugMode) return;
        
        const prefix = '🎯 DEFINITIVE SIDEBAR:';
        const styles = {
            info: 'color: #4CAF50',
            warn: 'color: #FF9800', 
            error: 'color: #F44336',
            success: 'color: #2196F3'
        };
        
        console.log(`%c${prefix} ${message}`, styles[type] || styles.info);
    }    // Element discovery
    function findElements() {
        log('🔍 Finding elements...');
        
        elements.sidebar = document.querySelector(config.sidebarSelector);
        elements.hoverZone = document.querySelector(config.hoverZoneSelector);
        elements.toggleButton = document.querySelector(config.toggleSelector);
        elements.floatingIcons = document.querySelector(config.floatingIconsSelector);
        elements.hoverToNavigate = document.querySelector(config.hoverToNavigateSelector);
        
        log(`Elements found: Sidebar(${!!elements.sidebar}) HoverZone(${!!elements.hoverZone}) Toggle(${!!elements.toggleButton}) FloatingIcons(${!!elements.floatingIcons}) HoverToNavigate(${!!elements.hoverToNavigate})`);
        
        // Create overlay if needed
        if (!elements.overlay) {
            elements.overlay = document.createElement('div');
            elements.overlay.className = 'definitive-sidebar-overlay';
            elements.overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 998;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                pointer-events: none;
            `;
            document.body.appendChild(elements.overlay);
            log('✅ Overlay created');
        }
        
        return elements.sidebar && elements.hoverZone;
    }
      // Show sidebar
    function showSidebar() {
        log('📂 Showing sidebar...');
        
        if (!elements.sidebar) {
            log('❌ Cannot show - sidebar not found', 'error');
            return;
        }
        
        // Apply multiple methods to ensure visibility
        elements.sidebar.classList.add('show-on-hover');
        elements.sidebar.classList.add('sidebar-hovered');
        elements.sidebar.classList.add('mobile-open');
        elements.sidebar.classList.add('definitive-visible');
        
        // Force styles
        elements.sidebar.style.transform = 'translateX(0)';
        elements.sidebar.style.visibility = 'visible';
        elements.sidebar.style.opacity = '1';
          // Hide floating icons when sidebar is open
        if (elements.floatingIcons) {
            elements.floatingIcons.classList.add('hidden');
        }
        
        // Hide hover to navigate text when sidebar is open
        if (elements.hoverToNavigate) {
            elements.hoverToNavigate.classList.add('hidden');
        }
        
        // Show overlay if mobile
        if (state.isMobile && elements.overlay) {
            elements.overlay.style.opacity = '1';
            elements.overlay.style.visibility = 'visible';
            elements.overlay.style.pointerEvents = 'all';
            document.body.style.overflow = 'hidden';
        }
        
        state.isVisible = true;
        clearTimeout(state.hideTimeout);
        
        log('✅ Sidebar visible');
    }
      // Hide sidebar
    function hideSidebar() {
        log('📁 Hiding sidebar...');
        
        if (!elements.sidebar) {
            log('❌ Cannot hide - sidebar not found', 'error');
            return;
        }
        
        // Remove all show classes
        elements.sidebar.classList.remove('show-on-hover');
        elements.sidebar.classList.remove('sidebar-hovered');
        elements.sidebar.classList.remove('mobile-open');
        elements.sidebar.classList.remove('definitive-visible');
        
        // Force hide styles
        elements.sidebar.style.transform = 'translateX(-100%)';
          // Show floating icons when sidebar is closed
        if (elements.floatingIcons) {
            elements.floatingIcons.classList.remove('hidden');
        }
        
        // Show hover to navigate text when sidebar is closed
        if (elements.hoverToNavigate) {
            elements.hoverToNavigate.classList.remove('hidden');
        }
        
        // Hide overlay
        if (elements.overlay) {
            elements.overlay.style.opacity = '0';
            elements.overlay.style.visibility = 'hidden';
            elements.overlay.style.pointerEvents = 'none';
            document.body.style.overflow = '';
        }
        
        state.isVisible = false;
        
        log('✅ Sidebar hidden');
    }
    
    // Toggle sidebar
    function toggleSidebar() {
        log('🔄 Toggling sidebar...');
        if (state.isVisible) {
            hideSidebar();
        } else {
            showSidebar();
        }
    }
    
    // Delayed hide
    function delayedHide() {
        log('⏰ Scheduling hide...');
        clearTimeout(state.hideTimeout);
        state.hideTimeout = setTimeout(hideSidebar, config.hoverDelay);
    }
      // Check if mobile
    function checkMobile() {
        const wasMobile = state.isMobile;
        state.isMobile = window.innerWidth < config.mobileBreakpoint;
        
        if (wasMobile !== state.isMobile) {
            log(`📱 Mode changed: ${state.isMobile ? 'Mobile' : 'Desktop'}`);
            
            // Update element visibility
            if (elements.hoverZone) {
                elements.hoverZone.style.display = state.isMobile ? 'none' : 'block';
            }
            
            // On mobile, we still show floating icons but they work differently
            if (elements.floatingIcons) {
                // Floating icons are always visible unless sidebar is open
                // They don't disappear on mobile - they just change behavior
            }
        }
    }
    
    // Setup events
    function setupEvents() {
        log('🔧 Setting up events...');
        
        // Hover zone events
        if (elements.hoverZone) {
            elements.hoverZone.addEventListener('mouseenter', () => {
                log('🖱️ Hover zone entered');
                if (!state.isMobile) showSidebar();
            });
            
            elements.hoverZone.addEventListener('mouseleave', () => {
                log('🖱️ Hover zone left');
                if (!state.isMobile) delayedHide();
            });
            
            log('✅ Hover zone events attached');
        }
        
        // Sidebar events
        if (elements.sidebar) {
            elements.sidebar.addEventListener('mouseenter', () => {
                log('🖱️ Sidebar entered');
                if (!state.isMobile) clearTimeout(state.hideTimeout);
            });
            
            elements.sidebar.addEventListener('mouseleave', () => {
                log('🖱️ Sidebar left');
                if (!state.isMobile) delayedHide();
            });
            
            log('✅ Sidebar events attached');
        }
          // Toggle button events
        if (elements.toggleButton) {
            elements.toggleButton.addEventListener('click', (e) => {
                log('🖱️ Toggle button clicked');
                e.preventDefault();
                e.stopPropagation();
                toggleSidebar();
            });
            
            log('✅ Toggle button events attached');
        }
        
        // Close button events (sidebar-toggle button inside sidebar)
        const closeButton = document.querySelector('#sidebar-toggle, .sidebar-toggle');
        if (closeButton) {
            closeButton.addEventListener('click', (e) => {
                log('🖱️ Close button clicked');
                e.preventDefault();
                e.stopPropagation();
                hideSidebar();
            });
            
            log('✅ Close button events attached');
        }
          // Overlay events
        if (elements.overlay) {
            elements.overlay.addEventListener('click', () => {
                log('🖱️ Overlay clicked');
                hideSidebar();
            });
        }
        
        // Floating icons events
        if (elements.floatingIcons) {
            // Main toggle button
            const mainToggle = elements.floatingIcons.querySelector('.main-toggle');
            if (mainToggle) {
                mainToggle.addEventListener('click', (e) => {
                    log('🖱️ Main floating toggle clicked');
                    e.preventDefault();
                    e.stopPropagation();
                    showSidebar();
                });
            }
            
            // Other floating icons
            const otherIcons = elements.floatingIcons.querySelectorAll('.floating-icon:not(.main-toggle)');
            otherIcons.forEach(icon => {
                icon.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const target = icon.getAttribute('data-target');
                    log(`🖱️ Floating icon clicked: ${target}`);
                    
                    // Show sidebar first, then navigate
                    showSidebar();
                    
                    // Optional: scroll to target section after sidebar opens
                    setTimeout(() => {
                        const targetElement = document.getElementById(target) || document.querySelector(`[data-section="${target}"]`);
                        if (targetElement) {
                            targetElement.scrollIntoView({ behavior: 'smooth' });
                        }
                    }, 300);
                });
            });
            
            log('✅ Floating icons events attached');
        }
        
        // Window events
        window.addEventListener('resize', () => {
            clearTimeout(window.resizeTimeout);
            window.resizeTimeout = setTimeout(checkMobile, 250);
        });
        
        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && state.isVisible) {
                log('⌨️ Escape pressed');
                hideSidebar();
            }
        });
        
        log('✅ All events attached');
    }
    
    // Apply CSS fixes
    function applyCSSFixes() {
        log('🎨 Applying CSS fixes...');
        
        const style = document.createElement('style');
        style.textContent = `
            /* DEFINITIVE SIDEBAR CSS */
            .definitive-sidebar-overlay {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                background: rgba(0, 0, 0, 0.5) !important;
                z-index: 998 !important;
                transition: all 0.3s ease !important;
            }
              #left-sidebar {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 320px !important;
                height: 100vh !important;
                z-index: 999 !important;
                transform: translateX(-100%) !important;
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                background: rgba(0, 0, 0, 0.95) !important;
                backdrop-filter: blur(20px) !important;
                border-right: 1px solid rgba(239, 68, 68, 0.2) !important;
            }
            
            #left-sidebar.definitive-visible {
                transform: translateX(0) !important;
            }
            
            #sidebar-hover-zone {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 30px !important;
                height: 100vh !important;
                z-index: 1001 !important;
                background: transparent !important;
                cursor: pointer !important;
                display: block !important;
            }
              #sidebar-floating-toggle {
                display: none !important;
            }
            
            @media (max-width: 767px) {
                #sidebar-hover-zone { display: none !important; }
                #sidebar-floating-toggle { display: flex !important; align-items: center !important; justify-content: center !important; }
            }
        `;
        document.head.appendChild(style);
        
        log('✅ CSS fixes applied');
    }
    
    // Initialize
    function init() {
        log('🚀 Initializing definitive sidebar...');
        
        // Apply CSS fixes first
        applyCSSFixes();
        
        // Find elements
        if (!findElements()) {
            log('❌ Required elements not found - retrying in 1s...', 'warn');
            setTimeout(init, 1000);
            return;
        }
          // Setup
        checkMobile();
        setupEvents();
          // Initialize floating icons state based on current sidebar state
        if (elements.floatingIcons) {
            if (state.isVisible) {
                elements.floatingIcons.classList.add('hidden');
            } else {
                elements.floatingIcons.classList.remove('hidden');
            }
        }
        
        // Initialize hover to navigate text state
        if (elements.hoverToNavigate) {
            if (state.isVisible) {
                elements.hoverToNavigate.classList.add('hidden');
            } else {
                elements.hoverToNavigate.classList.remove('hidden');
            }
        }
        
        // Global functions for debugging
        window.definitiveSidebar = {
            show: showSidebar,
            hide: hideSidebar,
            toggle: toggleSidebar,
            debug: () => {
                log('=== DEBUG INFO ===');
                log(`Mobile: ${state.isMobile}`);
                log(`Visible: ${state.isVisible}`);
                log(`Elements: ${Object.keys(elements).map(k => `${k}(${!!elements[k]})`).join(', ')}`);
                log(`Sidebar classes: ${elements.sidebar?.className || 'N/A'}`);
                log(`Sidebar transform: ${elements.sidebar?.style.transform || getComputedStyle(elements.sidebar).transform}`);
            }
        };
        
        log('✅ Definitive sidebar ready!', 'success');
        log('💡 Try: definitiveSidebar.show() or hover over red area');
    }
    
    // Start when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }
    
})();
