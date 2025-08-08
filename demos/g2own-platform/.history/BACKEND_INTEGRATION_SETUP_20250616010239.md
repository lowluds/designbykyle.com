# G2Own Backend Integration Configuration

## Overview
This project integrates with the Invision Community backend at `https://g2own.com/community/`. All navigation links, authentication, and content are connected through a local API bridge that handles CORS and provides a unified interface.

## File Structure
```
community/
└── api/
    ├── .htaccess           # URL rewriting and security
    └── index.php          # API proxy bridge

assets/js/
├── api-config.js          # Main API configuration class
└── navigation-controller.js # Navigation and UI logic

assets/css/
└── backend-integration.css # UI styles for search and navigation
```

## Configuration Steps

### 1. API Key Setup (Required for Production)
1. Login to your Invision Community Admin Panel
2. Go to `System > REST API > Create New Key`
3. Set permissions as needed for your application
4. Copy the API key
5. Edit `community/api/index.php` and add your key:
   ```php
   $API_KEY = 'your_api_key_here';
   ```

### 2. Domain Configuration
Edit the CORS configuration in `community/api/index.php`:
```php
$allowed_origins = [
    'https://yourdomain.com', // Replace with your actual domain
    'http://localhost',       // Keep for local development
    // Add other domains as needed
];
```

### 3. Backend URL Verification
Ensure the backend URL is correct in both:
- `assets/js/api-config.js` (line 11): `this.backendURL = 'https://g2own.com/community/api';`
- `assets/js/navigation-controller.js` (line 8): `this.backendBaseURL = 'https://g2own.com/community';`

## Navigation Link Mapping

### Main Navigation (Navbar)
- **Marketplace** → `https://g2own.com/community/forum/15-marketplace/`
- **Games** → `https://g2own.com/community/forum/10-games/`
- **Digital Goods** → `https://g2own.com/community/downloads/`
- **Support** → `https://g2own.com/community/forum/20-support/`

### Footer Links
- About → `/page/about/`
- Contact → `/contact/`
- Privacy → `/privacy/`
- Terms → `/terms/`
- Careers → `/careers/`
- Blog → `/blogs/`
- Help → `/help/`
- Community Guidelines → `/guidelines/`

## Authentication Flow

1. **Frontend Login**: User clicks login button
2. **API Bridge**: Request goes through local bridge at `/community/api/`
3. **Backend Auth**: Bridge forwards to `https://g2own.com/community/api/core/members/login`
4. **Token Storage**: JWT token stored in localStorage/sessionStorage
5. **Session Management**: Token included in subsequent requests

## API Endpoints Available

### Core Endpoints
- `/core/me` - Get current user info
- `/core/members/login` - User authentication
- `/core/members/register` - User registration
- `/core/search` - Site-wide search

### Content Endpoints
- `/forums/forums` - Forum listings
- `/forums/topics` - Forum topics
- `/downloads/files` - Digital downloads
- `/commerce/products` - Marketplace items

### User Endpoints
- `/core/notifications` - User notifications
- `/core/messages` - Private messages
- `/core/achievements` - User achievements

## Development vs Production

### Local Development
- API bridge automatically detects localhost
- Debug mode enabled with detailed error logging
- CORS allows all origins for testing

### Production Deployment
1. Set `$DEBUG_MODE = false` in `index.php`
2. Configure specific allowed origins
3. Add production API key
4. Enable HTTPS redirect if needed

## Testing the Integration

### 1. Basic Connectivity Test
Open browser console and run:
```javascript
// Test API connectivity
g2ownAPI.makeRequest('/core/system').then(console.log).catch(console.error);
```

### 2. Authentication Test
```javascript
// Test login (replace with actual credentials)
g2ownAPI.login('email@example.com', 'password').then(console.log);
```

### 3. Navigation Test
Click any navigation link to ensure it opens the correct backend URL.

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `Access-Control-Allow-Origin` headers
   - Verify domain is in allowed origins list
   - Ensure API bridge is accessible

2. **Authentication Failures**
   - Verify API key is correct
   - Check token storage in browser
   - Confirm backend endpoints are accessible

3. **Navigation Not Working**
   - Check browser console for JavaScript errors
   - Verify navigation controller is loaded
   - Confirm backend URLs are reachable

### Debug Mode
Enable debug mode by accessing the site from localhost. This provides:
- Detailed error messages
- Request/response logging
- Debug information in API responses

## Security Considerations

1. **API Key Protection**: Never expose API keys in frontend code
2. **CORS Configuration**: Restrict origins in production
3. **HTTPS**: Use HTTPS in production for secure token transmission
4. **Token Storage**: Consider token expiration and refresh logic

## Maintenance

### Regular Tasks
1. Monitor API bridge logs for errors
2. Update API endpoints as backend evolves
3. Refresh authentication tokens as needed
4. Test navigation links periodically

### Updates
When updating the Invision Community backend:
1. Test API compatibility
2. Update endpoint URLs if changed
3. Verify authentication flow still works
4. Update any new features or endpoints

## Support
For issues with this integration:
1. Check browser console for errors
2. Review API bridge logs
3. Test individual API endpoints
4. Verify backend connectivity and permissions

Last Updated: June 16, 2025
