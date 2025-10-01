<#
FrameHouseCinema Backup Automation Script
Usage:
  1. Open PowerShell in project root.
  2. Run:  powershell -ExecutionPolicy Bypass -File .\create_backup.ps1
What it does:
  - Verifies git repo.
  - Generates timestamp name (backup-YYYYMMDD-HHMM).
  - Commits any staged & unstaged changes with a standard message.
  - Creates a backup branch (if not already) and pushes it.
  - Creates an annotated tag and pushes it.
  - Builds a zip archive of key project assets.
#>

Write-Host "=== FrameHouseCinema Backup Script ===" -ForegroundColor Cyan

# Ensure git exists
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "Git not found in PATH." -ForegroundColor Red
  exit 1
}

# Ensure we're in a git repo
$gitTop = (git rev-parse --show-toplevel 2>$null)
if (-not $gitTop) {
  Write-Host "Not a git repository. Abort." -ForegroundColor Red
  exit 1
}
Set-Location $gitTop

$timestamp = Get-Date -Format 'yyyyMMdd-HHmm'
$branchName = "backup-$($timestamp)"
$tagName = "snapshot-$($timestamp)"
$zipName = "FrameHouseCinema_${timestamp}.zip"

Write-Host "Timestamp: $timestamp"

# Stage all changes
Write-Host "Staging changes..." -ForegroundColor Yellow
git add .

# Only commit if there is something to commit
$diff = git diff --cached --name-only
if ($diff) {
  $commitMsg = "Backup: snapshot $timestamp"
  Write-Host "Committing ($commitMsg)..." -ForegroundColor Yellow
  git commit -m "$commitMsg" | Out-Null
} else {
  Write-Host "No new changes to commit." -ForegroundColor DarkYellow
}

# Create branch
Write-Host "Creating branch $branchName" -ForegroundColor Yellow
git branch $branchName 2>$null | Out-Null

# Push branch
Write-Host "Pushing branch $branchName" -ForegroundColor Yellow
git push origin $branchName | Out-Null

# Create tag
Write-Host "Creating tag $tagName" -ForegroundColor Yellow
git tag -a $tagName -m "Snapshot $timestamp" 2>$null
Write-Host "Pushing tag $tagName" -ForegroundColor Yellow
git push origin $tagName 2>$null | Out-Null

# Build zip (core assets)
$items = @(
  'index.html','booking.html','book-now.html','videos.html','videos_new.html','scenery.html','people.html','lighting.html','architecture.html','events.html','section.html','style.css','images','Media','js','backup_2025-09-10','create_backup.ps1'
) | Where-Object { Test-Path $_ }

Write-Host "Creating archive $zipName" -ForegroundColor Yellow
if (Test-Path $zipName) { Remove-Item $zipName -Force }
Compress-Archive -Path $items -DestinationPath $zipName -Force

Write-Host "Done." -ForegroundColor Green
Write-Host "Branch: $branchName" -ForegroundColor Green
Write-Host "Tag:    $tagName" -ForegroundColor Green
Write-Host "Zip:    $zipName" -ForegroundColor Green
Write-Host "Verify on GitHub and keep the zip safe." -ForegroundColor Cyan
