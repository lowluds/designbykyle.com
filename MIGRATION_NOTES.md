# Migration Notes: Clean Demo URLs & Case Studies

## Overview
This migration cleans up demo URLs, adds case study pages, and hardens the site for GitHub Pages with Cloudflare.

## New URL Structure

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

## Changes Made

### 1. Demo Migration
- **ASP Printing**: `demos/asp-printing/` → `demo/asp-printing/`
- **G2Own Platform**: `demos/g2own-platform/` → `demo/g2own-platform/`
- **HYE Pilates**: `demos/hye/project/src/` → `demo/hye-pilates/`

### 2. Case Study Pages
- Created `/work/<slug>/index.html` for each project
- Added canonical tags pointing to clean URLs
- Included Open Graph and Twitter Card meta tags
- Added structured project information (Problem, Role, Timeline, Stack, Results)

### 3. Portfolio Updates
- Updated `portfolio-data.js` with new URL structure
- Primary button now links to case studies (`/work/<slug>/`)
- Secondary button links to live demos (`/demo/<slug>/`)
- Updated portfolio loader to handle dual URLs

### 4. SEO & Security
- Added `noindex, nofollow` meta tags to all demo pages
- Updated `robots.txt` to disallow `/demo/` directory
- Added case study pages to `sitemap.xml`
- Created comprehensive 404.html page

### 5. Redirects (Cloudflare Required)
Set up these Cloudflare Page Rules for 301 redirects:
```
/demos/*/project/src/index.html → /demo/$1/
/demos/:slug/index.html → /demo/:slug/
/demos/:slug/ → /demo/:slug/
```

## Adding Future Projects

### Step 1: Create Demo
1. Create directory: `/demo/<slug>/`
2. Copy project files to the new directory
3. Fix relative paths in HTML files
4. Add `<meta name="robots" content="noindex, nofollow" />` to `<head>`

### Step 2: Create Case Study
1. Create directory: `/work/<slug>/`
2. Copy template from `work/case-study-template.html`
3. Replace placeholders:
   - `{{TITLE}}` - Project title
   - `{{DESCRIPTION}}` - Project description
   - `{{SLUG}}` - URL slug
   - `{{PROJECT_IMAGE}}` - Image filename
   - `{{PROBLEM_PLACEHOLDER}}` - Problem statement
   - `{{ROLE_PLACEHOLDER}}` - Your role
   - `{{TIMELINE_PLACEHOLDER}}` - Project timeline
   - `{{TECH_TAGS}}` - Technology tags HTML
   - `{{RESULTS_PLACEHOLDER}}` - Project results
   - `{{CODE_URL}}` - GitHub repository URL

### Step 3: Update Portfolio Data
Add entry to `assets/js/portfolio-data.js`:
```javascript
{
    id: 6,
    title: "Project Name",
    description: "Project description",
    image: "assets/images/project/project6.jpg",
    category: "web", // or "branding", "fullstack"
    tags: ["HTML5", "CSS3", "JavaScript"],
    projectUrl: "work/project-slug/",
    demoUrl: "demo/project-slug/",
    codeUrl: "https://github.com/...",
    featured: true,
    year: "2024"
}
```

### Step 4: Update Sitemap
Add case study URL to `sitemap.xml`:
```xml
<url>
    <loc>https://designbykyle.com/work/project-slug/</loc>
    <lastmod>2024-12-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
</url>
```

### Step 5: Set Up Redirects (if needed)
If migrating from old paths, add Cloudflare Page Rules:
```
/old/path/to/demo → /demo/project-slug/
```

## Cloudflare Configuration

### Page Rules (301 Redirects)
1. `/demos/*/project/src/index.html` → `/demo/$1/`
2. `/demos/:slug/index.html` → `/demo/:slug/`
3. `/demos/:slug/` → `/demo/:slug/`

### Security Headers (Transform Rules)
Add these response headers at the zone level:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=(), microphone=(), usb=()
Content-Security-Policy: default-src 'self'; img-src 'self' data: https:; media-src 'self' https:; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self' data:
```

## File Structure
```
/
├── demo/
│   ├── asp-printing/
│   │   ├── index.html
│   │   └── [assets]
│   ├── g2own-platform/
│   │   ├── index.html
│   │   └── [assets]
│   └── hye-pilates/
│       ├── index.html
│       ├── output.css
│       └── assets/
├── work/
│   ├── asp-printing/
│   │   └── index.html
│   ├── g2own-platform/
│   │   └── index.html
│   └── hye-pilates/
│       └── index.html
├── scripts/
│   └── slug-map.json
├── 404.html
├── robots.txt
├── sitemap.xml
└── MIGRATION_NOTES.md
```

## Rollback Plan
If rollback is needed:
1. `git checkout master`
2. `git branch -D feature/clean-demo-urls`
3. Remove any Cloudflare Page Rules created
4. Files that would be removed:
   - `/demo/` directory and all contents
   - `/work/` directory and all contents
   - `/scripts/slug-map.json`
   - Updated `robots.txt`, `sitemap.xml`
   - Updated `assets/js/portfolio-data.js`
   - Updated `assets/js/portfolio-loader.js`
   - `404.html`
   - `MIGRATION_NOTES.md`

## Testing Checklist
- [ ] All demo URLs load with working assets
- [ ] All case study pages load with canonical tags
- [ ] Portfolio links point to correct URLs
- [ ] Old demo URLs redirect to new locations (via Cloudflare)
- [ ] Robots.txt blocks /demo/ from indexing
- [ ] Demo pages contain noindex meta tags
- [ ] Sitemap includes new case study pages
- [ ] 404 page works correctly
- [ ] No console errors on any page
- [ ] Mobile responsiveness maintained
