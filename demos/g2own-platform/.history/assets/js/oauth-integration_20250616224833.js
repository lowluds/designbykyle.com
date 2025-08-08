/**
 * OAuth Integration Class for G2Own Invision Community
 * Handles OAuth authentication flow, token management, and user session
 */

class OAuthIntegration {
    constructor() {
        this.config = OAuthConfig;
        this.isAuthenticated = false;
        this.userData = null;
        this.token = null;
        
        this.init();
    }
    
    /**
     * Initialize OAuth integration
     */
    init() {
        this.config.log('info', 'Initializing OAuth integration');
        
        // Check for existing session
        this.checkExistingSession();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Update UI based on authentication state
        this.updateUI();
        
        this.config.log('info', 'OAuth integration initialized', {
            authenticated: this.isAuthenticated,
            hasUserData: !!this.userData
        });
    }
    
    /**
     * Check for existing valid session
     */
    checkExistingSession() {
        try {
            const token = localStorage.getItem(this.config.session.tokenKey);
            const userData = localStorage.getItem(this.config.session.userKey);
            const expiry = localStorage.getItem(this.config.session.expiryKey);
            
            if (token && userData && expiry) {
                const expiryTime = parseInt(expiry);
                const now = Date.now();
                
                if (now < expiryTime) {
                    this.token = token;
                    this.userData = JSON.parse(userData);
                    this.isAuthenticated = true;
                    this.config.log('info', 'Valid session found', { user: this.userData.name });
                } else {
                    this.config.log('info', 'Session expired, clearing data');
                    this.clearSession();
                }
            }
        } catch (error) {
            this.config.log('error', 'Error checking existing session', error);
            this.clearSession();
        }
    }
    
