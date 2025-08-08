/* RESPONSIVE MASTER CONTROLLER - ULTIMATE SOLUTION */
/* This JavaScript provides comprehensive responsive behavior control */

(function() {
    'use strict';
    
    let isInitialized = false;
    let sidebarElement = null;
    let overlayElement = null;
    let menuToggleButton = null;
    let mainContent = null;
    let body = null;
    
    // Debounce function for performance
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
    
    // Initialize responsive system
    function initializeResponsive() {
        if (isInitialized) return;
        
        // Get DOM elements
        body = document.body;
        sidebarElement = document.querySelector('.left-sidebar');
        overlayElement = document.querySelector('.sidebar-overlay');
        menuToggleButton = document.querySelector('.menu-toggle-btn, .sidebar-toggle, [data-sidebar-toggle]');
        mainContent = document.querySelector('.main-content, main, .content');
        
        // Create overlay if it doesn't exist
        if (!overlayElement) {
            overlayElement = document.createElement('div');
            overlayElement.className = 'sidebar-overlay';
            document.body.appendChild(overlayElement);
        }
        
        // Add responsive class to body
        body.classList.add('responsive-fixed');
        
        // Ensure proper initial state
        setResponsiveState();
        
        // Bind events
        bindEvents();
        
        isInitialized = true;
        console.log('Responsive Master Controller initialized');
    }
    
    // Set proper responsive state
    function setResponsiveState() {
        const isMobile = window.innerWidth <= 768;
        const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
        const isDesktop = window.innerWidth > 1024;
        
        // Update body classes
        body.classList.toggle('is-mobile', isMobile);
        body.classList.toggle('is-tablet', isTablet);
        body.classList.toggle('is-desktop', isDesktop);
        
        // Force sidebar closed on mobile and tablet
        if (isMobile || isTablet) {
            closeSidebar();
        }
        
        // Update main content padding
        if (mainContent) {
            if (isMobile || isTablet) {
                mainContent.style.paddingLeft = '0';
                mainContent.style.marginLeft = '0';
            } else {
                mainContent.style.paddingLeft = '0';
                mainContent.style.marginLeft = '0';
            }
        }
        
        // Update meta viewport for mobile
        updateViewport();
    }
    
    // Update viewport meta tag
    function updateViewport() {
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
            viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            document.head.appendChild(viewportMeta);
        }
        viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
    }
    
    // Open sidebar
    function openSidebar() {
        if (!sidebarElement) return;
        
        sidebarElement.classList.add('active');
        overlayElement.classList.add('active');
        body.classList.add('sidebar-open');
        
        // Prevent body scroll on mobile
        if (window.innerWidth <= 768) {
            body.style.overflow = 'hidden';
        }
        
        // Focus management
        const firstFocusable = sidebarElement.querySelector('a, button, input, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            setTimeout(() => firstFocusable.focus(), 100);
        }
    }
    
    // Close sidebar
    function closeSidebar() {
        if (!sidebarElement) return;
        
        sidebarElement.classList.remove('active');
        overlayElement.classList.remove('active');
        body.classList.remove('sidebar-open');
        body.style.overflow = '';
        
        // Return focus to toggle button
        if (menuToggleButton) {
            menuToggleButton.focus();
        }
    }
    
    // Toggle sidebar
    function toggleSidebar() {
        if (sidebarElement && sidebarElement.classList.contains('active')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }
    
    // Bind event listeners
    function bindEvents() {
        // Menu toggle button
        if (menuToggleButton) {
            menuToggleButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                toggleSidebar();
            });
        }
        
        // Overlay click to close
        if (overlayElement) {
            overlayElement.addEventListener('click', function(e) {
                e.preventDefault();
                closeSidebar();
            });
        }
        
        // ESC key to close sidebar
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && sidebarElement && sidebarElement.classList.contains('active')) {
                closeSidebar();
            }
        });
        
        // Window resize handler
        window.addEventListener('resize', debounce(function() {
            setResponsiveState();
        }, 250));
        
        // Orientation change handler
        window.addEventListener('orientationchange', function() {
            setTimeout(setResponsiveState, 100);
        });
        
        // Click outside sidebar to close on mobile
        document.addEventListener('click', function(e) {
            const isMobile = window.innerWidth <= 768;
            if (isMobile && 
                sidebarElement && 
                sidebarElement.classList.contains('active') && 
                !sidebarElement.contains(e.target) && 
                !menuToggleButton.contains(e.target)) {
                closeSidebar();
            }
        });
        
        // Touch events for mobile swipe
        let startX = 0;
        let currentX = 0;
        let isTracking = false;
        
        document.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            isTracking = true;
        }, { passive: true });
        
        document.addEventListener('touchmove', function(e) {
            if (!isTracking) return;
            currentX = e.touches[0].clientX;
        }, { passive: true });
        
        document.addEventListener('touchend', function(e) {
            if (!isTracking) return;
            isTracking = false;
            
            const diffX = currentX - startX;
            const isMobile = window.innerWidth <= 768;
            
            if (isMobile && Math.abs(diffX) > 50) {
                if (diffX > 0 && startX < 50) {
                    // Swipe right from left edge - open sidebar
                    openSidebar();
                } else if (diffX < 0 && sidebarElement && sidebarElement.classList.contains('active')) {
                    // Swipe left - close sidebar
                    closeSidebar();
                }
            }
        }, { passive: true });
    }
    
    // Fix layout issues
    function fixLayoutIssues() {
        // Ensure no horizontal scroll
        document.documentElement.style.overflowX = 'hidden';
        document.body.style.overflowX = 'hidden';
        
        // Fix any elements that might cause overflow
        const potentialOverflowElements = document.querySelectorAll('*');
        potentialOverflowElements.forEach(el => {
            const styles = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            
            if (rect.width > window.innerWidth) {
                el.style.maxWidth = '100vw';
                el.style.overflowX = 'hidden';
            }
        });
        
        // Ensure hero section is properly contained
        const heroSection = document.querySelector('.hero-section, .hero, [class*="hero"]');
        if (heroSection) {
            heroSection.style.width = '100%';
            heroSection.style.maxWidth = '100vw';
            heroSection.style.overflowX = 'hidden';
            heroSection.style.padding = '100px 1rem 2rem 1rem';
        }
        
        // Ensure main content is properly contained
        if (mainContent) {
            mainContent.style.width = '100%';
            mainContent.style.maxWidth = '100vw';
            mainContent.style.overflowX = 'hidden';
            mainContent.style.paddingLeft = '0';
            mainContent.style.marginLeft = '0';
        }
    }
    
    // Auto-fix common responsive issues
    function autoFixResponsiveIssues() {
        // Fix images and media
        const images = document.querySelectorAll('img, video, iframe');
        images.forEach(media => {
            media.style.maxWidth = '100%';
            media.style.height = 'auto';
        });
        
        // Fix tables
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            const wrapper = document.createElement('div');
            wrapper.style.overflowX = 'auto';
            wrapper.style.width = '100%';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        });
        
        // Fix pre and code blocks
        const codeBlocks = document.querySelectorAll('pre, code');
        codeBlocks.forEach(block => {
            block.style.overflowX = 'auto';
            block.style.maxWidth = '100%';
        });
    }
    
    // Initialize when DOM is ready
    function domReady(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }
    
    // Main initialization
    domReady(function() {
        // Wait a brief moment for other scripts to load
        setTimeout(function() {
            initializeResponsive();
            fixLayoutIssues();
            autoFixResponsiveIssues();
            
            // Run layout fixes again after a short delay
            setTimeout(fixLayoutIssues, 500);
            setTimeout(fixLayoutIssues, 1000);
        }, 100);
    });
    
    // Export functions to global scope for debugging
    window.ResponsiveMaster = {
        openSidebar,
        closeSidebar,
        toggleSidebar,
        setResponsiveState,
        fixLayoutIssues,
        autoFixResponsiveIssues
    };
    
})();
