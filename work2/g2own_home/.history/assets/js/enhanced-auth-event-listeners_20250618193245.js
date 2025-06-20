/**
 * Enhanced Auth Event Listeners
 * Listens for authentication events across the site
 */
(function() {
    // Listen for auth updates
    window.addEventListener('auth:updated', function(event) {
        const { isLoggedIn, userData } = event.detail;
        console.log('🔐 Auth updated:', { isLoggedIn, userData: userData ? { id: userData.id, name: userData.name } : null });
        
        // You could trigger other actions here based on auth changes
        // For example, refreshing cart data, showing personalized content, etc.
    });
    
    // Force check auth on page visibility change
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            console.log('🔍 Page became visible, checking auth status');
            setTimeout(function() {
                if (window.syncCommunitySession) {
                    window.syncCommunitySession();
                }
            }, 1000);
        }
    });
    
    // Also check when window gains focus
    window.addEventListener('focus', function() {
        console.log('🔍 Window gained focus, checking auth status');
        setTimeout(function() {
            if (window.syncCommunitySession) {
                window.syncCommunitySession();
            }
        }, 1000);
    });
    
    // Check if we're returning from the community site
    if (document.referrer && document.referrer.includes('/community/')) {
        console.log('🔄 Detected return from community, forcing session sync');
        setTimeout(function() {
            if (window.syncCommunitySession) {
                window.syncCommunitySession();
            }
        }, 500);
    }
    
    // Add a sync button in development/test environments
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' || 
        window.location.search.includes('debug=true')) {
        
        const syncButton = document.createElement('button');
        syncButton.id = 'syncSessionBtn';
        syncButton.textContent = 'Sync Session';
        syncButton.title = 'Force synchronize authentication session';
        syncButton.style.cssText = 'position: fixed; bottom: 10px; right: 10px; z-index: 9999; padding: 5px 10px; background: #333; color: white; border: none; border-radius: 5px; cursor: pointer;';
        
        syncButton.addEventListener('click', function() {
            if (window.forceSessionSync) {
                window.forceSessionSync();
                this.textContent = 'Syncing...';
                setTimeout(() => {
                    this.textContent = 'Sync Session';
                }, 2000);
            }
        });
        
        document.addEventListener('DOMContentLoaded', function() {
            document.body.appendChild(syncButton);
        });
    }
})();
