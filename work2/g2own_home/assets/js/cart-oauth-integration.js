/*!
 * G2Own Enhanced Cart Integration with OAuth
 * Commerce functionality with Invision Community OAuth
 * Version: 1.0.0
 */

class G2OwnCartOAuth {
    constructor(oauthInstance) {
        this.oauth = oauthInstance;
        this.config = {
            communityURL: '#/community',
            apiVersion: 'v1'
        };
        
        // API endpoints
        this.endpoints = {
            cart: `${this.config.communityURL}/api/commerce/cart`,
            products: `${this.config.communityURL}/api/commerce/products`,
            categories: `${this.config.communityURL}/api/commerce/categories`,
            orders: `${this.config.communityURL}/api/commerce/orders`,
            checkout: `${this.config.communityURL}/store/checkout`
        };
        
        // Cart state
        this.cartItems = [];
        this.cartTotal = 0;
        this.cartCount = 0;
        
        // Product cache
        this.productsCache = new Map();
        this.categoriesCache = new Map();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadCartFromStorage();
        
        // Load cart if user is authenticated
        if (this.oauth.isUserAuthenticated()) {
            this.syncCartWithServer();
        }
        
        console.log('G2Own Cart OAuth Integration initialized');
    }
    
    setupEventListeners() {
        // OAuth events
        window.addEventListener('oauth:login:success', () => {
            this.syncCartWithServer();
        });
        
        window.addEventListener('oauth:logout:success', () => {
            this.clearLocalCart();
        });
        
        // Cart events
        document.addEventListener('click', (event) => {
            if (event.target.matches('.add-to-cart-btn, [data-action="add-to-cart"]')) {
                event.preventDefault();
                const productId = this.getProductIdFromElement(event.target);
                if (productId) {
                    this.addToCart(productId);
                }
            }
            
            if (event.target.matches('.remove-from-cart, [data-action="remove-from-cart"]')) {
                event.preventDefault();
                const productId = this.getProductIdFromElement(event.target);
                if (productId) {
                    this.removeFromCart(productId);
                }
            }
            
            if (event.target.matches('.cart-quantity-plus, [data-action="quantity-plus"]')) {
                event.preventDefault();
                const productId = this.getProductIdFromElement(event.target);
                if (productId) {
                    this.updateQuantity(productId, 1);
                }
            }
            
            if (event.target.matches('.cart-quantity-minus, [data-action="quantity-minus"]')) {
                event.preventDefault();
                const productId = this.getProductIdFromElement(event.target);
                if (productId) {
                    this.updateQuantity(productId, -1);
                }
            }
        });
    }
    
    getProductIdFromElement(element) {
        // Try multiple ways to get product ID
        const productCard = element.closest('[data-product-id]');
        if (productCard) {
            return productCard.dataset.productId;
        }
        
        const productId = element.dataset.productId;
        if (productId) {
            return productId;
        }
        
        // Try to extract from URL or other attributes
        const href = element.getAttribute('href');
        if (href) {
            const match = href.match(/product[\/\-](\d+)/);
            if (match) {
                return match[1];
            }
        }
        
        return null;
    }
    
    // Add item to cart
    async addToCart(productId, quantity = 1, options = {}) {
        try {
            this.showCartLoading(true);
            
            if (this.oauth.isUserAuthenticated()) {
                // Add to server cart via OAuth
                const result = await this.addToServerCart(productId, quantity, options);
                this.updateCartDisplay(result.cart);
                this.saveCartToStorage(result.cart);
                this.showCartNotification('Item added to cart!', 'success');
            } else {
                // Add to local cart
                await this.addToLocalCart(productId, quantity, options);
                this.showCartNotification('Item added to cart! Sign in to sync your cart.', 'info');
            }
            
            this.dispatchCartEvent('cart:item:added', { productId, quantity });
            
        } catch (error) {
            console.error('Failed to add to cart:', error);
            this.showCartNotification('Failed to add item to cart', 'error');
            this.dispatchCartEvent('cart:item:error', { productId, error });
        } finally {
            this.showCartLoading(false);
        }
    }
    
