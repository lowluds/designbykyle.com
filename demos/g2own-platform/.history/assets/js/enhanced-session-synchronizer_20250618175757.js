/*!
 * G2Own Enhanced Session Synchronizer
 * Synchronizes authentication state between OAuth tokens and community sessions
 */

class EnhancedSessionSynchronizer {
    constructor() {
        this.config = {
            sessionCheckUrl: '/community/session-check.php',
            syncInterval: 30000, // 30 seconds
            maxRetries: 3,
            retryDelay: 2000
        };
        
        this.state = {
            syncActive: false,
            lastSync: 0,
            retryCount: 0,
            currentSession: null
        };
        
        this.init();
    }

    init() {
        console.log('🔄 Initializing Enhanced Session Synchronizer...');
        
        this.setupEventListeners();
        this.startInitialSync();
        this.setupPeriodicSync();
    }

    setupEventListeners() {
        // Listen for OAuth events
        window.addEventListener('g2own:oauth-success', (event) => {
            console.log('🎉 OAuth success, syncing session...');
            this.syncOAuthToSession(event.detail);
        });

        // Listen for auth state changes
        window.addEventListener('g2own:auth-update', (event) => {
            if (event.detail.isAuthenticated) {
                console.log('🔄 Auth state update, syncing session...');
                this.syncOAuthToSession(event.detail);
            }
        });

        // Listen for logout events
        window.addEventListener('g2own:logout', () => {
            console.log('👋 Logout event, clearing session...');
            this.clearSession();
        });

        // Listen for storage changes
        window.addEventListener('storage', (event) => {
            if (event.key === 'g2own_oauth_token') {
                if (event.newValue) {
                    console.log('🔑 OAuth token updated, syncing session...');
                    this.debouncedSync();
                } else {
                    console.log('❌ OAuth token removed, clearing session...');
                    this.clearSession();
                }
            }
        });
    }

    startInitialSync() {
        console.log('🚀 Starting initial session sync...');
        
        // Immediate sync attempt
        this.performSync();
        
        // Delayed sync for OAuth data that might arrive later
        setTimeout(() => {
            this.performSync();
        }, 2000);
    }

    setupPeriodicSync() {
        // Periodic session validation
        setInterval(() => {
            if (this.hasActiveOAuthToken()) {
                this.performSync();
            }
        }, this.config.syncInterval);
    }

    async performSync() {
        if (this.state.syncActive) {
            console.log('⏳ Sync already in progress, skipping...');
            return;
        }

        this.state.syncActive = true;

        try {
            const oauthData = this.getOAuthData();
            
            if (oauthData && oauthData.token) {
                console.log('🔄 Syncing OAuth data to session...', oauthData.user?.name);
                await this.syncOAuthToSession(oauthData);
            } else {
                console.log('🔍 No OAuth data found, checking existing session...');
                await this.checkExistingSession();
            }
            
            this.state.retryCount = 0; // Reset retry count on success
            
        } catch (error) {
            console.error('❌ Session sync failed:', error);
            await this.handleSyncError(error);
        } finally {
            this.state.syncActive = false;
            this.state.lastSync = Date.now();
        }
    }

