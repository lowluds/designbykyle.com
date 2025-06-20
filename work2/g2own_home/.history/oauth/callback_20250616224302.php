<?php
/**
 * OAuth Callback Handler for G2Own Invision Community Integration
 * Handles the OAuth authorization code exchange and user authentication
 */

// Security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// CORS headers (adjust as needed for your domain)
header('Access-Control-Allow-Origin: https://g2own.com');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuration
$config = [
    'client_id' => 'your_client_id_here', // Replace with actual client ID
    'client_secret' => 'your_client_secret_here', // Replace with actual client secret
    'redirect_uri' => 'https://g2own.com/oauth/callback.php',
    'community_base_url' => 'https://g2own.com/community',
    'token_url' => 'https://g2own.com/community/oauth/token/',
    'success_redirect' => '/oauth/success.php',
    'error_redirect' => '/?error=oauth_failed',
    
    // API Keys for authenticated endpoints
    'api_keys' => [
        'authorized_user' => 'authorized_user', // For user operations requiring authentication
        'menus' => 'menus' // For commerce operations (store/products/purchases)
    ],
    
    // API endpoints that require specific keys
    'endpoints' => [
        'user_info' => '/api/core/me', // Uses authorized_user key
        'purchases' => '/nexus/purchases', // Uses menus key
        'invoices' => '/nexus/invoices', // Uses menus key
        'transactions' => '/nexus/transactions' // Uses menus key
    ]
];

// Logging function for debugging
function logMessage($level, $message, $data = null) {
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[$timestamp] [$level] $message";
    if ($data) {
        $logEntry .= " - " . json_encode($data);
    }
    error_log($logEntry);
}

// Send JSON response
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit();
}

// Send error response
function sendError($error, $description = null, $statusCode = 400) {
    $response = ['error' => $error];
    if ($description) {
        $response['error_description'] = $description;
    }
    sendJsonResponse($response, $statusCode);
}

// Verify state parameter for CSRF protection
function verifyState($receivedState) {
    // In a production environment, you might want to store states in a database
    // or use a more sophisticated verification method
    return !empty($receivedState) && strlen($receivedState) >= 16;
}

// Exchange authorization code for access token
function exchangeCodeForToken($code, $config) {
    $postData = [
        'grant_type' => 'authorization_code',
        'client_id' => $config['client_id'],
        'client_secret' => $config['client_secret'],
        'redirect_uri' => $config['redirect_uri'],
        'code' => $code
    ];
    
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => [
                'Content-Type: application/x-www-form-urlencoded',
                'Accept: application/json',
                'User-Agent: G2Own-OAuth-Client/1.0'
            ],
            'content' => http_build_query($postData),
            'timeout' => 30
        ],
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true,
            'cafile' => null // Use system CA bundle
        ]
    ]);
    
    logMessage('INFO', 'Exchanging code for token', ['url' => $config['token_url']]);
    
    $response = file_get_contents($config['token_url'], false, $context);
    
    if ($response === false) {
        $error = error_get_last();
        logMessage('ERROR', 'Failed to exchange code for token', $error);
        throw new Exception('Failed to connect to OAuth server');
    }
    
    $data = json_decode($response, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        logMessage('ERROR', 'Invalid JSON response from token endpoint', ['response' => $response]);
        throw new Exception('Invalid response from OAuth server');
    }
    
    if (isset($data['error'])) {
        logMessage('ERROR', 'OAuth error from token endpoint', $data);
        throw new Exception($data['error_description'] ?? $data['error']);
    }
    
    if (!isset($data['access_token'])) {
        logMessage('ERROR', 'No access token in response', $data);
        throw new Exception('No access token received');
    }
    
    logMessage('INFO', 'Successfully received access token');
    return $data;
}

