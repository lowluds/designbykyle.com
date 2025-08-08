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
    }
};

// Privacy-Compliant Analytics Initialization
function initializeAnalytics() {
    // Check for user consent (basic implementation)
    const hasConsent = localStorage.getItem('analytics_consent') === 'true';
    
    if (hasConsent) {
        initializeGA4();
        
        // Set up automatic tracking
        setupAutomaticTracking();
        
        console.log('G2Own Analytics: Initialized with user consent');
    } else {
        console.log('G2Own Analytics: Waiting for user consent');
        showConsentBanner();
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
}

// Simple Consent Banner (GDPR Compliance)
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
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 1rem;
            border-radius: 8px;
            border: 1px solid rgba(139, 0, 0, 0.3);
            z-index: 10000;
            font-family: Inter, sans-serif;
            max-width: 400px;
            margin: 0 auto;
        ">            <p style="margin: 0 0 1rem 0; font-size: 0.9rem; text-align: center;">
                We use analytics to improve your experience. 
            </p><div style="display: flex; gap: 0.5rem; justify-content: center;">
                <button onclick="acceptAnalytics()" style="
                    background: #8b0000;
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.85rem;
                ">Accept</button>
                <button onclick="declineAnalytics()" style="
                    background: transparent;
                    color: white;
                    border: 1px solid rgba(255,255,255,0.3);
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.85rem;
                ">Decline</button>
            </div>
        </div>
    `;
    document.body.appendChild(banner);
}

// Consent handling
function acceptAnalytics() {
    localStorage.setItem('analytics_consent', 'true');
    document.getElementById('analytics-consent-banner')?.remove();
    initializeGA4();
    setupAutomaticTracking();
    
    // Track the consent acceptance
    G2ownAnalytics.trackEvent('consent_given', {
        consent_type: 'analytics'
    });
}

function declineAnalytics() {
    localStorage.setItem('analytics_consent', 'false');
    document.getElementById('analytics-consent-banner')?.remove();
    console.log('G2Own Analytics: User declined analytics tracking');
}

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
