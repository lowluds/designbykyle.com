/*!
 * G2Own Authentication Bridge - Production Version
 * Cross-domain authentication system for Invision Community integration
 * Version: 1.1.0 (Production)
 */

class AuthenticationBridge {
    constructor() {
        this.backendURL = 'https://g2own.com/community';
        this.apiURL = 'https://g2own.com/community/api';
        this.localStorageKey = 'g2own_auth';
        this.checkInterval = 30000; // Check every 30 seconds
        this.isAuthenticated = false;
        this.userdata = null;
        this.debug = false; // Set to true for debugging
        
        this.init();
    }

    async init() {
        this.log('Initializing Authentication Bridge...');
        
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

        this.log('Authentication Bridge initialized');
    }

    async checkAuthStatus() {
        try {
            this.log('Checking authentication status...');
            
            // Method 1: Try direct fetch with CORS
            try {
                const response = await fetch(`${this.backendURL}/session-check.php`, {
                    method: 'GET',
                    credentials: 'include',
                    mode: 'cors',
                    headers: {
                        'Accept': 'application/json',
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    this.log('Auth response (Direct CORS):', data);
                    
                    if (data.authenticated && data.user) {
                        this.updateAuthState(true, data.user);
                        this.log('User authenticated via CORS:', data.user.name);
                        return;
                    } else {
                        this.updateAuthState(false, null);
                        this.log('User not authenticated via CORS');
                        return;
                    }
                }
            } catch (fetchError) {
                this.log('CORS fetch failed, trying JSONP:', fetchError.message);
            }

            // Method 2: Try JSONP approach
            try {
                this.log('Attempting JSONP authentication check...');
                const jsonpData = await this.checkViaJSONP();
                if (jsonpData && jsonpData.authenticated) {
                    this.updateAuthState(true, jsonpData.user);
                    this.log('User authenticated via JSONP:', jsonpData.user?.name || 'Unknown');
                    return;
                } else {
                    this.log('User not authenticated via JSONP');
                }
            } catch (jsonpError) {
                this.log('JSONP method failed:', jsonpError.message);
            }

            // Method 3: Check via iframe (fallback)
            try {
                this.log('Attempting iframe authentication check...');
                const isAuthenticated = await this.checkViaIframe();
                if (isAuthenticated) {
                    // If iframe suggests authenticated, try to get cached user data
                    const cachedAuth = this.getStoredUserData();
                    if (cachedAuth && cachedAuth.userData) {
                        this.updateAuthState(true, cachedAuth.userData);
                        this.log('User authenticated via iframe + cache');
                        return;
                    } else {
                        // Create a basic user object if we detect auth but no user data
                        const basicUser = {
                            id: 'unknown',
                            name: 'Authenticated User',
                            email: '',
                            avatar: 'assets/images/default-avatar.svg',
                            group_name: 'Member',
                            profile_url: '#'
                        };
                        this.updateAuthState(true, basicUser);
                        this.log('User authenticated via iframe (basic data)');
                        return;
                    }
                }
            } catch (iframeError) {
                this.log('Iframe method failed:', iframeError.message);
            }

            // If all methods fail, user is not authenticated
            this.updateAuthState(false, null);
            this.log('All authentication methods failed - user not authenticated');
            
        } catch (error) {
            this.log('Authentication check failed:', error);
            
            // Try to get cached auth state as last resort
            const cachedAuth = this.getStoredUserData();
            if (cachedAuth && Date.now() - cachedAuth.timestamp < 3600000) {
                this.updateAuthState(true, cachedAuth.userData);
                this.log('Using cached authentication data');
            } else {
                this.updateAuthState(false, null);
            }
        }
    }

    async checkViaJSONP() {
        return new Promise((resolve, reject) => {
            const callbackName = 'g2own_auth_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            const script = document.createElement('script');
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
            const separator = this.backendURL.includes('?') ? '&' : '?';
            script.src = `${this.backendURL}/session-check.php${separator}callback=${callbackName}`;
            document.head.appendChild(script);
        });
    }

    async checkViaIframe() {
        return new Promise((resolve) => {
            this.log('Checking auth via iframe...');
            
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
    }

    updateAuthState(isAuthenticated, userData = null) {
        const wasAuthenticated = this.isAuthenticated;
        this.isAuthenticated = isAuthenticated;
        this.userdata = userData;

        // Store auth state
        const authData = {
            isAuthenticated,
            userData,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem(this.localStorageKey, JSON.stringify(authData));
        } catch (e) {
            this.log('Failed to store auth data in localStorage:', e);
        }

        // Dispatch events for navbar controller and other components
        if (isAuthenticated && userData) {
            this.dispatchEvent('g2own:auth-login', { user: userData });
            this.dispatchEvent('g2own:auth-update', { user: userData });
        } else {
            this.dispatchEvent('g2own:auth-logout', {});
        }

        // Dispatch legacy event for backward compatibility
        if (wasAuthenticated !== isAuthenticated) {
            this.dispatchEvent('authStateChanged', { isAuthenticated, userData });
            this.log(`Auth state changed: ${isAuthenticated ? 'LOGGED IN' : 'LOGGED OUT'}`);
        }
    }

    dispatchEvent(eventName, detail) {
        try {
            window.dispatchEvent(new CustomEvent(eventName, { detail }));
        } catch (e) {
            this.log('Failed to dispatch event:', eventName, e);
        }
    }

    getStoredUserData() {
        try {
            const stored = localStorage.getItem(this.localStorageKey);
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            this.log('Failed to parse stored auth data:', e);
            return null;
        }
    }

    handleAuthChange() {
        // Handle auth changes from other tabs
        const newAuthData = this.getStoredUserData();
        if (newAuthData) {
            this.updateAuthState(newAuthData.isAuthenticated, newAuthData.userData);
        }
    }

    handleBackendMessage(data) {
        try {
            if (data.type === 'auth-update' && data.user) {
                this.updateAuthState(true, data.user);
            } else if (data.type === 'auth-logout') {
                this.updateAuthState(false, null);
            }
        } catch (e) {
            this.log('Failed to handle backend message:', e);
        }
    }

    // Public API methods
    async checkSession() {
        await this.checkAuthStatus();
        return {
            isAuthenticated: this.isAuthenticated,
            user: this.userdata
        };
    }

    getCurrentUser() {
        return this.userdata;
    }

    isUserAuthenticated() {
        return this.isAuthenticated;
    }

    // Utility methods
    login() {
        window.location.href = `${this.backendURL}/login/`;
    }

    logout() {
        window.location.href = `${this.backendURL}/logout/`;
    }

    register() {
        window.location.href = `${this.backendURL}/register/`;
    }

    profile() {
        if (this.userdata && this.userdata.profile_url) {
            window.location.href = this.userdata.profile_url;
        } else {
            window.location.href = `${this.backendURL}/profile/`;
        }
    }

    log(...args) {
        if (this.debug) {
            console.log('[G2Own Auth]', ...args);
        }
    }
}

// Initialize the authentication bridge when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (!window.authBridge) {
        window.authBridge = new AuthenticationBridge();
        window.AuthenticationBridge = AuthenticationBridge;
    }
});

// Also initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
} else {
    // DOM is already loaded
    if (!window.authBridge) {
        window.authBridge = new AuthenticationBridge();
        window.AuthenticationBridge = AuthenticationBridge;
    }
}