// Fetch user data using access token with proper API key
function fetchUserData($accessToken, $config) {
    $headers = [
        'Authorization: Bearer ' . $accessToken,
        'Accept: application/json',
        'User-Agent: G2Own-OAuth-Client/1.0'
    ];
    
    // Add API key for user operations
    if (isset($config['api_keys']['authorized_user'])) {
        $headers[] = 'X-API-Key: ' . $config['api_keys']['authorized_user'];
    }
    
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => $headers,
            'timeout' => 30
        ],
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true
        ]
    ]);
    
    $userUrl = $config['community_base_url'] . $config['endpoints']['user_info'];
    logMessage('INFO', 'Fetching user data', ['url' => $userUrl]);
    
    $response = file_get_contents($userUrl, false, $context);
    
    if ($response === false) {
        $error = error_get_last();
        logMessage('ERROR', 'Failed to fetch user data', $error);
        throw new Exception('Failed to fetch user data');
    }
    
    $data = json_decode($response, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        logMessage('ERROR', 'Invalid JSON response from user endpoint', ['response' => $response]);
        throw new Exception('Invalid user data response');
    }
    
    if (isset($data['errorCode'])) {
        logMessage('ERROR', 'Error in user data response', $data);
        throw new Exception($data['errorMessage'] ?? 'Failed to fetch user data');
    }
    
    logMessage('INFO', 'Successfully fetched user data', ['user_id' => $data['id'] ?? 'unknown']);
    return $data;
}

// Fetch user commerce data using menus API key
function fetchUserCommerceData($accessToken, $config) {
    $commerceData = [];
    $headers = [
        'Authorization: Bearer ' . $accessToken,
        'Accept: application/json',
        'User-Agent: G2Own-OAuth-Client/1.0'
    ];
    
    // Add menus API key for commerce operations
    if (isset($config['api_keys']['menus'])) {
        $headers[] = 'X-API-Key: ' . $config['api_keys']['menus'];
    }
    
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => $headers,
            'timeout' => 30
        ],
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true
        ]
    ]);
    
    // Try to fetch purchases
    try {
        $purchasesUrl = $config['community_base_url'] . $config['endpoints']['purchases'];
        logMessage('INFO', 'Fetching user purchases', ['url' => $purchasesUrl]);
        
        $response = file_get_contents($purchasesUrl, false, $context);
        if ($response !== false) {
            $purchases = json_decode($response, true);
            if (json_last_error() === JSON_ERROR_NONE && !isset($purchases['errorCode'])) {
                $commerceData['purchases'] = $purchases;
                $commerceData['purchase_count'] = count($purchases['results'] ?? []);
                logMessage('INFO', 'User purchases loaded', ['count' => $commerceData['purchase_count']]);
            }
        }
    } catch (Exception $e) {
        logMessage('WARN', 'Could not fetch user purchases', ['error' => $e->getMessage()]);
    }
    
    // Try to fetch invoices
    try {
        $invoicesUrl = $config['community_base_url'] . $config['endpoints']['invoices'];
        logMessage('INFO', 'Fetching user invoices', ['url' => $invoicesUrl]);
        
        $response = file_get_contents($invoicesUrl, false, $context);
        if ($response !== false) {
            $invoices = json_decode($response, true);
            if (json_last_error() === JSON_ERROR_NONE && !isset($invoices['errorCode'])) {
                $commerceData['invoices'] = $invoices;
                $commerceData['invoice_count'] = count($invoices['results'] ?? []);
                logMessage('INFO', 'User invoices loaded', ['count' => $commerceData['invoice_count']]);
            }
        }
    } catch (Exception $e) {
        logMessage('WARN', 'Could not fetch user invoices', ['error' => $e->getMessage()]);
    }
    
    // Try to fetch transactions
    try {
        $transactionsUrl = $config['community_base_url'] . $config['endpoints']['transactions'];
        logMessage('INFO', 'Fetching user transactions', ['url' => $transactionsUrl]);
        
        $response = file_get_contents($transactionsUrl, false, $context);
        if ($response !== false) {
            $transactions = json_decode($response, true);
            if (json_last_error() === JSON_ERROR_NONE && !isset($transactions['errorCode'])) {
                $commerceData['transactions'] = $transactions;
                $commerceData['transaction_count'] = count($transactions['results'] ?? []);
                logMessage('INFO', 'User transactions loaded', ['count' => $commerceData['transaction_count']]);
            }
        }
    } catch (Exception $e) {
        logMessage('WARN', 'Could not fetch user transactions', ['error' => $e->getMessage()]);
    }
    
    return $commerceData;
}

