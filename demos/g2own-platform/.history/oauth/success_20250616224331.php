<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OAuth Success - G2Own</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .success-container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            text-align: center;
            max-width: 500px;
            width: 90%;
        }
        
        .success-icon {
            width: 80px;
            height: 80px;
            background: #28a745;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0 auto 20px;
            color: white;
            font-size: 40px;
        }
        
        .success-title {
            color: #333;
            margin-bottom: 15px;
            font-size: 28px;
            font-weight: 600;
        }
        
        .success-message {
            color: #666;
            margin-bottom: 30px;
            font-size: 16px;
            line-height: 1.5;
        }
        
        .user-info {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            text-align: left;
        }
        
        .user-info h3 {
            margin: 0 0 15px 0;
            color: #333;
            font-size: 18px;
        }
        
        .user-detail {
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .user-detail:last-child {
            margin-bottom: 0;
        }
        
        .user-detail label {
            font-weight: 600;
            color: #555;
        }
        
        .user-detail span {
            color: #333;
        }
        
        .user-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            margin: 0 auto 15px;
            display: block;
            border: 3px solid #28a745;
        }
        
        .actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-block;
        }
        
        .btn-primary {
            background: #007bff;
            color: white;
        }
        
        .btn-primary:hover {
            background: #0056b3;
            transform: translateY(-2px);
        }
        
        .btn-secondary {
            background: #6c757d;
            color: white;
        }
        
        .btn-secondary:hover {
            background: #545b62;
            transform: translateY(-2px);
        }
        
        .loading {
            display: none;
            margin-top: 20px;
        }
        
        .loading-text {
            color: #666;
            font-style: italic;
        }
        
        .error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 20px;
        }
        
        .countdown {
            margin-top: 20px;
            color: #666;
            font-size: 14px;
        }
        
        @media (max-width: 480px) {
            .success-container {
                padding: 30px 20px;
                margin: 20px;
            }
            
            .actions {
                flex-direction: column;
            }
            
            .btn {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="success-container">
        <div class="success-icon">✓</div>
        <h1 class="success-title">Login Successful!</h1>
        <p class="success-message">You have successfully authenticated with your G2Own Community account.</p>
        
        <?php
        session_start();
        
        // Check if we have OAuth data
        if (isset($_SESSION['oauth_user']) && isset($_SESSION['oauth_token'])) {
            $user = $_SESSION['oauth_user'];
            $tokenExpiry = $_SESSION['oauth_expires'] ?? 0;
            
            echo '<div class="user-info">';
            echo '<h3>Account Information</h3>';
            
            // User avatar if available
            if (isset($user['photoUrl']) && !empty($user['photoUrl'])) {
                echo '<img src="' . htmlspecialchars($user['photoUrl']) . '" alt="Avatar" class="user-avatar">';
            }
            
            // User details
            if (isset($user['name'])) {
                echo '<div class="user-detail">';
                echo '<label>Name:</label>';
                echo '<span>' . htmlspecialchars($user['name']) . '</span>';
                echo '</div>';
            }
            
            if (isset($user['email'])) {
                echo '<div class="user-detail">';
                echo '<label>Email:</label>';
                echo '<span>' . htmlspecialchars($user['email']) . '</span>';
                echo '</div>';
            }
              if (isset($user['id'])) {
                echo '<div class="user-detail">';
                echo '<label>User ID:</label>';
                echo '<span>' . htmlspecialchars($user['id']) . '</span>';
                echo '</div>';
            }
            
            // Show commerce data if available
            if (isset($user['purchase_count'])) {
                echo '<div class="user-detail">';
                echo '<label>Purchases:</label>';
                echo '<span>' . htmlspecialchars($user['purchase_count']) . ' items</span>';
                echo '</div>';
            }
            
            if (isset($user['invoice_count'])) {
                echo '<div class="user-detail">';
                echo '<label>Invoices:</label>';
                echo '<span>' . htmlspecialchars($user['invoice_count']) . ' items</span>';
                echo '</div>';
            }
            
            if (isset($user['transaction_count'])) {
                echo '<div class="user-detail">';
                echo '<label>Transactions:</label>';
                echo '<span>' . htmlspecialchars($user['transaction_count']) . ' items</span>';
                echo '</div>';
            }
            
            if ($tokenExpiry > 0) {
                echo '<div class="user-detail">';
                echo '<label>Session Expires:</label>';
                echo '<span>' . date('Y-m-d H:i:s', $tokenExpiry) . '</span>';
                echo '</div>';
            }
            
            echo '</div>';
            
            // Store data in localStorage via JavaScript
            echo '<script>';
            echo 'localStorage.setItem("g2own_oauth_token", ' . json_encode($_SESSION['oauth_token']) . ');';
            echo 'localStorage.setItem("g2own_user_data", ' . json_encode(json_encode($user)) . ');';
            echo 'localStorage.setItem("g2own_token_expiry", ' . json_encode($tokenExpiry * 1000) . ');';
            echo '</script>';
        } else {
            echo '<div class="error">';
            echo 'Session data not found. You may need to log in again.';
            echo '</div>';
        }
        ?>
        
        <div class="actions">
            <a href="/" class="btn btn-primary" id="return-home">Return to G2Own</a>
            <a href="/community/" class="btn btn-secondary">Visit Community</a>
        </div>
        
        <div class="loading" id="loading">
            <div class="loading-text">Redirecting you back to the main site...</div>
        </div>
        
        <div class="countdown" id="countdown">
            Automatically redirecting in <span id="counter">5</span> seconds...
        </div>
    </div>
    
    <script>
        // Auto-redirect functionality
        let countdown = 5;
        const counterElement = document.getElementById('counter');
        const countdownElement = document.getElementById('countdown');
        const loadingElement = document.getElementById('loading');
        
        function updateCountdown() {
            counterElement.textContent = countdown;
            countdown--;
            
            if (countdown < 0) {
                // Show loading
                countdownElement.style.display = 'none';
                loadingElement.style.display = 'block';
                
                // Redirect after a short delay
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            }
        }
        
        // Start countdown
        const countdownInterval = setInterval(updateCountdown, 1000);
        
        // Manual return home button
        document.getElementById('return-home').addEventListener('click', function(e) {
            e.preventDefault();
            clearInterval(countdownInterval);
            
            countdownElement.style.display = 'none';
            loadingElement.style.display = 'block';
            
            // Small delay to show loading state
            setTimeout(() => {
                window.location.href = '/';
            }, 500);
        });
        
        // Handle OAuth state change for parent window
        window.addEventListener('load', function() {
            // Notify parent window if this is opened in a popup
            if (window.opener) {
                try {
                    window.opener.postMessage({
                        type: 'oauth_success',
                        data: {
                            token: localStorage.getItem('g2own_oauth_token'),
                            user: JSON.parse(localStorage.getItem('g2own_user_data') || '{}'),
                            expiry: localStorage.getItem('g2own_token_expiry')
                        }
                    }, window.location.origin);
                } catch (e) {
                    console.log('Could not notify parent window:', e);
                }
            }
            
            // Trigger storage event for same-origin windows
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'g2own_oauth_token',
                newValue: localStorage.getItem('g2own_oauth_token'),
                url: window.location.href
            }));
        });
        
        // Clear session data from server (optional cleanup)
        <?php
        if (isset($_SESSION['oauth_user'])) {
            // Clear server-side session data
            unset($_SESSION['oauth_user']);
            unset($_SESSION['oauth_token']);
            unset($_SESSION['oauth_expires']);
        }
        ?>
        
        // Debug information (remove in production)
        console.log('OAuth Success Page Loaded');
        console.log('Token stored:', !!localStorage.getItem('g2own_oauth_token'));
        console.log('User data stored:', !!localStorage.getItem('g2own_user_data'));
    </script>
</body>
</html>
