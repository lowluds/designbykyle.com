/*!
 * G2Own Enhanced OAuth Integration
 * Handles OAuth flow initiation, state management, and secure redirects
 */

class G2OwnOAuth {
    constructor() {
        this.config = {
            clientId: '86490564787ccfdb2fefcaed4b49138f',
            communityUrl: 'https://g2own.com/community',
            redirectUri: 'https://g2own.com/oauth/callback',
            scopes: ['read', 'authorized_user', 'email', 'profile'],
            responseType: 'code',
            state: null
        };
        
        this.init();
    }    init() {
        console.log('🔧 Initializing G2Own OAuth Integration...');
        this.setupEventListeners();
        
        // SAFETY CHECK: Only check for OAuth return if we have valid parameters
        const urlParams = new URLSearchParams(window.location.search);
        const hasOAuthParams = urlParams.has('code') || urlParams.has('token') || 
                              (urlParams.has('login') && urlParams.get('login') === 'success');
        
        if (hasOAuthParams) {
            console.log('✅ Valid OAuth parameters detected, processing...');
            this.checkForOAuthReturn();
        } else {
            console.log('ℹ️ No OAuth parameters, skipping OAuth return check');
        }
    }

    generateSecureState() {
        // Generate cryptographically secure random state
        const array = new Uint32Array(4);
        crypto.getRandomValues(array);
        return Array.from(array, dec => ('0' + dec.toString(16)).substr(-8)).join('');
    }

    initiateLogin(returnUrl = null) {
        console.log('🚀 Initiating OAuth login flow...');
        
        // Generate and store secure state
        this.config.state = this.generateSecureState();
        sessionStorage.setItem('oauth_state', this.config.state);
        
        // Store return URL for post-login redirect
        if (returnUrl) {
            sessionStorage.setItem('oauth_return_url', returnUrl);
        } else {
            sessionStorage.setItem('oauth_return_url', window.location.href);
        }
        
        // Build authorization URL
        const authUrl = this.buildAuthorizationUrl();
        
        // Track login attempt
        this.trackLoginAttempt();
        
        // Redirect to authorization server
        window.location.href = authUrl;
    }

    buildAuthorizationUrl() {
        const params = new URLSearchParams({
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectUri,
            response_type: this.config.responseType,
            scope: this.config.scopes.join(' '),
            state: this.config.state
        });

        return `${this.config.communityUrl}/oauth/authorize/?${params.toString()}`;
    }

    checkForOAuthReturn() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Check if we're returning from OAuth success
        if (urlParams.get('login') === 'success' || urlParams.get('status') === 'success') {
            console.log('✅ OAuth return detected!');
            this.handleOAuthReturn(urlParams);
        }
        
