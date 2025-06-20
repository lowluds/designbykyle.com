/**
 * Top Navigation Dynamic Authentication System
 * Handles login/signup button and profile dropdown functionality
 */

class TopNavAuth {
    constructor() {
        this.isLoggedIn = false;
        this.userData = null;
        this.sessionBridge = null;
        this.initialized = false;
        
        // Selector configuration
        this.selectors = {
            loginButton: '#oauth-login-btn, #loginSignupBtn, .login-signup-btn',
            profileContainer: '#profileContainer, .profile-container',
            avatar: '.profile-avatar, .avatar',
            username: '.profile-name, .username',
            logoutButton: '#oauth-logout-btn, .logout-button, .logout-link'
        };
        
        // Storage - use safeStorage if available
        this.storage = window.safeStorage || localStorage;
        
        // Initialize with a small delay to ensure session bridge is loaded
        setTimeout(() => this.init(), 100);
    }
    
    init() {
        console.log('✅ Initializing Top Nav Auth system');
        
        this.bindEvents();
        this.initializeBackendIntegration();
        
        // Check if we have cached user data
        this.checkCachedAuth();
        
        // Check authentication status on page load
        this.checkAuthStatus();
        
        // Set initialization flag
        this.initialized = true;
        
        console.log('✅ Top Nav Auth system fully initialized');
    }
    
    async checkCachedAuth() {
        try {
            const userData = this.storage.getItem('g2own_user') || this.storage.getItem('oauth_user');
            if (userData && userData !== 'null' && userData !== '{}') {
                const user = JSON.parse(userData);
                if (user && user.id) {
                    console.log('📦 Found cached user data:', user.name);
                    this.updateAuthState(user);
                }
            }
        } catch (e) {
            console.warn('⚠️ Error checking cached auth:', e);
        }
    }
    
