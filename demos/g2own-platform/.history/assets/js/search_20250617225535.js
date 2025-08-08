/**
 * Search Functionality for G2Own Website
 * Handles search toggle, input, and integration with G2Own community search
 */

class SearchManager {
    constructor() {
        this.searchToggle = document.getElementById('search-toggle');
        this.searchDropdown = document.getElementById('search-dropdown');
        this.searchInput = document.getElementById('search-input');
        this.searchResults = document.getElementById('search-results');
        this.searchClear = document.querySelector('.search-clear');
        
        this.isOpen = false;
        this.searchTimeout = null;
        
        this.init();
    }
    
    init() {
        if (!this.searchToggle || !this.searchDropdown || !this.searchInput) {
            console.warn('Search elements not found');
            return;
        }
        
        this.bindEvents();
        this.loadSuggestions();
    }
    
    bindEvents() {
        // Toggle search dropdown
        this.searchToggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleSearch();
        });
        
        // Handle search input
        this.searchInput.addEventListener('input', (e) => {
            this.handleInput(e.target.value);
        });
        
        // Handle Enter key for search
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.performSearch(this.searchInput.value.trim());
            }
        });
        
        // Handle Escape key to close
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSearch();
            }
        });
        
        // Clear search
        if (this.searchClear) {
            this.searchClear.addEventListener('click', () => {
                this.clearSearch();
            });
        }
        
        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.searchDropdown.contains(e.target) && !this.searchToggle.contains(e.target)) {
                this.closeSearch();
            }
        });
    }
    
    toggleSearch() {
        if (this.isOpen) {
            this.closeSearch();
        } else {
            this.openSearch();
        }
    }
    
    openSearch() {
        this.isOpen = true;
        this.searchToggle.classList.add('active');
        this.searchDropdown.classList.add('active');
        setTimeout(() => {
            this.searchInput.focus();
        }, 100);
    }
    
    closeSearch() {
        this.isOpen = false;
        this.searchToggle.classList.remove('active');
        this.searchDropdown.classList.remove('active');
        this.clearResults();
    }
    
    clearSearch() {
        this.searchInput.value = '';
        this.clearResults();
        this.loadSuggestions();
        this.searchInput.focus();
    }
    
    handleInput(value) {
        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // Debounce search
        this.searchTimeout = setTimeout(() => {
            if (value.trim().length > 0) {
                this.showSearchResults(value.trim());
            } else {
                this.loadSuggestions();
            }
        }, 300);
    }
    
    showSearchResults(query) {
        const results = this.getSearchSuggestions(query);
        
        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="search-result-item" onclick="searchManager.performSearch('${query}')">
                    <i class="ph ph-magnifying-glass search-result-icon"></i>
                    Search for "${query}" in G2Own Community
                </div>
            `;
            return;
        }
        
        let html = '';
        results.forEach(result => {
            html += `
                <div class="search-result-item" onclick="searchManager.performSearch('${result.query}')">
                    <i class="${result.icon} search-result-icon"></i>
                    ${result.title}
                </div>
            `;
        });
        
        // Add option to search in community
        html += `
            <div class="search-result-item" onclick="searchManager.performSearch('${query}')">
                <i class="ph ph-magnifying-glass search-result-icon"></i>
                Search for "${query}" in G2Own Community
            </div>
        `;
        
        this.searchResults.innerHTML = html;
    }
    
    getSearchSuggestions(query) {
        const suggestions = [
            { title: 'Steam Games', query: 'steam games', icon: 'ph ph-steam-logo' },
            { title: 'PC Games', query: 'pc games', icon: 'ph ph-desktop' },
            { title: 'Console Games', query: 'console games', icon: 'ph ph-game-controller' },
            { title: 'Software', query: 'software', icon: 'ph ph-code' },
            { title: 'Gift Cards', query: 'gift cards', icon: 'ph ph-gift' },
            { title: 'Minecraft', query: 'minecraft', icon: 'ph ph-cube' },
            { title: 'Fortnite', query: 'fortnite', icon: 'ph ph-game-controller' },
            { title: 'Call of Duty', query: 'call of duty', icon: 'ph ph-crosshair' },
            { title: 'FIFA', query: 'fifa', icon: 'ph ph-soccer-ball' },
            { title: 'GTA', query: 'gta', icon: 'ph ph-car' },
            { title: 'Windows Keys', query: 'windows', icon: 'ph ph-windows-logo' },
            { title: 'Office', query: 'microsoft office', icon: 'ph ph-microsoft-office-logo' },
            { title: 'Antivirus', query: 'antivirus', icon: 'ph ph-shield-check' },
            { title: 'VPN', query: 'vpn', icon: 'ph ph-lock' }
        ];
        
        const lowerQuery = query.toLowerCase();
        return suggestions.filter(item => 
            item.title.toLowerCase().includes(lowerQuery) ||
            item.query.toLowerCase().includes(lowerQuery)
        ).slice(0, 5);
    }
    
    loadSuggestions() {
        const suggestions = [
            'Steam Games',
            'PC Games', 
            'Console Games',
            'Software',
            'Gift Cards',
            'Popular Games'
        ];
        
        let html = '<div class="search-suggestions-title">Popular Searches</div>';
        suggestions.forEach(suggestion => {
            html += `
                <a href="#" class="search-suggestion" onclick="searchManager.performSearch('${suggestion}'); return false;">
                    ${suggestion}
                </a>
            `;
        });
        
        this.searchResults.innerHTML = html;
    }
    
    clearResults() {
        this.searchResults.innerHTML = '';
    }
    
    performSearch(query) {
        if (!query || !query.trim()) {
            return;
        }
        
        // Encode the search query for URL
        const encodedQuery = encodeURIComponent(query.trim());
        
        // Redirect to G2Own community search
        const searchUrl = `https://g2own.com/community/search/?q=${encodedQuery}`;
        
        // Analytics tracking (if available)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'search', {
                search_term: query.trim()
            });
        }
        
        // Open search in current window
        window.location.href = searchUrl;
    }
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.searchManager = new SearchManager();
});

// Global function for onclick handlers
function performSearch(query) {
    if (window.searchManager) {
        window.searchManager.performSearch(query);
    }
}
