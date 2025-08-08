<?php
/**
 * G2Own Session Check Endpoint
 * Cross-domain authentication bridge for Invision Community
 * 
 * This file should be placed in your Invision Community directory
 * Example: /path/to/invision/community/session-check.php
 */

// Prevent direct access
if (!defined('SESSION_CHECK_ALLOWED')) {
    define('SESSION_CHECK_ALLOWED', true);
}

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
    
    // Handle different request types
    $requestMethod = $_SERVER['REQUEST_METHOD'];
    $requestData = null;
    
    if ($requestMethod === 'POST') {
        // Get POST data
        $input = file_get_contents('php://input');
        $requestData = json_decode($input, true);
        
        // Handle different POST actions
        if (isset($requestData['action'])) {
            switch ($requestData['action']) {
                case 'sync_oauth':
                    handleOAuthSync($requestData);
                    break;
                case 'clear_session':
                    handleClearSession();
                    break;
                default:
                    // Default behavior - check session
                    break;
            }
        }
    }
    
    // Default session check behavior
    checkCurrentSession();
    
} catch (\Exception $e) {
    // Handle errors gracefully
    $response = [
        'success' => false,
        'authenticated' => false,
        'error' => 'Session check failed',
        'message' => $e->getMessage(),
        'timestamp' => time()
    ];
    
    // Log the error
    \IPS\Log::log($e, 'auth_bridge_error');
    
    http_response_code(500);
    outputResponse($response);
}

function handleOAuthSync($data) {
    global $response;
    
    try {
        // Validate OAuth token and user data
        if (!isset($data['oauth_token']) || !isset($data['user_id'])) {
            throw new Exception('Missing OAuth data');
        }
        
        // Verify OAuth token with community API
        $member = verifyOAuthToken($data['oauth_token']);
        
        if ($member && $member->member_id == $data['user_id']) {
            // OAuth token is valid, sync session data
            $_SESSION['oauth_user_id'] = $data['user_id'];
            $_SESSION['oauth_token'] = $data['oauth_token'];
            $_SESSION['oauth_sync_time'] = time();
            
            $response = [
                'success' => true,
                'authenticated' => true,
                'synced' => true,
                'user' => buildUserData($member),
                'session_id' => session_id(),
                'csrf_token' => \IPS\Request::i()->csrfKey ?? null,
                'timestamp' => time()
            ];
            
            \IPS\Log::debug("OAuth session sync successful for user: " . $member->name, 'auth_bridge');
        } else {
            throw new Exception('Invalid OAuth token or user mismatch');
        }
        
    } catch (Exception $e) {
        $response = [
            'success' => false,
            'authenticated' => false,
            'error' => 'OAuth sync failed',
            'message' => $e->getMessage(),
            'timestamp' => time()
        ];
    }
    
    outputResponse($response);
}

function handleClearSession() {
    global $response;
    
    try {
        // Clear OAuth session data
        unset($_SESSION['oauth_user_id']);
        unset($_SESSION['oauth_token']);
        unset($_SESSION['oauth_sync_time']);
        
        // Optionally log out the user from Invision Community
        // \IPS\Member::loggedIn()->logOut();
        
        $response = [
            'success' => true,
            'authenticated' => false,
            'cleared' => true,
            'timestamp' => time()
        ];
        
        \IPS\Log::debug("Session cleared successfully", 'auth_bridge');
        
    } catch (Exception $e) {
        $response = [
            'success' => false,
            'error' => 'Session clear failed',
            'message' => $e->getMessage(),
            'timestamp' => time()
        ];
    }
    
    outputResponse($response);
}

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

function checkCurrentSession() {
    global $response;
    
    // Check if user is logged in
    $response = [
        'success' => false,
        'authenticated' => false,
        'user' => null,
        'session_id' => null,
        'csrf_token' => null,
        'timestamp' => time()
    ];
    
    // Get current member
    $member = \IPS\Member::loggedIn();
    
    if ($member->member_id) {
        // User is authenticated
        $response['success'] = true;
        $response['authenticated'] = true;
        $response['session_id'] = session_id();
        $response['user'] = buildUserData($member);
        
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
        
        // Check if there's a guest session with cart data
        if (isset($_SESSION['guest_cart']) && !empty($_SESSION['guest_cart'])) {
            $response['guest_data'] = [
                'cart_items' => count($_SESSION['guest_cart']),
                'has_cart' => true
            ];
        }
    }
    
    outputResponse($response);
}

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
