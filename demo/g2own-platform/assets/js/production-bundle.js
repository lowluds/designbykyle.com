/*!
 * G2Own Production Bundle - Critical Scripts Combined
 * Minified bundle for production deployment
 * Version: 1.0.0
 */

// Critical initialization functions
(function() {
    'use strict';
    
    // Progressive loading helper
    window.updateProgress = function(percent, message) {
        const bar = document.querySelector('.progress-fill');
        const text = document.querySelector('.progress-text');
        if (bar) bar.style.width = percent + '%';
        if (text) text.textContent = message;
        
        if (percent >= 100) {
            setTimeout(() => {
                const preloader = document.querySelector('#preloader');
                if (preloader) {
                    preloader.style.opacity = '0';
                    setTimeout(() => preloader.style.display = 'none', 300);
                }
            }, 200);
        }
    };
    
    // Critical DOM ready functions
    function initCriticalComponents() {
        // Initialize navbar state
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.classList.add('loaded');
        }
        
        // Initialize authentication state checker
        if (window.authBridge) {
            window.authBridge.checkAuthStatus();
        }
        
        // Start progress indicator
        updateProgress(10, 'Initializing...');
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCriticalComponents);
    } else {
        initCriticalComponents();
    }
    
    // Performance optimization utilities
    window.G2OwnUtils = {
        // Debounce function for performance
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        // Throttle function for scroll events
        throttle: function(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },
        
        // Check if element is in viewport
        isInViewport: function(element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        }
    };
    
})();
