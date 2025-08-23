# Migration Notes: Clean Demo URLs Implementation

## Overview
This migration implements clean, human-friendly URLs for demos and case studies on GitHub Pages, following the exact specifications provided.

## URL Structure

### Before Migration
```
/demos/asp-printing/index.html
/demos/g2own-platform/index.html  
/demos/hye/project/src/index.html
```

### After Migration
```
/demo/asp-printing/          # Clean demo URLs
/demo/g2own-platform/
/demo/hye-pilates/

/work/asp-printing/          # Case study pages
/work/g2own-platform/
/work/hye-pilates/
```

## Implementation Steps

### 1. Safety Restore Points
- ✅ Backup branch: `backup-[today]`
- ✅ Lightweight tag: `site-stable-[today]`
- ✅ Branch protection on master

### 2. Clean Demo Folders
- Copy production assets to `/demo/<slug>/`
- Fix relative URLs in each index.html
- Remove source map references
- Add `noindex, nofollow` meta tags

### 3. Case Study Pages
- Create `/work/<slug>/index.html` with template
- Add canonical tags pointing to work URLs
- Include Open Graph and Twitter meta placeholders
- Structure: Hero, Snapshot, Visuals, Action buttons

### 4. Portfolio Updates
- Primary action → `/work/<slug>/`
- Secondary action → `/demo/<slug>/`
- Add `rel="noopener noreferrer"` to external links

### 5. File-Based Redirects
HTML stubs at old locations with instant meta refresh:
```html
<!doctype html>
<meta http-equiv="refresh" content="0, url=/demo/<slug>/">
<link rel="canonical" href="/demo/<slug>/">
<title>Redirecting</title>
<a href="/demo/<slug>/">Click here if you are not redirected.</a>
```

### 6. SEO Configuration
- Update `robots.txt`: `Disallow: /demo/`
- Add case studies to `sitemap.xml`
- Block demo indexing, keep case studies indexable

## Adding Future Projects

### Step 1: Create Demo
1. Create `/demo/<new-slug>/` directory
2. Copy production build assets
3. Fix relative paths in HTML
4. Add `<meta name="robots" content="noindex, nofollow">`

### Step 2: Create Case Study
1. Create `/work/<new-slug>/index.html`
2. Use case study template
3. Add canonical tag: `<link rel="canonical" href="https://designbykyle.com/work/<new-slug>/" />`
4. Fill in Open Graph meta tags

### Step 3: Update Portfolio
1. Add project to portfolio data
2. Set primary action to `/work/<new-slug>/`
3. Set secondary action to `/demo/<new-slug>/`

### Step 4: Create Redirect Stub
1. Place HTML stub at old demo location
2. Use meta refresh to new clean URL
3. Include canonical tag

### Step 5: Update SEO
1. Add case study URL to `sitemap.xml`
2. Test that demo is blocked by `robots.txt`

## Rollback Plan

### Emergency Rollback
```bash
# Option 1: Revert PR in GitHub
# Option 2: Switch Pages to backup branch temporarily
```

### Files to Remove in Rollback
- `/demo/` directory and contents
- `/work/` directory and contents
- Updated `robots.txt` changes
- Updated `sitemap.xml` entries
- Portfolio link updates

### Files to Restore
- Original demo files (preserved as redirect stubs)
- Original portfolio links
- Original `robots.txt`
- Original `sitemap.xml`

## Verification Checklist
- [ ] All demos load at `/demo/<slug>/` with assets
- [ ] All case studies exist at `/work/<slug>/`
- [ ] Portfolio links use new paths
- [ ] Old URLs redirect instantly
- [ ] Demos blocked from indexing
- [ ] Case studies remain indexable
- [ ] No console errors on any page
- [ ] Mobile responsive on iOS/Android

## Slug Rules
- **Format**: lowercase, hyphen-separated, ASCII-only
- **Examples**: `asp-printing`, `g2own-platform`, `hye-pilates`
- **Pattern**: `[a-z0-9-]+`

## GitHub Pages Configuration
- **Source**: master branch, root directory
- **Custom Domain**: designbykyle.com
- **HTTPS**: Enforced
- **Jekyll**: Not in use (static HTML)