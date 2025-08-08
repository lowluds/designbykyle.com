/*!
 * G2Own Invision Community E-commerce Integration
 * Integrates all features from https://g2own.com/community/ store
 * Maintains current color scheme and design
 * Version: 1.0.0
 */

class G2OwnCommerceIntegration {
    constructor() {
        this.communityURL = 'https://g2own.com/community';
        this.storeURL = this.communityURL + '/store/';
        this.apiURL = this.communityURL + '/api/';
        
        // Store categories from the community
        this.categories = {
            'game-accounts': {
                id: 1,
                name: 'Game Accounts',
                url: 'category/1-game-accounts/',
                description: 'Premium gaming accounts ready to play',
                icon: 'ph ph-game-controller',
                color: 'var(--primary-red)'
            },
            'movie-accounts': {
                id: 2,
                name: 'Movie Accounts',
                url: 'category/2-movie-accounts/',
                description: 'Netflix, Disney+, and streaming services',
                icon: 'ph ph-television',
                color: 'var(--primary-red)'
            },
            'software-accounts': {
                id: 3,
                name: 'Software Accounts',
                url: 'category/3-software-accounts/',
                description: 'VPN, antivirus, and productivity software',
                icon: 'ph ph-desktop-tower',
                color: 'var(--primary-red)'
            }
        };
        
        // Product data structure
        this.products = [];
        this.featuredProducts = [];
        this.cartItems = [];
        this.cartCount = 0;
        this.isAuthenticated = false;
        
        this.init();
    }

    async init() {
        console.log('🛒 Initializing G2Own Commerce Integration...');
        
        try {
            await this.loadProducts();
            await this.checkAuthStatus();
            this.createStoreElements();
            this.setupEventHandlers();
            this.injectStoreNavigation();
            this.createFeaturedSection();
            this.createCartSystem();
            
            console.log('✅ G2Own Commerce Integration initialized successfully');
        } catch (error) {
            console.log('⚠️ Commerce integration using fallback mode:', error.message);
            this.setupStaticIntegration();
        }
    }

    async loadProducts() {
        // Load products from community store
        try {
            // This would normally fetch from the API, but for now we'll use static data
            // based on what we saw from the community store
            this.products = [
                {
                    id: 6,
                    name: 'WINDOWS 10 KEY',
                    price: 5,
                    category: 'software-accounts',
                    url: 'product/6-windows-10-key/',
                    description: 'Genuine Windows 10 activation key'
                },
                {
                    id: 5,
                    name: 'NORD VPN ACCOUNT',
                    price: 5,
                    category: 'software-accounts',
                    url: 'product/5-nord-vpn-account/',
                    description: 'Premium NordVPN account access'
                },
                {
                    id: 4,
                    name: 'DISNEY+ ACCOUNT',
                    price: 5,
                    category: 'movie-accounts',
                    url: 'product/4-disney-account/',
                    description: 'Disney+ streaming account'
                },
                {
                    id: 3,
                    name: 'NETFLIX ACCOUNT',
                    price: 5,
                    category: 'movie-accounts',
                    url: 'product/3-netflix-account/',
                    description: 'Netflix premium account'
                },
                {
                    id: 2,
                    name: 'RUST',
                    price: 10,
                    category: 'game-accounts',
                    url: 'product/2-rust/',
                    description: 'Rust game account'
                },
                {
                    id: 1,
                    name: 'DEATHLOOP',
                    price: 10,
                    category: 'game-accounts',
                    url: 'product/1-deathloop/',
                    description: 'Deathloop game account'
                }
            ];
            
            // Set featured products (latest ones)
            this.featuredProducts = this.products.slice(0, 4);
        } catch (error) {
            console.log('Using static product data');
        }
    }

    async checkAuthStatus() {
        // Check if user is authenticated with community
        try {
            const response = await fetch(`${this.communityURL}/api/core/me`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const userData = await response.json();
                this.isAuthenticated = true;
                this.userdata = userData;
            }
        } catch (error) {
            console.log('Authentication check failed, using guest mode');
        }
    }

    createStoreElements() {
        // Create the main store section
        this.createStoreSection();
        
        // Create category navigation
        this.createCategoryGrid();
        
        // Create product showcase
        this.createProductShowcase();
    }

