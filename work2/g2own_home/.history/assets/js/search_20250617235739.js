/* G2Own Search Functionality - Working Implementation
 * Search dropdown that appears below the navbar
 * Syncs with https://g2own.com/community/search/
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing G2Own search functionality...');
    
    // Wait a bit to ensure other scripts have loaded and avoid conflicts
    setTimeout(() => {
        // Initialize only the top search (left search removed for redundancy)
        initializeTopSearch();
    }, 200);

    function initializeTopSearch() {
        const searchToggle = document.getElementById('top-search-toggle');
        const searchDropdown = document.getElementById('top-search-dropdown');
        const searchInput = document.getElementById('top-search-input');
        const searchClear = document.getElementById('search-clear');
        const searchSubmit = document.getElementById('search-submit');
          console.log('Search elements found:', {
            searchToggle: !!searchToggle,
            searchDropdown: !!searchDropdown,
            searchInput: !!searchInput,
            searchClear: !!searchClear,
            searchSubmit: !!searchSubmit
        });
        
        // Additional debugging
        if (searchToggle) {
            console.log('Search toggle element:', searchToggle);
            console.log('Search toggle computed style:', window.getComputedStyle(searchToggle));
            console.log('Search toggle pointer events:', window.getComputedStyle(searchToggle).pointerEvents);
        }
        
        if (!searchToggle || !searchDropdown || !searchInput) {
            console.log('Search elements not found - aborting initialization');
            return;
        }

        console.log('Initializing top search dropdown');
        let isSearchOpen = false;

        // Toggle search dropdown visibility
        searchToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log(`Search button clicked, isOpen: ${isSearchOpen}`);
            
            if (!isSearchOpen) {
                openSearch();
            } else {
                closeSearch();
            }
        });        // Clear search button
        if (searchClear) {
            searchClear.addEventListener('click', function(e) {
                e.preventDefault();
                clearSearch();
            });
        }

        // Submit search button
        if (searchSubmit) {
            searchSubmit.addEventListener('click', function(e) {
                e.preventDefault();
                const query = searchInput.value.trim();
                console.log(`Submit button clicked with query: "${query}"`);
                if (query) {
                    // Add loading state to submit button
                    searchSubmit.classList.add('loading');
                    const submitIcon = searchSubmit.querySelector('i');
                    if (submitIcon) {
                        submitIcon.className = 'ph ph-spinner';
                    }
                    
                    performSearch(query);
                }
            });
        }// Handle Enter key in search input
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = searchInput.value.trim();
                console.log(`Enter pressed with query: "${query}"`);
                if (query) {
                    // Add loading state to search button
                    searchToggle.classList.add('loading');
                    const searchIcon = searchToggle.querySelector('i');
                    if (searchIcon) {
                        searchIcon.className = 'ph ph-spinner nav-gaming-icon';
                    }
                    
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
            if (isSearchOpen && 
                !searchDropdown.contains(e.target) && 
                !searchToggle.contains(e.target)) {
                console.log('Clicking outside, closing search');
                closeSearch();
            }
        });

        // Show/hide clear button based on input
        searchInput.addEventListener('input', function() {
            const value = this.value.trim();
            
            if (searchClear) {
                if (value.length > 0) {
                    searchClear.classList.add('visible');
                    searchInput.style.borderColor = '#8B0000';
                    searchInput.style.boxShadow = '0 0 15px rgba(139, 0, 0, 0.3)';
                } else {
                    searchClear.classList.remove('visible');
                    searchInput.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    searchInput.style.boxShadow = 'none';
                }
            }
        });        function openSearch() {
            console.log('Opening search dropdown');
            
            // Reset any loading states
            searchToggle.classList.remove('loading');
            const searchIcon = searchToggle.querySelector('i');
            if (searchIcon) {
                searchIcon.className = 'ph ph-magnifying-glass nav-gaming-icon';
            }
            
            if (searchSubmit) {
                searchSubmit.classList.remove('loading');
                const submitIcon = searchSubmit.querySelector('i');
                if (submitIcon) {
                    submitIcon.className = 'ph ph-arrow-right';
                }
            }
            
            // Show and animate the dropdown
            searchDropdown.style.display = 'block';
            
            // Small delay to ensure display is set before adding active class
            setTimeout(() => {
                searchDropdown.classList.add('active');
                searchToggle.classList.add('active');
                searchInput.focus();
                isSearchOpen = true;
                
                // Add instructions if not present
                addSearchInstructions();
                
                console.log('Search dropdown opened and focused');
            }, 10);

            // Track search open event
            trackSearchEvent('search_opened', { source: 'top_nav' });
        }

        function closeSearch() {
            console.log('Closing search dropdown');
            
            searchDropdown.classList.remove('active');
            searchToggle.classList.remove('active');
            
            setTimeout(() => {
                searchDropdown.style.display = 'none';
                isSearchOpen = false;
                console.log('Search dropdown closed and hidden');
            }, 300);

            // Track search close event
            trackSearchEvent('search_closed', { source: 'top_nav' });
        }

        function clearSearch() {
            console.log('Clearing search input');
            searchInput.value = '';
            searchClear.classList.remove('visible');
            searchInput.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            searchInput.style.boxShadow = 'none';
            searchInput.focus();

            // Track search clear event
            trackSearchEvent('search_cleared', { source: 'top_nav' });
        }        function performSearch(query) {
            console.log('Performing search for query:', query);
            
            // Validate search query
            if (!query || query.trim().length === 0) {
                console.log('Empty search query, not performing search');
                return;
            }
            
            // Encode the search query for URL
            const encodedQuery = encodeURIComponent(query.trim());
            
            // Create the search URL for G2Own community
            const searchUrl = `https://g2own.com/community/search/?q=${encodedQuery}`;
            
            console.log('Redirecting to:', searchUrl);
            
            // Track search event
            trackSearchEvent('search_performed', {
                search_term: query.trim(),
                source: 'top_nav',
                url: searchUrl
            });
            
            // Close search dropdown before redirecting
            closeSearch();
            
            // Add small delay for better UX
            setTimeout(() => {
                // Open search results in current window
                window.location.href = searchUrl;
            }, 100);
        }        function addSearchInstructions() {
            // Check if instructions already exist
            if (searchDropdown.querySelector('.search-instructions')) {
                return;
            }

            const instructions = document.createElement('div');
            instructions.className = 'search-instructions';
            instructions.innerHTML = 'Type to search games, software, and digital content • Press <kbd>Enter</kbd> or click <i class="ph ph-arrow-right"></i> to search • <kbd>Esc</kbd> to close';
            
            searchDropdown.appendChild(instructions);
        }

        console.log('Top search initialized successfully');
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
