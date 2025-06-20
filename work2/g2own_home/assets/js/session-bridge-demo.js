/*!
 * G2Own Session Bridge - DEMO VERSION
 * Portfolio demonstration - no real session management
 */

class SessionBridge {
    
    constructor() {
        this.baseURL = '#'; // Disabled for portfolio demo
        this.currentUser = null;
        this.isAuthenticated = false;
        this.lastUserId = null; // Track previous user for fresh login detection
        
        console.log('Session Bridge initialized (DEMO MODE)');
    }
    
    async checkSession() {
        console.log('Demo: Session check disabled for portfolio');
        return false;
    }
    
    async getCurrentUser() {
        if (!this.currentUser) {
            await this.checkSession();
        }
        return this.currentUser;
    }
    
    async redirectToLogin() {
        console.log('🔑 Demo mode - no real login redirects');
        // Demo mode - no real redirects
    }

    redirectToRegister() {
        console.log('📍 Demo mode - no real register redirects');
        // Demo mode - no real redirects
    }

    redirectToCommunity() {
        console.log('📍 Demo mode - no real community redirects');
        // Demo mode - no real redirects
    }
    
    redirectToProfile() {
        console.log('📍 Demo mode - no real profile redirects');
        // Demo mode - no real redirects
    }
    
    updateMainSiteAuth(userData) {
        console.log('Demo: Auth update disabled for portfolio');
        // Demo mode - no real auth updates
    }
    
    updateMainSiteLogout() {
        console.log('Demo: Logout disabled for portfolio');
        // Demo mode - no real logout
    }
    
    async globalLogout() {
        console.log('Demo: Global logout disabled for portfolio');
        // Demo mode - no real logout
    }
    
    forceUpdate() {
        console.log('Demo: Force update disabled for portfolio');
        // Demo mode - no real updates
    }
    
    async checkLoginStateBeforeRedirect() {
        console.log('Demo: Login state check disabled for portfolio');
        return false;
    }
    
    setCurrentUser(userData) {
        console.log('Demo: Set user disabled for portfolio');
        // Demo mode - no real user setting
    }
    
    clearCurrentUser() {
        console.log('Demo: Clear user disabled for portfolio');
        // Demo mode - no real user clearing
    }
    
    setupPeriodicSync() {
        console.log('Demo: Periodic sync disabled for portfolio');
        // Demo mode - no real syncing
    }
}

// Initialize the demo session bridge
if (typeof window !== 'undefined') {
    window.sessionBridge = new SessionBridge();
}
