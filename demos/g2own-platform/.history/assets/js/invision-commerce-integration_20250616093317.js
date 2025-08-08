/*!
 * Invision Community Commerce Integration
 * Seamlessly integrates G2Own with Invision Community Store
 * Version: 1.0.0
 */

class InvisionCommerceIntegration {
    constructor() {
        this.communityURL = 'https://g2own.com/community';
        this.storeURL = this.communityURL + '/store/';
        this.apiURL = this.communityURL + '/api/commerce/';
        
        // Store categories mapping
        this.categories = {
            'steam-games': { id: 1, name: 'Steam Games', icon: 'fab fa-steam' },
            'game-items': { id: 2, name: 'Game Items', icon: 'fas fa-gem' },
            'accounts': { id: 3, name: 'Gaming Accounts', icon: 'fas fa-user-circle' },
            'software': { id: 4, name: 'Software & Tools', icon: 'fas fa-code' }
        };
        
        this.featuredProducts = [];
        this.isAuthenticated = false;
        
        this.init();
    }

    async init() {
        console.log('🛒 Initializing Invision Commerce Integration...');
        
        try {
            await this.checkAuthStatus();
            await this.loadStoreData();
            this.setupEventHandlers();
            this.injectStoreElements();
            
            console.log('✅ Store integration initialized successfully');
        } catch (error) {
            console.log('⚠️ Store integration using fallback mode:', error.message);
            this.setupStaticIntegration();
        }
    }

    async checkAuthStatus() {
        // Check if user is authenticated with community
        if (window.authBridge && window.authBridge.isAuthenticated) {
            this.isAuthenticated = true;
            this.userdata = window.authBridge.userdata;
        }
    }

    async loadStoreData() {
        try {
            // Try to load featured products from API
            const response = await fetch(`${this.apiURL}products`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.featuredProducts = data.results ? data.results.slice(0, 6) : [];
                console.log(`📦 Loaded ${this.featuredProducts.length} featured products`);
            } else {
                throw new Error('API not available');
            }
        } catch (error) {
            console.log('📦 Using static product data');
            this.setupStaticProducts();
        }
    }

    setupStaticProducts() {
        // Fallback static products for demo
        this.featuredProducts = [
            {
                id: 1,
                title: 'Steam Game Collection',
                price: 29.99,
                originalPrice: 59.99,
                image: 'assets/images/steam-games.jpg',
                category: 'steam-games',
                rating: 4.8,
                seller: { name: 'G2Own Store', rating: 5.0 }
            },
            {
                id: 2,
                title: 'CS:GO Rare Skins Pack',
                price: 149.99,
                originalPrice: 199.99,
                image: 'assets/images/csgo-skins.jpg',
                category: 'game-items',
                rating: 4.9,
                seller: { name: 'SkinMaster', rating: 4.8 }
            },
            {
                id: 3,
                title: 'Premium Gaming Account',
                price: 89.99,
                originalPrice: 120.00,
                image: 'assets/images/gaming-account.jpg',
                category: 'accounts',
                rating: 4.7,
                seller: { name: 'AccountPro', rating: 4.9 }
            }
        ];
    }

    setupStaticIntegration() {
        // If API isn't available, create direct links to store
        this.injectStoreElements();
        this.addStoreNavigation();
        this.createStorePreviewSection();
        this.addQuickAccessElements();
    }

    setupEventHandlers() {
        // Listen for authentication changes
        window.addEventListener('authStateChanged', (event) => {
            this.isAuthenticated = event.detail.authenticated;
            this.userdata = event.detail.user;
            this.updateStoreElements();
        });

        // Listen for cart updates from community
        window.addEventListener('message', (event) => {
            if (event.origin === this.communityURL) {
                this.handleCommunityMessage(event.data);
            }
        });

        // Track store interactions
        this.setupAnalytics();
    }

    handleCommunityMessage(data) {
        switch (data.type) {
            case 'cart_updated':
                this.updateCartIndicator(data.count);
                break;
            case 'product_added':
                this.showNotification(`Added "${data.productName}" to cart`);
                break;
            case 'purchase_completed':
                this.showNotification('Purchase completed successfully!');
                break;
        }
    }

    injectStoreElements() {
        this.addStoreNavigation();
        this.createStorePreviewSection();
        this.updateCategoryCards();
        this.addQuickAccessElements();
    }

