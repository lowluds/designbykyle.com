/*!
 * G2Own Session Bridge
 * Handles session synchronization between main site and community
 */

class SessionBridge {    constructor() {
        this.baseURL = 'https://g2own.com/community';
        this.currentUser = null;
        this.isAuthenticated = false;
        this.lastUserId = null; // Track previous user for fresh login detection
        
        // Check auth immediately on construction
        this.checkSession();
    }    async checkSession() {
        try {
            // Rate limiting check
            if (window.securityUtils && !window.securityUtils.checkRateLimit('sessionCheck', 10, 60000)) {
                console.warn('🚨 Session check rate limited');
                return;
            }

            // Use secure request if available
            const requestOptions = window.securityUtils 
                ? window.securityUtils.secureRequest(`${this.baseURL}/session-check.php`)
                : {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                };

            const response = await fetch(`${this.baseURL}/session-check.php`, requestOptions);

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.user && data.user.id) {
                    // Check if this is a fresh login
                    const wasLoggedIn = this.isAuthenticated;
                    const previousUserId = this.lastUserId;
                    
                    this.currentUser = data.user;
                    this.isAuthenticated = true;
                    this.lastUserId = data.user.id;

                    // Detect fresh login (wasn't logged in before, or different user)
                    if (!wasLoggedIn || (previousUserId && previousUserId !== data.user.id)) {
                        console.log('🎉 Fresh login detected for:', data.user.name || data.user.display_name);
                        
                        // Emit fresh login event
                        window.dispatchEvent(new CustomEvent('g2own:fresh-login', {
                            detail: { user: data.user, timestamp: Date.now() }
                        }));
                    }
                    
                    // Emit regular auth update event
                    window.dispatchEvent(new CustomEvent('g2own:auth-update', {
                        detail: { user: data.user }
                    }));
                } else {
                    this.currentUser = null;
                    this.isAuthenticated = false;
                    this.lastUserId = null;
                }
            }
        } catch (error) {
            console.error('Session check failed:', error);
            this.currentUser = null;
            this.isAuthenticated = false;
            this.lastUserId = null;
        }
    }async getCurrentUser() {
        if (!this.currentUser) {
            await this.checkSession();
        }
        return this.currentUser;
    }    redirectToLogin() {
        console.log('🔑 Session bridge redirecting to login...');
        
        // SAFETY CHECK: Prevent redirect loops
        const lastRedirect = sessionStorage.getItem('last_login_redirect');
        const now = Date.now();
        
        if (lastRedirect && (now - parseInt(lastRedirect)) < 5000) {
            console.warn('⚠️ Login redirect attempted too recently, preventing loop');
            return;
        }
        
        // Store timestamp of this redirect
        sessionStorage.setItem('last_login_redirect', now.toString());
        
        const currentUrl = window.location.href;
        
        // Validate return URL using security utils
        if (window.securityUtils && !window.securityUtils.isValidReturnUrl(currentUrl)) {
            console.warn('🚨 Invalid return URL, using safe fallback');
            const returnUrl = encodeURIComponent('https://g2own.com/');
            console.log('📍 Redirecting to:', `${this.baseURL}/login/?return=${returnUrl}`);
            window.location.href = `${this.baseURL}/login/?return=${returnUrl}`;
            return;
        }
        
        const returnUrl = window.securityUtils 
            ? window.securityUtils.safeEncodeUrl(currentUrl)
            : encodeURIComponent(currentUrl);
            
        console.log('📍 Redirecting to:', `${this.baseURL}/login/?return=${returnUrl}`);
        window.location.href = `${this.baseURL}/login/?return=${returnUrl}`;
    }

    redirectToRegister() {
        const currentUrl = window.location.href;
        
        // Validate return URL using security utils
        if (window.securityUtils && !window.securityUtils.isValidReturnUrl(currentUrl)) {
            console.warn('🚨 Invalid return URL, using safe fallback');
            const returnUrl = encodeURIComponent('https://g2own.com/');
            window.location.href = `${this.baseURL}/register/?return=${returnUrl}`;
            return;
        }
        
        const returnUrl = window.securityUtils 
            ? window.securityUtils.safeEncodeUrl(currentUrl)
            : encodeURIComponent(currentUrl);
            
        window.location.href = `${this.baseURL}/register/?return=${returnUrl}`;
    }

    redirectToCommunity() {
        window.location.href = this.baseURL;
    }

    redirectToProfile() {
        if (this.currentUser && this.currentUser.id) {
            window.location.href = `${this.baseURL}/profile/${this.currentUser.id}/`;
        } else {
            this.redirectToCommunity();
        }
    }    updateMainSiteAuth(userData) {
        // Update navbar if available
        if (window.navbarController && typeof window.navbarController.updateUIForLoggedInUser === 'function') {
            window.navbarController.updateUIForLoggedInUser(userData);
        }
        
        // Update top nav auth if available
        if (window.topNavAuth && typeof window.topNavAuth.updateAuthState === 'function') {
            window.topNavAuth.updateAuthState(userData);
        }

        // Update enhanced main if available
        if (window.g2ownEnhanced && typeof window.g2ownEnhanced.handleAuthUpdate === 'function') {
            window.g2ownEnhanced.handleAuthUpdate(userData);
        }

        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('g2own:auth-update', { 
            detail: { user: userData } 
        }));
    }

    updateMainSiteLogout() {
        // Update navbar if available
        if (window.navbarController && typeof window.navbarController.updateUIForLoggedOutUser === 'function') {
            window.navbarController.updateUIForLoggedOutUser();
        }
        
        // Update top nav auth if available
        if (window.topNavAuth && typeof window.topNavAuth.updateAuthState === 'function') {
            window.topNavAuth.updateAuthState(null);
        }

        // Update enhanced main if available
        if (window.g2ownEnhanced && typeof window.g2ownEnhanced.handleLogout === 'function') {
            window.g2ownEnhanced.handleLogout();
        }

        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('g2own:auth-logout'));
    }

    // Handle logout across both domains
    async globalLogout() {
        try {
            // Clear local auth state
            this.currentUser = null;
            this.isAuthenticated = false;
            
            // Update main site UI
            this.updateMainSiteLogout();
            
            // Optional: redirect to community logout for complete cleanup
            // window.location.href = `${this.baseURL}/logout/`;
            
        } catch (error) {
            console.error('Global logout failed:', error);
            // Force local logout even if API fails
            this.currentUser = null;
            this.isAuthenticated = false;
            this.updateMainSiteLogout();        }
    }
    
    // Enhanced methods for integration with new auth system
    forceUpdate() {
        console.log('🔄 Force updating session bridge...');
        this.checkSession();
    }
    
    async checkLoginStateBeforeRedirect() {
        console.log('🔍 Checking login state before redirecting to login page...');
        
        // Check if we're already in a login redirect process
        const loginInitiated = sessionStorage.getItem('g2own_login_initiated');
        if (loginInitiated) {
            const timeSince = Date.now() - parseInt(loginInitiated);
            if (timeSince < 10000) {
                console.warn('⚠️ Login redirect already in progress, aborting check');
                return false;
            }
        }
        
        try {
            // Use secure request if available
            const requestOptions = window.securityUtils 
                ? window.securityUtils.secureRequest(`${this.baseURL}/session-check.php`)
                : {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                };

            console.log('🔄 Checking community session status...');
            const response = await fetch(`${this.baseURL}/session-check.php`, requestOptions);

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.user && data.user.id) {
                    // User is already authenticated on community site
                    console.log('✅ User already authenticated on community site:', data.user.name);
                    
                    // Update local auth state
                    this.currentUser = data.user;
                    this.isAuthenticated = true;
                    this.lastUserId = data.user.id;
                    
                    // Update main site UI
                    this.updateMainSiteAuth(data.user);
                    
                    // Emit fresh login event for other components
                    window.dispatchEvent(new CustomEvent('g2own:fresh-login', {
                        detail: { user: data.user, timestamp: Date.now() }
                    }));
                    
                    return true; // User is already authenticated
                }
            }
            
            // User is not authenticated on community site
            console.log('❌ User not authenticated on community site, redirect needed');
            return false;
            
        } catch (error) {
            console.error('❌ Error checking community session:', error);
            return false; // Error checking session, assume not authenticated
        }
    }
    
    setCurrentUser(userData) {
        console.log('👤 Setting current user in session bridge:', userData?.name);
        this.currentUser = userData;
        this.isAuthenticated = !!userData;
        this.updateMainSiteAuth();
    }
    
    clearCurrentUser() {
        console.log('🧹 Clearing current user from session bridge');
        this.currentUser = null;
        this.isAuthenticated = false;
        this.updateMainSiteLogout();
    }
    
    setupPeriodicSync() {
        // Sync session every 5 minutes
        setInterval(() => {
            this.checkSession();
        }, 5 * 60 * 1000);
    }
}

// Initialize session bridge globally
window.sessionBridge = new SessionBridge();

// Auto-initialize periodic sync when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sessionBridge.setupPeriodicSync();
    });
} else {
    // DOM already loaded
    window.sessionBridge.setupPeriodicSync();
}
