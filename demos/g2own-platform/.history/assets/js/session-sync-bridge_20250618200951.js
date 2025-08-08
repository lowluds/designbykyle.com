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
            sessionCheckUrl: 'https://g2own.com/community/session-check-enhanced.php', // Use enhanced version
            fallbackSessionCheckUrl: 'https://g2own.com/community/session-check.php'
        },
        debug: true, // Enable console logging
        forceCheckOnLoad: true, // Always check on page load
        uiSelectors: {
            loginButtons: '#oauth-login-btn, .login-signup-btn, .auth-button',
            profileContainers: '#profileContainer, .profile-container, .nav-profile',
            usernames: '.username, .profile-name, .user-name',
            avatars: '.profile-avatar, .avatar, .user-avatar img',
            logoutButtons: '#oauth-logout-btn, .logout-button, .logout-link, .logout-item'
        }
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
        const shouldCheckNow = CONFIG.forceCheckOnLoad || !hasLocalAuth || isReturnFromCommunity();
        
        if (shouldCheckNow) {
            log('Initial sync check starting immediately');
            syncCommunitySession();
        } else {
            log('Using cached authentication data');
            // Still update UI based on cached data
            const storage = window.safeStorage || localStorage;
            try {
                const userData = storage.getItem('g2own_user');
                if (userData) {
                    const user = JSON.parse(userData);
                    updateUILoginState(true, user);
                }
            } catch (e) {
                log('Error using cached auth', e);
            }
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
            
            // Also check URL parameters for login=success
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('login') === 'success' || urlParams.has('auth')) {
                log('Detected login success parameters');
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
        
        // Determine which endpoint to use - enhanced or fallback
        const endpointUrl = navigator.cookieEnabled 
            ? CONFIG.community.sessionCheckUrl 
            : CONFIG.community.fallbackSessionCheckUrl;
            
        fetch(`${endpointUrl}?sync=1&t=${Date.now()}`, {
            method: 'GET',
            credentials: 'include', // Include cookies
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Cache-Control': 'no-cache, no-store' // Prevent caching
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Session check failed with status: ${response.status}`);
            }
            return response.json();
        })
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
                
                // Try fallback if using enhanced endpoint
                if (endpointUrl === CONFIG.community.sessionCheckUrl) {
                    log('Trying fallback session check endpoint');
                    tryFallbackSessionCheck();
                }
            }
        })
        .catch(error => {
            log('Error checking session', error);
            
            // Try fallback if using enhanced endpoint
            if (endpointUrl === CONFIG.community.sessionCheckUrl) {
                log('Trying fallback session check endpoint after error');
                tryFallbackSessionCheck();
            }
        });
    }
    
    // Fallback session check when enhanced fails
    function tryFallbackSessionCheck() {
        fetch(`${CONFIG.community.fallbackSessionCheckUrl}?sync=1&t=${Date.now()}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Cache-Control': 'no-cache, no-store'
            }
        })
        .then(response => response.json())
        .then(data => {
            log('Fallback session check response', data);
            
            if (data.success) {
                if (data.authenticated && data.user) {
                    handleAuthenticatedUser(data.user);
                } else {
                    handleUnauthenticatedUser();
                }
            }
        })
        .catch(error => {
            log('Error in fallback session check', error);
        });
    }
    
    // Handle authenticated user
    function handleAuthenticatedUser(userData) {
        log('User is authenticated in community', userData);
        
        // Store user data in multiple locations for redundancy
        const storage = window.safeStorage || localStorage;
        
        // First try safeStorage which has multiple fallbacks
        if (window.safeStorage) {
            window.safeStorage.setItem('g2own_user', JSON.stringify(userData));
            window.safeStorage.setItem('oauth_user', JSON.stringify(userData));
            window.safeStorage.setItem('last_auth_check', Date.now().toString());
        } else {
            // Fallback to direct storage access with try/catch
            try {
                localStorage.setItem('g2own_user', JSON.stringify(userData));
                localStorage.setItem('oauth_user', JSON.stringify(userData));
                localStorage.setItem('last_auth_check', Date.now().toString());
            } catch (e) {
                log('Error storing in localStorage, trying sessionStorage', e);
                try {
                    sessionStorage.setItem('g2own_user', JSON.stringify(userData));
                    sessionStorage.setItem('oauth_user', JSON.stringify(userData));
                    sessionStorage.setItem('last_auth_check', Date.now().toString());
                } catch (e2) {
                    log('Error storing in sessionStorage', e2);
                    // Last resort: memory storage
                    if (window._memoryStorage) {
                        window._memoryStorage['g2own_user'] = JSON.stringify(userData);
                        window._memoryStorage['oauth_user'] = JSON.stringify(userData);
                        window._memoryStorage['last_auth_check'] = Date.now().toString();
                    }
                }
            }
        }
        
        // Update UI to reflect logged-in state
        updateUILoginState(true, userData);
        
        // Update session bridge if available
        if (window.sessionBridge) {
            window.sessionBridge.currentUser = userData;
            window.sessionBridge.isAuthenticated = true;
            window.sessionBridge.lastUserId = userData.id;
            window.sessionBridge.updateMainSiteAuth(userData);
        }
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('auth:updated', {
            detail: {
                isLoggedIn: true,
                userData: userData
            }
        }));
        
        // Also dispatch the global login event
        window.dispatchEvent(new CustomEvent('g2own:auth-update', {
            detail: { user: userData }
        }));
    }
    
    // Handle unauthenticated user
    function handleUnauthenticatedUser() {
        log('User is not authenticated in community');
        
        // Check if we previously had user data
        const storage = window.safeStorage || localStorage;
        let hadPreviousAuth = false;
        
        try {
            // Check if we had auth before
            hadPreviousAuth = !!storage.getItem('g2own_user') || !!storage.getItem('oauth_user');
            
            // Clear stored user data across all storage mechanisms
            if (window.safeStorage) {
                window.safeStorage.removeItem('g2own_user');
                window.safeStorage.removeItem('oauth_user');
            } else {
                // Try localStorage
                try {
                    localStorage.removeItem('g2own_user');
                    localStorage.removeItem('oauth_user');
                } catch (e) {
                    log('Error removing from localStorage', e);
                }
                
                // Try sessionStorage
                try {
                    sessionStorage.removeItem('g2own_user');
                    sessionStorage.removeItem('oauth_user');
                } catch (e) {
                    log('Error removing from sessionStorage', e);
                }
                
                // Try memory storage
                if (window._memoryStorage) {
                    delete window._memoryStorage['g2own_user'];
                    delete window._memoryStorage['oauth_user'];
                }
            }
        } catch (e) {
            log('Error handling unauthenticated state', e);
        }
        
        // Update UI to reflect logged-out state
        updateUILoginState(false);
        
        // Update session bridge if available
        if (window.sessionBridge) {
            window.sessionBridge.currentUser = null;
            window.sessionBridge.isAuthenticated = false;
            window.sessionBridge.updateMainSiteLogout();
        }
        
        // Only dispatch logout event if we had previous auth
        if (hadPreviousAuth) {
            // Dispatch event for other components
            window.dispatchEvent(new CustomEvent('auth:updated', {
                detail: {
                    isLoggedIn: false,
                    userData: null
                }
            }));
            
            // Also dispatch the global logout event
            window.dispatchEvent(new CustomEvent('g2own:auth-logout'));
        }
    }
      // Update UI to reflect login state
    function updateUILoginState(isLoggedIn, userData = null) {
        try {
            log('Updating UI login state', { isLoggedIn, userData });
            
            // Use selectors from config
            const selectors = CONFIG.uiSelectors;
            
            // 1. Find all login buttons
            const loginButtons = document.querySelectorAll(selectors.loginButtons);
            log(`Found ${loginButtons.length} login buttons`);
            
            // 2. Find all profile containers
            const profileContainers = document.querySelectorAll(selectors.profileContainers);
            log(`Found ${profileContainers.length} profile containers`);
            
            // 3. Find all logout buttons
            const logoutButtons = document.querySelectorAll(selectors.logoutButtons);
            log(`Found ${logoutButtons.length} logout buttons`);
            
            // If we found no elements, create them dynamically
            if (loginButtons.length === 0 && profileContainers.length === 0) {
                log('No auth UI elements found - creating them');
                createAuthUIElements();
                
                // Re-query after creation
                const newLoginButtons = document.querySelectorAll(selectors.loginButtons);
                const newProfileContainers = document.querySelectorAll(selectors.profileContainers);
                
                if (newLoginButtons.length || newProfileContainers.length) {
                    log('Successfully created auth UI elements');
                }
            }
            
            // Update login buttons visibility
            loginButtons.forEach(button => {
                if (isLoggedIn) {
                    button.style.display = 'none';
                    button.classList.add('hidden');
                } else {
                    button.style.display = '';
                    button.classList.remove('hidden');
                }
            });
            
            // Update profile containers
            profileContainers.forEach(container => {
                if (isLoggedIn && userData) {
                    container.style.display = '';
                    container.classList.remove('hidden');
                    
                    // Find and update username
                    const usernameEls = container.querySelectorAll(selectors.usernames);
                    usernameEls.forEach(el => {
                        el.textContent = userData.display_name || userData.name;
                    });
                    
                    // Find and update avatar
                    const avatarEls = container.querySelectorAll(selectors.avatars);
                    avatarEls.forEach(el => {
                        if (userData.avatar) {
                            el.src = userData.avatar;
                            el.alt = userData.display_name || userData.name;
                        }
                    });
                } else {
                    container.style.display = 'none';
                    container.classList.add('hidden');
                }
            });
            
            // Update logout buttons functionality
            logoutButtons.forEach(button => {
                // Ensure logout button has click handler
                if (isLoggedIn && !button._hasLogoutHandler) {
                    button._hasLogoutHandler = true;
                    button.addEventListener('click', function(e) {
                        e.preventDefault();
                        if (window.sessionBridge && window.sessionBridge.globalLogout) {
                            window.sessionBridge.globalLogout();
                        } else {
                            // Fallback logout via community
                            window.location.href = CONFIG.community.url + 'logout/';
                        }
                    });
                }
            });
            
            // Add body classes
            if (isLoggedIn) {
                document.body.classList.add('user-logged-in');
                document.body.classList.remove('user-logged-out');
            } else {
                document.body.classList.add('user-logged-out');
                document.body.classList.remove('user-logged-in');
            }
            
            // Custom handling for top nav
            updateTopNavAuth(isLoggedIn, userData);
            
            // Custom handling for sidebar
            updateSidebarAuth(isLoggedIn, userData);
        } catch (e) {
            log('Error updating UI', e);
        }
    }

    // Create auth UI elements if they don't exist
    function createAuthUIElements() {
        try {
            // Find the navigation container
            const navContainer = document.querySelector('.navbar-nav, .nav, header nav, .navigation');
            
            if (!navContainer) {
                console.log('❌ Cannot find navigation container');
                return;
            }
            
            console.log('✅ Found navigation container:', navContainer);
            
            // Create login/signup button if it doesn't exist
            if (!document.querySelector('.login-button, [data-action="login"]')) {
                const loginButton = document.createElement('button');
                loginButton.className = 'login-button';
                loginButton.setAttribute('data-action', 'login');
                loginButton.innerHTML = 'Login / Sign Up';
                loginButton.onclick = function() {
                    if (window.sessionBridge && window.sessionBridge.redirectToLogin) {
                        window.sessionBridge.redirectToLogin();
                    } else {
                        window.location.href = '/community/login/';
                    }
                };
                navContainer.appendChild(loginButton);
                console.log('✅ Created login button');
            }
            
            // Create profile container if it doesn't exist
            if (!document.querySelector('.profile-container, .user-profile')) {
                const profileContainer = document.createElement('div');
                profileContainer.className = 'profile-container';
                profileContainer.style.display = 'none';
                
                // Create avatar
                const avatar = document.createElement('img');
                avatar.className = 'avatar';
                avatar.src = '/assets/images/default-avatar.png';
                avatar.alt = 'User Avatar';
                
                // Create username
                const username = document.createElement('span');
                username.className = 'username';
                username.textContent = 'User';
                
                // Add elements to container
                profileContainer.appendChild(avatar);
                profileContainer.appendChild(username);
                
                // Add dropdown menu
                const dropdownMenu = document.createElement('div');
                dropdownMenu.className = 'profile-dropdown';
                dropdownMenu.innerHTML = `
                    <ul>
                        <li><a href="/community/profile/">My Profile</a></li>
                        <li><a href="/community/settings/">Settings</a></li>
                        <li><a href="#" class="logout-link">Logout</a></li>
                    </ul>
                `;
                profileContainer.appendChild(dropdownMenu);
                
                // Add event listener to logout link
                const logoutLink = dropdownMenu.querySelector('.logout-link');
                if (logoutLink) {
                    logoutLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        if (window.sessionBridge && window.sessionBridge.globalLogout) {
                            window.sessionBridge.globalLogout();
                        } else {
                            window.location.href = '/community/logout/';
                        }
                    });
                }
                
                // Add to navigation
                navContainer.appendChild(profileContainer);
                console.log('✅ Created profile container');
            }
        } catch (e) {
            console.error('Error creating auth UI elements:', e);
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

    // Debug function to inspect the page structure
    window.debugAuthUI = function() {
        console.log('🔍 Debugging Auth UI Elements:');
        
        // Check header/nav structure
        const header = document.querySelector('header');
        console.log('Header:', header);
        
        const navs = document.querySelectorAll('nav, .navbar, .navigation');
        console.log('Navigation areas:', navs.length, navs);
        
        // Check for login buttons
        const loginButtons = Array.from(document.querySelectorAll('button, a, div, span')).filter(el => {
            const text = (el.textContent || '').toLowerCase();
            return text.includes('login') || text.includes('sign in') || text.includes('sign up');
        });
        console.log('Possible login elements by text:', loginButtons.length, loginButtons);
        
        // Check for user elements
        const userElements = document.querySelectorAll('[class*="user"], [class*="profile"], [class*="account"]');
        console.log('User-related elements:', userElements.length, userElements);
        
        // Check body classes
        console.log('Body classes:', document.body.className);
        
        // Return recommendations
        return {
            loginButtonSelector: suggestLoginButtonSelector(),
            profileContainerSelector: suggestProfileContainerSelector()
        };
    };

    // Suggest a selector for login button based on page structure
    function suggestLoginButtonSelector() {
        const possibilities = [];
        
        Array.from(document.querySelectorAll('button, a, div, span')).forEach(el => {
            const text = (el.textContent || '').toLowerCase();
            if (text.includes('login') || text.includes('sign in') || text.includes('sign up')) {
                let selector = el.tagName.toLowerCase();
                
                if (el.id) {
                    selector += '#' + el.id;
                } else if (el.className) {
                    selector += '.' + el.className.split(' ')[0];
                }
                
                possibilities.push(selector);
            }
        });
        
        return possibilities;
    }

    // Suggest a selector for profile container based on page structure
    function suggestProfileContainerSelector() {
        const possibilities = [];
        
        document.querySelectorAll('[class*="user"], [class*="profile"], [class*="account"]').forEach(el => {
            let selector = el.tagName.toLowerCase();
            
            if (el.id) {
                selector += '#' + el.id;
            } else if (el.className) {
                selector += '.' + el.className.split(' ')[0];
            }
            
            possibilities.push(selector);
        });
        
        return possibilities;
    }
    
    // Export debugging function globally
    window.inspectAuthUI = window.debugAuthUI;
})();
