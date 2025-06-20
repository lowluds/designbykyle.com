/**
 * SIMPLE RESPONSIVE CONTROLLER
 * Basic responsive functionality for sidebar and layout
 */

(function() {
    'use strict';
    
    let currentBreakpoint = '';
    let sidebar = null;
    let mobileToggle = null;
    let mobileOverlay = null;
    
    // Initialize on DOM ready
    function init() {
        sidebar = document.querySelector('.left-sidebar');
        mobileToggle = document.querySelector('.sidebar-floating-toggle');
        mobileOverlay = document.querySelector('.mobile-overlay');
        
        if (!mobileOverlay) {
            // Create mobile overlay if it doesn't exist
            mobileOverlay = document.createElement('div');
            mobileOverlay.className = 'mobile-overlay';
            mobileOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.5);
                z-index: 998;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            `;
            document.body.appendChild(mobileOverlay);
        }
        
        // Bind events
        bindEvents();
        
        // Initial state
        updateResponsiveState();
        
        console.log('Simple responsive controller initialized');
    }
    
    function bindEvents() {
        // Mobile toggle button
        if (mobileToggle) {
            mobileToggle.addEventListener('click', toggleSidebar);
        }
        
        // Mobile overlay click to close
        if (mobileOverlay) {
            mobileOverlay.addEventListener('click', closeSidebar);
        }
        
        // Window resize
        window.addEventListener('resize', debounce(updateResponsiveState, 100));
        
        // Escape key to close
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isMobile() && sidebar && sidebar.classList.contains('mobile-active')) {
                closeSidebar();
            }
        });
    }
    
    function updateResponsiveState() {
        const width = window.innerWidth;
        
        if (width < 768) {
            currentBreakpoint = 'mobile';
            // Ensure sidebar is hidden on mobile
            if (sidebar && !sidebar.classList.contains('mobile-active')) {
                closeSidebar();
            }
        } else if (width < 1024) {
            currentBreakpoint = 'tablet';
            // Ensure sidebar is visible on tablet
            if (sidebar) {
                sidebar.classList.remove('mobile-active');
                closeMobileOverlay();
            }
        } else {
            currentBreakpoint = 'desktop';
            // Ensure sidebar is visible on desktop
            if (sidebar) {
                sidebar.classList.remove('mobile-active');
                closeMobileOverlay();
            }
        }
    }
    
    function toggleSidebar() {
        if (!sidebar) return;
        
        if (isMobile()) {
            if (sidebar.classList.contains('mobile-active')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        }
    }
    
    function openSidebar() {
        if (!sidebar) return;
        
        if (isMobile()) {
            sidebar.classList.add('mobile-active');
            openMobileOverlay();
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        }
    }
    
    function closeSidebar() {
        if (!sidebar) return;
        
        sidebar.classList.remove('mobile-active');
        closeMobileOverlay();
        // Restore body scroll
        document.body.style.overflow = '';
    }
    
    function openMobileOverlay() {
        if (mobileOverlay) {
            mobileOverlay.style.opacity = '1';
            mobileOverlay.style.visibility = 'visible';
        }
    }
    
    function closeMobileOverlay() {
        if (mobileOverlay) {
            mobileOverlay.style.opacity = '0';
            mobileOverlay.style.visibility = 'hidden';
        }
    }
    
    function isMobile() {
        return currentBreakpoint === 'mobile';
    }
    
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Make functions globally accessible for debugging
    window.simpleResponsive = {
        toggleSidebar,
        openSidebar,
        closeSidebar,
        getCurrentBreakpoint: () => currentBreakpoint,
        isMobile
    };
    
})();
