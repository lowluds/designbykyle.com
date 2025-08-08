/*!
 * G2Own Authentication Bridge
 * Cross-domain authentication system for Invision Community integration
 * Version: 1.0.0
 */

class AuthenticationBridge {
    constructor() {
        this.backendURL = 'https://g2own.com/community';
        this.apiURL = 'https://g2own.com/community/api';
        this.localStorageKey = 'g2own_auth';
        this.checkInterval = 30000; // Check every 30 seconds
        this.isAuthenticated = false;
        this.userdata = null;
        
        this.init();
    }

    async init() {
        console.log('🔐 Initializing Authentication Bridge...');
        
        // Check for existing session
        await this.checkAuthStatus();
        
        // Set up periodic authentication checks
        setInterval(() => this.checkAuthStatus(), this.checkInterval);
        
        // Listen for storage changes (multi-tab sync)
        window.addEventListener('storage', (e) => {
            if (e.key === this.localStorageKey) {
                this.handleAuthChange();
            }
        });

        // Listen for messages from backend
        window.addEventListener('message', (e) => {
            if (e.origin === this.backendURL) {
                this.handleBackendMessage(e.data);
            }
        });

        console.log('✅ Authentication Bridge initialized');
    }

    async checkAuthStatus() {
        try {
            console.log('🔍 Checking authentication status...');
            
            // Method 1: Check via session-check endpoint
            const response = await fetch(`${this.backendURL}/session-check.php`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('📡 Auth response:', data);
                
                if (data.authenticated && data.user) {
                    this.updateAuthState(true, data.user);
                    console.log('✅ User authenticated:', data.user.name);
                } else {
                    this.updateAuthState(false, null);
                    console.log('❌ User not authenticated');
                }
            } else {
                // Fallback: try iframe method
                const isAuthenticated = await this.checkViaIframe();
                this.updateAuthState(isAuthenticated, null);
            }
        } catch (error) {
            console.warn('⚠️ Auth check failed:', error);
            // Try to get cached auth state
            const cachedAuth = this.getStoredUserData();
            if (cachedAuth && Date.now() - cachedAuth.timestamp < 3600000) {
                this.updateAuthState(true, cachedAuth.userData);
            } else {
                this.updateAuthState(false, null);
            }
        }
    }

