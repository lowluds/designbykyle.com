/*!
 * G2Own Community Store Integration - Non-Breaking Version
 * Adds community store links and cart functionality without breaking existing features
 * Version: 1.0.0 Safe
 */

(function() {
    'use strict';
    
    // Configuration
    const COMMUNITY_URL = 'https://g2own.com/community';
    const STORE_URL = COMMUNITY_URL + '/store/';
    
    // Wait for page to load completely
    function waitForDOM(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }
    
    // Safe element creation and injection
    function safeInject() {
        try {
            // Add community store links to existing marketplace navigation
            enhanceMarketplaceLinks();
            
            // Add cart indicator to navbar (non-breaking)
            addCartIndicator();
            
            // Add store quick access (floating button)
            addQuickAccess();
            
            console.log('✅ G2Own Community Store integration loaded safely');
        } catch (error) {
            console.log('⚠️ Store integration failed safely:', error.message);
        }
    }
    
    function enhanceMarketplaceLinks() {
        // Find marketplace navigation links and enhance them
        const marketplaceLinks = document.querySelectorAll('a[href="#marketplace"], a[data-section="marketplace"]');
        
        marketplaceLinks.forEach(link => {
            // Add click handler to open community store
            link.addEventListener('click', function(e) {
                e.preventDefault();
                window.open(STORE_URL, '_blank', 'noopener,noreferrer');
            });
            
            // Add tooltip
            link.title = 'Browse G2Own Community Store';
        });
        
        // Enhance "Explore Marketplace" button
        const exploreButton = document.querySelector('[data-action="explore"]');
        if (exploreButton) {
            exploreButton.addEventListener('click', function(e) {
                window.open(STORE_URL, '_blank', 'noopener,noreferrer');
            });
            exploreButton.title = 'Explore G2Own Community Store';
        }
    }
      function addCartIndicator() {
        // Find and enhance the existing cart button instead of creating a new one
        const existingCartButton = document.querySelector('#cart-toggle, .cart-toggle');
        
        if (existingCartButton && !existingCartButton.hasAttribute('data-community-enhanced')) {
            // Mark as enhanced to avoid double-processing
            existingCartButton.setAttribute('data-community-enhanced', 'true');
            
            // Convert existing cart button to link to community store
            existingCartButton.addEventListener('click', function(e) {
                e.preventDefault();
                window.open(STORE_URL + 'cart/', '_blank', 'noopener,noreferrer');
            });
            
            // Update title
            existingCartButton.title = 'View Community Store Cart';
            
            // Add enhanced hover effects while preserving existing styles
            const originalStyle = existingCartButton.style.cssText;
            
            existingCartButton.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.05)';
                this.style.transition = 'all 0.3s ease';
            });
            
            existingCartButton.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });
            
            console.log('✅ Enhanced existing cart button');
        }
        
        // Don't create a new cart link since we're enhancing the existing one
    }
    
    function addQuickAccess() {
        // Add floating store access button (only if it doesn't exist)
        if (document.querySelector('.community-store-fab')) return;
        
        const fab = document.createElement('div');
        fab.className = 'community-store-fab';
        fab.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            opacity: 0;
            transform: translateY(100px);
            transition: all 0.5s ease;
            pointer-events: auto;
        `;
        
        fab.innerHTML = `
            <button style="
                width: 60px;
                height: 60px;
                border-radius: 50%;
                border: none;
                background: linear-gradient(135deg, #8b0000, #660000);
                color: white;
                font-size: 24px;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(139, 0, 0, 0.3);
                transition: all 0.3s ease;
            " title="Open G2Own Store">
                <i class="ph ph-storefront"></i>
            </button>
        `;
        
        // Add click handler
        fab.querySelector('button').addEventListener('click', function() {
            window.open(STORE_URL, '_blank', 'noopener,noreferrer');
        });
        
        // Add hover effect
        fab.querySelector('button').addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.boxShadow = '0 6px 25px rgba(139, 0, 0, 0.4)';
        });
        
        fab.querySelector('button').addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 4px 20px rgba(139, 0, 0, 0.3)';
        });
        
        document.body.appendChild(fab);
        
        // Animate in after a delay
        setTimeout(() => {
            fab.style.opacity = '1';
            fab.style.transform = 'translateY(0)';
        }, 2000);
        
        // Hide on mobile scroll for better UX
        let lastScrollY = window.scrollY;
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            if (window.innerWidth <= 768) {
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    fab.style.transform = 'translateY(100px)';
                    fab.style.opacity = '0.7';
                } else {
                    fab.style.transform = 'translateY(0)';
                    fab.style.opacity = '1';
                }
            }
            lastScrollY = currentScrollY;
        });
    }
    
    // Add community store categories to existing categories section (non-breaking)
    function enhanceCategoriesSection() {
        const categoriesSection = document.querySelector('.categories-section');
        if (!categoriesSection || document.querySelector('.community-categories-added')) return;
        
        try {
            const categoryContainer = categoriesSection.querySelector('.categories-container');
            if (categoryContainer) {
                // Add a separator and community store link
                const storeLink = document.createElement('div');
                storeLink.className = 'community-categories-added';
                storeLink.style.cssText = `
                    text-align: center;
                    margin-top: 40px;
                    padding: 20px;
                    border-top: 1px solid rgba(139, 0, 0, 0.2);
                `;
                
                storeLink.innerHTML = `
                    <h3 style="color: #8b0000; margin-bottom: 16px; font-size: 1.5rem;">
                        Community Store
                    </h3>
                    <p style="color: #a1a1aa; margin-bottom: 20px;">
                        Browse our full collection of games, accounts, and digital services
                    </p>
                    <a href="${STORE_URL}" target="_blank" style="
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        background: linear-gradient(135deg, #8b0000, #660000);
                        color: white;
                        text-decoration: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-weight: 600;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 20px rgba(139,0,0,0.3)'" 
                       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                        <i class="ph ph-arrow-right"></i>
                        Visit Community Store
                    </a>
                `;
                
                categoryContainer.appendChild(storeLink);
            }
        } catch (error) {
            console.log('Could not enhance categories section:', error.message);
        }
    }
    
    // Initialize everything safely
    waitForDOM(() => {
        // Small delay to ensure all other scripts have loaded
        setTimeout(() => {
            safeInject();
            enhanceCategoriesSection();
        }, 500);
    });
    
    // Export for external use if needed
    window.G2OwnStoreIntegration = {
        openStore: () => window.open(STORE_URL, '_blank'),
        openCart: () => window.open(STORE_URL + 'cart/', '_blank'),
        openCategory: (categoryId) => window.open(STORE_URL + `category/${categoryId}/`, '_blank')
    };
    
})();
