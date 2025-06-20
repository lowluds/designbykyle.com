/*!
 * G2Own OAuth Integration Manager
 * Coordinates OAuth authentication with existing systems
 * Version: 1.0.0
 */

class G2OwnOAuthManager {
    constructor() {
        this.oauth = null;
        this.cart = null;
        this.productDisplay = null;
        this.authBridge = null;
        
        this.isInitialized = false;
        this.initializationPromise = null;
        
        // Configuration
        this.config = {
            autoInit: true,
            enableStorageSync: true,
            enableCrossDomainSync: true,
            maxRetries: 3
        };
        
        this.init();
    }
    
    async init() {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }
        
        this.initializationPromise = this.performInit();
        return this.initializationPromise;
    }
    
    async performInit() {
        try {
            console.log('Initializing G2Own OAuth Manager...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // Initialize OAuth core
            this.oauth = new G2OwnOAuth();
            
            // Wait for OAuth to initialize
            await this.waitForOAuthReady();
            
            // Initialize cart with OAuth
            this.cart = new G2OwnCartOAuth(this.oauth);
            
            // Initialize product display
            this.productDisplay = new G2OwnProductDisplay(this.oauth, this.cart);
            
            // Setup integration with existing systems
            await this.integrateWithExistingSystems();
            
            // Setup event handlers
            this.setupGlobalEventHandlers();
            
            // Update UI based on auth state
            this.updateAuthUI();
            
            this.isInitialized = true;
            this.dispatchEvent('oauth:manager:ready');
            
            console.log('✅ G2Own OAuth Manager initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize OAuth Manager:', error);
            this.dispatchEvent('oauth:manager:error', { error });
            throw error;
        }
    }
    
    async waitForOAuthReady() {
        return new Promise((resolve) => {
            if (this.oauth && this.oauth.isAuthenticated !== undefined) {
                resolve();
            } else {
                const checkReady = () => {
                    if (this.oauth && this.oauth.isAuthenticated !== undefined) {
                        resolve();
                    } else {
                        setTimeout(checkReady, 100);
                    }
                };
                checkReady();
            }
        });
    }
    
    async integrateWithExistingSystems() {
        // Integrate with existing AuthenticationBridge
        if (window.sessionBridge || window.authBridge) {
            this.authBridge = window.sessionBridge || window.authBridge;
            this.setupAuthBridgeIntegration();
        }
        
        // Integrate with G2OwnEnhanced
        if (window.g2ownEnhanced) {
            this.setupEnhancedIntegration();
        }
        
        // Integrate with existing auth modals
        this.setupAuthModalIntegration();
        
        // Setup cart integration
        this.setupCartIntegration();
    }
    
    setupAuthBridgeIntegration() {
        if (!this.authBridge) return;
        
        // Listen to auth bridge events
        window.addEventListener('auth:status:changed', (event) => {
            const { isAuthenticated, user } = event.detail;
            
            if (isAuthenticated && !this.oauth.isUserAuthenticated()) {
                // Auth bridge detected login, sync with OAuth
                this.syncWithAuthBridge(user);
            } else if (!isAuthenticated && this.oauth.isUserAuthenticated()) {
                // Auth bridge detected logout, logout OAuth too
                this.oauth.logout();
            }
        });
        
        // Sync OAuth events back to auth bridge
        window.addEventListener('oauth:login:success', (event) => {
            if (this.authBridge && this.authBridge.updateAuthState) {
                this.authBridge.updateAuthState(true, event.detail.user);
            }
        });
        
        window.addEventListener('oauth:logout:success', () => {
            if (this.authBridge && this.authBridge.updateAuthState) {
                this.authBridge.updateAuthState(false, null);
            }
        });
    }
    
    async syncWithAuthBridge(user) {
        try {
            // If auth bridge has a valid session, try to get OAuth token
            if (this.authBridge.isAuthenticated) {
                // Attempt to exchange session for OAuth token
                const response = await fetch('/api/oauth/session-exchange', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const tokenData = await response.json();
                    await this.oauth.storeTokens(tokenData);
                    this.oauth.currentUser = user;
                    this.oauth.isAuthenticated = true;
                    this.updateAuthUI();
                }
            }
        } catch (error) {
            console.warn('Failed to sync with auth bridge:', error);
        }
    }
    
    setupEnhancedIntegration() {
        const enhanced = window.g2ownEnhanced;
        if (!enhanced) return;
        
        // Override authentication methods
        const originalAuth = enhanced.initializeBackendIntegration;
        if (originalAuth) {
            enhanced.initializeBackendIntegration = () => {
                originalAuth.call(enhanced);
                this.integrateWithEnhanced(enhanced);
            };
        }
        
        // Sync authentication state
        if (this.oauth.isUserAuthenticated()) {
            enhanced.state.isAuthenticated = true;
            enhanced.state.currentUser = this.oauth.getCurrentUser();
        }
    }
    
    integrateWithEnhanced(enhanced) {
        // Replace auth functions with OAuth versions
        enhanced.login = (email, password) => this.handleFormLogin(email, password);
        enhanced.logout = () => this.oauth.logout();
        enhanced.register = (userData) => this.handleFormRegister(userData);
        
        // Sync cart state
        if (enhanced.state && this.cart) {
            enhanced.state.cartItems = this.cart.getCart().items;
            enhanced.state.cartOpen = false;
        }
    }
    
    setupAuthModalIntegration() {
        // Find existing auth modal
        const authModal = document.querySelector('#auth-modal, .auth-modal');
        if (!authModal) return;
        
        // Override form submissions
        const signInForm = authModal.querySelector('#signin-form form, .signin-form form');
        const registerForm = authModal.querySelector('#register-form form, .register-form form');
        
        if (signInForm) {
            signInForm.addEventListener('submit', (event) => {
                event.preventDefault();
                this.handleSignInFormSubmit(signInForm);
            });
        }
        
        if (registerForm) {
            registerForm.addEventListener('submit', (event) => {
                event.preventDefault();
                this.handleRegisterFormSubmit(registerForm);
            });
        }
        
        // Setup social auth buttons
        const socialButtons = authModal.querySelectorAll('.social-auth-btn, [data-provider]');
        socialButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                const provider = button.dataset.provider;
                this.handleSocialAuth(provider);
            });
        });
        
        // Add OAuth login button
        this.addOAuthLoginButton(authModal);
    }
    
    addOAuthLoginButton(authModal) {
        const socialGrid = authModal.querySelector('.social-auth-grid');
        if (!socialGrid) return;
        
        const oauthButton = document.createElement('button');
        oauthButton.className = 'social-auth-btn oauth';
        oauthButton.innerHTML = `
            <span class="social-icon">🔐</span>
            <span class="social-text">G2Own Account</span>
        `;
        
        oauthButton.addEventListener('click', (event) => {
            event.preventDefault();
            this.oauth.initiateLogin();
        });
        
        // Insert as first button
        socialGrid.insertBefore(oauthButton, socialGrid.firstChild);
    }
    
    async handleSignInFormSubmit(form) {
        const formData = new FormData(form);
        const email = formData.get('email') || form.querySelector('[type="email"]')?.value;
        const password = formData.get('password') || form.querySelector('[type="password"]')?.value;
        
        if (!email || !password) {
            this.showAuthError('Please enter both email and password');
            return;
        }
        
        try {
            this.showAuthLoading(true);
            
            // Try traditional login first, then OAuth
            const loginResult = await this.handleFormLogin(email, password);
            
            if (loginResult.success) {
                this.closeAuthModal();
                this.showAuthSuccess('Successfully signed in!');
            } else {
                this.showAuthError(loginResult.error || 'Login failed');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            this.showAuthError('Login failed. Please try again.');
        } finally {
            this.showAuthLoading(false);
        }
    }
    
    async handleRegisterFormSubmit(form) {
        const formData = new FormData(form);
        const userData = {
            firstName: formData.get('firstName') || form.querySelector('[name="firstName"]')?.value,
            lastName: formData.get('lastName') || form.querySelector('[name="lastName"]')?.value,
            email: formData.get('email') || form.querySelector('[type="email"]')?.value,
            password: formData.get('password') || form.querySelector('[type="password"]')?.value,
            confirmPassword: formData.get('confirmPassword') || form.querySelector('[name="confirmPassword"]')?.value
        };
        
        if (!userData.email || !userData.password) {
            this.showAuthError('Please fill in all required fields');
            return;
        }
        
        if (userData.password !== userData.confirmPassword) {
            this.showAuthError('Passwords do not match');
            return;
        }
        
        try {
            this.showAuthLoading(true);
            
            const registerResult = await this.handleFormRegister(userData);
            
            if (registerResult.success) {
                this.closeAuthModal();
                this.showAuthSuccess('Account created successfully!');
            } else {
                this.showAuthError(registerResult.error || 'Registration failed');
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            this.showAuthError('Registration failed. Please try again.');
        } finally {
            this.showAuthLoading(false);
        }
    }
    
    async handleFormLogin(email, password) {
        try {
            // Send login request to community backend
            const response = await fetch(`${this.oauth.config.communityURL}/api/core/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // If login successful, initiate OAuth flow
                if (result.success) {
                    await this.oauth.initiateLogin({ loginHint: email });
                    return { success: true };
                } else {
                    return { success: false, error: result.error };
                }
            } else {
                return { success: false, error: 'Login failed' };
            }
            
        } catch (error) {
            console.error('Form login error:', error);
            return { success: false, error: 'Network error' };
        }
    }
    
    async handleFormRegister(userData) {
        try {
            // Send registration request to community backend
            const response = await fetch(`${this.oauth.config.communityURL}/api/core/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            if (response.ok) {
                const result = await response.json();
                
                if (result.success) {
                    // Auto-login after registration
                    return await this.handleFormLogin(userData.email, userData.password);
                } else {
                    return { success: false, error: result.error };
                }
            } else {
                return { success: false, error: 'Registration failed' };
            }
            
        } catch (error) {
            console.error('Form registration error:', error);
            return { success: false, error: 'Network error' };
        }
    }
    
    handleSocialAuth(provider) {
        // Redirect to OAuth with provider hint
        const authURL = `${this.oauth.endpoints.authorize}?` + new URLSearchParams({
            client_id: this.oauth.config.clientId,
            response_type: 'code',
            redirect_uri: this.oauth.config.redirectURI,
            scope: this.oauth.config.scope,
            state: this.oauth.generateState(),
            provider: provider
        }).toString();
        
        window.location.href = authURL;
    }
    
    setupCartIntegration() {
        // Override existing cart functions
        if (window.addToCart) {
            window.addToCart = (productId, quantity) => {
                return this.cart.addToCart(productId, quantity);
            };
        }
        
        // Setup cart event listeners
        window.addEventListener('cart:item:added', (event) => {
            this.updateCartUI();
        });
        
        window.addEventListener('cart:item:removed', (event) => {
            this.updateCartUI();
        });
        
        // Initial cart UI update
        this.updateCartUI();
    }
    
    setupGlobalEventHandlers() {
        // Handle OAuth events
        window.addEventListener('oauth:login:success', (event) => {
            this.updateAuthUI();
            this.showNotification('Successfully signed in!', 'success');
        });
        
        window.addEventListener('oauth:logout:success', () => {
            this.updateAuthUI();
            this.showNotification('Successfully signed out!', 'info');
        });
        
        window.addEventListener('oauth:token:expired', () => {
            this.updateAuthUI();
            this.showNotification('Session expired. Please sign in again.', 'warning');
        });
        
        // Handle login required actions
        document.addEventListener('click', (event) => {
            if (event.target.matches('.login-to-purchase-btn, [data-action="login-required"]')) {
                event.preventDefault();
                this.showAuthModal();
            }
        });
        
        // Handle checkout
        document.addEventListener('click', (event) => {
            if (event.target.matches('.checkout-btn, [data-action="checkout"]')) {
                event.preventDefault();
                this.cart.initiateCheckout();
            }
        });
    }
    
    updateAuthUI() {
        const isAuthenticated = this.oauth.isUserAuthenticated();
        const user = this.oauth.getCurrentUser();
        
        // Update auth buttons
        const loginButtons = document.querySelectorAll('.login-btn, [data-action="login"]');
        const logoutButtons = document.querySelectorAll('.logout-btn, [data-action="logout"]');
        const userMenus = document.querySelectorAll('.user-menu, [data-user-menu]');
        
        loginButtons.forEach(btn => {
            btn.style.display = isAuthenticated ? 'none' : 'block';
        });
        
        logoutButtons.forEach(btn => {
            btn.style.display = isAuthenticated ? 'block' : 'none';
        });
        
        userMenus.forEach(menu => {
            menu.style.display = isAuthenticated ? 'block' : 'none';
        });
        
        // Update user info
        if (isAuthenticated && user) {
            const userNameElements = document.querySelectorAll('.user-name, [data-user-name]');
            const userAvatarElements = document.querySelectorAll('.user-avatar, [data-user-avatar]');
            
            userNameElements.forEach(el => {
                el.textContent = user.displayName || user.name || user.email;
            });
            
            userAvatarElements.forEach(el => {
                if (el.tagName === 'IMG') {
                    el.src = user.avatar || '/assets/images/default-avatar.png';
                } else {
                    el.style.backgroundImage = `url(${user.avatar || '/assets/images/default-avatar.png'})`;
                }
            });
        }
        
        // Dispatch auth state change event
        this.dispatchEvent('oauth:ui:updated', { isAuthenticated, user });
    }
    
    updateCartUI() {
        const cart = this.cart.getCart();
        
        // Update cart counters
        const cartCounters = document.querySelectorAll('.cart-count, [data-cart-count]');
        cartCounters.forEach(counter => {
            counter.textContent = cart.count;
            counter.style.display = cart.count > 0 ? 'block' : 'none';
        });
        
        // Update cart totals
        const cartTotals = document.querySelectorAll('.cart-total, [data-cart-total]');
        cartTotals.forEach(total => {
            total.textContent = `$${cart.total.toFixed(2)}`;
        });
    }
    
    // UI Helper Methods
    showAuthModal() {
        const modal = document.querySelector('#auth-modal, .auth-modal');
        if (modal) {
            modal.classList.add('show', 'active');
            modal.setAttribute('aria-hidden', 'false');
        }
    }
    
    closeAuthModal() {
        const modal = document.querySelector('#auth-modal, .auth-modal');
        if (modal) {
            modal.classList.remove('show', 'active');
            modal.setAttribute('aria-hidden', 'true');
        }
    }
    
    showAuthLoading(show) {
        const loadingElements = document.querySelectorAll('.auth-loading, [data-auth-loading]');
        loadingElements.forEach(el => {
            el.style.display = show ? 'block' : 'none';
        });
        
        const submitButtons = document.querySelectorAll('.auth-submit-btn');
        submitButtons.forEach(btn => {
            btn.disabled = show;
            if (show) {
                btn.classList.add('loading');
            } else {
                btn.classList.remove('loading');
            }
        });
    }
    
    showAuthError(message) {
        this.showNotification(message, 'error');
    }
    
    showAuthSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    showNotification(message, type = 'info') {
        // Use existing notification system if available
        if (window.g2ownEnhanced && window.g2ownEnhanced.showNotification) {
            window.g2ownEnhanced.showNotification(message, type);
            return;
        }
        
        // Create simple notification
        const notification = document.createElement('div');
        notification.className = `oauth-notification oauth-notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
    }
    
    // Public API
    getOAuth() {
        return this.oauth;
    }
    
    getCart() {
        return this.cart;
    }
    
    getProductDisplay() {
        return this.productDisplay;
    }
    
    isReady() {
        return this.isInitialized;
    }
    
    async waitForReady() {
        if (this.isInitialized) return true;
        
        return new Promise((resolve) => {
            window.addEventListener('oauth:manager:ready', () => {
                resolve(true);
            }, { once: true });
        });
    }
}

// Global initialization
let g2ownOAuthManager = null;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        g2ownOAuthManager = new G2OwnOAuthManager();
        window.g2ownOAuth = g2ownOAuthManager;
    });
} else {
    g2ownOAuthManager = new G2OwnOAuthManager();
    window.g2ownOAuth = g2ownOAuthManager;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = G2OwnOAuthManager;
} else {
    window.G2OwnOAuthManager = G2OwnOAuthManager;
}
