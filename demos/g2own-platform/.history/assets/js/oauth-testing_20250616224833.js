/**
 * OAuth Testing Panel
 * Provides a testing interface for OAuth functionality
 */

class OAuthTesting {
    constructor(oauthManager) {
        this.manager = oauthManager;
        this.config = OAuthConfig;
        this.isVisible = false;
        
        this.init();
    }
    
    /**
     * Initialize testing panel
     */
    init() {
        this.config.log('info', 'Initializing OAuth Testing panel');
        
        this.createTestPanel();
        this.setupEventListeners();
        this.updateDisplay();
        
        // Auto-show if test mode is enabled
        if (this.config.debug.testMode) {
            this.show();
        }
    }
    
    /**
     * Create the testing panel HTML
     */
    createTestPanel() {
        // Remove existing panel if it exists
        const existingPanel = document.getElementById('oauth-test-panel');
        if (existingPanel) {
            existingPanel.remove();
        }
        
        // Create panel container
        const panel = document.createElement('div');
        panel.id = 'oauth-test-panel';
        panel.className = 'oauth-test-panel';
        panel.innerHTML = this.getTestPanelHTML();
        
        // Add to body
        document.body.appendChild(panel);
        
        // Add styles
        this.addTestPanelStyles();
    }
    
    /**
     * Get test panel HTML
     */
    getTestPanelHTML() {
        return `
            <div class="test-panel-header">
                <h3>OAuth Testing Panel</h3>
                <button class="test-panel-toggle" id="test-panel-toggle">_</button>
                <button class="test-panel-close" id="test-panel-close">×</button>
            </div>
            <div class="test-panel-content" id="test-panel-content">
                <div class="test-section">
                    <h4>Authentication Status</h4>
                    <div class="status-display">
                        <div class="status-item">
                            <label>Authenticated:</label>
                            <span id="auth-status">Checking...</span>
                        </div>
                        <div class="status-item">
                            <label>User:</label>
                            <span id="user-status">N/A</span>
                        </div>
                        <div class="status-item">
                            <label>Token:</label>
                            <span id="token-status">N/A</span>
                        </div>
                    </div>
                </div>
                
                <div class="test-section">
                    <h4>Authentication Actions</h4>
                    <div class="test-actions">
                        <button id="test-login" class="test-btn">Test Login</button>
                        <button id="test-logout" class="test-btn">Test Logout</button>
                        <button id="test-refresh" class="test-btn">Refresh Status</button>
                    </div>
                </div>
                
                <div class="test-section">
                    <h4>Cart Testing</h4>
                    <div class="test-actions">
                        <div class="test-input-group">
                            <input type="text" id="test-product-id" placeholder="Product ID" value="1">
                            <input type="number" id="test-quantity" placeholder="Quantity" value="1" min="1">
                            <button id="test-add-cart" class="test-btn">Add to Cart</button>
                        </div>
                        <button id="test-load-cart" class="test-btn">Load Cart</button>
                        <button id="test-clear-cart" class="test-btn">Clear Cart</button>
                    </div>
                    <div class="cart-display">
                        <label>Cart Items:</label>
                        <div id="cart-items-display">Loading...</div>
                    </div>
                </div>
                  <div class="test-section">
                    <h4>Commerce API Testing</h4>
                    <div class="test-actions">
                        <button id="test-user-purchases" class="test-btn">Test Purchases</button>
                        <button id="test-user-invoices" class="test-btn">Test Invoices</button>
                        <button id="test-user-transactions" class="test-btn">Test Transactions</button>
                        <button id="test-license-keys" class="test-btn">Test License Keys</button>
                        <button id="test-all-commerce" class="test-btn" style="background: #9900cc;">Test All Commerce</button>
                    </div>
                    <div class="commerce-display">
                        <label>Commerce Data:</label>
                        <div id="commerce-data-display">No data loaded</div>
                    </div>
                </div>
                
                <div class="test-section">
                    <h4>Product Testing</h4>
                    <div class="test-actions">
                        <button id="test-load-products" class="test-btn">Load Products</button>
                        <button id="test-load-user-data" class="test-btn">Load User Data</button>
                        <div class="test-input-group">
                            <input type="text" id="test-favorite-id" placeholder="Product ID" value="1">
                            <button id="test-toggle-favorite" class="test-btn">Toggle Favorite</button>
                        </div>
                    </div>
                </div>
                
                <div class="test-section">
                    <h4>API Testing</h4>
                    <div class="test-actions">
                        <div class="test-input-group">
                            <input type="text" id="test-api-url" placeholder="API URL" 
                                   value="${this.config.community.baseUrl}/api/core/me">
                            <select id="test-api-method">
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="DELETE">DELETE</option>
                            </select>
                            <button id="test-api-call" class="test-btn">Test API</button>
                        </div>
                        <textarea id="test-api-body" placeholder="Request body (JSON)"></textarea>
                    </div>
                    <div class="api-response">
                        <label>Response:</label>
                        <pre id="api-response-display">No response yet</pre>
                    </div>
                </div>
                
                <div class="test-section">
                    <h4>Session Management</h4>
                    <div class="test-actions">
                        <button id="test-clear-session" class="test-btn danger">Clear Session</button>
                        <button id="test-export-session" class="test-btn">Export Session</button>
                        <button id="test-import-session" class="test-btn">Import Session</button>
                    </div>
                    <textarea id="session-data" placeholder="Session data (JSON)"></textarea>
                </div>
                
                <div class="test-section">
                    <h4>Debug Console</h4>
                    <div class="debug-console" id="debug-console">
                        <div class="console-output" id="console-output"></div>
                        <div class="console-input">
                            <input type="text" id="console-command" placeholder="Enter command...">
                            <button id="console-execute" class="test-btn">Execute</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Add CSS styles for test panel
     */
    addTestPanelStyles() {
        const styles = `
            .oauth-test-panel {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 400px;
                max-height: 80vh;
                background: #1a1a1a;
                border: 1px solid #333;
                border-radius: 8px;
                color: #fff;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                z-index: 10000;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                overflow: hidden;
                resize: both;
            }
            
            .oauth-test-panel.minimized .test-panel-content {
                display: none;
            }
            
            .test-panel-header {
                background: #333;
                padding: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: move;
            }
            
            .test-panel-header h3 {
                margin: 0;
                font-size: 14px;
                color: #00ff88;
            }
            
            .test-panel-toggle,
            .test-panel-close {
                background: none;
                border: none;
                color: #fff;
                cursor: pointer;
                font-size: 16px;
                padding: 5px;
                margin-left: 5px;
            }
            
            .test-panel-toggle:hover,
            .test-panel-close:hover {
                background: #555;
            }
            
            .test-panel-content {
                max-height: 60vh;
                overflow-y: auto;
                padding: 15px;
            }
            
            .test-section {
                margin-bottom: 20px;
                border-bottom: 1px solid #333;
                padding-bottom: 15px;
            }
            
            .test-section:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }
            