    async syncOAuthToSession(oauthData) {
        try {
            const userData = oauthData.user || this.parseUserData();
            const token = oauthData.token || localStorage.getItem('g2own_oauth_token');
            
            if (!userData || !token) {
                console.warn('⚠️ Insufficient OAuth data for session sync');
                return;
            }

            console.log('📡 Posting OAuth data to session endpoint...', userData.name);
            
            // Prepare session data
            const sessionData = {
                action: 'sync_oauth',
                oauth_token: token,
                user_id: userData.id,
                user_name: userData.name,
                user_email: userData.email,
                purchase_count: userData.purchase_count || 0,
                invoice_count: userData.invoice_count || 0,
                transaction_count: userData.transaction_count || 0,
                timestamp: Date.now()
            };

            // Add CSRF token if available
            if (window.securityUtils?.generateCSRFToken) {
                sessionData.csrf_token = window.securityUtils.generateCSRFToken();
            }

            const response = await this.makeSecureRequest(this.config.sessionCheckUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(sessionData)
            });

            if (response.success) {
                console.log('✅ Session sync successful:', response.user?.name);
                this.state.currentSession = response.user;
                
                // Emit session sync event
                window.dispatchEvent(new CustomEvent('g2own:session-synced', {
                    detail: { user: response.user, timestamp: Date.now() }
                }));
                
                // Update UI components
                await this.updateUIComponents(response.user);
            } else {
                throw new Error(response.error || 'Session sync failed');
            }

        } catch (error) {
            console.error('❌ OAuth to session sync failed:', error);
            throw error;
        }
    }

    async checkExistingSession() {
        try {
            console.log('🔍 Checking existing session...');

            const response = await this.makeSecureRequest(this.config.sessionCheckUrl, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (response.success && response.user) {
                console.log('✅ Existing session found:', response.user.name);
                this.state.currentSession = response.user;
                
                // Store user data locally if not present
                if (!localStorage.getItem('g2own_user_data')) {
                    localStorage.setItem('g2own_user_data', JSON.stringify(response.user));
                    console.log('💾 Stored session user data locally');
                }
                
                // Update UI components
                await this.updateUIComponents(response.user);
                
                // Emit session found event
                window.dispatchEvent(new CustomEvent('g2own:session-found', {
                    detail: { user: response.user, timestamp: Date.now() }
                }));
            } else {
                console.log('ℹ️ No existing session found');
                this.state.currentSession = null;
            }

        } catch (error) {
            console.error('❌ Session check failed:', error);
            throw error;
        }
    }

    async clearSession() {
        try {
            console.log('🧹 Clearing session...');

            const response = await this.makeSecureRequest(this.config.sessionCheckUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    action: 'clear_session',
                    timestamp: Date.now()
                })
            });

            this.state.currentSession = null;
            
            // Clear local data
            localStorage.removeItem('g2own_oauth_token');
            localStorage.removeItem('g2own_user_data');
            localStorage.removeItem('g2own_token_expiry');
            sessionStorage.removeItem('g2own_fresh_login');

            console.log('✅ Session cleared successfully');

            // Update UI to logged-out state
            await this.updateUIComponents(null);

        } catch (error) {
            console.error('❌ Session clear failed:', error);
        }
    }

    async updateUIComponents(userData) {
        console.log('🎨 Updating UI components with session data...', userData?.name);

        const updatePromises = [];

        // Update session bridge
        if (window.sessionBridge) {
            updatePromises.push(this.safeAsyncCall(async () => {
                if (userData) {
                    window.sessionBridge.setCurrentUser?.(userData);
                } else {
                    window.sessionBridge.clearCurrentUser?.();
                }
            }));
        }

        // Update top navigation
        if (window.topNavAuth) {
            updatePromises.push(this.safeAsyncCall(async () => {
                if (userData) {
                    window.topNavAuth.showUserProfile?.(userData);
                } else {
                    window.topNavAuth.showLoginButton?.();
                }
            }));
        }

        // Update left sidebar
        if (window.leftSidebarController) {
            updatePromises.push(this.safeAsyncCall(async () => {
                if (userData) {
                    window.leftSidebarController.showUserProfile?.(userData);
                } else {
                    window.leftSidebarController.showLoginPrompt?.();
                }
            }));
        }

        // Update main app
        if (window.g2ownEnhanced) {
            updatePromises.push(this.safeAsyncCall(async () => {
                window.g2ownEnhanced.updateUserState?.(userData);
            }));
        }

        await Promise.allSettled(updatePromises);
        console.log('✅ UI components updated');
    }

    async makeSecureRequest(url, options = {}) {
        // Add security headers
        const headers = {
            ...options.headers,
            'X-G2Own-Client': 'web-app',
            'X-Timestamp': Date.now().toString()
        };

        // Add rate limiting check
        if (window.securityUtils && !window.securityUtils.checkRateLimit('sessionSync', 10, 60000)) {
            throw new Error('Rate limit exceeded for session sync');
        }

        const response = await fetch(url, {
            ...options,
            headers,
            credentials: 'same-origin' // Include cookies for session
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    }

    async handleSyncError(error) {
        this.state.retryCount++;

        if (this.state.retryCount <= this.config.maxRetries) {
            console.log(`🔄 Retrying sync (${this.state.retryCount}/${this.config.maxRetries})...`);
            
            setTimeout(() => {
                this.performSync();
            }, this.config.retryDelay * this.state.retryCount);
        } else {
            console.error('❌ Max retry attempts reached for session sync');
            
            // Show error notification
            if (window.g2ownEnhanced?.showNotification) {
                window.g2ownEnhanced.showNotification(
                    'Session sync failed. Please refresh the page.',
                    'error'
                );
            }
        }
    }

    // Utility methods
    getOAuthData() {
        const token = localStorage.getItem('g2own_oauth_token');
        const userData = localStorage.getItem('g2own_user_data');
        
        if (!token || !userData) {
            return null;
        }

        try {
            const user = JSON.parse(userData);
            return { token, user };
        } catch (e) {
            console.error('Failed to parse OAuth data:', e);
            return null;
        }
    }

    parseUserData() {
        const userData = localStorage.getItem('g2own_user_data');
        if (!userData) return null;

        try {
            return JSON.parse(userData);
        } catch (e) {
            console.error('Failed to parse user data:', e);
            return null;
        }
    }

    hasActiveOAuthToken() {
        const token = localStorage.getItem('g2own_oauth_token');
        const expiry = localStorage.getItem('g2own_token_expiry');
        
        if (!token) return false;
        if (expiry && Date.now() >= parseInt(expiry)) return false;
        
        return true;
    }

    debouncedSync = this.debounce(() => {
        this.performSync();
    }, 1000);

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    async safeAsyncCall(asyncFunction) {
        try {
            return await asyncFunction();
        } catch (error) {
            console.warn('Safe async call failed:', error);
            return null;
        }
    }

    // Public API
    getCurrentSession() {
        return this.state.currentSession;
    }

    forcSync() {
        this.performSync();
    }

    isSessionActive() {
        return this.state.currentSession !== null;
    }
}

// Initialize the enhanced session synchronizer
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 Initializing Enhanced Session Synchronizer...');
    window.enhancedSessionSynchronizer = new EnhancedSessionSynchronizer();
});

// Also initialize if DOM is already loaded
if (document.readyState !== 'loading') {
    console.log('🔄 DOM already loaded, initializing Enhanced Session Synchronizer...');
    window.enhancedSessionSynchronizer = new EnhancedSessionSynchronizer();
}