    // Add to server cart via OAuth API
    async addToServerCart(productId, quantity, options) {
        const response = await this.oauth.makeAuthenticatedRequest(this.endpoints.cart, {
            method: 'POST',
            body: JSON.stringify({
                product: productId,
                quantity: quantity,
                options: options
            })
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        return await response.json();
    }
    
    // Add to local cart (when not authenticated)
    async addToLocalCart(productId, quantity, options) {
        // Get product details first
        const product = await this.getProductDetails(productId);
        
        const existingItem = this.cartItems.find(item => item.product.id == productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cartItems.push({
                product: product,
                quantity: quantity,
                options: options,
                price: product.price,
                total: product.price * quantity
            });
        }
        
        this.updateCartTotals();
        this.updateCartDisplay();
        this.saveCartToStorage();
    }
    
    // Remove item from cart
    async removeFromCart(productId) {
        try {
            this.showCartLoading(true);
            
            if (this.oauth.isUserAuthenticated()) {
                const result = await this.removeFromServerCart(productId);
                this.updateCartDisplay(result.cart);
                this.saveCartToStorage(result.cart);
            } else {
                this.removeFromLocalCart(productId);
            }
            
            this.showCartNotification('Item removed from cart', 'success');
            this.dispatchCartEvent('cart:item:removed', { productId });
            
        } catch (error) {
            console.error('Failed to remove from cart:', error);
            this.showCartNotification('Failed to remove item', 'error');
        } finally {
            this.showCartLoading(false);
        }
    }
    
    // Remove from server cart
    async removeFromServerCart(productId) {
        const response = await this.oauth.makeAuthenticatedRequest(`${this.endpoints.cart}/${productId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        return await response.json();
    }
    
    // Remove from local cart
    removeFromLocalCart(productId) {
        this.cartItems = this.cartItems.filter(item => item.product.id != productId);
        this.updateCartTotals();
        this.updateCartDisplay();
        this.saveCartToStorage();
    }
    
    // Update item quantity
    async updateQuantity(productId, change) {
        const item = this.cartItems.find(item => item.product.id == productId);
        if (!item) return;
        
        const newQuantity = item.quantity + change;
        
        if (newQuantity <= 0) {
            this.removeFromCart(productId);
            return;
        }
        
        try {
            if (this.oauth.isUserAuthenticated()) {
                const result = await this.updateServerCartQuantity(productId, newQuantity);
                this.updateCartDisplay(result.cart);
            } else {
                item.quantity = newQuantity;
                item.total = item.price * newQuantity;
                this.updateCartTotals();
                this.updateCartDisplay();
                this.saveCartToStorage();
            }
            
            this.dispatchCartEvent('cart:quantity:updated', { productId, quantity: newQuantity });
            
        } catch (error) {
            console.error('Failed to update quantity:', error);
            this.showCartNotification('Failed to update quantity', 'error');
        }
    }
    
    // Update quantity on server
    async updateServerCartQuantity(productId, quantity) {
        const response = await this.oauth.makeAuthenticatedRequest(`${this.endpoints.cart}/${productId}`, {
            method: 'PATCH',
            body: JSON.stringify({ quantity })
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        return await response.json();
    }
    
    // Get product details
    async getProductDetails(productId) {
        // Check cache first
        if (this.productsCache.has(productId)) {
            return this.productsCache.get(productId);
        }
        
        try {
            let response;
            if (this.oauth.isUserAuthenticated()) {
                response = await this.oauth.makeAuthenticatedRequest(`${this.endpoints.products}/${productId}`);
            } else {
                response = await fetch(`${this.endpoints.products}/${productId}`);
            }
            
            if (response.ok) {
                const product = await response.json();
                this.productsCache.set(productId, product);
                return product;
            } else {
                throw new Error(`Product not found: ${productId}`);
            }
        } catch (error) {
            console.error('Failed to get product details:', error);
            throw error;
        }
    }
    
    // Load products for display
    async loadProducts(categoryId = null, filters = {}) {
        try {
            const params = new URLSearchParams();
            if (categoryId) params.append('category', categoryId);
            
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    params.append(key, value);
                }
            });
            
            const url = `${this.endpoints.products}?${params.toString()}`;
            
            let response;
            if (this.oauth.isUserAuthenticated()) {
                response = await this.oauth.makeAuthenticatedRequest(url);
            } else {
                response = await fetch(url);
            }
            
            if (response.ok) {
                const products = await response.json();
                // Cache products
                products.forEach(product => {
                    this.productsCache.set(product.id, product);
                });
                return products;
            } else {
                throw new Error('Failed to load products');
            }
        } catch (error) {
            console.error('Failed to load products:', error);
            return [];
        }
    }
    
    // Sync local cart with server
    async syncCartWithServer() {
        if (!this.oauth.isUserAuthenticated()) return;
        
        try {
            // Get server cart
            const response = await this.oauth.makeAuthenticatedRequest(this.endpoints.cart);
            
            if (response.ok) {
                const serverCart = await response.json();
                
                // Merge local cart with server cart if needed
                if (this.cartItems.length > 0) {
                    await this.mergeLocalCartWithServer();
                } else {
                    this.updateCartDisplay(serverCart);
                    this.saveCartToStorage(serverCart);
                }
            }
        } catch (error) {
            console.error('Failed to sync cart:', error);
        }
    }
    
    // Merge local cart with server cart
    async mergeLocalCartWithServer() {
        for (const localItem of this.cartItems) {
            try {
                await this.addToServerCart(
                    localItem.product.id, 
                    localItem.quantity, 
                    localItem.options
                );
            } catch (error) {
                console.warn('Failed to merge cart item:', error);
            }
        }
        
        // Clear local cart after merge
        this.cartItems = [];
        
        // Reload cart from server
        const response = await this.oauth.makeAuthenticatedRequest(this.endpoints.cart);
        if (response.ok) {
            const serverCart = await response.json();
            this.updateCartDisplay(serverCart);
            this.saveCartToStorage(serverCart);
        }
    }
    
    // Update cart display
    updateCartDisplay(serverCart = null) {
        const cart = serverCart || { items: this.cartItems, total: this.cartTotal, count: this.cartCount };
        
        // Update cart counter
        this.updateCartCounter(cart.count || cart.items.length);
        
        // Update cart sidebar/dropdown
        this.updateCartSidebar(cart);
        
        // Update any cart totals on page
        this.updateCartTotals(cart);
    }
    
    updateCartCounter(count) {
        const counters = document.querySelectorAll('.cart-count, [data-cart-count]');
        counters.forEach(counter => {
            counter.textContent = count;
            counter.style.display = count > 0 ? 'block' : 'none';
        });
    }
    
    updateCartSidebar(cart) {
        const sidebar = document.querySelector('#cart-sidebar, .cart-sidebar');
        if (!sidebar) return;
        
        const itemsContainer = sidebar.querySelector('.cart-items, [data-cart-items]');
        const totalContainer = sidebar.querySelector('.cart-total, [data-cart-total]');
        
        if (itemsContainer) {
            if (cart.items.length === 0) {
                itemsContainer.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
            } else {
                itemsContainer.innerHTML = cart.items.map(item => this.renderCartItem(item)).join('');
            }
        }
        
        if (totalContainer) {
            totalContainer.textContent = this.formatPrice(cart.total || this.cartTotal);
        }
    }
    
    renderCartItem(item) {
        return `
            <div class="cart-item" data-product-id="${item.product.id}">
                <div class="cart-item-image">
                    <img src="${item.product.image || '/assets/images/placeholder.jpg'}" alt="${item.product.name}" loading="lazy">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.product.name}</h4>
                    <div class="cart-item-price">${this.formatPrice(item.price)}</div>
                    <div class="cart-item-quantity">
                        <button class="cart-quantity-minus" data-action="quantity-minus" data-product-id="${item.product.id}">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="cart-quantity-plus" data-action="quantity-plus" data-product-id="${item.product.id}">+</button>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <button class="remove-from-cart" data-action="remove-from-cart" data-product-id="${item.product.id}">
                        <i class="ph ph-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    updateCartTotals(cart = null) {
        if (cart) {
            this.cartItems = cart.items || [];
            this.cartTotal = cart.total || 0;
            this.cartCount = cart.count || cart.items.length;
        } else {
            this.cartTotal = this.cartItems.reduce((total, item) => total + item.total, 0);
            this.cartCount = this.cartItems.length;
        }
    }
    
    // Checkout functionality
    async initiateCheckout() {
        if (!this.oauth.isUserAuthenticated()) {
            this.showCartNotification('Please sign in to checkout', 'warning');
            this.oauth.initiateLogin({ prompt: 'login' });
            return;
        }
        
        if (this.cartItems.length === 0) {
            this.showCartNotification('Your cart is empty', 'warning');
            return;
        }
        
        try {
            // Prepare checkout data
            const checkoutData = {
                return_url: `${window.location.origin}/checkout/success`,
                cancel_url: `${window.location.origin}/checkout/cancel`,
                items: this.cartItems
            };
            
            // Store checkout data
            sessionStorage.setItem('g2own_checkout_data', JSON.stringify(checkoutData));
            
            // Redirect to community checkout
            window.location.href = this.endpoints.checkout;
            
        } catch (error) {
            console.error('Checkout initiation failed:', error);
            this.showCartNotification('Checkout failed. Please try again.', 'error');
        }
    }
    
    // Storage management
    saveCartToStorage(serverCart = null) {
        const cart = serverCart || { items: this.cartItems, total: this.cartTotal, count: this.cartCount };
        localStorage.setItem('g2own_cart', JSON.stringify(cart));
    }
    
    loadCartFromStorage() {
        try {
            const stored = localStorage.getItem('g2own_cart');
            if (stored) {
                const cart = JSON.parse(stored);
                this.cartItems = cart.items || [];
                this.cartTotal = cart.total || 0;
                this.cartCount = cart.count || 0;
                this.updateCartDisplay();
            }
        } catch (error) {
            console.error('Failed to load cart from storage:', error);
        }
    }
    
    clearLocalCart() {
        this.cartItems = [];
        this.cartTotal = 0;
        this.cartCount = 0;
        localStorage.removeItem('g2own_cart');
        this.updateCartDisplay();
    }
    
    // UI helpers
    showCartLoading(show) {
        const elements = document.querySelectorAll('.cart-loading, [data-cart-loading]');
        elements.forEach(el => {
            el.style.display = show ? 'block' : 'none';
        });
    }
    
    showCartNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `cart-notification cart-notification-${type}`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove
        setTimeout(() => {
            notification.remove();
        }, 5000);
        
        // Dispatch event for enhanced-main.js to handle
        this.dispatchCartEvent('cart:notification', { message, type });
    }
    
    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }
    
    dispatchCartEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
    }
    
    // Public API
    getCart() {
        return {
            items: this.cartItems,
            total: this.cartTotal,
            count: this.cartCount
        };
    }
    
    getCartCount() {
        return this.cartCount;
    }
    
    getCartTotal() {
        return this.cartTotal;
    }
    
    isEmpty() {
        return this.cartItems.length === 0;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = G2OwnCartOAuth;
} else {
    window.G2OwnCartOAuth = G2OwnCartOAuth;
}
