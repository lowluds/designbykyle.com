/* G2Own Analytics Configuration
 * Integrates Google Analytics 4 with Invision Community Analytics
 * Respects user privacy and GDPR compliance
 */

// GA4 Configuration
const GA4_CONFIG = {
    // Replace with your actual GA4 Measurement ID
    measurementId: 'G-XXXXXXXXXX', // TODO: Replace with real GA4 ID when ready for production
    
    // Enhanced E-commerce settings
    enhanced_ecommerce: true,
    
    // Privacy settings (GDPR compliant)
    anonymize_ip: true,
    allow_google_signals: false, // Set to true if you want Google Ads integration
    
    // Performance monitoring
    send_page_view: true,
    page_title: document.title,
    page_location: window.location.href,
    
    // Custom dimensions for G2Own specific tracking
    custom_dimensions: {
        user_type: 'custom_map.user_type',
        community_member: 'custom_map.community_member',
        homepage_section: 'custom_map.homepage_section'
    }
};

// Initialize Google Analytics 4
function initializeGA4() {
    // Only initialize if measurement ID is configured
    if (GA4_CONFIG.measurementId === 'G-XXXXXXXXXX') {
        console.log('GA4: Measurement ID not configured. Please update GA4_CONFIG.measurementId');
        return;
    }
    
    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_CONFIG.measurementId}`;
    document.head.appendChild(script);
    
    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    
    // Configure GA4 with privacy settings
    gtag('config', GA4_CONFIG.measurementId, {
        anonymize_ip: GA4_CONFIG.anonymize_ip,
        allow_google_signals: GA4_CONFIG.allow_google_signals,
        custom_map: {
            user_type: 'user_type',
            community_member: 'community_member', 
            homepage_section: 'homepage_section'
        }
    });
    
    // Make gtag globally available
    window.gtag = gtag;
    
    console.log('GA4: Initialized successfully');
}

// Enhanced E-commerce Tracking
const G2ownAnalytics = {
    
    // Track page views with custom data
    trackPageView: function(page_title = document.title, page_location = window.location.href) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: page_title,
                page_location: page_location,
                custom_map: {
                    homepage_section: this.getCurrentSection()
                }
            });
        }
    },
    
    // Track category card interactions
    trackCategoryClick: function(categoryName, categoryType = 'games') {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'select_content', {
                content_type: 'category',
                content_id: categoryName.toLowerCase().replace(/\s+/g, '_'),
                custom_map: {
                    homepage_section: 'categories'
                }
            });
        }
        
        // Also track as custom event
        this.trackEvent('category_click', {
            category_name: categoryName,
            category_type: categoryType,
            section: 'homepage_categories'
        });
    },
    
    // Track authentication events
    trackAuth: function(action, provider = 'unknown', success = true) {
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                method: provider,
                success: success,
                custom_map: {
                    user_type: success ? 'authenticated' : 'anonymous'
                }
            });
        }
        
        // Track as conversion if successful login
        if (success && action === 'login') {
            this.trackConversion('user_authentication', {
                method: provider
            });
        }
    },
    
    // Track store/community navigation
    trackNavigation: function(destination, source = 'homepage') {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'click', {
                link_url: destination,
                link_text: this.getLinkText(destination),
                outbound: this.isExternalLink(destination)
            });
        }
        
        // Track community transitions specifically
        if (destination.includes('g2own.com/community')) {
            this.trackEvent('community_visit', {
                source: source,
                destination_type: this.getCommunitySection(destination)
            });
        }
    },
    
    // Track search interactions
    trackSearch: function(searchTerm, resultsCount = null) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'search', {
                search_term: searchTerm,
                ...(resultsCount !== null && { results_count: resultsCount })
            });
        }
    },
    
    // Track cart/shopping events (for future e-commerce)
    trackEcommerce: function(action, items = [], transactionId = null, value = null) {
        if (typeof gtag !== 'undefined') {
            const eventData = {
                currency: 'USD',
                items: items
            };
            
            if (transactionId) eventData.transaction_id = transactionId;
            if (value) eventData.value = value;
            
            gtag('event', action, eventData);
        }
    },
    
    // Track conversions (goals)
    trackConversion: function(conversionName, data = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'conversion', {
                send_to: `${GA4_CONFIG.measurementId}/${conversionName}`,
                ...data
            });
        }
    },
    
    // Generic event tracking
    trackEvent: function(eventName, parameters = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, parameters);
        }
        
        // Log for debugging
        console.log(`Analytics Event: ${eventName}`, parameters);
    },
    
    // Helper functions
    getCurrentSection: function() {
        const scrollPos = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Determine which section user is viewing
        if (scrollPos < windowHeight * 0.5) return 'hero';
        if (scrollPos < windowHeight * 1.5) return 'categories';
        if (scrollPos < windowHeight * 2.5) return 'featured';
        return 'footer';
    },
    
    getLinkText: function(url) {
        const link = document.querySelector(`a[href="${url}"]`);
        return link ? link.textContent.trim() : 'Unknown';
    },
    
    isExternalLink: function(url) {
        return url.startsWith('http') && !url.includes(window.location.hostname);
    },
    
    getCommunitySection: function(url) {
        if (url.includes('/store')) return 'store';
        if (url.includes('/support')) return 'support';
        if (url.includes('/search')) return 'search';
        if (url.includes('/login')) return 'authentication';
        return 'general';
    },
    
    // Track Core Web Vitals for performance monitoring
    trackCoreWebVitals: function() {
        try {
            // Import web-vitals library if available, otherwise use native Performance API
            if (typeof window.webVitals !== 'undefined') {
                // Using web-vitals library (recommended)
                window.webVitals.getCLS(this.sendToAnalytics);
                window.webVitals.getFID(this.sendToAnalytics);
                window.webVitals.getFCP(this.sendToAnalytics);
                window.webVitals.getLCP(this.sendToAnalytics);
                window.webVitals.getTTFB(this.sendToAnalytics);
            } else {
                // Fallback to native Performance API
                this.trackPerformanceNatively();
            }
        } catch (error) {
            console.warn('Core Web Vitals tracking failed:', error);
        }
    },
    
    // Native performance tracking fallback
    trackPerformanceNatively: function() {
        // Track page load performance
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                // Track loading metrics
                const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart;
                
                // Send to analytics
                this.trackCustomEvent('page_performance', {
                    event_category: 'performance',
                    load_time: Math.round(loadTime),
                    dom_content_loaded: Math.round(domContentLoaded),
                    page_url: window.location.pathname
                });
            }
        });
        
        // Track largest contentful paint (LCP)
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    
                    if (lastEntry) {
                        this.trackCustomEvent('core_web_vitals', {
                            event_category: 'performance',
                            metric_name: 'LCP',
                            metric_value: Math.round(lastEntry.startTime),
                            rating: lastEntry.startTime <= 2500 ? 'good' : lastEntry.startTime <= 4000 ? 'needs_improvement' : 'poor'
                        });
                    }
                });
                
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (error) {
                console.warn('LCP tracking failed:', error);
            }
        }
    },
    
    // Send Core Web Vitals to analytics
    sendToAnalytics: function(metric) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'core_web_vitals', {
                event_category: 'performance',
                metric_name: metric.name,
                metric_value: Math.round(metric.value),
                metric_rating: metric.rating || 'unknown',
                page_url: window.location.pathname
            });
        }
    }
};

// Privacy-Compliant Analytics Initialization with Expiration
function initializeAnalytics() {
    console.log('🔧 Initializing G2Own Analytics...');
    
    // Check for user consent with expiration (1 year)
    const consentData = getConsentWithExpiration();
    
    if (consentData && consentData.granted === true) {
        console.log('✅ Valid analytics consent found - initializing GA4');
        initializeGA4();
        
        // Set up automatic tracking
        setupAutomaticTracking();
        
        console.log('G2Own Analytics: Initialized with valid user consent');
    } else if (consentData && consentData.granted === false) {
        console.log('❌ Analytics consent declined - no tracking will occur');
    } else {
        console.log('🍪 No valid consent found, showing banner');
        showConsentBanner();
    }
}

// Enhanced consent management with expiration
function getConsentWithExpiration() {
    try {
        const consentKey = 'g2own_analytics_consent';
        
        // First try localStorage
        let consentData = localStorage.getItem(consentKey);
        
        // If localStorage is empty, try cookie as backup
        if (!consentData) {
            const cookieMatch = document.cookie.match(new RegExp('(^| )' + consentKey + '=([^;]+)'));
            if (cookieMatch) {
                consentData = decodeURIComponent(cookieMatch[2]);
            }
        }
        
        if (!consentData) {
            console.log('🍪 No consent data found in localStorage or cookies');
            return null;
        }
        
        const parsed = JSON.parse(consentData);
        const now = new Date().getTime();
        const oneYear = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
        
        // Check if consent is still valid (within 1 year)
        if (parsed.timestamp && (now - parsed.timestamp) < oneYear) {
            console.log('🍪 Valid consent found:', parsed.granted ? 'GRANTED' : 'DECLINED');
            return parsed;
        } else {
            // Consent expired, remove it
            console.log('🍪 Consent expired, removing old data');
            localStorage.removeItem(consentKey);
            document.cookie = `${consentKey}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
            return null;
        }
    } catch (e) {
        console.error('🍪 Error reading consent data:', e);
        // Invalid data, remove it
        localStorage.removeItem('g2own_analytics_consent');
        document.cookie = 'g2own_analytics_consent=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
        return null;
    }
}

