/*!
 * G2Own Authentication Bridge - Production Optimized
 * Minified and performance-optimized version
 * Version: 2.0.0 (Production)
 */

class AuthenticationBridge {    constructor() {
        // Use absolute URL to connect to production backend
        this.backendURL = '';
        this.sessionCheckURL = this.backendURL + '/session-check.php';
        this.localStorageKey = 'g2own_auth';
        this.checkInterval = 30000;
        this.isAuthenticated = false;
        this.userdata = null;
        this.requestController = null;
        
        this.init();
    }

    async init() {
        // Optimized initialization with error handling
        try {
            await this.checkAuthStatus();
            
            // Reduced check interval for better performance
            setInterval(() => this.checkAuthStatus(), this.checkInterval);
            
            // Optimized event listeners
            window.addEventListener('storage', this.handleStorageChange.bind(this), { passive: true });
            window.addEventListener('focus', this.handleFocusChange.bind(this), { passive: true });
            
        } catch (error) {
            // Silent error handling for production
            this.updateAuthState(false, null);
        }
    }

    async checkAuthStatus() {
        try {
            // Cancel previous request if still pending
            if (this.requestController) {
                this.requestController.abort();
            }
            
            this.requestController = new AbortController();
            const timeoutId = setTimeout(() => this.requestController.abort(), 5000);
              const response = await fetch(this.sessionCheckURL, {
                method: 'GET',
                credentials: 'include',
                mode: 'cors',
                signal: this.requestController.signal,
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });

            clearTimeout(timeoutId);
            this.requestController = null;

            if (response.ok) {
                const data = await response.json();
                this.updateAuthState(data.authenticated, data.user || null);
                return;
            }        } catch (error) {
            // Try JSONP fallback for cross-domain requests
            try {
                const jsonpData = await this.checkViaJSONP();
                if (jsonpData && jsonpData.authenticated) {
                    this.updateAuthState(true, jsonpData.user);
                    return;
                }
            } catch (jsonpError) {
                // Silent fallback for production - use cached data
            }
        }
        
        // Use cached data if request fails
        const cached = this.getStoredUserData();
        if (cached && Date.now() - cached.timestamp < 1800000) { // 30 min cache
            this.updateAuthState(cached.isAuthenticated, cached.userData);
        } else {
            this.updateAuthState(false, null);
        }
    }

    updateAuthState(isAuthenticated, userData = null) {
        const wasAuthenticated = this.isAuthenticated;
        this.isAuthenticated = isAuthenticated;
        this.userdata = userData;

        // Optimized storage with try-catch
        try {
            const authData = {
                isAuthenticated,
                userData,
                timestamp: Date.now()
            };
            localStorage.setItem(this.localStorageKey, JSON.stringify(authData));
        } catch (e) {
            // Storage quota exceeded - clear old data
            localStorage.removeItem(this.localStorageKey);
        }

        // Batch DOM updates to prevent layout thrashing
        if (wasAuthenticated !== isAuthenticated) {
            requestAnimationFrame(() => {
                this.updateAuthUI();
                this.dispatchAuthEvents(isAuthenticated, userData);
            });
        }
    }

    updateAuthUI() {
        const authToggle = document.querySelector('.auth-toggle');
        const authIcon = document.querySelector('.auth-toggle i');
        
        if (!authToggle) return;

        // Use CSS classes for better performance
        authToggle.classList.toggle('authenticated', this.isAuthenticated);
        
        if (authIcon) {
            // Optimize icon updates
            const iconClass = this.isAuthenticated ? 'ph-user-circle-check' : 'ph-user-circle';
            if (!authIcon.classList.contains(iconClass)) {
                authIcon.className = `ph ${iconClass} nav-gaming-icon`;
                authIcon.style.color = this.isAuthenticated ? '#00ff00' : '';
            }
        }

        // Update dropdown content if visible
        const dropdown = document.querySelector('.auth-dropdown');
        if (dropdown && dropdown.style.display !== 'none') {
            this.updateDropdownContent(dropdown);
        }
    }

