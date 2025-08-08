/**
 * Cart OAuth Integration
 * Handles cart functionality with OAuth authentication
 */

class CartOAuthIntegration {
    constructor(oauthIntegration) {
        this.oauth = oauthIntegration;
        this.config = OAuthConfig;
        this.cart = [];
        this.isLoaded = false;
        
        this.init();
    }
    
    /**
     * Initialize cart integration
     */
    init() {
        this.config.log('info', 'Initializing Cart OAuth integration');
        
        // Listen for OAuth state changes
        window.addEventListener('oauthStateChanged', (e) => {
            this.handleAuthStateChange(e.detail);
        });
        
        // Load cart if user is authenticated
        if (this.oauth.isUserAuthenticated()) {
            this.loadCart();
        }
        
        this.setupEventListeners();
    }
    
    /**
     * Handle OAuth authentication state changes
     */
    handleAuthStateChange(authData) {
        if (authData.isAuthenticated) {
            this.config.log('info', 'User authenticated, loading cart');
            this.loadCart();
        } else {
            this.config.log('info', 'User logged out, clearing cart');
            this.clearCart();
        }
    }
    
    /**
     * Set up event listeners for cart actions
     */
    setupEventListeners() {
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.add-to-cart-btn, [data-action="add-to-cart"]')) {
                e.preventDefault();
                this.handleAddToCart(e.target);
            }
        });
        
        // Remove from cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.remove-from-cart-btn, [data-action="remove-from-cart"]')) {
                e.preventDefault();
                this.handleRemoveFromCart(e.target);
            }
        });
        
        // Update quantity
        document.addEventListener('change', (e) => {
            if (e.target.matches('.cart-quantity-input, [data-action="update-quantity"]')) {
                this.handleUpdateQuantity(e.target);
            }
        });
        
        // Checkout button
        document.addEventListener('click', (e) => {
            if (e.target.matches('.checkout-btn, [data-action="checkout"]')) {
                e.preventDefault();
                this.handleCheckout();
            }
        });
    }
      /**
     * Load cart from Invision Community using menus API key
     */
    async loadCart() {
        if (!this.oauth.isUserAuthenticated()) {
            this.config.log('warn', 'Cannot load cart: user not authenticated');
            return;
        }
        
        try {
            this.config.log('info', 'Loading cart from community');
            
            const response = await this.oauth.makeAuthenticatedRequest(
                `${this.config.community.baseUrl}/api/commerce/carts/me`,
                { method: 'GET' },
                'menus' // Use menus API key for commerce operations
            );
            
            if (response.ok) {
                const cartData = await response.json();
                this.cart = cartData.items || [];
                this.isLoaded = true;
                this.updateCartUI();
                this.config.log('info', 'Cart loaded successfully', { itemCount: this.cart.length });
            } else {
                throw new Error(`Failed to load cart: ${response.statusText}`);
            }
        } catch (error) {
            this.config.log('error', 'Error loading cart', error);
            // Initialize empty cart on error
            this.cart = [];
            this.isLoaded = true;
            this.updateCartUI();
        }
    }
      /**
     * Add item to cart using menus API key
     */
    async addToCart(productId, quantity = 1, options = {}) {
        if (!this.oauth.isUserAuthenticated()) {
            this.showLoginRequired();
            return false;
        }
        
        try {
            this.config.log('info', 'Adding item to cart', { productId, quantity });
            
            const response = await this.oauth.makeAuthenticatedRequest(
                `${this.config.community.baseUrl}/api/commerce/carts/me/items`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        product: productId,
                        quantity: quantity,
                        options: options
                    })
                },
                'menus' // Use menus API key for commerce operations
            );
            
            if (response.ok) {
                const result = await response.json();
                await this.loadCart(); // Reload cart to get updated data
                this.showMessage('Item added to cart!', 'success');
                this.config.log('info', 'Item added to cart successfully');
                return true;
            } else {
                throw new Error(`Failed to add item: ${response.statusText}`);
            }
        } catch (error) {
            this.config.log('error', 'Error adding item to cart', error);
            this.showMessage('Failed to add item to cart', 'error');
            return false;
        }
    }
    
    /**
     * Remove item from cart
     */
    async removeFromCart(itemId) {
        if (!this.oauth.isUserAuthenticated()) {
            return false;
        }
        
        try {
            this.config.log('info', 'Removing item from cart', { itemId });
            
            const response = await this.oauth.makeAuthenticatedRequest(
                `${this.config.community.baseUrl}/api/commerce/carts/me/items/${itemId}`,
                {
                    method: 'DELETE'
                }
            );
            
            if (response.ok) {
                await this.loadCart(); // Reload cart
                this.showMessage('Item removed from cart', 'success');
                this.config.log('info', 'Item removed from cart successfully');
                return true;
            } else {
                throw new Error(`Failed to remove item: ${response.statusText}`);
            }
        } catch (error) {
            this.config.log('error', 'Error removing item from cart', error);
            this.showMessage('Failed to remove item from cart', 'error');
            return false;
        }
    }
    
    /**
     * Update item quantity in cart
     */
    async updateQuantity(itemId, quantity) {
        if (!this.oauth.isUserAuthenticated()) {
            return false;
        }
        
        try {
            this.config.log('info', 'Updating item quantity', { itemId, quantity });
            
            const response = await this.oauth.makeAuthenticatedRequest(
                `${this.config.community.baseUrl}/api/commerce/carts/me/items/${itemId}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({
                        quantity: quantity
                    })
                }
            );
            
            if (response.ok) {
                await this.loadCart(); // Reload cart
                this.config.log('info', 'Item quantity updated successfully');
                return true;
            } else {
                throw new Error(`Failed to update quantity: ${response.statusText}`);
            }
        } catch (error) {
            this.config.log('error', 'Error updating item quantity', error);
            this.showMessage('Failed to update quantity', 'error');
            return false;
        }
    }
    
    /**
     * Handle add to cart button click
     */
    async handleAddToCart(button) {
        const productId = button.dataset.productId || button.dataset.product;
        const quantity = parseInt(button.dataset.quantity || '1');
        
        if (!productId) {
            this.config.log('warn', 'No product ID found on add to cart button');
            return;
        }
        
        // Disable button during request
        button.disabled = true;
        button.textContent = 'Adding...';
        
        const success = await this.addToCart(productId, quantity);
        
        // Re-enable button
        button.disabled = false;
        button.textContent = success ? 'Added!' : 'Add to Cart';
        
        // Reset button text after delay
        if (success) {
            setTimeout(() => {
                button.textContent = 'Add to Cart';
            }, 2000);
        }
    }
    
    /**
     * Handle remove from cart button click
     */
    async handleRemoveFromCart(button) {
        const itemId = button.dataset.itemId || button.dataset.item;
        
        if (!itemId) {
            this.config.log('warn', 'No item ID found on remove button');
            return;
        }
        
        await this.removeFromCart(itemId);
    }
    
    /**
     * Handle quantity update
     */
    async handleUpdateQuantity(input) {
        const itemId = input.dataset.itemId || input.dataset.item;
        const quantity = parseInt(input.value);
        
        if (!itemId || isNaN(quantity) || quantity < 0) {
            return;
        }
        
        if (quantity === 0) {
            await this.removeFromCart(itemId);
        } else {
            await this.updateQuantity(itemId, quantity);
        }
    }
    
    /**
     * Handle checkout
     */
    async handleCheckout() {
        if (!this.oauth.isUserAuthenticated()) {
            this.showLoginRequired();
            return;
        }
        
        if (this.cart.length === 0) {
            this.showMessage('Your cart is empty', 'info');
            return;
        }
        
        try {
            this.config.log('info', 'Starting checkout process');
            
            // Redirect to community checkout
            const checkoutUrl = `${this.config.community.baseUrl}/store/checkout/`;
            window.location.href = checkoutUrl;
        } catch (error) {
            this.config.log('error', 'Error starting checkout', error);
            this.showMessage('Failed to start checkout', 'error');
        }
    }
    
    /**
     * Clear cart (on logout)
     */
    clearCart() {
        this.cart = [];
        this.isLoaded = false;
        this.updateCartUI();
    }
    
    /**
     * Update cart UI elements
     */
    updateCartUI() {
        this.updateCartCount();
        this.updateCartDisplay();
        this.updateCartSummary();
    }
    
    /**
     * Update cart count badges
     */
    updateCartCount() {
        const cartCount = this.cart.reduce((total, item) => total + (item.quantity || 1), 0);
        const countElements = document.querySelectorAll('.cart-count, [data-cart-count]');
        
        countElements.forEach(element => {
            element.textContent = cartCount.toString();
            element.style.display = cartCount > 0 ? 'block' : 'none';
        });
    }
    
    /**
     * Update cart display/dropdown
     */
    updateCartDisplay() {
        const cartDisplays = document.querySelectorAll('.cart-items, [data-cart-items]');
        
        cartDisplays.forEach(display => {
            if (this.cart.length === 0) {
                display.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
            } else {
                display.innerHTML = this.cart.map(item => this.renderCartItem(item)).join('');
            }
        });
    }
    
    /**
     * Update cart summary (total, etc.)
     */
    updateCartSummary() {
        const total = this.cart.reduce((sum, item) => {
            return sum + ((item.price || 0) * (item.quantity || 1));
        }, 0);
        
        const summaryElements = document.querySelectorAll('.cart-total, [data-cart-total]');
        summaryElements.forEach(element => {
            element.textContent = this.formatPrice(total);
        });
    }
    
    /**
     * Render individual cart item
     */
    renderCartItem(item) {
        return `
            <div class="cart-item" data-item-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image || '/assets/images/placeholder.png'}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <div class="cart-item-price">${this.formatPrice(item.price)}</div>
                    <div class="cart-item-quantity">
                        <input type="number" 
                               value="${item.quantity}" 
                               min="0" 
                               class="cart-quantity-input"
                               data-item-id="${item.id}">
                    </div>
                </div>
                <div class="cart-item-actions">
                    <button class="remove-from-cart-btn" data-item-id="${item.id}">
                        Remove
                    </button>
                </div>
            </div>
        `;
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
        
        // Optionally trigger login modal or redirect
        if (this.oauth && typeof this.oauth.login === 'function') {
            setTimeout(() => {
                this.oauth.login();
            }, 1000);
        }
    }
    
    /**
     * Show message to user
     */
    showMessage(message, type = 'info') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`[CART] ${type.toUpperCase()}: ${message}`);
        }
    }
    
    /**
     * Get cart data
     */
    getCart() {
        return this.cart;
    }
    
    /**
     * Get cart item count
     */
    getItemCount() {
        return this.cart.reduce((total, item) => total + (item.quantity || 1), 0);
    }
    
    /**
     * Get cart total
     */
    getTotal() {
        return this.cart.reduce((sum, item) => {
            return sum + ((item.price || 0) * (item.quantity || 1));
        }, 0);
    }
}

// Global instance will be created by OAuth Manager
window.cartOAuthIntegration = null;
