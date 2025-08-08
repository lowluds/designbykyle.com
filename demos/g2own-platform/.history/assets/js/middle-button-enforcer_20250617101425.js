/**
 * Middle Button Background Enforcer
 * This script focuses on one task: making sure the middle sidebar button 
 * has exactly the same pure black background (#000000) as the others.
 */

(function() {
    console.log("🎯 Middle Button Background Enforcer - Initializing");
    
    // Function to fix the middle button background
    function enforcePureBlackBackground() {
        try {
            // Get all preview icons
            const buttons = document.querySelectorAll('.preview-icon');
            if (buttons.length < 3) {
                console.log("⚠️ Not enough buttons found, will retry");
                return false;
            }
            
            // Target the middle button (third button)
            const middleButton = buttons[2];
            if (!middleButton) {
                console.log("⚠️ Middle button not found, will retry");
                return false;
            }
            
            console.log("✅ Found middle button, enforcing pure black background");
            
            // Hard-code the pure black background with maximum specificity
            middleButton.style.cssText = `
                background-color: #000000 !important;
                background: #000000 !important;
                background-image: none !important;
                box-shadow: none !important;
                -webkit-backdrop-filter: none !important;
                backdrop-filter: none !important;
                filter: none !important;
            `;
            
            // Find and fix any elements inside the button that might have backgrounds
            const innerElements = middleButton.querySelectorAll('*');
            if (innerElements.length > 0) {
                console.log(`Found ${innerElements.length} inner elements to fix`);
                
                innerElements.forEach(element => {
                    element.style.cssText = `
                        background-color: transparent !important;
                        background: transparent !important;
                        background-image: none !important;
                    `;
                });
            }
            
            return true;
        } catch (error) {
            console.error("❌ Error enforcing background: ", error);
            return false;
        }
    }
    
    // Execute on page load and periodically
    function initBackgroundEnforcer() {
        // Try immediately if DOM is already loaded
        if (document.readyState === 'interactive' || document.readyState === 'complete') {
            enforcePureBlackBackground();
        }
        
        // Try again on DOMContentLoaded
        document.addEventListener('DOMContentLoaded', function() {
            // Try multiple times with increasing delays to catch dynamically created buttons
            setTimeout(enforcePureBlackBackground, 0);
            setTimeout(enforcePureBlackBackground, 100);
            setTimeout(enforcePureBlackBackground, 500);
            setTimeout(enforcePureBlackBackground, 1000);
            setTimeout(enforcePureBlackBackground, 2000);
        });
        
        // Try again on full page load
        window.addEventListener('load', function() {
            // Try multiple times with increasing delays
            setTimeout(enforcePureBlackBackground, 0);
            setTimeout(enforcePureBlackBackground, 100);
            setTimeout(enforcePureBlackBackground, 500);
            setTimeout(enforcePureBlackBackground, 1000);
            setTimeout(enforcePureBlackBackground, 2000);
            
            // Set up continuous monitoring
            setInterval(enforcePureBlackBackground, 1000); // Check every second
        });
        
        // Set up mutation observer to detect changes to the sidebar
        if (window.MutationObserver) {
            console.log("Setting up mutation observer");
            
            const observer = new MutationObserver(function(mutations) {
                enforcePureBlackBackground();
            });
            
            // Start observing once DOM is loaded
            document.addEventListener('DOMContentLoaded', function() {
                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['style', 'class']
                });
            });
        }
    }
    
    // Start the enforcer
    initBackgroundEnforcer();
})();
