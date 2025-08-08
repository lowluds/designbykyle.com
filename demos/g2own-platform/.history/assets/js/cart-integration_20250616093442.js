/*!
 * Cart Integration for G2Own Marketplace
 * Synchronizes cart count and handles cart-related UI updates
 * Version: 1.0.0
 */

class CartIntegration {
    constructor() {
        this.cartCount = 0;
        this.cartItems = [];
        this.cartIndicator = null;
        this.floatingCartButton = null;
        this.communityURL = 'https://g2own.com/community';
        this.cartURL = this.communityURL + '/store/cart/';
        
        this.init();
    }

    init() {
        console.log('🛒 Initializing Cart Integration...');
        
        this.createCartElements();
        this.setupEventHandlers();
        this.syncCartData();
        
        // Auto-sync every 30 seconds
        setInterval(() => this.syncCartData(), 30000);
    }

    createCartElements() {
        // Create cart indicator for navbar
        this.createCartIndicator();
        
        // Create floating cart button
        this.createFloatingCartButton();
    }

    createCartIndicator() {
        // Find navbar and inject cart indicator
        const navbar = document.querySelector('.top-nav-user-actions') || 
                      document.querySelector('.nav-links') || 
                      document.querySelector('.mobile-nav-links');
        
        if (navbar) {
            const cartIndicator = document.createElement('div');
            cartIndicator.className = 'cart-indicator';
            cartIndicator.innerHTML = `
                <button class="cart-btn" title="Shopping Cart">
                    <i class="ph ph-shopping-cart"></i>
                    <span class="cart-count" style="display: none;">0</span>
                </button>
            `;
            
            // Insert before last element or append
            if (navbar.lastElementChild) {
                navbar.insertBefore(cartIndicator, navbar.lastElementChild);
            } else {
                navbar.appendChild(cartIndicator);
            }
            
            this.cartIndicator = cartIndicator;
            
            // Add click handler
            cartIndicator.querySelector('.cart-btn').addEventListener('click', () => {
                this.openCart();
            });
        }
    }

    createFloatingCartButton() {
        // Create floating cart button for mobile/quick access
        const floatingBtn = document.createElement('div');
        floatingBtn.className = 'floating-cart-btn';
        floatingBtn.style.display = 'none'; // Hidden initially
        floatingBtn.innerHTML = `
            <button class="fab-cart-btn" title="Shopping Cart">
                <i class="ph ph-shopping-cart"></i>
                <span class="fab-cart-count">0</span>
            </button>
        `;
        
        document.body.appendChild(floatingBtn);
        this.floatingCartButton = floatingBtn;
        
        // Add click handler
        floatingBtn.querySelector('.fab-cart-btn').addEventListener('click', () => {
            this.openCart();
        });
    }

    async syncCartData() {
        try {
            // Try to get cart data from Invision Community API
            const response = await fetch(`${this.communityURL}/api/commerce/cart`, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                const cartData = await response.json();
                this.updateCartCount(cartData.count || 0);
                this.cartItems = cartData.items || [];
            } else {
                // Fallback: Check localStorage for cart data
                this.syncLocalCart();
            }
        } catch (error) {
            console.log('Cart sync using local storage fallback');
            this.syncLocalCart();
        }
    }

    syncLocalCart() {
        // Fallback: Use local storage to track cart
        const localCart = localStorage.getItem('g2own_cart');
        if (localCart) {
            try {
                const cartData = JSON.parse(localCart);
                this.updateCartCount(cartData.length || 0);
                this.cartItems = cartData;
            } catch (e) {
                this.updateCartCount(0);
                this.cartItems = [];
            }
        }
    }

    updateCartCount(count) {
        this.cartCount = count;
        
        // Update navbar cart indicator
        if (this.cartIndicator) {
            const countEl = this.cartIndicator.querySelector('.cart-count');
            if (countEl) {
                countEl.textContent = count;
                countEl.style.display = count > 0 ? 'flex' : 'none';
            }
        }
        
        // Update floating cart button
        if (this.floatingCartButton) {
            const countEl = this.floatingCartButton.querySelector('.fab-cart-count');
            if (countEl) {
                countEl.textContent = count;
                this.floatingCartButton.style.display = count > 0 ? 'block' : 'none';
            }
        }
        
        // Trigger custom event for other components
        window.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: { count, items: this.cartItems }
        }));
    }

    openCart() {
        // Open cart in new tab/window or modal
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // Mobile: Open in same window
            window.location.href = this.cartURL;
        } else {
            // Desktop: Open in new tab
            window.open(this.cartURL, '_blank', 'noopener,noreferrer');
        }
    }

    addToCart(productId, quantity = 1) {
        // Add product to cart (for future custom implementation)
        const cartItem = {
            id: productId,
            quantity: quantity,
            timestamp: Date.now()
        };
        
        // Update local storage
        let localCart = [];
        try {
            localCart = JSON.parse(localStorage.getItem('g2own_cart') || '[]');
        } catch (e) {
            localCart = [];
        }
        
        localCart.push(cartItem);
        localStorage.setItem('g2own_cart', JSON.stringify(localCart));
        
        // Update UI
        this.updateCartCount(localCart.length);
        
        // Show notification
        this.showCartNotification('Product added to cart!');
    }

    removeFromCart(productId) {
        // Remove product from cart
        let localCart = [];
        try {
            localCart = JSON.parse(localStorage.getItem('g2own_cart') || '[]');
        } catch (e) {
            localCart = [];
        }
        
        localCart = localCart.filter(item => item.id !== productId);
        localStorage.setItem('g2own_cart', JSON.stringify(localCart));
        
        // Update UI
        this.updateCartCount(localCart.length);
        
        // Show notification
        this.showCartNotification('Product removed from cart!');
    }

    showCartNotification(message) {
        // Create and show cart notification
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <div class="cart-notification-content">
                <i class="ph ph-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    setupEventHandlers() {
        // Listen for manual cart updates
        window.addEventListener('addToCart', (e) => {
            this.addToCart(e.detail.productId, e.detail.quantity);
        });
        
        window.addEventListener('removeFromCart', (e) => {
            this.removeFromCart(e.detail.productId);
        });
        
        // Listen for page visibility changes to sync cart
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.syncCartData();
            }
        });
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.cartIntegration = new CartIntegration();
    });
} else {
    window.cartIntegration = new CartIntegration();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartIntegration;
}
