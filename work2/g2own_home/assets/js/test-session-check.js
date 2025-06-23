/*!
 * Session Checker Test Script
 * Tests the backend session-check.php endpoint
 */

// Quick test script to verify the session checker is working
async function testSessionChecker() {
    console.log('🧪 Testing session checker...');
    
    const baseURL = window.location.origin + '/community';
    const sessionCheckURL = baseURL + '/session-check.php';
    
    try {
        console.log('📡 Testing URL:', sessionCheckURL);
        
        const response = await fetch(sessionCheckURL, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', [...response.headers.entries()]);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Session check successful:', data);
            
            if (data.authenticated) {
                console.log(`✅ User is authenticated: ${data.user.name}`);
                
                // Update UI if auth bridge exists
                if (window.authBridge) {
                    window.authBridge.updateAuthState(true, data.user);
                }
            } else {
                console.log('❌ User is not authenticated');
                
                // Update UI if auth bridge exists
                if (window.authBridge) {
                    window.authBridge.updateAuthState(false, null);
                }
            }
            
            return data;
        } else {
            const text = await response.text();
            console.error('❌ Session check failed:', response.status, text);
            return null;
        }
        
    } catch (error) {
        console.error('❌ Session check error:', error);
        return null;
    }
}

// Test JSONP method
async function testJSONPMethod() {
    console.log('🧪 Testing JSONP method...');
    
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        const callbackName = 'testJSONP_' + Date.now();
        const sessionCheckURL = window.location.origin + '/community/session-check.php';
        
        // Set up callback
        window[callbackName] = function(data) {
            console.log('✅ JSONP test successful:', data);
            
            // Cleanup
            delete window[callbackName];
            document.head.removeChild(script);
            resolve(data);
        };
        
        // Set up error handling
        script.onerror = function() {
            console.error('❌ JSONP test failed: Script load error');
            delete window[callbackName];
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
            reject(new Error('JSONP script load failed'));
        };
        
        // Set timeout
        setTimeout(() => {
            if (window[callbackName]) {
                console.error('❌ JSONP test failed: Timeout');
                delete window[callbackName];
                if (document.head.contains(script)) {
                    document.head.removeChild(script);
                }
                reject(new Error('JSONP timeout'));
            }
        }, 10000);
        
        // Create request
        script.src = `${sessionCheckURL}?callback=${callbackName}&_=${Date.now()}`;
        document.head.appendChild(script);
    });
}

// Test all authentication methods
async function testAllAuthMethods() {
    console.log('🧪 Testing all authentication methods...');
    
    const results = {
        fetch: null,
        jsonp: null,
        iframe: null
    };
    
    // Test Fetch
    try {
        console.log('📡 Testing Fetch method...');
        results.fetch = await testSessionChecker();
    } catch (error) {
        console.error('❌ Fetch test failed:', error);
        results.fetch = { error: error.message };
    }
    
    // Test JSONP
    try {
        console.log('📡 Testing JSONP method...');
        results.jsonp = await testJSONPMethod();
    } catch (error) {
        console.error('❌ JSONP test failed:', error);
        results.jsonp = { error: error.message };
    }
    
    // Test iframe (if auth bridge exists)
    if (window.authBridge && window.authBridge.checkViaIframe) {
        try {
            console.log('📡 Testing iframe method...');
            const iframeResult = await window.authBridge.checkViaIframe();
            results.iframe = { authenticated: iframeResult };
        } catch (error) {
            console.error('❌ Iframe test failed:', error);
            results.iframe = { error: error.message };
        }
    }
    
    console.log('📊 All test results:', results);
    return results;
}

// Auto-run basic test when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(testSessionChecker, 1000);
    });
} else {
    setTimeout(testSessionChecker, 1000);
}

// Make functions globally available for manual testing
window.testSessionChecker = testSessionChecker;
window.testJSONPMethod = testJSONPMethod;
window.testAllAuthMethods = testAllAuthMethods;
