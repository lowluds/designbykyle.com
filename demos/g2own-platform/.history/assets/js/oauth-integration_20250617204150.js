/*!
 * G2Own OAuth Integration
 * OAuth 2.0 integration with Invision Community
 * Version: 1.0.0
 */

class G2OwnOAuth {
    constructor() {
        // OAuth Configuration - PRODUCTION SETTINGS
        this.config = {
            clientId: 'G2OWN_WEBSITE_INTEGRATION', // Production client ID - UPDATE THIS
            communityURL: 'https://g2own.com/community',
            redirectURI: 'https://g2own.com/oauth/callback',
            successURI: 'https://g2own.com/oauth/success',
            scope: 'authorized_user email profile', // Production scopes
            responseType: 'code',
            state: null
        };
        
        // OAuth endpoints - PRODUCTION
        this.endpoints = {
            authorize: `${this.config.communityURL}/oauth/authorize/`,
            token: `${this.config.communityURL}/oauth/token/`,
            userInfo: `${this.config.communityURL}/api/core/me`,
            cart: `${this.config.communityURL}/api/commerce/cart`,
            products: `${this.config.communityURL}/api/commerce/products`,
            orders: `${this.config.communityURL}/api/commerce/orders`,
            invoices: `${this.config.communityURL}/api/commerce/invoices`,
            purchases: `${this.config.communityURL}/api/commerce/purchases`,
            licenseKeys: `${this.config.communityURL}/api/commerce/licenseKeys`
        };
        
        // Storage keys
        this.storageKeys = {
            accessToken: 'g2own_oauth_token',
            refreshToken: 'g2own_oauth_refresh',
            tokenExpiry: 'g2own_token_expiry',
            userInfo: 'g2own_user_info',
            state: 'g2own_oauth_state'
        };
        
        // State management
        this.isAuthenticated = false;
        this.currentUser = null;
        this.accessToken = null;
        this.refreshToken = null;
        
        this.init();
    }
    
    init() {
        // Load stored tokens
        this.loadStoredTokens();
        
        // Check if this is an OAuth callback
        this.handleOAuthCallback();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Validate current session
        this.validateSession();
        
        console.log('G2Own OAuth Integration initialized');
    }
    
    loadStoredTokens() {
        try {
            this.accessToken = localStorage.getItem(this.storageKeys.accessToken);
            this.refreshToken = localStorage.getItem(this.storageKeys.refreshToken);
            
            const userInfo = localStorage.getItem(this.storageKeys.userInfo);
            if (userInfo) {
                this.currentUser = JSON.parse(userInfo);
                this.isAuthenticated = true;
            }
            
            const expiry = localStorage.getItem(this.storageKeys.tokenExpiry);
            if (expiry && Date.now() > parseInt(expiry)) {
                this.clearTokens();
            }
        } catch (error) {
            console.error('Error loading stored tokens:', error);
            this.clearTokens();
        }
    }
    
    generateState() {
        const state = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
        localStorage.setItem(this.storageKeys.state, state);
        return state;
    }
    
    validateState(receivedState) {
        const storedState = localStorage.getItem(this.storageKeys.state);
        localStorage.removeItem(this.storageKeys.state);
        return storedState === receivedState;
    }
    
    // OAuth Login Flow
    async initiateLogin(options = {}) {
        try {
            const state = this.generateState();
            
            const params = new URLSearchParams({
                client_id: this.config.clientId,
                response_type: this.config.responseType,
                redirect_uri: this.config.redirectURI,
                scope: this.config.scope,
                state: state
            });
            
            // Add any additional parameters
            if (options.prompt) params.append('prompt', options.prompt);
            if (options.loginHint) params.append('login_hint', options.loginHint);
            
            const authURL = `${this.endpoints.authorize}?${params.toString()}`;
            
            // Store current URL for redirect after auth
            sessionStorage.setItem('g2own_pre_auth_url', window.location.href);
            
            // Dispatch event before redirect
            this.dispatchEvent('oauth:login:start', { authURL });
            
            // Redirect to OAuth provider
            window.location.href = authURL;
            
        } catch (error) {
            console.error('OAuth login initiation failed:', error);
            this.dispatchEvent('oauth:login:error', { error });
            throw error;
        }
    }
    
    // Handle OAuth Callback
    async handleOAuthCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        
        if (error) {
            console.error('OAuth error:', error);
            this.dispatchEvent('oauth:callback:error', { 
                error, 
                description: urlParams.get('error_description') 
            });
            this.clearURLParams();
            return;
        }
        
