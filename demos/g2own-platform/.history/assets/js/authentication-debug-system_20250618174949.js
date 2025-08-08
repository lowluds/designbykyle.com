/*!
 * G2Own Authentication Debug System
 * Comprehensive debugging and monitoring for authentication flow
 */

class AuthenticationDebugSystem {
    constructor() {
        this.config = {
            debugMode: localStorage.getItem('g2own_debug_mode') === 'true',
            logLevel: localStorage.getItem('g2own_log_level') || 'info', // error, warn, info, debug
            maxLogs: 1000,
            persistLogs: true
        };
        
        this.logs = [];
        this.metrics = {
            authAttempts: 0,
            authSuccesses: 0,
            authFailures: 0,
            sessionSyncs: 0,
            uiUpdates: 0
        };
        
        this.state = {
            currentAuthState: null,
            lastAuthCheck: 0,
            authTimeline: []
        };
        
        this.init();
    }

    init() {
        console.log('🔧 Initializing Authentication Debug System...');
        
        if (this.config.debugMode) {
            this.setupDebugUI();
        }
        
        this.setupEventListeners();
        this.loadPersistedLogs();
        this.startMonitoring();
    }

    setupDebugUI() {
        // Create debug panel
        const debugPanel = document.createElement('div');
        debugPanel.id = 'g2own-auth-debug';
        debugPanel.innerHTML = `
            <div id="debug-header">
                <h3>🔧 G2Own Auth Debug</h3>
                <div id="debug-controls">
                    <button onclick="window.authDebug.togglePanel()">Toggle</button>
                    <button onclick="window.authDebug.clearLogs()">Clear</button>
                    <button onclick="window.authDebug.exportDiagnostic()">Export</button>
                    <button onclick="window.authDebug.forceAuthCheck()">Force Check</button>
                </div>
            </div>
            <div id="debug-content">
                <div id="debug-status"></div>
                <div id="debug-metrics"></div>
                <div id="debug-logs"></div>
            </div>
        `;
        
        // Add styles
        debugPanel.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            width: 400px;
            max-height: 600px;
            background: rgba(0, 0, 0, 0.9);
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            border: 1px solid #333;
            border-radius: 5px;
            z-index: 999999;
            overflow: hidden;
        `;
        
        document.body.appendChild(debugPanel);
        this.updateDebugPanel();
        
        // Add global access
        window.authDebug = this;
    }

    setupEventListeners() {
        // Monitor all authentication events
        const authEvents = [
            'g2own:oauth-success',
            'g2own:fresh-login',
            'g2own:logout',
            'g2own:auth-update',
            'g2own:auth-login',
            'g2own:auth-logout',
            'g2own:session-synced',
            'g2own:session-found'
        ];

        authEvents.forEach(eventName => {
            window.addEventListener(eventName, (event) => {
                this.logEvent(eventName, event.detail);
                this.updateMetrics(eventName);
                this.addToTimeline(eventName, event.detail);
            });
        });

        // Monitor storage changes
        window.addEventListener('storage', (event) => {
            if (event.key?.startsWith('g2own_')) {
                this.logEvent('storage-change', {
                    key: event.key,
                    oldValue: event.oldValue,
                    newValue: event.newValue
                });
            }
        });

        // Monitor network requests to auth endpoints
        this.interceptFetch();
    }

    interceptFetch() {
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const url = args[0];
            const options = args[1] || {};
            
            // Check if this is an auth-related request
            if (typeof url === 'string' && this.isAuthUrl(url)) {
                this.logEvent('fetch-request', { url, method: options.method || 'GET' });
                
                try {
                    const response = await originalFetch(...args);
                    this.logEvent('fetch-response', {
                        url,
                        status: response.status,
                        ok: response.ok
                    });
                    return response;
                } catch (error) {
                    this.logEvent('fetch-error', { url, error: error.message });
                    throw error;
                }
            }
            
            return originalFetch(...args);
        };
    }

    isAuthUrl(url) {
        const authPaths = [
            '/community/session-check.php',
            '/oauth/',
            '/api/core/me',
            '/api/nexus/'
        ];
        
        return authPaths.some(path => url.includes(path));
    }

    logEvent(type, data = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            type,
            data: this.sanitizeData(data),
            level: this.getLogLevel(type)
        };
        
        this.logs.push(logEntry);
        
        // Limit log size
        if (this.logs.length > this.config.maxLogs) {
            this.logs = this.logs.slice(-this.config.maxLogs);
        }
        
        // Console output
        if (this.shouldLog(logEntry.level)) {
            const symbol = this.getLogSymbol(type);
            console.log(`${symbol} [G2Own Auth] ${type}:`, data);
        }
        
        // Update debug panel
        if (this.config.debugMode) {
            this.updateDebugPanel();
        }
        
        // Persist logs
        if (this.config.persistLogs) {
            this.persistLogs();
        }
    }

    sanitizeData(data) {
        // Remove sensitive information from logs
        const sanitized = { ...data };
        const sensitiveKeys = ['token', 'password', 'secret', 'key'];
        
        for (const key in sanitized) {
            if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
                sanitized[key] = '[REDACTED]';
            }
        }
        
        return sanitized;
    }

    getLogLevel(type) {
        const levels = {
            'error': 'error',
            'failed': 'error',
            'oauth-success': 'info',
            'fresh-login': 'info',
            'logout': 'info',
            'auth-update': 'debug',
            'session-synced': 'debug',
            'fetch-request': 'debug',
            'fetch-response': 'debug',
            'storage-change': 'debug'
        };
        
        return levels[type] || 'info';
    }

    getLogSymbol(type) {
        const symbols = {
            'oauth-success': '🎉',
            'fresh-login': '🔄',
            'logout': '👋',
            'auth-update': '📡',
            'session-synced': '🔗',
            'fetch-request': '📤',
            'fetch-response': '📥',
            'storage-change': '💾',
            'error': '❌',
            'warning': '⚠️'
        };
        
        return symbols[type] || 'ℹ️';
    }

    shouldLog(level) {
        const levels = { error: 0, warn: 1, info: 2, debug: 3 };
        return levels[level] <= levels[this.config.logLevel];
    }

    updateMetrics(eventName) {
        switch (eventName) {
            case 'g2own:oauth-success':
            case 'g2own:fresh-login':
                this.metrics.authSuccesses++;
                break;
            case 'g2own:auth-error':
                this.metrics.authFailures++;
                break;
            case 'g2own:session-synced':
                this.metrics.sessionSyncs++;
                break;
            case 'g2own:auth-update':
                this.metrics.uiUpdates++;
                break;
        }
    }

    addToTimeline(eventName, data) {
        this.state.authTimeline.push({
            timestamp: Date.now(),
            event: eventName,
            data: this.sanitizeData(data)
        });
        
        // Keep last 50 timeline events
        if (this.state.authTimeline.length > 50) {
            this.state.authTimeline = this.state.authTimeline.slice(-50);
        }
    }

    updateDebugPanel() {
        const panel = document.getElementById('g2own-auth-debug');
        if (!panel) return;
        
        const statusDiv = document.getElementById('debug-status');
        const metricsDiv = document.getElementById('debug-metrics');
        const logsDiv = document.getElementById('debug-logs');
        
        // Update status
        const authState = this.getCurrentAuthState();
        statusDiv.innerHTML = `
            <strong>Auth Status:</strong> ${authState.isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}<br>
            <strong>User:</strong> ${authState.user?.name || 'None'}<br>
            <strong>Token:</strong> ${authState.hasToken ? '✅ Present' : '❌ Missing'}<br>
            <strong>Session:</strong> ${authState.hasSession ? '✅ Active' : '❌ Inactive'}
        `;
        
        // Update metrics
        metricsDiv.innerHTML = `
            <strong>Metrics:</strong><br>
            Auth Successes: ${this.metrics.authSuccesses}<br>
            Auth Failures: ${this.metrics.authFailures}<br>
            Session Syncs: ${this.metrics.sessionSyncs}<br>
            UI Updates: ${this.metrics.uiUpdates}
        `;
        
        // Update logs (last 10)
        const recentLogs = this.logs.slice(-10);
        logsDiv.innerHTML = '<strong>Recent Logs:</strong><br>' + 
            recentLogs.map(log => 
                `<div style="margin: 2px 0; color: ${this.getLogColor(log.level)}">
                    ${log.timestamp.split('T')[1].split('.')[0]} ${this.getLogSymbol(log.type)} ${log.type}
                </div>`
            ).join('');
    }

    getLogColor(level) {
        const colors = {
            error: '#ff4444',
            warn: '#ffaa00',
            info: '#00ff00',
            debug: '#888888'
        };
        return colors[level] || '#00ff00';
    }

    getCurrentAuthState() {
        const token = localStorage.getItem('g2own_oauth_token');
        const userData = localStorage.getItem('g2own_user_data');
        const hasSession = window.enhancedSessionSynchronizer?.isSessionActive() || false;
        
        let user = null;
        try {
            user = userData ? JSON.parse(userData) : null;
        } catch (e) {
            // Ignore parse errors
        }
        
        return {
            isAuthenticated: !!token && !!user,
            hasToken: !!token,
            hasSession,
            user
        };
    }

    // Public methods for debug panel
    togglePanel() {
        const panel = document.getElementById('g2own-auth-debug');
        if (!panel) return;
        
        const content = document.getElementById('debug-content');
        const isVisible = content.style.display !== 'none';
        content.style.display = isVisible ? 'none' : 'block';
    }

    clearLogs() {
        this.logs = [];
        this.state.authTimeline = [];
        this.updateDebugPanel();
        localStorage.removeItem('g2own_debug_logs');
    }

    exportDiagnostic() {
        const diagnostic = {
            timestamp: new Date().toISOString(),
            authState: this.getCurrentAuthState(),
            metrics: this.metrics,
            timeline: this.state.authTimeline,
            logs: this.logs,
            localStorage: this.getLocalStorageData(),
            sessionStorage: this.getSessionStorageData(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        const blob = new Blob([JSON.stringify(diagnostic, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `g2own-auth-diagnostic-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    forceAuthCheck() {
        this.logEvent('debug-force-check', { source: 'manual' });
        
        // Force all auth systems to check
        if (window.enhancedLoginStateDetector) {
            window.enhancedLoginStateDetector.forceStateCheck();
        }
        
        if (window.enhancedSessionSynchronizer) {
            window.enhancedSessionSynchronizer.forceSync();
        }
        
        if (window.sessionBridge) {
            window.sessionBridge.checkSession?.();
        }
    }

    getLocalStorageData() {
        const g2ownData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('g2own_')) {
                g2ownData[key] = localStorage.getItem(key);
            }
        }
        return g2ownData;
    }

    getSessionStorageData() {
        const g2ownData = {};
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key.startsWith('g2own_')) {
                g2ownData[key] = sessionStorage.getItem(key);
            }
        }
        return g2ownData;
    }

    persistLogs() {
        try {
            const logsToStore = this.logs.slice(-100); // Store last 100 logs
            localStorage.setItem('g2own_debug_logs', JSON.stringify(logsToStore));
        } catch (e) {
            // Storage might be full, ignore
        }
    }

    loadPersistedLogs() {
        try {
            const stored = localStorage.getItem('g2own_debug_logs');
            if (stored) {
                const logs = JSON.parse(stored);
                this.logs = Array.isArray(logs) ? logs : [];
            }
        } catch (e) {
            this.logs = [];
        }
    }

    startMonitoring() {
        // Monitor component availability
        setInterval(() => {
            this.checkComponentHealth();
        }, 10000);
    }

    checkComponentHealth() {
        const components = {
            sessionBridge: !!window.sessionBridge,
            topNavAuth: !!window.topNavAuth,
            leftSidebarController: !!window.leftSidebarController,
            g2ownOAuth: !!window.g2ownOAuth,
            enhancedLoginStateDetector: !!window.enhancedLoginStateDetector,
            enhancedSessionSynchronizer: !!window.enhancedSessionSynchronizer
        };
        
        const missing = Object.entries(components)
            .filter(([name, available]) => !available)
            .map(([name]) => name);
        
        if (missing.length > 0) {
            this.logEvent('component-health', { missing });
        }
    }

    // Public API
    enableDebugMode() {
        this.config.debugMode = true;
        localStorage.setItem('g2own_debug_mode', 'true');
        this.setupDebugUI();
    }

    disableDebugMode() {
        this.config.debugMode = false;
        localStorage.setItem('g2own_debug_mode', 'false');
        const panel = document.getElementById('g2own-auth-debug');
        if (panel) {
            panel.remove();
        }
    }

    setLogLevel(level) {
        this.config.logLevel = level;
        localStorage.setItem('g2own_log_level', level);
    }
}

// Initialize the debug system
window.authenticationDebugSystem = new AuthenticationDebugSystem();

// Add debug console commands
if (typeof window !== 'undefined') {
    window.g2ownDebug = {
        enable: () => window.authenticationDebugSystem.enableDebugMode(),
        disable: () => window.authenticationDebugSystem.disableDebugMode(),
        logs: () => window.authenticationDebugSystem.logs,
        export: () => window.authenticationDebugSystem.exportDiagnostic(),
        status: () => window.authenticationDebugSystem.getCurrentAuthState(),
        forceCheck: () => window.authenticationDebugSystem.forceAuthCheck()
    };
    
    console.log('🔧 G2Own Debug System loaded. Use g2ownDebug.enable() to start debugging.');
}
