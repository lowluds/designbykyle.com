/**
 * Force Middle Button Black
 * This script exclusively focuses on making the middle button completely black.
 * It uses direct DOM manipulation and inline styles to override any conflicting styles.
 */

(function() {
    // Wait for page to be fully loaded
    window.addEventListener('load', function() {
        console.log("🎮 Force Middle Button Black - Initializing...");
        
        // Function to directly modify the button
        function forceMiddleButtonBlack() {
            // Try to find the middle button using various selectors
            const middleButton = 
                document.querySelector('.preview-icon[data-action="library"]') || 
                document.querySelectorAll('.preview-icon')[2] || 
                document.querySelector('.preview-icon[data-tooltip="Library"]') ||
                document.querySelector('.preview-icon[data-tooltip="My Library"]');
                
            if (!middleButton) {
                console.log("⚠️ Middle button not found yet");
                return;
            }
            
            console.log("🎯 Middle button found - enforcing style");
            
            // Direct DOM manipulation with inline styles (highest priority)
            middleButton.setAttribute('style', `
                background-color: #000000 !important;
                background: #000000 !important;
                background-image: none !important;
                box-shadow: none !important;
                filter: none !important;
                -webkit-backdrop-filter: none !important;
                backdrop-filter: none !important;
            `);
            
            // Remove any classes that might be causing the issue
            middleButton.className = 'preview-icon';
            
            // Clean up any children elements
            Array.from(middleButton.children).forEach(child => {
                // Keep only essential attributes
                const tagName = child.tagName;
                const textContent = child.textContent;
                const newChild = document.createElement(tagName);
                newChild.textContent = textContent;
                newChild.setAttribute('style', 'background: transparent !important; background-color: transparent !important;');
                
                // Replace the old child with the clean new one
                child.parentNode.replaceChild(newChild, child);
            });
            
            console.log("✅ Middle button forced black successfully");
        }
        
        // Try to fix the button immediately
        forceMiddleButtonBlack();
        
        // Check again periodically (5 times per second for 10 seconds)
        for (let i = 1; i <= 50; i++) {
            setTimeout(forceMiddleButtonBlack, i * 200);
        }
        
        // Set up a permanent observer to catch any dynamic changes
        if (window.MutationObserver) {
            const observer = new MutationObserver(function() {
                forceMiddleButtonBlack();
            });
            
            // Monitor the entire document for changes
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class']
            });
            
            console.log("👁️ Middle button observer active");
        }
    });
})();
