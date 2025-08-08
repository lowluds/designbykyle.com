/**
 * Fix Middle Button Background
 * This script specifically targets the middle button in the left sidebar
 * and ensures it has the exact same background as the other buttons
 */

(function() {
    // Helper function to fix the button's background
    function fixMiddleButtonBackground() {
        console.log("🛠️ Attempting to fix middle button background...");
        
        const allButtons = document.querySelectorAll('.preview-icon');
        if (allButtons.length === 0) {
            console.log("No preview icons found yet, trying again later...");
            return false;
        }
        
        // Apply black background to all buttons for consistency
        allButtons.forEach((button) => {
            button.style.setProperty('background', '#000000', 'important');
            button.style.setProperty('background-color', '#000000', 'important');
            button.style.setProperty('background-image', 'none', 'important');
            
            // Also remove any background from inner elements
            const innerElements = button.querySelectorAll('*');
            innerElements.forEach((el) => {
                el.style.setProperty('background', 'transparent', 'important');
                el.style.setProperty('background-color', 'transparent', 'important');
                el.style.setProperty('background-image', 'none', 'important');
            });
        });
        
        // Target middle button specifically (usually the library button or the 3rd button)
        const middleButton = allButtons[2] || document.querySelector('.preview-icon[data-action="library"]');
        if (middleButton) {
            console.log("🎯 Found middle button, applying fix...");
            
            // Apply the strongest possible background override
            middleButton.style.setProperty('background', '#000000', 'important');
            middleButton.style.setProperty('background-color', '#000000', 'important');
            middleButton.style.setProperty('background-image', 'none', 'important');
            
            // Clear any other potential background-affecting properties
            middleButton.style.setProperty('box-shadow', 'none', 'important');
            middleButton.style.setProperty('filter', 'none', 'important');
            middleButton.style.setProperty('backdrop-filter', 'none', 'important');
            
            // Remove any class that might be affecting the background
            middleButton.classList.remove('colorful', 'gradient', 'special');
            
            console.log("✅ Middle button fix applied!");
            return true;
        } else {
            console.log("⚠️ Middle button not found, will try again...");
            return false;
        }
    }
    
    // Try to fix the button immediately after DOM load
    window.addEventListener('DOMContentLoaded', function() {
        // First attempt
        setTimeout(function() {
            if (!fixMiddleButtonBackground()) {
                // If failed, try again multiple times with increasing delay
                setTimeout(fixMiddleButtonBackground, 500);
                setTimeout(fixMiddleButtonBackground, 1000);
                setTimeout(fixMiddleButtonBackground, 2000);
            }
        }, 100);
    });
    
    // Also try fixing on window load
    window.addEventListener('load', function() {
        fixMiddleButtonBackground();
        
        // Set up a mutation observer to watch for changes to the button
        const observer = new MutationObserver(function(mutations) {
            fixMiddleButtonBackground();
        });
        
        // Start observing the document with the configured parameters
        observer.observe(document.body, { 
            childList: true, 
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
        
        // Periodically check and fix the button (every 2 seconds)
        setInterval(fixMiddleButtonBackground, 2000);
    });
})();
