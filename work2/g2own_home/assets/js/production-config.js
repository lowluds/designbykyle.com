/*!
 * G2Own Production Configuration
 * Environment-specific settings and optimizations
 */

window.G2OwnConfig = {
    // Environment detection
    environment: (() => {
        const hostname = window.location.hostname;
        if (hostname === 'g2own.com' || hostname.endsWith('.g2own.com')) {
            return 'production';
        } else if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
            return 'development';
        } else {
            return 'staging';
        }
    })(),
    
    // Backend URLs
    backend: {
        production: 'https://g2own.com/community',
        staging: 'https://staging.g2own.com/community',
        development: 'https://g2own.com/community' // Use production for dev testing
    },
    
    // Feature flags
    features: {
        performanceMonitoring: false, // Disabled in production
        debugConsole: false,          // Disabled in production
        errorReporting: true,         // Always enabled
        analytics: true               // Enabled in production
    },
    
    // Performance settings
    performance: {
        lazyLoadingOffset: '100px',
        animationThrottleMs: 16,
        authCheckIntervalMs: 30000,
        requestTimeoutMs: 5000
    },
    
    // API configuration
    api: {
        timeout: 10000,
        retryAttempts: 3,
        retryDelay: 1000
    }
};

// Update feature flags based on environment
if (window.G2OwnConfig.environment === 'development') {
    window.G2OwnConfig.features.performanceMonitoring = true;
    window.G2OwnConfig.features.debugConsole = true;
}

// Get current backend URL
window.G2OwnConfig.getBackendURL = function() {
    return this.backend[this.environment] || this.backend.production;
};

// Check if feature is enabled
window.G2OwnConfig.isFeatureEnabled = function(feature) {
    return this.features[feature] || false;
};

// Production-safe logging
window.G2OwnConfig.log = function(message, level = 'log') {
    if (this.environment === 'development' || this.features.debugConsole) {
        console[level](message);
    } else if (level === 'error' || level === 'warn') {
        console[level](message);
        // In production, could send errors to monitoring service
        if (level === 'error' && this.features.errorReporting) {
            // TODO: Send to error reporting service
        }
    }
};

// Initialize production optimizations
if (window.G2OwnConfig.environment === 'production') {
    // Disable right-click context menu on production
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    // Disable F12, Ctrl+Shift+I, Ctrl+U
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.key === 'u')) {
            e.preventDefault();
        }
    });
    
    // Disable text selection for UI elements
    document.addEventListener('selectstart', (e) => {
        if (e.target.closest('.navbar, .sidebar, .auth-dropdown')) {
            e.preventDefault();
        }
    });
}

window.G2OwnConfig.log(`🚀 G2Own initialized in ${window.G2OwnConfig.environment} mode`);
