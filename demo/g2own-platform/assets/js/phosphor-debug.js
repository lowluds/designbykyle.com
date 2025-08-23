/**
 * Phosphor Icons Debug and Fix Script
 * Run this in browser console to diagnose and fix icon loading issues
 */

function debugPhosphorIcons() {
    console.log('🔍 Phosphor Icons Debug Report');
    console.log('================================');
    
    // 1. Check if local icons are loaded
    const localRegular = document.getElementById('phosphor-local-regular');
    const localFill = document.getElementById('phosphor-local-fill');
    
    console.log('📁 Local Icon Files:');
    console.log('Regular CSS:', localRegular ? 'Found' : 'Missing', localRegular?.href);
    console.log('Fill CSS:', localFill ? 'Found' : 'Missing', localFill?.href);
    
    // 2. Check if CDN fallback is active
    const cdnRegular = document.getElementById('phosphor-cdn-regular');
    const cdnFill = document.getElementById('phosphor-cdn-fill');
    
    console.log('🌐 CDN Fallback:');
    console.log('Regular CDN:', cdnRegular ? 'Found' : 'Missing', cdnRegular?.media);
    console.log('Fill CDN:', cdnFill ? 'Found' : 'Missing', cdnFill?.media);
    
    // 3. Test actual icon rendering
    const testIcon = document.querySelector('.ph');
    if (testIcon) {
        const computed = window.getComputedStyle(testIcon, ':before');
        console.log('🎨 Icon Rendering Test:');
        console.log('Icon element found:', testIcon.className);
        console.log('Before content:', computed.content);
        console.log('Font family:', computed.fontFamily);
        console.log('Icons working:', computed.content !== 'none' && computed.content !== '""');
    } else {
        console.log('❌ No .ph elements found on page');
    }
    
    // 4. List all icon classes used
    const allIcons = document.querySelectorAll('[class*="ph-"]');
    console.log('📋 Icons on page:', allIcons.length);
    if (allIcons.length > 0) {
        const iconClasses = Array.from(allIcons).map(el => 
            Array.from(el.classList).filter(cls => cls.startsWith('ph-'))
        ).flat();
        console.log('Icon classes:', [...new Set(iconClasses)]);
    }
    
    console.log('================================');
    
    // Return diagnostic object
    return {
        localLoaded: localRegular && localFill,
        cdnActive: cdnRegular?.media === 'all' || cdnFill?.media === 'all',
        iconsRendering: testIcon && window.getComputedStyle(testIcon, ':before').content !== 'none',
        iconCount: allIcons.length
    };
}

function fixPhosphorIcons() {
    console.log('🔧 Attempting to fix Phosphor Icons...');
    
    // Force activate CDN fallback
    const cdnRegular = document.getElementById('phosphor-cdn-regular');
    const cdnFill = document.getElementById('phosphor-cdn-fill');
    
    if (cdnRegular) {
        cdnRegular.media = 'all';
        console.log('✅ Activated CDN regular icons');
    }
    
    if (cdnFill) {
        cdnFill.media = 'all';
        console.log('✅ Activated CDN fill icons');
    }
    
    // Add emergency fallback
    if (!document.querySelector('#phosphor-emergency-fix')) {
        const emergencyLink = document.createElement('link');
        emergencyLink.id = 'phosphor-emergency-fix';
        emergencyLink.rel = 'stylesheet';
        emergencyLink.href = 'https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/regular/style.css';
        document.head.appendChild(emergencyLink);
        console.log('🆘 Added emergency fallback');
    }
    
    // Test after 2 seconds
    setTimeout(() => {
        const result = debugPhosphorIcons();
        if (result.iconsRendering) {
            console.log('🎉 Icons fixed successfully!');
        } else {
            console.log('❌ Icons still not working. Check server paths.');
        }
    }, 2000);
}

// Auto-run debug when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(debugPhosphorIcons, 1000);
    });
} else {
    debugPhosphorIcons();
}

// Make functions available globally
window.debugPhosphorIcons = debugPhosphorIcons;
window.fixPhosphorIcons = fixPhosphorIcons;

console.log('💡 Phosphor Debug Tools loaded. Use debugPhosphorIcons() or fixPhosphorIcons() in console.');
