/*!
 * G2Own Product Display with OAuth Integration
 * Dynamic product loading and display system
 * Version: 1.0.0
 */

class G2OwnProductDisplay {
    constructor(oauthInstance, cartInstance) {
        this.oauth = oauthInstance;
        this.cart = cartInstance;
        
        this.config = {
            communityURL: 'https://g2own.com/community',
            productsPerPage: 12,
            lazyLoadOffset: 200
        };
        
        // State management
        this.products = [];
        this.categories = [];
        this.currentCategory = null;
        this.currentPage = 1;
        this.isLoading = false;
        this.hasMoreProducts = true;
        
        // Filters
        this.filters = {
            category: null,
            priceMin: null,
            priceMax: null,
            sortBy: 'name',
            sortOrder: 'asc',
            search: ''
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadCategories();
        this.loadInitialProducts();
        this.setupIntersectionObserver();
        
        console.log('G2Own Product Display initialized');
    }
    
    setupEventListeners() {
        // Search functionality
        const searchInput = document.querySelector('#product-search, [data-product-search]');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (event) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.filters.search = event.target.value;
                    this.resetAndReload();
                }, 500);
            });
        }
        
        // Category filters
        document.addEventListener('click', (event) => {
            if (event.target.matches('.category-filter, [data-category-filter]')) {
                event.preventDefault();
                const categoryId = event.target.dataset.categoryId || event.target.dataset.categoryFilter;
                this.setCategory(categoryId);
            }
            
            if (event.target.matches('.sort-option, [data-sort]')) {
                event.preventDefault();
                const sortBy = event.target.dataset.sortBy || event.target.dataset.sort;
                const sortOrder = event.target.dataset.sortOrder || 'asc';
                this.setSorting(sortBy, sortOrder);
            }
            
            if (event.target.matches('.load-more-btn, [data-action="load-more"]')) {
                event.preventDefault();
                this.loadMoreProducts();
            }
        });
        
        // Price filter
        const priceMinInput = document.querySelector('#price-min, [data-price-min]');
        const priceMaxInput = document.querySelector('#price-max, [data-price-max]');
        
        if (priceMinInput && priceMaxInput) {
            let priceTimeout;
            const handlePriceFilter = () => {
                clearTimeout(priceTimeout);
                priceTimeout = setTimeout(() => {
                    this.filters.priceMin = parseFloat(priceMinInput.value) || null;
                    this.filters.priceMax = parseFloat(priceMaxInput.value) || null;
                    this.resetAndReload();
                }, 500);
            };
            
            priceMinInput.addEventListener('input', handlePriceFilter);
            priceMaxInput.addEventListener('input', handlePriceFilter);
        }
        
        // OAuth events
        window.addEventListener('oauth:login:success', () => {
            this.reloadProducts();
        });
        
        window.addEventListener('oauth:logout:success', () => {
            this.reloadProducts();
        });
    }
    
    async loadCategories() {
        try {
            let response;
            if (this.oauth.isUserAuthenticated()) {
                response = await this.oauth.makeAuthenticatedRequest(`${this.config.communityURL}/api/commerce/categories`);
            } else {
                response = await fetch(`${this.config.communityURL}/api/commerce/categories`);
            }
            
            if (response.ok) {
                this.categories = await response.json();
                this.renderCategoryFilters();
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }
    
    renderCategoryFilters() {
        const container = document.querySelector('.category-filters, [data-category-filters]');
        if (!container) return;
        
        const filtersHTML = `
            <div class="category-filter-list">
                <button class="category-filter ${!this.currentCategory ? 'active' : ''}" 
                        data-category-id="">
                    All Products
                </button>
                ${this.categories.map(category => `
                    <button class="category-filter ${this.currentCategory === category.id ? 'active' : ''}" 
                            data-category-id="${category.id}">
                        ${category.name}
                        <span class="category-count">${category.product_count || 0}</span>
                    </button>
                `).join('')}
            </div>
        `;
        
        container.innerHTML = filtersHTML;
    }
    
    async loadInitialProducts() {
        this.currentPage = 1;
        this.products = [];
        this.hasMoreProducts = true;
        await this.loadProducts();
    }
    
    async loadMoreProducts() {
        if (this.isLoading || !this.hasMoreProducts) return;
        
        this.currentPage++;
        await this.loadProducts(true);
    }
    
    async loadProducts(append = false) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoadingState(true);
        
        try {
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: this.config.productsPerPage,
                sort_by: this.filters.sortBy,
                sort_order: this.filters.sortOrder
            });
            
            // Add filters
            if (this.filters.category) params.append('category', this.filters.category);
            if (this.filters.priceMin) params.append('price_min', this.filters.priceMin);
            if (this.filters.priceMax) params.append('price_max', this.filters.priceMax);
            if (this.filters.search) params.append('search', this.filters.search);
            
            const url = `${this.config.communityURL}/api/commerce/products?${params.toString()}`;
            
            let response;
            if (this.oauth.isUserAuthenticated()) {
                response = await this.oauth.makeAuthenticatedRequest(url);
            } else {
                response = await fetch(url);
            }
            
            if (response.ok) {
                const data = await response.json();
                const newProducts = data.products || data;
                
                if (append) {
                    this.products = [...this.products, ...newProducts];
                } else {
                    this.products = newProducts;
                }
                
                this.hasMoreProducts = newProducts.length === this.config.productsPerPage;
                this.renderProducts();
                this.updateLoadMoreButton();
                
            } else {
                throw new Error(`Failed to load products: ${response.status}`);
            }
            
        } catch (error) {
            console.error('Error loading products:', error);
            this.showErrorState('Failed to load products. Please try again.');
        } finally {
            this.isLoading = false;
            this.showLoadingState(false);
        }
    }
    
    renderProducts() {
        const container = document.querySelector('.products-grid, [data-products-grid]');
        if (!container) return;
        
        if (this.products.length === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }
        
        const productsHTML = this.products.map(product => this.renderProductCard(product)).join('');
        container.innerHTML = productsHTML;
        
        // Setup lazy loading for images
        this.setupLazyLoading();
    }
    
    renderProductCard(product) {
        const isInCart = this.cart.getCart().items.some(item => item.product.id === product.id);
        const userCanPurchase = this.oauth.isUserAuthenticated();
        
        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image-container">
                    <img class="product-image lazy-image" 
                         data-src="${product.image || '/assets/images/placeholder-product.jpg'}" 
                         alt="${product.name}"
                         loading="lazy">
                    
                    ${product.discount_percentage ? `
                        <div class="product-badge discount">
                            -${product.discount_percentage}%
                        </div>
                    ` : ''}
                    
                    ${product.is_featured ? `
                        <div class="product-badge featured">
                            Featured
                        </div>
                    ` : ''}
                    
                    <div class="product-overlay">
                        <button class="product-quick-view" data-action="quick-view" data-product-id="${product.id}">
                            <i class="ph ph-eye"></i>
                            Quick View
                        </button>
                    </div>
                </div>
                
                <div class="product-info">
                    <div class="product-category">${product.category_name || 'Digital Goods'}</div>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.short_description || ''}</p>
                    
                    <div class="product-rating">
                        ${this.renderStarRating(product.rating || 0)}
                        <span class="rating-count">(${product.review_count || 0})</span>
                    </div>
                    
                    <div class="product-pricing">
                        ${product.original_price && product.original_price !== product.price ? `
                            <span class="original-price">$${product.original_price}</span>
                        ` : ''}
                        <span class="current-price">$${product.price}</span>
                    </div>
                    
                    <div class="product-actions">
                        ${userCanPurchase ? `
                            <button class="add-to-cart-btn ${isInCart ? 'in-cart' : ''}" 
                                    data-action="add-to-cart" 
                                    data-product-id="${product.id}"
                                    ${isInCart ? 'disabled' : ''}>
                                <i class="ph ${isInCart ? 'ph-check' : 'ph-shopping-cart'}"></i>
                                ${isInCart ? 'In Cart' : 'Add to Cart'}
                            </button>
                        ` : `
                            <button class="login-to-purchase-btn" data-action="login-required">
                                <i class="ph ph-sign-in"></i>
                                Sign In to Purchase
                            </button>
                        `}
                        
                        <button class="product-wishlist" data-action="toggle-wishlist" data-product-id="${product.id}">
                            <i class="ph ph-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let starsHTML = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="ph ph-star-fill"></i>';
        }
        
        // Half star
        if (hasHalfStar) {
            starsHTML += '<i class="ph ph-star-half"></i>';
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="ph ph-star"></i>';
        }
        
        return `<div class="star-rating" data-rating="${rating}">${starsHTML}</div>`;
    }
    
    renderEmptyState() {
        return `
            <div class="products-empty-state">
                <div class="empty-state-icon">
                    <i class="ph ph-package"></i>
                </div>
                <h3>No Products Found</h3>
                <p>Try adjusting your filters or search terms to find what you're looking for.</p>
                <button class="clear-filters-btn" data-action="clear-filters">
                    Clear All Filters
                </button>
            </div>
        `;
    }
    
    setupLazyLoading() {
        const lazyImages = document.querySelectorAll('.lazy-image[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy-image');
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    }
    
    setupIntersectionObserver() {
        const loadMoreTrigger = document.querySelector('.load-more-trigger, [data-load-more-trigger]');
        if (!loadMoreTrigger) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && this.hasMoreProducts && !this.isLoading) {
                    this.loadMoreProducts();
                }
            });
        }, {
            rootMargin: `${this.config.lazyLoadOffset}px`
        });
        
        observer.observe(loadMoreTrigger);
    }
    
    setCategory(categoryId) {
        this.filters.category = categoryId || null;
        this.currentCategory = categoryId;
        this.resetAndReload();
        this.updateCategoryFilters();
    }
    
    setSorting(sortBy, sortOrder = 'asc') {
        this.filters.sortBy = sortBy;
        this.filters.sortOrder = sortOrder;
        this.resetAndReload();
        this.updateSortingControls();
    }
    
    updateCategoryFilters() {
        const filters = document.querySelectorAll('.category-filter');
        filters.forEach(filter => {
            const categoryId = filter.dataset.categoryId;
            filter.classList.toggle('active', categoryId === this.currentCategory);
        });
    }
    
    updateSortingControls() {
        const sortControls = document.querySelectorAll('.sort-option');
        sortControls.forEach(control => {
            const sortBy = control.dataset.sortBy;
            control.classList.toggle('active', sortBy === this.filters.sortBy);
        });
    }
    
    updateLoadMoreButton() {
        const loadMoreBtn = document.querySelector('.load-more-btn, [data-action="load-more"]');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = this.hasMoreProducts ? 'block' : 'none';
            loadMoreBtn.disabled = this.isLoading;
            loadMoreBtn.textContent = this.isLoading ? 'Loading...' : 'Load More Products';
        }
    }
    
    resetAndReload() {
        this.currentPage = 1;
        this.products = [];
        this.hasMoreProducts = true;
        this.loadProducts();
    }
    
    reloadProducts() {
        this.resetAndReload();
    }
    
    showLoadingState(show) {
        const loadingElements = document.querySelectorAll('.products-loading, [data-products-loading]');
        loadingElements.forEach(el => {
            el.style.display = show ? 'block' : 'none';
        });
    }
    
    showErrorState(message) {
        const container = document.querySelector('.products-grid, [data-products-grid]');
        if (container) {
            container.innerHTML = `
                <div class="products-error-state">
                    <div class="error-icon">
                        <i class="ph ph-warning"></i>
                    </div>
                    <h3>Error Loading Products</h3>
                    <p>${message}</p>
                    <button class="retry-btn" onclick="this.reloadProducts()">
                        Try Again
                    </button>
                </div>
            `;
        }
    }
    
    // Public API methods
    getProducts() {
        return this.products;
    }
    
    getProduct(productId) {
        return this.products.find(p => p.id === productId);
    }
    
    searchProducts(query) {
        this.filters.search = query;
        this.resetAndReload();
    }
    
    clearFilters() {
        this.filters = {
            category: null,
            priceMin: null,
            priceMax: null,
            sortBy: 'name',
            sortOrder: 'asc',
            search: ''
        };
        this.currentCategory = null;
        
        // Clear form inputs
        const searchInput = document.querySelector('#product-search, [data-product-search]');
        if (searchInput) searchInput.value = '';
        
        const priceMinInput = document.querySelector('#price-min, [data-price-min]');
        if (priceMinInput) priceMinInput.value = '';
        
        const priceMaxInput = document.querySelector('#price-max, [data-price-max]');
        if (priceMaxInput) priceMaxInput.value = '';
        
        this.resetAndReload();
        this.updateCategoryFilters();
        this.updateSortingControls();
    }
    
    showProductModal(productId) {
        const product = this.getProduct(productId);
        if (!product) return;
        
        // Create and show product modal
        const modal = this.createProductModal(product);
        document.body.appendChild(modal);
        
        // Show modal with animation
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });
    }
    
    createProductModal(product) {
        const modal = document.createElement('div');
        modal.className = 'product-modal';
        modal.innerHTML = `
            <div class="product-modal-backdrop" data-close-modal></div>
            <div class="product-modal-content">
                <button class="product-modal-close" data-close-modal>
                    <i class="ph ph-x"></i>
                </button>
                
                <div class="product-modal-body">
                    <div class="product-modal-image">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    
                    <div class="product-modal-info">
                        <h2>${product.name}</h2>
                        <div class="product-price">$${product.price}</div>
                        <div class="product-description">${product.description || product.short_description}</div>
                        
                        <div class="product-modal-actions">
                            <button class="add-to-cart-btn" data-action="add-to-cart" data-product-id="${product.id}">
                                <i class="ph ph-shopping-cart"></i>
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners
        modal.addEventListener('click', (event) => {
            if (event.target.matches('[data-close-modal]')) {
                this.closeProductModal(modal);
            }
        });
        
        return modal;
    }
    
    closeProductModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = G2OwnProductDisplay;
} else {
    window.G2OwnProductDisplay = G2OwnProductDisplay;
}