    addStoreNavigation() {
        const navbarNav = document.querySelector('.navbar-nav');
        if (navbarNav && !document.querySelector('.store-nav-link')) {
            const storeNavItem = document.createElement('li');
            storeNavItem.className = 'nav-item';
            storeNavItem.innerHTML = `
                <a class="nav-link store-nav-link" href="${this.storeURL}" target="_blank">
                    <i class="fas fa-shopping-cart store-icon"></i>
                    <span>Store</span>
                    <span class="store-badge">New</span>
                    <span class="cart-count" style="display: none;">0</span>
                </a>
            `;
            
            // Insert before auth toggle
            const authToggle = navbarNav.querySelector('.auth-toggle')?.parentElement;
            if (authToggle) {
                navbarNav.insertBefore(storeNavItem, authToggle);
            } else {
                navbarNav.appendChild(storeNavItem);
            }
        }
    }

    createStorePreviewSection() {
        // Find insertion point (after benefits section)
        const benefitsSection = document.querySelector('.why-choose-us-section');
        if (benefitsSection && !document.querySelector('.store-preview-section')) {
            const storeSection = document.createElement('section');
            storeSection.className = 'store-preview-section';
            storeSection.id = 'store-preview';
            
            storeSection.innerHTML = `
                <div class="container">
                    <div class="section-header">
                        <div class="section-badge">
                            <i class="fas fa-shopping-cart"></i>
                            <span>G2Own Store</span>
                        </div>
                        <h2 class="section-title">
                            <span class="gradient-text">Featured Products</span>
                        </h2>
                        <p class="section-subtitle">
                            Discover the latest gaming products at unbeatable prices
                        </p>
                    </div>
                    
                    <div class="products-grid" id="featured-products-grid">
                        ${this.renderFeaturedProducts()}
                    </div>
                    
                    <div class="store-cta-section">
                        <div class="row">
                            <div class="col-12 text-center">
                                <a href="${this.storeURL}" class="btn btn-store-primary store-cta" target="_blank">
                                    <i class="fas fa-shopping-cart"></i>
                                    Visit Full Store
                                    <i class="fas fa-arrow-right"></i>
                                </a>
                                <p class="store-cta-subtitle">Browse thousands of gaming products</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Insert after benefits section
            benefitsSection.parentNode.insertBefore(storeSection, benefitsSection.nextSibling);
            
            // Animate in the new section
            setTimeout(() => {
                storeSection.classList.add('animate-in');
            }, 100);
        }
    }

    renderFeaturedProducts() {
        if (this.featuredProducts.length === 0) {
            return this.renderProductPlaceholders();
        }

        return this.featuredProducts.map(product => `
            <div class="product-card animate-on-scroll" data-delay="${Math.random() * 200}">
                <div class="product-image">
                    <img src="${product.image || 'assets/images/product-placeholder.jpg'}" 
                         alt="${product.title}" 
                         loading="lazy"
                         onerror="this.src='assets/images/product-placeholder.jpg'">
                    <div class="product-overlay">
                        <div class="product-badges">
                            ${product.originalPrice && product.originalPrice > product.price ? 
                                `<span class="discount-badge">-${Math.round((1 - product.price/product.originalPrice) * 100)}%</span>` : ''}
                        </div>
                        <div class="quick-actions">
                            <button class="btn-quick-view" onclick="window.storeIntegration.quickView(${product.id})">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-add-cart" onclick="window.storeIntegration.addToCart(${product.id})">
                                <i class="fas fa-shopping-cart"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-category">
                        <i class="${this.categories[product.category]?.icon || 'fas fa-tag'}"></i>
                        <span>${this.categories[product.category]?.name || 'Gaming'}</span>
                    </div>
                    <h4 class="product-title">${product.title}</h4>
                    <div class="product-rating">
                        ${this.renderStars(product.rating || 4.5)}
                        <span class="rating-text">(${product.rating || 4.5})</span>
                    </div>
                    <div class="seller-info">
                        <i class="fas fa-user-circle"></i>
                        <span>by ${product.seller?.name || 'G2Own Store'}</span>
                    </div>
                    <div class="price-section">
                        <span class="current-price">$${product.price}</span>
                        ${product.originalPrice && product.originalPrice > product.price ? 
                            `<span class="original-price">$${product.originalPrice}</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <a href="${this.storeURL}product/${product.id}/" 
                           class="btn btn-outline-primary btn-view-product" 
                           target="_blank">
                            View Details
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderProductPlaceholders() {
        const placeholders = [
            { title: 'Steam Games', desc: 'Latest AAA titles at great prices', category: 'steam-games', price: '29.99' },
            { title: 'Game Items', desc: 'Rare skins and in-game items', category: 'game-items', price: '149.99' },
            { title: 'Gaming Accounts', desc: 'High-level accounts ready to play', category: 'accounts', price: '89.99' }
        ];

        return placeholders.map((item, index) => `
            <div class="product-card placeholder animate-on-scroll" data-delay="${index * 100}">
                <div class="product-image">
                    <div class="placeholder-image">
                        <i class="${this.categories[item.category]?.icon || 'fas fa-gamepad'} placeholder-icon"></i>
                    </div>
                </div>
                <div class="product-info">
                    <h4 class="product-title">${item.title}</h4>
                    <p class="product-description">${item.desc}</p>
                    <div class="price-section">
                        <span class="current-price">From $${item.price}</span>
                    </div>
                    <div class="product-actions">
                        <a href="${this.storeURL}category/${item.category}/" 
                           class="btn btn-outline-primary" 
                           target="_blank">
                            Browse ${item.title}
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }

    updateCategoryCards() {
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach((card, index) => {
            if (!card.querySelector('.store-link-overlay')) {
                const overlay = document.createElement('div');
                overlay.className = 'store-link-overlay';
                
                const categories = ['steam-games', 'game-items', 'accounts', 'software'];
                const category = categories[index] || 'steam-games';
                
                overlay.innerHTML = `
                    <a href="${this.storeURL}category/${category}/" 
                       class="btn btn-store-secondary shop-now-btn" 
                       target="_blank">
                        <i class="fas fa-shopping-cart"></i>
                        Shop Now
                    </a>
                `;
                
                card.appendChild(overlay);
            }
        });
    }

    addQuickAccessElements() {
        // Add floating store access button
        if (!document.querySelector('.floating-store-btn')) {
            const floatingBtn = document.createElement('div');
            floatingBtn.className = 'floating-store-btn';
            floatingBtn.innerHTML = `
                <a href="${this.storeURL}" target="_blank" class="store-float-link" title="Visit Store">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="float-text">Store</span>
                    <span class="cart-indicator" style="display: none;">0</span>
                </a>
            `;
            document.body.appendChild(floatingBtn);
        }
    }

    // Interactive functions
    quickView(productId) {
        // Open product in modal or new tab
        window.open(`${this.storeURL}product/${productId}/`, '_blank');
        this.trackEvent('quick_view', { productId });
    }

    addToCart(productId) {
        // Redirect to product page for adding to cart
        window.open(`${this.storeURL}product/${productId}/?action=add_to_cart`, '_blank');
        this.trackEvent('add_to_cart', { productId });
    }

    updateCartIndicator(count) {
        const indicators = document.querySelectorAll('.cart-count, .cart-indicator');
        indicators.forEach(indicator => {
            indicator.textContent = count;
            indicator.style.display = count > 0 ? 'block' : 'none';
        });
    }

    updateStoreElements() {
        // Update store elements based on auth status
        if (this.isAuthenticated) {
            console.log('🔑 User authenticated - personalizing store experience');
            // Could load user's wishlist, recommended products, etc.
        }
    }

    showNotification(message) {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = 'store-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    setupAnalytics() {
        // Track store integration usage
        const storeLinks = document.querySelectorAll('[href*="/store"]');
        storeLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.trackEvent('store_visit', {
                    source: e.target.closest('[class]')?.className || 'unknown',
                    href: link.href
                });
            });
        });
    }

    trackEvent(eventName, data = {}) {
        console.log(`📊 Store Event: ${eventName}`, data);
        
        // Integration with analytics
        if (window.gtag) {
            window.gtag('event', eventName, {
                event_category: 'store_integration',
                ...data
            });
        }
        
        // Could also send to your own analytics endpoint
        try {
            fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event: eventName, data })
            }).catch(() => {}); // Silent fail for analytics
        } catch (e) {}
    }

    // Public API methods
    refreshStoreData() {
        return this.loadStoreData();
    }

    getStoreURL(path = '') {
        return this.storeURL + path;
    }

    getCategoryURL(category) {
        return `${this.storeURL}category/${category}/`;
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.storeIntegration = new InvisionCommerceIntegration();
    });
} else {
    window.storeIntegration = new InvisionCommerceIntegration();
}

// Make available globally
window.InvisionCommerceIntegration = InvisionCommerceIntegration;