        // Check if we have fresh OAuth data in localStorage
        this.checkForFreshOAuthData();
    }

    async handleOAuthReturn(urlParams) {
        try {
            // Security validation
            if (window.securityUtils && !window.securityUtils.checkRateLimit('oauthReturn', 3, 60000)) {
                console.warn('🚨 OAuth return processing rate limited');
                return;
            }

            // Extract OAuth data from URL parameters
            const oauthData = this.extractOAuthData(urlParams);
            
            if (oauthData && oauthData.token) {
                // Store OAuth data securely
                await this.storeOAuthData(oauthData);
                
                // Clean up URL
                this.cleanUpUrl();
                
                // Trigger authentication update
                await this.triggerAuthUpdate(oauthData);
                
                // Handle return URL redirect
                this.handleReturnUrlRedirect();
                
                console.log('🎉 OAuth authentication completed successfully!');
            }
        } catch (error) {
            console.error('❌ OAuth return handling failed:', error);
            this.handleOAuthError(error);
        }
    }

    extractOAuthData(urlParams) {
        return {
            token: urlParams.get('token'),
            expiresIn: urlParams.get('expires_in'),
            userId: urlParams.get('user_id'),
            userName: urlParams.get('user_name'),
            userEmail: urlParams.get('user_email'),
            purchaseCount: urlParams.get('purchase_count') || 0,
            invoiceCount: urlParams.get('invoice_count') || 0,
            transactionCount: urlParams.get('transaction_count') || 0,
            apiKeys: urlParams.get('api_keys'),
            timestamp: urlParams.get('timestamp')
        };
    }

    async storeOAuthData(oauthData) {
        const userData = {
            id: oauthData.userId,
            name: oauthData.userName,
            email: oauthData.userEmail,
            purchase_count: parseInt(oauthData.purchaseCount) || 0,
            invoice_count: parseInt(oauthData.invoiceCount) || 0,
            transaction_count: parseInt(oauthData.transactionCount) || 0,
            login_time: Date.now(),
            authenticated: true
        };

        // Store in localStorage with expiration
        const expiry = Date.now() + ((parseInt(oauthData.expiresIn) || 3600) * 1000);
        
        localStorage.setItem('g2own_oauth_token', oauthData.token);
        localStorage.setItem('g2own_user_data', JSON.stringify(userData));
        localStorage.setItem('g2own_token_expiry', expiry.toString());
        
        // Store API keys if available
        if (oauthData.apiKeys) {
            try {
                const decodedKeys = JSON.parse(atob(oauthData.apiKeys));
                localStorage.setItem('g2own_api_keys', JSON.stringify(decodedKeys));
            } catch (e) {
                console.warn('Failed to decode API keys:', e);
            }
        }

        // Set session flag for fresh login
        sessionStorage.setItem('g2own_fresh_login', 'true');
        
        console.log('💾 OAuth data stored successfully:', userData);
    }

    cleanUpUrl() {
        try {
            const url = new URL(window.location);
            const paramsToRemove = [
                'login', 'status', 'token', 'expires_in', 'user_id', 
                'user_name', 'user_email', 'purchase_count', 'invoice_count',
                'transaction_count', 'api_keys', 'timestamp'
            ];
            
            paramsToRemove.forEach(param => url.searchParams.delete(param));
            
            const cleanedUrl = url.pathname + url.search;
            window.history.replaceState({}, document.title, cleanedUrl);
            
            console.log('🧹 URL cleaned up successfully');
        } catch (error) {
            console.error('❌ URL cleanup failed:', error);
        }
    }

    async triggerAuthUpdate(oauthData) {
        const userData = {
            id: oauthData.userId,
            name: oauthData.userName,
            email: oauthData.userEmail,
            purchase_count: parseInt(oauthData.purchaseCount) || 0,
            invoice_count: parseInt(oauthData.invoiceCount) || 0,
            transaction_count: parseInt(oauthData.transactionCount) || 0,
            authenticated: true
        };

        // Emit custom events
        window.dispatchEvent(new CustomEvent('g2own:oauth-success', {
            detail: { user: userData, token: oauthData.token, timestamp: Date.now() }
        }));

        window.dispatchEvent(new CustomEvent('g2own:fresh-login', {
            detail: { user: userData, timestamp: Date.now() }
        }));

        // Force auth state updates
        await this.forceAuthStateUpdates(userData);
    }

    async forceAuthStateUpdates(userData) {
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        
        // Force session bridge update
        if (window.sessionBridge) {
            await delay(100);
            window.sessionBridge.forceUpdate?.();
            window.sessionBridge.checkSession?.();
        }

        // Force top nav update
        if (window.topNavAuth) {
            await delay(200);
            window.topNavAuth.checkAuthStatus?.();
            window.topNavAuth.forceUpdate?.(userData);
        }

        // Force left sidebar update
        if (window.leftSidebarController) {
            await delay(300);
            window.leftSidebarController.checkAuthState?.();
            window.leftSidebarController.forceUpdate?.(userData);
        }

        // Force main app update
        if (window.g2ownEnhanced) {
            await delay(400);
            window.g2ownEnhanced.checkAuthState?.();
            window.g2ownEnhanced.updateUserState?.(userData);
        }
    }

    handleReturnUrlRedirect() {
        const returnUrl = sessionStorage.getItem('oauth_return_url');
        if (returnUrl && returnUrl !== window.location.href) {
            // Validate return URL for security
            const isValidReturn = window.securityUtils 
                ? window.securityUtils.isValidReturnUrl(returnUrl)
                : returnUrl.startsWith(window.location.origin);

            if (isValidReturn) {
                console.log('🔄 Redirecting to return URL:', returnUrl);
                setTimeout(() => {
                    window.location.href = returnUrl;
                }, 1000);
            }
        }
        
        // Clean up return URL from session
        sessionStorage.removeItem('oauth_return_url');
    }

    checkForFreshOAuthData() {
        // Check if we have fresh login data
        const freshLogin = sessionStorage.getItem('g2own_fresh_login');
        if (freshLogin === 'true') {
            console.log('🔄 Fresh login detected, triggering auth updates...');
            
            const userData = localStorage.getItem('g2own_user_data');
            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    this.triggerAuthUpdate({
                        userId: user.id,
                        userName: user.name,
                        userEmail: user.email,
                        purchaseCount: user.purchase_count || 0,
                        invoiceCount: user.invoice_count || 0,
                        transactionCount: user.transaction_count || 0,
                        token: localStorage.getItem('g2own_oauth_token')
                    });
                } catch (e) {
                    console.error('Failed to parse user data:', e);
                }
            }
            
            // Clear fresh login flag
            sessionStorage.removeItem('g2own_fresh_login');
        }
    }

    handleOAuthError(error) {
        console.error('🚨 OAuth Error:', error);
        
        // Show user-friendly error message
        const errorMessage = error.message || 'Authentication failed. Please try again.';
        
        // Try multiple notification systems
        if (window.g2ownEnhanced?.showNotification) {
            window.g2ownEnhanced.showNotification(errorMessage, 'error');
        } else if (window.leftSidebarController?.showNotification) {
            window.leftSidebarController.showNotification(errorMessage, 'error');
        } else {
            alert(errorMessage);
        }
    }

    trackLoginAttempt() {
        const attempts = parseInt(localStorage.getItem('g2own_login_attempts') || '0') + 1;
        localStorage.setItem('g2own_login_attempts', attempts.toString());
        localStorage.setItem('g2own_last_login_attempt', Date.now().toString());
    }

    setupEventListeners() {
        // Listen for login button clicks
        document.addEventListener('click', (event) => {
            const target = event.target.closest('[data-action="oauth-login"]');
            if (target) {
                event.preventDefault();
                const returnUrl = target.dataset.returnUrl || null;
                this.initiateLogin(returnUrl);
            }
        });

        // Listen for logout requests
        document.addEventListener('click', (event) => {
            const target = event.target.closest('[data-action="oauth-logout"]');
            if (target) {
                event.preventDefault();
                this.logout();
            }
        });

        // Listen for storage changes (cross-tab auth sync)
        window.addEventListener('storage', (event) => {
            if (event.key === 'g2own_oauth_token' && event.newValue) {
                console.log('🔄 OAuth token updated in another tab, syncing...');
                this.checkForFreshOAuthData();
            }
        });
    }

    logout() {
        console.log('👋 Logging out...');
        
        // Clear OAuth data
        localStorage.removeItem('g2own_oauth_token');
        localStorage.removeItem('g2own_user_data');
        localStorage.removeItem('g2own_token_expiry');
        localStorage.removeItem('g2own_api_keys');
        sessionStorage.removeItem('g2own_fresh_login');
        
        // Emit logout event
        window.dispatchEvent(new CustomEvent('g2own:logout', {
            detail: { timestamp: Date.now() }
        }));
        
        // Force auth state updates
        this.forceAuthStateUpdates(null);
        
        // Optionally redirect to logout URL
        // window.location.href = this.config.communityUrl + '/logout/';
    }

    // Public API methods
    getToken() {
        return localStorage.getItem('g2own_oauth_token');
    }

    getUser() {
        const userData = localStorage.getItem('g2own_user_data');
        return userData ? JSON.parse(userData) : null;
    }

    isAuthenticated() {
        const token = this.getToken();
        const expiry = localStorage.getItem('g2own_token_expiry');
        
        if (!token || !expiry) return false;
        
        return Date.now() < parseInt(expiry);
    }
}

// Initialize OAuth system
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 Initializing G2Own OAuth System...');
    window.g2ownOAuth = new G2OwnOAuth();
});

// Also initialize if DOM is already loaded
if (document.readyState !== 'loading') {
    console.log('🔧 DOM already loaded, initializing G2Own OAuth System...');
    window.g2ownOAuth = new G2OwnOAuth();
}