            .test-section h4 {
                margin: 0 0 10px 0;
                color: #00aaff;
                font-size: 13px;
            }
            
            .status-display,
            .test-actions {
                margin-top: 10px;
            }
            
            .status-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
            }
            
            .status-item label {
                color: #ccc;
            }
            
            .status-item span {
                color: #fff;
                font-weight: bold;
            }
            
            .test-btn {
                background: #0066cc;
                border: none;
                color: white;
                padding: 5px 10px;
                margin: 2px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 11px;
            }
            
            .test-btn:hover {
                background: #0088ff;
            }
            
            .test-btn.danger {
                background: #cc3333;
            }
            
            .test-btn.danger:hover {
                background: #ff4444;
            }
            
            .test-input-group {
                display: flex;
                gap: 5px;
                margin-bottom: 5px;
                flex-wrap: wrap;
            }
            
            .test-input-group input,
            .test-input-group select {
                background: #333;
                border: 1px solid #555;
                color: #fff;
                padding: 5px;
                border-radius: 3px;
                font-size: 11px;
                flex: 1;
                min-width: 80px;
            }
            
            textarea {
                width: 100%;
                background: #333;
                border: 1px solid #555;
                color: #fff;
                padding: 8px;
                border-radius: 3px;
                font-size: 11px;
                font-family: 'Courier New', monospace;
                resize: vertical;
                min-height: 60px;
                margin-top: 5px;
            }
            
            .cart-display,
            .api-response {
                margin-top: 10px;
            }
            
            .cart-display label,
            .api-response label {
                display: block;
                color: #ccc;
                margin-bottom: 5px;
            }
            
            #cart-items-display,
            #api-response-display {
                background: #222;
                border: 1px solid #444;
                padding: 8px;
                border-radius: 3px;
                max-height: 100px;
                overflow-y: auto;
                font-size: 10px;
                white-space: pre-wrap;
            }
            
            .debug-console {
                background: #111;
                border: 1px solid #333;
                border-radius: 3px;
                padding: 5px;
            }
            
            .console-output {
                height: 100px;
                overflow-y: auto;
                font-size: 10px;
                padding: 5px;
                margin-bottom: 5px;
                border-bottom: 1px solid #333;
            }
            
            .console-input {
                display: flex;
                gap: 5px;
            }
            
            .console-input input {
                flex: 1;
                background: #222;
                border: 1px solid #444;
                color: #fff;
                padding: 5px;
                border-radius: 3px;
                font-size: 11px;
            }
            
            .console-log {
                color: #ccc;
                margin-bottom: 2px;
            }
            
            .console-error {
                color: #ff6666;
                margin-bottom: 2px;
            }
            
            .console-success {
                color: #66ff66;
                margin-bottom: 2px;
            }
        `;
        
        // Add styles to head
        const styleElement = document.createElement('style');
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
    }
    
    /**
     * Set up event listeners for test panel
     */
    setupEventListeners() {
        const panel = document.getElementById('oauth-test-panel');
        if (!panel) return;
        
        // Panel controls
        document.getElementById('test-panel-toggle').addEventListener('click', () => {
            this.toggleMinimize();
        });
        
        document.getElementById('test-panel-close').addEventListener('click', () => {
            this.hide();
        });
        
        // Authentication actions
        document.getElementById('test-login').addEventListener('click', () => {
            this.testLogin();
        });
        
        document.getElementById('test-logout').addEventListener('click', () => {
            this.testLogout();
        });
        
        document.getElementById('test-refresh').addEventListener('click', () => {
            this.refreshStatus();
        });
        
        // Cart actions
        document.getElementById('test-add-cart').addEventListener('click', () => {
            this.testAddToCart();
        });
        
        document.getElementById('test-load-cart').addEventListener('click', () => {
            this.testLoadCart();
        });
        
        document.getElementById('test-clear-cart').addEventListener('click', () => {
            this.testClearCart();
        });
          // Product actions
        document.getElementById('test-load-products').addEventListener('click', () => {
            this.testLoadProducts();
        });
        
        document.getElementById('test-load-user-data').addEventListener('click', () => {
            this.testLoadUserData();
        });
        
        document.getElementById('test-toggle-favorite').addEventListener('click', () => {
            this.testToggleFavorite();
        });
        
        // Commerce API actions
        document.getElementById('test-user-purchases').addEventListener('click', () => {
            this.testUserPurchases();
        });
        
        document.getElementById('test-user-invoices').addEventListener('click', () => {
            this.testUserInvoices();
        });
        
        document.getElementById('test-user-transactions').addEventListener('click', () => {
            this.testUserTransactions();
        });
        
        document.getElementById('test-license-keys').addEventListener('click', () => {
            this.testLicenseKeys();
        });
        
        document.getElementById('test-all-commerce').addEventListener('click', () => {
            this.testAllCommerce();
        });
        
        // API testing
        document.getElementById('test-api-call').addEventListener('click', () => {
            this.testAPICall();
        });
        
        // Session management
        document.getElementById('test-clear-session').addEventListener('click', () => {
            this.testClearSession();
        });
        
        document.getElementById('test-export-session').addEventListener('click', () => {
            this.testExportSession();
        });
        
        document.getElementById('test-import-session').addEventListener('click', () => {
            this.testImportSession();
        });
        
        // Console
        document.getElementById('console-execute').addEventListener('click', () => {
            this.executeConsoleCommand();
        });
        
        document.getElementById('console-command').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.executeConsoleCommand();
            }
        });
        
        // Make panel draggable
        this.makePanelDraggable();
        
        // Listen for OAuth events
        window.addEventListener('oauthStateChanged', () => {
            this.updateDisplay();
        });
    }
    
    /**
     * Make panel draggable
     */
    makePanelDraggable() {
        const panel = document.getElementById('oauth-test-panel');
        const header = panel.querySelector('.test-panel-header');
        let isDragging = false;
        let startX, startY, initialX, initialY;
        
        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = panel.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            panel.style.left = (initialX + dx) + 'px';
            panel.style.top = (initialY + dy) + 'px';
            panel.style.right = 'auto';
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }
    
    /**
     * Update display with current status
     */
    updateDisplay() {
        if (!this.isVisible) return;
        
        const authStatus = document.getElementById('auth-status');
        const userStatus = document.getElementById('user-status');
        const tokenStatus = document.getElementById('token-status');
        const cartDisplay = document.getElementById('cart-items-display');
        
        if (this.manager.isAuthenticated()) {
            authStatus.textContent = 'Yes';
            authStatus.style.color = '#66ff66';
            
            const user = this.manager.getCurrentUser();
            userStatus.textContent = user ? user.name : 'Unknown';
            
            const token = this.manager.getOAuth()?.getAccessToken();
            tokenStatus.textContent = token ? token.substring(0, 20) + '...' : 'None';
        } else {
            authStatus.textContent = 'No';
            authStatus.style.color = '#ff6666';
            userStatus.textContent = 'N/A';
            tokenStatus.textContent = 'N/A';
        }
        
        // Update cart display
        if (this.manager.getCart()) {
            const cart = this.manager.getCart().getCart();
            cartDisplay.textContent = JSON.stringify(cart, null, 2);
        } else {
            cartDisplay.textContent = 'Cart not initialized';
        }
    }
    
    /**
     * Test login
     */
    testLogin() {
        this.log('Testing login...');
        if (this.manager.getOAuth()) {
            this.manager.getOAuth().login();
        } else {
            this.logError('OAuth not initialized');
        }
    }
    
    /**
     * Test logout
     */
    testLogout() {
        this.log('Testing logout...');
        if (this.manager.getOAuth()) {
            this.manager.getOAuth().logout();
        } else {
            this.logError('OAuth not initialized');
        }
    }
    
    /**
     * Refresh status
     */
    refreshStatus() {
        this.log('Refreshing status...');
        this.updateDisplay();
        this.logSuccess('Status refreshed');
    }
    
    /**
     * Test add to cart
     */
    async testAddToCart() {
        const productId = document.getElementById('test-product-id').value;
        const quantity = parseInt(document.getElementById('test-quantity').value);
        
        this.log(`Testing add to cart: Product ${productId}, Quantity ${quantity}`);
        
        if (this.manager.getCart()) {
            const success = await this.manager.getCart().addToCart(productId, quantity);
            if (success) {
                this.logSuccess('Item added to cart');
            } else {
                this.logError('Failed to add item to cart');
            }
        } else {
            this.logError('Cart not initialized');
        }
    }
    
    /**
     * Test load cart
     */
    async testLoadCart() {
        this.log('Testing load cart...');
        
        if (this.manager.getCart()) {
            await this.manager.getCart().loadCart();
            this.logSuccess('Cart loaded');
            this.updateDisplay();
        } else {
            this.logError('Cart not initialized');
        }
    }
    
    /**
     * Test clear cart
     */
    testClearCart() {
        this.log('Testing clear cart...');
        
        if (this.manager.getCart()) {
            this.manager.getCart().clearCart();
            this.logSuccess('Cart cleared');
            this.updateDisplay();
        } else {
            this.logError('Cart not initialized');
        }
    }
    
    /**
     * Test load products
     */
    async testLoadProducts() {
        this.log('Testing load products...');
        
        if (this.manager.getProducts()) {
            await this.manager.getProducts().loadProducts();
            this.logSuccess('Products loaded');
        } else {
            this.logError('Product display not initialized');
        }
    }
    
    /**
     * Test load user data
     */
    async testLoadUserData() {
        this.log('Testing load user data...');
        
        if (this.manager.getProducts()) {
            await this.manager.getProducts().loadUserData();
            this.logSuccess('User data loaded');
        } else {
            this.logError('Product display not initialized');
        }
    }
    
    /**
     * Test toggle favorite
     */
    async testToggleFavorite() {
        const productId = document.getElementById('test-favorite-id').value;
        
        this.log(`Testing toggle favorite: Product ${productId}`);
        
        if (this.manager.getProducts()) {
            const success = await this.manager.getProducts().toggleFavorite(productId);
            if (success) {
                this.logSuccess('Favorite toggled');
            } else {
                this.logError('Failed to toggle favorite');
            }
        } else {
            this.logError('Product display not initialized');
        }
    }
    
    /**
     * Test API call
     */
    async testAPICall() {
        const url = document.getElementById('test-api-url').value;
        const method = document.getElementById('test-api-method').value;
        const body = document.getElementById('test-api-body').value;
        
        this.log(`Testing API call: ${method} ${url}`);
        
        try {
            let options = { method };
            
            if (body && (method === 'POST' || method === 'PUT')) {
                options.body = body;
                options.headers = { 'Content-Type': 'application/json' };
            }
            
            let response;
            if (this.manager.isAuthenticated()) {
                response = await this.manager.getOAuth().makeAuthenticatedRequest(url, options);
            } else {
                response = await fetch(url, options);
            }
            
            const responseData = await response.text();
            document.getElementById('api-response-display').textContent = responseData;
            
            this.logSuccess(`API call completed: ${response.status}`);
        } catch (error) {
            this.logError(`API call failed: ${error.message}`);
            document.getElementById('api-response-display').textContent = error.message;
        }
    }
    
    /**
     * Test clear session
     */
    testClearSession() {
        this.log('Clearing session...');
        
        if (this.manager.getOAuth()) {
            this.manager.getOAuth().clearSession();
            this.logSuccess('Session cleared');
            this.updateDisplay();
        } else {
            this.logError('OAuth not initialized');
        }
    }
    
    /**
     * Test export session
     */
    testExportSession() {
        this.log('Exporting session...');
        
        const sessionData = {
            token: localStorage.getItem(this.config.session.tokenKey),
            user: localStorage.getItem(this.config.session.userKey),
            expiry: localStorage.getItem(this.config.session.expiryKey)
        };
        
        document.getElementById('session-data').value = JSON.stringify(sessionData, null, 2);
        this.logSuccess('Session exported');
    }
    
    /**
     * Test import session
     */
    testImportSession() {
        this.log('Importing session...');
        
        try {
            const sessionData = JSON.parse(document.getElementById('session-data').value);
            
            if (sessionData.token) {
                localStorage.setItem(this.config.session.tokenKey, sessionData.token);
            }
            if (sessionData.user) {
                localStorage.setItem(this.config.session.userKey, sessionData.user);
            }
            if (sessionData.expiry) {
                localStorage.setItem(this.config.session.expiryKey, sessionData.expiry);
            }
            
            // Refresh OAuth integration
            if (this.manager.getOAuth()) {
                this.manager.getOAuth().checkExistingSession();
            }
            
            this.logSuccess('Session imported');
            this.updateDisplay();
        } catch (error) {
            this.logError(`Failed to import session: ${error.message}`);
        }
    }
    
    /**
     * Execute console command
     */
    executeConsoleCommand() {
        const command = document.getElementById('console-command').value.trim();
        if (!command) return;
        
        this.log(`> ${command}`);
        
        try {
            // Basic commands
            if (command === 'help') {
                this.log('Available commands: help, status, clear, login, logout, refresh');
            } else if (command === 'status') {
                this.log(JSON.stringify(this.manager.getState(), null, 2));
            } else if (command === 'clear') {
                document.getElementById('console-output').innerHTML = '';
            } else if (command === 'login') {
                this.testLogin();
            } else if (command === 'logout') {
                this.testLogout();
            } else if (command === 'refresh') {
                this.refreshStatus();
            } else {
                // Try to evaluate as JavaScript
                const result = eval(command);
                this.log(String(result));
            }
        } catch (error) {
            this.logError(error.message);
        }
        
        // Clear command input
        document.getElementById('console-command').value = '';
    }
    
    /**
     * Show the test panel
     */
    show() {
        const panel = document.getElementById('oauth-test-panel');
        if (panel) {
            panel.style.display = 'block';
            this.isVisible = true;
            this.updateDisplay();
        }
    }
    
    /**
     * Hide the test panel
     */
    hide() {
        const panel = document.getElementById('oauth-test-panel');
        if (panel) {
            panel.style.display = 'none';
            this.isVisible = false;
        }
    }
    
    /**
     * Toggle minimize state
     */
    toggleMinimize() {
        const panel = document.getElementById('oauth-test-panel');
        if (panel) {
            panel.classList.toggle('minimized');
        }
    }
    
    /**
     * Log message to console
     */
    log(message) {
        const output = document.getElementById('console-output');
        if (output) {
            const logEntry = document.createElement('div');
            logEntry.className = 'console-log';
            logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
            output.appendChild(logEntry);
            output.scrollTop = output.scrollHeight;
        }
    }
    
    /**
     * Log error message to console
     */
    logError(message) {
        const output = document.getElementById('console-output');
        if (output) {
            const logEntry = document.createElement('div');
            logEntry.className = 'console-error';
            logEntry.textContent = `[${new Date().toLocaleTimeString()}] ERROR: ${message}`;
            output.appendChild(logEntry);
            output.scrollTop = output.scrollHeight;
        }
    }
    
    /**
     * Log success message to console
     */
    logSuccess(message) {
        const output = document.getElementById('console-output');
        if (output) {
            const logEntry = document.createElement('div');
            logEntry.className = 'console-success';
            logEntry.textContent = `[${new Date().toLocaleTimeString()}] SUCCESS: ${message}`;
            output.appendChild(logEntry);
            output.scrollTop = output.scrollHeight;
        }
    }
    
    /**
     * Destroy the test panel
     */
    destroy() {
        const panel = document.getElementById('oauth-test-panel');
        if (panel) {
            panel.remove();
        }
        this.isVisible = false;
    }
    
    /**
     * Test user purchases endpoint
     */
    async testUserPurchases() {
        this.log('Testing user purchases API...');
        
        if (!this.manager.isAuthenticated()) {
            this.logError('Not authenticated. Please login first.');
            return;
        }
        
        try {
            const oauth = this.manager.getOAuth();
            const purchases = await oauth.getUserPurchases();
            
            this.logSuccess(`✓ Purchases API: ${purchases?.results?.length || 0} items found`);
            this.updateCommerceDisplay('purchases', purchases);
            
        } catch (error) {
            this.logError(`Purchases API failed: ${error.message}`);
        }
    }
    
    /**
     * Test user invoices endpoint
     */
    async testUserInvoices() {
        this.log('Testing user invoices API...');
        
        if (!this.manager.isAuthenticated()) {
            this.logError('Not authenticated. Please login first.');
            return;
        }
        
        try {
            const oauth = this.manager.getOAuth();
            const invoices = await oauth.getUserInvoices();
            
            this.logSuccess(`✓ Invoices API: ${invoices?.results?.length || 0} items found`);
            this.updateCommerceDisplay('invoices', invoices);
            
        } catch (error) {
            this.logError(`Invoices API failed: ${error.message}`);
        }
    }
    
    /**
     * Test user transactions endpoint
     */
    async testUserTransactions() {
        this.log('Testing user transactions API...');
        
        if (!this.manager.isAuthenticated()) {
            this.logError('Not authenticated. Please login first.');
            return;
        }
        
        try {
            const oauth = this.manager.getOAuth();
            const transactions = await oauth.getUserTransactions();
            
            this.logSuccess(`✓ Transactions API: ${transactions?.results?.length || 0} items found`);
            this.updateCommerceDisplay('transactions', transactions);
            
        } catch (error) {
            this.logError(`Transactions API failed: ${error.message}`);
        }
    }
    
    /**
     * Test license keys endpoint
     */
    async testLicenseKeys() {
        this.log('Testing license keys API...');
        
        if (!this.manager.isAuthenticated()) {
            this.logError('Not authenticated. Please login first.');
            return;
        }
        
        try {
            const oauth = this.manager.getOAuth();
            const licenseKeys = await oauth.getUserLicenseKeys();
            
            this.logSuccess(`✓ License Keys API: Data retrieved`);
            this.updateCommerceDisplay('licenseKeys', licenseKeys);
            
        } catch (error) {
            this.logError(`License Keys API failed: ${error.message}`);
        }
    }
    
    /**
     * Test all commerce APIs at once
     */
    async testAllCommerce() {
        this.log('=== Testing All Commerce APIs ===');
        
        if (!this.manager.isAuthenticated()) {
            this.logError('Not authenticated. Please login first.');
            return;
        }
        
        const results = {
            purchases: null,
            invoices: null,
            transactions: null,
            licenseKeys: null,
            errors: []
        };
        
        // Test purchases
        try {
            const oauth = this.manager.getOAuth();
            results.purchases = await oauth.getUserPurchases();
            this.logSuccess(`✓ Purchases: ${results.purchases?.results?.length || 0} items`);
        } catch (error) {
            results.errors.push(`Purchases: ${error.message}`);
            this.logError(`✗ Purchases failed: ${error.message}`);
        }
        
        // Test invoices
        try {
            const oauth = this.manager.getOAuth();
            results.invoices = await oauth.getUserInvoices();
            this.logSuccess(`✓ Invoices: ${results.invoices?.results?.length || 0} items`);
        } catch (error) {
            results.errors.push(`Invoices: ${error.message}`);
            this.logError(`✗ Invoices failed: ${error.message}`);
        }
        
        // Test transactions
        try {
            const oauth = this.manager.getOAuth();
            results.transactions = await oauth.getUserTransactions();
            this.logSuccess(`✓ Transactions: ${results.transactions?.results?.length || 0} items`);
        } catch (error) {
            results.errors.push(`Transactions: ${error.message}`);
            this.logError(`✗ Transactions failed: ${error.message}`);
        }
        
        // Test license keys
        try {
            const oauth = this.manager.getOAuth();
            results.licenseKeys = await oauth.getUserLicenseKeys();
            this.logSuccess(`✓ License Keys: Data retrieved`);
        } catch (error) {
            results.errors.push(`License Keys: ${error.message}`);
            this.logError(`✗ License Keys failed: ${error.message}`);
        }
        
        // Summary
        const successCount = 4 - results.errors.length;
        if (results.errors.length === 0) {
            this.logSuccess(`=== All Commerce APIs Working! (${successCount}/4) ===`);
        } else {
            this.logError(`=== Commerce API Test Complete (${successCount}/4 working) ===`);
        }
        
        this.updateCommerceDisplay('all', results);
    }
    
    /**
     * Update commerce data display
     */
    updateCommerceDisplay(type, data) {
        const display = document.getElementById('commerce-data-display');
        if (!display) return;
        
        let displayData = {};
        
        if (type === 'all') {
            displayData = {
                summary: {
                    purchases: data.purchases?.results?.length || 0,
                    invoices: data.invoices?.results?.length || 0,
                    transactions: data.transactions?.results?.length || 0,
                    licenseKeys: data.licenseKeys ? 'Available' : 'None',
                    errors: data.errors
                },
                lastTest: new Date().toISOString()
            };
        } else {
            displayData = {
                type: type,
                count: data?.results?.length || (data ? 1 : 0),
                data: data,
                timestamp: new Date().toISOString()
            };
        }
        
        display.textContent = JSON.stringify(displayData, null, 2);
    }
}
