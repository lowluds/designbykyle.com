/**
 * Top Navigation Dynamic Authentication System
 * Handles login/signup button and profile dropdown functionality
 */

class TopNavAuth {
    constructor() {
        this.isLoggedIn = false; // This would come from your auth system
        this.userData = null;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateAuthState();
        
        // Check authentication status on page load
        this.checkAuthStatus();
        
        console.log('✅ Top Nav Auth system initialized');
    }
    
    bindEvents() {
        // Login/Signup button click
        const loginSignupBtn = document.getElementById('loginSignupBtn');
        if (loginSignupBtn) {
            loginSignupBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLoginSignupClick();
            });
        }
        
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
    }
    
    checkAuthStatus() {
        // This would integrate with your actual authentication system
        // For demo purposes, checking localStorage
        const authToken = localStorage.getItem('authToken');
        const userInfo = localStorage.getItem('userInfo');
        
        if (authToken && userInfo) {
            try {
                this.userData = JSON.parse(userInfo);
                this.isLoggedIn = true;
                this.updateAuthState();
                console.log('🔑 User authenticated:', this.userData.name);
            } catch (error) {
                console.error('❌ Error parsing user info:', error);
                this.logout();
            }
        } else {
            console.log('🚪 No authentication found');
        }
    }
    
    updateAuthState() {
        const authButtonContainer = document.getElementById('authButtonContainer');
        const profileContainer = document.getElementById('profileContainer');
        
        if (this.isLoggedIn && this.userData) {
            // Show profile, hide login/signup
            if (authButtonContainer) authButtonContainer.style.display = 'none';
            if (profileContainer) profileContainer.style.display = 'flex';
            
            this.updateProfileInfo();
            console.log('👤 Showing profile UI');
        } else {
            // Show login/signup, hide profile
            if (authButtonContainer) authButtonContainer.style.display = 'flex';
            if (profileContainer) profileContainer.style.display = 'none';
            
            console.log('🔐 Showing login/signup UI');
        }
    }
    
    updateProfileInfo() {
        if (!this.userData) return;
        
        // Update profile name in button
        const profileName = document.getElementById('profileName');
        if (profileName) {
            profileName.textContent = this.userData.name || this.userData.username || 'User';
        }
        
        // Update dropdown header
        const dropdownName = document.getElementById('dropdownName');
        const dropdownEmail = document.getElementById('dropdownEmail');
        
        if (dropdownName) {
            dropdownName.textContent = this.userData.name || this.userData.username || 'User';
        }
        
        if (dropdownEmail) {
            dropdownEmail.textContent = this.userData.email || 'user@example.com';
        }
        
        // Update avatar images if available
        if (this.userData.avatar) {
            const avatars = document.querySelectorAll('.profile-avatar, .dropdown-avatar');
            avatars.forEach(avatar => {
                avatar.src = this.userData.avatar;
            });
        }
        
        console.log('📝 Profile info updated');
    }
    
    handleLoginSignupClick() {
        // Create and show login/signup modal or redirect to auth page
        console.log('🔑 Login/Signup button clicked');
        this.showAuthModal();
    }
    
    showAuthModal() {
        // This would open your login/signup modal
        // For demo, using confirm dialog - replace with your modal system
        const choice = confirm('Click OK for Login, Cancel for Sign Up');
        
        if (choice) {
            this.showLoginForm();
        } else {
            this.showSignupForm();
        }
    }
    
    showLoginForm() {
        // Demo login - replace with your actual login system
        console.log('📝 Showing login form');
        const email = prompt('Enter email (demo):');
        const password = prompt('Enter password (demo):');
        
        if (email && password) {
            // Simulate successful login
            this.login({
                name: 'John Doe',
                email: email,
                username: 'johndoe',
                avatar: 'assets/images/default-avatar.svg'
            }, 'demo-token-123');
        }
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
    
    logout() {
        this.userData = null;
        this.isLoggedIn = false;
        
        // Clear storage
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
    
    showNotification(message, type = 'info') {
        // Simple notification system - replace with your notification system
        const notification = document.createElement('div');
        notification.className = `top-nav-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(59, 130, 246, 0.9)'};
            color: white;
            border-radius: 8px;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            font-weight: 500;
            backdrop-filter: blur(10px);
            border: 1px solid ${type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)'};
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Public methods for external integration
    isUserLoggedIn() {
        return this.isLoggedIn;
    }
    
    getUserData() {
        return this.userData;
    }
    
    forceLogin(userData, token) {
        this.login(userData, token);
    }
    
    forceLogout() {
        this.logout();
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
