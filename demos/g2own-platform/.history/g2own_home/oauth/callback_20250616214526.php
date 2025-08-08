<?php
/**
 * G2Own OAuth Callback Handler
 * Handles OAuth callbacks and session management
 * 
 * This file should be placed in your web root directory
 * Example: /oauth/callback.php
 */

// Prevent direct access without proper setup
if (!defined('OAUTH_CALLBACK_ALLOWED')) {
    define('OAUTH_CALLBACK_ALLOWED', true);
}

// Configuration
$config = [
    'community_url' => 'https://g2own.com/community',
    'client_id' => 'g2own_frontend',
    'client_secret' => 'your_oauth_client_secret', // Get this from Invision Community
    'redirect_uri' => 'https://g2own.com/oauth/callback',
    'frontend_url' => 'https://g2own.com'
];

// Set headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: ' . $config['frontend_url']);
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/**
 * Exchange authorization code for access token
 */
function exchangeCodeForToken($code, $config) {
    $postData = [
        'grant_type' => 'authorization_code',
        'client_id' => $config['client_id'],
        'client_secret' => $config['client_secret'],
        'code' => $code,
        'redirect_uri' => $config['redirect_uri']
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $config['community_url'] . '/oauth/token/');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/x-www-form-urlencoded',
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_errno($ch)) {
        $error = curl_error($ch);
        curl_close($ch);
        throw new Exception('CURL Error: ' . $error);
    }
    
    curl_close($ch);
    
    if ($httpCode !== 200) {
        throw new Exception('Token exchange failed with status: ' . $httpCode);
    }
    
    $tokenData = json_decode($response, true);
    if (!$tokenData || !isset($tokenData['access_token'])) {
        throw new Exception('Invalid token response');
    }
    
    return $tokenData;
}

/**
 * Get user information using access token
 */
function getUserInfo($accessToken, $config) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $config['community_url'] . '/api/core/me');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $accessToken,
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_errno($ch)) {
        $error = curl_error($ch);
        curl_close($ch);
        throw new Exception('CURL Error: ' . $error);
    }
    
    curl_close($ch);
    
    if ($httpCode !== 200) {
        throw new Exception('User info request failed with status: ' . $httpCode);
    }
    
    return json_decode($response, true);
}

/**
 * Validate state parameter to prevent CSRF attacks
 */
function validateState($receivedState) {
    session_start();
    $storedState = $_SESSION['oauth_state'] ?? null;
    unset($_SESSION['oauth_state']);
    
    return $storedState && $receivedState && hash_equals($storedState, $receivedState);
}

/**
 * Store session data securely
 */
function storeSessionData($tokenData, $userInfo) {
    session_start();
    
    // Store essential data in session
    $_SESSION['oauth_access_token'] = $tokenData['access_token'];
    $_SESSION['oauth_refresh_token'] = $tokenData['refresh_token'] ?? null;
    $_SESSION['oauth_expires_at'] = time() + ($tokenData['expires_in'] ?? 3600);
    $_SESSION['user_info'] = $userInfo;
    $_SESSION['is_authenticated'] = true;
    $_SESSION['last_activity'] = time();
    
    // Set secure session cookie
    $cookieParams = session_get_cookie_params();
    setcookie(session_name(), session_id(), [
        'expires' => time() + 86400, // 24 hours
        'path' => $cookieParams['path'],
        'domain' => $cookieParams['domain'],
        'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
}

try {
    // Handle OAuth callback
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $code = $_GET['code'] ?? null;
        $state = $_GET['state'] ?? null;
        $error = $_GET['error'] ?? null;
        
        // Check for OAuth errors
        if ($error) {
            $errorDescription = $_GET['error_description'] ?? 'OAuth authentication failed';
            
            // Redirect to frontend with error
            $redirectUrl = $config['frontend_url'] . '?oauth_error=' . urlencode($error) . 
                          '&error_description=' . urlencode($errorDescription);
            header('Location: ' . $redirectUrl);
            exit;
        }
        
        // Validate required parameters
        if (!$code || !$state) {
            throw new Exception('Missing required OAuth parameters');
        }
        
        // Validate state parameter (CSRF protection)
        if (!validateState($state)) {
            throw new Exception('Invalid state parameter - possible CSRF attack');
        }
        
        // Exchange code for token
        $tokenData = exchangeCodeForToken($code, $config);
        
        // Get user information
        $userInfo = getUserInfo($tokenData['access_token'], $config);
        
        // Store session data
        storeSessionData($tokenData, $userInfo);
        
        // Create JavaScript to pass data to frontend
        $jsData = json_encode([
            'success' => true,
            'access_token' => $tokenData['access_token'],
            'refresh_token' => $tokenData['refresh_token'] ?? null,
            'expires_in' => $tokenData['expires_in'] ?? 3600,
            'user' => $userInfo
        ]);
        
        // Return HTML page that communicates with parent window
        echo "<!DOCTYPE html>
<html>
<head>
    <title>OAuth Success</title>
    <meta charset=\"UTF-8\">
</head>
<body>
    <div style=\"text-align: center; padding: 50px; font-family: Arial, sans-serif;\">
        <h2>Authentication Successful</h2>
        <p>Completing login process...</p>
        <div class=\"loading-spinner\" style=\"margin: 20px auto; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #8b0000; border-radius: 50%; animation: spin 2s linear infinite;\"></div>
    </div>
    
    <style>
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
    
    <script>
        // Pass OAuth data to parent window
        const oauthData = " . $jsData . ";
        
        // Try to communicate with parent window
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: 'oauth_success',
                data: oauthData
            }, '" . $config['frontend_url'] . "');
        }
        
        // Store data in localStorage for same-origin scenarios
        if (typeof(Storage) !== 'undefined') {
            localStorage.setItem('g2own_oauth_token', oauthData.access_token);
            localStorage.setItem('g2own_oauth_refresh', oauthData.refresh_token || '');
            localStorage.setItem('g2own_token_expiry', (Date.now() + (oauthData.expires_in * 1000)).toString());
            localStorage.setItem('g2own_user_info', JSON.stringify(oauthData.user));
        }
        
        // Redirect after short delay
        setTimeout(function() {
            window.location.href = '" . $config['frontend_url'] . "?oauth_success=1';
        }, 2000);
    </script>
