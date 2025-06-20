/*!
 * G2Own Sidebar Data Controller
 * Handles dynamic data for sidebar elements (wishlist, orders, etc.)
 */

class SidebarDataController {
    constructor() {
        this.api = window.g2ownAPI || new G2OwnAPI();
        this.updateInterval = 30000; // Update every 30 seconds
        this.intervalId = null;
        this.isUpdating = false;
    }

    /**
     * Initialize the sidebar data controller
     */
    init() {
        console.log('🔧 Initializing Sidebar Data Controller...');
        
        // Initial load
        this.loadSidebarData();
        
        // Set up periodic updates
        this.startPeriodicUpdates();
        
        // Listen for auth state changes
        document.addEventListener('authStateChanged', () => {
            this.loadSidebarData();
        });
        
        // Listen for manual refresh requests
        document.addEventListener('refreshSidebarData', () => {
            this.loadSidebarData();
        });
    }

    /**
     * Load all sidebar data
     */
    async loadSidebarData() {
        if (this.isUpdating) return;
        
        this.isUpdating = true;
        
        try {
            // Check if user is authenticated
            const isAuthenticated = await this.api.checkAuth();
            
            if (isAuthenticated) {
                await Promise.all([
                    this.updateWishlistCount(),
                    this.updateOrdersCount()
                ]);
            } else {
                // Hide badges for unauthenticated users
                this.hideBadges();
            }
        } catch (error) {
            console.warn('⚠️ Failed to load sidebar data:', error);
            this.hideBadges();
        } finally {
            this.isUpdating = false;
        }
    }

    /**
     * Update wishlist count
     */
    async updateWishlistCount() {
        try {
            // For Invision Community, we'll need to call a custom endpoint or use a content API
            // This is a placeholder - you'll need to implement the actual API call based on IC structure
            const response = await this.api.makeRequest('/core/items?type=wishlist&count=true');
            
            if (response && response.totalResults !== undefined) {
                this.updateBadge('wishlist-count', response.totalResults);
            } else {
                // Fallback: try to get from user profile custom fields
                const profile = await this.api.makeRequest('/core/me');
                if (profile && profile.customFields && profile.customFields.wishlist_count) {
                    this.updateBadge('wishlist-count', profile.customFields.wishlist_count);
                }
            }
        } catch (error) {
            console.warn('⚠️ Failed to update wishlist count:', error);
            // For now, hide the badge if we can't get the data
            this.hideBadge('wishlist-count');
        }
    }

    /**
     * Update orders count
     */
    async updateOrdersCount() {
        try {
            // For Invision Community, orders might be stored as commerce items or custom content
            const response = await this.api.makeRequest('/core/items?type=orders&status=pending&count=true');
            
            if (response && response.totalResults !== undefined) {
                this.updateBadge('orders-count', response.totalResults);
            } else {
                // Fallback: try to get from user profile
                const profile = await this.api.makeRequest('/core/me');
                if (profile && profile.customFields && profile.customFields.pending_orders_count) {
                    this.updateBadge('orders-count', profile.customFields.pending_orders_count);
                }
            }
        } catch (error) {
            console.warn('⚠️ Failed to update orders count:', error);
            this.hideBadge('orders-count');
        }
    }

    /**
     * Update a badge with a count
     */
    updateBadge(badgeId, count) {
        const badge = document.getElementById(badgeId);
        if (!badge) return;

        const numCount = parseInt(count) || 0;
        
        if (numCount > 0) {
            badge.textContent = numCount > 99 ? '99+' : numCount.toString();
            badge.style.display = 'inline-block';
            
            // Add 'new' class for orders if count > 0
            if (badgeId === 'orders-count') {
                badge.classList.add('new');
            }
        } else {
            badge.style.display = 'none';
            badge.classList.remove('new');
        }
    }

    /**
     * Hide a specific badge
     */
    hideBadge(badgeId) {
        const badge = document.getElementById(badgeId);
        if (badge) {
            badge.style.display = 'none';
            badge.classList.remove('new');
        }
    }

    /**
     * Hide all badges
     */
    hideBadges() {
        this.hideBadge('wishlist-count');
        this.hideBadge('orders-count');
    }

    /**
     * Start periodic updates
     */
    startPeriodicUpdates() {
        this.stopPeriodicUpdates(); // Clear any existing interval
        
        this.intervalId = setInterval(() => {
            this.loadSidebarData();
        }, this.updateInterval);
    }

    /**
     * Stop periodic updates
     */
    stopPeriodicUpdates() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * Destroy the controller
     */
    destroy() {
        this.stopPeriodicUpdates();
        document.removeEventListener('authStateChanged', this.loadSidebarData);
        document.removeEventListener('refreshSidebarData', this.loadSidebarData);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sidebarDataController = new SidebarDataController();
        window.sidebarDataController.init();
    });
} else {
    window.sidebarDataController = new SidebarDataController();
    window.sidebarDataController.init();
}

// Expose for external access
window.SidebarDataController = SidebarDataController;
