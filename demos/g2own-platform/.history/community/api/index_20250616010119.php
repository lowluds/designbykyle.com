<?php
/**
 * G2Own API Bridge
 * Proxies requests to the Invision Community backend at https://g2own.com/community/
 * This handles CORS issues and provides a unified API interface
 */

// Enable CORS for your frontend (more secure configuration)
$allowed_origins = [
    'http://localhost',
    'http://127.0.0.1',
    'https://yourdomain.com', // Replace with your actual domain
    'file://' // For local file access
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins) || strpos($origin, 'localhost') !== false || strpos($origin, '127.0.0.1') !== false) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-API-Key');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuration
$BACKEND_URL = 'https://g2own.com/community/api';

// API Key - Add your Invision Community API key here
// To get an API key: AdminCP > System > REST API > Create API Key
$API_KEY = ''; // TODO: Add your IC API key here

// Debug mode (set to false in production)
$DEBUG_MODE = (strpos($_SERVER['HTTP_HOST'], 'localhost') !== false || strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false);

// Get the request method and path
$method = $_SERVER['REQUEST_METHOD'];
$request_path = $_SERVER['REQUEST_URI'];

// Remove the local API path prefix to get the actual endpoint
$api_path = str_replace('/community/api/', '', $request_path);
if (empty($api_path)) {
    $api_path = '';
}

// Build the full backend URL
$backend_url = $BACKEND_URL . '/' . ltrim($api_path, '/');

// Get request headers
$headers = [];
foreach (getallheaders() as $name => $value) {
    // Forward important headers
    if (in_array(strtolower($name), ['authorization', 'content-type', 'accept', 'user-agent'])) {
        $headers[] = "$name: $value";
    }
}

// Add API key if configured
if (!empty($API_KEY)) {
    $headers[] = "Authorization: Bearer $API_KEY";
}

// Get request body for POST/PUT requests
$input_data = '';
if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
    $input_data = file_get_contents('php://input');
}

// Initialize cURL
$ch = curl_init();

// Set cURL options
curl_setopt_array($ch, [
    CURLOPT_URL => $backend_url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_CUSTOMREQUEST => $method,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_USERAGENT => 'G2Own-API-Bridge/1.0'
]);

// Add request body if needed
if (!empty($input_data)) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $input_data);
}

// Execute the request
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

curl_close($ch);

// Handle cURL errors
if ($error) {
    $error_response = [
        'error' => 'API Bridge Error',
        'message' => $error,
        'endpoint' => $backend_url,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    if ($DEBUG_MODE) {
        $error_response['debug'] = [
            'method' => $method,
            'headers' => $headers,
            'input_data_length' => strlen($input_data)
        ];
    }
    
    http_response_code(500);
    echo json_encode($error_response, JSON_PRETTY_PRINT);
    error_log("G2Own API Bridge Error: $error for $backend_url");
    exit();
}

// Handle non-200 responses with better error info
if ($http_code >= 400) {
    $error_response = json_decode($response, true);
    if (!$error_response) {
        $error_response = [
            'error' => 'Backend Error',
            'message' => "HTTP $http_code response from backend",
            'endpoint' => $backend_url
        ];
    }
    
    if ($DEBUG_MODE) {
        $error_response['debug'] = [
            'raw_response' => $response,
            'http_code' => $http_code
        ];
    }
}

// Return the response with the same HTTP status code
http_response_code($http_code);

// Try to decode and re-encode JSON to ensure proper formatting
$decoded = json_decode($response, true);
if (json_last_error() === JSON_ERROR_NONE) {
    echo json_encode($decoded, JSON_PRETTY_PRINT);
} else {
    // If not JSON, return as-is
    echo $response;
}

// Log the request for debugging (optional)
if (function_exists('error_log')) {
    error_log("G2Own API Bridge: $method $backend_url - Status: $http_code");
}
?>
