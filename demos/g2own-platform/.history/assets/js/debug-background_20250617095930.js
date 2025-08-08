/**
 * Debug Background Color Fix
 * This script aggressively enforces the black background color for all sidebar buttons,
 * especially focusing on the middle button with extreme specificity.
 */

(function() {
    console.log("📋 Debug Background Fix - Starting...");
    
    // Get computed style values from the other buttons to apply to the middle one
    function getExactStyleFromOtherButtons() {
        const allButtons = document.querySelectorAll('.preview-icon');
        if (allButtons.length < 3) return null;
        
        // Get the first button (known to have the correct style)
        const referenceButton = allButtons[0];
        if (!referenceButton) return null;
        
        // Get computed styles
        const computedStyle = window.getComputedStyle(referenceButton);
        
        return {
            backgroundColor: computedStyle.backgroundColor,
            background: computedStyle.background,
            backgroundImage: computedStyle.backgroundImage
        };
    }
    
    // Apply the exact same styling to all buttons
    function enforceExactStyling() {
        const allButtons = document.querySelectorAll('.preview-icon');
        if (allButtons.length === 0) return false;
        
        console.log("🔍 Found " + allButtons.length + " preview icons");
        
        // Extremely aggressive approach - apply to all buttons
        allButtons.forEach((button, index) => {
            // Force black background with maximum priority
            button.style.cssText += `
                background: #000000 !important;
                background-color: #000000 !important;
                background-image: none !important;
                box-shadow: none !important;
                filter: none !important;
            `;
            
            // Remove any possible background-affecting classes
            if (button.classList.contains('gradient') || 
                button.classList.contains('colorful') || 
                button.classList.contains('special')) {
                button.classList.remove('gradient', 'colorful', 'special');
            }
            
            // Remove any inner elements' backgrounds
            const innerElements = button.querySelectorAll('*');
            innerElements.forEach(el => {
                el.style.cssText += `
                    background: transparent !important;
                    background-color: transparent !important;
                    background-image: none !important;
                `;
            });
            
            // Log that we've applied the fix
            console.log(`🛠️ Fixed button ${index + 1}`);
        });
        
        // Special focus on the middle button (usually index 2 or with data-action="library")
        const middleButton = allButtons[2] || document.querySelector('.preview-icon[data-action="library"]');
        if (middleButton) {
            console.log("🎯 Extra enforcement on middle button");
            
            // Apply all possible background resets with !important
            middleButton.style.cssText += `
                background: #000000 !important;
                background-color: #000000 !important;
                background-image: none !important;
                box-shadow: none !important;
                filter: none !important;
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
            `;
            
            // Clean all children elements too
            Array.from(middleButton.children).forEach(child => {
                child.style.cssText += `
                    background: transparent !important;
                    background-color: transparent !important;
                    background-image: none !important;
                `;
            });
            
            // If there's an icon background div, make sure it's transparent
            const iconBackground = middleButton.querySelector('.icon-background');
            if (iconBackground) {
                iconBackground.style.cssText += `
                    background: transparent !important;
                    background-color: transparent !important;
                    background-image: none !important;
                `;
                console.log("Found and fixed .icon-background within middle button");
            }
        }
        
        return true;
    }
    
    // Execute fixes on various events
    function executeFixOnEvents() {
        // Immediate execution
        enforceExactStyling();
        
        // On window load
        window.addEventListener('load', function() {
            enforceExactStyling();
            
            // Run multiple times to catch any post-load changes
            setTimeout(enforceExactStyling, 500);
            setTimeout(enforceExactStyling, 1000);
            setTimeout(enforceExactStyling, 2000);
        });
        
        // Periodic checks - aggressive timing
        setInterval(enforceExactStyling, 1000); // Check every second
        
        // MutationObserver to catch dynamic changes
        const observer = new MutationObserver(function(mutations) {
            // Check if any mutations involve our buttons
            const shouldUpdate = mutations.some(mutation => {
                return mutation.target.classList && 
                       (mutation.target.classList.contains('preview-icon') || 
                        mutation.target.closest('.preview-icon'));
            });
            
            if (shouldUpdate) {
                console.log("🔄 Detected changes to buttons, reapplying fix");
                enforceExactStyling();
            }
        });
        
        // Start observing with comprehensive options
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
        
        console.log("🔍 Debug Background Fix - Monitoring active");
    }
    
    // Start the whole process
    executeFixOnEvents();
})();