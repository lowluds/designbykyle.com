/*!
 * Auth Bridge Fallback - Enhanced Detection
 * Provides better authentication detection when main methods fail
 */

class AuthBridgeFallback {
    constructor() {
        this.backendURL = window.location.origin + '/community';
        this.isAuthenticated = false;
        this.userdata = null;
        this.localStorageKey = 'g2own_auth';
        
        console.log('🔄 Using Auth Bridge Fallback Mode');
        this.init();
    }

    async init() {
        // Try to detect authentication through alternative methods
        await this.detectAuthStatus();
        
        // Set up periodic checks
        setInterval(() => this.detectAuthStatus(), 60000);
        
        // Listen for storage changes
        window.addEventListener('storage', (e) => {
            if (e.key === this.localStorageKey) {
                this.handleAuthChange();
            }
        });
    }

    async detectAuthStatus() {
        try {
            // Method 1: Check if user has backend cookies
            const hasBackendCookies = this.checkBackendCookies();
            
            // Method 2: Try iframe detection
            const iframeResult = await this.checkViaIframe();
            
            // Method 3: Check localStorage for cached auth
            const cachedAuth = this.getCachedAuth();
            
            if (hasBackendCookies || iframeResult || cachedAuth) {
                const userData = cachedAuth || this.createBasicUserData();
                this.updateAuthState(true, userData);
            } else {
                this.updateAuthState(false, null);
            }
            
        } catch (error) {
            console.warn('🔄 Fallback auth detection failed:', error);
            this.updateAuthState(false, null);
        }
    }

    checkBackendCookies() {
        // Check for common Invision Community cookies
        const cookies = document.cookie.split(';').map(c => c.trim());
        const ipsSession = cookies.find(c => c.startsWith('ips4_IPSSessionFront=') || c.startsWith('ips_session='));
        const ipsLogin = cookies.find(c => c.startsWith('ips4_login_key=') || c.startsWith('ips_login='));
        
        console.log('🍪 Checking cookies:', { ipsSession: !!ipsSession, ipsLogin: !!ipsLogin });
        return ipsSession && ipsLogin;
    }

    async checkViaIframe() {
        return new Promise((resolve) => {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = `${this.backendURL}/`;
            
            const timeout = setTimeout(() => {
                if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                }
                resolve(false);
            }, 5000);

            iframe.onload = () => {
                clearTimeout(timeout);
                if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                }
                // If iframe loads successfully without redirect, likely authenticated
                resolve(true);
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

    getCachedAuth() {
        try {
            const cached = localStorage.getItem(this.localStorageKey);
            if (cached) {
                const data = JSON.parse(cached);
                // Check if cache is less than 2 hours old
                if (Date.now() - data.timestamp < 7200000) {
                    return data.userData;
                }
            }
        } catch (e) {
            console.warn('Failed to read cached auth:', e);
        }
        return null;
    }

    createBasicUserData() {
        return {
            id: 'detected',
            name: 'Authenticated User',
            email: '',
            group: { name: 'Member' },
            photoUrl: null
        };
    }

    updateAuthState(isAuthenticated, userData = null) {
        const wasAuthenticated = this.isAuthenticated;
        this.isAuthenticated = isAuthenticated;
        this.userdata = userData;

        // Cache auth state
        if (isAuthenticated && userData) {
            const authData = {
                isAuthenticated,
                userData,
                timestamp: Date.now()
            };
            localStorage.setItem(this.localStorageKey, JSON.stringify(authData));
        } else {
            localStorage.removeItem(this.localStorageKey);
        }

        // Update UI
        this.updateAuthUI();

        // Dispatch event
        if (wasAuthenticated !== isAuthenticated) {
            window.dispatchEvent(new CustomEvent('authStateChanged', {
                detail: { isAuthenticated, userData }
            }));
            
            window.dispatchEvent(new CustomEvent(isAuthenticated ? 'g2own:auth-login' : 'g2own:auth-logout', {
                detail: isAuthenticated ? { user: userData } : {}
            }));
        }
    }

    updateAuthUI() {
        if (window.authBridge && window.authBridge.updateAuthUI) {
            window.authBridge.updateAuthUI();
        } else {
            // Basic UI update
            const authToggle = document.querySelector('.auth-toggle');
            if (authToggle) {
                if (this.isAuthenticated) {
                    authToggle.classList.add('authenticated');
                } else {
                    authToggle.classList.remove('authenticated');
                }
            }
        }
    }

    // Proxy methods for compatibility
    login() {
        console.log('🔑 Opening login page...');
        window.open(`${this.backendURL}/login/`, '_blank');
        
        // Check auth status after potential login
        setTimeout(() => this.detectAuthStatus(), 2000);
    }

    logout() {
        console.log('🚪 Opening logout page...');
        window.open(`${this.backendURL}/logout/`, '_blank');
        
        // Clear local auth state
        this.updateAuthState(false, null);
    }

    checkAuthStatus() {
        return this.detectAuthStatus();
    }

    handleAuthChange() {
        this.detectAuthStatus();
    }
}

// Initialize fallback if main auth bridge fails or has issues
setTimeout(() => {
    if (!window.authBridge || (window.authBridge && !window.authBridge.isAuthenticated)) {
        console.log('🔄 Main auth bridge not working optimally, enhancing with fallback...');
        
        // Don't replace the main bridge, just enhance it
        window.authBridgeFallback = new AuthBridgeFallback();
        
        // If main bridge exists but not authenticated, try fallback detection
        if (window.authBridge && !window.authBridge.isAuthenticated) {
            window.authBridgeFallback.detectAuthStatus().then(() => {
                if (window.authBridgeFallback.isAuthenticated) {
                    // Transfer the detected auth state to main bridge
                    window.authBridge.updateAuthState(true, window.authBridgeFallback.userdata);
                }
            });
        }
    }
}, 5000);
