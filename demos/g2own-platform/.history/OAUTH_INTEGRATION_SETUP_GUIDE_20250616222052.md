# OAuth 2.0 Integration Setup Guide
## G2Own Invision Community Integration

This guide will help you configure the OAuth 2.0 integration between your G2Own frontend and Invision Community.

## 📁 Files Created

### JavaScript Files (Frontend)
- `assets/js/oauth-config.js` - OAuth configuration settings
- `assets/js/oauth-integration.js` - Main OAuth authentication class
- `assets/js/cart-oauth-integration.js` - Cart integration with OAuth
- `assets/js/product-display-oauth.js` - Product display with user-specific features
- `assets/js/oauth-manager.js` - Coordinator for all OAuth integrations
- `assets/js/oauth-testing.js` - Testing panel for OAuth functionality

### PHP Files (Backend)
- `oauth/callback.php` - OAuth callback handler and token exchange
- `oauth/success.php` - OAuth success page with session management
- `oauth/.htaccess` - Security and clean URL configuration

### HTML Updates
- Updated button IDs in `index.html` for OAuth integration
- Added OAuth script includes

## 🔧 Configuration Steps

### 1. Invision Community OAuth Client Setup

1. **Access your Invision Community Admin Panel**
   - Go to `https://g2own.com/community/admin/`
   - Navigate to: **System** → **Settings** → **Login & Registration** → **OAuth**

2. **Create OAuth Client**
   - Click "Create New" OAuth Client
   - Fill in the details:
     ```
     Client Name: G2Own Frontend
     Client Type: Confidential
     Redirect URIs: https://g2own.com/oauth/callback.php
     Scopes: profile email commerce
     ```
   - Save the client and note down:
     - **Client ID** (public)
     - **Client Secret** (keep secure)

### 2. Update Configuration Files

#### A. Update `oauth/callback.php`
Replace these lines in `oauth/callback.php`:
```php
'client_id' => 'your_client_id_here', // Replace with actual client ID
'client_secret' => 'your_client_secret_here', // Replace with actual client secret
```

With your actual values:
```php
'client_id' => 'YOUR_ACTUAL_CLIENT_ID',
'client_secret' => 'YOUR_ACTUAL_CLIENT_SECRET',
```

#### B. Update `assets/js/oauth-config.js`
Replace this line in `oauth-config.js`:
```javascript
id: 'your_client_id_here', // Replace with actual client ID
```

With your actual client ID:
```javascript
id: 'YOUR_ACTUAL_CLIENT_ID',
```

### 3. Server Requirements

#### PHP Requirements
- PHP 7.4 or higher
- `file_get_contents()` enabled
- `json_decode()` / `json_encode()` functions
- OpenSSL extension for HTTPS requests

#### Apache/Server Configuration
- Ensure `.htaccess` files are processed (if using Apache)
- HTTPS enabled (required for OAuth)
- Error logging enabled for debugging

### 4. Test the Integration

#### A. Enable Test Mode
In `assets/js/oauth-config.js`, set:
```javascript
debug: {
    enabled: true,
    testMode: true // This enables the test panel
}
```

#### B. Test OAuth Flow
1. Open your website
2. Look for the OAuth testing panel (appears automatically in test mode)
3. Click "Test Login" to start OAuth flow
4. Complete authentication in Invision Community
5. Verify successful return and token storage

#### C. Test Cart Integration
1. Make sure you're logged in via OAuth
2. Use the test panel to test "Add to Cart" functionality
3. Verify cart loads and updates correctly

### 5. Production Deployment

#### A. Disable Test Mode
In `assets/js/oauth-config.js`, set:
```javascript
debug: {
    enabled: false, // Disable logging in production
    testMode: false // Hide test panel
}
```

#### B. Security Checklist
- [ ] Client secret is only in server-side PHP, never in JavaScript
- [ ] HTTPS is enabled on all URLs
- [ ] Error logging is configured but not publicly accessible
- [ ] `.htaccess` security headers are in place
- [ ] OAuth redirect URI exactly matches registered URI

#### C. Performance Optimizations
- [ ] Enable gzip compression
- [ ] Set appropriate cache headers
- [ ] Minify JavaScript files for production
- [ ] Monitor error logs for issues

