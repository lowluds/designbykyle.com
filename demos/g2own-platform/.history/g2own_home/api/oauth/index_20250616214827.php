<?php
/**
 * G2Own OAuth API Endpoints
 * Provides API endpoints for OAuth session management
 * 
 * This file handles OAuth-related API requests
 */

// Prevent direct access
if (!defined('OAUTH_API_ALLOWED')) {
    define('OAUTH_API_ALLOWED', true);
}

// Load configuration
require_once __DIR__ . '/../../oauth/callback.php';

// Set CORS headers
header('Access-Control-Allow-Origin: https://g2own.com');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/**
 * Route API requests
 */
function routeRequest() {
    $requestURI = $_SERVER['REQUEST_URI'];
    $method = $_SERVER['REQUEST_METHOD'];
    
    // Remove query string and base path
    $path = parse_url($requestURI, PHP_URL_PATH);
    $path = str_replace('/api/oauth', '', $path);
    
    switch ($path) {
        case '/session-exchange':
            if ($method === 'POST') {
                handleSessionExchange();
            } else {
                sendError('Method not allowed', 405);
            }
            break;
            
        case '/refresh':
            if ($method === 'POST') {
                handleTokenRefresh();
            } else {
                sendError('Method not allowed', 405);
            }
            break;
            
        case '/logout':
            if ($method === 'POST') {
                handleLogout();
            } else {
                sendError('Method not allowed', 405);
            }
            break;
            
        case '/status':
            if ($method === 'GET') {
                handleStatusCheck();
            } else {
                sendError('Method not allowed', 405);
            }
            break;
            
        default:
            sendError('Endpoint not found', 404);
    }
}

/**
 * Handle session exchange
 */
function handleSessionExchange() {
    try {
        session_start();
        
        // Check if user has valid session
        if (empty($_SESSION['is_authenticated']) || empty($_SESSION['oauth_access_token'])) {
            sendError('No valid session found', 401);
            return;
        }
        
        // Check token expiry
        if (time() > ($_SESSION['oauth_expires_at'] ?? 0)) {
            sendError('Session expired', 401);
            return;
        }
        
        // Return session data
        sendSuccess([
            'access_token' => $_SESSION['oauth_access_token'],
            'refresh_token' => $_SESSION['oauth_refresh_token'] ?? null,
            'expires_in' => max(0, ($_SESSION['oauth_expires_at'] ?? time()) - time()),
            'user' => $_SESSION['user_info'] ?? null,
            'authenticated' => true
        ]);
        
    } catch (Exception $e) {
        sendError('Session exchange failed: ' . $e->getMessage(), 500);
    }
}

/**
 * Handle token refresh
 */
function handleTokenRefresh() {
    try {
        session_start();
        
        $input = json_decode(file_get_contents('php://input'), true);
        $refreshToken = $_SESSION['oauth_refresh_token'] ?? $input['refresh_token'] ?? null;
        
        if (!$refreshToken) {
            sendError('No refresh token available', 400);
            return;
        }
        
        // Refresh token logic (from callback.php)
        global $config;
        
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
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            sendError('Token refresh failed', 400);
            return;
        }
        
        $tokenData = json_decode($response, true);
        
        // Update session
        $_SESSION['oauth_access_token'] = $tokenData['access_token'];
        $_SESSION['oauth_refresh_token'] = $tokenData['refresh_token'] ?? $refreshToken;
        $_SESSION['oauth_expires_at'] = time() + ($tokenData['expires_in'] ?? 3600);
        $_SESSION['last_activity'] = time();
        
        sendSuccess([
            'access_token' => $tokenData['access_token'],
            'refresh_token' => $tokenData['refresh_token'] ?? $refreshToken,
            'expires_in' => $tokenData['expires_in'] ?? 3600,
            'token_type' => $tokenData['token_type'] ?? 'Bearer'
        ]);
        
    } catch (Exception $e) {
        sendError('Token refresh failed: ' . $e->getMessage(), 500);
    }
}

/**
 * Handle logout
 */
function handleLogout() {
    try {
        session_start();
        
        // Revoke token if possible
        if (!empty($_SESSION['oauth_access_token'])) {
            global $config;
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $config['community_url'] . '/oauth/revoke/');
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
                'token' => $_SESSION['oauth_access_token'],
                'client_id' => $config['client_id']
            ]));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            curl_exec($ch);
            curl_close($ch);
        }
        
        // Clear session
        session_destroy();
        
        // Clear session cookie
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        
        sendSuccess([
            'message' => 'Logged out successfully',
            'authenticated' => false
        ]);
        
    } catch (Exception $e) {
        sendError('Logout failed: ' . $e->getMessage(), 500);
    }
}

/**
 * Handle status check
 */
function handleStatusCheck() {
    try {
        session_start();
        
        $isAuthenticated = !empty($_SESSION['is_authenticated']) && 
                          !empty($_SESSION['oauth_access_token']) &&
                          time() <= ($_SESSION['oauth_expires_at'] ?? 0);
        
        sendSuccess([
            'authenticated' => $isAuthenticated,
            'user' => $isAuthenticated ? ($_SESSION['user_info'] ?? null) : null,
            'expires_in' => $isAuthenticated ? max(0, ($_SESSION['oauth_expires_at'] ?? time()) - time()) : 0,
            'last_activity' => $_SESSION['last_activity'] ?? null
        ]);
        
    } catch (Exception $e) {
        sendError('Status check failed: ' . $e->getMessage(), 500);
    }
}

/**
 * Send success response
 */
function sendSuccess($data) {
    echo json_encode([
        'success' => true,
        'data' => $data,
        'timestamp' => time()
    ]);
    exit;
}

/**
 * Send error response
 */
function sendError($message, $statusCode = 400) {
    http_response_code($statusCode);
    echo json_encode([
        'success' => false,
        'error' => $message,
        'timestamp' => time()
    ]);
    exit;
}

/**
 * Log API activity (optional)
 */
function logActivity($message, $level = 'info') {
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] [$level] $message" . PHP_EOL;
    
    // Log to file (make sure the directory is writable)
    error_log($logMessage, 3, __DIR__ . '/../../logs/oauth-api.log');
}

// Main execution
try {
    routeRequest();
} catch (Exception $e) {
    logActivity('API Error: ' . $e->getMessage(), 'error');
    sendError('Internal server error', 500);
}
?>
