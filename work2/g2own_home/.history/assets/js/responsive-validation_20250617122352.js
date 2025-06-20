/**
 * G2Own Responsive Sidebar Implementation - Final Validation
 * This script validates that all responsive features are working correctly
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        validateResponsiveImplementation();
    }, 2000);
});

function validateResponsiveImplementation() {
    console.log('🎮 G2Own Responsive Sidebar - Validation Starting...');
    
    const results = {
        cssFiles: checkCSSFiles(),
        elements: checkRequiredElements(),
        responsiveness: checkResponsiveBehavior(),
        touchFriendly: checkTouchFriendliness()
    };
    
    // Display results
    displayValidationResults(results);
    
    return results;
}

function checkCSSFiles() {
    console.log('📄 Checking CSS files...');
    
    const requiredCSS = [
        'responsive-sidebar.css',
        'left-sidebar.css',
        'left-sidebar-enhanced.css',
        'left-sidebar-enhanced-clean.css'
    ];
    
    const loadedCSS = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        .map(link => link.href.split('/').pop())
        .filter(filename => requiredCSS.some(required => filename.includes(required)));
    
    return {
        required: requiredCSS,
        loaded: loadedCSS,
        allLoaded: requiredCSS.every(css => loadedCSS.some(loaded => loaded.includes(css)))
    };
}

function checkRequiredElements() {
    console.log('🔍 Checking required elements...');
    
    const elements = {
        navIcons: document.querySelectorAll('.nav-gaming-icon'), // Updated to correct class
        navLinks: document.querySelectorAll('.nav-link'),
        navTexts: document.querySelectorAll('.nav-text'),
        previewIcon: document.querySelector('.preview-icon'),
        leftSidebar: document.querySelector('.left-sidebar'),
        sidebarContainer: document.querySelector('.sidebar-container')
    };
    
    return {
        navIcons: elements.navIcons.length,
        navLinks: elements.navLinks.length,
        navTexts: elements.navTexts.length,
        previewIcon: !!elements.previewIcon,
        leftSidebar: !!elements.leftSidebar,
        sidebarContainer: !!elements.sidebarContainer,
        allPresent: elements.navIcons.length > 0 && elements.navLinks.length > 0 && 
                   elements.previewIcon && elements.leftSidebar
    };
}

function checkResponsiveBehavior() {
    console.log('📱 Checking responsive behavior...');
    
    const currentWidth = window.innerWidth;
    let breakpoint = '';
    
    if (currentWidth <= 480) breakpoint = 'mobile';
    else if (currentWidth <= 768) breakpoint = 'tablet';
    else if (currentWidth <= 1024) breakpoint = 'desktop';
    else if (currentWidth <= 1440) breakpoint = 'large';
    else breakpoint = 'xlarge';
      // Check if nav icons have proper responsive styles
    const navIcon = document.querySelector('.nav-gaming-icon'); // Updated to correct class
    const navIconStyles = navIcon ? window.getComputedStyle(navIcon) : null;
    
    return {
        currentWidth,
        breakpoint,
        navIconFontSize: navIconStyles ? navIconStyles.fontSize : 'N/A',
        navIconMinWidth: navIconStyles ? navIconStyles.minWidth : 'N/A',
        responsiveStylesApplied: navIconStyles && parseFloat(navIconStyles.fontSize) > 0
    };
}

function checkTouchFriendliness() {
    console.log('👆 Checking touch-friendliness...');
    
    const navLinks = document.querySelectorAll('.nav-link');
    let touchFriendlyCount = 0;
    
    navLinks.forEach(link => {
        const styles = window.getComputedStyle(link);
        const height = parseFloat(styles.height);
        const paddingTop = parseFloat(styles.paddingTop);
        const paddingBottom = parseFloat(styles.paddingBottom);
        const totalHeight = height + paddingTop + paddingBottom;
        
        // Apple recommends minimum 44px touch targets
        if (totalHeight >= 44) {
            touchFriendlyCount++;
        }
    });
    
    return {
        totalLinks: navLinks.length,
        touchFriendlyLinks: touchFriendlyCount,
        percentage: navLinks.length > 0 ? Math.round((touchFriendlyCount / navLinks.length) * 100) : 0,
        meetsStandards: touchFriendlyCount === navLinks.length
    };
}

function displayValidationResults(results) {
    console.log('\n🎯 G2Own Responsive Sidebar - Validation Results:');
    console.log('================================================');
    
    // CSS Files
    console.log(`📄 CSS Files: ${results.cssFiles.allLoaded ? '✅ All loaded' : '❌ Missing files'}`);
    console.log(`   - Required: ${results.cssFiles.required.length}`);
    console.log(`   - Loaded: ${results.cssFiles.loaded.length}`);
    
    // Elements
    console.log(`🔍 Elements: ${results.elements.allPresent ? '✅ All present' : '❌ Missing elements'}`);
    console.log(`   - Nav Icons: ${results.elements.navIcons}`);
    console.log(`   - Nav Links: ${results.elements.navLinks}`);
    console.log(`   - Preview Icon: ${results.elements.previewIcon ? '✅' : '❌'}`);
    console.log(`   - Left Sidebar: ${results.elements.leftSidebar ? '✅' : '❌'}`);
    
    // Responsiveness
    console.log(`📱 Responsive: ${results.responsiveness.responsiveStylesApplied ? '✅ Working' : '❌ Not working'}`);
    console.log(`   - Viewport: ${results.responsiveness.currentWidth}px (${results.responsiveness.breakpoint})`);
    console.log(`   - Nav Icon Font: ${results.responsiveness.navIconFontSize}`);
    
    // Touch Friendliness
    console.log(`👆 Touch-Friendly: ${results.touchFriendly.meetsStandards ? '✅ Meets standards' : '⚠️ Needs improvement'}`);
    console.log(`   - Touch-friendly links: ${results.touchFriendly.touchFriendlyLinks}/${results.touchFriendly.totalLinks} (${results.touchFriendly.percentage}%)`);
    
    // Overall Status
    const overallStatus = results.cssFiles.allLoaded && 
                         results.elements.allPresent && 
                         results.responsiveness.responsiveStylesApplied && 
                         results.touchFriendly.meetsStandards;
    
    console.log(`\n🏆 Overall Status: ${overallStatus ? '✅ IMPLEMENTATION SUCCESSFUL!' : '❌ NEEDS ATTENTION'}`);
    console.log('================================================\n');
    
    // Create visual notification
    if (typeof window.showResponsiveStatus === 'undefined') {
        createVisualNotification(overallStatus, results);
        window.showResponsiveStatus = true;
    }
}

function createVisualNotification(success, results) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        background: ${success ? '#0f5132' : '#721c24'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-family: 'Space Grotesk', monospace;
        font-size: 14px;
        z-index: 10001;
        border: 2px solid ${success ? '#198754' : '#dc3545'};
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        max-width: 300px;
        opacity: 0;
        transform: translateX(-100%);
        transition: all 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 8px;">
            ${success ? '✅' : '⚠️'} Responsive Sidebar
        </div>
        <div style="font-size: 12px; opacity: 0.9;">
            Status: ${success ? 'Implementation Successful!' : 'Needs Attention'}<br>
            Viewport: ${results.responsiveness.currentWidth}px (${results.responsiveness.breakpoint})<br>
            Touch-Friendly: ${results.touchFriendly.percentage}%
        </div>
        <div style="margin-top: 10px; font-size: 11px; opacity: 0.7;">
            Check console for detailed results
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 8000);
}

// Export for global access
window.validateResponsiveImplementation = validateResponsiveImplementation;
