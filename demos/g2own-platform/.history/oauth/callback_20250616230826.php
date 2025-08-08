<?php
// Enhanced OAuth Callback Handler for G2Own with API Key Support
header('Content-Type: text/html; charset=UTF-8');
header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');

// Configuration - UPDATE THESE WITH YOUR ACTUAL VALUES
$config = [
    'client_id' => 'g2own_frontend', // Your OAuth client ID
    'client_secret' => '86490564787ccfdb2fefcaed4b49138f', // Your OAuth client secret
    'community_url' => 'https://g2own.com/community',
    'frontend_url' => 'https://g2own.com',
    'success_redirect' => 'https://g2own.com/oauth/success',
    
    // API Keys for authenticated endpoints
    'api_keys' => [
        'authorized_user' => 'authorized_user', // For user operations
        'menus' => 'menus' // For commerce operations
    ]
];

class G2OwnOAuthCallback {
    private $config;
    
    public function __construct($config) {
        $this->config = $config;
    }
    
    public function handleCallback() {
        try {
            // Check for errors
            if (isset($_GET['error'])) {
                $this->redirectWithError($_GET['error_description'] ?? $_GET['error']);
                return;
            }
            
            // Get authorization code and state
            $code = $_GET['code'] ?? null;
            $state = $_GET['state'] ?? null;
            
            if (!$code) {
                throw new Exception('No authorization code received');
            }
            
            // Validate state parameter for CSRF protection
            $storedState = $_SESSION['oauth_state'] ?? null;
            if ($state !== $storedState) {
                throw new Exception('Invalid state parameter - possible CSRF attack');
            }
            
            // Exchange code for token
            $tokenData = $this->exchangeCodeForToken($code);
            
            // Get user information with proper API authentication
            $userData = $this->getUserInfo($tokenData['access_token']);
            
            // Get additional user data (purchases, etc.)
            $enhancedUserData = $this->getEnhancedUserData($tokenData['access_token'], $userData);
            
            // Clear the state from session
            unset($_SESSION['oauth_state']);
            
            // Redirect to success page with all data
            $this->redirectWithSuccess($tokenData, $enhancedUserData);
            
        } catch (Exception $e) {
            error_log('OAuth Callback Error: ' . $e->getMessage());
            $this->redirectWithError($e->getMessage());
        }
    }
    
    private function exchangeCodeForToken($code) {
        $postData = [
            'grant_type' => 'authorization_code',
            'client_id' => $this->config['client_id'],
            'client_secret' => $this->config['client_secret'],
            'code' => $code,
            'redirect_uri' => 'https://g2own.com/oauth/callback'
        ];
        
        $response = $this->makeCurlRequest(
            $this->config['community_url'] . '/oauth/token/',
            $postData,
            [
                'Content-Type: application/x-www-form-urlencoded',
                'Accept: application/json'
            ],
            'POST'
        );
        
        if (!isset($response['access_token'])) {
            throw new Exception('Invalid token response: ' . json_encode($response));
        }
        
        return $response;
    }
    
    private function getUserInfo($accessToken) {
        $headers = [
            'Authorization: Bearer ' . $accessToken,
            'Accept: application/json'
        ];
        
        // Add API key for authorized user operations
        if (isset($this->config['api_keys']['authorized_user'])) {
            $headers[] = 'X-API-Key: ' . $this->config['api_keys']['authorized_user'];
        }
        
        $userData = $this->makeCurlRequest(
            $this->config['community_url'] . '/api/core/me',
            null,
            $headers,
            'GET'
        );
        
        if (!$userData || !isset($userData['id'])) {
            throw new Exception('Failed to retrieve user information');
        }
        
        return $userData;
    }
    
    private function getEnhancedUserData($accessToken, $userData) {
        $enhancedData = $userData;
        
        // Get user purchases with commerce API key
        try {
            $purchases = $this->getUserPurchases($accessToken);
            $enhancedData['purchases'] = $purchases;
            $enhancedData['purchase_count'] = is_array($purchases) ? count($purchases) : 0;
        } catch (Exception $e) {
            error_log('Failed to get user purchases: ' . $e->getMessage());
            $enhancedData['purchases'] = [];
            $enhancedData['purchase_count'] = 0;
        }
        
        // Get user invoices
        try {
            $invoices = $this->getUserInvoices($accessToken);
            $enhancedData['invoices'] = $invoices;
            $enhancedData['invoice_count'] = is_array($invoices) ? count($invoices) : 0;
        } catch (Exception $e) {
            error_log('Failed to get user invoices: ' . $e->getMessage());
            $enhancedData['invoices'] = [];
            $enhancedData['invoice_count'] = 0;
        }
        
        // Get user transactions
        try {
            $transactions = $this->getUserTransactions($accessToken);
            $enhancedData['transactions'] = $transactions;
            $enhancedData['transaction_count'] = is_array($transactions) ? count($transactions) : 0;
        } catch (Exception $e) {
            error_log('Failed to get user transactions: ' . $e->getMessage());
            $enhancedData['transactions'] = [];
            $enhancedData['transaction_count'] = 0;
        }
        
        return $enhancedData;
    }
    
