<?php
/**
 * G2Own API Bridge
 * Proxies requests to the Invision Community backend at https://g2own.com/community/
 * This handles CORS issues and provides a unified API interface
 */

// Enable CORS for your frontend
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuration
$BACKEND_URL = 'https://g2own.com/community/api';
$API_KEY = ''; // Add your Invision Community API key here if needed

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
    http_response_code(500);
    echo json_encode([
        'error' => 'API Bridge Error',
        'message' => $error,
        'endpoint' => $backend_url
    ]);
    exit();
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
