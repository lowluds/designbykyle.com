# Google Analytics 4 Setup Guide for G2Own

## 🎯 Overview
This guide will help you set up Google Analytics 4 (GA4) for comprehensive tracking of your G2Own homepage and integration with Invision Community analytics.

## 📋 Prerequisites
- Google account with access to Google Analytics
- Admin access to G2Own website files
- Understanding of your Invision Community analytics setup

## 🔧 Step 1: Create GA4 Property

### 1.1 Access Google Analytics
1. Go to [Google Analytics](https://analytics.google.com)
2. Sign in with your Google account
3. Click "Start measuring" or "Create Account"

### 1.2 Set Up Account Structure
```
Account Name: G2Own Digital Marketplace
Property Name: G2Own Homepage
Industry Category: Internet & Telecom > Online Communities
Business Size: Select appropriate size
```

### 1.3 Configure Property Settings
- **Property Name**: G2Own Homepage
- **Reporting Time Zone**: Your business timezone
- **Currency**: USD (or your preferred currency)
- **Data Stream**: Web
- **Website URL**: https://g2own.com
- **Stream Name**: G2Own Main Website

## 🔑 Step 2: Get Your Measurement ID

After creating the property, you'll receive a **Measurement ID** that looks like:
```
G-XXXXXXXXXX
```

**Important**: Copy this ID - you'll need it for configuration.

## ⚙️ Step 3: Configure Analytics Code

### 3.1 Update Analytics Configuration
1. Open `assets/js/analytics.js`
2. Find this line:
```javascript
measurementId: 'G-XXXXXXXXXX', // TODO: Replace with real GA4 ID
```
3. Replace `'G-XXXXXXXXXX'` with your actual Measurement ID:
```javascript
measurementId: 'G-ABC123DEF4', // Your actual GA4 ID
```

### 3.2 Enable Google Signals (Optional)
If you want Google Ads integration and enhanced demographics:
```javascript
allow_google_signals: true, // Change from false to true
```

## 📊 Step 4: Set Up Enhanced E-commerce (For Future Store Integration)

### 4.1 Enable E-commerce in GA4
1. In GA4, go to **Admin** → **Events**
2. Click **Create event** for each of these:
   - `add_to_cart`
   - `begin_checkout`
   - `purchase`
   - `view_item`
   - `select_content`

### 4.2 Configure Custom Dimensions
In GA4 Admin → Custom Definitions → Create custom dimensions:

| Dimension Name | Parameter | Scope |
|----------------|-----------|-------|
| User Type | user_type | User |
| Community Member | community_member | User |
| Homepage Section | homepage_section | Event |
| Category Type | category_type | Event |
| Auth Provider | auth_provider | Event |

## 🎯 Step 5: Set Up Conversion Goals

### 5.1 Primary Conversions
Mark these events as conversions in GA4:
- `user_authentication` (when users log in)
- `community_visit` (when users visit Invision Community)
- `store_visit` (when users visit the store)
- `category_click` (engagement with product categories)

### 5.2 Micro-Conversions
Track engagement with:
- `scroll_depth` (90% scroll depth)
- `time_on_page` (>2 minutes)
- `sidebar_click` (floating sidebar usage)

## 🔒 Step 6: Privacy & GDPR Compliance

### 6.1 Data Retention Settings
1. Go to **Admin** → **Data Settings** → **Data Retention**
2. Set to **14 months** (recommended for business use)
3. Enable **Reset user data on new activity**

### 6.2 Consent Mode Configuration
The analytics are already configured for GDPR compliance:
- Users see consent banner
- Analytics only initialize after consent
- IP anonymization enabled
- No personal data collected without consent

### 6.3 Privacy Policy Updates
Add this section to your privacy policy:
```
Analytics Data Collection:
We use Google Analytics to understand how visitors use our website. 
This includes anonymous data about page views, user interactions, 
and general demographics. You can opt out of analytics tracking 
at any time through our consent preferences.
```

## 🔗 Step 7: Invision Community Integration

### 7.1 Cross-Domain Tracking (If Needed)
If your Invision Community is on a different subdomain:
```javascript
// In analytics.js, add to GA4 config:
gtag('config', GA4_CONFIG.measurementId, {
    // ...existing config...
    linker: {
        domains: ['g2own.com', 'community.g2own.com']
    }
});
```

### 7.2 Invision Analytics Coordination
1. **Avoid Duplicate Tracking**: Ensure Invision's analytics don't conflict
2. **Share User IDs**: If possible, sync user identifiers between systems
3. **Segment Traffic**: Use custom dimensions to identify homepage vs community traffic

## 📈 Step 8: Verification & Testing

### 8.1 Real-Time Testing
1. Open GA4 **Real-time** report
2. Visit your homepage
3. Verify events are appearing:
   - `page_view`
   - `first_visit` (for new users)
   - Custom events as you interact

### 8.2 Debug Mode
For testing, open browser console and check for:
```
GA4: Initialized successfully
Analytics Event: category_click {category_name: "PC Games", ...}
```

### 8.3 Google Analytics Debugger
Install [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger) Chrome extension for detailed debugging.

## 📊 Expected Analytics Data

### 📈 Key Metrics You'll Track
- **Homepage Performance**:
  - Page views and unique visitors
  - Bounce rate and session duration
  - Most viewed sections
  - Mobile vs desktop usage

- **User Journey**:
  - Homepage → Community conversion rate
  - Category engagement rates
  - Authentication success rates
  - Navigation pattern analysis

- **Engagement Metrics**:
  - Scroll depth distribution
  - Time spent on homepage
  - Sidebar interaction rates
  - Search usage patterns

- **Conversion Tracking**:
  - User registrations from homepage
  - Store visits generated
  - Community engagement rates
  - Support ticket sources

### 📊 Custom Reports You Can Build
1. **Homepage Performance Dashboard**
2. **User Acquisition Sources**
3. **Category Popularity Analysis**
4. **Mobile vs Desktop Behavior**
5. **Conversion Funnel Analysis**

## 🚀 Advanced Features (Optional)

### Server-Side Tracking
For enhanced accuracy and privacy:
- Set up GA4 Measurement Protocol
- Track server-side events (purchases, registrations)
- Reduce client-side tracking dependencies

### BigQuery Integration
For advanced analysis:
- Enable BigQuery export in GA4
- Create custom dashboards
- Perform advanced user journey analysis

### Google Ads Integration
For marketing optimization:
- Link GA4 to Google Ads
- Create remarketing audiences
- Track ad performance to homepage conversions

## 🔧 Troubleshooting

### Common Issues
1. **No data appearing**: Check Measurement ID in analytics.js
2. **Events not tracking**: Open browser console for error messages
3. **Consent banner not showing**: Check localStorage for 'analytics_consent'
4. **Real-time data missing**: Verify GA4 configuration and network connectivity

### Support Resources
- [GA4 Help Center](https://support.google.com/analytics/answer/9304153)
- [GA4 Setup Assistant](https://support.google.com/analytics/answer/9744165)
- [Enhanced E-commerce Guide](https://support.google.com/analytics/answer/9267735)

## ✅ Launch Checklist

Before going live:
- [ ] GA4 property created and configured
- [ ] Measurement ID updated in analytics.js
- [ ] Custom dimensions configured
- [ ] Conversion goals set up
- [ ] Privacy policy updated
- [ ] Real-time testing completed
- [ ] Team trained on GA4 interface
- [ ] Backup of old analytics data (if migrating)

Once configured, you'll have comprehensive insights into user behavior and can make data-driven decisions to optimize the G2Own homepage and improve conversion rates to your Invision Community!
