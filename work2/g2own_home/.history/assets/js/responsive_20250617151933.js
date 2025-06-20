/**
 * RESPONSIVE CONTROLLER WITH HOVER-TO-REVEAL
 * Handles mobile sidebar toggle and hover-to-reveal functionality
 */

(function() {
    'use strict';
    
    // Elements
    let sidebar = null;
    let toggleButton = null;
    let overlay = null;
    let hoverZone = null;
    
    // State
    let isMobile = false;
    let isHovering = false;
    let hideTimeout = null;
    
    // Initialize when DOM is ready
    function init() {
        // Get elements
        sidebar = document.getElementById('left-sidebar') || document.querySelector('.left-sidebar');
        toggleButton = document.getElementById('sidebar-floating-toggle') || document.querySelector('.sidebar-floating-toggle');
        hoverZone = document.getElementById('sidebar-hover-zone') || document.querySelector('.sidebar-hover-zone');
        
        // Create overlay if it doesn't exist
        createOverlay();
        
        // Set up event listeners
        setupEventListeners();
        
        // Initial responsive check
        checkResponsive();
        
        console.log('Responsive controller with hover-to-reveal initialized');
    }
    
    // Create mobile overlay
    function createOverlay() {
        overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        overlay.addEventListener('click', closeSidebar);
        document.body.appendChild(overlay);
    }
    
    // Set up all event listeners
    function setupEventListeners() {
        // Toggle button click (mobile only)
        if (toggleButton) {
            toggleButton.addEventListener('click', toggleSidebar);
        }
        
        // Hover zone events (desktop/tablet only)
        if (hoverZone && sidebar) {
            hoverZone.addEventListener('mouseenter', showSidebarOnHover);
            hoverZone.addEventListener('mouseleave', hideSidebarOnLeave);
            
            sidebar.addEventListener('mouseenter', keepSidebarVisible);
            sidebar.addEventListener('mouseleave', hideSidebarOnLeave);
        }
        
        // Window resize
        window.addEventListener('resize', debounce(checkResponsive, 250));
        
        // Escape key to close sidebar
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (isMobile && sidebar && sidebar.classList.contains('mobile-open')) {
                    closeSidebar();
                } else if (!isMobile && isHovering) {
                    hideSidebarNow();
                }
            }
        });
        
        // Close sidebar when clicking on main content (mobile only)
        document.addEventListener('click', function(e) {
            if (isMobile && 
                sidebar && 
                sidebar.classList.contains('mobile-open') && 
                !sidebar.contains(e.target) && 
                !toggleButton.contains(e.target)) {
                closeSidebar();
            }
        });
    }
    
    // Show sidebar on hover (desktop/tablet only)
    function showSidebarOnHover() {
        if (isMobile) return;
        
        clearTimeout(hideTimeout);
        isHovering = true;
        
        if (sidebar) {
            sidebar.classList.add('sidebar-hovered');
        }
    }
    
    // Keep sidebar visible when hovering over it
    function keepSidebarVisible() {
        if (isMobile) return;
        
        clearTimeout(hideTimeout);
        isHovering = true;
    }
    
    // Hide sidebar when leaving hover area
    function hideSidebarOnLeave() {
        if (isMobile) return;
        
        isHovering = false;
        
        // Add a small delay before hiding to prevent flickering
        hideTimeout = setTimeout(hideSidebarNow, 300);
    }
    
    // Actually hide the sidebar
    function hideSidebarNow() {
        if (isMobile) return;
        
        if (sidebar) {
            sidebar.classList.remove('sidebar-hovered');
        }
        isHovering = false;
    }
    
    // Check if we're in mobile mode
    function checkResponsive() {
        const wasMobile = isMobile;
        isMobile = window.innerWidth <= 767;
        
        // If we switched from mobile to desktop, ensure sidebar is closed
        if (wasMobile && !isMobile && sidebar) {
            closeSidebar();
            hideSidebarNow();
        }
        
        // Show/hide elements based on screen size
        if (toggleButton) {
            toggleButton.style.display = isMobile ? 'block' : 'none';
        }
        
        if (hoverZone) {
            hoverZone.style.display = isMobile ? 'none' : 'block';
        }
    }
    
    // Toggle sidebar open/closed
    function toggleSidebar() {
        if (!sidebar) return;
        
        if (sidebar.classList.contains('mobile-open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }
    
    // Open sidebar
    function openSidebar() {
        if (!sidebar || !isMobile) return;
        
        sidebar.classList.add('mobile-open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    
    // Close sidebar
    function closeSidebar() {
        if (!sidebar) return;
        
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
    
    // Debounce function for resize events
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
    
    // Backup initialization
    window.addEventListener('load', function() {
        // Re-initialize if elements weren't found before
        if (!sidebar || !toggleButton) {
            setTimeout(init, 100);
        }
    });
    
})();
