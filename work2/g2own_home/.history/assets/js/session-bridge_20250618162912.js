/*!
 * G2Own Session Bridge
 * Handles session synchronization between main site and community
 */

class SessionBridge {
    constructor() {
        this.baseURL = 'https://g2own.com/community';
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // Check auth immediately on construction
        this.checkSession();
    }

    async checkSession() {
        try {
            const response = await fetch(`${this.baseURL}/session-check.php`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.user && data.user.id) {
                    this.currentUser = data.user;
                    this.isAuthenticated = true;
                    
                    // Emit event for other components
                    window.dispatchEvent(new CustomEvent('g2own:auth-update', {
                        detail: { user: data.user }
                    }));
                } else {
                    this.currentUser = null;
                    this.isAuthenticated = false;
                }
            }
        } catch (error) {
            console.error('Session check failed:', error);
            this.currentUser = null;
            this.isAuthenticated = false;
        }
    }

    async getCurrentUser() {
        if (!this.currentUser) {
            await this.checkSession();
        }
        return this.currentUser;
    }    redirectToLogin() {
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.href = `${this.baseURL}/login/?ref=${returnUrl}`;
    }
}

    updateMainSiteAuth(userData) {
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
            // Logout from community via API
            await this.api.logout();
            
            // Update main site UI
            this.updateMainSiteLogout();
            
            // Optional: redirect to community logout for complete cleanup
            // window.location.href = `${this.communityDomain}/logout/`;
            
        } catch (error) {
            console.error('Global logout failed:', error);
            // Force local logout even if API fails
            this.api.clearAuth();
            this.updateMainSiteLogout();
        }
    }

    setupPeriodicSync() {
        // Sync session every 5 minutes
        setInterval(() => {
            this.syncSessionFromCommunity();
        }, 5 * 60 * 1000);
    }

    setupCrossDomainMessaging() {
        window.addEventListener('message', (event) => {
            // Only accept messages from our domain
            if (event.origin !== this.communityDomain && 
                event.origin !== this.mainDomain) {
                return;
            }

            switch (event.data.type) {
                case 'AUTH_UPDATE':
                    if (event.data.user) {
                        this.updateMainSiteAuth(event.data.user);
                    }
                    break;
                
                case 'AUTH_LOGOUT':
                    this.updateMainSiteLogout();
                    break;
                
                case 'SESSION_SYNC':
                    this.syncSessionFromCommunity();
                    break;
            }
        });
    }

    // Navigation helpers
    redirectToLogin(returnUrl = null) {
        const ref = returnUrl || window.location.href;
        window.location.href = `${this.communityDomain}/login/?ref=${encodeURIComponent(ref)}`;
    }

    redirectToRegister(returnUrl = null) {
        const ref = returnUrl || window.location.href;
        window.location.href = `${this.communityDomain}/register/?ref=${encodeURIComponent(ref)}`;
    }

    redirectToCommunity() {
        window.location.href = this.communityDomain;
    }

    redirectToProfile() {
        const user = this.api.getStoredUser();
        if (user && user.id) {
            window.location.href = `${this.communityDomain}/profile/${user.id}/`;
        } else {
            this.redirectToCommunity();
        }
    }
}

// Initialize session bridge globally
window.sessionBridge = new SessionBridge();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sessionBridge.init();
    });
} else {
    // DOM already loaded
    window.sessionBridge.init();
}