</body>
</html>";
        
    } 
    // Handle session exchange API
    elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        
        if (strpos($contentType, 'application/json') !== false) {
            $input = json_decode(file_get_contents('php://input'), true);
        } else {
            $input = $_POST;
        }
        
        $action = $input['action'] ?? '';
        
        switch ($action) {
            case 'session_exchange':
                session_start();
                
                if (empty($_SESSION['is_authenticated']) || empty($_SESSION['oauth_access_token'])) {
                    throw new Exception('No valid session found');
                }
                
                // Check session expiry
                if (time() > ($_SESSION['oauth_expires_at'] ?? 0)) {
                    throw new Exception('Session expired');
                }
                
                // Return current session data
                echo json_encode([
                    'success' => true,
                    'access_token' => $_SESSION['oauth_access_token'],
                    'refresh_token' => $_SESSION['oauth_refresh_token'] ?? null,
                    'expires_in' => max(0, ($_SESSION['oauth_expires_at'] ?? time()) - time()),
                    'user' => $_SESSION['user_info'] ?? null
                ]);
                break;
                
            case 'refresh_token':
                session_start();
                $refreshToken = $_SESSION['oauth_refresh_token'] ?? $input['refresh_token'] ?? null;
                
                if (!$refreshToken) {
                    throw new Exception('No refresh token available');
                }
                
                // Refresh the token
                $postData = [
                    'grant_type' => 'refresh_token',
                    'refresh_token' => $refreshToken,
                    'client_id' => $config['client_id'],
                    'client_secret' => $config['client_secret']
                ];
                
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, $config['community_url'] . '/oauth/token/');
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_HTTPHEADER, [
                    'Content-Type: application/x-www-form-urlencoded',
                    'Accept: application/json'
                ]);
                
                $response = curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);
                
                if ($httpCode !== 200) {
                    throw new Exception('Token refresh failed');
                }
                
                $tokenData = json_decode($response, true);
                
                // Update session
                $_SESSION['oauth_access_token'] = $tokenData['access_token'];
                $_SESSION['oauth_refresh_token'] = $tokenData['refresh_token'] ?? $refreshToken;
                $_SESSION['oauth_expires_at'] = time() + ($tokenData['expires_in'] ?? 3600);
                
                echo json_encode([
                    'success' => true,
                    'access_token' => $tokenData['access_token'],
                    'refresh_token' => $tokenData['refresh_token'] ?? $refreshToken,
                    'expires_in' => $tokenData['expires_in'] ?? 3600
                ]);
                break;
                
            case 'logout':
                session_start();
                
                // Revoke token if possible
                if (!empty($_SESSION['oauth_access_token'])) {
                    $ch = curl_init();
                    curl_setopt($ch, CURLOPT_URL, $config['community_url'] . '/oauth/revoke/');
                    curl_setopt($ch, CURLOPT_POST, true);
                    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
                        'token' => $_SESSION['oauth_access_token'],
                        'client_id' => $config['client_id']
                    ]));
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_exec($ch);
                    curl_close($ch);
                }
                
                // Clear session
                session_destroy();
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Logged out successfully'
                ]);
                break;
                
            default:
                throw new Exception('Invalid action');
        }
    } else {
        throw new Exception('Method not allowed');
    }
    
} catch (Exception $e) {
    error_log('OAuth Error: ' . $e->getMessage());
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Redirect to frontend with error for GET requests
        $redirectUrl = $config['frontend_url'] . '?oauth_error=server_error&error_description=' . 
                      urlencode($e->getMessage());
        header('Location: ' . $redirectUrl);
    } else {
        // Return JSON error for API requests
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
}
?>