    updateDropdownContent(dropdown) {
        if (!dropdown) return;

        if (this.isAuthenticated && this.userdata) {
            const user = this.userdata;
            const avatarUrl = user.photoUrl && !user.photoUrlIsDefault ? user.photoUrl : null;
            const userInitials = user.name ? user.name.charAt(0).toUpperCase() : 'U';
            
            // Use template literals for better performance
            dropdown.innerHTML = `
                <div class="user-info">
                    ${avatarUrl ? 
                        `<img src="${avatarUrl}" alt="Avatar" class="user-avatar" loading="lazy">` :
                        `<div class="default-avatar-icon">${userInitials}</div>`
                    }
                    <div class="user-details">
                        <span class="username">${user.name || 'User'}</span>
                        <span class="user-email">${user.email || ''}</span>
                        <span class="user-group">${user.group?.name || 'Member'}</span>
                    </div>
                </div>
                <div class="dropdown-divider"></div>
                <a href="${this.backendURL}/profile/" class="dropdown-item">
                    <i class="ph ph-user"></i> Profile
                </a>
                <a href="${this.backendURL}/messenger/" class="dropdown-item">
                    <i class="ph ph-envelope"></i> Messages
                </a>
                <a href="${this.backendURL}/settings/" class="dropdown-item">
                    <i class="ph ph-gear"></i> Settings
                </a>
                <div class="dropdown-divider"></div>
                <button onclick="window.authBridge.logout()" class="dropdown-item logout-btn">
                    <i class="ph ph-sign-out"></i> Logout
                </button>
            `;
        } else {
            dropdown.innerHTML = `
                <div class="login-prompt">
                    <h4>Join G2Own Community</h4>
                    <p>Access exclusive gaming content and connect with gamers worldwide.</p>
                </div>
                <div class="dropdown-divider"></div>
                <button onclick="window.authBridge.login()" class="dropdown-item login-btn">
                    <i class="ph ph-sign-in"></i> Login
                </button>
                <button onclick="window.authBridge.register()" class="dropdown-item register-btn">
                    <i class="ph ph-user-plus"></i> Register
                </button>
            `;
        }
    }

    dispatchAuthEvents(isAuthenticated, userData) {
        try {
            if (isAuthenticated && userData) {
                window.dispatchEvent(new CustomEvent('g2own:auth-login', {
                    detail: { user: userData }
                }));
            } else {
                window.dispatchEvent(new CustomEvent('g2own:auth-logout', {
                    detail: {}
                }));
            }
        } catch (e) {
            // Silent error handling
        }
    }

    getStoredUserData() {
        try {
            const stored = localStorage.getItem(this.localStorageKey);
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            return null;
        }
    }

    handleStorageChange(e) {
        if (e.key === this.localStorageKey) {
            const newData = this.getStoredUserData();
            if (newData) {
                this.updateAuthState(newData.isAuthenticated, newData.userData);
            }
        }
    }

    handleFocusChange() {
        // Check auth status when user returns to tab
        if (document.visibilityState === 'visible') {
            this.checkAuthStatus();
        }
    }

    // Public API methods
    login() {
        window.location.href = `${this.backendURL}/login/`;
    }

    logout() {
        // Clear local state immediately
        this.updateAuthState(false, null);
        
        // Redirect to logout
        window.location.href = `${this.backendURL}/logout/`;
    }

    register() {
        window.location.href = `${this.backendURL}/register/`;
    }

    // Utility methods
    getCurrentUser() {
        return this.userdata;
    }

    isUserAuthenticated() {
        return this.isAuthenticated;
    }

    async checkViaJSONP() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            const callbackName = 'g2own_auth_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            let completed = false;
            
            // Set up global callback
            window[callbackName] = (data) => {
                if (!completed) {
                    completed = true;
                    cleanup();
                    resolve(data);
                }
            };
            
            // Cleanup function
            const cleanup = () => {
                delete window[callbackName];
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            };
            
            // Set up error handling
            script.onerror = () => {
                if (!completed) {
                    completed = true;
                    cleanup();
                    reject(new Error('JSONP script load failed'));
                }
            };
            
            // Set timeout
            setTimeout(() => {
                if (!completed) {
                    completed = true;
                    cleanup();
                    reject(new Error('JSONP request timeout'));
                }
            }, 10000);
            
            // Build URL with callback
            const separator = this.sessionCheckURL.includes('?') ? '&' : '?';
            script.src = `${this.sessionCheckURL}${separator}callback=${callbackName}&_=${Date.now()}`;
            document.head.appendChild(script);
        });
    }
}

// Optimized initialization
document.addEventListener('DOMContentLoaded', function() {
    if (!window.authBridge) {
        window.authBridge = new AuthenticationBridge();
        window.AuthenticationBridge = AuthenticationBridge;
    }
});

// Handle already loaded DOM
if (document.readyState !== 'loading') {
    if (!window.authBridge) {
        window.authBridge = new AuthenticationBridge();
        window.AuthenticationBridge = AuthenticationBridge;
    }
}
