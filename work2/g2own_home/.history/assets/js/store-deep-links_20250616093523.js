/*!
 * Store Deep Links Integration
 * Handles category and product deep linking for G2Own Store
 * Version: 1.0.0
 */

class StoreDeepLinks {
    constructor() {
        this.communityURL = 'https://g2own.com/community';
        this.storeURL = this.communityURL + '/store/';
        
        // Store category mappings
        this.categories = {
            'steam-games': {
                id: 1,
                name: 'Steam Games',
                url: 'category/1-steam-games/',
                description: 'Latest Steam games and keys',
                icon: 'fab fa-steam',
                color: '#1b2838'
            },
            'game-items': {
                id: 2,
                name: 'Game Items',
                url: 'category/2-game-items/',
                description: 'In-game items, skins, and collectibles',
                icon: 'fas fa-gem',
                color: '#ff6b35'
            },
            'gaming-accounts': {
                id: 3,
                name: 'Gaming Accounts',
                url: 'category/3-gaming-accounts/',
                description: 'Pre-built gaming accounts',
                icon: 'fas fa-user-circle',
                color: '#4ecdc4'
            },
            'software': {
                id: 4,
                name: 'Software & Tools',
                url: 'category/4-software/',
                description: 'Gaming software and utilities',
                icon: 'fas fa-code',
                color: '#45b7d1'
            },
            'gift-cards': {
                id: 5,
                name: 'Gift Cards',
                url: 'category/5-gift-cards/',
                description: 'Digital gift cards and credits',
                icon: 'fas fa-gift',
                color: '#96ceb4'
            },
            'subscriptions': {
                id: 6,
                name: 'Subscriptions',
                url: 'category/6-subscriptions/',
                description: 'Gaming subscriptions and services',
                icon: 'fas fa-calendar-alt',
                color: '#ffeaa7'
            }
        };
        
        this.init();
    }

    init() {
        console.log('🔗 Initializing Store Deep Links...');
        
        this.setupDeepLinkHandlers();
        this.createCategoryNavigation();
        this.handleURLParams();
        
        console.log('✅ Store deep links initialized');
    }

    setupDeepLinkHandlers() {
        // Handle all store-related links on the page
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href*="store"], a[data-store-category], a[data-store-product]');
            
