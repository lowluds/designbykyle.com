/**
 * OAuth Configuration for G2Own Invision Community Integration
 * Contains all OAuth-related configuration settings
 */

const OAuthConfig = {
    // Invision Community OAuth endpoints
    community: {
        baseUrl: 'https://g2own.com/community',
        authUrl: 'https://g2own.com/community/oauth/authorize/',
        tokenUrl: 'https://g2own.com/community/oauth/token/',
        userUrl: 'https://g2own.com/community/api/core/me',
        logoutUrl: 'https://g2own.com/community/oauth/logout/'
    },
    
    // OAuth client configuration
    client: {
        id: 'your_client_id_here', // Replace with actual client ID from Invision Community
        redirectUri: 'https://g2own.com/oauth/callback.php', // Must match registered redirect URI
        scope: 'profile email commerce', // Requested permissions
        responseType: 'code',
        state: null // Will be generated dynamically for security
    },
    
    // Local endpoints
    local: {
        callbackUrl: '/oauth/callback.php',
        successUrl: '/oauth/success.php',
        apiBaseUrl: '/community/api' // Local API proxy if needed
    },
    
    // Session and storage configuration
    session: {
        tokenKey: 'g2own_oauth_token',
        userKey: 'g2own_user_data',
        stateKey: 'g2own_oauth_state',
        expiryKey: 'g2own_token_expiry',
        sessionDuration: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    },
    
    // UI configuration
    ui: {
        loginButtonId: 'oauth-login-btn',
        logoutButtonId: 'oauth-logout-btn',
        userDisplayId: 'user-display',
        testPanelId: 'oauth-test-panel',
        modalId: 'auth-modal'
    },
    
    // Debug and testing
    debug: {
        enabled: true, // Set to false in production
        logLevel: 'info', // 'debug', 'info', 'warn', 'error'
        testMode: false // Enable test panel and additional logging
    },
    
    // Error messages
    messages: {
        loginRequired: 'Please log in to continue',
        loginSuccess: 'Successfully logged in!',
        loginError: 'Login failed. Please try again.',
        logoutSuccess: 'Successfully logged out',
        tokenExpired: 'Your session has expired. Please log in again.',
        networkError: 'Network error. Please check your connection.',
        invalidResponse: 'Invalid response from server'
    }
};

// Generate a secure random state for OAuth
OAuthConfig.generateState = function() {
    const array = new Uint32Array(8);
    crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
};

// Build authorization URL
OAuthConfig.buildAuthUrl = function() {
    const state = this.generateState();
    localStorage.setItem(this.session.stateKey, state);
    
    const params = new URLSearchParams({
        client_id: this.client.id,
        redirect_uri: this.client.redirectUri,
        response_type: this.client.responseType,
        scope: this.client.scope,
        state: state
    });
    
    return `${this.community.authUrl}?${params.toString()}`;
};

// Log function for debugging
OAuthConfig.log = function(level, message, data = null) {
    if (!this.debug.enabled) return;
    
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.debug.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    if (messageLevelIndex >= currentLevelIndex) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [OAUTH-${level.toUpperCase()}] ${message}`;
        
        console[level === 'debug' ? 'log' : level](logMessage, data || '');
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OAuthConfig;
}
