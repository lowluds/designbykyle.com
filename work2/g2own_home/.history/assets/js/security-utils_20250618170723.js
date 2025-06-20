/*!
 * G2Own Security Utilities
 * Comprehensive security helpers for input validation, URL sanitization, and CSRF protection
 */

class SecurityUtils {
    constructor() {
        this.allowedHosts = ['g2own.com', 'www.g2own.com', 'localhost'];
        this.allowedProtocols = ['https:', 'http:'];
        this.csrfToken = null;
        this.init();
    }

    init() {
        this.loadCSRFToken();
        this.setupCSP();
        console.log('🛡️ Security utilities initialized');
    }

    // ============================================================================
    // URL VALIDATION & SANITIZATION
    // ============================================================================

    /**
     * Validates return URLs to prevent open redirect attacks
     * @param {string} url - URL to validate
     * @returns {boolean} - True if URL is safe
     */
    isValidReturnUrl(url) {
        if (!url || typeof url !== 'string') {
            return false;
        }

        try {
            // Remove any leading/trailing whitespace
            url = url.trim();

            // Check for dangerous protocols
            const dangerousProtocols = [
                'javascript:', 'data:', 'vbscript:', 'file:', 'ftp:',
                'jar:', 'about:', 'chrome:', 'resource:'
            ];

            for (const protocol of dangerousProtocols) {
                if (url.toLowerCase().startsWith(protocol)) {
                    console.warn('🚨 Blocked dangerous protocol:', protocol);
                    return false;
                }
            }

            // Parse URL
            const parsedUrl = new URL(url);

            // Validate protocol
            if (!this.allowedProtocols.includes(parsedUrl.protocol)) {
                console.warn('🚨 Invalid protocol:', parsedUrl.protocol);
                return false;
            }

            // Validate hostname
            if (!this.allowedHosts.includes(parsedUrl.hostname)) {
                console.warn('🚨 Invalid hostname:', parsedUrl.hostname);
                return false;
            }

            // Check for suspicious patterns
            const suspiciousPatterns = [
                /%0[ad]/i, // Null bytes
                /%2f/i,    // Path traversal
                /\.\./,    // Directory traversal
                /\/\//,    // Protocol relative URLs in path
                /@/        // User info in URL
            ];

            for (const pattern of suspiciousPatterns) {
                if (pattern.test(url)) {
                    console.warn('🚨 Suspicious pattern detected in URL');
                    return false;
                }
            }

            return true;

        } catch (error) {
            console.warn('🚨 URL validation error:', error);
            return false;
        }
    }

    /**
     * Safely encodes URL for use in redirects
     * @param {string} url - URL to encode
     * @returns {string} - Safely encoded URL
     */
    safeEncodeUrl(url) {
        if (!this.isValidReturnUrl(url)) {
            console.warn('🚨 Refusing to encode invalid URL');
            return 'https://g2own.com/'; // Safe fallback
        }
        return encodeURIComponent(url);
    }

    /**
     * Sanitizes URL for display or logging
     * @param {string} url - URL to sanitize
     * @returns {string} - Sanitized URL
     */
    sanitizeUrlForDisplay(url) {
        if (!url) return '';
        
        // Remove any HTML tags
        url = url.replace(/<[^>]*>/g, '');
        
        // Limit length
        if (url.length > 200) {
            url = url.substring(0, 200) + '...';
        }
        
        return url;
    }

    // ============================================================================
    // INPUT VALIDATION & SANITIZATION
    // ============================================================================

    /**
     * Sanitizes HTML to prevent XSS
     * @param {string} input - Input to sanitize
     * @returns {string} - Sanitized input
     */
    sanitizeHtml(input) {
        if (!input) return '';
        
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    /**
     * Validates email addresses
     * @param {string} email - Email to validate
     * @returns {boolean} - True if valid
     */
    isValidEmail(email) {
        if (!email || typeof email !== 'string') return false;
        
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailPattern.test(email) && email.length <= 254;
    }

    /**
     * Validates usernames
     * @param {string} username - Username to validate
     * @returns {boolean} - True if valid
     */
    isValidUsername(username) {
        if (!username || typeof username !== 'string') return false;
        
        // Allow letters, numbers, underscores, hyphens
        const usernamePattern = /^[a-zA-Z0-9_-]{3,30}$/;
        return usernamePattern.test(username);
    }

    /**
     * Validates and sanitizes user input
     * @param {string} input - Input to validate
     * @param {string} type - Type of input (email, username, text, etc.)
     * @returns {object} - {isValid: boolean, sanitized: string, errors: array}
     */
    validateInput(input, type = 'text') {
        const result = {
            isValid: false,
            sanitized: '',
            errors: []
        };

        if (!input) {
            result.errors.push('Input is required');
            return result;
        }

        // Sanitize first
        let sanitized = this.sanitizeHtml(input.trim());

        switch (type) {
            case 'email':
                result.isValid = this.isValidEmail(sanitized);
                if (!result.isValid) {
                    result.errors.push('Invalid email format');
                }
                break;

            case 'username':
                result.isValid = this.isValidUsername(sanitized);
                if (!result.isValid) {
                    result.errors.push('Username must be 3-30 characters, letters, numbers, underscore, or hyphen only');
                }
                break;

            case 'text':
                result.isValid = sanitized.length > 0 && sanitized.length <= 1000;
                if (!result.isValid) {
                    result.errors.push('Text must be 1-1000 characters');
                }
                break;

            case 'url':
                result.isValid = this.isValidReturnUrl(sanitized);
                if (!result.isValid) {
                    result.errors.push('Invalid URL');
                }
                break;

            default:
                result.isValid = true;
        }

        result.sanitized = sanitized;
        return result;
    }

    // ============================================================================
    // CSRF PROTECTION
    // ============================================================================

    /**
     * Loads CSRF token from session
     */
    async loadCSRFToken() {
        try {
            const response = await fetch('https://g2own.com/community/session-check.php', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.csrf_token) {
                    this.csrfToken = data.csrf_token;
                    console.log('🔐 CSRF token loaded');
                }
            }
        } catch (error) {
            console.warn('⚠️ Could not load CSRF token:', error);
        }
    }

