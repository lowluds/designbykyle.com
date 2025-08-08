/**
 * OAuth Manager
 * Coordinates all OAuth-related integrations and provides a unified interface
 */

class OAuthManager {
    constructor() {
        this.config = OAuthConfig;
        this.oauth = null;
        this.cart = null;
        this.products = null;
        this.testing = null;
        
        this.init();
    }
    
    /**
     * Initialize OAuth Manager
     */
    init() {
        this.config.log('info', 'Initializing OAuth Manager');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeComponents();
            });
        } else {
            this.initializeComponents();
        }
    }
      /**
     * Initialize all OAuth components
     */
    initializeComponents() {
        try {
            // Initialize main OAuth integration
            if (typeof OAuthIntegration !== 'undefined') {
                this.oauth = new OAuthIntegration();
                window.oauthIntegration = this.oauth;
                this.config.log('info', 'OAuth Integration initialized');
            }
            
            // Initialize cart integration
            if (typeof CartOAuthIntegration !== 'undefined' && this.oauth) {
                this.cart = new CartOAuthIntegration(this.oauth);
                window.cartOAuthIntegration = this.cart;
                this.config.log('info', 'Cart OAuth Integration initialized');
            }
            
            // Initialize notifications integration
            if (typeof OAuthNotifications !== 'undefined') {
                this.notifications = new OAuthNotifications();
                window.oauthNotifications = this.notifications;
                this.config.log('info', 'OAuth Notifications initialized');
            }
            
            // Initialize product display integration
            if (typeof ProductDisplayOAuth !== 'undefined' && this.oauth) {
                this.products = new ProductDisplayOAuth(this.oauth);
                window.productDisplayOAuth = this.products;
                this.config.log('info', 'Product Display OAuth initialized');
            }
            
            // Initialize testing panel if enabled
            if (this.config.debug.testMode && typeof OAuthTesting !== 'undefined') {
                this.testing = new OAuthTesting(this);
                window.oauthTesting = this.testing;
                this.config.log('info', 'OAuth Testing panel initialized');
            }
            
            // Set up global event listeners
            this.setupGlobalEventListeners();
            
            // Check for OAuth callback
            this.checkForCallback();
            
            this.config.log('info', 'OAuth Manager initialization complete');
            
        } catch (error) {
            this.config.log('error', 'Error initializing OAuth Manager', error);
        }
    }
    
    /**
     * Set up global event listeners
     */
    setupGlobalEventListeners() {
        // Listen for auth state changes to coordinate between components
        window.addEventListener('oauthStateChanged', (e) => {
            this.handleGlobalAuthStateChange(e.detail);
        });
        
        // Handle browser back/forward navigation
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.oauthCallback) {
                this.checkForCallback();
            }
        });
        
        // Handle visibility change (tab focus)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.oauth) {
                // Refresh session when tab becomes visible
                this.oauth.checkExistingSession();
            }
        });
    }
    
    /**
     * Handle global authentication state changes
     */
    handleGlobalAuthStateChange(authData) {
        this.config.log('info', 'Global auth state changed', authData);
        
        // Update any global UI elements
        this.updateGlobalUI(authData);
        
        // Emit custom event for third-party integrations
        window.dispatchEvent(new CustomEvent('g2ownAuthChanged', {
            detail: authData
        }));
    }
    
    /**
     * Update global UI elements
     */
    updateGlobalUI(authData) {
        // Update navigation
        const navElements = document.querySelectorAll('.nav-auth-dependent');
        navElements.forEach(element => {
            if (authData.isAuthenticated) {
                element.classList.add('authenticated');
                element.classList.remove('unauthenticated');
            } else {
                element.classList.add('unauthenticated');
                element.classList.remove('authenticated');
            }
        });
        
        // Update any global user displays
        const globalUserDisplays = document.querySelectorAll('.global-user-display');
        globalUserDisplays.forEach(display => {
            if (authData.isAuthenticated && authData.userData) {
                display.innerHTML = `
                    <div class="global-user-info">
                        <span>Welcome, ${authData.userData.name}</span>
                    </div>
                `;
                display.style.display = 'block';
            } else {
                display.style.display = 'none';
            }
        });
    }
    
    /**
     * Check for OAuth callback in URL
     */
    checkForCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        
        if (error) {
            this.config.log('error', 'OAuth error received', { error, description: urlParams.get('error_description') });
            this.handleOAuthError(error, urlParams.get('error_description'));
            return;
        }
        
        if (code && state) {
            this.config.log('info', 'OAuth callback detected, processing...');
            this.handleOAuthCallback(code, state);
        }
    }
    
    /**
     * Handle OAuth callback
     */
    async handleOAuthCallback(code, state) {
        if (!this.oauth) {
            this.config.log('error', 'OAuth integration not initialized');
            return;
        }
        
        try {
            const success = await this.oauth.handleCallback(code, state);
            
            if (success) {
                // Clean up URL
                this.cleanUpCallbackUrl();
                
                // Redirect to success page or show success message
                this.handleOAuthSuccess();
            } else {
                this.handleOAuthError('callback_failed', 'Failed to process OAuth callback');
            }
        } catch (error) {
            this.config.log('error', 'Error handling OAuth callback', error);
            this.handleOAuthError('callback_error', error.message);
        }
    }
    
    /**
     * Handle OAuth success
     */
    handleOAuthSuccess() {
        this.config.log('info', 'OAuth authentication successful');
        
        // Show success message
        this.showMessage(this.config.messages.loginSuccess, 'success');
        
        // Optional: Redirect to success page
        const successUrl = this.config.local.successUrl;
        if (successUrl && window.location.pathname !== successUrl) {
            // Could redirect to success page
            // window.location.href = successUrl;
        }
        
        // Emit success event
        window.dispatchEvent(new CustomEvent('oauthSuccess', {
            detail: this.oauth.getAuthState()
        }));
    }
    
    /**
     * Handle OAuth error
     */
    handleOAuthError(error, description) {
        this.config.log('error', 'OAuth error', { error, description });
        
        // Show error message
        let message = this.config.messages.loginError;
        if (description) {
            message += `: ${description}`;
        }
        
        this.showMessage(message, 'error');
        
        // Clean up URL
        this.cleanUpCallbackUrl();
        
        // Emit error event
        window.dispatchEvent(new CustomEvent('oauthError', {
            detail: { error, description }
        }));
    }
    
    /**
     * Clean up callback parameters from URL
     */
    cleanUpCallbackUrl() {
        if (window.history && window.history.replaceState) {
            const url = new URL(window.location);
            url.searchParams.delete('code');
            url.searchParams.delete('state');
            url.searchParams.delete('error');
            url.searchParams.delete('error_description');
            
            window.history.replaceState({}, document.title, url.toString());
        }
    }
    
    /**
     * Show message to user
     */
    showMessage(message, type = 'info') {
        // Try to use existing notification system
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else if (typeof Swal !== 'undefined') {
            // Use SweetAlert if available
            Swal.fire({
                title: type === 'error' ? 'Error' : 'Success',
                text: message,
                icon: type === 'error' ? 'error' : 'success',
                timer: 3000,
                showConfirmButton: false
            });
        } else {
            // Fallback to simple alert
            alert(message);
        }
    }
    
    /**
     * Get OAuth integration instance
     */
    getOAuth() {
        return this.oauth;
    }
    
    /**
     * Get cart integration instance
     */
    getCart() {
        return this.cart;
    }
    
    /**
     * Get product display integration instance
     */
    getProducts() {
        return this.products;
    }
    
    /**
     * Get testing panel instance
     */
    getTesting() {
        return this.testing;
    }
    
    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.oauth ? this.oauth.isUserAuthenticated() : false;
    }
    
    /**
     * Get current user data
     */
    getCurrentUser() {
        return this.oauth ? this.oauth.getUserData() : null;
    }
    
    /**
     * Login shortcut
     */
    login() {
        if (this.oauth) {
            this.oauth.login();
        }
    }
    
    /**
     * Logout shortcut
     */
    logout() {
        if (this.oauth) {
            this.oauth.logout();
        }
    }
    
    /**
     * Enable/disable test mode
     */
    setTestMode(enabled) {
        this.config.debug.testMode = enabled;
        
        if (enabled && !this.testing && typeof OAuthTesting !== 'undefined') {
            this.testing = new OAuthTesting(this);
            window.oauthTesting = this.testing;
        } else if (!enabled && this.testing) {
            this.testing.destroy();
            this.testing = null;
            window.oauthTesting = null;
        }
    }
    
    /**
     * Get current state of all integrations
     */
    getState() {
        return {
            isAuthenticated: this.isAuthenticated(),
            user: this.getCurrentUser(),
            oauth: this.oauth ? this.oauth.getAuthState() : null,
            cart: this.cart ? {
                items: this.cart.getCart(),
                count: this.cart.getItemCount(),
                total: this.cart.getTotal()
            } : null,
            products: this.products ? {
                products: this.products.getProducts(),
                userProducts: this.products.getUserProducts(),
                favorites: this.products.getFavorites()
            } : null
        };
    }
    
    /**
     * Debug method to log current state
     */
    debugState() {
        const state = this.getState();
        this.config.log('debug', 'Current OAuth Manager state', state);
        return state;
    }
}

// Initialize OAuth Manager when script loads
document.addEventListener('DOMContentLoaded', () => {
    if (!window.oauthManager) {
        window.oauthManager = new OAuthManager();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OAuthManager;
}
