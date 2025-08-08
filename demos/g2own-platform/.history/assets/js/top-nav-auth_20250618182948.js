/**
 * Top Navigation Dynamic Authentication System
 * Handles login/signup button and profile dropdown functionality
 */

class TopNavAuth {
    constructor() {
        this.isLoggedIn = false; // This would come from your auth system
        this.userData = null;
        
        // Backend integration
        this.api = null;
        this.sessionBridge = null;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.initializeBackendIntegration();
        this.updateAuthState();
        
        // Check authentication status on page load
        this.checkAuthStatus();
        
        console.log('✅ Top Nav Auth system initialized');
    }    async initializeBackendIntegration() {
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
                }
            }, 1000);
        }

        // Wait for API to be available
        if (window.g2ownAPI) {
            this.api = window.g2ownAPI;
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

        // Check auth status periodically
        setInterval(() => {
            this.checkAuthStatus();
        }, 30000); // Check every 30 seconds
    }bindEvents() {
        // Login/Signup button click - handle both possible IDs
        const loginSignupBtn = document.getElementById('loginSignupBtn') || document.getElementById('oauth-login-btn');
        if (loginSignupBtn) {
            loginSignupBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLoginSignupClick();
            });
        }        // Left sidebar login button
        const leftSidebarLoginBtn = document.getElementById('btn-auth-combined');
        if (leftSidebarLoginBtn) {
            leftSidebarLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔑 Left sidebar login button clicked');
                
                // Add visual feedback
                leftSidebarLoginBtn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    leftSidebarLoginBtn.style.transform = '';
                }, 150);
                
                this.handleLoginSignupClick();
            });
        }

        // Also handle social auth buttons in sidebar
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
            console.log('🔍 Checking authentication status...');
            
            // Rate limiting check
            if (window.securityUtils && !window.securityUtils.checkRateLimit('authCheck', 15, 60000)) {
                console.warn('🚨 Auth check rate limited');
                return;
            }
            
            // First try session bridge
            if (this.sessionBridge && typeof this.sessionBridge.getCurrentUser === 'function') {
                const user = await this.sessionBridge.getCurrentUser();
                if (user && user.id) {
                    console.log('✅ User authenticated via session bridge:', user.name);
                    this.updateAuthState(user);
                    return;
                }
            }

            // Fallback: Direct API check with enhanced security
            const requestOptions = window.securityUtils 
                ? window.securityUtils.secureRequest('https://g2own.com/community/session-check.php')
                : {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                };

            const response = await fetch('https://g2own.com/community/session-check.php', requestOptions);

            if (response.ok) {
                const data = await response.json();
                console.log('📡 API response:', data);
                
                if (data.success && data.user && data.user.id) {
                    console.log('✅ User authenticated via API:', data.user.name);
                    this.updateAuthState(data.user);
                } else {
                    console.log('❌ User not authenticated');
                    this.updateAuthState(null);
                }
            } else {
                console.log('⚠️ Auth check failed:', response.status);
                this.updateAuthState(null);
            }
        } catch (error) {
            console.error('❌ Auth check error:', error);
            this.updateAuthState(null);
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
            localStorage.setItem('userInfo', JSON.stringify(user));
            localStorage.setItem('authCheck', Date.now().toString());
            
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
            localStorage.removeItem('userInfo');
            localStorage.removeItem('authCheck');
            
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
        // Check if we're already authenticated before redirecting
        console.log('🔑 Login/Signup button clicked - checking session first');
        
        // SAFETY CHECK: Prevent redirect loops
        if (this.isRedirectInProgress()) {
            console.warn('⚠️ Redirect already in progress, ignoring click');
            return;
        }
        
        // Use session bridge to check login state before redirecting
        if (this.sessionBridge && typeof this.sessionBridge.checkLoginStateBeforeRedirect === 'function') {
            try {
                const isAlreadyAuthenticated = await this.sessionBridge.checkLoginStateBeforeRedirect();
                if (isAlreadyAuthenticated) {
                    console.log('✅ User already authenticated, no redirect needed');
                    
                    // Update UI instead of redirecting
                    if (this.sessionBridge.currentUser) {
                        this.updateAuthState(this.sessionBridge.currentUser);
                    }
                    
                    // Show success notification
                    this.showNotification('You are already logged in!', 'success');
                    
                    return; // Skip the redirect
                }
            } catch (error) {
                console.error('❌ Error checking auth before redirect:', error);
                // Continue with redirect as fallback
            }
        }
        
        // Mark that we're starting a login flow
        sessionStorage.setItem('g2own_login_initiated', Date.now().toString());
        
        const returnUrl = encodeURIComponent(window.location.href);
        
        if (this.sessionBridge && typeof this.sessionBridge.redirectToLogin === 'function') {
            this.sessionBridge.redirectToLogin();
        } else {
            // Fallback redirect with return parameter
            console.log('📍 Redirecting to:', `https://g2own.com/community/login/?return=${returnUrl}`);
            window.location.href = `https://g2own.com/community/login/?return=${returnUrl}`;
        }
    }
    
    isRedirectInProgress() {
        const loginInitiated = sessionStorage.getItem('g2own_login_initiated');
        if (!loginInitiated) return false;
        
        // Consider redirect in progress if initiated within last 10 seconds
        const timeSince = Date.now() - parseInt(loginInitiated);
        return timeSince < 10000;
    }
      showAuthModal() {
        // Legacy method - now redirects to community
        this.handleLoginSignupClick();
    }
    
    showLoginForm() {
        // Legacy method - now redirects to community
        this.handleLoginSignupClick();
    }
    
    showSignupForm() {
        // Demo signup - replace with your actual signup system
        console.log('📝 Showing signup form');
        alert('Sign up form would open here - integrate with your auth system');
    }
    
    login(userData, token) {
        this.userData = userData;
        this.isLoggedIn = true;
        
        // Store in localStorage (replace with your auth system)
        localStorage.setItem('authToken', token);
        localStorage.setItem('userInfo', JSON.stringify(userData));
        
        this.updateAuthState();
        
        // Emit auth state change event
        window.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { isLoggedIn: true, userData: userData }
        }));
        
        // Show success message
        this.showNotification('Login successful!', 'success');
        console.log('✅ User logged in:', userData.name);
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