    /**
     * Set up event listeners for login/logout buttons
     */
    setupEventListeners() {
        // Login button
        const loginBtn = document.getElementById(this.config.ui.loginButtonId);
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.login();
            });
        }
        
        // Logout button
        const logoutBtn = document.getElementById(this.config.ui.logoutButtonId);
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
        
        // Listen for storage changes (multi-tab support)
        window.addEventListener('storage', (e) => {
            if (e.key === this.config.session.tokenKey) {
                this.checkExistingSession();
                this.updateUI();
            }
        });
    }
    
    /**
     * Initiate OAuth login flow
     */
    login() {
        this.config.log('info', 'Starting OAuth login flow');
        
        try {
            const authUrl = this.config.buildAuthUrl();
            this.config.log('debug', 'Redirecting to auth URL', { url: authUrl });
            
            // Redirect to OAuth provider
            window.location.href = authUrl;
        } catch (error) {
            this.config.log('error', 'Error starting login flow', error);
            this.showMessage(this.config.messages.loginError, 'error');
        }
    }
    
    /**
     * Handle OAuth callback (called from callback page)
     */
    async handleCallback(code, state, receivedState) {
        this.config.log('info', 'Handling OAuth callback', { code: code ? 'present' : 'missing' });
        
        try {
            // Verify state parameter
            const savedState = localStorage.getItem(this.config.session.stateKey);
            if (state !== savedState) {
                throw new Error('Invalid state parameter');
            }
            
            // Exchange code for token
            const tokenData = await this.exchangeCodeForToken(code);
            
            // Get user data
            const userData = await this.fetchUserData(tokenData.access_token);
            
            // Store session data
            this.storeSession(tokenData, userData);
            
            // Update authentication state
            this.isAuthenticated = true;
            this.userData = userData;
            this.token = tokenData.access_token;
            
            this.config.log('info', 'OAuth callback handled successfully', { user: userData.name });
            this.showMessage(this.config.messages.loginSuccess, 'success');
            
            return true;
        } catch (error) {
            this.config.log('error', 'Error handling OAuth callback', error);
            this.showMessage(this.config.messages.loginError, 'error');
            this.clearSession();
            return false;
        } finally {
            // Clean up state
            localStorage.removeItem(this.config.session.stateKey);
        }
    }
    
    /**
     * Exchange authorization code for access token
     */
    async exchangeCodeForToken(code) {
        const response = await fetch(this.config.local.callbackUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'exchange_token',
                code: code,
                redirect_uri: this.config.client.redirectUri
            })
        });
        
        if (!response.ok) {
            throw new Error(`Token exchange failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error_description || data.error);
        }
        
        return data;
    }
    
    /**
     * Fetch user data using access token
     */
    async fetchUserData(accessToken) {
        const response = await fetch(this.config.community.userUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch user data: ${response.statusText}`);
        }
        
        return await response.json();
    }
    
    /**
     * Store session data in localStorage
     */
    storeSession(tokenData, userData) {
        const expiryTime = Date.now() + (tokenData.expires_in * 1000);
        
        localStorage.setItem(this.config.session.tokenKey, tokenData.access_token);
        localStorage.setItem(this.config.session.userKey, JSON.stringify(userData));
        localStorage.setItem(this.config.session.expiryKey, expiryTime.toString());
        
        this.config.log('debug', 'Session stored', { 
            expiresIn: tokenData.expires_in,
            expiryTime: new Date(expiryTime).toISOString()
        });
    }
    
    /**
     * Logout user and clear session
     */
    async logout() {
        this.config.log('info', 'Logging out user');
        
        try {
            // Clear local session
            this.clearSession();
            
            // Update state
            this.isAuthenticated = false;
            this.userData = null;
            this.token = null;
            
            // Update UI
            this.updateUI();
            
            this.config.log('info', 'User logged out successfully');
            this.showMessage(this.config.messages.logoutSuccess, 'success');
            
            // Optional: Redirect to community logout to clear community session
            // window.location.href = this.config.community.logoutUrl;
        } catch (error) {
            this.config.log('error', 'Error during logout', error);
        }
    }
    
    /**
     * Clear session data
     */
    clearSession() {
        localStorage.removeItem(this.config.session.tokenKey);
        localStorage.removeItem(this.config.session.userKey);
        localStorage.removeItem(this.config.session.expiryKey);
        localStorage.removeItem(this.config.session.stateKey);
    }
    
    /**
     * Update UI based on authentication state
     */
    updateUI() {
        const loginBtn = document.getElementById(this.config.ui.loginButtonId);
        const logoutBtn = document.getElementById(this.config.ui.logoutButtonId);
        const userDisplay = document.getElementById(this.config.ui.userDisplayId);
        
        if (this.isAuthenticated && this.userData) {
            // User is logged in
            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'block';
            if (userDisplay) {
                userDisplay.innerHTML = `
                    <div class="user-info">
                        <img src="${this.userData.photoUrl || '/assets/images/default-avatar.png'}" 
                             alt="Avatar" class="user-avatar">
                        <span class="user-name">${this.userData.name}</span>
                    </div>
                `;
                userDisplay.style.display = 'block';
            }
        } else {
            // User is not logged in
            if (loginBtn) loginBtn.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (userDisplay) userDisplay.style.display = 'none';
        }
        
        // Trigger custom event for other components
        window.dispatchEvent(new CustomEvent('oauthStateChanged', {
            detail: {
                isAuthenticated: this.isAuthenticated,
                userData: this.userData
            }
        }));
    }
    
    /**
     * Show message to user
     */
    showMessage(message, type = 'info') {
        // Try to use existing notification system or create simple alert
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            // Fallback to browser alert
            alert(message);
        }
    }
    
    /**
     * Get current authentication state
     */
    getAuthState() {
        return {
            isAuthenticated: this.isAuthenticated,
            userData: this.userData,
            token: this.token
        };
    }
    
    /**
     * Check if user is authenticated
     */
    isUserAuthenticated() {
        return this.isAuthenticated;
    }
    
    /**
     * Get user data
     */
    getUserData() {
        return this.userData;
    }
    
    /**
     * Get access token
     */
    getAccessToken() {
        return this.token;
    }
      /**
     * Make authenticated API request with proper API key handling
     */
    async makeAuthenticatedRequest(url, options = {}, apiKeyType = null) {
        if (!this.isAuthenticated) {
            throw new Error('User not authenticated');
        }
        
        const defaultOptions = {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        
        // Add specific API key if required
        if (apiKeyType && this.config.apiKeys[apiKeyType]) {
            defaultOptions.headers['X-API-Key'] = this.config.apiKeys[apiKeyType];
            this.config.log('debug', `Using API key: ${apiKeyType}`, { endpoint: url });
        }
        
        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };
        
        this.config.log('debug', 'Making authenticated request', { 
            url, 
            method: mergedOptions.method || 'GET',
            hasApiKey: !!apiKeyType 
        });
        
        const response = await fetch(url, mergedOptions);
        
        if (response.status === 401) {
            // Token expired or invalid
            this.config.log('warn', 'Access token expired or invalid');
            this.clearSession();
            this.isAuthenticated = false;
            this.updateUI();
            throw new Error('Authentication expired');
        }
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        return response;
    }
    
    /**
     * Get user profile data using authorized_user API key
     */
    async getUserProfile() {
        try {
            const response = await this.makeAuthenticatedRequest(
                `${this.config.community.baseUrl}${this.config.endpoints.userProfile}`,
                { method: 'GET' },
                'authorizedUser'
            );
            
            const userData = await response.json();
            this.userData = userData;
            this.config.log('info', 'User profile loaded successfully', { userId: userData.id });
            
            return userData;
        } catch (error) {
            this.config.log('error', 'Failed to load user profile', error);
            throw error;
        }
    }
    
    /**
     * Get user purchases using menus API key
     */
    async getUserPurchases() {
        try {
            const response = await this.makeAuthenticatedRequest(
                `${this.config.community.baseUrl}${this.config.endpoints.purchases}`,
                { method: 'GET' },
                'menus'
            );
            
            const purchases = await response.json();
            this.config.log('info', 'User purchases loaded', { count: purchases?.results?.length || 0 });
            
            return purchases;
        } catch (error) {
            this.config.log('error', 'Failed to load user purchases', error);
            throw error;
        }
    }
    
    /**
     * Get user invoices using menus API key
     */
    async getUserInvoices() {
        try {
            const response = await this.makeAuthenticatedRequest(
                `${this.config.community.baseUrl}${this.config.endpoints.invoices}`,
                { method: 'GET' },
                'menus'
            );
            
            const invoices = await response.json();
            this.config.log('info', 'User invoices loaded', { count: invoices?.results?.length || 0 });
            
            return invoices;
        } catch (error) {
            this.config.log('error', 'Failed to load user invoices', error);
            throw error;
        }
    }
    
    /**
     * Get user transactions using menus API key
     */
    async getUserTransactions() {
        try {
            const response = await this.makeAuthenticatedRequest(
                `${this.config.community.baseUrl}${this.config.endpoints.transactions}`,
                { method: 'GET' },
                'menus'
            );
            
            const transactions = await response.json();
            this.config.log('info', 'User transactions loaded', { count: transactions?.results?.length || 0 });
            
            return transactions;
        } catch (error) {
            this.config.log('error', 'Failed to load user transactions', error);
            throw error;
        }
    }
    
    /**
     * Get user license keys using menus API key
     */
    async getUserLicenseKeys() {
        try {
            // Note: This endpoint might need specific parameters
            const response = await this.makeAuthenticatedRequest(
                `${this.config.community.baseUrl}${this.config.endpoints.licenseKeys.replace('{key}', '')}`,
                { method: 'GET' },
                'menus'
            );
            
            const licenseKeys = await response.json();
            this.config.log('info', 'User license keys loaded');
            
            return licenseKeys;
        } catch (error) {
            this.config.log('error', 'Failed to load user license keys', error);
            throw error;
        }
    }
}

// Global instance
window.oauthIntegration = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.oauthIntegration = new OAuthIntegration();
});
