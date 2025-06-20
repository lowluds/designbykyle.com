# Cleanup Redundant MD Files Script
# This script removes redundant markdown documentation files that are no longer needed

Write-Host "Starting cleanup of redundant markdown files..." -ForegroundColor Green

# Define the files to keep (essential documentation)
$filesToKeep = @(
    "QUICK_LAUNCH_GUIDE.md",
    "FINAL_DEPLOYMENT_REPORT.md", 
    "PRODUCTION_READY_REPORT.md",
    "OAUTH_INTEGRATION_SETUP_GUIDE.md"
)

# Get all markdown files in the current directory
$allMdFiles = Get-ChildItem -Path "." -Filter "*.md" | Where-Object { $_.Name -notin $filesToKeep }

Write-Host "Found $($allMdFiles.Count) redundant markdown files to remove:" -ForegroundColor Yellow

foreach ($file in $allMdFiles) {
    Write-Host "  - $($file.Name)" -ForegroundColor Red
}

# Ask for confirmation
$confirmation = Read-Host "`nDo you want to proceed with deletion? (y/N)"

if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
    Write-Host "`nDeleting redundant files..." -ForegroundColor Green
    
    foreach ($file in $allMdFiles) {
        try {
            Remove-Item $file.FullName -Force
            Write-Host "  ✓ Deleted: $($file.Name)" -ForegroundColor Green
        }
        catch {
            Write-Host "  ✗ Failed to delete: $($file.Name) - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host "`nCleanup completed!" -ForegroundColor Green
    Write-Host "Kept essential files:" -ForegroundColor Cyan
    foreach ($keepFile in $filesToKeep) {
        if (Test-Path $keepFile) {
            Write-Host "  ✓ $keepFile" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "Cleanup cancelled." -ForegroundColor Yellow
}
