// Optimized Navbar Controller - Clean Layout Implementation
// Handles all navbar functionality with improved UX

class NavbarController {    constructor() {
        this.navbar = document.getElementById('navbar');
        this.searchToggle = document.getElementById('search-toggle');
        this.searchDropdown = document.getElementById('search-dropdown');
        this.searchInput = document.getElementById('search-input');
        this.searchClear = document.querySelector('.search-clear');
        this.cartToggle = document.getElementById('cart-toggle');
        this.cartCount = document.getElementById('cart-count');
        this.mobileToggle = document.getElementById('nav-mobile-toggle');
        this.mobileOverlay = document.getElementById('mobile-nav-overlay');
        this.mobileClose = document.getElementById('mobile-nav-close');
        this.navProgress = document.getElementById('nav-progress');
        this.navLogo = document.querySelector('.nav-logo');
        
        // Authentication elements
        this.authButtonContainer = document.getElementById('authButtonContainer');
        this.profileContainer = document.getElementById('profileContainer');
        this.loginSignupBtn = document.getElementById('loginSignupBtn');
        this.profileBtn = document.getElementById('profileBtn');
        this.profileDropdown = document.getElementById('profileDropdown');
        this.profileName = document.getElementById('profileName');
        this.dropdownName = document.getElementById('dropdownName');
        this.dropdownEmail = document.getElementById('dropdownEmail');
        
        // Authentication bridge
        this.authBridge = null;
        this.currentUser = null;
        
        this.state = {
            isSearchOpen: false,
            isProfileMenuOpen: false,
            isMobileMenuOpen: false,
            cartItems: 0,
            currentSection: 'hero',
            isAuthenticated: false
        };
        
        this.init();
    }
        init() {
        this.setupEventListeners();
        this.setupScrollEffects();
        this.setupActiveSection();
        this.setupCartFunctionality();
        this.setupAuthenticationHandlers();
        this.setupKeyboardShortcuts();
        this.setupAccessibility();
        this.initializeAuthenticationBridge();
        
        // Remove loading state
        if (this.navbar) {
            this.navbar.classList.remove('navbar-loading');
            this.navbar.classList.add('navbar-loaded');
        }        
        console.log('Optimized Navbar Controller initialized');
        
        // Make navbar controller available globally for dropdown actions
        window.navbarController = this;
    }

    async initializeAuthenticationBridge() {
        // Wait for AuthenticationBridge to be available
        let attempts = 0;
        const maxAttempts = 50;
        
        const waitForAuthBridge = async () => {
            if (window.AuthenticationBridge && window.authBridge) {
                this.authBridge = window.authBridge;
                this.setupAuthEventListeners();
                console.log('✅ Authentication Bridge connected to navbar');
                return true;
            }
            
            attempts++;
            if (attempts < maxAttempts) {
                setTimeout(waitForAuthBridge, 100);
                return false;
            }
            
            console.warn('⚠️ Authentication Bridge not found after maximum attempts');
            return false;
        };
        
        await waitForAuthBridge();
    }

    setupAuthEventListeners() {
        // Listen for authentication events from the bridge
        window.addEventListener('g2own:auth-login', (event) => {
            this.updateUIForLoggedInUser(event.detail.user);
        });

        window.addEventListener('g2own:auth-logout', () => {
            this.updateUIForLoggedOutUser();
        });

        window.addEventListener('g2own:auth-update', (event) => {
            this.updateUIForLoggedInUser(event.detail.user);
        });
    }

