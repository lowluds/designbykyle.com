/**
 * Clean Responsive Sidebar Controller
 * Ensures responsive behavior without notifications or debug messages
 */

(function() {
    'use strict';
    
    // Silent responsive controller - no console logs or notifications
    function enforceResponsiveBehavior() {
        // Ensure buttons maintain consistent styling across all screen sizes
        const navButtons = document.querySelectorAll('.nav-link');
        const previewIcons = document.querySelectorAll('.preview-icon');
        
        // Apply consistent styling to navigation buttons
        navButtons.forEach(button => {
            const buttonStyle = button.style;
            buttonStyle.setProperty('background', 'transparent', 'important');
            buttonStyle.setProperty('transition', 'all 0.3s ease', 'important');
        });
        
        // Apply consistent styling to preview icons
        previewIcons.forEach(icon => {
            const iconStyle = icon.style;
            iconStyle.setProperty('background', '#000000', 'important');
            iconStyle.setProperty('background-color', '#000000', 'important');
            iconStyle.setProperty('border-color', 'rgba(239, 68, 68, 0.8)', 'important');
        });
        
        // Ensure gaming icons are properly sized
        const gamingIcons = document.querySelectorAll('.nav-gaming-icon');
        gamingIcons.forEach(icon => {
            icon.style.setProperty('color', 'inherit', 'important');
        });
    }
    
    // Run on DOM ready
    function initializeResponsive() {
        enforceResponsiveBehavior();
        
        // Re-run on window resize (throttled)
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(enforceResponsiveBehavior, 150);
        });
        
        // Re-run when sidebar state changes
        const sidebar = document.querySelector('.left-sidebar');
        if (sidebar) {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && 
                        (mutation.attributeName === 'class' || mutation.attributeName === 'style')) {
                        setTimeout(enforceResponsiveBehavior, 50);
                    }
                });
            });
            
            observer.observe(sidebar, {
                attributes: true,
                attributeFilter: ['class', 'style']
            });
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeResponsive);
    } else {
        initializeResponsive();
    }
    
})();