    /**
     * Gets current CSRF token
     * @returns {string|null} - CSRF token
     */
    getCSRFToken() {
        return this.csrfToken;
    }

    /**
     * Adds CSRF protection to fetch requests
     * @param {string} url - Request URL
     * @param {object} options - Fetch options
     * @returns {object} - Enhanced fetch options
     */
    secureRequest(url, options = {}) {
        const secureOptions = {
            ...options,
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                ...options.headers
            }
        };

        // Add CSRF token if available
        if (this.csrfToken) {
            secureOptions.headers['X-CSRF-Token'] = this.csrfToken;
        }

        // Log security-enhanced request
        console.log('🔒 Secure request to:', this.sanitizeUrlForDisplay(url));

        return secureOptions;
    }

    // ============================================================================
    // CONTENT SECURITY POLICY
    // ============================================================================

    /**
     * Sets up client-side CSP monitoring
     */
    setupCSP() {
        // Monitor CSP violations
        document.addEventListener('securitypolicyviolation', (event) => {
            console.error('🚨 CSP Violation:', {
                directive: event.violatedDirective,
                source: event.sourceFile,
                line: event.lineNumber,
                blocked: event.blockedURI
            });

            // Report to analytics or monitoring service
            this.reportSecurityViolation('csp', {
                directive: event.violatedDirective,
                source: event.sourceFile,
                blocked: event.blockedURI
            });
        });
    }

    // ============================================================================
    // SECURITY MONITORING
    // ============================================================================

    /**
     * Reports security violations for monitoring
     * @param {string} type - Type of violation
     * @param {object} details - Violation details
     */
    reportSecurityViolation(type, details) {
        try {
            // Log locally
            console.warn(`🚨 Security violation (${type}):`, details);

            // Here you could send to your monitoring service
            // Example: send to analytics, log aggregation, etc.
            
        } catch (error) {
            console.error('Failed to report security violation:', error);
        }
    }

    /**
     * Validates form data before submission
     * @param {FormData} formData - Form data to validate
     * @param {object} rules - Validation rules
     * @returns {object} - Validation result
     */
    validateFormData(formData, rules = {}) {
        const result = {
            isValid: true,
            errors: {},
            sanitizedData: {}
        };

        for (const [field, value] of formData.entries()) {
            const rule = rules[field] || 'text';
            const validation = this.validateInput(value, rule);

            if (!validation.isValid) {
                result.isValid = false;
                result.errors[field] = validation.errors;
            }

            result.sanitizedData[field] = validation.sanitized;
        }

        return result;
    }

    // ============================================================================
    // RATE LIMITING
    // ============================================================================

    /**
     * Simple client-side rate limiting
     * @param {string} action - Action being rate limited
     * @param {number} maxAttempts - Max attempts per window
     * @param {number} windowMs - Time window in milliseconds
     * @returns {boolean} - True if action is allowed
     */
    checkRateLimit(action, maxAttempts = 5, windowMs = 60000) {
        const now = Date.now();
        const key = `rateLimit_${action}`;
        
        let attempts = JSON.parse(localStorage.getItem(key) || '[]');
        
        // Filter out old attempts
        attempts = attempts.filter(timestamp => now - timestamp < windowMs);
        
        if (attempts.length >= maxAttempts) {
            console.warn(`🚨 Rate limit exceeded for action: ${action}`);
            return false;
        }
        
        // Add current attempt
        attempts.push(now);
        localStorage.setItem(key, JSON.stringify(attempts));
        
        return true;
    }
}

// Global instance
window.securityUtils = new SecurityUtils();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityUtils;
}