function setConsentWithExpiration(granted) {
    const consentKey = 'g2own_analytics_consent';
    const consentData = {
        granted: granted,
        timestamp: new Date().getTime(),
        version: '1.0' // For future updates
    };
    
    try {
        // Set localStorage
        localStorage.setItem(consentKey, JSON.stringify(consentData));
        console.log('🍪 Consent saved to localStorage:', granted ? 'GRANTED' : 'DECLINED');
        
        // Also set a backup cookie
        const expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1); // 1 year
        const cookieValue = encodeURIComponent(JSON.stringify(consentData));
        document.cookie = `${consentKey}=${cookieValue};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
        console.log('🍪 Backup cookie set until:', expires.toLocaleDateString());
        
        return true;
    } catch (e) {
        console.error('🍪 Failed to save consent:', e);
        return false;
    }
}

// Automatic Event Tracking Setup
function setupAutomaticTracking() {
    // Track category card clicks
    document.addEventListener('click', function(e) {
        const categoryCard = e.target.closest('.category-card, .game-category-card');
        if (categoryCard) {
            const categoryName = categoryCard.querySelector('h3, .category-title')?.textContent || 'Unknown';
            G2ownAnalytics.trackCategoryClick(categoryName);
        }
        
        // Track navigation clicks
        const link = e.target.closest('a');
        if (link && link.href) {
            G2ownAnalytics.trackNavigation(link.href, 'homepage_click');
        }
        
        // Track sidebar interactions
        const sidebarItem = e.target.closest('.floating-nav-item, .sidebar-item');
        if (sidebarItem) {
            const action = sidebarItem.dataset.action || 'sidebar_interaction';
            G2ownAnalytics.trackEvent('sidebar_click', {
                action: action,
                section: 'floating_sidebar'
            });
        }
    });
    
    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', function() {
        const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        
        if (scrollDepth > maxScrollDepth && scrollDepth % 25 === 0) {
            maxScrollDepth = scrollDepth;
            G2ownAnalytics.trackEvent('scroll_depth', {
                depth_percentage: scrollDepth
            });
        }
    });
    
    // Track time on page
    let startTime = Date.now();
    window.addEventListener('beforeunload', function() {
        const timeOnPage = Math.round((Date.now() - startTime) / 1000);
        G2ownAnalytics.trackEvent('time_on_page', {
            duration_seconds: timeOnPage
        });
    });
    
    // Track Core Web Vitals for performance monitoring
    G2ownAnalytics.trackCoreWebVitals();
}

// Enhanced Consent Banner (GDPR Compliance) with Expiration Info
function showConsentBanner() {
    if (document.getElementById('analytics-consent-banner')) return;
    
    const banner = document.createElement('div');
    banner.id = 'analytics-consent-banner';
    banner.innerHTML = `
        <div style="
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.95);
            color: white;
            padding: 1.25rem;
            border-radius: 12px;
            border: 1px solid rgba(139, 0, 0, 0.3);
            z-index: 10000;
            font-family: Inter, sans-serif;
            max-width: 450px;
            margin: 0 auto;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
        ">
            <h4 style="margin: 0 0 0.75rem 0; font-size: 1rem; text-align: center; color: #ff6b6b;">
                🍪 We value your privacy
            </h4>
            <p style="margin: 0 0 1rem 0; font-size: 0.9rem; text-align: center; line-height: 1.4;">
                We use analytics to improve your experience on G2Own. Your choice will be remembered for <strong>1 year</strong>.
            </p>
            <div style="display: flex; gap: 0.75rem; justify-content: center;">
                <button id="consent-accept-btn" style="
                    background: linear-gradient(45deg, #8b0000, #a50000);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    font-weight: 500;
                    transition: all 0.3s ease;
                ">
                    ✓ Accept
                </button>
                <button id="consent-decline-btn" style="
                    background: transparent;
                    color: white;
                    border: 1px solid rgba(255,255,255,0.4);
                    padding: 0.75rem 1.5rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    font-weight: 500;
                    transition: all 0.3s ease;
                ">
                    ✗ Decline
                </button>
            </div>
            <p style="margin: 0.75rem 0 0 0; font-size: 0.75rem; text-align: center; color: rgba(255,255,255,0.7);">
                You can change this preference anytime in your browser settings.
            </p>
        </div>
    `;
    document.body.appendChild(banner);
    
    // Attach event listeners using proper scope
    const acceptBtn = banner.querySelector('#consent-accept-btn');
    const declineBtn = banner.querySelector('#consent-decline-btn');
    
    if (acceptBtn) {
        acceptBtn.addEventListener('click', function() {
            acceptAnalytics();
        });
        
        // Add hover effects
        acceptBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        acceptBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }
    
    if (declineBtn) {
        declineBtn.addEventListener('click', function() {
            declineAnalytics();
        });
        
        // Add hover effects
        declineBtn.addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'rgba(255,255,255,0.1)';
        });
        declineBtn.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
        });
    }
    
    // Add fade-in animation
    setTimeout(() => {
        banner.style.opacity = '0';
        banner.style.transition = 'opacity 0.3s ease';
        banner.style.opacity = '1';
    }, 100);
}

// Enhanced Consent handling with expiration
function acceptAnalytics() {
    setConsentWithExpiration(true);
    const banner = document.getElementById('analytics-consent-banner');
    if (banner) {
        banner.remove();
    }
    
    // Initialize analytics immediately
    initializeGA4();
    setupAutomaticTracking();
    
    // Track the consent acceptance
    G2ownAnalytics.trackEvent('consent_given', {
        consent_type: 'analytics',
        timestamp: new Date().toISOString()
    });
    
    console.log('✅ Analytics consent granted for 1 year');
}

function declineAnalytics() {
    setConsentWithExpiration(false);
    const banner = document.getElementById('analytics-consent-banner');
    if (banner) {
        banner.remove();
    }
    console.log('❌ Analytics consent declined for 1 year');
}

// Make consent functions globally available
window.acceptAnalytics = acceptAnalytics;
window.declineAnalytics = declineAnalytics;

// Integration with Invision Community
const InvisionIntegration = {
    // Track community authentication events
    onCommunityLogin: function(userData = {}) {
        G2ownAnalytics.trackAuth('login', 'invision_community', true);
        G2ownAnalytics.trackEvent('community_login', {
            user_id: userData.id || 'unknown',
            source: 'homepage'
        });
    },
    
    // Track store visits from homepage
    onStoreVisit: function() {
        G2ownAnalytics.trackEvent('store_visit', {
            source: 'homepage',
            timestamp: Date.now()
        });
    },
    
    // Sync with Invision's analytics where possible
    syncWithInvision: function() {
        // This would integrate with Invision's analytics API
        // Implementation depends on Invision Community's analytics setup
        console.log('Invision Analytics: Syncing with community analytics');
    }
};

// Export for global use
window.G2ownAnalytics = G2ownAnalytics;
window.InvisionIntegration = InvisionIntegration;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAnalytics);
} else {
    initializeAnalytics();
}

// Debug mode (remove in production)
if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
    window.AnalyticsDebug = {
        GA4_CONFIG,
        G2ownAnalytics,
        InvisionIntegration
    };
    console.log('Analytics Debug Mode: Access via window.AnalyticsDebug');
}

// Debug and utility functions (can be removed in production)
function debugConsentStatus() {
    const consentData = getConsentWithExpiration();
    if (consentData) {
        const expiryDate = new Date(consentData.timestamp + (365 * 24 * 60 * 60 * 1000));
        console.log('🍪 Consent Status:', {
            granted: consentData.granted,
            setOn: new Date(consentData.timestamp).toLocaleString(),
            expiresOn: expiryDate.toLocaleString(),
            daysRemaining: Math.floor((expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
        });
    } else {
        console.log('🍪 No valid consent found');
    }
}

// Utility function to clear consent (for testing)
function clearAnalyticsConsent() {
    localStorage.removeItem('g2own_analytics_consent');
    document.cookie = 'g2own_analytics_consent=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    console.log('🗑️ Analytics consent cleared - banner will show on next page load');
}

// Make debug functions available globally for console access
window.debugConsentStatus = debugConsentStatus;
window.clearAnalyticsConsent = clearAnalyticsConsent;
