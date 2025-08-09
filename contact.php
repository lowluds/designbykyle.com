<?php
/**
 * Contact Form Handler
 * Kyle L. Portfolio Website
 */

// Security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Configuration
$config = [
    'to_email' => 'kyle@designbykyle.com',
    'from_email' => 'noreply@designbykyle.com',
    'subject_prefix' => '[Portfolio Contact] ',
    'rate_limit' => 5, // Max 5 submissions per hour per IP
    'max_message_length' => 1000
];

// Rate limiting
session_start();
$ip = $_SERVER['REMOTE_ADDR'];
$current_time = time();
$rate_limit_key = 'contact_submissions_' . md5($ip);

if (!isset($_SESSION[$rate_limit_key])) {
    $_SESSION[$rate_limit_key] = [];
}

// Clean old submissions (older than 1 hour)
$_SESSION[$rate_limit_key] = array_filter($_SESSION[$rate_limit_key], function($timestamp) use ($current_time) {
    return ($current_time - $timestamp) < 3600;
});

// Check rate limit
if (count($_SESSION[$rate_limit_key]) >= $config['rate_limit']) {
    http_response_code(429);
    echo json_encode([
        'success' => false, 
        'message' => 'Too many requests. Please try again later.'
    ]);
    exit;
}

// Validate and sanitize input
$errors = [];
$data = [];

// Required fields
$required_fields = ['name', 'email', 'subject', 'message'];

foreach ($required_fields as $field) {
    if (!isset($_POST[$field]) || empty(trim($_POST[$field]))) {
        $errors[] = ucfirst($field) . ' is required';
    } else {
        $data[$field] = trim($_POST[$field]);
    }
}

// Validate email
if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Please enter a valid email address';
}

// Validate message length
if (!empty($data['message']) && strlen($data['message']) > $config['max_message_length']) {
    $errors[] = 'Message is too long (max ' . $config['max_message_length'] . ' characters)';
}

// Basic spam detection
$spam_patterns = [
    '/\b(viagra|cialis|pharmacy|casino|poker|loan|mortgage|debt|crypto|bitcoin)\b/i',
    '/\b(click here|visit now|act now|limited time|make money|work from home)\b/i',
    '/(https?:\/\/[^\s]+){3,}/', // Multiple URLs
    '/[A-Z]{10,}/', // Excessive caps
];

foreach ($spam_patterns as $pattern) {
    if (preg_match($pattern, $data['message'] ?? '')) {
        $errors[] = 'Message appears to be spam';
        break;
    }
}

// Honeypot field (hidden field that should be empty)
if (!empty($_POST['website'])) {
    $errors[] = 'Spam detected';
}

// If there are errors, return them
if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Validation failed',
        'errors' => $errors
    ]);
    exit;
}

// Sanitize data
$name = htmlspecialchars($data['name'], ENT_QUOTES, 'UTF-8');
$email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
$subject = htmlspecialchars($data['subject'], ENT_QUOTES, 'UTF-8');
$message = htmlspecialchars($data['message'], ENT_QUOTES, 'UTF-8');

// Prepare email
$to = $config['to_email'];
$email_subject = $config['subject_prefix'] . $subject;

// Email headers
$headers = [
    'From: ' . $config['from_email'],
    'Reply-To: ' . $email,
    'X-Mailer: PHP/' . phpversion(),
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8'
];

// Email body (HTML format)
$email_body = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #555; }
        .value { background: white; padding: 10px; border-radius: 3px; border-left: 3px solid #3b82f6; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>New Contact Form Submission</h2>
        </div>
        <div class='content'>
            <div class='field'>
                <div class='label'>Name:</div>
                <div class='value'>{$name}</div>
            </div>
            <div class='field'>
                <div class='label'>Email:</div>
                <div class='value'>{$email}</div>
            </div>
            <div class='field'>
                <div class='label'>Subject:</div>
                <div class='value'>{$subject}</div>
            </div>
            <div class='field'>
                <div class='label'>Message:</div>
                <div class='value'>" . nl2br($message) . "</div>
            </div>
            <div class='field'>
                <div class='label'>Submitted:</div>
                <div class='value'>" . date('Y-m-d H:i:s') . "</div>
            </div>
            <div class='field'>
                <div class='label'>IP Address:</div>
                <div class='value'>{$ip}</div>
            </div>
        </div>
        <div class='footer'>
            <p>This email was sent from the contact form on designbykyle.com</p>
        </div>
    </div>
</body>
</html>
";

// Send email
$mail_sent = mail($to, $email_subject, $email_body, implode("\r\n", $headers));

if ($mail_sent) {
    // Add to rate limiting
    $_SESSION[$rate_limit_key][] = $current_time;
    
    // Log successful submission (optional)
    error_log("Contact form submission from: {$email} - Subject: {$subject}");
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Thank you for your message! I\'ll get back to you soon.'
    ]);
} else {
    // Log error
    error_log("Failed to send contact form email from: {$email}");
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Sorry, there was an error sending your message. Please try again later.'
    ]);
}

// Auto-responder (optional)
if ($mail_sent && !empty($email)) {
    $auto_subject = 'Thank you for contacting Kyle L.';
    $auto_message = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .highlight { color: #3b82f6; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>Thank You for Your Message!</h2>
            </div>
            <div class='content'>
                <p>Hi <span class='highlight'>{$name}</span>,</p>
                
                <p>Thank you for reaching out! I've received your message about <strong>\"{$subject}\"</strong> and I'll get back to you within 24 hours.</p>
                
                <p>In the meantime, feel free to:</p>
                <ul>
                    <li>Check out my latest work on <a href='https://designbykyle.com#portfolio'>my portfolio</a></li>
                    <li>Connect with me on <a href='#'>LinkedIn</a></li>
                    <li>Follow my code on <a href='#'>GitHub</a></li>
                </ul>
                
                <p>Looking forward to discussing your project!</p>
                
                <p>Best regards,<br>
                <strong>Kyle L.</strong><br>
                Frontend Developer & UI Designer</p>
            </div>
            <div class='footer'>
                <p>This is an automated response. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    $auto_headers = [
        'From: ' . $config['from_email'],
        'X-Mailer: PHP/' . phpversion(),
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8'
    ];
    
    mail($email, $auto_subject, $auto_message, implode("\r\n", $auto_headers));
}
?>