    private function getUserPurchases($accessToken) {
        $headers = [
            'Authorization: Bearer ' . $accessToken,
            'Accept: application/json'
        ];
        
        // Add commerce API key
        if (isset($this->config['api_keys']['menus'])) {
            $headers[] = 'X-API-Key: ' . $this->config['api_keys']['menus'];
        }
        
        return $this->makeCurlRequest(
            $this->config['community_url'] . '/api/nexus/purchases',
            null,
            $headers,
            'GET'
        );
    }
    
    private function getUserInvoices($accessToken) {
        $headers = [
            'Authorization: Bearer ' . $accessToken,
            'Accept: application/json'
        ];
        
        // Add commerce API key
        if (isset($this->config['api_keys']['menus'])) {
            $headers[] = 'X-API-Key: ' . $this->config['api_keys']['menus'];
        }
        
        return $this->makeCurlRequest(
            $this->config['community_url'] . '/api/nexus/invoices',
            null,
            $headers,
            'GET'
        );
    }
    
    private function getUserTransactions($accessToken) {
        $headers = [
            'Authorization: Bearer ' . $accessToken,
            'Accept: application/json'
        ];
        
        // Add commerce API key
        if (isset($this->config['api_keys']['menus'])) {
            $headers[] = 'X-API-Key: ' . $this->config['api_keys']['menus'];
        }
        
        return $this->makeCurlRequest(
            $this->config['community_url'] . '/api/nexus/transactions',
            null,
            $headers,
            'GET'
        );
    }
    
    private function makeCurlRequest($url, $postData = null, $headers = [], $method = 'GET') {
        $curl = curl_init();
        
        $curlOptions = [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_USERAGENT => 'G2Own-OAuth-Client/2.0',
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 3
        ];
        
        if ($method === 'POST' && $postData) {
            $curlOptions[CURLOPT_POST] = true;
            $curlOptions[CURLOPT_POSTFIELDS] = is_array($postData) ? http_build_query($postData) : $postData;
        }
        
        curl_setopt_array($curl, $curlOptions);
        
        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $error = curl_error($curl);
        curl_close($curl);
        
        if ($error) {
            throw new Exception('cURL error: ' . $error);
        }
        
        if ($httpCode < 200 || $httpCode >= 300) {
            throw new Exception("HTTP {$httpCode}: {$response}");
        }
        
        $decoded = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON response: ' . json_last_error_msg());
        }
        
        return $decoded;
    }
    
    private function redirectWithSuccess($tokenData, $userData) {
        $successUrl = $this->config['success_redirect'] . '?' . http_build_query([
            'status' => 'success',
            'token' => $tokenData['access_token'],
            'expires_in' => $tokenData['expires_in'] ?? 3600,
            'user_id' => $userData['id'] ?? null,
            'user_name' => $userData['name'] ?? null,
            'user_email' => $userData['email'] ?? null,
            'purchase_count' => $userData['purchase_count'] ?? 0,
            'invoice_count' => $userData['invoice_count'] ?? 0,
            'transaction_count' => $userData['transaction_count'] ?? 0,
            'api_keys' => base64_encode(json_encode($this->config['api_keys'])),
            'timestamp' => time()
        ]);
        
        header('Location: ' . $successUrl);
        exit;
    }
    
    private function redirectWithError($error) {
        $errorUrl = $this->config['success_redirect'] . '?' . http_build_query([
            'status' => 'error',
            'error' => $error,
            'timestamp' => time()
        ]);
        
        header('Location: ' . $errorUrl);
        exit;
    }
}

// Start session for state management
session_start();

// Handle the callback
$handler = new G2OwnOAuthCallback($config);
$handler->handleCallback();
?>