    createStoreSection() {
        // Find where to inject the store section
        const heroSection = document.querySelector('.hero') || document.querySelector('#hero');
        const supportSection = document.querySelector('.support-section');
        
        if (heroSection && supportSection) {
            const storeSection = document.createElement('section');
            storeSection.className = 'g2own-store-section';
            storeSection.id = 'marketplace';
            storeSection.innerHTML = this.getStoreSectionHTML();
            
            // Insert between hero and support
            supportSection.parentNode.insertBefore(storeSection, supportSection);
        }
    }

    getStoreSectionHTML() {
        return `
            <div class="container">
                <!-- Store Header -->
                <div class="store-header">
                    <div class="section-badge">
                        <i class="ph ph-storefront gaming-icon"></i>
                        <span>G2Own Store</span>
                    </div>
                    <h2 class="section-title">
                        <span class="gradient-text">Premium Digital Marketplace</span>
                    </h2>
                    <p class="section-subtitle">
                        Discover amazing deals on games, accounts, and digital services
                    </p>
                </div>
                
                <!-- Quick Store Navigation -->
                <div class="store-quick-nav">
                    <a href="${this.storeURL}" class="store-nav-btn primary" target="_blank">
                        <i class="ph ph-shopping-cart"></i>
                        <span>Browse All Products</span>
                    </a>
                    <a href="${this.storeURL}cart/" class="store-nav-btn secondary" target="_blank">
                        <i class="ph ph-shopping-bag"></i>
                        <span>View Cart (<span id="cart-count">0</span>)</span>
                    </a>
                </div>
                
                <!-- Categories Grid -->
                <div class="store-categories" id="store-categories-grid"></div>
                
                <!-- Featured Products -->
                <div class="store-featured" id="store-featured-products"></div>
            </div>
        `;
    }

    createCategoryGrid() {
        const categoriesGrid = document.getElementById('store-categories-grid');
        if (!categoriesGrid) return;
        
        const categoriesHTML = Object.entries(this.categories).map(([slug, category]) => `
            <div class="category-card" data-category="${slug}" onclick="window.open('${this.storeURL}${category.url}', '_blank')">
                <div class="category-icon">
                    <i class="${category.icon}"></i>
                </div>
                <div class="category-content">
                    <h3 class="category-title">${category.name}</h3>
                    <p class="category-description">${category.description}</p>
                    <div class="category-stats">
                        ${this.getProductCountForCategory(slug)} products
                    </div>
                </div>
                <div class="category-arrow">
                    <i class="ph ph-arrow-right"></i>
                </div>
                <div class="category-glow"></div>
            </div>
        `).join('');
        
        categoriesGrid.innerHTML = `
            <div class="categories-header">
                <h3>Shop by Category</h3>
            </div>
            <div class="categories-grid">
                ${categoriesHTML}
            </div>
        `;
    }

    createProductShowcase() {
        const featuredContainer = document.getElementById('store-featured-products');
        if (!featuredContainer) return;
        
        const productsHTML = this.featuredProducts.map(product => `
            <div class="product-card" data-product-id="${product.id}" onclick="window.open('${this.storeURL}${product.url}', '_blank')">
                <div class="product-image">
                    <i class="ph ph-package"></i>
                    <div class="product-price">$${product.price}</div>
                </div>
                <div class="product-info">
                    <h4 class="product-title">${product.name}</h4>
                    <p class="product-description">${product.description}</p>
                    <div class="product-category">${this.categories[product.category]?.name || 'Digital Product'}</div>
                </div>
                <div class="product-actions">
                    <button class="product-btn view-btn" onclick="event.stopPropagation(); window.open('${this.storeURL}${product.url}', '_blank')">
                        <i class="ph ph-eye"></i>
                        View Details
                    </button>
                    <button class="product-btn cart-btn" onclick="event.stopPropagation(); this.addToCart(${product.id})">
                        <i class="ph ph-shopping-cart"></i>
                        Add to Cart
                    </button>
                </div>
                <div class="product-glow"></div>
            </div>
        `).join('');
        
        featuredContainer.innerHTML = `
            <div class="featured-header">
                <h3>Featured Products</h3>
                <a href="${this.storeURL}" class="view-all-btn" target="_blank">
                    View All Products <i class="ph ph-arrow-right"></i>
                </a>
            </div>
            <div class="products-grid">
                ${productsHTML}
            </div>
        `;
    }

