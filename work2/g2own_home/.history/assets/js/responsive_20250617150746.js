/**
 * SIMPLE RESPONSIVE CONTROLLER
 * Handles mobile sidebar toggle and responsive behavior
 */

(function() {
    'use strict';
    
    // Elements
    let sidebar = null;
    let toggleButton = null;
    let overlay = null;
    
    // State
    let isMobile = false;
    
    // Initialize when DOM is ready
    function init() {
        // Get elements
        sidebar = document.getElementById('left-sidebar') || document.querySelector('.left-sidebar');
        toggleButton = document.getElementById('sidebar-floating-toggle') || document.querySelector('.sidebar-floating-toggle');
        
        // Create overlay if it doesn't exist
        createOverlay();
        
        // Set up event listeners
        setupEventListeners();
        
        // Initial responsive check
        checkResponsive();
        
        console.log('Simple responsive controller initialized');
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
        // Toggle button click
        if (toggleButton) {
            toggleButton.addEventListener('click', toggleSidebar);
        }
        
        // Window resize
        window.addEventListener('resize', debounce(checkResponsive, 250));
        
        // Escape key to close sidebar
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isMobile && sidebar && sidebar.classList.contains('mobile-open')) {
                closeSidebar();
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
    
    // Check if we're in mobile mode
    function checkResponsive() {
        const wasMobile = isMobile;
        isMobile = window.innerWidth <= 767;
        
        // If we switched from mobile to desktop, ensure sidebar is closed
        if (wasMobile && !isMobile && sidebar) {
            closeSidebar();
        }
        
        // Show/hide toggle button based on screen size
        if (toggleButton) {
            toggleButton.style.display = isMobile ? 'block' : 'none';
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
