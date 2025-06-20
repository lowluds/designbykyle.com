/*!
 * G2Own Login Redirect Handler
 * Handles redirects back from community login and detects successful authentication
 */

class LoginRedirectHandler {
    constructor() {
        this.init();
    }    init() {
        console.log('🔄 Initializing Login Redirect Handler...');
        
        // SAFETY CHECK: Only process if we're returning from actual login
        const urlParams = new URLSearchParams(window.location.search);
        const hasLoginSuccess = urlParams.get('login') === 'success';
        const hasValidTokenParams = urlParams.has('token') || urlParams.has('code');
        
        // Only handle login success if we have actual success parameters
        if (hasLoginSuccess && hasValidTokenParams) {
            console.log('✅ Valid login success detected with token parameters');
            this.handleLoginSuccess();
        } else if (hasLoginSuccess) {
            console.log('⚠️ Login success parameter found but no token data - verifying session');
            this.verifySessionAfterLogin();
        }

        // Check for authentication state change from referrer with validation
        // Only if we're not in the middle of a login flow
        if (!this.isLoginFlowActive()) {
            this.detectLoginState();
        }
        
        // Set up periodic auth checks for fresh logins
        this.setupAuthDetection();
    }
    
    async verifySessionAfterLogin() {
        console.log('🔍 Verifying session after login redirect...');
        
        // Check with session bridge if we actually have an active session
        if (window.sessionBridge && typeof window.sessionBridge.checkSession === 'function') {
            try {
                await window.sessionBridge.checkSession();
                
                if (window.sessionBridge.isAuthenticated && window.sessionBridge.currentUser) {
                    console.log('✅ Valid session found after login redirect');
                    this.handleLoginSuccess();
                } else {
                    console.warn('⚠️ No valid session found after login redirect');
                    
                    // Clean up URL to remove login parameter securely
                    this.cleanupUrl();
                }
            } catch (error) {
                console.error('❌ Error verifying session after login:', error);
                this.cleanupUrl();
            }
        } else {
            // No session bridge, fallback to simple cleanup
            console.warn('⚠️ No session bridge available for verification');
            this.cleanupUrl();
        }
    }

    isLoginFlowActive() {
        // Check if we're in the middle of a login flow
        const urlParams = new URLSearchParams(window.location.search);
        const isReturningFromLogin = document.referrer.includes('g2own.com/community/login');
        const hasLoginParams = urlParams.has('login') || urlParams.has('code') || urlParams.has('token');
        
        return isReturningFromLogin || hasLoginParams;
    }    handleLoginSuccess() {
        console.log('🎉 Login success detected via URL parameter!');
        
        // Clear login initiation flags to prevent loops
        sessionStorage.removeItem('g2own_login_initiated');
        sessionStorage.removeItem('last_login_redirect');
        
        // Rate limiting check for login processing
        if (window.securityUtils && !window.securityUtils.checkRateLimit('loginSuccess', 3, 60000)) {
            console.warn('🚨 Login success processing rate limited');
            return;
        }
        
        // Clean up URL to remove login parameter securely
        try {
            const url = new URL(window.location);
            url.searchParams.delete('login');
            
            // Validate the cleaned URL
            const cleanedUrl = url.pathname + url.search;
            if (window.securityUtils && !window.securityUtils.isValidReturnUrl(window.location.origin + cleanedUrl)) {
                console.warn('🚨 Invalid URL after cleanup, using safe fallback');
                window.history.replaceState({}, document.title, '/');
            } else {
                window.history.replaceState({}, document.title, cleanedUrl);
            }
        } catch (error) {
            console.error('🚨 URL cleanup failed:', error);
            window.history.replaceState({}, document.title, '/');
        }

        // Show success notification
        this.showLoginSuccessNotification();

        // Force auth state check with delay for session sync
        setTimeout(() => {
            this.forceAuthStateCheck();
        }, 500);
    }

    detectLoginState() {
        // Check if user was redirected from community with security validation
        const referrer = document.referrer;
        if (referrer) {
            // Validate referrer URL
            const isValidReferrer = window.securityUtils 
                ? window.securityUtils.isValidReturnUrl(referrer)
                : referrer.includes('g2own.com/community/');
                  if (isValidReferrer && referrer.includes('g2own.com/community/')) {
                console.log('🔄 Returned from community, checking auth state...');
                
                // Delay to allow session sync
                setTimeout(() => {
                    this.forceAuthStateCheck();
                }, 1000);
            }
        }
    }

    setupAuthDetection() {
        // Check for fresh login every 2 seconds for the first 10 seconds
        let checks = 0;
        const maxChecks = 5;
        
        const checkInterval = setInterval(() => {
            checks++;
            this.checkForFreshLogin();
            
            if (checks >= maxChecks) {
                clearInterval(checkInterval);
            }
        }, 2000);
    }

