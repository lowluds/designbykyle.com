/*!
 * G2Own Navigation Helpers
 * Provides seamless navigation between main site and community
 */

class NavigationHelper {
    constructor() {
        this.communityDomain = 'https://g2own.com/community';
        this.mainDomain = 'https://g2own.com';
        
        this.init();
    }

    init() {
        this.setupNavigationEvents();
        this.updateNavigationLinks();
        console.log('Navigation helper initialized');
    }

    setupNavigationEvents() {
        // Handle navigation clicks
        document.addEventListener('click', (event) => {
            const target = event.target.closest('[data-nav-target]');
            if (target) {
                event.preventDefault();
                this.handleNavigation(target.dataset.navTarget, target.dataset.navParams);
            }
        });

        // Handle auth-required actions
        document.addEventListener('click', (event) => {
            const target = event.target.closest('[data-auth-required]');
            if (target && !this.isAuthenticated()) {
                event.preventDefault();
                this.requireLogin();
            }
        });
    }

    updateNavigationLinks() {
        // Update nav links to point to correct destinations
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const section = link.dataset.section;
            if (section) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.navigateToSection(section);
                });
            }
        });
    }

    navigateToSection(section) {
        switch (section) {
            case 'community':
            case 'forum':
            case 'discussions':
                this.redirectToCommunity();
                break;
            
            case 'login':
                this.redirectToLogin();
                break;
            
            case 'register':
            case 'signup':
                this.redirectToRegister();
                break;
            
            case 'profile':
                this.redirectToProfile();
                break;
            
            case 'settings':
                this.redirectToSettings();
                break;
            
            case 'marketplace':
                // Stay on main site, scroll to marketplace section
                this.scrollToElement('#marketplace');
                break;
            
            case 'games':
                this.scrollToElement('#games');
                break;
              case 'software':
                this.scrollToElement('#software');
                break;
            
            case 'about':
                this.scrollToElement('#about');
                break;
            
            case 'hero':
            case 'home':
                this.scrollToTop();
                break;
            
            default:
                // Try to find element on current page
                const element = document.getElementById(section);
                if (element) {
                    this.scrollToElement(`#${section}`);
                } else {
                    console.warn(`Unknown navigation section: ${section}`);
                }
        }
    }

    handleNavigation(target, params = null) {
        const parsedParams = params ? JSON.parse(params) : {};
        
        switch (target) {
            case 'community-login':
                this.redirectToLogin(parsedParams.returnUrl);
                break;
            
            case 'community-register':
                this.redirectToRegister(parsedParams.returnUrl);
                break;
            
            case 'community-profile':
                this.redirectToProfile(parsedParams.userId);
                break;
            
            case 'community-messages':
                this.redirectToMessages();
                break;
            
            case 'community-settings':
                this.redirectToSettings();
                break;
            
            case 'marketplace-category':
                this.navigateToMarketplaceCategory(parsedParams.category);
                break;
            
            case 'product-details':
                this.navigateToProduct(parsedParams.productId);
                break;
        }
    }

    // Community redirects
    redirectToCommunity() {
        window.location.href = this.communityDomain;
    }

    redirectToLogin(returnUrl = null) {
        const ref = returnUrl || window.location.href;
        window.location.href = `${this.communityDomain}/login/?ref=${encodeURIComponent(ref)}`;
    }

    redirectToRegister(returnUrl = null) {
        const ref = returnUrl || window.location.href;
        window.location.href = `${this.communityDomain}/register/?ref=${encodeURIComponent(ref)}`;
    }

    redirectToProfile(userId = null) {
        if (userId) {
            window.location.href = `${this.communityDomain}/profile/${userId}/`;
        } else {
            const user = this.getCurrentUser();
            if (user && user.id) {
                window.location.href = `${this.communityDomain}/profile/${user.id}/`;
            } else {
                this.redirectToCommunity();
            }
        }
    }

    redirectToMessages() {
        window.location.href = `${this.communityDomain}/messages/`;
    }

    redirectToSettings() {
        window.location.href = `${this.communityDomain}/settings/`;
    }

    // Main site navigation
    scrollToElement(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }

    scrollToTop() {
        window.scrollTo({ 
            top: 0, 
            behavior: 'smooth' 
        });
    }

    navigateToMarketplaceCategory(category) {
        // Navigate to marketplace section and filter by category
        this.scrollToElement('#marketplace');
        
        // Trigger category filter if marketplace has filtering
        setTimeout(() => {
            const categoryFilter = document.querySelector(`[data-category-filter="${category}"]`);
            if (categoryFilter) {
                categoryFilter.click();
            }
        }, 500);
    }

    navigateToProduct(productId) {
        // This would typically open a product modal or navigate to product page
        console.log('Navigate to product:', productId);
        
        // For now, just scroll to marketplace
        this.scrollToElement('#marketplace');
    }

    // Authentication helpers
    isAuthenticated() {
        return window.g2ownAPI && window.g2ownAPI.isAuthenticated();
    }

    getCurrentUser() {
        return window.g2ownAPI ? window.g2ownAPI.getStoredUser() : null;
    }

    requireLogin() {
        const message = 'You need to be logged in to access this feature.';
        
        if (confirm(`${message}\n\nWould you like to log in now?`)) {
            this.redirectToLogin();
        }
    }

    // URL helpers
    getCurrentReturnUrl() {
        return encodeURIComponent(window.location.href);
    }

    getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // Handle return from community
    handleCommunityReturn() {
        const ref = this.getQueryParam('ref');
        if (ref) {
            try {
                const returnUrl = decodeURIComponent(ref);
                if (returnUrl.startsWith(this.mainDomain)) {
                    window.location.href = returnUrl;
                    return;
                }
            } catch (error) {
                console.error('Invalid return URL:', error);
            }
        }
        
        // Default to homepage
        window.location.href = this.mainDomain;
    }
}

// Initialize navigation helper
window.navigationHelper = new NavigationHelper();

// Helper function for easy access
window.navigateTo = (section) => {
    if (window.navigationHelper) {
        window.navigationHelper.navigateToSection(section);
    }
};
