/* G2Own Search - Simplified Implementation
 * This is a minimal, conflict-free search implementation
 */

(function() {
    'use strict';
    
    console.log('🔍 Loading simplified search functionality...');
    
    function initSimpleSearch() {
        console.log('🚀 Initializing simple search...');
        
        const button = document.getElementById('top-search-toggle');
        const dropdown = document.getElementById('top-search-dropdown');
        const input = document.getElementById('top-search-input');
        
        if (!button) {
            console.log('❌ Search button not found');
            return;
        }
        
        if (!dropdown) {
            console.log('❌ Search dropdown not found');
            return;
        }
        
        if (!input) {
            console.log('❌ Search input not found');
            return;
        }
        
        console.log('✅ All search elements found');
        
        let isOpen = false;
        
        // Remove any existing event listeners by cloning the button
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Add click handler to open/close search
        newButton.addEventListener('click', function(e) {
            console.log('🔍 Search button clicked!');
            e.preventDefault();
            e.stopPropagation();
            
            if (!isOpen) {
                // Open search
                dropdown.style.display = 'block';
                dropdown.style.opacity = '0';
                dropdown.style.transform = 'translateY(-10px)';
                
                setTimeout(() => {
                    dropdown.style.transition = 'all 0.3s ease';
                    dropdown.style.opacity = '1';
                    dropdown.style.transform = 'translateY(0)';
                    input.focus();
                }, 10);
                
                isOpen = true;
                newButton.style.color = '#8b0000';
                console.log('✅ Search opened');
            } else {
                // Close search
                dropdown.style.transition = 'all 0.3s ease';
                dropdown.style.opacity = '0';
                dropdown.style.transform = 'translateY(-10px)';
                
                setTimeout(() => {
                    dropdown.style.display = 'none';
                }, 300);
                
                isOpen = false;
                newButton.style.color = '';
                console.log('✅ Search closed');
            }
        });
        
        // Handle input submission
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = input.value.trim();
                if (query) {
                    console.log('🔍 Searching for:', query);
                    const searchUrl = `https://g2own.com/community/search/?q=${encodeURIComponent(query)}`;
                    console.log('🌐 Redirecting to:', searchUrl);
                    window.location.href = searchUrl;
                }
            }
        });
        
        // Close on escape
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                newButton.click(); // This will close the search
            }
        });
        
        // Close when clicking outside
        document.addEventListener('click', function(e) {
            if (isOpen && !dropdown.contains(e.target) && !newButton.contains(e.target)) {
                newButton.click(); // This will close the search
            }
        });
        
        console.log('✅ Simple search initialized successfully');
        
        // Add a global function for testing
        window.testSearch = function() {
            console.log('🧪 Testing search...');
            newButton.click();
        };
        
        console.log('💡 You can test the search by running: testSearch() in console');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSimpleSearch);
    } else {
        // DOM is already ready
        initSimpleSearch();
    }
    
    // Also try again after a delay to ensure all other scripts have loaded
    setTimeout(initSimpleSearch, 1000);
    
})();
