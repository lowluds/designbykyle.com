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
        console.log('🚀 RESPONSIVE.JS: Starting initialization...');
        
        // Get elements
        sidebar = document.getElementById('left-sidebar') || document.querySelector('.left-sidebar');
        toggleButton = document.getElementById('sidebar-floating-toggle') || document.querySelector('.sidebar-floating-toggle');
        hoverZone = document.getElementById('sidebar-hover-zone') || document.querySelector('.sidebar-hover-zone');
        
        console.log('🔍 RESPONSIVE.JS: Element search results:');
        console.log('   - Sidebar:', sidebar ? '✅ Found' : '❌ Not found');
        console.log('   - Toggle Button:', toggleButton ? '✅ Found' : '❌ Not found');
        console.log('   - Hover Zone:', hoverZone ? '✅ Found' : '❌ Not found');
        
        if (sidebar) {
            console.log('   - Sidebar classes:', sidebar.className);
            console.log('   - Sidebar id:', sidebar.id);
        }
        
        if (hoverZone) {
            console.log('   - Hover zone classes:', hoverZone.className);
            console.log('   - Hover zone id:', hoverZone.id);
        }
        
        // Create overlay if it doesn't exist
        createOverlay();
        
        // Set up event listeners
        setupEventListeners();
        
        // Initial responsive check
        checkResponsive();
        
        console.log('✅ RESPONSIVE.JS: Initialization complete');
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
        console.log('🔧 RESPONSIVE.JS: Setting up event listeners...');
        
        // Toggle button click (mobile only)
        if (toggleButton) {
            toggleButton.addEventListener('click', toggleSidebar);
            console.log('   ✅ Toggle button click listener added');
        } else {
            console.log('   ⚠️ No toggle button found - mobile functionality disabled');
        }
        
        // Hover zone events (desktop/tablet only)
        if (hoverZone && sidebar) {
            hoverZone.addEventListener('mouseenter', showSidebarOnHover);
            hoverZone.addEventListener('mouseleave', hideSidebarOnLeave);
            
            sidebar.addEventListener('mouseenter', keepSidebarVisible);
            sidebar.addEventListener('mouseleave', hideSidebarOnLeave);
            
            console.log('   ✅ Hover zone event listeners added');
        } else {
            console.log('   ❌ Missing elements for hover functionality:');
            console.log('      - Hover zone:', hoverZone ? 'Found' : 'Missing');
            console.log('      - Sidebar:', sidebar ? 'Found' : 'Missing');
        }
        
        // Window resize
        window.addEventListener('resize', debounce(checkResponsive, 250));
        console.log('   ✅ Window resize listener added');
        
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
        
        console.log('   ✅ All event listeners configured');
    }      // Show sidebar on hover (desktop/tablet only)
    function showSidebarOnHover() {
        console.log('🖱️ RESPONSIVE.JS: showSidebarOnHover called');
        console.log('   - isMobile:', isMobile);
        console.log('   - sidebar element:', sidebar ? 'Found' : 'Missing');
        
        if (isMobile) {
            console.log('   ⚠️ Mobile mode - skipping hover functionality');
            return;
        }
        
        clearTimeout(hideTimeout);
        isHovering = true;
        
        if (sidebar) {
            const beforeClasses = sidebar.className;
            sidebar.classList.add('sidebar-hovered');
            sidebar.classList.add('show-on-hover');
            const afterClasses = sidebar.className;
            
            console.log('   ✅ Sidebar classes updated:');
            console.log('      Before:', beforeClasses);
            console.log('      After:', afterClasses);
            console.log('   ✅ Showing sidebar on hover');
        } else {
            console.log('   ❌ Cannot show sidebar - element not found');
        }
    }
    
    // Keep sidebar visible when hovering over it
    function keepSidebarVisible() {
        if (isMobile) return;
        
        clearTimeout(hideTimeout);
        isHovering = true;
        console.log('Keeping sidebar visible');
    }
    
    // Hide sidebar when leaving hover area
    function hideSidebarOnLeave() {
        if (isMobile) return;
        
        isHovering = false;
        console.log('Mouse left hover area, hiding in 300ms');
        
        // Add a small delay before hiding to prevent flickering
        hideTimeout = setTimeout(hideSidebarNow, 300);
    }
    
    // Actually hide the sidebar
    function hideSidebarNow() {
        if (isMobile) return;
        
        if (sidebar) {
            sidebar.classList.remove('sidebar-hovered');
            sidebar.classList.remove('show-on-hover');
            console.log('Hiding sidebar now');
        }
        isHovering = false;
    }
      // Check if we're in mobile mode
    function checkResponsive() {
        const wasMobile = isMobile;
        isMobile = window.innerWidth <= 767;
        
        console.log('📱 RESPONSIVE.JS: Responsive check');
        console.log('   - Screen width:', window.innerWidth);
        console.log('   - Was mobile:', wasMobile);
        console.log('   - Is mobile:', isMobile);
        
        // If we switched from mobile to desktop, ensure sidebar is closed
        if (wasMobile && !isMobile && sidebar) {
            closeSidebar();
            hideSidebarNow();
        }
          // Show/hide elements based on screen size
        if (toggleButton) {
            toggleButton.style.display = isMobile ? 'block' : 'none';
            console.log('   - Toggle button display:', isMobile ? 'block' : 'none');
        }
        
        if (hoverZone) {
            hoverZone.style.display = isMobile ? 'none' : 'block';
            
            // Temporarily add debug class to make hover zone visible (remove after testing)
            if (!isMobile) {
                hoverZone.classList.add('debug');
                console.log('   ✅ Hover zone enabled and debug class added');
                console.log('   - Hover zone classes:', hoverZone.className);
            } else {
                hoverZone.classList.remove('debug');
                console.log('   - Hover zone disabled (mobile mode)');
            }
        }
    }
      // Toggle sidebar open/closed
    function toggleSidebar() {
        console.log('🔄 RESPONSIVE.JS: toggleSidebar called');
        console.log('   - isMobile:', isMobile);
        console.log('   - sidebar element:', sidebar ? 'Found' : 'Missing');
        
        if (!sidebar) {
            console.log('   ❌ Cannot toggle - sidebar element not found');
            return;
        }
        
        const isOpen = sidebar.classList.contains('mobile-open');
        console.log('   - Sidebar currently open:', isOpen);
        
        if (isOpen) {
            console.log('   🔒 Closing sidebar...');
            closeSidebar();
        } else {
            console.log('   🔓 Opening sidebar...');
            openSidebar();
        }
    }
    
    // Open sidebar (force it open regardless of mode)
    function openSidebar() {
        console.log('📂 RESPONSIVE.JS: openSidebar called');
        if (!sidebar) {
            console.log('   ❌ Cannot open - sidebar element not found');
            return;
        }
        
        // Force sidebar open with multiple methods
        sidebar.classList.add('mobile-open');
        sidebar.classList.add('show-on-hover');
        sidebar.classList.add('sidebar-hovered');
        sidebar.style.transform = 'translateX(0)';
        
        if (overlay) {
            overlay.classList.add('active');
        }
        
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        console.log('   ✅ Sidebar opened with classes:', sidebar.className);
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
    
    // Backup initialization with delay
    window.addEventListener('load', function() {
        console.log('🔄 RESPONSIVE.JS: Window load event - checking elements again...');
        
        // Re-check elements if they weren't found before
        const currentSidebar = document.getElementById('left-sidebar') || document.querySelector('.left-sidebar');
        const currentHoverZone = document.getElementById('sidebar-hover-zone') || document.querySelector('.sidebar-hover-zone');
        const currentToggleButton = document.getElementById('sidebar-floating-toggle') || document.querySelector('.sidebar-floating-toggle');
        
        console.log('🔍 RESPONSIVE.JS: Backup element check:');
        console.log('   - Sidebar:', currentSidebar ? '✅ Found' : '❌ Not found');
        console.log('   - Hover Zone:', currentHoverZone ? '✅ Found' : '❌ Not found');
        console.log('   - Toggle Button:', currentToggleButton ? '✅ Found' : '❌ Not found');
        
        if (!sidebar || !hoverZone) {
            console.log('🔄 RESPONSIVE.JS: Re-initializing due to missing elements...');
            setTimeout(init, 100);
        } else {
            console.log('✅ RESPONSIVE.JS: All elements found, no re-initialization needed');
        }
    });
    
    // Fallback manual show/hide functions for debugging
    window.manualShowSidebar = function() {
        console.log('🔧 MANUAL: Showing sidebar...');
        if (sidebar) {
            sidebar.classList.add('show-on-hover');
            sidebar.classList.add('sidebar-hovered');
            sidebar.style.transform = 'translateX(0)';
            console.log('✅ MANUAL: Sidebar classes and styles applied');
        } else {
            console.log('❌ MANUAL: Sidebar element not found');
        }
    };

    window.manualHideSidebar = function() {
        console.log('🔧 MANUAL: Hiding sidebar...');
        if (sidebar) {
            sidebar.classList.remove('show-on-hover');
            sidebar.classList.remove('sidebar-hovered');
            sidebar.style.transform = 'translateX(-100%)';
            console.log('✅ MANUAL: Sidebar hidden');
        } else {
            console.log('❌ MANUAL: Sidebar element not found');
        }
    };

    window.debugSidebar = function() {
        console.log('🔍 SIDEBAR DEBUG INFO:');
        console.log('  - Sidebar element:', sidebar);
        console.log('  - Hover zone element:', hoverZone);
        console.log('  - Toggle button element:', toggleButton);
        console.log('  - Is mobile:', isMobile);
        console.log('  - Is hovering:', isHovering);
        
        if (sidebar) {
            console.log('  - Sidebar classes:', sidebar.className);
            console.log('  - Sidebar computed transform:', getComputedStyle(sidebar).transform);
            console.log('  - Sidebar computed display:', getComputedStyle(sidebar).display);
            console.log('  - Sidebar computed visibility:', getComputedStyle(sidebar).visibility);
        }
        
        if (hoverZone) {
            console.log('  - Hover zone classes:', hoverZone.className);
            console.log('  - Hover zone computed display:', getComputedStyle(hoverZone).display);
        }
    };

})();
