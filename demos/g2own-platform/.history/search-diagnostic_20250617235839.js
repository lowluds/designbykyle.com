// G2Own Search Button Diagnostic Script
// Copy and paste this into the browser console to debug search issues

console.log('🔍 G2Own Search Button Diagnostic Starting...');

// Check if elements exist
const searchToggle = document.getElementById('top-search-toggle');
const searchDropdown = document.getElementById('top-search-dropdown');
const searchInput = document.getElementById('top-search-input');

console.log('📋 Element Check:');
console.log('- Search Toggle:', searchToggle ? '✅ Found' : '❌ NOT FOUND');
console.log('- Search Dropdown:', searchDropdown ? '✅ Found' : '❌ NOT FOUND');
console.log('- Search Input:', searchInput ? '✅ Found' : '❌ NOT FOUND');

if (searchToggle) {
    console.log('\n🎯 Search Toggle Details:');
    console.log('- Element:', searchToggle);
    console.log('- Classes:', searchToggle.className);
    console.log('- ID:', searchToggle.id);
    console.log('- Display:', window.getComputedStyle(searchToggle).display);
    console.log('- Visibility:', window.getComputedStyle(searchToggle).visibility);
    console.log('- Pointer Events:', window.getComputedStyle(searchToggle).pointerEvents);
    console.log('- Z-Index:', window.getComputedStyle(searchToggle).zIndex);
    console.log('- Position:', window.getComputedStyle(searchToggle).position);
    
    // Check for overlapping elements
    const rect = searchToggle.getBoundingClientRect();
    const elementAtPoint = document.elementFromPoint(rect.left + rect.width/2, rect.top + rect.height/2);
    console.log('- Bounds:', rect);
    console.log('- Element at center point:', elementAtPoint);
    console.log('- Is button at center?', elementAtPoint === searchToggle);
    
    // Test click programmatically
    console.log('\n🖱️ Testing Programmatic Click...');
    try {
        searchToggle.click();
        console.log('✅ Programmatic click succeeded');
    } catch (e) {
        console.log('❌ Programmatic click failed:', e);
    }
    
    // Check event listeners
    console.log('\n👂 Event Listeners:');
    const listeners = getEventListeners ? getEventListeners(searchToggle) : 'getEventListeners not available';
    console.log('- Current listeners:', listeners);
    
    // Add test click handler
    console.log('\n🧪 Adding Test Click Handler...');
    const testHandler = function(e) {
        console.log('🎉 TEST CLICK HANDLER TRIGGERED!');
        console.log('- Event:', e);
        console.log('- Target:', e.target);
        console.log('- Current Target:', e.currentTarget);
    };
    
    searchToggle.addEventListener('click', testHandler);
    console.log('✅ Test handler added - try clicking the search button now');
    
    // Manual trigger test
    setTimeout(() => {
        console.log('\n⚡ Manual Event Trigger Test...');
        const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        searchToggle.dispatchEvent(clickEvent);
    }, 1000);
    
} else {
    console.log('❌ Cannot perform detailed diagnostics - search toggle not found');
}

console.log('\n📊 Diagnostic Complete!');
console.log('Instructions:');
console.log('1. Check the element details above');
console.log('2. Try clicking the search button');
console.log('3. Look for the "TEST CLICK HANDLER TRIGGERED!" message');
console.log('4. If you see overlapping elements, that might be the issue');

// Return diagnostic object for further inspection
window.searchDiagnostic = {
    searchToggle,
    searchDropdown,
    searchInput,
    forceClick: () => {
        if (searchToggle) {
            console.log('🔥 Force clicking search button...');
            searchToggle.click();
        }
    },
    inspect: () => {
        if (searchToggle) {
            console.log('🔍 Inspecting search button...');
            searchToggle.style.border = '3px solid red';
            searchToggle.style.background = 'yellow';
            setTimeout(() => {
                searchToggle.style.border = '';
                searchToggle.style.background = '';
            }, 3000);
        }
    }
};

console.log('\n🛠️ Use window.searchDiagnostic.forceClick() or window.searchDiagnostic.inspect() for more tests');