    setupAuthenticationHandlers() {
        // Login/Signup button click
        if (this.loginSignupBtn) {
            this.loginSignupBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLoginSignupClick();
            });
        }

        // Profile button click (dropdown toggle)
        if (this.profileBtn) {
            this.profileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleProfileDropdown();
            });
        }

        // Profile dropdown item clicks
        if (this.profileDropdown) {
            this.profileDropdown.addEventListener('click', (e) => {
                const action = e.target.closest('[data-action]');
                if (action) {
                    e.preventDefault();
                    this.handleProfileAction(action.dataset.action);
                }
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.profile-container')) {
                this.closeProfileDropdown();
            }
        });
    }

    handleLoginSignupClick() {
        if (this.authBridge) {
            this.authBridge.showLoginPopup();
        } else {
            // Fallback to direct community login
            window.open('https://g2own.com/community/login/?ref=' + encodeURIComponent(window.location.href), '_blank');
        }
    }

    toggleProfileDropdown() {
        const isOpen = this.state.isProfileMenuOpen;
        
        if (isOpen) {
            this.closeProfileDropdown();
        } else {
            this.openProfileDropdown();
        }
    }

    openProfileDropdown() {
        if (this.profileDropdown) {
            this.profileDropdown.classList.add('show');
            this.profileBtn.setAttribute('aria-expanded', 'true');
            this.state.isProfileMenuOpen = true;
        }
    }

    closeProfileDropdown() {
        if (this.profileDropdown) {
            this.profileDropdown.classList.remove('show');
            this.profileBtn.setAttribute('aria-expanded', 'false');
            this.state.isProfileMenuOpen = false;
        }
    }

    async handleProfileAction(action) {
        this.closeProfileDropdown();
        
        switch (action) {
            case 'logout':
                if (this.authBridge) {
                    await this.authBridge.logout();
                }
                break;
                
            case 'profile-settings':
                if (this.currentUser) {
                    window.open(`https://g2own.com/community/profile/${this.currentUser.id}/edit/`, '_blank');
                }
                break;
                
            case 'account-security':
                window.open('https://g2own.com/community/settings/account-security/', '_blank');
                break;
                
            case 'achievements':
                if (this.currentUser) {
                    window.open(`https://g2own.com/community/profile/${this.currentUser.id}/reputation/`, '_blank');
                }
                break;
                
            case 'purchase-history':
                window.open('https://g2own.com/community/store/purchases/', '_blank');
                break;
                
            default:
                console.log('Unknown profile action:', action);
        }
    }    updateUIForLoggedInUser(user) {
        this.currentUser = user;
        this.state.isAuthenticated = true;

        // Hide login/signup button
        if (this.authButtonContainer) {
            this.authButtonContainer.style.display = 'none';
        }

        // Show profile container
        if (this.profileContainer) {
            this.profileContainer.style.display = 'block';
        }

        // Update profile information
        if (this.profileName) {
            this.profileName.textContent = user.name || user.display_name || 'User';
        }

        if (this.dropdownName) {
            this.dropdownName.textContent = user.name || user.display_name || 'User';
        }

        if (this.dropdownEmail) {
            this.dropdownEmail.textContent = user.email || '';
        }

        // Update avatar images
        const avatarUrl = user.avatar || user.photo || 'assets/images/default-avatar.svg';
        const avatarElements = this.profileContainer.querySelectorAll('img');
        avatarElements.forEach(img => {
            img.src = avatarUrl;
            img.onerror = function() {
                this.src = 'assets/images/default-avatar.svg';
            };
        });

        console.log('✅ UI updated for logged in user:', user.name);
    }

    updateUIForLoggedOutUser() {
        this.currentUser = null;
        this.state.isAuthenticated = false;

        // Show login/signup button
        if (this.authButtonContainer) {
            this.authButtonContainer.style.display = 'flex';
        }

        // Hide profile container
        if (this.profileContainer) {
            this.profileContainer.style.display = 'none';
        }

        // Close any open profile dropdown
        this.closeProfileDropdown();        console.log('✅ UI updated for logged out user');
    }
    
    setupEventListeners() {
        // Logo click - scroll to top
        if (this.navLogo) {
            this.navLogo.addEventListener('click', (e) => {
                e.preventDefault();
                this.smoothScrollTo('#hero');
            });
        }
        
        // Search functionality
        if (this.searchToggle) {
            this.searchToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSearch();
            });
        }
        
        if (this.searchClear) {
            this.searchClear.addEventListener('click', () => {
                this.clearSearch();
            });
        }
        
        // User menu
        if (this.userMenuToggle) {
            this.userMenuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleUserMenu();
            });
        }
        
        // Mobile menu
        if (this.mobileToggle) {
            this.mobileToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }
        
        if (this.mobileClose) {
            this.mobileClose.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }
        
        // Mobile overlay click to close
        if (this.mobileOverlay) {
            this.mobileOverlay.addEventListener('click', (e) => {
                if (e.target === this.mobileOverlay) {
                    this.closeMobileMenu();
                }
            });
        }
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (this.state.isSearchOpen && !this.searchDropdown?.contains(e.target)) {
                this.closeSearch();
            }
            if (this.state.isUserMenuOpen && !this.userDropdown?.contains(e.target)) {
                this.closeUserMenu();
            }
        });
        
        // Search input functionality
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
            
            this.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeSearch();
                } else if (e.key === 'Enter') {
                    this.performSearch(e.target.value);
                }
            });
        }
        
        // Cart functionality
        if (this.cartToggle) {
            this.cartToggle.addEventListener('click', () => {
                this.toggleCart();
            });
        }
        
        // Navigation links
        this.setupNavLinks();
        
        // Cart button functionality
        this.setupCartFunctionality();
    }
    
    setupNavLinks() {
        const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href');
                
                if (target && target.startsWith('#')) {
                    this.smoothScrollTo(target);
                    this.setActiveLink(link);
                    
                    // Close mobile menu if open
                    if (this.state.isMobileMenuOpen) {
                        this.closeMobileMenu();
                    }
                }
            });
        });
    }
    
    // Enhanced keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // ESC key - close all dropdowns and mobile menu
            if (e.key === 'Escape') {
                this.closeAllDropdowns();
                this.closeMobileMenu();
            }
            
            // Ctrl+K or Cmd+K - focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.focusSearch();
            }
            
            // Home key - scroll to top
            if (e.key === 'Home' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                this.smoothScrollTo('#hero');
            }
        });
    }
    
    setupAccessibility() {
        // Add ARIA labels and keyboard navigation
        const navbar = this.navbar;
        if (navbar) {
            navbar.setAttribute('role', 'navigation');
            navbar.setAttribute('aria-label', 'Main navigation');
        }
        
        // Enhanced keyboard navigation for nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach((link, index) => {
            link.setAttribute('tabindex', '0');
            link.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    link.click();
                }
                
                // Arrow key navigation
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextLink = navLinks[index + 1] || navLinks[0];
                    nextLink.focus();
                }
                
                if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevLink = navLinks[index - 1] || navLinks[navLinks.length - 1];
                    prevLink.focus();
                }
            });
        });
        
        // Mobile menu accessibility
        const mobileToggle = this.mobileToggle;
        if (mobileToggle) {
            mobileToggle.setAttribute('aria-label', 'Toggle mobile menu');
            mobileToggle.setAttribute('aria-expanded', 'false');
        }
    }
    
    focusSearch() {
        if (this.searchInput) {
            this.searchInput.focus();
            if (this.searchDropdown) {
                this.searchDropdown.classList.add('active');
            }
        }
    }
    
    closeAllDropdowns() {
        if (this.searchDropdown) {
            this.searchDropdown.classList.remove('active');
        }
        if (this.userDropdown) {
            this.userDropdown.classList.remove('active');
        }
    }
    
    setupScrollEffects() {
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }    handleScroll() {
        const scrollY = window.scrollY;
        
        // Hide scroll indicator immediately when user starts scrolling
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator && scrollY > 0) {
            scrollIndicator.style.opacity = '0';
            scrollIndicator.style.transform = 'translateX(-50%) translateY(20px)';
            scrollIndicator.style.pointerEvents = 'none';
        } else if (scrollIndicator && scrollY === 0) {
            scrollIndicator.style.opacity = '1';
            scrollIndicator.style.transform = 'translateX(-50%) translateY(0)';
            scrollIndicator.style.pointerEvents = 'auto';
        }
        
        // Add scrolled class for navbar styling
        if (scrollY > 50) {
            this.navbar?.classList.add('scrolled');
        } else {
            this.navbar?.classList.remove('scrolled');
        }
        
        // Update progress bar
        this.updateScrollProgress();
        
        // Update active section
        this.updateActiveSection();
    }
    
    updateScrollProgress() {
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollTop = window.scrollY;
        const scrollProgress = (scrollTop / documentHeight) * 100;
        
        if (this.navProgress) {
            this.navProgress.style.width = `${Math.min(scrollProgress, 100)}%`;
        }
    }
    
    setupActiveSection() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link[data-section]');
        
        if (!sections.length || !navLinks.length) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    this.state.currentSection = sectionId;
                    
                    // Update active nav link
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.dataset.section === sectionId) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '-100px 0px -100px 0px'
        });
        
        sections.forEach(section => observer.observe(section));
    }
    
    updateActiveSection() {
        // Manual active section update based on scroll position
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link[data-section]');
        const scrollPos = window.scrollY + 150;
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                currentSection = section.id;
            }
        });
        
        if (currentSection && currentSection !== this.state.currentSection) {
            this.state.currentSection = currentSection;
            
            // Update page title
            this.updatePageTitle(currentSection);
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.dataset.section === currentSection) {
                    link.classList.add('active');
                }
            });
        }
    }
    
    updatePageTitle(section) {
        const titleMap = {
            'hero': 'G2Own - Digital Marketplace',
            'marketplace': 'Marketplace - G2Own',
            'games': 'Games - G2Own',
            'digital-goods': 'Digital Goods - G2Own',
            'support': 'Support - G2Own',
            'about': 'About - G2Own',
            'contact': 'Contact - G2Own'
        };
        
        document.title = titleMap[section] || 'G2Own - Digital Marketplace';
    }
    
    // ===== SEARCH FUNCTIONALITY =====
    toggleSearch() {
        if (this.state.isSearchOpen) {
            this.closeSearch();
        } else {
            this.openSearch();
        }
    }
    
    openSearch() {
        this.closeUserMenu();
        this.state.isSearchOpen = true;
        
        if (this.searchDropdown) {
            this.searchDropdown.classList.add('active');
        }
        
        if (this.searchToggle) {
            this.searchToggle.classList.add('active');
        }
        
        // Focus input with slight delay for smooth animation
        setTimeout(() => {
            if (this.searchInput) {
                this.searchInput.focus();
            }
        }, 150);
    }
    
    closeSearch() {
        this.state.isSearchOpen = false;
        
        if (this.searchDropdown) {
            this.searchDropdown.classList.remove('active');
        }
        
        if (this.searchToggle) {
            this.searchToggle.classList.remove('active');
        }
        
        this.clearSearch();
    }
    
    clearSearch() {
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        this.clearSearchResults();
    }
    
    handleSearch(query) {
        if (!query || query.length < 2) {
            this.clearSearchResults();
            return;
        }
        
        // Show loading state
        this.showSearchLoading();
        
        // Simulate API call delay
        setTimeout(() => {
            this.performSearch(query);
        }, 300);
    }
    
    performSearch(query) {
        // Simulate search results
        const mockResults = [
            { title: 'Cyberpunk 2077: Ultimate Edition', type: 'PC Game', price: '$29.99', category: 'games' },
            { title: 'Call of Duty: Modern Warfare 3', type: 'PC Game', price: '$59.99', category: 'games' },
            { title: 'Steam Wallet Code $50', type: 'Gift Card', price: '$50.00', category: 'gift-cards' },
            { title: 'Discord Nitro - 1 Month', type: 'Software', price: '$9.99', category: 'software' },
            { title: 'Adobe Photoshop 2024', type: 'Software', price: '$19.99', category: 'software' },
            { title: 'Minecraft Java Edition', type: 'PC Game', price: '$26.95', category: 'games' },
            { title: 'Xbox Game Pass Ultimate', type: 'Subscription', price: '$14.99', category: 'subscriptions' },
            { title: 'PlayStation Store Gift Card', type: 'Gift Card', price: '$25.00', category: 'gift-cards' }
        ];
        
        const filteredResults = mockResults.filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.type.toLowerCase().includes(query.toLowerCase())
        );
        
        this.displaySearchResults(filteredResults, query);
    }
    
    showSearchLoading() {
        const resultsContainer = document.getElementById('search-results');
        if (!resultsContainer) return;
        
        resultsContainer.innerHTML = `
            <div class="search-loading">
                <div class="loading-spinner"></div>
                <span>Searching...</span>
            </div>
        `;
    }
    
    displaySearchResults(results, query) {
        const resultsContainer = document.getElementById('search-results');
        if (!resultsContainer) return;
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-no-results">
                    <div class="no-results-icon">🔍</div>
                    <div class="no-results-text">No results found for "${query}"</div>
                    <div class="no-results-suggestion">Try searching for games, software, or gift cards</div>
                </div>
            `;
            return;
        }
        
        resultsContainer.innerHTML = `
            <div class="search-results-header">
                <span class="results-count">${results.length} result${results.length !== 1 ? 's' : ''}</span>
                <button class="view-all-btn" onclick="navbarController.viewAllResults('${query}')">View All</button>
            </div>
            ${results.slice(0, 5).map(result => `
                <div class="search-result-item" onclick="navbarController.selectResult('${result.title}')">
                    <div class="search-result-info">
                        <div class="search-result-title">${this.highlightQuery(result.title, query)}</div>
                        <div class="search-result-type">${result.type}</div>
                    </div>
                    <div class="search-result-price">${result.price}</div>
                </div>
            `).join('')}
            ${results.length > 5 ? `
                <div class="search-see-more">
                    <button onclick="navbarController.viewAllResults('${query}')">
                        See ${results.length - 5} more results
                    </button>
                </div>
            ` : ''}
        `;
    }
    
    highlightQuery(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    clearSearchResults() {
        const resultsContainer = document.getElementById('search-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
        }
    }
    
    selectResult(title) {
        console.log('Selected search result:', title);
        // Navigate to product page or perform action
        this.closeSearch();
        
        // Show notification
        this.showNotification(`Viewing: ${title}`, 'info');
    }
    
    viewAllResults(query) {
        console.log('View all results for:', query);
        this.closeSearch();
        // Navigate to search results page
        this.showNotification(`Showing all results for "${query}"`, 'info');
    }
    
    // ===== USER MENU FUNCTIONALITY =====
    toggleUserMenu() {
        if (this.state.isUserMenuOpen) {
            this.closeUserMenu();
        } else {
            this.openUserMenu();
        }
    }
    
    openUserMenu() {
        this.closeSearch();
        this.state.isUserMenuOpen = true;
        
        if (this.userDropdown) {
            this.userDropdown.classList.add('active');
        }
    }
    
    closeUserMenu() {
        this.state.isUserMenuOpen = false;
        
        if (this.userDropdown) {
            this.userDropdown.classList.remove('active');
        }
    }
    
    // ===== MOBILE MENU FUNCTIONALITY =====
    toggleMobileMenu() {
        if (this.state.isMobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }
    
    openMobileMenu() {
        this.state.isMobileMenuOpen = true;
        
        if (this.mobileToggle) {
            this.mobileToggle.classList.add('active');
        }
        
        if (this.mobileOverlay) {
            this.mobileOverlay.classList.add('active');
        }
        
        document.body.style.overflow = 'hidden';
    }
      closeMobileMenu() {
        this.state.isMobileMenuOpen = false;
        
        if (this.mobileToggle) {
            this.mobileToggle.classList.remove('active');
        }
        
        if (this.mobileOverlay) {
            this.mobileOverlay.classList.remove('active');
        }
        
        document.body.style.overflow = '';
    }
      setupCartFunctionality() {
        const cartToggle = document.getElementById('cart-toggle');
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.querySelector('.cart-overlay');
        const cartClose = document.getElementById('cart-close');
        
        if (cartToggle) {
            cartToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleCart();
            });
        }
        
        if (cartClose) {
            cartClose.addEventListener('click', () => {
                this.closeCart();
            });
        }
        
        if (cartOverlay) {
            cartOverlay.addEventListener('click', () => {
                this.closeCart();
            });
        }
        
        // Close cart when clicking outside
        document.addEventListener('click', (e) => {
            if (cartSidebar && cartSidebar.classList.contains('active')) {
                // Check if click is outside cart sidebar and not on cart toggle
                if (!cartSidebar.contains(e.target) && !cartToggle.contains(e.target)) {
                    this.closeCart();
                }
            }
        });
          // Initialize cart count
        this.updateCartCount(0);
        
        console.log('NavbarController initialized');
        console.log('Test functions available:');
        console.log('- navbarController.testAddToCart() - Add item to cart');
        console.log('- navbarController.testRemoveFromCart() - Remove item from cart');
    }

    openCartDropdown() {
        console.log('Cart dropdown opened');
        // This would integrate with a cart system
        alert('Cart functionality coming soon!');
    }

    updateCartCount(count = 0) {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            cartCount.textContent = count;
            cartCount.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    closeAllDropdowns() {
        this.closeSearch();
        this.closeUserMenu();
        this.closeMobileMenu();
    }
      // ===== CART FUNCTIONALITY =====
    toggleCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.querySelector('.cart-overlay');
        
        if (cartSidebar) {
            const isActive = cartSidebar.classList.contains('active');
            
            if (isActive) {
                this.closeCart();
            } else {
                this.openCart();
            }
        }
    }
    
    openCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.querySelector('.cart-overlay');
        
        if (cartSidebar) {
            cartSidebar.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        if (cartOverlay) {
            cartOverlay.classList.add('active');
        }
    }
      closeCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.querySelector('.cart-overlay');
        
        if (cartSidebar) {
            cartSidebar.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        if (cartOverlay) {
            cartOverlay.classList.remove('active');
        }
        
        // Emit cart close event for other components
        document.dispatchEvent(new CustomEvent('cart:close'));
    }
      updateCartCount(count = 0) {
        this.state.cartItems = count;
        const cartCount = document.getElementById('cart-count');
        
        if (cartCount) {
            cartCount.textContent = count;
            
            if (count > 0) {
                // Show cart count with animation
                cartCount.style.display = 'flex';
                cartCount.classList.add('has-items');
            } else {
                // Hide cart count
                cartCount.classList.remove('has-items');
                // Hide after animation completes
                setTimeout(() => {
                    if (!cartCount.classList.contains('has-items')) {
                        cartCount.style.display = 'none';
                    }
                }, 300);
            }
        }
    }
    
    // ===== NAVIGATION UTILITIES =====
    smoothScrollTo(target) {
        const element = document.querySelector(target);
        if (!element) return;
        
        const offset = 80; // Account for fixed navbar
        const elementPosition = element.offsetTop - offset;
        
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }
    
    setActiveLink(activeLink) {
        const allLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
        allLinks.forEach(link => link.classList.remove('active'));
        activeLink.classList.add('active');
    }
    
    // ===== UTILITY METHODS =====
    showNotification(message, type = 'info') {
        // Create notification if notification system exists
        if (window.g2ownEnhanced && window.g2ownEnhanced.showNotification) {
            window.g2ownEnhanced.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
    
    // ===== PUBLIC API METHODS =====
    
    // Method to update cart count from external components
    setCartCount(count) {
        this.updateCartCount(count);
    }
    
    // Method to programmatically open search
    focusSearch() {
        this.openSearch();
    }
    
    // Method to navigate to section
    navigateToSection(sectionId) {
        this.smoothScrollTo(`#${sectionId}`);
    }
    
    // Method to get current state
    getState() {
        return { ...this.state };
    }
    
    // Method to close all overlays (useful for external triggers)
    closeAll() {
        this.closeAllDropdowns();
    }
    
    // Test function to add items to cart (for demonstration)
    testAddToCart() {
        // Simulate adding an item
        const currentCount = parseInt(document.getElementById('cart-count').textContent) || 0;
        this.updateCartCount(currentCount + 1);
        console.log(`Added item to cart. Total items: ${currentCount + 1}`);
    }
    
    // Test function to remove items from cart (for demonstration)
    testRemoveFromCart() {
        // Simulate removing an item
        const currentCount = parseInt(document.getElementById('cart-count').textContent) || 0;
        const newCount = Math.max(0, currentCount - 1);
        this.updateCartCount(newCount);
        console.log(`Removed item from cart. Total items: ${newCount}`);
    }
}

// Initialize navbar controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (!window.navbarController) {
        console.log('🚀 Initializing NavbarController...');
        window.navbarController = new NavbarController();
        console.log('✅ NavbarController initialized successfully');
    }
});

// Also try immediate initialization if DOM already loaded
if (document.readyState === 'loading') {
    // DOM still loading, event listener above will handle it
} else {
    // DOM already loaded, initialize immediately
    if (!window.navbarController) {
        console.log('🚀 Immediate NavbarController initialization...');
        window.navbarController = new NavbarController();
        console.log('✅ NavbarController immediately initialized');
    }
}

// Make NavbarController class globally available
window.NavbarController = NavbarController;

// Listen for cart updates from other components
document.addEventListener('cart:updated', (e) => {
    if (window.navbarController && e.detail) {
        window.navbarController.setCartCount(e.detail.count || 0);
    }
});

// Listen for section changes from other components
document.addEventListener('section:changed', (e) => {
    if (window.navbarController && e.detail) {
        window.navbarController.navigateToSection(e.detail.section);
    }
});

// Export for ES6 modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavbarController;
}
