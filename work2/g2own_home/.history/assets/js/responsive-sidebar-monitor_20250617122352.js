/**
 * Responsive Sidebar Monitor
 * Monitors and logs responsive behavior of sidebar elements
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        enableLogging: true,
        monitorInterval: 1000,
        breakpoints: {
            mobile: 480,
            tablet: 768,
            desktop: 1024,
            large: 1440
        }
    };
    
    // State tracking
    let currentBreakpoint = '';
    let isMonitoring = false;
    
    // Utility functions
    function log(message, data = null) {
        if (CONFIG.enableLogging) {
            console.log(`[Responsive Sidebar] ${message}`, data || '');
        }
    }
    
    function getCurrentBreakpoint() {
        const width = window.innerWidth;
        
        if (width <= CONFIG.breakpoints.mobile) return 'mobile';
        if (width <= CONFIG.breakpoints.tablet) return 'tablet';
        if (width <= CONFIG.breakpoints.desktop) return 'desktop';
        if (width <= CONFIG.breakpoints.large) return 'large';
        return 'xlarge';
    }
    
    function getElementStyles(selector) {
        const element = document.querySelector(selector);
        if (!element) return null;
        
        const styles = window.getComputedStyle(element);
        return {
            fontSize: styles.fontSize,
            width: styles.width,
            height: styles.height,
            padding: styles.padding,
            margin: styles.margin,
            minWidth: styles.minWidth
        };
    }
      function checkResponsiveElements() {
        const elements = {
            navIcon: '.nav-gaming-icon', // Updated to correct class
            navLink: '.nav-link',
            navText: '.nav-text',
            previewIcon: '.preview-icon',
            leftSidebar: '.left-sidebar'
        };
        
        const results = {};
        
        Object.keys(elements).forEach(key => {
            const selector = elements[key];
            const element = document.querySelector(selector);
            
            if (element) {
                results[key] = {
                    exists: true,
                    count: document.querySelectorAll(selector).length,
                    styles: getElementStyles(selector)
                };
            } else {
                results[key] = {
                    exists: false,
                    count: 0,
                    styles: null
                };
            }
        });
        
        return results;
    }
    
    function logResponsiveStatus() {
        const breakpoint = getCurrentBreakpoint();
        
        if (breakpoint !== currentBreakpoint) {
            currentBreakpoint = breakpoint;
            log(`Breakpoint changed to: ${breakpoint} (${window.innerWidth}px)`);
            
            // Check responsive elements
            const elements = checkResponsiveElements();
            
            log('Responsive elements status:', elements);
              // Check if responsive CSS is applied
            const navIcon = document.querySelector('.nav-gaming-icon');
            if (navIcon) {
                const iconStyles = window.getComputedStyle(navIcon);
                log(`Nav icon styles at ${breakpoint}:`, {
                    fontSize: iconStyles.fontSize,
                    minWidth: iconStyles.minWidth,
                    transform: iconStyles.transform
                });
            }
            
            // Check if sidebar is responsive
            const sidebar = document.querySelector('.left-sidebar');
            if (sidebar) {
                const sidebarStyles = window.getComputedStyle(sidebar);
                log(`Sidebar styles at ${breakpoint}:`, {
                    width: sidebarStyles.width,
                    maxWidth: sidebarStyles.maxWidth,
                    transform: sidebarStyles.transform
                });
            }
        }
    }
    
    function startMonitoring() {
        if (isMonitoring) return;
        
        isMonitoring = true;
        log('Starting responsive monitoring...');
        
        // Initial check
        logResponsiveStatus();
        
        // Monitor window resize
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(logResponsiveStatus, 250);
        });
        
        // Periodic monitoring
        setInterval(logResponsiveStatus, CONFIG.monitorInterval);
    }
    
    function addDebugPanel() {
        // Create debug panel
        const panel = document.createElement('div');
        panel.id = 'responsive-debug-panel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            min-width: 200px;
            border: 1px solid #8b0000;
            backdrop-filter: blur(10px);
        `;
        
        panel.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px; color: #8b0000;">
                📱 Responsive Monitor
            </div>
            <div id="debug-info">Loading...</div>
            <button onclick="window.responsiveSidebarMonitor.toggle()" 
                    style="margin-top: 10px; background: #8b0000; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                Toggle Monitoring
            </button>
        `;
        
        document.body.appendChild(panel);
        
        // Update debug info
        function updateDebugInfo() {
            const debugInfo = document.getElementById('debug-info');
            if (debugInfo) {
                const breakpoint = getCurrentBreakpoint();
                const elements = checkResponsiveElements();
                
                debugInfo.innerHTML = `
                    <div>Viewport: ${window.innerWidth}x${window.innerHeight}</div>
                    <div>Breakpoint: ${breakpoint}</div>
                    <div>Nav Icons: ${elements.navIcon.count}</div>
                    <div>Nav Links: ${elements.navLink.count}</div>
                    <div>Preview Icon: ${elements.previewIcon.exists ? '✓' : '✗'}</div>
                    <div>Sidebar: ${elements.leftSidebar.exists ? '✓' : '✗'}</div>
                `;
            }
        }
        
        updateDebugInfo();
        setInterval(updateDebugInfo, 1000);
    }
    
    // Public API
    window.responsiveSidebarMonitor = {
        start: startMonitoring,
        toggle: function() {
            CONFIG.enableLogging = !CONFIG.enableLogging;
            log(CONFIG.enableLogging ? 'Monitoring enabled' : 'Monitoring disabled');
        },
        checkElements: checkResponsiveElements,
        getCurrentBreakpoint: getCurrentBreakpoint
    };
    
    // Auto-start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(startMonitoring, 1000);
            setTimeout(addDebugPanel, 2000);
        });
    } else {
        setTimeout(startMonitoring, 1000);
        setTimeout(addDebugPanel, 2000);
    }
    
    log('Responsive Sidebar Monitor initialized');
})();
