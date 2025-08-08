/**
 * Redirect Lock - Prevents redirect loops
 */
(function() {
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
    const getStorage = function() {
        if (storageAvailable) {
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
    };

    // Use our storage wrapper instead of direct localStorage
    const storage = getStorage();
    
    // Check if we're being redirected in a loop
    const url = new URL(window.location.href);
    const hasLoginSuccess = url.searchParams.has('login') && url.searchParams.get('login') === 'success';
    
    // If we're coming back with login=success
    if (hasLoginSuccess) {
        console.log('✅ Login success detected, processing...');
        
        // Clear the URL parameter
        url.searchParams.delete('login');
        window.history.replaceState({}, document.title, url.toString());
        
        // Check if we have user data
        setTimeout(() => {
            const userData = storage.getItem('g2own_user') || storage.getItem('oauth_user');
            if (!userData || userData === '{}' || userData === 'null') {
                console.log('⚠️ No user data found after login success, fetching...');
                // Force fetch user data
                fetch('/community/session-check.php?force=1')
                    .then(response => response.json())
                    .then(data => {
                        if (data.authenticated && data.user) {
                            console.log('✅ Got user data from force check:', data.user);
                            storage.setItem('g2own_user', JSON.stringify(data.user));
                            storage.setItem('oauth_user', JSON.stringify(data.user));
                            // Force UI update
                            window.dispatchEvent(new CustomEvent('g2own:auth-update', { detail: { user: data.user } }));
                            location.reload(); // Force reload to update UI
                        } else {
                            console.log('❌ Still no user data, user might not be logged in');
                        }
                    })
                    .catch(err => console.error('Error fetching user data:', err));
            }
        }, 500);
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
