// OAuth Notifications Integration - DEMO VERSION
// Portfolio demonstration - no real API connections

class OAuthNotifications {
    constructor() {
        this.apiKey = null;
        this.baseUrl = '#'; // Disabled for portfolio demo
        this.notificationCache = null;
        this.lastFetchTime = 0;
        this.cacheTimeout = 60000; // 1 minute cache
    }

    /**
     * Initialize with OAuth API key - DEMO VERSION
     */
    init(apiKey) {
        this.apiKey = null; // Disabled for portfolio demo
        console.log('OAuth Notifications initialized (DEMO MODE)');
    }

    /**
     * Fetch notifications - DEMO VERSION (returns mock data)
     */
    async fetchNotifications() {
        // Return mock data for portfolio demonstration
        return { 
            unread_count: 3, 
            notifications: [
                { id: 1, title: 'Demo Notification 1', read: false },
                { id: 2, title: 'Demo Notification 2', read: false },
                { id: 3, title: 'Demo Notification 3', read: true }
            ] 
        };
    }

    /**
     * Mark notification as read - DEMO VERSION
     */
    async markAsRead(notificationId) {
        console.log('Demo: Marking notification as read:', notificationId);
        return true;
    }

    /**
     * Get notification count - DEMO VERSION
     */
    async getNotificationCount() {
        const data = await this.fetchNotifications();
        return data.unread_count;
    }

    /**
     * Clear cache - DEMO VERSION
     */
    clearCache() {
        this.notificationCache = null;
        this.lastFetchTime = 0;
    }

    /**
     * Update sidebar notification display - DEMO VERSION
     */
    updateSidebarNotification(count) {
        const badge = document.querySelector('.notification-dot, .notification-badge');
        if (badge) {
            badge.style.display = count > 0 ? 'block' : 'none';
            badge.textContent = count > 9 ? '9+' : count.toString();
        }
    }

    /**
     * Start polling for notifications - DEMO VERSION
     */
    startPolling(interval = 30000) {
        console.log('Demo: Notification polling disabled for portfolio');
    }

    /**
     * Stop polling - DEMO VERSION
     */
    stopPolling() {
        console.log('Demo: Stopping notification polling');
    }

    /**
     * Cleanup - DEMO VERSION
     */
    destroy() {
        this.stopPolling();
        this.clearCache();
    }
}

// Initialize global instance - DEMO VERSION
window.oauthNotifications = new OAuthNotifications();

// Auto-initialize when DOM is ready - DEMO VERSION
document.addEventListener('DOMContentLoaded', function() {
    console.log('OAuth Notifications: Demo mode - no real connections');
});

// Listen for login events - DEMO VERSION
document.addEventListener('login-success', function(e) {
    console.log('Demo: Login success event received - no action taken');
});

// Listen for logout events - DEMO VERSION
document.addEventListener('logout', function() {
    console.log('Demo: Logout event received - no action taken');
});
