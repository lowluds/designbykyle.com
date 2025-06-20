/**
 * RESPONSIVE FINAL CONTROLLER - EMERGENCY OVERRIDE
 * This ensures responsive behavior works regardless of other JS conflicts
 */

(function() {
    'use strict';
    
    // Emergency responsive state
    let isInitialized = false;
    let currentBreakpoint = '';
    let sidebar = null;
    let mobileToggle = null;
    let mobileOverlay = null;
    let resizeTimeout = null;
    
    // Emergency initialization with multiple selectors
    function emergencyInit() {
        if (isInitialized) return;
        
        console.log('🚨 Emergency responsive controller initializing...');
        
        // Find sidebar with multiple selectors
        sidebar = document.querySelector('.left-sidebar') || 
                 document.querySelector('#left-sidebar') ||
                 document.querySelector('.sidebar') ||
                 document.querySelector('.navigation-sidebar') ||
                 document.querySelector('[class*="sidebar"]');
        
        // Find or create mobile toggle
        mobileToggle = document.querySelector('.sidebar-floating-toggle') ||
                      document.querySelector('.mobile-menu-toggle') ||
                      document.querySelector('[class*="toggle"]');
        
        if (!mobileToggle) {
            createMobileToggle();
        }
        
        // Find or create mobile overlay
        mobileOverlay = document.querySelector('.mobile-overlay');
        if (!mobileOverlay) {
            createMobileOverlay();
        }
        
        // Bind all events
        bindEmergencyEvents();
        
        // Force initial state
        forceResponsiveState();
        
        // Mark as initialized
        isInitialized = true;
        
        // Add responsive-ready class to body
        document.body.classList.add('responsive-ready');
        
        console.log('✅ Emergency responsive controller initialized');
    }
    
    function createMobileToggle() {
        mobileToggle = document.createElement('button');
        mobileToggle.className = 'sidebar-floating-toggle mobile-menu-toggle';
        mobileToggle.innerHTML = '☰';
        mobileToggle.style.cssText = `
            position: fixed !important;
            top: 15px !important;
            left: 15px !important;
            z-index: 1001 !important;
            background: rgba(255, 0, 0, 0.8) !important;
            color: white !important;
            border: none !important;
            padding: 10px !important;
            border-radius: 5px !important;
            cursor: pointer !important;
            font-size: 16px !important;
            width: 40px !important;
            height: 40px !important;
            display: none !important;
        `;
        document.body.appendChild(mobileToggle);
        console.log('📱 Mobile toggle created');
    }
    
    function createMobileOverlay() {
        mobileOverlay = document.createElement('div');
        mobileOverlay.className = 'mobile-overlay';
        mobileOverlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(0, 0, 0, 0.5) !important;
            z-index: 998 !important;
            opacity: 0 !important;
            visibility: hidden !important;
            transition: all 0.3s ease !important;
            pointer-events: none !important;
        `;
        document.body.appendChild(mobileOverlay);
        console.log('🎭 Mobile overlay created');
    }
    
    function bindEmergencyEvents() {
        // Mobile toggle click
        if (mobileToggle) {
            mobileToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                toggleSidebar();
            });
        }
        
        // Mobile overlay click
        if (mobileOverlay) {
            mobileOverlay.addEventListener('click', function() {
                closeSidebar();
            });
        }
        
        // Window resize
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                forceResponsiveState();
            }, 100);
        });
        
        // Orientation change
        window.addEventListener('orientationchange', function() {
            setTimeout(function() {
                forceResponsiveState();
            }, 500);
        });
        
        // Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeSidebar();
            }
        });
        
        console.log('🔗 Emergency events bound');
    }
    
    function toggleSidebar() {
        if (!sidebar) return;
        
        const isActive = sidebar.classList.contains('mobile-active') || 
                        sidebar.classList.contains('active');
        
        if (isActive) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }
    
    function openSidebar() {
        if (!sidebar) return;
        
        sidebar.classList.add('mobile-active', 'active');
        
        if (mobileOverlay) {
            mobileOverlay.classList.add('active');
            mobileOverlay.style.opacity = '1';
            mobileOverlay.style.visibility = 'visible';
            mobileOverlay.style.pointerEvents = 'auto';
        }
        
        // Prevent body scroll on mobile
        if (window.innerWidth <= 767) {
            document.body.style.overflow = 'hidden';
        }
        
        console.log('📂 Sidebar opened');
    }
    
    function closeSidebar() {
        if (!sidebar) return;
        
        sidebar.classList.remove('mobile-active', 'active');
        
        if (mobileOverlay) {
            mobileOverlay.classList.remove('active');
            mobileOverlay.style.opacity = '0';
            mobileOverlay.style.visibility = 'hidden';
            mobileOverlay.style.pointerEvents = 'none';
        }
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        console.log('📁 Sidebar closed');
    }
    
    function forceResponsiveState() {
        const width = window.innerWidth;
        let newBreakpoint = '';
        
        if (width <= 767) {
            newBreakpoint = 'mobile';
        } else if (width <= 1023) {
            newBreakpoint = 'tablet';
        } else {
            newBreakpoint = 'desktop';
        }
        
        if (newBreakpoint !== currentBreakpoint) {
            currentBreakpoint = newBreakpoint;
            applyBreakpointStyles();
        }
    }
    
    function applyBreakpointStyles() {
        // Remove all breakpoint classes
        document.body.classList.remove('mobile-view', 'tablet-view', 'desktop-view');
        
        // Add current breakpoint class
        document.body.classList.add(currentBreakpoint + '-view');
        
        if (currentBreakpoint === 'mobile') {
            // Mobile behavior
            if (mobileToggle) {
                mobileToggle.style.display = 'block';
            }
            closeSidebar(); // Always close sidebar on mobile resize
        } else {
            // Tablet/Desktop behavior
            if (mobileToggle) {
                mobileToggle.style.display = 'none';
            }
            closeSidebar(); // Close any mobile overlay
            
            // Ensure sidebar is visible on larger screens
            if (sidebar) {
                sidebar.classList.remove('mobile-active');
                sidebar.style.transform = 'translateX(0)';
            }
        }
        
        console.log(`📱 Switched to ${currentBreakpoint} view`);
    }
    
    // Emergency force fixes for common issues
    function emergencyFixOverflow() {
        // Fix horizontal overflow
        document.documentElement.style.overflowX = 'hidden';
        document.body.style.overflowX = 'hidden';
        
        // Fix viewport
        let viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
        }
    }
    
    // Multiple initialization methods to ensure it works
    function multiInit() {
        emergencyInit();
        emergencyFixOverflow();
    }
    
    // Try immediate initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', multiInit);
    } else {
        multiInit();
    }
    
    // Backup initialization
    setTimeout(multiInit, 100);
    setTimeout(multiInit, 500);
    
    // Window load backup
    window.addEventListener('load', multiInit);
    
    // Global emergency functions
    window.emergencyToggleSidebar = toggleSidebar;
    window.emergencyCloseSidebar = closeSidebar;
    window.emergencyForceResponsive = forceResponsiveState;
    
    console.log('🚨 Emergency responsive controller loaded');
})();
