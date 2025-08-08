/* G2Own Search Functionality - Working Implementation
 * Enables search input fields that sync with https://g2own.com/community/search/
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing G2Own search functionality...');
    
    // Initialize both search instances
    initializeSearch('top-search-toggle', 'top-search-input');
    initializeSearch('left-search-toggle', 'left-search-input');

    function initializeSearch(toggleId, inputId) {
        const searchToggle = document.getElementById(toggleId);
        const searchInput = document.getElementById(inputId);
        
        if (!searchToggle || !searchInput) {
            console.log(`Search elements not found: ${toggleId}, ${inputId}`);
            return;
        }

        console.log(`Initializing search for: ${toggleId} -> ${inputId}`);
        let isSearchOpen = false;

        // Toggle search input visibility
        searchToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log(`Search button clicked: ${toggleId}, isOpen: ${isSearchOpen}`);
            
            if (!isSearchOpen) {
                openSearch();
            } else {
                if (searchInput.value.trim()) {
                    performSearch(searchInput.value.trim());
                } else {
                    closeSearch();
                }
            }
        });

        // Handle Enter key in search input
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = searchInput.value.trim();
                console.log(`Enter pressed with query: "${query}"`);
                if (query) {
                    performSearch(query);
                }
            }
        });

        // Handle Escape key to close search
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                console.log('Escape pressed, closing search');
                closeSearch();
            }
        });

        // Close search when clicking outside
        document.addEventListener('click', function(e) {
            if (isSearchOpen && !searchToggle.contains(e.target) && !searchInput.contains(e.target)) {
                if (!searchInput.value.trim()) {
                    console.log('Clicking outside, closing search');
                    closeSearch();
                }
            }
        });

        function openSearch() {
            console.log('Opening search for:', inputId);
            searchInput.style.display = 'block';
            searchInput.style.visibility = 'visible';
            
            // Small delay to ensure display is set before adding active class
            setTimeout(() => {
                searchInput.classList.add('active');
                searchToggle.classList.add('active');
                searchInput.focus();
                isSearchOpen = true;
                console.log('Search opened and focused');
            }, 10);

            // Track search open event
            trackSearchEvent('search_opened', { source: inputId.includes('top') ? 'top_nav' : 'left_nav' });
        }

        function closeSearch() {
            console.log('Closing search for:', inputId);
            searchInput.classList.remove('active');
            searchToggle.classList.remove('active');
            
            setTimeout(() => {
                searchInput.style.display = 'none';
                searchInput.value = '';
                isSearchOpen = false;
                console.log('Search closed and hidden');
            }, 400);

            // Track search close event
            trackSearchEvent('search_closed', { source: inputId.includes('top') ? 'top_nav' : 'left_nav' });
        }

        function performSearch(query) {
            console.log('Performing search for query:', query);
            
            // Encode the search query for URL
            const encodedQuery = encodeURIComponent(query);
            
            // Create the search URL for G2Own community
            const searchUrl = `https://g2own.com/community/search/?q=${encodedQuery}&type=all&sortby=newest`;
            
            console.log('Redirecting to:', searchUrl);
            
            // Track search event
            trackSearchEvent('search_performed', {
                search_term: query,
                source: inputId.includes('top') ? 'top_nav' : 'left_nav',
                url: searchUrl
            });
            
            // Open search results in current window
            window.location.href = searchUrl;
        }

        // Add real-time visual feedback
        searchInput.addEventListener('input', function() {
            const value = this.value.toLowerCase().trim();
            
            if (value.length > 0) {
                searchInput.style.borderColor = '#8B0000';
                searchInput.style.boxShadow = '0 0 10px rgba(139, 0, 0, 0.3)';
            } else {
                searchInput.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                searchInput.style.boxShadow = 'none';
            }
        });

        console.log(`Search initialized successfully for: ${toggleId}`);
    }

    // Add keyboard shortcut for search (Ctrl+K or Cmd+K)
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            console.log('Keyboard shortcut triggered (Ctrl/Cmd+K)');
            const topSearchToggle = document.getElementById('top-search-toggle');
            if (topSearchToggle) {
                topSearchToggle.click();
            }
        }
    });

    // Analytics tracking function
    function trackSearchEvent(action, parameters = {}) {
        console.log('Tracking search event:', action, parameters);
        
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

    console.log('G2Own search functionality initialized successfully');
});
