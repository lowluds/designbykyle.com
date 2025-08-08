<?php
/**
 * G2Own Enhanced Session Check Endpoint
 * Cross-domain authentication bridge for Invision Community with
 * special support for private browsing modes and forced verification
 * 
 * This file should be placed in your Invision Community directory
 * Example: /path/to/invision/community/enhanced-session-check.php
 */

// Prevent direct access
if (!defined('SESSION_CHECK_ALLOWED')) {
    define('SESSION_CHECK_ALLOWED', true);
}

// Generate request validation data
$requestTime = time();
$requestNonce = bin2hex(random_bytes(16));

// Check if this is a force mode request
$forceMode = isset($_GET['force']) && $_GET['force'] == '1';

// Check if this is a JSONP request
$callback = isset($_GET['callback']) ? $_GET['callback'] : null;
$isJsonp = !empty($callback) && preg_match('/^[a-zA-Z_$][a-zA-Z0-9_$]*$/', $callback);

// Set appropriate headers with enhanced security
if ($isJsonp) {
    // JSONP response
    header('Content-Type: application/javascript; charset=utf-8');
} else {
    // Regular JSON response with CORS headers and enhanced security
    header('Access-Control-Allow-Origin: https://g2own.com');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
    header('Content-Type: application/json; charset=utf-8');
    
    // Enhanced security headers
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('X-XSS-Protection: 1; mode=block');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Cache-Control: no-cache, no-store, must-revalidate');
    header('Pragma: no-cache');
    header('Expires: 0');
}

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Initialize Invision Community framework
    require_once 'init.php';
    
    // Force check or regular check
    if ($forceMode) {
        forceSessionCheck();
    } else {
        regularSessionCheck();
    }
    
} catch (\Exception $e) {
    // Handle errors gracefully
    $response = [
        'success' => false,
        'authenticated' => false,
        'error' => 'Session check failed',
        'message' => $e->getMessage(),
        'timestamp' => time(),
        'nonce' => $requestNonce,
        'server_time' => $requestTime,
        'force_mode' => $forceMode
    ];
    
    // Log the error
    \IPS\Log::log($e, 'auth_bridge_error');
    
    http_response_code(500);
    outputResponse($response);
}

/**
 * Force a thorough session check by examining all possible session identifiers
 * This helps with private browsing modes where cookies might be restricted
 */
function forceSessionCheck() {
    global $response, $requestNonce, $requestTime, $forceMode;
    
    // Check if user is logged in using multiple methods
    $response = [
        'success' => false,
        'authenticated' => false,
        'user' => null,
        'session_id' => null,
        'csrf_token' => null,
        'timestamp' => time(),
        'nonce' => $requestNonce,
        'server_time' => $requestTime,
        'response_id' => md5($requestNonce . $requestTime . ($_SERVER['HTTP_USER_AGENT'] ?? '')),
        'force_mode' => $forceMode
    ];
    
    // Method 1: Standard Member method
    $member = \IPS\Member::loggedIn();
    $authenticated = false;
    
    if ($member->member_id) {
        $authenticated = true;
        $authMethod = 'standard';
    }
    
    // Method 2: Direct cookie check if standard method failed
    if (!$authenticated && isset($_COOKIE['member_id']) && $_COOKIE['member_id'] > 0) {
        $cookieMember = \IPS\Member::load($_COOKIE['member_id']);
        if ($cookieMember->member_id) {
            $member = $cookieMember;
            $authenticated = true;
            $authMethod = 'cookie';
        }
    }
    
    // Method 3: Session table lookup if other methods failed
    if (!$authenticated && session_id()) {
        try {
            $sessionId = session_id();
            $sessionData = \IPS\Db::i()->select('*', 'core_sessions', ['id=?', $sessionId])->first();
            
            if (isset($sessionData['member_id']) && $sessionData['member_id'] > 0) {
                $sessionMember = \IPS\Member::load($sessionData['member_id']);
                if ($sessionMember->member_id) {
                    $member = $sessionMember;
                    $authenticated = true;
                    $authMethod = 'session_table';
                }
            }
        } catch (\Exception $e) {
            // Session lookup failed, continue with other methods
            \IPS\Log::debug("Session table lookup failed: " . $e->getMessage(), 'auth_bridge');
        }
    }
    
    // Method 4: OAuth token check if provided
    if (!$authenticated && isset($_GET['token'])) {
        try {
            $oauthMember = verifyOAuthToken($_GET['token']);
            if ($oauthMember && $oauthMember->member_id) {
                $member = $oauthMember;
                $authenticated = true;
                $authMethod = 'oauth_token';
            }
        } catch (\Exception $e) {
            // OAuth verification failed, continue with other methods
            \IPS\Log::debug("OAuth token verification failed: " . $e->getMessage(), 'auth_bridge');
        }
    }
    
    // Update response based on authentication result
    if ($authenticated && $member->member_id) {
        $response['success'] = true;
        $response['authenticated'] = true;
        $response['auth_method'] = $authMethod;
        $response['session_id'] = session_id();
        $response['user'] = buildUserData($member);
        $response['session_expires'] = session_get_cookie_params()['lifetime'] > 0 
            ? (time() + session_get_cookie_params()['lifetime']) 
            : null;
        $response['request_validation_token'] = md5(session_id() . time() . ($_SERVER['REMOTE_ADDR'] ?? ''));
        
        // Get CSRF token for secure requests
        if (isset(\IPS\Request::i()->csrfKey)) {
            $response['csrf_token'] = \IPS\Request::i()->csrfKey;
        }
        
        // Log the session check for debugging
        \IPS\Log::debug("Enhanced session check successful for user: " . $member->name . " via " . $authMethod, 'auth_bridge');
    } else {
        // User is not authenticated via any method
        $response['success'] = true;
        $response['authenticated'] = false;
        $response['message'] = 'No valid authentication found using multiple methods';
        
        // Still provide session info for guest users
        $response['session_id'] = session_id();
    }
    
    outputResponse($response);
}

