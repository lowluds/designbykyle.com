/*!
 * Production Environment Logger
 * Replaces console.log in production with safe logging
 */

// Detect production environment
const isProduction = () => {
    return !window.location.hostname.includes('localhost') && 
           !window.location.hostname.includes('127.0.0.1') &&
           !window.location.search.includes('debug=true');
};

// Production-safe console
const productionConsole = {
    log: isProduction() ? () => {} : console.log.bind(console),
    error: console.error.bind(console), // Always show errors
    warn: console.warn.bind(console),   // Always show warnings
    info: isProduction() ? () => {} : console.info.bind(console)
};

// Replace global console in production
if (isProduction()) {
    window.console.log = productionConsole.log;
    window.console.info = productionConsole.info;
}

// Make available globally
window.logger = productionConsole;
window.isProduction = isProduction;
