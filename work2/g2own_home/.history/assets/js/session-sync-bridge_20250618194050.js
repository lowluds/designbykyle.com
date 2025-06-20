/**
 * G2Own Session Synchronization Bridge
 * Synchronizes authentication between Invision Community and main site
 */
(function() {
    // Configuration
    const CONFIG = {
        checkInterval: 30000, // Check every 30 seconds
        community: {
            url: 'https://g2own.com/community/',
            sessionCheckUrl: 'https://g2own.com/community/session-check.php'
        },
        debug: true // Enable console logging
    };
    
    // Utility for logging
    const log = function(msg, data) {
        if (CONFIG.debug) {
            console.log(`🔄 SessionSync: ${msg}`, data || '');
        }
    };
    
    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function() {
        initSessionSync();
    });
    
    // Initialize session synchronization
    function initSessionSync() {
        log('Initializing session sync bridge');
        
        // Check if we have any authentication
        const hasLocalAuth = checkLocalAuth();
        
        // Should we force a sync check now?
        const shouldCheckNow = !hasLocalAuth || isReturnFromCommunity();
        
        if (shouldCheckNow) {
            log('Initial sync check starting immediately');
            syncCommunitySession();
        } else {
            log('Using cached authentication data');
        }
        
        // Set up periodic sync
        setInterval(syncCommunitySession, CONFIG.checkInterval);
    }
    
    // Check if we have any local authentication data
    function checkLocalAuth() {
        try {
            // Check all possible storage locations
            const storage = window.safeStorage || localStorage;
            
            // Try to get user data
            const userData = storage.getItem('g2own_user') || storage.getItem('oauth_user');
            
            if (!userData || userData === 'null' || userData === '{}') {
                log('No local authentication found');
                return false;
            }
            
            try {
                const user = JSON.parse(userData);
                if (!user || !user.id) {
                    log('Invalid user data format', user);
                    return false;
                }
                
                log('Found valid local authentication', {id: user.id, name: user.name});
                return true;
            } catch (e) {
                log('Error parsing user data', e);
                return false;
            }
        } catch (e) {
            log('Error checking local auth', e);
            return false;
        }
    }
    
    // Check if we're returning from community
    function isReturnFromCommunity() {
        try {
            const referrer = document.referrer;
            if (referrer && referrer.includes('/community/')) {
                log('Detected return from community', referrer);
                return true;
            }
        } catch (e) {
            // Ignore errors with referrer
        }
        return false;
    }
    
    // Synchronize with community session
    function syncCommunitySession() {
        log('Checking community session status');
        
        fetch(`${CONFIG.community.sessionCheckUrl}?sync=1&t=${Date.now()}`, {
            method: 'GET',
            credentials: 'include', // Include cookies
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            log('Session check response', data);
            
            if (data.success) {
                if (data.authenticated && data.user) {
                    // User is authenticated in community
                    handleAuthenticatedUser(data.user);
                } else {
                    // User is not authenticated in community
                    handleUnauthenticatedUser();
                }
            } else {
                log('Session check failed', data.error);
            }
        })
        .catch(error => {
            log('Error checking session', error);
        });
    }
    
    // Handle authenticated user
    function handleAuthenticatedUser(userData) {
        log('User is authenticated in community', userData);
        
        // Store user data
        const storage = window.safeStorage || localStorage;
        storage.setItem('g2own_user', JSON.stringify(userData));
        storage.setItem('oauth_user', JSON.stringify(userData));
        
        // Update UI to reflect logged-in state
        updateUILoginState(true, userData);
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('auth:updated', {
            detail: {
                isLoggedIn: true,
                userData: userData
            }
        }));
    }
    
    // Handle unauthenticated user
    function handleUnauthenticatedUser() {
        log('User is not authenticated in community');
        
        // Clear stored user data if exists
        const storage = window.safeStorage || localStorage;
        if (storage.getItem('g2own_user') || storage.getItem('oauth_user')) {
            storage.removeItem('g2own_user');
            storage.removeItem('oauth_user');
            
            // Update UI to reflect logged-out state
            updateUILoginState(false);
            
            // Dispatch event for other components
            window.dispatchEvent(new CustomEvent('auth:updated', {
                detail: {
                    isLoggedIn: false,
                    userData: null
                }
            }));
        }
    }
    
    // Update UI to reflect login state
    function updateUILoginState(isLoggedIn, userData = null) {
        try {
            log('Updating UI login state', { isLoggedIn, userData });
            
            // Update top navigation
            updateTopNavAuth(isLoggedIn, userData);
            
            // Update sidebar
            updateSidebarAuth(isLoggedIn, userData);
            
            // Update any other UI components
            if (isLoggedIn) {
                document.body.classList.add('user-logged-in');
                document.body.classList.remove('user-logged-out');
            } else {
                document.body.classList.add('user-logged-out');
                document.body.classList.remove('user-logged-in');
            }
        } catch (e) {
            log('Error updating UI', e);
        }
    }
    
    // Update top navigation auth state
    function updateTopNavAuth(isLoggedIn, userData = null) {
        try {
            // Get top nav elements
            const loginButton = document.querySelector('.login-button, [data-action="login"], #loginSignupBtn, #oauth-login-btn');
            const profileContainer = document.querySelector('.profile-container, .user-profile, #profileContainer');
            
            if (!loginButton && !profileContainer) {
                log('Top nav auth elements not found');
                return;
            }
            
            if (isLoggedIn && userData) {
                // Hide login button
                if (loginButton) loginButton.style.display = 'none';
                
                // Show profile
                if (profileContainer) {
                    profileContainer.style.display = 'flex';
                    
                    // Update profile data
                    const avatar = profileContainer.querySelector('.avatar, .profile-avatar, .user-avatar img');
                    const name = profileContainer.querySelector('.profile-name, .username, .user-name');
                    
                    if (avatar && userData.avatar) {
                        avatar.src = userData.avatar;
                    }
                    
                    if (name) {
                        name.textContent = userData.display_name || userData.name;
                    }
                }
                
                // Also try to update using session bridge
                if (window.sessionBridge) {
                    log('Updating sessionBridge with user data');
                    window.sessionBridge.currentUser = userData;
                    window.sessionBridge.isAuthenticated = true;
                    window.sessionBridge.updateMainSiteAuth(userData);
                }
                
                // Also update top nav auth if available
                if (window.topNavAuth) {
                    log('Updating topNavAuth with user data');
                    window.topNavAuth.updateAuthState(userData);
                }
            } else {
                // Show login button
                if (loginButton) loginButton.style.display = '';
                
                // Hide profile
                if (profileContainer) profileContainer.style.display = 'none';
                
                // Also try to update using session bridge
                if (window.sessionBridge) {
                    log('Clearing sessionBridge user data');
                    window.sessionBridge.currentUser = null;
                    window.sessionBridge.isAuthenticated = false;
                    window.sessionBridge.updateMainSiteLogout();
                }
                
                // Also update top nav auth if available
                if (window.topNavAuth) {
                    log('Clearing topNavAuth user data');
                    window.topNavAuth.updateAuthState(null);
                }
            }
        } catch (e) {
            log('Error updating top nav', e);
        }
    }
    
    // Update sidebar auth state
    function updateSidebarAuth(isLoggedIn, userData = null) {
        try {
            // Get sidebar elements
            const sidebarLoginButton = document.querySelector('.sidebar-login, [data-action="sidebar-login"], #btn-auth-combined');
            const sidebarProfile = document.querySelector('.sidebar-profile, .sidebar-user, .left-sidebar-user');
            
            if (!sidebarLoginButton && !sidebarProfile) {
                log('Sidebar auth elements not found');
                return;
            }
            
            if (isLoggedIn && userData) {
                // Hide login button
                if (sidebarLoginButton) sidebarLoginButton.style.display = 'none';
                
                // Show profile
                if (sidebarProfile) {
                    sidebarProfile.style.display = 'block';
                    sidebarProfile.classList.remove('hidden');
                    
                    // Update profile data
                    const avatar = sidebarProfile.querySelector('.avatar, .profile-avatar, .user-avatar img');
                    const name = sidebarProfile.querySelector('.profile-name, .username, .user-name');
                    
                    if (avatar && userData.avatar) {
                        avatar.src = userData.avatar;
                    }
                    
                    if (name) {
                        name.textContent = userData.display_name || userData.name;
                    }
                }
                
                // Update left sidebar controller if available
                if (window.leftSidebarController && typeof window.leftSidebarController.updateAuthState === 'function') {
                    log('Updating leftSidebarController with user data');
                    window.leftSidebarController.updateAuthState(userData);
                }
            } else {
                // Show login button
                if (sidebarLoginButton) sidebarLoginButton.style.display = '';
                
                // Hide profile
                if (sidebarProfile) {
                    sidebarProfile.style.display = 'none';
                    sidebarProfile.classList.add('hidden');
                }
                
                // Update left sidebar controller if available
                if (window.leftSidebarController && typeof window.leftSidebarController.updateAuthState === 'function') {
                    log('Clearing leftSidebarController user data');
                    window.leftSidebarController.updateAuthState(null);
                }
            }
        } catch (e) {
            log('Error updating sidebar', e);
        }
    }
    
    // Force a session sync now
    window.forceSessionSync = function() {
        log('Manual session sync triggered');
        syncCommunitySession();
    };
    
    // Export sync function to global scope
    window.syncCommunitySession = syncCommunitySession;
})();
