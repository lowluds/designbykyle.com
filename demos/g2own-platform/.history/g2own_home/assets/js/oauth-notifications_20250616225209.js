// OAuth Notifications Integration
// Integrates with Invision Community notification system

class OAuthNotifications {
    constructor() {
        this.apiKey = null;
        this.baseUrl = 'https://g2own.com/community/api';
        this.notificationCache = null;
        this.lastFetchTime = 0;
        this.cacheTimeout = 60000; // 1 minute cache
    }

    /**
     * Initialize with OAuth API key
     */
    init(apiKey) {
        this.apiKey = apiKey;
        console.log('OAuth Notifications initialized');
    }

    /**
     * Fetch notifications from Invision Community
     */
    async fetchNotifications() {
        if (!this.apiKey) {
            return { unread_count: 0, notifications: [] };
        }

        // Use cache if still valid
        const now = Date.now();
        if (this.notificationCache && (now - this.lastFetchTime) < this.cacheTimeout) {
            return this.notificationCache;
        }

        try {
            const response = await fetch(`${this.baseUrl}/core/me/notifications`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            
            // Process notifications data
            const notifications = data.results || [];
            const unreadCount = notifications.filter(n => !n.read).length;

            this.notificationCache = {
                unread_count: unreadCount,
                notifications: notifications,
                total_count: notifications.length
            };
            
            this.lastFetchTime = now;
            
            console.log(`Fetched ${unreadCount} unread notifications`);
            return this.notificationCache;

        } catch (error) {
            console.error('Error fetching notifications:', error);
            return { unread_count: 0, notifications: [] };
        }
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId) {
        if (!this.apiKey) return false;

        try {
            const response = await fetch(`${this.baseUrl}/core/me/notifications/${notificationId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ read: true })
            });

            if (response.ok) {
                // Clear cache to force refresh
                this.notificationCache = null;
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return false;
        }
    }

    /**
     * Get notification count only (faster than full fetch)
     */
    async getNotificationCount() {
        const data = await this.fetchNotifications();
        return data.unread_count || 0;
    }

    /**
     * Clear cache and force refresh
     */
    clearCache() {
        this.notificationCache = null;
        this.lastFetchTime = 0;
    }

    /**
     * Update sidebar notification dot
     */
    updateSidebarNotification(count) {
        if (window.leftSidebarController) {
            window.leftSidebarController.updateNotificationCount(count);
        }
    }

    /**
     * Start periodic notification checking
     */
    startPolling(interval = 30000) {
        this.stopPolling(); // Clear any existing interval
        
        this.pollingInterval = setInterval(async () => {
            const count = await this.getNotificationCount();
            this.updateSidebarNotification(count);
        }, interval);
    }

    /**
     * Stop notification polling
     */
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        this.stopPolling();
        this.clearCache();
    }
}

// Create global instance
window.oauthNotifications = new OAuthNotifications();

// Auto-start when OAuth manager is available
document.addEventListener('DOMContentLoaded', () => {
    // Check for OAuth manager and start notifications
    const checkOAuth = () => {
        if (window.oauthManager && window.oauthManager.isAuthenticated()) {
            const apiKey = localStorage.getItem('oauth_api_key');
            if (apiKey) {
                window.oauthNotifications.init(apiKey);
                window.oauthNotifications.startPolling();
            }
        }
    };

    // Initial check
    setTimeout(checkOAuth, 1000);

    // Listen for authentication events
    document.addEventListener('oauth:authenticated', (e) => {
        const apiKey = e.detail?.apiKey || localStorage.getItem('oauth_api_key');
        if (apiKey) {
            window.oauthNotifications.init(apiKey);
            window.oauthNotifications.startPolling();
        }
    });

    document.addEventListener('oauth:logout', () => {
        window.oauthNotifications.stopPolling();
        window.oauthNotifications.updateSidebarNotification(0);
    });
});