    createCartSystem() {
        // Add cart indicator to navbar
        this.addCartToNavbar();
        
        // Create floating cart for mobile
        this.createFloatingCart();
        
        // Load cart from localStorage
        this.loadCartFromStorage();
    }

    addCartToNavbar() {
        const navLinks = document.querySelector('.nav-links') || document.querySelector('.top-nav-user-actions');
        
        if (navLinks) {
            const cartIndicator = document.createElement('div');
            cartIndicator.className = 'nav-cart-indicator';
            cartIndicator.innerHTML = `
                <a href="${this.storeURL}cart/" class="cart-link" target="_blank">
                    <i class="ph ph-shopping-cart"></i>
                    <span class="cart-badge" id="nav-cart-count">0</span>
                </a>
            `;
            
            navLinks.appendChild(cartIndicator);
        }
    }

    createFloatingCart() {
        const floatingCart = document.createElement('div');
        floatingCart.className = 'floating-cart';
        floatingCart.id = 'floating-cart';
        floatingCart.style.display = 'none';
        floatingCart.innerHTML = `
            <button class="floating-cart-btn" onclick="window.open('${this.storeURL}cart/', '_blank')">
                <i class="ph ph-shopping-cart"></i>
                <span class="floating-cart-count" id="floating-cart-count">0</span>
            </button>
        `;
        
        document.body.appendChild(floatingCart);
    }

    getProductCountForCategory(categorySlug) {
        return this.products.filter(p => p.category === categorySlug).length;
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        // Add to local cart
        this.cartItems.push(product);
        this.updateCartCount();
        
        // Save to localStorage
        localStorage.setItem('g2own_cart', JSON.stringify(this.cartItems));
        
        // Show notification
        this.showNotification(`${product.name} added to cart!`, 'success');
        
        // In a real implementation, this would also send to the community API
        this.syncCartWithCommunity();
    }

    updateCartCount() {
        this.cartCount = this.cartItems.length;
        
        // Update all cart indicators
        const cartElements = [
            document.getElementById('cart-count'),
            document.getElementById('nav-cart-count'),
            document.getElementById('floating-cart-count')
        ];
        
        cartElements.forEach(el => {
            if (el) {
                el.textContent = this.cartCount;
            }
        });
        
        // Show/hide floating cart
        const floatingCart = document.getElementById('floating-cart');
        if (floatingCart) {
            floatingCart.style.display = this.cartCount > 0 ? 'block' : 'none';
        }
    }

    loadCartFromStorage() {
        try {
            const savedCart = localStorage.getItem('g2own_cart');
            if (savedCart) {
                this.cartItems = JSON.parse(savedCart);
                this.updateCartCount();
            }
        } catch (error) {
            console.log('Failed to load cart from storage');
        }
    }

    async syncCartWithCommunity() {
        // This would sync the cart with the community store
        // For now, we'll just log it
        console.log('Cart synced:', this.cartItems);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `store-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
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

    injectStoreNavigation() {
        // Update existing navigation links to point to store
        const marketplaceLinks = document.querySelectorAll('a[href="#marketplace"], a[data-section="marketplace"]');
        
        marketplaceLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('marketplace')?.scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
        
        // Update "Explore Marketplace" button
        const exploreBtn = document.querySelector('[data-action="explore"]');
        if (exploreBtn) {
            exploreBtn.addEventListener('click', () => {
                document.getElementById('marketplace')?.scrollIntoView({
                    behavior: 'smooth'
                });
            });
        }
    }

    setupEventHandlers() {
        // Handle window resize for mobile optimization
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Handle page visibility for cart sync
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.syncCartWithCommunity();
            }
        });
    }

    handleResize() {
        // Adjust layout for mobile
        const isMobile = window.innerWidth <= 768;
        const storeSection = document.querySelector('.g2own-store-section');
        
        if (storeSection) {
            storeSection.classList.toggle('mobile-layout', isMobile);
        }
    }

    setupStaticIntegration() {
        // Fallback for when API is not available
        console.log('Setting up static integration...');
        this.createStoreElements();
        this.createCartSystem();
        this.injectStoreNavigation();
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.g2ownCommerce = new G2OwnCommerceIntegration();
    });
} else {
    window.g2ownCommerce = new G2OwnCommerceIntegration();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = G2OwnCommerceIntegration;
}