        if (code && state) {
            if (!this.validateState(state)) {
                console.error('Invalid OAuth state parameter');
                this.dispatchEvent('oauth:callback:error', { 
                    error: 'invalid_state',
                    description: 'State parameter validation failed'
                });
                this.clearURLParams();
                return;
            }
            
            try {
                await this.exchangeCodeForToken(code);
                this.clearURLParams();
                
                // Redirect to original URL if available
                const preAuthURL = sessionStorage.getItem('g2own_pre_auth_url');
                if (preAuthURL && preAuthURL !== window.location.href) {
                    sessionStorage.removeItem('g2own_pre_auth_url');
                    window.location.href = preAuthURL;
                }
                
            } catch (error) {
                console.error('Token exchange failed:', error);
                this.dispatchEvent('oauth:callback:error', { error });
                this.clearURLParams();
            }
        }
    }
    
    // Exchange authorization code for access token
    async exchangeCodeForToken(code) {
        try {
            const response = await fetch(this.endpoints.token, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    client_id: this.config.clientId,
                    code: code,
                    redirect_uri: this.config.redirectURI
                })
            });
            
            if (!response.ok) {
                throw new Error(`Token exchange failed: ${response.status}`);
            }
            
            const tokenData = await response.json();
            await this.storeTokens(tokenData);
            await this.fetchUserInfo();
            
            this.dispatchEvent('oauth:login:success', { 
                user: this.currentUser,
                tokens: tokenData
            });
            
            return tokenData;
            
        } catch (error) {
            console.error('Token exchange error:', error);
            throw error;
        }
    }
    
    // Store OAuth tokens
    async storeTokens(tokenData) {
        try {
            this.accessToken = tokenData.access_token;
            this.refreshToken = tokenData.refresh_token;
            
            localStorage.setItem(this.storageKeys.accessToken, this.accessToken);
            if (this.refreshToken) {
                localStorage.setItem(this.storageKeys.refreshToken, this.refreshToken);
            }
            
            // Calculate expiry time
            if (tokenData.expires_in) {
                const expiryTime = Date.now() + (tokenData.expires_in * 1000);
                localStorage.setItem(this.storageKeys.tokenExpiry, expiryTime.toString());
            }
            
            this.isAuthenticated = true;
            
        } catch (error) {
            console.error('Error storing tokens:', error);
            throw error;
        }
    }
    
    // Fetch user information
    async fetchUserInfo() {
        try {
            const response = await this.makeAuthenticatedRequest(this.endpoints.userInfo);
            
            if (response.ok) {
                this.currentUser = await response.json();
                localStorage.setItem(this.storageKeys.userInfo, JSON.stringify(this.currentUser));
                
                this.dispatchEvent('oauth:user:updated', { user: this.currentUser });
                return this.currentUser;
            } else {
                throw new Error('Failed to fetch user info');
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
            throw error;
        }
    }
    
    // Make authenticated API request
    async makeAuthenticatedRequest(url, options = {}) {
        if (!this.accessToken) {
            throw new Error('No access token available');
        }
        
        const headers = {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        // Handle token expiry
        if (response.status === 401) {
            try {
                await this.refreshAccessToken();
                // Retry with new token
                headers['Authorization'] = `Bearer ${this.accessToken}`;
                return await fetch(url, { ...options, headers });
            } catch (refreshError) {
                this.handleTokenExpiry();
                throw new Error('Authentication failed');
            }
        }
        
        return response;
    }
    
    // Refresh access token
    async refreshAccessToken() {
        if (!this.refreshToken) {
            throw new Error('No refresh token available');
        }
        
        try {
            const response = await fetch(this.endpoints.token, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: this.refreshToken,
                    client_id: this.config.clientId
                })
            });
            
            if (response.ok) {
                const tokenData = await response.json();
                await this.storeTokens(tokenData);
                return tokenData;
            } else {
                throw new Error('Token refresh failed');
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            throw error;
        }
    }
    
    // Logout user
    async logout() {
        try {
            // Revoke token if possible
            if (this.accessToken) {
                try {
                    await fetch(`${this.config.communityURL}/oauth/revoke/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: new URLSearchParams({
                            token: this.accessToken,
                            client_id: this.config.clientId
                        })
                    });
                } catch (revokeError) {
                    console.warn('Token revocation failed:', revokeError);
                }
            }
            
            this.clearTokens();
            this.dispatchEvent('oauth:logout:success');
            
        } catch (error) {
            console.error('Logout error:', error);
            this.dispatchEvent('oauth:logout:error', { error });
        }
    }
    
    // Clear all stored tokens and user data
    clearTokens() {
        Object.values(this.storageKeys).forEach(key => {
            localStorage.removeItem(key);
        });
        
        this.accessToken = null;
        this.refreshToken = null;
        this.currentUser = null;
        this.isAuthenticated = false;
    }
    
    // Handle token expiry
    handleTokenExpiry() {
        this.clearTokens();
        this.dispatchEvent('oauth:token:expired');
    }
    
    // Validate current session
    async validateSession() {
        if (this.accessToken && this.isAuthenticated) {
            try {
                await this.fetchUserInfo();
            } catch (error) {
                console.warn('Session validation failed:', error);
                this.clearTokens();
            }
        }
    }
    
    // Clear URL parameters after OAuth callback
    clearURLParams() {
        const url = new URL(window.location);
        url.searchParams.delete('code');
        url.searchParams.delete('state');
        url.searchParams.delete('error');
        url.searchParams.delete('error_description');
        
        window.history.replaceState({}, document.title, url.toString());
    }
    
    // Set up event listeners
    setupEventListeners() {
        // Listen for storage changes (multi-tab support)
        window.addEventListener('storage', (event) => {
            if (Object.values(this.storageKeys).includes(event.key)) {
                this.loadStoredTokens();
                this.dispatchEvent('oauth:storage:changed', { key: event.key });
            }
        });
        
        // Page visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isAuthenticated) {
                this.validateSession();
            }
        });
    }
    
    // Event dispatcher
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
    }
    
    // Public API methods
    getAccessToken() {
        return this.accessToken;
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    isUserAuthenticated() {
        return this.isAuthenticated && !!this.accessToken;
    }
    
    getAuthorizationHeader() {
        return this.accessToken ? `Bearer ${this.accessToken}` : null;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = G2OwnOAuth;
} else {
    window.G2OwnOAuth = G2OwnOAuth;
}
