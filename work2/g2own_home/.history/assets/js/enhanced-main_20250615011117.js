// G2Own Enhanced Main JavaScript - Advanced Features & Modern UI
// Comprehensive functionality for the optimized G2Own website

class G2OwnEnhanced {
    constructor() {
        this.state = {
            isLoading: true,
            cartItems: [],
            notifications: [],
            currentTheme: 'dark',
            mobileMenuOpen: false,
            cartOpen: false,
            searchActive: false
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeLoadingScreen();
        this.initializeNavigation();
        this.initializeComponents();
        this.initializeAnimations();
        this.initializeParticles();
        console.log('G2Own Enhanced Website initialized');
    }

    setupEventListeners() {
        // Core event listeners
        document.addEventListener('DOMContentLoaded', () => {
            this.onDOMReady();
        });

        window.addEventListener('load', () => {
            this.onWindowLoad();
        });

        window.addEventListener('resize', this.debounce(() => {
            this.onWindowResize();
        }, 250));

        window.addEventListener('scroll', this.throttle(() => {
            this.onWindowScroll();
        }, 16));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    onDOMReady() {
        // Initialize components that need DOM to be ready
        this.initializeMobileMenu();
        this.initializeCartSidebar();
        this.initializeSearchFunctionality();
        this.initializeNotificationSystem();
        this.initializeScrollAnimations();
        this.initializeTrustBadges();
        this.initializeProgressBars();
    }

    onWindowLoad() {
        // Remove loading screen and initialize heavy components
        this.hideLoadingScreen();
        this.initializeHeavyAnimations();
        this.initializeIntersectionObserver();
        this.initializeGameCards();
        this.preloadImages();
    }

    onWindowResize() {
        this.updateCarouselDimensions();
        this.updateParticleCount();
        this.updateMobileMenuLayout();
    }    onWindowScroll() {
        // Legacy navbar functionality - disabled for NavbarController
        // this.updateNavbarOnScroll();
        this.updateScrollProgress();
        this.updateParallaxEffects();
        this.updateActiveNavigation();
    }

    // ============ LOADING SCREEN MANAGEMENT ============
    initializeLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const progressBar = document.getElementById('loading-progress');
        const progressText = document.getElementById('loading-text');
        
        if (loadingScreen && progressBar && progressText) {
            this.animateLoadingProgress(progressBar, progressText);
        }
    }

    animateLoadingProgress(progressBar, progressText) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    this.hideLoadingScreen();
                }, 500);
            }
            
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}%`;
        }, 100);
    }    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                document.body.classList.remove('loading');
                this.state.isLoading = false;
                this.triggerPageLoadAnimations();
            }, 500);
        }
    }

    triggerPageLoadAnimations() {
        // Add staggered animations for main content
        const hero = document.getElementById('hero');
        const navbar = document.getElementById('navbar');
        
        if (navbar) {
            navbar.style.transform = 'translateY(-100%)';
            setTimeout(() => {
                navbar.style.transition = 'transform 0.8s ease';
                navbar.style.transform = 'translateY(0)';
            }, 200);
        }

        if (hero) {
            const heroElements = hero.querySelectorAll('h1, p, .btn, .trust-indicators');
            heroElements.forEach((el, index) => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(50px)';
                setTimeout(() => {
                    el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, 300 + (index * 100));
            });
        }
    }

    // ============ ENHANCED NAVIGATION ============
    initializeNavigation() {
        const navbar = document.getElementById('navbar');
        const navLinks = document.querySelectorAll('.nav-link');
        const logo = document.querySelector('.logo');
        
        // Smooth scroll for navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    const targetId = link.getAttribute('href').substring(1);
                    this.smoothScrollTo(targetId);
                    this.setActiveNavLink(link);
                }
            });
        });

        // Logo click to scroll to top
        if (logo) {
            logo.addEventListener('click', (e) => {
                e.preventDefault();
                this.smoothScrollTo('hero');            });
        }

        // Legacy navbar functionality - disabled for NavbarController
        // this.updateNavbarOnScroll();
    }

    updateNavbarOnScroll() {
        // Legacy function - disabled to prevent conflicts with NavbarController
        /*
        const navbar = document.getElementById('navbar');
        const scrollY = window.scrollY;        
        if (navbar) {
            if (scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        this.updateActiveNavigation();
        */
    }

    updateActiveNavigation() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        
        let currentSection = '';
        const threshold = window.innerHeight * 0.3;
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= threshold && rect.bottom >= threshold) {
                currentSection = section.id;
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    setActiveNavLink(activeLink) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    smoothScrollTo(targetId) {
        const target = document.getElementById(targetId);
        if (target) {
            const navbar = document.getElementById('navbar');
            const navbarHeight = navbar ? navbar.offsetHeight : 80;
            const offsetTop = target.offsetTop - navbarHeight;
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    // ============ MOBILE MENU ENHANCEMENT ============
    initializeMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });

            // Close mobile menu when clicking on links
            const mobileNavLinks = mobileMenu.querySelectorAll('a[href^="#"]');
            mobileNavLinks.forEach(link => {
                link.addEventListener('click', () => {
                    this.closeMobileMenu();
                });
            });

            // Close mobile menu when clicking overlay
            if (mobileMenuOverlay) {
                mobileMenuOverlay.addEventListener('click', () => {
                    this.closeMobileMenu();
                });
            }
        }
    }

    toggleMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        this.state.mobileMenuOpen = !this.state.mobileMenuOpen;
        
        if (mobileMenuBtn) mobileMenuBtn.classList.toggle('active');
        if (mobileMenu) mobileMenu.classList.toggle('active');
        
        // Toggle body scroll lock
        document.body.style.overflow = this.state.mobileMenuOpen ? 'hidden' : '';
        
        // Animate menu items
        if (this.state.mobileMenuOpen) {
            this.animateMobileMenuItems();
        }
    }

    closeMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        this.state.mobileMenuOpen = false;
        
        if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
        if (mobileMenu) mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    }

    animateMobileMenuItems() {
        const menuItems = document.querySelectorAll('#mobile-menu .mobile-nav-link');
        menuItems.forEach((item, index) => {
            item.style.transform = 'translateX(-100%)';
            item.style.opacity = '0';
            setTimeout(() => {
                item.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
                item.style.transform = 'translateX(0)';
                item.style.opacity = '1';
            }, index * 100);
        });
    }

    updateMobileMenuLayout() {
        if (window.innerWidth > 768 && this.state.mobileMenuOpen) {
            this.closeMobileMenu();
        }
    }

    // ============ CART SIDEBAR SYSTEM ============
    initializeCartSidebar() {
        const cartBtn = document.getElementById('cart-btn');
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.querySelector('.cart-overlay');
        const cartClose = document.getElementById('cart-close');
        
        if (cartBtn) {
            cartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleCartSidebar();
            });
        }

        if (cartClose) {
            cartClose.addEventListener('click', () => {
                this.closeCartSidebar();
            });
        }

        if (cartOverlay) {
            cartOverlay.addEventListener('click', () => {
                this.closeCartSidebar();
            });
        }

        this.updateCartDisplay();
    }

    toggleCartSidebar() {
        const cartSidebar = document.getElementById('cart-sidebar');
        this.state.cartOpen = !this.state.cartOpen;
        
        if (cartSidebar) {
            cartSidebar.classList.toggle('active');
        }
        
        document.body.style.overflow = this.state.cartOpen ? 'hidden' : '';
    }

    closeCartSidebar() {
        const cartSidebar = document.getElementById('cart-sidebar');
        this.state.cartOpen = false;
        
        if (cartSidebar) {
            cartSidebar.classList.remove('active');
        }
        
        document.body.style.overflow = '';
    }

    addToCart(productId, productName, price, imageUrl) {
        const existingItem = this.state.cartItems.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.state.cartItems.push({
                id: productId,
                name: productName,
                price: price,
                image: imageUrl,
                quantity: 1
            });
        }
        
        this.updateCartDisplay();
        this.showNotification(`${productName} added to cart!`, 'success');
        this.animateCartButton();
    }

    removeFromCart(productId) {
        this.state.cartItems = this.state.cartItems.filter(item => item.id !== productId);
        this.updateCartDisplay();
        this.showNotification('Item removed from cart', 'info');
    }

    updateCartQuantity(productId, newQuantity) {
        const item = this.state.cartItems.find(item => item.id === productId);
        if (item) {
            if (newQuantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = newQuantity;
                this.updateCartDisplay();
            }
        }
    }

    updateCartDisplay() {
        const cartCount = document.getElementById('cart-count');
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        
        const totalItems = this.state.cartItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = this.state.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
        
        if (cartItems) {
            cartItems.innerHTML = this.renderCartItems();
        }
        
        if (cartTotal) {
            cartTotal.textContent = `$${totalPrice.toFixed(2)}`;
        }
    }

    renderCartItems() {
        if (this.state.cartItems.length === 0) {
            return '<div class="cart-empty">Your cart is empty</div>';
        }
        
        return this.state.cartItems.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>$${item.price}</p>
                    <div class="cart-item-controls">
                        <button onclick="g2ownEnhanced.updateCartQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="g2ownEnhanced.updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="g2ownEnhanced.removeFromCart('${item.id}')">×</button>
            </div>
        `).join('');
    }

    animateCartButton() {
        const cartBtn = document.getElementById('cart-btn');
        if (cartBtn) {
            cartBtn.classList.add('animate-bounce');
            setTimeout(() => {
                cartBtn.classList.remove('animate-bounce');
            }, 600);
        }
    }

    // ============ NOTIFICATION SYSTEM ============
    initializeNotificationSystem() {
        const notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'fixed top-4 right-4 z-50 space-y-2';
            document.body.appendChild(container);
        }
    }

    showNotification(message, type = 'info', duration = 4000) {
        const notificationId = Date.now();
        const notification = document.createElement('div');
        
        notification.id = `notification-${notificationId}`;
        notification.className = `notification notification-${type} transform translate-x-full transition-transform duration-300`;
        
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        
        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <span class="notification-icon">${icons[type] || icons.info}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="g2ownEnhanced.hideNotification('${notificationId}')">×</button>
            </div>
        `;
        
        const container = document.getElementById('notification-container');
        if (container) {
            container.appendChild(notification);
            
            // Animate in
            setTimeout(() => {
                notification.classList.remove('translate-x-full');
            }, 100);
            
            // Auto remove
            setTimeout(() => {
                this.hideNotification(notificationId);
            }, duration);
        }
        
        this.state.notifications.push({ id: notificationId, element: notification });
    }

    hideNotification(notificationId) {
        const notification = document.getElementById(`notification-${notificationId}`);
        if (notification) {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                notification.remove();
                this.state.notifications = this.state.notifications.filter(n => n.id !== notificationId);
            }, 300);
        }
    }

    // ============ SEARCH FUNCTIONALITY ============
    initializeSearchFunctionality() {
        const searchBtn = document.getElementById('search-btn');
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');
        
        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', () => {
                this.toggleSearch();
            });
            
            searchInput.addEventListener('input', this.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
            
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeSearch();
                }
            });
        }
    }

    toggleSearch() {
        const searchContainer = document.querySelector('.search-container');
        const searchInput = document.getElementById('search-input');
        
        this.state.searchActive = !this.state.searchActive;
        
        if (searchContainer) {
            searchContainer.classList.toggle('active');
        }
        
        if (this.state.searchActive && searchInput) {
            setTimeout(() => {
                searchInput.focus();
            }, 100);
        }
    }

    closeSearch() {
        const searchContainer = document.querySelector('.search-container');
        this.state.searchActive = false;
        
        if (searchContainer) {
            searchContainer.classList.remove('active');
        }
    }

    handleSearch(query) {
        const searchResults = document.getElementById('search-results');
        
        if (query.length < 2) {
            if (searchResults) searchResults.innerHTML = '';
            return;
        }
        
        // Simulate search results
        const mockResults = [
            { title: 'Cyberpunk 2077 Bundle', category: 'Game', price: '$29.99' },
            { title: 'Steam Gaming Account', category: 'Account', price: '$149.99' },
            { title: 'Discord Nitro', category: 'Software', price: '$9.99' }
        ].filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.category.toLowerCase().includes(query.toLowerCase())
        );
        
        if (searchResults) {
            searchResults.innerHTML = this.renderSearchResults(mockResults, query);
        }
    }

    renderSearchResults(results, query) {
        if (results.length === 0) {
            return `<div class="search-no-results">No results found for "${query}"</div>`;
        }
        
        return results.map(result => `
            <div class="search-result-item">
                <h4>${result.title}</h4>
                <p class="search-result-category">${result.category}</p>
                <p class="search-result-price">${result.price}</p>
            </div>
        `).join('');
    }

    // ============ TRUST BADGES & INDICATORS ============
    initializeTrustBadges() {
        const trustBadges = document.querySelectorAll('.trust-badge');
        
        trustBadges.forEach((badge, index) => {
            badge.style.opacity = '0';
            badge.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                badge.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                badge.style.opacity = '1';
                badge.style.transform = 'translateY(0)';
            }, 1500 + (index * 200));
        });
    }

    // ============ PROGRESS BARS & ANIMATIONS ============
    initializeProgressBars() {
        const progressBars = document.querySelectorAll('.progress-bar');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateProgressBar(entry.target);
                }
            });
        });
        
        progressBars.forEach(bar => observer.observe(bar));
    }

    animateProgressBar(progressBar) {
        const targetWidth = progressBar.dataset.progress || '100';
        progressBar.style.width = '0%';
        
        setTimeout(() => {
            progressBar.style.transition = 'width 2s ease';
            progressBar.style.width = targetWidth + '%';
        }, 200);
    }

    updateScrollProgress() {
        const scrollTop = document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = Math.min((scrollTop / scrollHeight) * 100, 100);
        
        const progressBars = document.querySelectorAll('.scroll-progress');
        progressBars.forEach(bar => {
            bar.style.width = scrollPercent + '%';
        });
    }

    // ============ ENHANCED ANIMATIONS ============
    initializeScrollAnimations() {
        const animateElements = document.querySelectorAll('.animate-on-scroll, .animate-fade-in, .slide-in-up, .scale-in');
        
        animateElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(50px)';
        });
    }

    initializeIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                }
            });
        }, observerOptions);

        const elementsToObserve = document.querySelectorAll(
            '.animate-on-scroll, .animate-fade-in, .slide-in-up, .scale-in, .category-card, .game-card, .stat-item'
        );
        
        elementsToObserve.forEach(element => {
            observer.observe(element);
        });
    }

    animateElement(element) {
        const delay = element.dataset.delay || 0;
        
        setTimeout(() => {
            element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0) scale(1)';
            
            // Add specific animation classes
            if (element.classList.contains('stat-item')) {
                this.animateCountUp(element);
            }
            
            if (element.classList.contains('category-card') || element.classList.contains('game-card')) {
                element.classList.add('animate-in');
            }
        }, parseInt(delay));
    }

    animateCountUp(element) {
        const countElement = element.querySelector('.stat-number');
        if (countElement) {
            const target = parseInt(countElement.textContent.replace(/[^\d]/g, ''));
            let current = 0;
            const increment = target / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                countElement.textContent = Math.floor(current).toLocaleString();
            }, 50);
        }
    }

    initializeAnimations() {
        this.addHoverEffects();
        this.initializeButtonAnimations();
        this.initializeFloatingElements();
    }

    addHoverEffects() {
        const magneticElements = document.querySelectorAll('.btn, .game-card, .category-card, .magnetic');
        
        magneticElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                this.addMagneticEffect(element);
            });
            
            element.addEventListener('mouseleave', () => {
                this.removeMagneticEffect(element);
            });
        });
    }

    addMagneticEffect(element) {
        element.style.transition = 'transform 0.3s ease';
        element.addEventListener('mousemove', this.handleMagneticMove);
    }

    removeMagneticEffect(element) {
        element.removeEventListener('mousemove', this.handleMagneticMove);
        element.style.transform = 'translateX(0) translateY(0) scale(1)';
    }

    handleMagneticMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = (e.clientX - centerX) * 0.1;
        const deltaY = (e.clientY - centerY) * 0.1;
        
        e.currentTarget.style.transform = `translateX(${deltaX}px) translateY(${deltaY}px) scale(1.05)`;
    }

    initializeButtonAnimations() {
        const buttons = document.querySelectorAll('.btn, button');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.createRippleEffect(e);
            });
        });
    }

    createRippleEffect(e) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        ripple.classList.add('ripple');
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    initializeFloatingElements() {
        const floatingElements = document.querySelectorAll('.floating-element, .bg-decoration');
        
        floatingElements.forEach((element, index) => {
            element.style.animation = `float ${3 + (index % 3)}s ease-in-out infinite`;
            element.style.animationDelay = `${(index * 0.5) % 2}s`;
        });
    }

    // ============ GAME CARDS & MARKETPLACE ============
    initializeGameCards() {
        const gameCards = document.querySelectorAll('.game-card');
        
        gameCards.forEach(card => {
            this.enhanceGameCard(card);
        });
    }

    enhanceGameCard(card) {
        const addToCartBtn = card.querySelector('.add-to-cart-btn');
        
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = card.dataset.productId || Date.now().toString();
                const productName = card.querySelector('.game-title')?.textContent || 'Game';
                const price = parseFloat(card.querySelector('.game-price')?.textContent.replace('$', '') || '0');
                const imageUrl = card.querySelector('.game-image')?.src || '';
                
                this.addToCart(productId, productName, price, imageUrl);
            });
        }
        
        // Add hover effects
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    }

    // ============ PARALLAX EFFECTS ============
    updateParallaxEffects() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.parallax-element, .bg-decoration');
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }

    // ============ PARTICLES SYSTEM ============
    initializeParticles() {
        const canvas = document.getElementById('particles-canvas');
        if (canvas) {
            canvas.style.opacity = '0';
            setTimeout(() => {
                canvas.style.transition = 'opacity 2s ease';
                canvas.style.opacity = '1';
            }, 1500);
        }
    }

    updateParticleCount() {
        const isMobile = window.innerWidth < 768;
        if (window.pJSDom && window.pJSDom[0]) {
            const particleCount = isMobile ? 30 : 80;
            window.pJSDom[0].pJS.particles.number.value = particleCount;
            if (window.pJSDom[0].pJS.fn.particlesRefresh) {
                window.pJSDom[0].pJS.fn.particlesRefresh();
            }
        }
    }

    // ============ COMPONENT INITIALIZATION ============
    initializeComponents() {
        this.initializeTooltips();
        this.initializeModals();
        this.initializeDropdowns();
        this.initializeCarousel();
    }

    initializeTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target, e.target.dataset.tooltip);
            });
            
            element.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }

    showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        tooltip.id = 'active-tooltip';
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.cssText = `
            position: fixed;
            top: ${rect.top - tooltip.offsetHeight - 10}px;
            left: ${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 9999;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        setTimeout(() => {
            tooltip.style.opacity = '1';
        }, 100);
    }

    hideTooltip() {
        const tooltip = document.getElementById('active-tooltip');
        if (tooltip) {
            tooltip.style.opacity = '0';
            setTimeout(() => {
                tooltip.remove();
            }, 300);
        }
    }

    initializeModals() {
        const modalTriggers = document.querySelectorAll('[data-modal]');
        
        modalTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = trigger.dataset.modal;
                this.showModal(modalId);
            });
        });
        
        // Close modals with escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    hideAllModals() {
        const activeModals = document.querySelectorAll('.modal.active');
        activeModals.forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    }

    initializeDropdowns() {
        const dropdownTriggers = document.querySelectorAll('.dropdown-trigger');
        
        dropdownTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const dropdown = trigger.nextElementSibling;
                if (dropdown) {
                    dropdown.classList.toggle('active');
                }
            });
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                document.querySelectorAll('.dropdown-menu.active').forEach(menu => {
                    menu.classList.remove('active');
                });
            }
        });
    }

    initializeCarousel() {
        // Enhanced carousel functionality will be handled by carousel.js
        // This is just the basic setup
        const carousels = document.querySelectorAll('.carousel');
        carousels.forEach(carousel => {
            console.log('Enhanced carousel found:', carousel.id);
        });
    }

    updateCarouselDimensions() {
        // Handle responsive carousel updates
        const carousels = document.querySelectorAll('.carousel');
        carousels.forEach(carousel => {
            // Trigger resize event for carousel.js
            carousel.dispatchEvent(new Event('resize'));
        });
    }

    // ============ HEAVY ANIMATIONS ============
    initializeHeavyAnimations() {
        this.addFloatingAnimations();
        this.initializeParallaxEffects();
        this.initializeGlowEffects();
    }

    addFloatingAnimations() {
        const floatingElements = document.querySelectorAll('.bg-red-900\\/10, .bg-white\\/5, .bg-red-500\\/10, .floating-element');
        
        floatingElements.forEach((element, index) => {
            element.style.animation = `float ${3 + (index % 3)}s ease-in-out infinite`;
            element.style.animationDelay = `${(index * 0.5) % 3}s`;
        });
    }

    initializeParallaxEffects() {
        window.addEventListener('scroll', this.throttle(() => {
            this.updateParallaxEffects();
        }, 16));
    }

    initializeGlowEffects() {
        const glowElements = document.querySelectorAll('.glow-on-hover');
        
        glowElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.boxShadow = '0 0 30px rgba(239, 68, 68, 0.5)';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.boxShadow = '';
            });
        });
    }

    // ============ IMAGE OPTIMIZATION ============
    preloadImages() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => {
            imageObserver.observe(img);
        });
    }

    // ============ KEYBOARD SHORTCUTS ============
    handleKeyboardShortcuts(e) {
        // Escape key - close all overlays
        if (e.key === 'Escape') {
            this.closeMobileMenu();
            this.closeCartSidebar();
            this.closeSearch();
            this.hideAllModals();
        }
        
        // Ctrl/Cmd + K - open search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.toggleSearch();
        }
    }

    // ============ UTILITY FUNCTIONS ============
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    // ============ PUBLIC API ============
    // Methods to be called from HTML or other scripts
    
    // Cart methods
    addProductToCart(productId, productName, price, imageUrl) {
        this.addToCart(productId, productName, price, imageUrl);
    }
    
    // Navigation methods
    scrollToSection(sectionId) {
        this.smoothScrollTo(sectionId);
    }
    
    // UI methods
    showAlert(message, type) {
        this.showNotification(message, type);
    }
    
    // Theme methods (for future enhancement)
    toggleTheme() {
        this.state.currentTheme = this.state.currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', this.state.currentTheme);
    }
}