    async checkForFreshLogin() {
        // Check if session bridge indicates a fresh login
        if (window.sessionBridge && typeof window.sessionBridge.getCurrentUser === 'function') {
            try {
                const user = await window.sessionBridge.getCurrentUser();
                if (user && user.id && !this.hasShownWelcome) {
                    console.log('✅ Fresh login detected via session bridge:', user.name);
                    this.hasShownWelcome = true;
                    this.showLoginSuccessNotification(user);
                }
            } catch (error) {
                console.log('⚠️ Session bridge check failed:', error);
            }
        }
    }

    forceAuthStateCheck() {
        console.log('🔍 Forcing auth state check across all components...');
        
        // Force top nav auth check
        if (window.topNavAuth && typeof window.topNavAuth.checkAuthStatus === 'function') {
            window.topNavAuth.checkAuthStatus();
        }
        
        // Force left sidebar auth check
        if (window.leftSidebarController && typeof window.leftSidebarController.checkAuthState === 'function') {
            window.leftSidebarController.checkAuthState();
        }
        
        // Force session bridge check
        if (window.sessionBridge && typeof window.sessionBridge.checkSession === 'function') {
            window.sessionBridge.checkSession();
        }
        
        // Force enhanced main auth check
        if (window.g2ownEnhanced && typeof window.g2ownEnhanced.checkAuthState === 'function') {
            window.g2ownEnhanced.checkAuthState();
        }
    }

    showLoginSuccessNotification(user = null) {
        const userName = user ? (user.name || user.display_name || 'User') : 'User';
        
        console.log('🎉 Showing login success notification for:', userName);
        
        // Create success notification
        const notification = {
            type: 'success',
            title: `Welcome back, ${userName}!`,
            message: 'You have successfully logged in to G2Own.',
            duration: 4000
        };

        // Try multiple notification systems
        this.showNotificationMultiple(notification);
        
        // Also emit custom event
        window.dispatchEvent(new CustomEvent('g2own:login-success', {
            detail: { user: user, timestamp: Date.now() }
        }));
    }

    showNotificationMultiple(notification) {
        // Try enhanced main notification system
        if (window.g2ownEnhanced && typeof window.g2ownEnhanced.showNotification === 'function') {
            window.g2ownEnhanced.showNotification(notification.message, notification.type);
            return;
        }
        
        // Try left sidebar notification system
        if (window.leftSidebarController && typeof window.leftSidebarController.showNotification === 'function') {
            window.leftSidebarController.showNotification(notification.message, notification.type);
            return;
        }
        
        // Try top nav notification system
        if (window.topNavAuth && typeof window.topNavAuth.showNotification === 'function') {
            window.topNavAuth.showNotification(notification.message, notification.type);
            return;
        }
        
        // Fallback: Create simple toast notification
        this.createSimpleToast(notification);
    }

    createSimpleToast(notification) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `login-toast login-toast-${notification.type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">
                    ${notification.type === 'success' ? '✅' : '🔔'}
                </div>
                <div class="toast-text">
                    <div class="toast-title">${notification.title}</div>
                    <div class="toast-message">${notification.message}</div>
                </div>
                <button class="toast-close" onclick="this.parentElement.remove()">×</button>
            </div>
        `;
        
        // Add styles
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: rgba(16, 185, 129, 0.95);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 350px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        // Add to page
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto-remove
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 300);
        }, notification.duration || 4000);
    }

    // Function to clean up URL parameters securely
    cleanupUrl() {
        try {
            const url = new URL(window.location);
            url.searchParams.delete('login');
            
            // Validate the cleaned URL
            const cleanedUrl = url.pathname + url.search;
            if (window.securityUtils && !window.securityUtils.isValidReturnUrl(window.location.origin + cleanedUrl)) {
                console.warn('🚨 Invalid URL after cleanup, using safe fallback');
                window.history.replaceState({}, document.title, '/');
            } else {
                window.history.replaceState({}, document.title, cleanedUrl);
            }
        } catch (error) {
            console.error('🚨 URL cleanup failed:', error);
            window.history.replaceState({}, document.title, '/');
        }
    }

    // Listen for fresh login events
    setupLoginEventListeners() {
        window.addEventListener('g2own:auth-update', (event) => {
            if (event.detail && event.detail.user && !this.hasShownWelcome) {
                console.log('🔄 Auth update event received, checking for fresh login...');
                this.hasShownWelcome = true;
                this.showLoginSuccessNotification(event.detail.user);
            }
        });

        window.addEventListener('g2own:fresh-login', (event) => {
            console.log('🎉 Fresh login event received!');
            if (event.detail && event.detail.user) {
                this.showLoginSuccessNotification(event.detail.user);
            }
        });
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.loginRedirectHandler = new LoginRedirectHandler();
    
    // Set up event listeners after a short delay
    setTimeout(() => {
        if (window.loginRedirectHandler) {
            window.loginRedirectHandler.setupLoginEventListeners();
        }
    }, 1000);
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM is still loading
} else {
    // DOM already loaded
    window.loginRedirectHandler = new LoginRedirectHandler();
    setTimeout(() => {
        if (window.loginRedirectHandler) {
            window.loginRedirectHandler.setupLoginEventListeners();
        }
    }, 1000);
}
