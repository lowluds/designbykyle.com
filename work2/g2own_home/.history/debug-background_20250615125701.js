// G2Own Featured Products Background Diagnostic Script
// Copy and paste this into browser console to debug the background issue

console.log('=== G2Own Background Diagnostic ===');

// Find the featured products section
const featuredSection = document.querySelector('.featured-products-section');
const categoriesSection = document.querySelector('.categories');
const featuredGamesSection = document.querySelector('.featured-games-section');

if (featuredSection) {
    console.log('✅ Featured Products Section Found');
    
    const computedStyle = window.getComputedStyle(featuredSection);
    console.log('Featured Products Section Styles:');
    console.log('📌 Background Color:', computedStyle.backgroundColor);
    console.log('📌 Background Image:', computedStyle.backgroundImage);
    console.log('📌 Background:', computedStyle.background);
    console.log('📌 Position:', computedStyle.position);
    console.log('📌 Z-Index:', computedStyle.zIndex);
    
    // Check for pseudo-elements
    const beforeStyle = window.getComputedStyle(featuredSection, '::before');
    const afterStyle = window.getComputedStyle(featuredSection, '::after');
    console.log('📌 ::before display:', beforeStyle.display);
    console.log('📌 ::after display:', afterStyle.display);
    
    // Check element dimensions and position
    const rect = featuredSection.getBoundingClientRect();
    console.log('📌 Element position:', { top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    
} else {
    console.log('❌ Featured Products Section NOT Found');
}

if (categoriesSection) {
    console.log('✅ Categories Section Found');
    const categoriesStyle = window.getComputedStyle(categoriesSection);
    console.log('Categories Section Background:', categoriesStyle.backgroundColor);
} else {
    console.log('❌ Categories Section NOT Found');
}

if (featuredGamesSection) {
    console.log('✅ Featured Games Section Found');
    const gamesStyle = window.getComputedStyle(featuredGamesSection);
    console.log('Featured Games Section Background:', gamesStyle.backgroundColor);
} else {
    console.log('❌ Featured Games Section NOT Found');
}

// Check all CSS files for potential conflicts
console.log('=== CSS Files Loaded ===');
const styleSheets = Array.from(document.styleSheets);
styleSheets.forEach((sheet, index) => {
    try {
        console.log(`${index + 1}. ${sheet.href || 'Inline styles'}`);
    } catch (e) {
        console.log(`${index + 1}. Cross-origin stylesheet (can't access)`);
    }
});

// Check for any elements that might be overlapping
console.log('=== Checking for overlapping elements ===');
if (featuredSection) {
    const elementsAtPoint = document.elementsFromPoint(
        featuredSection.getBoundingClientRect().left + 100,
        featuredSection.getBoundingClientRect().top + 100
    );
    console.log('Elements at featured section point:', elementsAtPoint.map(el => el.className || el.tagName));
}

console.log('=== End Diagnostic ===');