## 🔍 Testing Scenarios

### Basic Authentication
1. **Login Flow**
   - Click login button → redirects to community → returns with token
   - User data is fetched and stored
   - UI updates to show logged-in state

2. **Logout Flow**
   - Click logout → clears local session
   - UI updates to show logged-out state

### Cart Integration
1. **Add to Cart (Authenticated)**
   - User logged in → can add items to cart
   - Items sync with Invision Community cart

2. **Add to Cart (Unauthenticated)**
   - User not logged in → prompted to log in
   - After login → can add items

### Product Display
1. **Favorites**
   - Logged-in users can favorite/unfavorite products
   - Favorites sync with community

2. **Purchase History**
   - Shows owned products
   - Enables review functionality for purchased items

## 🐛 Troubleshooting

### Common Issues

#### "Invalid Client" Error
- Check client ID matches exactly
- Verify redirect URI matches exactly (including https://)
- Ensure client is active in Invision Community

#### "CORS Errors"
- Verify domains match between frontend and community
- Check CORS headers in `oauth/callback.php`
- Ensure HTTPS is used consistently

#### "Token Exchange Failed"
- Check client secret is correct in `oauth/callback.php`
- Verify network connectivity to community
- Check PHP error logs for detailed errors

#### "User Data Not Loading"
- Verify API endpoint URLs in configuration
- Check community API permissions
- Ensure user has necessary permissions

### Debug Tools

#### Browser Console
- All OAuth operations are logged when debug mode is enabled
- Check for JavaScript errors and network failures

#### OAuth Test Panel
- Use the test panel to manually test each component
- Check API responses and authentication status
- Test cart and product operations

#### Server Logs
- Check PHP error logs for backend issues
- Monitor network requests to community
- Verify token exchange responses

## 📚 API Reference

### Frontend JavaScript Classes

#### OAuthIntegration
- `login()` - Start OAuth login flow
- `logout()` - Logout and clear session
- `isUserAuthenticated()` - Check auth status
- `getUserData()` - Get current user data
- `makeAuthenticatedRequest(url, options)` - Make API requests

#### CartOAuthIntegration
- `addToCart(productId, quantity)` - Add item to cart
- `removeFromCart(itemId)` - Remove item from cart
- `loadCart()` - Load cart from community
- `getCart()` - Get current cart data

#### ProductDisplayOAuth
- `toggleFavorite(productId)` - Toggle product favorite
- `loadProducts()` - Load products from community
- `loadUserData()` - Load user-specific data

### Backend PHP Endpoints

#### `oauth/callback.php`
- **GET**: Handle OAuth redirect with authorization code
- **POST**: Exchange authorization code for access token

#### `oauth/success.php`
- Display success page and transfer session to frontend

## 🔒 Security Considerations

### Client Secret Protection
- Never expose client secret in frontend JavaScript
- Store only in server-side PHP files
- Use environment variables in production

### State Parameter
- Always verify state parameter to prevent CSRF
- Use cryptographically secure random values
- Implement proper state storage/verification

### Token Storage
- Frontend tokens stored in localStorage (consider security implications)
- Server-side session data cleared after transfer
- Implement token refresh if supported

### HTTPS Requirements
- OAuth requires HTTPS for all URLs
- Redirect URIs must use HTTPS
- API calls must use HTTPS

## 📞 Support

If you encounter issues:

1. **Check Debug Logs**: Enable debug mode and check browser console
2. **Verify Configuration**: Double-check all client IDs, secrets, and URLs
3. **Test Components**: Use the OAuth test panel to isolate issues
4. **Check Community Settings**: Verify OAuth client configuration in Invision Community

## 🚀 Next Steps

After successful integration:

1. **Customize UI**: Update styles to match your brand
2. **Add Features**: Implement additional OAuth scopes if needed
3. **Monitor Usage**: Set up analytics for OAuth conversion
4. **Optimize Performance**: Implement caching strategies
5. **User Experience**: Add loading states and error handling

---

**Integration Complete!** 🎉

Your G2Own frontend is now integrated with Invision Community OAuth 2.0. Users can seamlessly log in, access their cart, and enjoy personalized features across both platforms.
