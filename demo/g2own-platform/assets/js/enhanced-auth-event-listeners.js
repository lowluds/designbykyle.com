/**
 * Enhanced Auth Event Listeners
 * Listens for authentication events across the site and ensures UI stays in sync
 */
(function() {
    // Configuration
    const CONFIG = {
        debug: true,
        checkOnVisibility: true,
        checkOnFocus: true,
        checkOnCommunityReturn: true,
        minCheckInterval: 1000, // Minimum time between checks (ms)
        visibilityDelay: 500,  // Delay before checking after visibility change (ms)
        focusDelay: 800,       // Delay before checking after focus (ms)
        returnDelay: 300,      // Delay before checking after return from community (ms)
    };
    
    // Utility for logging
    const log = function(msg, data) {
        if (CONFIG.debug) {
            console.log(`🔐 AuthEvents: ${msg}`, data || '');
        }
    };
    
    // Track last check time to prevent too frequent checks
    let lastCheckTime = 0;
    
    // Function to check if we should run a check based on time
    function shouldCheck() {
        const now = Date.now();
        if (now - lastCheckTime < CONFIG.minCheckInterval) {
            log(`Check skipped - too soon (${now - lastCheckTime}ms)`);
            return false;
        }
        lastCheckTime = now;
        return true;
    }
    
    // Function to trigger auth check
    function triggerAuthCheck(reason) {
        if (!shouldCheck()) return;
        
        log(`Triggering auth check: ${reason}`);
        
        // Try session sync bridge first
        if (window.syncCommunitySession) {
            log('Using syncCommunitySession');
            window.syncCommunitySession();
        } 
        // Then try session bridge
        else if (window.sessionBridge && window.sessionBridge.checkSession) {
            log('Using sessionBridge.checkSession');
            window.sessionBridge.checkSession();
        }
        // Finally try forcing UI update based on stored data
        else {
            log('No sync methods found, trying direct UI update');
            const storage = window.safeStorage || localStorage;
            try {
                const userData = storage.getItem('g2own_user') || storage.getItem('oauth_user');
                if (userData && userData !== 'null' && userData !== '{}') {
                    const user = JSON.parse(userData);
                    log('Found user data in storage, updating UI', user);
                    
                    // Dispatch auth update event
                    window.dispatchEvent(new CustomEvent('g2own:auth-update', {
                        detail: { user: user }
                    }));
                } else {
                    log('No user data found in storage');
                }
            } catch (e) {
                log('Error updating UI from storage', e);
            }
        }
    }
    
    // Listen for auth updates
    window.addEventListener('auth:updated', function(event) {
        const { isLoggedIn, userData } = event.detail;
        log('Auth updated event received', { 
            isLoggedIn, 
            userData: userData ? { id: userData.id, name: userData.name } : null 
        });
        
        // Update body classes to reflect login state
        if (isLoggedIn) {
            document.body.classList.add('user-logged-in');
            document.body.classList.remove('user-logged-out');
        } else {
            document.body.classList.add('user-logged-out');
            document.body.classList.remove('user-logged-in');
        }
        
        // Update any login buttons that might not have been updated
        if (isLoggedIn) {
            document.querySelectorAll('#oauth-login-btn, .login-signup-btn, .auth-button').forEach(button => {
                button.style.display = 'none';
                button.classList.add('hidden');
            });
            
            document.querySelectorAll('#profileContainer, .profile-container, .user-profile').forEach(container => {
                container.style.display = '';
                container.classList.remove('hidden');
            });
        }
    });
    
    // Also listen for the global auth events
    window.addEventListener('g2own:auth-update', function(event) {
        const userData = event.detail.user;
        log('Global auth update received', userData ? { id: userData.id, name: userData.name } : null);
    });
    
    window.addEventListener('g2own:auth-logout', function() {
        log('Global auth logout received');
        document.body.classList.add('user-logged-out');
        document.body.classList.remove('user-logged-in');
    });
    
    // Force check auth on page visibility change
    if (CONFIG.checkOnVisibility) {
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'visible') {
                log('Page became visible, scheduling auth check');
                setTimeout(function() {
                    triggerAuthCheck('visibility change');
                }, CONFIG.visibilityDelay);
            }
        });
    }
    
    // Also check when window gains focus
    if (CONFIG.checkOnFocus) {
        window.addEventListener('focus', function() {
            log('Window gained focus, scheduling auth check');
            setTimeout(function() {
                triggerAuthCheck('window focus');
            }, CONFIG.focusDelay);
        });
    }
    
    // Check if we're returning from the community site
    if (CONFIG.checkOnCommunityReturn && document.referrer && document.referrer.includes('/community/')) {
        log('Detected return from community, scheduling session sync');
        setTimeout(function() {
            triggerAuthCheck('community return');
        }, CONFIG.returnDelay);
    }
    
    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        log('Enhanced auth event listeners initialized');
        
        // Trigger initial auth check after a short delay
        setTimeout(function() {
            triggerAuthCheck('initial load');
        }, 1500);
    });
})();
