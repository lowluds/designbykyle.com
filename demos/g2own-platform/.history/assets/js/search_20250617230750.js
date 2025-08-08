/* G2Own Advanced Search Functionality
 * Professional, animated, and accessible search implementation
 * Integrates with Invision Community search at https://g2own.com/community/search/
 */

class G2OwnSearch {
    constructor() {
        this.searchToggle = document.getElementById('search-toggle');
        this.searchDropdown = document.getElementById('search-dropdown');
        this.searchInput = document.getElementById('search-input');
        this.searchClear = document.querySelector('.search-clear');
        this.searchResults = document.getElementById('search-results');
        
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
        this.setupAccessibility();
    }
    
    bindEvents() {
        // Toggle search dropdown
        this.searchToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleSearch();
        });
        
        // Clear search
        this.searchClear?.addEventListener('click', (e) => {
            e.preventDefault();
            this.clearSearch();
        });
        
        // Search input events
        this.searchInput.addEventListener('input', (e) => {
            this.handleSearchInput(e.target.value);
        });
        
        this.searchInput.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });
        
        this.searchInput.addEventListener('focus', () => {
            this.openSearch();
        });
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!this.searchDropdown.contains(e.target) && !this.searchToggle.contains(e.target)) {
                this.closeSearch();
            }
        });
        
        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeSearch();
            }
        });
    }
    
    setupAccessibility() {
        // ARIA attributes
        this.searchToggle.setAttribute('aria-expanded', 'false');
        this.searchToggle.setAttribute('aria-controls', 'search-dropdown');
        this.searchDropdown.setAttribute('aria-hidden', 'true');
        this.searchInput.setAttribute('role', 'searchbox');
        this.searchInput.setAttribute('aria-autocomplete', 'list');
        
        // Screen reader announcements
        this.createLiveRegion();
    }
    
    createLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.id = 'search-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-10000px';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.overflow = 'hidden';
        document.body.appendChild(liveRegion);
        this.liveRegion = liveRegion;
    }
    
    toggleSearch() {
        if (this.isOpen) {
            this.closeSearch();
        } else {
            this.openSearch();
        }
    }
    
    openSearch() {
        if (this.isOpen) return;
        
        this.isOpen = true;
        this.searchDropdown.classList.add('active');
        this.searchToggle.classList.add('active');
        
        // Update ARIA
        this.searchToggle.setAttribute('aria-expanded', 'true');
        this.searchDropdown.setAttribute('aria-hidden', 'false');
        
        // Focus input with slight delay for animation
        setTimeout(() => {
            this.searchInput.focus();
        }, 100);
        
        // Analytics
        this.trackSearchEvent('search_opened');
        
        // Announce to screen readers
        this.announceToScreenReader('Search opened');
    }
    
    closeSearch() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        this.searchDropdown.classList.remove('active');
        this.searchToggle.classList.remove('active');
        
        // Update ARIA
        this.searchToggle.setAttribute('aria-expanded', 'false');
        this.searchDropdown.setAttribute('aria-hidden', 'true');
        
        // Clear results
        this.clearResults();
        
        // Analytics
        this.trackSearchEvent('search_closed');
        
        // Announce to screen readers
        this.announceToScreenReader('Search closed');
    }
    
    handleSearchInput(value) {
        const trimmedValue = value.trim();
        
        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // Show/hide clear button
        if (trimmedValue) {
            this.searchClear?.classList.add('visible');
        } else {
            this.searchClear?.classList.remove('visible');
            this.clearResults();
            return;
        }
        
        // Debounce search
        this.searchTimeout = setTimeout(() => {
            this.performSearch(trimmedValue);
        }, 300);
    }
    
    handleKeydown(e) {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                this.performDirectSearch();
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.navigateResults('down');
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.navigateResults('up');
                break;
        }
    }
    
    performSearch(query) {
        if (query.length < 2) {
            this.clearResults();
            return;
        }
        
        // Show loading state
        this.showLoading();
        
        // Simulate search suggestions (in production, you'd call an API)
        setTimeout(() => {
            this.showSuggestions(query);
        }, 200);
        
        // Analytics
        this.trackSearchEvent('search_query', { search_term: query });
    }
    
    showLoading() {
        this.searchResults.innerHTML = `
            <div class="search-loading">
                <div class="loading-spinner"></div>
                <span>Searching...</span>
            </div>
        `;
        this.searchResults.classList.add('visible');
    }
    
    showSuggestions(query) {
        // Mock suggestions - in production, replace with real API call
        const suggestions = this.generateMockSuggestions(query);
        
        if (suggestions.length === 0) {
            this.showNoResults(query);
            return;
        }
        
        const suggestionsHTML = suggestions.map((suggestion, index) => `
            <div class="search-suggestion" data-index="${index}" role="option" tabindex="-1">
                <i class="ph ph-${suggestion.icon}" aria-hidden="true"></i>
                <div class="suggestion-content">
                    <div class="suggestion-title">${this.highlightQuery(suggestion.title, query)}</div>
                    <div class="suggestion-category">${suggestion.category}</div>
                </div>
            </div>
        `).join('');
        
        this.searchResults.innerHTML = `
            ${suggestionsHTML}
            <div class="search-footer">
                <button class="search-all-btn" onclick="g2ownSearch.performDirectSearch()">
                    <i class="ph ph-magnifying-glass" aria-hidden="true"></i>
                    Search all results for "${query}"
                </button>
            </div>
        `;
        
        this.searchResults.classList.add('visible');
        this.bindSuggestionEvents();
        
        // Announce results count
        this.announceToScreenReader(`${suggestions.length} suggestions found`);
    }
    
    showNoResults(query) {
        this.searchResults.innerHTML = `
            <div class="search-no-results">
                <i class="ph ph-magnifying-glass" aria-hidden="true"></i>
                <div class="no-results-text">No quick suggestions found</div>
                <button class="search-all-btn" onclick="g2ownSearch.performDirectSearch()">
                    <i class="ph ph-arrow-right" aria-hidden="true"></i>
                    Search community for "${query}"
                </button>
            </div>
        `;
        this.searchResults.classList.add('visible');
        
        // Announce to screen readers
        this.announceToScreenReader('No quick suggestions found');
    }
    
    generateMockSuggestions(query) {
        const mockData = [
            { title: 'Steam Games', category: 'Category', icon: 'steam-logo' },
            { title: 'PlayStation Games', category: 'Category', icon: 'gamepad' },
            { title: 'Xbox Games', category: 'Category', icon: 'gamepad' },
            { title: 'Nintendo Switch Games', category: 'Category', icon: 'gamepad' },
            { title: 'PC Software', category: 'Category', icon: 'desktop' },
            { title: 'Gift Cards', category: 'Category', icon: 'gift' },
            { title: 'Gaming Accounts', category: 'Category', icon: 'user-circle' },
            { title: 'Digital Content', category: 'Category', icon: 'download' }
        ];
        
        return mockData.filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 6);
    }
    
    highlightQuery(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    bindSuggestionEvents() {
        const suggestions = this.searchResults.querySelectorAll('.search-suggestion');
        suggestions.forEach((suggestion, index) => {
            suggestion.addEventListener('click', () => {
                this.selectSuggestion(suggestion);
            });
            
            suggestion.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.selectSuggestion(suggestion);
                }
            });
        });
    }
    
    selectSuggestion(suggestion) {
        const title = suggestion.querySelector('.suggestion-title').textContent;
        this.searchInput.value = title;
        this.performDirectSearch();
        
        // Analytics
        this.trackSearchEvent('suggestion_selected', { suggestion: title });
    }
    
    navigateResults(direction) {
        const suggestions = this.searchResults.querySelectorAll('.search-suggestion');
        if (suggestions.length === 0) return;
        
        const current = this.searchResults.querySelector('.search-suggestion.highlighted');
        let newIndex = 0;
        
        if (current) {
            const currentIndex = parseInt(current.dataset.index);
            current.classList.remove('highlighted');
            
            if (direction === 'down') {
                newIndex = (currentIndex + 1) % suggestions.length;
            } else {
                newIndex = currentIndex === 0 ? suggestions.length - 1 : currentIndex - 1;
            }
        }
        
        suggestions[newIndex].classList.add('highlighted');
        suggestions[newIndex].scrollIntoView({ block: 'nearest' });
    }
    
    performDirectSearch() {
        const query = this.searchInput.value.trim();
        if (!query) return;
        
        // Redirect to community search
        const searchUrl = `https://g2own.com/community/search/?q=${encodeURIComponent(query)}`;
        window.open(searchUrl, '_blank', 'noopener,noreferrer');
        
        // Close search
        this.closeSearch();
        
        // Analytics
        this.trackSearchEvent('direct_search', { search_term: query });
        
        // Announce to screen readers
        this.announceToScreenReader(`Searching for ${query} in new tab`);
    }
    
    clearSearch() {
        this.searchInput.value = '';
        this.searchClear?.classList.remove('visible');
        this.clearResults();
        this.searchInput.focus();
        
        // Analytics
        this.trackSearchEvent('search_cleared');
        
        // Announce to screen readers
        this.announceToScreenReader('Search cleared');
    }
    
    clearResults() {
        this.searchResults.innerHTML = '';
        this.searchResults.classList.remove('visible');
    }
    
    trackSearchEvent(action, parameters = {}) {
        // Google Analytics 4 event tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: 'search',
                ...parameters
            });
        }
        
        // Custom analytics if available
        if (window.g2ownAnalytics && typeof window.g2ownAnalytics.track === 'function') {
            window.g2ownAnalytics.track('search', action, parameters);
        }
    }
    
    announceToScreenReader(message) {
        if (this.liveRegion) {
            this.liveRegion.textContent = message;
        }
    }
}

// Initialize search when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.g2ownSearch = new G2OwnSearch();
});

// Export for global access
window.G2OwnSearch = G2OwnSearch;
