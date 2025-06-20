/**
 * SafeStorage - Reliable storage mechanism for G2Own
 * Works in all browsers including private/incognito modes
 * 
 * Implements a reliable storage mechanism with multiple fallbacks:
 * 1. localStorage (primary)
 * 2. sessionStorage (first fallback)
 * 3. cookie storage (second fallback)
 * 4. in-memory storage (final fallback)
 */

(function() {
    // Determine available storage mechanisms
    const storageAvailability = {
        localStorage: (function() {
            try {
                const test = '__storage_test__';
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
            } catch(e) {
                return false;
            }
        })(),
        
        sessionStorage: (function() {
            try {
                const test = '__storage_test__';
                sessionStorage.setItem(test, test);
                sessionStorage.removeItem(test);
                return true;
            } catch(e) {
                return false;
            }
        })(),
        
        cookies: (function() {
            try {
                document.cookie = "__cookie_test__=1; max-age=10";
                const hasCookie = document.cookie.indexOf("__cookie_test__") !== -1;
                document.cookie = "__cookie_test__=; max-age=0"; // Clear test cookie
                return hasCookie;
            } catch(e) {
                return false;
            }
        })()
    };
    
    // Create memory storage
    if (!window._memoryStorage) {
        window._memoryStorage = {};
    }
    
    // Log storage availability for debugging
    console.log('📦 Storage availability:', storageAvailability);
    
    // Cookie storage helper functions
    const cookieStorage = {
        getItem: function(key) {
            const nameEQ = key + "=";
            const ca = document.cookie.split(';');
            for(let i=0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) {
                    const value = c.substring(nameEQ.length, c.length);
                    try {
                        return decodeURIComponent(value);
                    } catch(e) {
                        return value;
                    }
                }
            }
            return null;
        },
        
        setItem: function(key, value, days = 7) {
            let expires = "";
            if (days) {
                const date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toUTCString();
            }
            
            try {
                const encodedValue = encodeURIComponent(value);
                document.cookie = key + "=" + encodedValue + expires + "; path=/; SameSite=Lax";
                return true;
            } catch(e) {
                console.error('Cookie storage error:', e);
                return false;
            }
        },
        
        removeItem: function(key) {
            document.cookie = key + "=; Max-Age=-99999999; path=/";
        }
    };
    
    // Memory storage implementation
    const memoryStorage = {
        getItem: function(key) { 
            return window._memoryStorage[key] || null; 
        },
        setItem: function(key, value) { 
            window._memoryStorage[key] = value; 
            return true;
        },
        removeItem: function(key) { 
            delete window._memoryStorage[key]; 
        },
        clear: function() { 
            window._memoryStorage = {}; 
        }
    };
    
    // The SafeStorage class with fallback mechanisms
    class SafeStorage {
        constructor() {
            this.availableStorages = [];
            
            // Add available storages in order of preference
            if (storageAvailability.localStorage) {
                this.availableStorages.push({
                    type: 'localStorage',
                    storage: localStorage
                });
            }
            
            if (storageAvailability.sessionStorage) {
                this.availableStorages.push({
                    type: 'sessionStorage',
                    storage: sessionStorage
                });
            }
            
            if (storageAvailability.cookies) {
                this.availableStorages.push({
                    type: 'cookies',
                    storage: cookieStorage
                });
            }
            
            // Always add memory storage as final fallback
            this.availableStorages.push({
                type: 'memory',
                storage: memoryStorage
            });
            
            console.log(`📦 SafeStorage initialized with ${this.availableStorages.length} storage mechanisms`);
            console.log(`📦 Primary storage: ${this.availableStorages[0]?.type || 'none'}`);
        }
        
        getItem(key) {
            // Try to get from primary storage first
            let value = null;
            let foundInStorage = null;
            
            for (const storage of this.availableStorages) {
                try {
                    const tempValue = storage.storage.getItem(key);
                    if (tempValue !== null && tempValue !== undefined) {
                        value = tempValue;
                        foundInStorage = storage.type;
                        break;
                    }
                } catch (e) {
                    console.warn(`Failed to read from ${storage.type}:`, e);
                }
            }
            
            // If we found a value, try to propagate it to better storages
            if (value !== null && foundInStorage !== this.availableStorages[0]?.type) {
                this.setItem(key, value);
            }
            
            return value;
        }
        
        setItem(key, value) {
            let success = false;
            
            // Try to set in all available storages, starting with the most persistent
            for (const storage of this.availableStorages) {
                try {
                    storage.storage.setItem(key, value);
                    success = true;
                } catch (e) {
                    console.warn(`Failed to write to ${storage.type}:`, e);
                }
            }
            
            return success;
        }
        
        removeItem(key) {
            // Remove from all storages
            for (const storage of this.availableStorages) {
                try {
                    storage.storage.removeItem(key);
                } catch (e) {
                    console.warn(`Failed to remove from ${storage.type}:`, e);
                }
            }
        }
        
        clear() {
            // Clear all storages
            for (const storage of this.availableStorages) {
                try {
                    if (typeof storage.storage.clear === 'function') {
                        storage.storage.clear();
                    } else if (storage.type === 'cookies') {
                        // Special handling for cookie storage
                        const cookies = document.cookie.split(";");
                        for (let i = 0; i < cookies.length; i++) {
                            const cookie = cookies[i];
                            const eqPos = cookie.indexOf("=");
                            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
                        }
                    }
                } catch (e) {
                    console.warn(`Failed to clear ${storage.type}:`, e);
                }
            }
        }
    }
    
    // Initialize and expose globally
    window.safeStorage = new SafeStorage();
    
    // Legacy compatibility - map old functions to new API
    if (!storageAvailability.localStorage) {
        // If localStorage is not available, provide a compatibility layer
        console.log('📦 Setting up localStorage compatibility layer');
        localStorage.getItem = function(key) { return window.safeStorage.getItem(key); };
        localStorage.setItem = function(key, value) { return window.safeStorage.setItem(key, value); };
        localStorage.removeItem = function(key) { window.safeStorage.removeItem(key); };
        localStorage.clear = function() { window.safeStorage.clear(); };
    }
    
    console.log('📦 SafeStorage ready for use');
})();
