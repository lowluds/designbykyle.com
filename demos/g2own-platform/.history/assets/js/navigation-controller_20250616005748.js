/**
 * G2Own Navigation Controller
 * Handles navigation between frontend and backend integration
 * Connects all links to the Invision Community backend
 */

class G2OwnNavigation {
    constructor() {
        this.api = new G2OwnAPI();
        this.currentUser = null;
        this.backendBaseURL = 'https://g2own.com/community';
        
        this.init();
    }

    init() {
        this.setupNavigationHandlers();
        this.setupSearchFunctionality();
        this.setupAuthenticationHandlers();
        this.loadUserState();
        console.log('G2Own Navigation Controller initialized');
    }

    setupNavigationHandlers() {
        // Navigation link mapping to backend sections
        const navigationMap = {
            'marketplace': {
                url: `${this.backendBaseURL}/forum/15-marketplace/`,
                description: 'Browse and trade digital goods'
            },
            'games': {
                url: `${this.backendBaseURL}/forum/10-games/`,
                description: 'Gaming discussions and content'
            },
            'digital-goods': {
                url: `${this.backendBaseURL}/downloads/`,
                description: 'Download digital products'
            },
            'support': {
                url: `${this.backendBaseURL}/forum/20-support/`,
                description: 'Get help and support'
            }
        };

        // Handle navigation link clicks
        document.querySelectorAll('.nav-link[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                
                if (navigationMap[section]) {
                    this.navigateToSection(section, navigationMap[section]);
                }
            });
        });

        // Handle footer links
        this.setupFooterLinks();
    }

    setupFooterLinks() {
        const footerLinkMap = {
            'about': `${this.backendBaseURL}/page/about/`,
            'contact': `${this.backendBaseURL}/contact/`,
            'privacy': `${this.backendBaseURL}/privacy/`,
            'terms': `${this.backendBaseURL}/terms/`,
            'careers': `${this.backendBaseURL}/careers/`,
            'blog': `${this.backendBaseURL}/blogs/`,
            'help': `${this.backendBaseURL}/help/`,
            'community-guidelines': `${this.backendBaseURL}/guidelines/`
        };

        // Setup footer navigation
        Object.entries(footerLinkMap).forEach(([key, url]) => {
            const elements = document.querySelectorAll(`[data-link="${key}"], .footer-link[href*="${key}"]`);
            elements.forEach(element => {
                element.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.open(url, '_blank');
                });
            });
        });
    }

    async navigateToSection(section, config) {
        try {
            // Show loading state
            this.showLoadingState(section);

            // Check if user needs to be authenticated for this section
            if (this.requiresAuth(section)) {
                const isAuthenticated = await this.checkAuthentication();
                if (!isAuthenticated) {
                    this.showLoginModal();
                    return;
                }
            }

            // Navigate to the backend URL
            window.open(config.url, '_blank');

            // Log navigation for analytics
            this.logNavigation(section, config.url);

        } catch (error) {
            console.error('Navigation error:', error);
            this.showError(`Unable to navigate to ${section}. Please try again.`);
        } finally {
            this.hideLoadingState(section);
        }
    }

    requiresAuth(section) {
        // Sections that require authentication
        const authRequiredSections = ['marketplace'];
        return authRequiredSections.includes(section);
    }

    async checkAuthentication() {
        try {
            const response = await this.api.makeRequest('/core/me');
            this.currentUser = response;
            return true;
        } catch (error) {
            return false;
        }
    }

    setupSearchFunctionality() {
        const searchInput = document.getElementById('search-input');
        const searchToggle = document.getElementById('search-toggle');
        const searchDropdown = document.getElementById('search-dropdown');
        const searchResults = document.getElementById('search-results');

        if (searchToggle && searchDropdown) {
            searchToggle.addEventListener('click', () => {
                searchDropdown.classList.toggle('active');
                if (searchDropdown.classList.contains('active')) {
                    searchInput?.focus();
                }
            });
        }

        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    if (query.length >= 2) {
                        this.performSearch(query);
                    } else {
                        this.clearSearchResults();
                    }
                }, 300);
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const query = searchInput.value.trim();
                    if (query) {
                        this.redirectToSearch(query);
                    }
                }
            });
        }
    }

    async performSearch(query) {
        try {
            const searchResults = document.getElementById('search-results');
            if (!searchResults) return;

            searchResults.innerHTML = '<div class="search-loading">Searching...</div>';

            const response = await this.api.makeRequest(`/core/search?q=${encodeURIComponent(query)}&type=all`);
            
            if (response && response.results) {
                this.displaySearchResults(response.results);
            } else {
                this.displayNoResults();
            }

        } catch (error) {
            console.error('Search error:', error);
            this.displaySearchError();
        }
    }

    displaySearchResults(results) {
        const searchResults = document.getElementById('search-results');
        if (!searchResults) return;

        if (results.length === 0) {
            this.displayNoResults();
            return;
        }

        const resultsHTML = results.slice(0, 5).map(result => `
            <div class="search-result-item" data-url="${result.url}">
                <div class="search-result-title">${result.title}</div>
                <div class="search-result-type">${result.itemType}</div>
                <div class="search-result-excerpt">${result.content?.substr(0, 100) || ''}...</div>
            </div>
        `).join('');

        searchResults.innerHTML = `
            ${resultsHTML}
            <div class="search-view-all">
                <a href="${this.backendBaseURL}/search/?q=${encodeURIComponent(document.getElementById('search-input').value)}" target="_blank">
                    View all results
                </a>
            </div>
        `;

        // Add click handlers to search results
        searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const url = item.dataset.url;
                if (url) {
                    window.open(url, '_blank');
                }
            });
        });
    }

    displayNoResults() {
        const searchResults = document.getElementById('search-results');
        if (searchResults) {
            searchResults.innerHTML = '<div class="search-no-results">No results found</div>';
        }
    }

    displaySearchError() {
        const searchResults = document.getElementById('search-results');
        if (searchResults) {
            searchResults.innerHTML = '<div class="search-error">Search temporarily unavailable</div>';
        }
    }

    clearSearchResults() {
        const searchResults = document.getElementById('search-results');
        if (searchResults) {
            searchResults.innerHTML = '';
        }
    }

    redirectToSearch(query) {
        const searchURL = `${this.backendBaseURL}/search/?q=${encodeURIComponent(query)}`;
        window.open(searchURL, '_blank');
    }

    setupAuthenticationHandlers() {
        const loginBtn = document.getElementById('loginSignupBtn');
        const profileBtn = document.getElementById('profileBtn');

        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                this.redirectToAuth('login');
            });
        }

        if (profileBtn) {
            profileBtn.addEventListener('click', () => {
                this.showProfileDropdown();
            });
        }
    }

    redirectToAuth(type = 'login') {
        const authURL = type === 'register' 
            ? `${this.backendBaseURL}/register/`
            : `${this.backendBaseURL}/login/`;
        
        window.open(authURL, '_blank');
    }

    async loadUserState() {
        try {
            const isAuthenticated = await this.checkAuthentication();
            this.updateAuthUI(isAuthenticated);
        } catch (error) {
            console.log('User not authenticated');
            this.updateAuthUI(false);
        }
    }

    updateAuthUI(isAuthenticated) {
        const authContainer = document.getElementById('authButtonContainer');
        const profileContainer = document.getElementById('profileContainer');

        if (isAuthenticated && this.currentUser) {
            // Show profile, hide login
            if (authContainer) authContainer.style.display = 'none';
            if (profileContainer) {
                profileContainer.style.display = 'block';
                this.updateProfileInfo(this.currentUser);
            }
        } else {
            // Show login, hide profile
            if (authContainer) authContainer.style.display = 'block';
            if (profileContainer) profileContainer.style.display = 'none';
        }
    }

    updateProfileInfo(user) {
        const profileName = document.getElementById('profileName');
        const dropdownName = document.getElementById('dropdownName');
        const dropdownEmail = document.getElementById('dropdownEmail');

        if (profileName) profileName.textContent = user.name || 'User';
        if (dropdownName) dropdownName.textContent = user.name || 'User';
        if (dropdownEmail) dropdownEmail.textContent = user.email || '';
    }

    showLoadingState(section) {
        const link = document.querySelector(`[data-section="${section}"]`);
        if (link) {
            link.classList.add('loading');
        }
    }

    hideLoadingState(section) {
        const link = document.querySelector(`[data-section="${section}"]`);
        if (link) {
            link.classList.remove('loading');
        }
    }

    showError(message) {
        // You can implement a toast notification system here
        console.error(message);
        alert(message); // Temporary - replace with better UI
    }

    logNavigation(section, url) {
        // Log navigation for analytics
        console.log(`Navigation: ${section} -> ${url}`);
        
        // You can send this to your analytics service
        if (typeof gtag !== 'undefined') {
            gtag('event', 'navigation', {
                event_category: 'navigation',
                event_label: section,
                value: url
            });
        }
    }
}

// Initialize navigation when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new G2OwnNavigation();
    });
} else {
    new G2OwnNavigation();
}
