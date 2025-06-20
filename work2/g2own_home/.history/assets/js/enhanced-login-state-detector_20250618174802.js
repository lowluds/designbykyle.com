/*!
 * G2Own Enhanced Login State Detector
 * Robust detection and synchronization of login state across UI components
 */

class EnhancedLoginStateDetector {
    constructor() {
        this.config = {
            checkInterval: 2000, // Check every 2 seconds
            maxChecks: 10, // Maximum number of checks
            debounceDelay: 500, // Debounce UI updates
            forceUpdateDelay: 1000 // Delay before forcing updates
        };
        
        this.state = {
            currentUser: null,
            isAuthenticated: false,
            lastCheck: 0,
            checkCount: 0,
            updatesPending: false
        };
        
        this.init();
    }

    init() {
        console.log('🔍 Initializing Enhanced Login State Detector...');
        
        this.setupEventListeners();
        this.startInitialDetection();
        this.setupPeriodicChecks();
    }

    setupEventListeners() {
        // Listen for OAuth events
        window.addEventListener('g2own:oauth-success', (event) => {
            console.log('🎉 OAuth success event received');
            this.handleAuthenticationChange(event.detail.user, true);
        });

        window.addEventListener('g2own:fresh-login', (event) => {
            console.log('🔄 Fresh login event received');
            this.handleAuthenticationChange(event.detail.user, true);
        });

        window.addEventListener('g2own:logout', () => {
            console.log('👋 Logout event received');
            this.handleAuthenticationChange(null, false);
        });

        // Listen for storage changes (cross-tab sync)
        window.addEventListener('storage', (event) => {
            if (event.key === 'g2own_user_data' || event.key === 'g2own_oauth_token') {
                console.log('💾 Storage change detected, checking auth state');
                this.debouncedStateCheck();
            }
        });

        // Listen for page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                console.log('👀 Page became visible, checking auth state');
                this.debouncedStateCheck();
            }
        });

        // Listen for focus events
        window.addEventListener('focus', () => {
            console.log('🎯 Window focused, checking auth state');
            this.debouncedStateCheck();
        });
    }

    startInitialDetection() {
        console.log('🚀 Starting initial authentication detection...');
        
        // Immediate check
        this.checkAuthenticationState();
        
        // Check for URL parameters indicating login success
        this.checkUrlParameters();
        
        // Check for fresh login flag
        this.checkFreshLoginFlag();
        
        // Delayed comprehensive check
        setTimeout(() => {
            this.comprehensiveAuthCheck();
        }, this.config.forceUpdateDelay);
    }

    setupPeriodicChecks() {
        // Periodic checks for the first minute after page load
        const checkInterval = setInterval(() => {
            this.state.checkCount++;
            
            if (this.state.checkCount <= this.config.maxChecks) {
                this.checkAuthenticationState();
            } else {
                clearInterval(checkInterval);
                console.log('✅ Periodic auth checks completed');
            }
        }, this.config.checkInterval);
    }

    async checkAuthenticationState() {
        try {
            const currentTime = Date.now();
            
            // Rate limiting
            if (currentTime - this.state.lastCheck < 1000) {
                return;
            }
            
            this.state.lastCheck = currentTime;
            
            console.log('🔍 Checking authentication state...');
            
            // Check multiple sources
            const tokenAuth = this.checkTokenAuthentication();
            const sessionAuth = await this.checkSessionAuthentication();
            const bridgeAuth = await this.checkBridgeAuthentication();
            
            // Determine final auth state
            const authResults = [tokenAuth, sessionAuth, bridgeAuth].filter(Boolean);
            const isAuthenticated = authResults.length > 0;
            const bestUserData = authResults.find(result => result.user) || authResults[0];
            
            if (isAuthenticated && bestUserData) {
                await this.handleAuthenticationChange(bestUserData.user, true);
            } else if (!isAuthenticated && this.state.isAuthenticated) {
                await this.handleAuthenticationChange(null, false);
            }
            
        } catch (error) {
            console.error('❌ Auth state check failed:', error);
        }
    }

    checkTokenAuthentication() {
        const token = localStorage.getItem('g2own_oauth_token');
        const userData = localStorage.getItem('g2own_user_data');
        const expiry = localStorage.getItem('g2own_token_expiry');
        
        if (!token || !userData) {
            return null;
        }
        
        // Check token expiry
        if (expiry && Date.now() >= parseInt(expiry)) {
            console.log('⏰ Token expired, clearing auth data');
            this.clearAuthData();
            return null;
        }
        
        try {
            const user = JSON.parse(userData);
            console.log('✅ Token authentication valid:', user.name);
            return { user, source: 'token' };
        } catch (e) {
            console.error('❌ Failed to parse user data:', e);
            return null;
        }
    }

    async checkSessionAuthentication() {
        if (!window.sessionBridge || typeof window.sessionBridge.getCurrentUser !== 'function') {
            return null;
        }
        
        try {
            const user = await window.sessionBridge.getCurrentUser();
            if (user && user.id) {
                console.log('✅ Session bridge authentication valid:', user.name);
                return { user, source: 'session' };
            }
        } catch (error) {
            console.log('⚠️ Session bridge check failed:', error);
        }
        
        return null;
    }

    async checkBridgeAuthentication() {
        // Check if any auth component reports authenticated state
        const checks = [];
        
        if (window.topNavAuth && typeof window.topNavAuth.getCurrentUser === 'function') {
            checks.push(this.safeAsyncCall(() => window.topNavAuth.getCurrentUser()));
        }
        
        if (window.leftSidebarController && typeof window.leftSidebarController.getCurrentUser === 'function') {
            checks.push(this.safeAsyncCall(() => window.leftSidebarController.getCurrentUser()));
        }
        
        const results = await Promise.allSettled(checks);
        const validResults = results
            .filter(result => result.status === 'fulfilled' && result.value && result.value.id)
            .map(result => result.value);
        
        if (validResults.length > 0) {
            const user = validResults[0];
            console.log('✅ Bridge authentication valid:', user.name);
            return { user, source: 'bridge' };
        }
        
        return null;
    }

    checkUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.get('login') === 'success' || urlParams.get('status') === 'success') {
            console.log('🔗 Login success detected in URL parameters');
            
            // Extract user data from URL if available
            const userData = {
                id: urlParams.get('user_id'),
                name: urlParams.get('user_name'),
                email: urlParams.get('user_email')
            };
            
            if (userData.id) {
                this.handleAuthenticationChange(userData, true);
            } else {
                // Trigger a delayed check to get user data
                setTimeout(() => this.comprehensiveAuthCheck(), 1000);
            }
        }
    }

    checkFreshLoginFlag() {
        const freshLogin = sessionStorage.getItem('g2own_fresh_login');
        if (freshLogin === 'true') {
            console.log('🆕 Fresh login flag detected');
            
            // Clear the flag
            sessionStorage.removeItem('g2own_fresh_login');
            
            // Trigger immediate auth check
            setTimeout(() => this.comprehensiveAuthCheck(), 500);
        }
    }

    async comprehensiveAuthCheck() {
        console.log('🔬 Performing comprehensive authentication check...');
        
        // Force all auth systems to update
        const updatePromises = [];
        
        if (window.sessionBridge) {
            updatePromises.push(this.safeAsyncCall(() => window.sessionBridge.checkSession()));
        }
        
        if (window.topNavAuth) {
            updatePromises.push(this.safeAsyncCall(() => window.topNavAuth.checkAuthStatus()));
        }
        
        if (window.leftSidebarController) {
            updatePromises.push(this.safeAsyncCall(() => window.leftSidebarController.checkAuthState()));
        }
        
        // Wait for all updates to complete
        await Promise.allSettled(updatePromises);
        
        // Final state check
        setTimeout(() => this.checkAuthenticationState(), 500);
    }

    async handleAuthenticationChange(user, isAuthenticated) {
        if (this.state.updatesPending) {
            console.log('⏳ Updates already pending, skipping...');
            return;
        }
        
        this.state.updatesPending = true;
        
        try {
            const hasChanged = this.hasAuthStateChanged(user, isAuthenticated);
            
            if (hasChanged) {
                console.log('🔄 Authentication state changed:', {
                    from: { user: this.state.currentUser?.name, auth: this.state.isAuthenticated },
                    to: { user: user?.name, auth: isAuthenticated }
                });
                
                // Update internal state
                this.state.currentUser = user;
                this.state.isAuthenticated = isAuthenticated;
                
                // Force UI updates
                await this.forceUIUpdates(user, isAuthenticated);
                
                // Emit state change event
                this.emitStateChangeEvent(user, isAuthenticated);
                
                // Show notification for login
                if (isAuthenticated && user) {
                    this.showLoginNotification(user);
                }
            }
        } finally {
            // Reset update flag after a delay
            setTimeout(() => {
                this.state.updatesPending = false;
            }, this.config.debounceDelay);
        }
    }

    hasAuthStateChanged(user, isAuthenticated) {
        const currentUserId = this.state.currentUser?.id;
        const newUserId = user?.id;
        
        return (
            this.state.isAuthenticated !== isAuthenticated ||
            currentUserId !== newUserId
        );
    }

    async forceUIUpdates(user, isAuthenticated) {
        console.log('🎨 Forcing UI updates across all components...');
        
        const updatePromises = [];
        
        // Update top navigation
        if (window.topNavAuth) {
            if (isAuthenticated && user) {
                updatePromises.push(this.safeAsyncCall(() => window.topNavAuth.showUserProfile(user)));
            } else {
                updatePromises.push(this.safeAsyncCall(() => window.topNavAuth.showLoginButton()));
            }
        }
        
        // Update left sidebar
        if (window.leftSidebarController) {
            if (isAuthenticated && user) {
                updatePromises.push(this.safeAsyncCall(() => window.leftSidebarController.showUserProfile(user)));
            } else {
                updatePromises.push(this.safeAsyncCall(() => window.leftSidebarController.showLoginPrompt()));
            }
        }
        
        // Update main app
        if (window.g2ownEnhanced && window.g2ownEnhanced.updateUserState) {
            updatePromises.push(this.safeAsyncCall(() => window.g2ownEnhanced.updateUserState(user)));
        }
        
        // Wait for all updates
        await Promise.allSettled(updatePromises);
        
        console.log('✅ UI updates completed');
    }

    emitStateChangeEvent(user, isAuthenticated) {
        const eventName = isAuthenticated ? 'g2own:auth-login' : 'g2own:auth-logout';
        
        window.dispatchEvent(new CustomEvent(eventName, {
            detail: {
                user: user,
                isAuthenticated: isAuthenticated,
                timestamp: Date.now(),
                source: 'enhanced-detector'
            }
        }));
        
        // Also emit generic auth update event
        window.dispatchEvent(new CustomEvent('g2own:auth-update', {
            detail: {
                user: user,
                isAuthenticated: isAuthenticated,
                timestamp: Date.now()
            }
        }));
    }

    showLoginNotification(user) {
        const message = `Welcome back, ${user.name || 'User'}!`;
        
        // Try multiple notification systems
        if (window.g2ownEnhanced?.showNotification) {
            window.g2ownEnhanced.showNotification(message, 'success');
        } else if (window.leftSidebarController?.showNotification) {
            window.leftSidebarController.showNotification(message, 'success');
        } else if (window.topNavAuth?.showNotification) {
            window.topNavAuth.showNotification(message, 'success');
        }
    }

    clearAuthData() {
        localStorage.removeItem('g2own_oauth_token');
        localStorage.removeItem('g2own_user_data');
        localStorage.removeItem('g2own_token_expiry');
        localStorage.removeItem('g2own_api_keys');
        sessionStorage.removeItem('g2own_fresh_login');
    }

    // Utility methods
    debouncedStateCheck = this.debounce(() => {
        this.checkAuthenticationState();
    }, this.config.debounceDelay);

    debounce(func, wait) {
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

    async safeAsyncCall(asyncFunction) {
        try {
            return await asyncFunction();
        } catch (error) {
            console.warn('Safe async call failed:', error);
            return null;
        }
    }

    // Public API
    getCurrentUser() {
        return this.state.currentUser;
    }

    isAuthenticated() {
        return this.state.isAuthenticated;
    }

    forceStateCheck() {
        this.checkAuthenticationState();
    }
}

// Initialize the enhanced login state detector
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔍 Initializing Enhanced Login State Detector...');
    window.enhancedLoginStateDetector = new EnhancedLoginStateDetector();
});

// Also initialize if DOM is already loaded
if (document.readyState !== 'loading') {
    console.log('🔍 DOM already loaded, initializing Enhanced Login State Detector...');
    window.enhancedLoginStateDetector = new EnhancedLoginStateDetector();
}