/**
 * Standard session check for normal operation
 */
function regularSessionCheck() {
    global $response, $requestNonce, $requestTime, $forceMode;
    
    // Check if user is logged in
    $response = [
        'success' => false,
        'authenticated' => false,
        'user' => null,
        'session_id' => null,
        'csrf_token' => null,
        'timestamp' => time(),
        'nonce' => $requestNonce,
        'server_time' => $requestTime,
        'response_id' => md5($requestNonce . $requestTime . session_id()),
        'force_mode' => $forceMode
    ];
    
    // Get current member
    $member = \IPS\Member::loggedIn();
    
    if ($member->member_id) {
        // User is authenticated
        $response['success'] = true;
        $response['authenticated'] = true;
        $response['auth_method'] = 'standard';
        $response['session_id'] = session_id();
        $response['user'] = buildUserData($member);
        $response['session_expires'] = session_get_cookie_params()['lifetime'] > 0 
            ? (time() + session_get_cookie_params()['lifetime']) 
            : null;
        $response['request_validation_token'] = md5(session_id() . time() . ($_SERVER['REMOTE_ADDR'] ?? ''));
        
        // Get CSRF token for secure requests
        if (isset(\IPS\Request::i()->csrfKey)) {
            $response['csrf_token'] = \IPS\Request::i()->csrfKey;
        }
        
        // Log the session check for debugging (optional)
        \IPS\Log::debug("Session check successful for user: " . $member->name, 'auth_bridge');
    } else {
        // User is not authenticated
        $response['success'] = true;
        $response['authenticated'] = false;
        
        // Still provide session info for guest users
        $response['session_id'] = session_id();
    }
    
    outputResponse($response);
}

/**
 * Verify an OAuth token against the API
 */
function verifyOAuthToken($token) {
    // Make a request to the community API to verify the token
    try {
        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => 'https://g2own.com/community/api/core/me',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $token,
                'Accept: application/json'
            ],
            CURLOPT_TIMEOUT => 10
        ]);
        
        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        
        if ($httpCode === 200) {
            $userData = json_decode($response, true);
            if (isset($userData['id'])) {
                return \IPS\Member::load($userData['id']);
            }
        }
        
        return null;
        
    } catch (Exception $e) {
        \IPS\Log::log($e, 'oauth_verification_error');
        return null;
    }
}

/**
 * Build standardized user data from an IPS member object
 */
function buildUserData($member) {
    return [
        'id' => $member->member_id,
        'name' => $member->name,
        'display_name' => $member->displayName(),
        'email' => $member->email,
        'avatar' => (string) $member->photo,
        'profile_url' => (string) $member->url(),
        'group_id' => $member->member_group_id,
        'group_name' => $member->group['g_title'] ?? 'Member',
        'joined' => $member->joined->getTimestamp(),
        'last_visit' => $member->last_visit ? $member->last_visit->getTimestamp() : null,
        'posts' => $member->member_posts,
        'reputation' => $member->pp_reputation_points,
        'is_online' => $member->isOnline(),
        'permissions' => [
            'can_post' => $member->canAccessModule(\IPS\Application\Module::get('forums', 'forums')),
            'is_admin' => $member->isAdmin(),
            'is_moderator' => $member->modPermission(),
        ]
    ];
}

/**
 * Format and output the response
 */
function outputResponse($response) {
    global $callback, $isJsonp;
    
    // Output response (JSON or JSONP)
    $jsonResponse = json_encode($response, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

    if ($isJsonp) {
        // JSONP response
        echo $callback . '(' . $jsonResponse . ');';
    } else {
        // Regular JSON response
        echo $jsonResponse;
    }
    exit;
}
?>