    async initializeBackendIntegration() {
        console.log('🔗 Initializing backend integration...');
        
        // Wait for session bridge to be available
        if (window.sessionBridge) {
            this.sessionBridge = window.sessionBridge;
            console.log('✅ Session bridge found');
        } else {
            console.log('⚠️ Session bridge not found, retrying...');
            // Retry after a short delay
            setTimeout(() => {
                if (window.sessionBridge) {
                    this.sessionBridge = window.sessionBridge;
                    console.log('✅ Session bridge found on retry');
                    this.checkAuthStatus();
                } else {
                    console.warn('❌ Session bridge still not found after retry');
                }
            }, 1000);
        }

        // Check authentication status immediately
        await this.checkAuthStatus();

        // Listen for auth events from session bridge
        window.addEventListener('g2own:auth-update', (event) => {
            console.log('🔄 Auth update received:', event.detail);
            this.handleAuthStateChange(event.detail);
        });

        window.addEventListener('g2own:auth-logout', () => {
            console.log('👋 Auth logout received');
            this.updateAuthState(null);
        });
        
        // Also listen for the auth:updated event
        window.addEventListener('auth:updated', (event) => {
            console.log('🔄 Auth:updated event received:', event.detail);
            if (event.detail.isLoggedIn && event.detail.userData) {
                this.updateAuthState(event.detail.userData);
            } else {
                this.updateAuthState(null);
            }
        });

        // Check auth status periodically
        setInterval(() => {
            this.checkAuthStatus();
        }, 60000); // Check every 60 seconds
    }bindEvents() {
        // Find elements using our selectors
        const allLoginButtons = document.querySelectorAll(this.selectors.loginButton);
        const allLogoutButtons = document.querySelectorAll(this.selectors.logoutButton);
        
        console.log(`🔍 Found ${allLoginButtons.length} login buttons and ${allLogoutButtons.length} logout buttons`);
        
        // Login buttons
        allLoginButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLoginSignupClick();
                
                // Visual feedback
                button.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    button.style.transform = '';
                }, 150);
            });
        });
        
        // Logout buttons
        allLogoutButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
                
                // Visual feedback
                button.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    button.style.transform = '';
                }, 150);
            });
        });
        
        // Also handle social auth buttons if present
        const socialButtons = document.querySelectorAll('.social-btn[data-provider]');
        socialButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const provider = btn.dataset.provider;
                console.log(`🔑 Social login clicked: ${provider}`);
                
                // Add visual feedback
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    btn.style.transform = '';
                }, 150);
                
                this.handleSocialLogin(provider);
            });
        });
        
        // Profile button click for dropdown
        const profileBtn = document.getElementById('profileBtn');
        if (profileBtn) {
            profileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleProfileDropdown();
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const profileContainer = document.getElementById('profileContainer');
            if (profileContainer && !profileContainer.contains(e.target)) {
                this.closeProfileDropdown();
            }
        });
        
        // Profile dropdown item clicks
        this.bindDropdownEvents();
        
        // Listen for auth state changes
        window.addEventListener('authStateChanged', (e) => {
            this.handleAuthStateChange(e.detail);
        });
        
        console.log('🎯 Top nav auth event listeners bound');
    }
    
    bindDropdownEvents() {
        // Profile settings
        const profileSettingsBtn = document.querySelector('[data-action="profile-settings"]');
        if (profileSettingsBtn) {
            profileSettingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleProfileSettings();
            });
        }
        
        // Account security
        const accountSecurityBtn = document.querySelector('[data-action="account-security"]');
        if (accountSecurityBtn) {
            accountSecurityBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleAccountSecurity();
            });
        }
        
        // Achievements
        const achievementsBtn = document.querySelector('[data-action="achievements"]');
        if (achievementsBtn) {
            achievementsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleAchievements();
            });
        }
        
        // Purchase history
        const purchaseHistoryBtn = document.querySelector('[data-action="purchase-history"]');
        if (purchaseHistoryBtn) {
            purchaseHistoryBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handlePurchaseHistory();
            });
        }
        
        // Logout
        const logoutBtn = document.querySelector('[data-action="logout"]');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
    }    async checkAuthStatus() {
        try {
            console.log('🔍 Checking auth status...');
            
            // Use session bridge if available
            if (this.sessionBridge) {
                const user = await this.sessionBridge.getCurrentUser();
                if (user) {
                    console.log('✅ Got user from session bridge:', user.name);
                    this.updateAuthState(user);
                    
                    // Make sure this data is in storage
                    this.storage.setItem('g2own_user', JSON.stringify(user));
                    return;
                }
            }
            
            // If sessionBridge failed or didn't return a user, check storage
            const userData = this.storage.getItem('g2own_user') || this.storage.getItem('oauth_user');
            if (userData && userData !== 'null' && userData !== '{}') {
                try {
                    const user = JSON.parse(userData);
                    if (user && user.id) {
                        console.log('✅ Got user from storage:', user.name);
                        this.updateAuthState(user);
                        return;
                    }
                } catch (e) {
                    console.warn('⚠️ Error parsing stored user data:', e);
                }
            }
            
            // If we got here, we're not logged in
            console.log('❌ No auth data found, treating as logged out');
            this.updateAuthState(null);
            
        } catch (e) {
            console.error('❌ Error checking auth status:', e);
        }
    }    updateAuthState(user = null) {
        console.log('🔄 Updating auth state:', user ? user.name : 'not logged in');
        
        const authContainer = document.getElementById('authButtonContainer');
        const profileContainer = document.getElementById('profileContainer');
        
        if (user && user.id) {
            this.userData = user;
            this.isLoggedIn = true;
            
            // Hide auth button, show profile
            if (authContainer) authContainer.style.display = 'none';
            if (profileContainer) profileContainer.style.display = 'flex';
            
            this.updateProfileInfo();
            
            // Store user data
            this.storage.setItem('userInfo', JSON.stringify(user));
            this.storage.setItem('authCheck', Date.now().toString());
            
            // Emit event for other components
            window.dispatchEvent(new CustomEvent('authStateChanged', {
                detail: { isLoggedIn: true, userData: user }
            }));
            
            console.log('👤 Showing profile UI for:', user.name || 'User');
        } else {
            this.userData = null;
            this.isLoggedIn = false;
            
            // Show auth button, hide profile
            if (authContainer) authContainer.style.display = 'flex';
            if (profileContainer) profileContainer.style.display = 'none';
            
            // Clear stored data
            this.storage.removeItem('userInfo');
            this.storage.removeItem('authCheck');
            
            // Emit event for other components
            window.dispatchEvent(new CustomEvent('authStateChanged', {
                detail: { isLoggedIn: false, userData: null }
            }));
            
            console.log('🔐 Showing login/signup UI');
        }
    }    updateProfileInfo() {
        if (!this.userData) return;
        
        console.log('📝 Updating profile info for:', this.userData.name);
        
        // Update profile name in button - use security utils for sanitization
        const profileName = document.getElementById('profileName');
        if (profileName) {
            const displayName = this.userData.name || this.userData.display_name || 'User';
            const sanitizedName = window.securityUtils 
                ? window.securityUtils.sanitizeHtml(displayName)
                : displayName;
            profileName.textContent = sanitizedName;
        }
        
        // Update dropdown header
        const dropdownName = document.getElementById('dropdownName');
        const dropdownEmail = document.getElementById('dropdownEmail');
        
        if (dropdownName) {
            const displayName = this.userData.name || this.userData.display_name || 'User';
            const sanitizedName = window.securityUtils 
                ? window.securityUtils.sanitizeHtml(displayName)
                : displayName;
            dropdownName.textContent = sanitizedName;
        }
        
        if (dropdownEmail) {
            const email = this.userData.email || '';
            const sanitizedEmail = window.securityUtils 
                ? window.securityUtils.sanitizeHtml(email)
                : email;
            dropdownEmail.textContent = sanitizedEmail;
        }
        
        // Update avatar images if available
        const avatarUrl = this.userData.avatar || this.userData.photo || 'assets/images/default-avatar.svg';        const avatars = document.querySelectorAll('.profile-avatar, .dropdown-avatar');
        avatars.forEach(avatar => {
            avatar.src = avatarUrl;
            avatar.onerror = function() {
                this.src = 'assets/images/default-avatar.svg';
            };
        });
        
        console.log('✅ Profile info updated');
    }    async handleLoginSignupClick() {
        console.log('🔑 Login/Signup button clicked');
        
        // Use sessionBridge if available
        if (this.sessionBridge && typeof this.sessionBridge.redirectToLogin === 'function') {
            console.log('🔄 Redirecting to login via sessionBridge');
            this.sessionBridge.redirectToLogin();
        } else {
            console.log('🔄 No sessionBridge, redirecting directly');
            // Direct fallback
            window.location.href = '/community/login/?return=' + encodeURIComponent(window.location.href);
        }
    }
    
    handleSocialLogin(provider) {
        console.log(`🔑 Handling social login for ${provider}`);
        
        // Base URL for social login
        const baseUrl = '/community/login/';
        
        // Check if we have a more specific handler
        if (window.oauthManager && typeof window.oauthManager.startSocialLogin === 'function') {
            console.log(`🔄 Using oauthManager for ${provider} login`);
            window.oauthManager.startSocialLogin(provider);
            return;
        }
        
        // Fallback - redirect to provider login page
        window.location.href = `${baseUrl}${provider}/?return=${encodeURIComponent(window.location.href)}`;
    }
    
    async logout() {
        try {
            // Use session bridge for logout if available
            if (this.sessionBridge) {
                await this.sessionBridge.globalLogout();
            } else if (this.api) {
                await this.api.logout();
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
        
        // Force local state update
        this.userData = null;
        this.isLoggedIn = false;
        
        // Clear any legacy storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
        
        this.updateAuthState();
        this.closeProfileDropdown();
        
        // Emit auth state change event
        window.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { isLoggedIn: false, userData: null }
        }));
        
        // Show logout message
        this.showNotification('Logged out successfully!', 'info');
        console.log('🚪 User logged out');
    }
    
    toggleProfileDropdown() {
        const profileContainer = document.getElementById('profileContainer');
        if (profileContainer) {
            profileContainer.classList.toggle('active');
            console.log('📋 Profile dropdown toggled');
        }
    }
    
    closeProfileDropdown() {
        const profileContainer = document.getElementById('profileContainer');
        if (profileContainer) {
            profileContainer.classList.remove('active');
        }
    }
    
    handleAuthStateChange(detail) {
        this.isLoggedIn = detail.isLoggedIn;
        this.userData = detail.userData;
        this.updateAuthState();
        console.log('🔄 Auth state changed:', detail);
    }
    
    // Profile dropdown handlers
    handleProfileSettings() {
        this.closeProfileDropdown();
        console.log('⚙️ Profile settings clicked');
        alert('Profile Settings would open here - integrate with your settings system');
    }
    
    handleAccountSecurity() {
        this.closeProfileDropdown();
        console.log('🔒 Account security clicked');
        alert('Account Security would open here - integrate with your security system');
    }
    
    handleAchievements() {
        this.closeProfileDropdown();
        console.log('🏆 Achievements clicked');
        alert('Achievements would open here - integrate with your achievements system');
    }
    
    handlePurchaseHistory() {
        this.closeProfileDropdown();
        console.log('💰 Purchase history clicked');
        alert('Purchase History would open here - integrate with your transaction system');
    }
    
    handleLogout() {
        this.closeProfileDropdown();
        
        if (confirm('Are you sure you want to logout?')) {
            this.logout();
        }
    }
    
    // Enhanced methods for integration with new auth system
    forceUpdate(userData = null) {
        console.log('🔄 Force updating top nav auth state...', userData?.name);
        
        if (userData) {
            this.showUserProfile(userData);
        } else {
            // Check current auth state
            this.checkAuthStatus();
        }
    }
    
    getCurrentUser() {
        return this.userData;
    }
    
    showNotification(message, type = 'info') {
        // Use existing notification system
        if (typeof this.showToastNotification === 'function') {
            this.showToastNotification(message, type);
        } else {
            console.log(`📢 Top Nav: ${message}`);
        }
    }
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize the top nav auth system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.topNavAuth = new TopNavAuth();
});

// Export for external use
if (typeof window !== 'undefined') {
    window.TopNavAuth = TopNavAuth;
}
