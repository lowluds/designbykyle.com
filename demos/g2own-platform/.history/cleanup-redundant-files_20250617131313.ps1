# G2Own Performance Cleanup Script
# Safely removes redundant files after consolidation

Write-Host "🧹 G2Own Performance Cleanup Starting..." -ForegroundColor Cyan
Write-Host "This script will remove redundant CSS and JS files that have been consolidated." -ForegroundColor Yellow
Write-Host ""

# Define redundant files to remove
$redundantCSSFiles = @(
    "assets/css/buttons-unified.css",
    "assets/css/navbar-optimized.css",
    "assets/css/navbar-performance.css",
    "assets/css/left-sidebar.css",
    "assets/css/responsive-sidebar.css",
    "assets/css/left-sidebar-enhanced.css",
    "assets/css/left-sidebar-enhanced-clean.css",
    "assets/css/glass-buttons.css"
)

$redundantJSFiles = @(
    "assets/js/modern-hero-buttons.js",
    "assets/js/navbar-controller.js",
    "assets/js/responsive-sidebar-clean.js",
    "assets/js/sidebar-data-controller.js",
    "assets/js/enhanced-hover-sidebar.js",
    "assets/js/animations.js",
    "assets/js/carousel-clean.js",
    "assets/js/debug-background.js",
    "assets/js/fix-middle-button.js",
    "assets/js/force-middle-button-black.js",
    "assets/js/responsive-sidebar-monitor.js",
    "assets/js/responsive-validation.js"
)

# Create backup directory
$backupDir = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Write-Host "📁 Creating backup directory: $backupDir" -ForegroundColor Green
New-Item -ItemType Directory -Name $backupDir -Force | Out-Null

# Function to safely move file to backup
function Backup-File {
    param($filePath)
    
    if (Test-Path $filePath) {
        $backupPath = Join-Path $backupDir $filePath
        $backupParent = Split-Path $backupPath -Parent
        
        # Create backup directory structure
        if (!(Test-Path $backupParent)) {
            New-Item -ItemType Directory -Path $backupParent -Force | Out-Null
        }
        
        # Move file to backup
        Move-Item $filePath $backupPath -Force
        Write-Host "✅ Moved: $filePath → $backupPath" -ForegroundColor Green
        return $true
    } else {
        Write-Host "⚠️  File not found: $filePath" -ForegroundColor Yellow
        return $false
    }
}

# Backup redundant CSS files
Write-Host ""
Write-Host "🎨 Processing CSS files..." -ForegroundColor Cyan
$cssCount = 0
foreach ($file in $redundantCSSFiles) {
    if (Backup-File $file) { $cssCount++ }
}

# Backup redundant JS files
Write-Host ""
Write-Host "⚡ Processing JavaScript files..." -ForegroundColor Cyan
$jsCount = 0
foreach ($file in $redundantJSFiles) {
    if (Backup-File $file) { $jsCount++ }
}

# Report results
Write-Host ""
Write-Host "📊 Cleanup Summary:" -ForegroundColor Cyan
Write-Host "  CSS files moved: $cssCount" -ForegroundColor Green
Write-Host "  JS files moved: $jsCount" -ForegroundColor Green
Write-Host "  Total files processed: $($cssCount + $jsCount)" -ForegroundColor Green
Write-Host "  Backup location: $backupDir" -ForegroundColor Yellow

# Calculate potential performance improvement
$totalFiles = $cssCount + $jsCount
$estimatedSavings = $totalFiles * 50 # Rough estimate of 50ms per file
Write-Host ""
Write-Host "🚀 Performance Benefits:" -ForegroundColor Cyan
Write-Host "  Reduced HTTP requests: $totalFiles" -ForegroundColor Green
Write-Host "  Estimated load time improvement: ~$estimatedSavings ms" -ForegroundColor Green
Write-Host "  Simplified maintenance: Single consolidated files" -ForegroundColor Green

Write-Host ""
Write-Host "✨ Cleanup completed successfully!" -ForegroundColor Green
Write-Host "🌐 Test your website to ensure everything works correctly." -ForegroundColor Yellow
Write-Host "📝 If issues occur, restore files from: $backupDir" -ForegroundColor Yellow

# Optional: Show remaining file structure
Write-Host ""
$choice = Read-Host "Would you like to see the optimized file structure? (y/n)"
if ($choice -eq 'y' -or $choice -eq 'Y') {
    Write-Host ""
    Write-Host "📁 Optimized CSS Files:" -ForegroundColor Cyan
    Get-ChildItem "assets/css/*.css" | Sort-Object Name | ForEach-Object {
        Write-Host "  📄 $($_.Name)" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "📁 Optimized JS Files:" -ForegroundColor Cyan
    Get-ChildItem "assets/js/*.js" | Sort-Object Name | ForEach-Object {
        Write-Host "  📄 $($_.Name)" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Test the website functionality" -ForegroundColor White
Write-Host "  2. Check responsive behavior on different devices" -ForegroundColor White
Write-Host "  3. Verify all animations and interactions work" -ForegroundColor White
Write-Host "  4. Run performance tests to measure improvements" -ForegroundColor White

Write-Host ""
Write-Host "✅ Performance optimization complete!" -ForegroundColor Green
