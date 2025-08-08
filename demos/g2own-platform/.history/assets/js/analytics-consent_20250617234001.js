/**
 * Analytics Consent Management System
 * Handles GDPR-compliant analytics consent with 1-year storage
 */

class AnalyticsConsent {
    constructor() {
        this.consentKey = 'g2own_analytics_consent';
        this.consentDuration = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
        this.init();
    }

    init() {
        // Check if consent is already given and still valid
        if (!this.hasValidConsent()) {
            this.showConsentBanner();
        } else {
            // Initialize analytics if consent was previously given
            this.initializeAnalytics();
        }
    }

    hasValidConsent() {
        // Check localStorage first
        const localConsent = localStorage.getItem(this.consentKey);
        if (localConsent) {
            const consentData = JSON.parse(localConsent);
            const now = new Date().getTime();
            if (consentData.timestamp && (now - consentData.timestamp) < this.consentDuration) {
                return consentData.granted;
            }
        }

        // Fallback to cookie check
        const cookieConsent = this.getCookie(this.consentKey);
        if (cookieConsent) {
            try {
                const consentData = JSON.parse(cookieConsent);
                const now = new Date().getTime();
                if (consentData.timestamp && (now - consentData.timestamp) < this.consentDuration) {
                    // Update localStorage with cookie data
                    localStorage.setItem(this.consentKey, cookieConsent);
                    return consentData.granted;
                }
            } catch (e) {
                // Invalid cookie data, remove it
                this.deleteCookie(this.consentKey);
            }
        }

        return false;
    }

    showConsentBanner() {
        // Create and show the consent banner
        const banner = document.createElement('div');
        banner.id = 'analytics-consent-banner';
        banner.className = 'analytics-consent-banner';
        banner.innerHTML = `
            <div class="consent-content">
                <div class="consent-text">
                    <h4>We value your privacy</h4>
                    <p>We use analytics to improve your experience on our site. Your data helps us understand how to make G2Own better for everyone.</p>
                </div>
                <div class="consent-actions">
                    <button id="consent-accept" class="btn-accept">Accept Analytics</button>
                    <button id="consent-decline" class="btn-decline">Decline</button>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        // Add event listeners
        document.getElementById('consent-accept').addEventListener('click', () => {
            this.grantConsent(true);
            this.hideBanner();
            this.initializeAnalytics();
        });

        document.getElementById('consent-decline').addEventListener('click', () => {
            this.grantConsent(false);
            this.hideBanner();
        });

        // Show banner with animation
        setTimeout(() => {
            banner.classList.add('show');
        }, 100);
    }

    hideBanner() {
        const banner = document.getElementById('analytics-consent-banner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => {
                banner.remove();
            }, 300);
        }
    }

    grantConsent(granted) {
        const consentData = {
            granted: granted,
            timestamp: new Date().getTime()
        };
        
        const consentString = JSON.stringify(consentData);
        
        // Store in localStorage
        localStorage.setItem(this.consentKey, consentString);
        
        // Store in cookie as backup
        this.setCookie(this.consentKey, consentString, 365);
        
        // Update gtag consent
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': granted ? 'granted' : 'denied'
            });
        }
    }

    initializeAnalytics() {
        // Initialize Google Analytics if consent is granted
        if (this.hasValidConsent()) {
            // Update gtag consent
            if (typeof gtag !== 'undefined') {
                gtag('consent', 'update', {
                    'analytics_storage': 'granted'
                });
            }
            
            // Trigger custom event for analytics initialization
            if (typeof window.initializeGA4 === 'function') {
                window.initializeGA4();
            }
        }
    }

    // Utility functions for cookie management
    setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    }

    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    }

    // Public method to check consent status
    static hasConsent() {
        const instance = new AnalyticsConsent();
        return instance.hasValidConsent();
    }

    // Public method to revoke consent (for privacy settings)
    static revokeConsent() {
        const instance = new AnalyticsConsent();
        instance.grantConsent(false);
        localStorage.removeItem(instance.consentKey);
        instance.deleteCookie(instance.consentKey);
        
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'denied'
            });
        }
    }
}

// Initialize consent management when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new AnalyticsConsent();
    });
} else {
    new AnalyticsConsent();
}

// Export for global access
window.AnalyticsConsent = AnalyticsConsent;
