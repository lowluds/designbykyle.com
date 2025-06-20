/**
 * Product Display OAuth Integration
 * Handles product display with OAuth authentication and user-specific features
 */

class ProductDisplayOAuth {
    constructor(oauthIntegration) {
        this.oauth = oauthIntegration;
        this.config = OAuthConfig;
        this.products = [];
        this.userProducts = [];
        this.favorites = [];
        
        this.init();
    }
    
    /**
     * Initialize product display integration
     */
    init() {
        this.config.log('info', 'Initializing Product Display OAuth integration');
        
        // Listen for OAuth state changes
        window.addEventListener('oauthStateChanged', (e) => {
            this.handleAuthStateChange(e.detail);
        });
        
        // Load initial data
        this.loadProducts();
        
        // Load user-specific data if authenticated
        if (this.oauth.isUserAuthenticated()) {
            this.loadUserData();
        }
        
        this.setupEventListeners();
    }
    
    /**
     * Handle OAuth authentication state changes
     */
    handleAuthStateChange(authData) {
        if (authData.isAuthenticated) {
            this.config.log('info', 'User authenticated, loading user-specific product data');
            this.loadUserData();
        } else {
            this.config.log('info', 'User logged out, clearing user-specific data');
            this.clearUserData();
        }
        
        this.updateProductDisplays();
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Favorite buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.favorite-btn, [data-action="favorite"]')) {
                e.preventDefault();
                this.handleFavoriteToggle(e.target);
            }
        });
        
        // Review buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.review-btn, [data-action="review"]')) {
                e.preventDefault();
                this.handleReview(e.target);
            }
        });
        
        // Purchase history
        document.addEventListener('click', (e) => {
            if (e.target.matches('.view-purchase-btn, [data-action="view-purchase"]')) {
                e.preventDefault();
                this.handleViewPurchase(e.target);
            }
        });
    }
    
    /**
     * Load products from community
     */
    async loadProducts() {
        try {
            this.config.log('info', 'Loading products from community');
            
            // Use public API or authenticated request if available
            const url = `${this.config.community.baseUrl}/api/commerce/products`;
            let response;
            
            if (this.oauth.isUserAuthenticated()) {
                response = await this.oauth.makeAuthenticatedRequest(url);
            } else {
                response = await fetch(url);
            }
            
            if (response.ok) {
                const data = await response.json();
                this.products = data.results || data || [];
                this.config.log('info', 'Products loaded successfully', { count: this.products.length });
                this.updateProductDisplays();
            } else {
                throw new Error(`Failed to load products: ${response.statusText}`);
            }
        } catch (error) {
            this.config.log('error', 'Error loading products', error);
            // Use fallback/cached products if available
            this.loadFallbackProducts();
        }
    }
    
    /**
     * Load user-specific data (purchases, favorites, etc.)
     */
    async loadUserData() {
        if (!this.oauth.isUserAuthenticated()) {
            return;
        }
        
        try {
            this.config.log('info', 'Loading user-specific product data');
            
            // Load user purchases
            await this.loadUserPurchases();
            
            // Load user favorites
            await this.loadUserFavorites();
            
            this.updateProductDisplays();
        } catch (error) {
            this.config.log('error', 'Error loading user data', error);
        }
    }
    
    /**
     * Load user purchases
     */
    async loadUserPurchases() {
        try {
            const response = await this.oauth.makeAuthenticatedRequest(
                `${this.config.community.baseUrl}/api/commerce/purchases/me`
            );
            
            if (response.ok) {
                const data = await response.json();
                this.userProducts = data.results || data || [];
                this.config.log('info', 'User purchases loaded', { count: this.userProducts.length });
            }
        } catch (error) {
            this.config.log('warn', 'Could not load user purchases', error);
            this.userProducts = [];
        }
    }
    
    /**
     * Load user favorites
     */
    async loadUserFavorites() {
        try {
            const response = await this.oauth.makeAuthenticatedRequest(
                `${this.config.community.baseUrl}/api/core/members/me/favorites`
            );
            
            if (response.ok) {
                const data = await response.json();
                this.favorites = data.results || data || [];
                this.config.log('info', 'User favorites loaded', { count: this.favorites.length });
            }
        } catch (error) {
            this.config.log('warn', 'Could not load user favorites', error);
            this.favorites = [];
        }
    }
    
    /**
     * Toggle product favorite
     */
    async toggleFavorite(productId) {
        if (!this.oauth.isUserAuthenticated()) {
            this.showLoginRequired();
            return false;
        }
        
        try {
            const isFavorited = this.isProductFavorited(productId);
            const method = isFavorited ? 'DELETE' : 'POST';
            const url = `${this.config.community.baseUrl}/api/core/members/me/favorites/${productId}`;
            
            this.config.log('info', `${isFavorited ? 'Removing' : 'Adding'} favorite`, { productId });
            
            const response = await this.oauth.makeAuthenticatedRequest(url, {
                method: method
            });
            
            if (response.ok) {
                // Update local favorites list
                if (isFavorited) {
                    this.favorites = this.favorites.filter(fav => fav.id !== productId);
                } else {
                    this.favorites.push({ id: productId, type: 'product' });
                }
                
                this.updateProductDisplays();
                this.showMessage(isFavorited ? 'Removed from favorites' : 'Added to favorites', 'success');
                return true;
            } else {
                throw new Error(`Failed to update favorite: ${response.statusText}`);
            }
        } catch (error) {
            this.config.log('error', 'Error toggling favorite', error);
            this.showMessage('Failed to update favorites', 'error');
            return false;
        }
    }
    
    /**
     * Handle favorite button click
     */
    async handleFavoriteToggle(button) {
        const productId = button.dataset.productId || button.dataset.product;
        
        if (!productId) {
            this.config.log('warn', 'No product ID found on favorite button');
            return;
        }
        
        // Update button state during request
        button.disabled = true;
        const originalText = button.textContent;
        button.textContent = 'Updating...';
        
        const success = await this.toggleFavorite(productId);
        
        // Restore button
        button.disabled = false;
        button.textContent = originalText;
    }
    
    /**
     * Handle review button click
     */
    handleReview(button) {
        const productId = button.dataset.productId || button.dataset.product;
        
        if (!this.oauth.isUserAuthenticated()) {
            this.showLoginRequired();
            return;
        }
        
        if (!productId) {
            this.config.log('warn', 'No product ID found on review button');
            return;
        }
        
        // Check if user has purchased this product
        const hasPurchased = this.hasUserPurchased(productId);
        
        if (!hasPurchased) {
            this.showMessage('You must purchase this product before reviewing it', 'warning');
            return;
        }
        
        // Redirect to community review page
        const reviewUrl = `${this.config.community.baseUrl}/store/product/${productId}/reviews/add/`;
        window.open(reviewUrl, '_blank');
    }
    
    /**
     * Handle view purchase
     */
    handleViewPurchase(button) {
        const productId = button.dataset.productId || button.dataset.product;
        
        if (!this.oauth.isUserAuthenticated()) {
            this.showLoginRequired();
            return;
        }
        
        // Redirect to community purchase history
        const purchaseUrl = `${this.config.community.baseUrl}/store/purchases/`;
        window.open(purchaseUrl, '_blank');
    }
    
    /**
     * Clear user-specific data
     */
    clearUserData() {
        this.userProducts = [];
        this.favorites = [];
    }
    
    /**
     * Update all product displays
     */
    updateProductDisplays() {
        this.updateProductCards();
        this.updateProductLists();
        this.updateFeaturedProducts();
    }
    
    /**
     * Update product cards
     */
    updateProductCards() {
        const productCards = document.querySelectorAll('.product-card, [data-product-card]');
        
        productCards.forEach(card => {
            const productId = card.dataset.productId || card.dataset.product;
            if (productId) {
                this.updateProductCard(card, productId);
            }
        });
    }
    
    /**
     * Update individual product card
     */
    updateProductCard(card, productId) {
        const isAuthenticated = this.oauth.isUserAuthenticated();
        const isFavorited = this.isProductFavorited(productId);
        const hasPurchased = this.hasUserPurchased(productId);
        
        // Update favorite button
        const favoriteBtn = card.querySelector('.favorite-btn, [data-action="favorite"]');
        if (favoriteBtn) {
            if (isAuthenticated) {
                favoriteBtn.style.display = 'block';
                favoriteBtn.classList.toggle('favorited', isFavorited);
                favoriteBtn.innerHTML = isFavorited ? '❤️' : '🤍';
            } else {
                favoriteBtn.style.display = 'none';
            }
        }
        
        // Update review button
        const reviewBtn = card.querySelector('.review-btn, [data-action="review"]');
        if (reviewBtn) {
            if (isAuthenticated && hasPurchased) {
                reviewBtn.style.display = 'block';
            } else {
                reviewBtn.style.display = 'none';
            }
        }
        
        // Update purchase indicator
        const purchaseIndicator = card.querySelector('.purchase-indicator, [data-purchase-indicator]');
        if (purchaseIndicator) {
            if (isAuthenticated && hasPurchased) {
                purchaseIndicator.style.display = 'block';
                purchaseIndicator.textContent = 'Owned';
            } else {
                purchaseIndicator.style.display = 'none';
            }
        }
        
        // Update add to cart button for owned products
        const addToCartBtn = card.querySelector('.add-to-cart-btn, [data-action="add-to-cart"]');
        if (addToCartBtn && hasPurchased) {
            addToCartBtn.style.display = 'none';
        }
    }
    
    /**
     * Update product lists
     */
    updateProductLists() {
        const productLists = document.querySelectorAll('.product-list, [data-product-list]');
        
        productLists.forEach(list => {
            const listType = list.dataset.listType || 'all';
            this.renderProductList(list, listType);
        });
    }
    
    /**
     * Render product list based on type
     */
    renderProductList(container, type) {
        let products = [];
        
        switch (type) {
            case 'favorites':
                if (this.oauth.isUserAuthenticated()) {
                    products = this.products.filter(p => this.isProductFavorited(p.id));
                }
                break;
            case 'purchased':
                if (this.oauth.isUserAuthenticated()) {
                    products = this.userProducts;
                }
                break;
            case 'recommended':
                // Could implement recommendation logic here
                products = this.products.slice(0, 6);
                break;
            default:
                products = this.products;
        }
        
        if (products.length === 0) {
            container.innerHTML = '<div class="empty-list">No products found</div>';
            return;
        }
        
        container.innerHTML = products.map(product => this.renderProductCard(product)).join('');
    }
    
    /**
     * Render individual product card HTML
     */
    renderProductCard(product) {
        const isAuthenticated = this.oauth.isUserAuthenticated();
        const isFavorited = this.isProductFavorited(product.id);
        const hasPurchased = this.hasUserPurchased(product.id);
        
        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image || '/assets/images/placeholder.png'}" alt="${product.name}">
                    ${isAuthenticated ? `
                        <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" 
                                data-action="favorite" 
                                data-product-id="${product.id}">
                            ${isFavorited ? '❤️' : '🤍'}
                        </button>
                    ` : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description || ''}</p>
                    <div class="product-price">${this.formatPrice(product.price)}</div>
                    ${hasPurchased ? '<div class="purchase-indicator">Owned</div>' : ''}
                </div>
                <div class="product-actions">
                    ${!hasPurchased ? `
                        <button class="add-to-cart-btn" 
                                data-action="add-to-cart" 
                                data-product-id="${product.id}">
                            Add to Cart
                        </button>
                    ` : ''}
                    ${isAuthenticated && hasPurchased ? `
                        <button class="review-btn" 
                                data-action="review" 
                                data-product-id="${product.id}">
                            Write Review
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    /**
     * Update featured products section
     */
    updateFeaturedProducts() {
        const featuredContainer = document.querySelector('.featured-products, [data-featured-products]');
        if (!featuredContainer) return;
        
        // Get featured products (could be marked as featured or top-selling)
        const featuredProducts = this.products.filter(p => p.featured || p.topSelling).slice(0, 4);
        
        if (featuredProducts.length > 0) {
            featuredContainer.innerHTML = featuredProducts.map(product => 
                this.renderProductCard(product)
            ).join('');
        }
    }
    
    /**
     * Check if product is favorited by user
     */
    isProductFavorited(productId) {
        return this.favorites.some(fav => fav.id == productId);
    }
    
    /**
     * Check if user has purchased product
     */
    hasUserPurchased(productId) {
        return this.userProducts.some(purchase => purchase.product_id == productId || purchase.id == productId);
    }
    
    /**
     * Load fallback products (static data)
     */
    loadFallbackProducts() {
        this.config.log('info', 'Loading fallback products');
        
        // This could load from a static JSON file or hardcoded data
        this.products = [
            {
                id: 1,
                name: 'Sample Product 1',
                description: 'This is a sample product',
                price: 29.99,
                image: '/assets/images/products/sample1.jpg'
            },
            {
                id: 2,
                name: 'Sample Product 2',
                description: 'This is another sample product',
                price: 49.99,
                image: '/assets/images/products/sample2.jpg'
            }
        ];
        
        this.updateProductDisplays();
    }
    
    /**
     * Format price for display
     */
    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price || 0);
    }
    
    /**
     * Show login required message
     */
    showLoginRequired() {
        this.showMessage(this.config.messages.loginRequired, 'warning');
    }
    
    /**
     * Show message to user
     */
    showMessage(message, type = 'info') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`[PRODUCTS] ${type.toUpperCase()}: ${message}`);
        }
    }
    
    /**
     * Get products data
     */
    getProducts() {
        return this.products;
    }
    
    /**
     * Get user products
     */
    getUserProducts() {
        return this.userProducts;
    }
    
    /**
     * Get user favorites
     */
    getFavorites() {
        return this.favorites;
    }
}

// Global instance will be created by OAuth Manager
window.productDisplayOAuth = null;
