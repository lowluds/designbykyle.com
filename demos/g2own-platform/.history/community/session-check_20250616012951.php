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

// Set CORS headers for cross-domain requests
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

try {
    // Initialize Invision Community framework
    require_once 'init.php';
    
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
        
        // Get CSRF token for secure requests
        if (isset(\IPS\Request::i()->csrfKey)) {
            $response['csrf_token'] = \IPS\Request::i()->csrfKey;
        }
        
        // Prepare user data (sanitized for frontend)
        $response['user'] = [
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
        
        // Add custom profile fields if needed
        if ($member->profileFields()) {
            $customFields = [];
            foreach ($member->profileFields() as $field) {
                $customFields[$field->id] = $field->value;
            }
            $response['user']['custom_fields'] = $customFields;
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
}

// Output JSON response
echo json_encode($response, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
exit;
?>
