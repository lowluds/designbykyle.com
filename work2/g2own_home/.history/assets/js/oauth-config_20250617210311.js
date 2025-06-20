/*!
 * G2Own OAuth Configuration
 * Configuration settings for OAuth integration
 * Version: 1.0.0
 */

// OAuth Configuration Object
window.G2OwnOAuthConfig = {
    // OAuth Client Settings - PRODUCTION CONFIGURATION
    oauth: {
        clientId: '86490564787ccfdb2fefcaed4b49138f', // G2Own Website Integration Client ID
        clientSecret: '', // Not needed for frontend-only flow
        redirectURI: 'https://g2own.com/oauth/callback',
        scope: 'authorized_user email profile',
        responseType: 'code',
        authEndpoint: 'https://g2own.com/community/oauth/authorize/',
        tokenEndpoint: 'https://g2own.com/community/oauth/token/'
    },
    
    // Community URLs - PRODUCTION
    community: {
        baseURL: 'https://g2own.com/community',
        storeURL: 'https://g2own.com/community/store',
        apiURL: 'https://g2own.com/community/api',
        loginURL: 'https://g2own.com/community/login',
        registerURL: 'https://g2own.com/community/register'
    },
    
    // Frontend URLs - PRODUCTION
    frontend: {
        baseURL: 'https://g2own.com',
        callbackURL: 'https://g2own.com/oauth/callback',
        successURL: window.location.origin + '/dashboard',
        errorURL: window.location.origin + '?error=oauth',
        logoutURL: window.location.origin + '?logout=success'
    },
    
    // API Endpoints
    api: {
        sessionExchange: '/api/oauth/session-exchange',
        refreshToken: '/api/oauth/refresh',
        logout: '/api/oauth/logout',
        userProfile: '/api/user/profile',
        cart: '/api/commerce/cart',
        products: '/api/commerce/products',
        orders: '/api/commerce/orders'
    },
    
    // Feature Flags
    features: {
        enableAutoLogin: true,
        enableCartSync: true,
        enableCrossDomainSync: true,
        enableSessionPersistence: true,
        enableTokenRefresh: true,
        enableSocialLogin: true,
        enableGuestCheckout: false
    },
    
    // UI Settings
    ui: {
        showLoginModal: true,
        enableNotifications: true,
        autoCloseModal: true,
        modalAnimationDuration: 300,
        notificationDuration: 5000,
        enableLoadingStates: true
    },
    
    // Security Settings
    security: {
        enableCSRFProtection: true,
        enableStateValidation: true,
        tokenStorageKey: 'g2own_oauth_token',
        sessionTimeout: 86400000, // 24 hours in milliseconds
        refreshTokenThreshold: 300000 // 5 minutes in milliseconds
    },
    
    // Analytics Integration
    analytics: {
        enableGA4: true,
        enableInvisionTracking: true,
        trackAuthEvents: true,
        trackCartEvents: true,
        trackNavigationEvents: true,
        trackErrorEvents: true
    },

    // Debug Settings
    debug: {
        enableLogging: true,
        logLevel: 'info', // 'debug', 'info', 'warn', 'error'
        enableConsoleOutput: true,
        enableNetworkLogging: false
    },
    
    // Localization
    messages: {
        loginSuccess: 'Successfully signed in!',
        loginError: 'Login failed. Please try again.',
        logoutSuccess: 'Successfully signed out!',
        sessionExpired: 'Your session has expired. Please sign in again.',
        cartItemAdded: 'Item added to cart!',
        cartItemRemoved: 'Item removed from cart!',
        cartSyncError: 'Failed to sync cart. Please try again.',
        networkError: 'Network error. Please check your connection.',
        loginRequired: 'Please sign in to continue.',
        registrationSuccess: 'Account created successfully!',
        registrationError: 'Registration failed. Please try again.'
    },
    
    // Cart Settings
    cart: {
        enableLocalStorage: true,
        enableServerSync: true,
        syncInterval: 30000, // 30 seconds
        maxItems: 50,
        enableQuantityLimits: true,
        enablePriceValidation: true
    },
    
    // Product Display Settings
    products: {
        itemsPerPage: 12,
        enableLazyLoading: true,
        enableInfiniteScroll: true,
        enableFiltering: true,
        enableSorting: true,
        enableSearch: true,
        imageLoadingPlaceholder: '/assets/images/placeholder-product.jpg'
    },
    
    // Performance Settings
    performance: {
        enableCaching: true,
        cacheTimeout: 300000, // 5 minutes
        enablePrefetching: true,
        enableCompression: true,
        maxConcurrentRequests: 5,
        requestTimeout: 30000 // 30 seconds
    }
};

// Development/Production Environment Detection
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Development environment overrides
    G2OwnOAuthConfig.community.baseURL = 'http://localhost/community';
    G2OwnOAuthConfig.debug.enableLogging = true;
    G2OwnOAuthConfig.debug.logLevel = 'debug';
    G2OwnOAuthConfig.debug.enableConsoleOutput = true;
    G2OwnOAuthConfig.debug.enableNetworkLogging = true;
    G2OwnOAuthConfig.security.sessionTimeout = 3600000; // 1 hour for development
}

// Apply configuration to OAuth classes when they're available
window.addEventListener('DOMContentLoaded', () => {
    // Wait for OAuth classes to be loaded
    const waitForOAuth = () => {
        if (window.G2OwnOAuth && window.G2OwnCartOAuth && window.G2OwnProductDisplay) {
            // Apply configuration
            if (window.G2OwnOAuth.prototype) {
                window.G2OwnOAuth.prototype.defaultConfig = G2OwnOAuthConfig;
            }
            
            console.log('G2Own OAuth Configuration applied');
        } else {
            setTimeout(waitForOAuth, 100);
        }
    };
    
    waitForOAuth();
});

// Utility function to get configuration values
window.getOAuthConfig = function(path, defaultValue = null) {
    return path.split('.').reduce((obj, key) => {
        return obj && obj[key] !== undefined ? obj[key] : defaultValue;
    }, G2OwnOAuthConfig);
};

// Utility function to update configuration
window.updateOAuthConfig = function(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => {
        if (!obj[key]) obj[key] = {};
        return obj[key];
    }, G2OwnOAuthConfig);
    
    target[lastKey] = value;
};

// Export configuration for server-side usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = G2OwnOAuthConfig;
}

console.log('G2Own OAuth Configuration loaded');