            if (link) {
                e.preventDefault();
                this.handleStoreLink(link);
            }
        });
    }

    handleStoreLink(link) {
        const href = link.getAttribute('href');
        const category = link.getAttribute('data-store-category');
        const product = link.getAttribute('data-store-product');
        const search = link.getAttribute('data-store-search');
        
        if (category) {
            this.openCategory(category);
        } else if (product) {
            this.openProduct(product);
        } else if (search) {
            this.openSearch(search);
        } else if (href) {
            this.openStoreURL(href);
        }
    }

    openCategory(categorySlug) {
        const category = this.categories[categorySlug];
        
        if (category) {
            const fullURL = this.storeURL + category.url;
            this.openStoreURL(fullURL);
            
            // Track analytics
            this.trackEvent('category_view', {
                category: categorySlug,
                category_name: category.name
            });
        } else {
            console.warn('Unknown category:', categorySlug);
            this.openStoreURL(this.storeURL + 'categories/');
        }
    }

    openProduct(productId) {
        const productURL = this.storeURL + `product/${productId}/`;
        this.openStoreURL(productURL);
        
        // Track analytics
        this.trackEvent('product_view', {
            product_id: productId
        });
    }

    openSearch(query) {
        const searchURL = this.storeURL + `search/?q=${encodeURIComponent(query)}`;
        this.openStoreURL(searchURL);
        
        // Track analytics
        this.trackEvent('store_search', {
            search_query: query
        });
    }

    openStoreURL(url) {
        const isMobile = window.innerWidth <= 768;
        const isInternal = url.includes(this.communityURL);
        
        if (isMobile || !isInternal) {
            // Mobile or external: Open in same window
            window.location.href = url;
        } else {
            // Desktop internal: Open in new tab
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }

    createCategoryNavigation() {
        // Inject category navigation into the page
        const targetContainer = document.querySelector('#store-categories') || 
                               document.querySelector('.categories-container') ||
                               this.createCategoriesContainer();
        
        if (targetContainer) {
            targetContainer.innerHTML = this.generateCategoryHTML();
        }
    }

    createCategoriesContainer() {
        // Create categories container and inject after hero section
        const heroSection = document.querySelector('.hero') || document.querySelector('#hero');
        
        if (heroSection) {
            const container = document.createElement('section');
            container.className = 'store-categories-section';
            container.id = 'store-categories';
            
            heroSection.insertAdjacentElement('afterend', container);
            return container;
        }
        
        return null;
    }

    generateCategoryHTML() {
        const categoriesArray = Object.entries(this.categories);
        
        return `
            <div class="container">
                <div class="section-header">
                    <div class="section-badge">
                        <i class="ph ph-storefront gaming-icon"></i>
                        <span>Browse Categories</span>
                    </div>
                    <h2 class="section-title">
                        <span class="gradient-text">Shop by Category</span>
                    </h2>
                    <p class="section-subtitle">
                        Discover amazing deals across all our gaming categories
                    </p>
                </div>
                
                <div class="categories-grid">
                    ${categoriesArray.map(([slug, category]) => `
                        <div class="category-card" data-store-category="${slug}">
                            <div class="category-icon" style="color: ${category.color}">
                                <i class="${category.icon}"></i>
                            </div>
                            <div class="category-content">
                                <h3 class="category-title">${category.name}</h3>
                                <p class="category-description">${category.description}</p>
                                <div class="category-cta">
                                    <span>Explore Now</span>
                                    <i class="ph ph-arrow-right"></i>
                                </div>
                            </div>
                            <div class="category-glow"></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    handleURLParams() {
        // Handle URL parameters for direct linking
        const urlParams = new URLSearchParams(window.location.search);
        const storeCategory = urlParams.get('category');
        const storeProduct = urlParams.get('product');
        const storeSearch = urlParams.get('search');
        
        if (storeCategory) {
            // Delay to allow page to load
            setTimeout(() => this.openCategory(storeCategory), 1000);
        } else if (storeProduct) {
            setTimeout(() => this.openProduct(storeProduct), 1000);
        } else if (storeSearch) {
            setTimeout(() => this.openSearch(storeSearch), 1000);
        }
    }

    // Quick access methods for external use
    showSteamGames() {
        this.openCategory('steam-games');
    }

    showGameItems() {
        this.openCategory('game-items');
    }

    showGamingAccounts() {
        this.openCategory('gaming-accounts');
    }

    showSoftware() {
        this.openCategory('software');
    }

    showGiftCards() {
        this.openCategory('gift-cards');
    }

    showSubscriptions() {
        this.openCategory('subscriptions');
    }

    searchStore(query) {
        if (query && query.trim()) {
            this.openSearch(query.trim());
        }
    }

    // Create search functionality
    createStoreSearch() {
        // Find existing search or create new one
        const existingSearch = document.querySelector('.store-search');
        
        if (!existingSearch) {
            const searchContainer = document.createElement('div');
            searchContainer.className = 'store-search-container';
            searchContainer.innerHTML = `
                <div class="store-search">
                    <input type="text" 
                           class="store-search-input" 
                           placeholder="Search games, items, accounts..."
                           autocomplete="off">
                    <button class="store-search-btn" type="button">
                        <i class="ph ph-magnifying-glass"></i>
                    </button>
                </div>
            `;
            
            // Find appropriate location (navbar, hero, etc.)
            const navbar = document.querySelector('.nav-links') || 
                          document.querySelector('.navbar');
            
            if (navbar) {
                navbar.appendChild(searchContainer);
                
                // Add search handlers
                const input = searchContainer.querySelector('.store-search-input');
                const button = searchContainer.querySelector('.store-search-btn');
                
                const performSearch = () => {
                    const query = input.value.trim();
                    if (query) {
                        this.searchStore(query);
                    }
                };
                
                button.addEventListener('click', performSearch);
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        performSearch();
                    }
                });
            }
        }
    }

    trackEvent(eventName, eventData = {}) {
        // Track events for analytics
        if (window.gtag) {
            window.gtag('event', eventName, eventData);
        }
        
        if (window.analytics) {
            window.analytics.track(eventName, eventData);
        }
        
        // Custom event for other systems
        window.dispatchEvent(new CustomEvent('storeEvent', {
            detail: { event: eventName, data: eventData }
        }));
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.storeDeepLinks = new StoreDeepLinks();
    });
} else {
    window.storeDeepLinks = new StoreDeepLinks();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StoreDeepLinks;
}