// Initialize the enhanced website
const g2ownEnhanced = new G2OwnEnhanced();

// Add enhanced styles
const enhancedStyles = document.createElement('style');
enhancedStyles.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
    }
    
    @keyframes bounce {
        0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
        40%, 43% { transform: translate3d(0,-30px,0); }
        70% { transform: translate3d(0,-15px,0); }
        90% { transform: translate3d(0,-4px,0); }
    }
    
    .animate-bounce {
        animation: bounce 1s ease-in-out;
    }
    
    .loading { overflow: hidden; }
    .loaded { overflow-x: hidden; }
    
    .notification {
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        padding: 16px 20px;
        color: white;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        max-width: 400px;
    }
    
    .notification-success { 
        background: linear-gradient(135deg, #22c55e, #16a34a);
    }
    
    .notification-error { 
        background: linear-gradient(135deg, #ef4444, #dc2626);
    }
    
    .notification-warning { 
        background: linear-gradient(135deg, #f59e0b, #d97706);
    }
    
    .notification-info { 
        background: linear-gradient(135deg, #3b82f6, #2563eb);
    }
    
    .tooltip {
        font-family: Inter, sans-serif;
        white-space: nowrap;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    
    .magnetic {
        transition: transform 0.3s ease;
    }
    
    .glow-on-hover {
        transition: box-shadow 0.3s ease;
    }
    
    .parallax-element {
        will-change: transform;
    }
    
    .floating-element {
        animation: float 6s ease-in-out infinite;
    }
    
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    
    .search-container.active {
        opacity: 1;
        visibility: visible;
    }
    
    .cart-sidebar.active {
        transform: translateX(0);
    }
    
    .mobile-menu.active {
        opacity: 1;
        visibility: visible;
    }
    
    .modal.active {
        opacity: 1;
        visibility: visible;
    }
    
    .dropdown-menu.active {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }
`;

document.head.appendChild(enhancedStyles);

// Export for global access
window.g2ownEnhanced = g2ownEnhanced;
window.G2OwnEnhanced = G2OwnEnhanced;

// Legacy compatibility
window.G2OwnWebsite = g2ownEnhanced;

console.log('G2Own Enhanced JavaScript loaded successfully!');