// Main request handling
try {
    logMessage('INFO', 'OAuth callback handler started', [
        'method' => $_SERVER['REQUEST_METHOD'],
        'query' => $_GET,
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
    ]);
    
    // Handle POST request for token exchange (AJAX)
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            sendError('invalid_request', 'Invalid JSON input');
        }
        
        if (!isset($input['action']) || $input['action'] !== 'exchange_token') {
            sendError('invalid_request', 'Invalid action');
        }
        
        if (empty($input['code'])) {
            sendError('invalid_request', 'Missing authorization code');
        }
        
        $code = $input['code'];
        $redirectUri = $input['redirect_uri'] ?? $config['redirect_uri'];
        
        // Update config with provided redirect URI
        $config['redirect_uri'] = $redirectUri;
        
        // Exchange code for token
        $tokenData = exchangeCodeForToken($code, $config);
        
        // Fetch user data
        $userData = fetchUserData($tokenData['access_token'], $config);
        
        // Return both token and user data
        $response = array_merge($tokenData, ['user' => $userData]);
        
        logMessage('INFO', 'OAuth token exchange completed successfully');
        sendJsonResponse($response);
    }
    
    // Handle GET request for direct callback (browser redirect)
    else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $code = $_GET['code'] ?? null;
        $state = $_GET['state'] ?? null;
        $error = $_GET['error'] ?? null;
        
        // Handle OAuth errors
        if ($error) {
            $errorDescription = $_GET['error_description'] ?? $error;
            logMessage('ERROR', 'OAuth error received', ['error' => $error, 'description' => $errorDescription]);
            
            // Redirect to error page with parameters
            $errorUrl = $config['error_redirect'] . '&oauth_error=' . urlencode($error) . '&description=' . urlencode($errorDescription);
            header('Location: ' . $errorUrl);
            exit();
        }
        
        // Validate required parameters
        if (!$code || !$state) {
            logMessage('ERROR', 'Missing required parameters', ['code' => !!$code, 'state' => !!$state]);
            header('Location: ' . $config['error_redirect'] . '&oauth_error=missing_parameters');
            exit();
        }
        
        // Verify state parameter
        if (!verifyState($state)) {
            logMessage('ERROR', 'Invalid state parameter', ['state' => $state]);
            header('Location: ' . $config['error_redirect'] . '&oauth_error=invalid_state');
            exit();
        }
        
        // Exchange code for token
        $tokenData = exchangeCodeForToken($code, $config);
        
        // Fetch user data
        $userData = fetchUserData($tokenData['access_token'], $config);
        
        // In a real application, you might want to store the session server-side
        // For this example, we'll pass the data to the success page
        session_start();
        $_SESSION['oauth_token'] = $tokenData['access_token'];
        $_SESSION['oauth_user'] = $userData;
        $_SESSION['oauth_expires'] = time() + ($tokenData['expires_in'] ?? 3600);
        
        logMessage('INFO', 'OAuth callback completed successfully, redirecting to success page');
        
        // Redirect to success page
        header('Location: ' . $config['success_redirect'] . '?state=' . urlencode($state));
        exit();
    }
    
    else {
        sendError('method_not_allowed', 'Only GET and POST methods are allowed', 405);
    }
    
} catch (Exception $e) {
    logMessage('ERROR', 'Exception in OAuth callback handler', [
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        sendError('server_error', $e->getMessage(), 500);
    } else {
        header('Location: ' . $config['error_redirect'] . '&oauth_error=server_error&description=' . urlencode($e->getMessage()));
        exit();
    }
} catch (Error $e) {
    logMessage('ERROR', 'Fatal error in OAuth callback handler', [
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        sendError('server_error', 'Internal server error', 500);
    } else {
        header('Location: ' . $config['error_redirect'] . '&oauth_error=fatal_error');
        exit();
    }
}
?>