    async checkViaIframe() {
        return new Promise((resolve) => {
            console.log('🖼️ Checking auth via iframe...');
            
            // Create hidden iframe to check backend session
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = `${this.backendURL}/?app=core&module=system&controller=login&do=check`;
            
            const timeout = setTimeout(() => {
                if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                }
                resolve(false);
            }, 5000);

            iframe.onload = () => {
                try {
                    // Try to read iframe content
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    const authStatus = iframeDoc.body.textContent.includes('authenticated') || 
                                     iframeDoc.body.textContent.includes('member_id');
                    
                    clearTimeout(timeout);
                    if (document.body.contains(iframe)) {
                        document.body.removeChild(iframe);
                    }
                    resolve(authStatus);
                } catch (e) {
                    // CORS will prevent reading, but we can detect if redirected to login
                    clearTimeout(timeout);
                    if (document.body.contains(iframe)) {
                        document.body.removeChild(iframe);
                    }
                    resolve(true); // Assume authenticated if no redirect to login
                }
            };

            iframe.onerror = () => {
                clearTimeout(timeout);
                if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                }
                resolve(false);
            };

            document.body.appendChild(iframe);
        });
    }    updateAuthState(isAuthenticated, userData = null) {
        const wasAuthenticated = this.isAuthenticated;
        this.isAuthenticated = isAuthenticated;
        this.userdata = userData;

        // Store auth state
        const authData = {
            isAuthenticated,
            userData,
            timestamp: Date.now()
        };
        localStorage.setItem(this.localStorageKey, JSON.stringify(authData));

        // Dispatch events for navbar controller and other components
        if (isAuthenticated && userData) {
            window.dispatchEvent(new CustomEvent('g2own:auth-login', {
                detail: { user: userData }
            }));
            window.dispatchEvent(new CustomEvent('g2own:auth-update', {
                detail: { user: userData }
            }));
        } else {
            window.dispatchEvent(new CustomEvent('g2own:auth-logout', {
                detail: { }
            }));
        }

        // Dispatch legacy event for backward compatibility
        if (wasAuthenticated !== isAuthenticated) {
            window.dispatchEvent(new CustomEvent('authStateChanged', {
                detail: { isAuthenticated, userData }
            }));
            
            console.log(`🔄 Auth state changed: ${isAuthenticated ? 'LOGGED IN' : 'LOGGED OUT'}`);
        }
    }

    updateAuthUI() {
        const authToggle = document.querySelector('.auth-toggle');
        const authIcon = document.querySelector('.auth-toggle i');
        const authDropdown = document.querySelector('.auth-dropdown');

        if (!authToggle) return;

        if (this.isAuthenticated && this.userdata) {
            // Show logged in state
            authToggle.classList.add('authenticated');
            
            if (authIcon) {
                authIcon.className = 'ph ph-user-circle-check nav-gaming-icon';
                authIcon.style.color = '#00ff00';
            }
            
            // Update dropdown with user info
            if (authDropdown) {
                this.renderUserDropdown(authDropdown);
            }
        } else {
            // Show logged out state
            authToggle.classList.remove('authenticated');
            
            if (authIcon) {
                authIcon.className = 'ph ph-user-circle nav-gaming-icon';
                authIcon.style.color = '';
            }
            
            // Show login/signup options
            if (authDropdown) {
                this.renderLoginDropdown(authDropdown);
            }
        }
    }

    renderUserDropdown(dropdown) {
        const user = this.userdata;
        const avatarUrl = user.photoUrl && !user.photoUrlIsDefault ? user.photoUrl : null;
        const userInitials = user.name ? user.name.charAt(0).toUpperCase() : 'U';
        
        const avatarHTML = avatarUrl ? 
            `<img src="${avatarUrl}" alt="Avatar" class="user-avatar" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
             <div class="default-avatar-icon" style="display: none;">${userInitials}</div>` :
            `<div class="default-avatar-icon">${userInitials}</div>`;
        
        dropdown.innerHTML = `
            <div class="user-info">
                ${avatarHTML}
                <div class="user-details">
                    <span class="username">${user.name || 'User'}</span>
                    <span class="user-email">${user.email || ''}</span>
                    <span class="user-group">${user.group?.name || 'Member'}</span>
                </div>
            </div>
            <div class="dropdown-divider"></div>
            <a href="${this.backendURL}/profile/${user.id}-${encodeURIComponent(user.name)}/" class="dropdown-item" target="_blank">
                <i class="ph ph-user"></i> Profile
            </a>
            <a href="${this.backendURL}/messenger/" class="dropdown-item" target="_blank">
                <i class="ph ph-envelope"></i> Messages
            </a>
            <a href="${this.backendURL}/settings/" class="dropdown-item" target="_blank">
                <i class="ph ph-gear"></i> Settings
            </a>
            <div class="dropdown-divider"></div>
            <button onclick="authBridge.logout()" class="dropdown-item logout-btn">
                <i class="ph ph-sign-out"></i> Logout
            </button>
        `;
    }

    renderLoginDropdown(dropdown) {
        dropdown.innerHTML = `
            <div class="auth-header">
                <h4>Welcome to G2Own</h4>
                <p>Access your gaming community</p>
            </div>
            <div class="dropdown-divider"></div>
            <button onclick="authBridge.login()" class="dropdown-item login-btn">
                <i class="ph ph-sign-in"></i> Login
            </button>
            <button onclick="authBridge.signup()" class="dropdown-item signup-btn">
                <i class="ph ph-user-plus"></i> Sign Up
            </button>
            <div class="dropdown-divider"></div>
            <a href="${this.backendURL}" class="dropdown-item" target="_blank">
                <i class="ph ph-house"></i> Visit Community
            </a>
        `;
    }

    showLoginPopup() {
        this.login();
    }

    showSignupPopup() {
        this.signup();
    }

    login() {
        console.log('🔑 Opening login popup...');
        
        // Open login in popup window for seamless experience
        const loginURL = `${this.backendURL}/login/`;
        const popup = window.open(
            loginURL, 
            'g2own_login',
            'width=500,height=600,scrollbars=yes,resizable=yes,centerscreen=yes'
        );

        if (!popup) {
            // Popup blocked - redirect to login page
            window.open(loginURL, '_blank');
            return;
        }

        // Monitor popup for completion
        const checkClosed = setInterval(() => {
            if (popup.closed) {
                clearInterval(checkClosed);
                console.log('🔑 Login popup closed, checking auth status...');
                // Recheck auth status after login attempt
                setTimeout(() => this.checkAuthStatus(), 1000);
            }
        }, 1000);

        // Timeout after 5 minutes
        setTimeout(() => {
            if (!popup.closed) {
                popup.close();
                clearInterval(checkClosed);
            }
        }, 300000);
    }

    signup() {
        console.log('📝 Opening signup popup...');
        
        const signupURL = `${this.backendURL}/register/`;
        const popup = window.open(
            signupURL,
            'g2own_signup', 
            'width=500,height=700,scrollbars=yes,resizable=yes,centerscreen=yes'
        );

        if (!popup) {
            // Popup blocked - redirect to signup page
            window.open(signupURL, '_blank');
            return;
        }

        const checkClosed = setInterval(() => {
            if (popup.closed) {
                clearInterval(checkClosed);
                console.log('📝 Signup popup closed, checking auth status...');
                setTimeout(() => this.checkAuthStatus(), 1000);
            }
        }, 1000);

        // Timeout after 5 minutes
        setTimeout(() => {
            if (!popup.closed) {
                popup.close();
                clearInterval(checkClosed);
            }
        }, 300000);
    }

    async logout() {
        console.log('🚪 Logging out...');
        
        try {
            // Logout from backend
            await fetch(`${this.backendURL}/logout/`, {
                method: 'POST',
                credentials: 'include'
            });
            console.log('✅ Backend logout successful');
        } catch (error) {
            console.warn('⚠️ Backend logout failed:', error);
        }

        // Clear local auth state
        this.updateAuthState(false, null);
        localStorage.removeItem(this.localStorageKey);
        
        console.log('✅ Local logout complete');
        
        // Show logout confirmation
        this.showNotification('Logged out successfully', 'success');
    }

    getStoredUserData() {
        const stored = localStorage.getItem(this.localStorageKey);
        if (stored) {
            try {
                const data = JSON.parse(stored);
                // Check if data is not too old (1 hour)
                if (Date.now() - data.timestamp < 3600000) {
                    return data;
                }
            } catch (e) {
                console.warn('⚠️ Invalid stored auth data');
            }
        }
        return null;
    }

    handleBackendMessage(data) {
        console.log('📨 Message from backend:', data);
        
        if (data.type === 'auth_success') {
            this.updateAuthState(true, data.userData);
        } else if (data.type === 'auth_logout') {
            this.updateAuthState(false, null);
        }
    }

    handleAuthChange() {
        const stored = this.getStoredUserData();
        if (stored && stored.userData !== this.userdata) {
            console.log('🔄 Auth state changed in another tab');
            this.checkAuthStatus();
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `auth-notification auth-notification-${type}`;
        notification.innerHTML = `
            <i class="ph ph-${type === 'success' ? 'check-circle' : 'info'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Debug methods
    debug() {
        console.log('🐛 Auth Bridge Debug Info:');
        console.log('- Backend URL:', this.backendURL);
        console.log('- Is Authenticated:', this.isAuthenticated);
        console.log('- User Data:', this.userdata);
        console.log('- Stored Data:', this.getStoredUserData());
    }

    forceCheck() {
        console.log('🔄 Force checking authentication...');
        this.checkAuthStatus();
    }
}

// Initialize authentication bridge
console.log('🚀 Loading Authentication Bridge...');
window.authBridge = new AuthenticationBridge();
