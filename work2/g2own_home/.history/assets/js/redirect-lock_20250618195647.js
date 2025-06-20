/**
 * Redirect Lock - Prevents redirect loops and enhances login flow
 * Enhanced with robust storage for private/incognito browsing mode
 */
(function() {
    // Use safeStorage if available, otherwise fallback to legacy implementation
    const storage = window.safeStorage || (function() {
        // Check if localStorage is available (might not be in strict incognito modes)
        const storageAvailable = (function() {
            try {
                const test = '__storage_test__';
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
            } catch(e) {
                return false;
            }
        })();

        // Use sessionStorage as fallback if localStorage isn't available
        if (storageAvailable) {
            console.log('📦 Using localStorage in redirect-lock.js');
            return localStorage;
        } else {
            console.log('⚠️ localStorage not available, using memory storage fallback');
            // Memory fallback if neither is available
            if (!window._memoryStorage) {
                window._memoryStorage = {};
            }
            return {
                getItem: function(key) { return window._memoryStorage[key]; },
                setItem: function(key, value) { window._memoryStorage[key] = value; },
                removeItem: function(key) { delete window._memoryStorage[key]; },
                clear: function() { window._memoryStorage = {}; }
            };
        }
    })();
    
    // Check if we're being redirected in a loop
    const url = new URL(window.location.href);
    const hasLoginSuccess = url.searchParams.has('login') && url.searchParams.get('login') === 'success';
    const hasAuthParam = url.searchParams.has('auth');
    const hasToken = url.searchParams.has('token') || url.searchParams.has('code');
    
    // If we're coming back with login=success or auth parameter
    if (hasLoginSuccess || hasAuthParam || hasToken) {
        console.log('✅ Login return detected:', { hasLoginSuccess, hasAuthParam, hasToken });
        
        // Store the fact that we're processing a login return
        storage.setItem('processing_login_return', 'true');
        
        // Clear the URL parameters after storing what we need
        if (hasToken) {
            // Save token for verification if needed
            const token = url.searchParams.get('token') || url.searchParams.get('code');
            if (token) {
                storage.setItem('temp_auth_token', token);
            }
        }
        
        // Clean up URL
        url.searchParams.delete('login');
        url.searchParams.delete('auth');
        url.searchParams.delete('token');
        url.searchParams.delete('code');
        window.history.replaceState({}, document.title, url.toString());
        
        // Check if we have user data or need to fetch it
        setTimeout(() => {
            const userData = storage.getItem('g2own_user') || storage.getItem('oauth_user');
            if (!userData || userData === '{}' || userData === 'null') {
                console.log('⚠️ No user data found after login return, fetching...');
                
                // Force fetch user data using enhanced endpoint
                fetch('/community/enhanced-session-check.php?force=1&t=' + Date.now(), {
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache, no-store',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.authenticated && data.user) {
                        console.log('✅ Got user data from enhanced check:', data.user);
                        
                        // Store in all available storage mechanisms
                        storage.setItem('g2own_user', JSON.stringify(data.user));
                        storage.setItem('oauth_user', JSON.stringify(data.user));
                        storage.setItem('last_auth_time', Date.now().toString());
                        
                        // Ensure session sync is triggered
                        if (window.syncCommunitySession) {
                            window.syncCommunitySession();
                        }
                        
                        // Force UI update via events
                        window.dispatchEvent(new CustomEvent('g2own:auth-update', { 
                            detail: { user: data.user } 
                        }));
                        
                        // Also trigger session bridge if available
                        if (window.sessionBridge && window.sessionBridge.updateMainSiteAuth) {
                            window.sessionBridge.updateMainSiteAuth(data.user);
                        }
                        
                        // Clear processing flag
                        storage.removeItem('processing_login_return');
                        
                        // Optionally reload if UI doesn't update properly
                        if (document.querySelector('#authButtonContainer.hidden') === null) {
                            console.log('🔄 UI not updated properly, reloading page');
                            location.reload();
                        }
                    } else {
                        console.log('❌ No user data from enhanced check, falling back to standard check');
                        
                        // Try standard endpoint as fallback
                        fetch('/community/session-check.php?t=' + Date.now(), {
                            credentials: 'include',
                            headers: {
                                'Accept': 'application/json',
                                'Cache-Control': 'no-cache, no-store',
                                'X-Requested-With': 'XMLHttpRequest'
                            }
                        })
                        .then(response => response.json())
                        .then(fallbackData => {
                            if (fallbackData.authenticated && fallbackData.user) {
                                console.log('✅ Got user data from fallback check:', fallbackData.user);
                                
                                // Store user data
                                storage.setItem('g2own_user', JSON.stringify(fallbackData.user));
                                storage.setItem('oauth_user', JSON.stringify(fallbackData.user));
                                
                                // Force UI update
                                window.dispatchEvent(new CustomEvent('g2own:auth-update', { 
                                    detail: { user: fallbackData.user } 
                                }));
                                
                                // Clear processing flag
                                storage.removeItem('processing_login_return');
                                
                                location.reload(); // Force reload to update UI
                            } else {
                                console.log('❌ Still no user data from any source');
                                storage.removeItem('processing_login_return');
                            }
                        })
                        .catch(err => {
                            console.error('Error in fallback check:', err);
                            storage.removeItem('processing_login_return');
                        });
                    }
                })
                .catch(err => {
                    console.error('Error fetching user data:', err);
                    storage.removeItem('processing_login_return');
                });
            } else {
                console.log('✅ Found existing user data after login');
                storage.removeItem('processing_login_return');
                
                // Trigger UI update just to be safe
                try {
                    const user = JSON.parse(userData);
                    window.dispatchEvent(new CustomEvent('g2own:auth-update', { 
                        detail: { user: user } 
                    }));
                } catch (e) {
                    console.error('Error parsing existing user data:', e);
                }
            }
        }, 300);
    }
    
    // Block login redirects if we just tried one
    window.blockLoginRedirect = function() {
        const lastRedirectTime = storage.getItem('login_redirect_time');
        if (lastRedirectTime) {
            const timeSince = Date.now() - parseInt(lastRedirectTime);
            if (timeSince < 10000) { // 10 seconds
                console.log('⚠️ Blocking login redirect - too soon after previous redirect');
                return true;
            }
        }
        return false;
    };
    
    // Expose storage utility globally for other scripts
    window.safeStorage = storage;
    
    // Monkey patch all login handlers
    window.addEventListener('DOMContentLoaded', function() {
        // Override SessionBridge.redirectToLogin
        if (window.sessionBridge && window.sessionBridge.redirectToLogin) {
            const originalRedirect = window.sessionBridge.redirectToLogin;
            window.sessionBridge.redirectToLogin = function() {
                if (window.blockLoginRedirect()) {
                    console.log('🛑 Blocked sessionBridge redirect to login');
                    return false;
                }
                console.log('✅ Allowing sessionBridge redirect to login');
                storage.setItem('login_redirect_time', Date.now().toString());
                return originalRedirect.apply(this, arguments);
            };
        }
        
        // Try to find and override all login click handlers
        document.querySelectorAll('.login-button, .auth-button, [data-action="login"], #loginSignupBtn, #btn-auth-combined, #oauth-login-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                if (window.blockLoginRedirect()) {
                    console.log('🛑 Blocked login button click');
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
                console.log('✅ Allowing login button click');
                storage.setItem('login_redirect_time', Date.now().toString());
            }, true);
        });
    });
})();
