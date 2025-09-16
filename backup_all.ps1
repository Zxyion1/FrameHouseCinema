<#
Backup everything locally (ZIP) and to GitHub (branch+tag)
Usage:
  powershell -ExecutionPolicy Bypass -File .\backup_all.ps1
#>
Write-Host "=== FrameHouseCinema: Backup All ===" -ForegroundColor Cyan

if (-not (Get-Command git -ErrorAction SilentlyContinue)) { Write-Host "Git not found." -ForegroundColor Red; exit 1 }
$top = (git rev-parse --show-toplevel 2>$null)
if (-not $top) { Write-Host "Not a git repository." -ForegroundColor Red; exit 1 }
Set-Location $top

# Prepare names
$timestamp = Get-Date -Format 'yyyyMMdd-HHmm'
$branchName = "backup-$timestamp"
$tagName    = "snapshot-$timestamp"
$backupDir  = Join-Path $top 'backups'
$zipPath    = Join-Path $backupDir ("FrameHouseCinema_${timestamp}.zip")

# Ensure backup folder exists
if (-not (Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir | Out-Null }

# Update repo state
try { git fetch --quiet } catch {}
$current = (git rev-parse --abbrev-ref HEAD).Trim()
if ($current -ne 'main') { try { git switch main | Out-Null } catch { Write-Host "Could not switch to 'main'." -ForegroundColor Yellow } }
try { git pull --ff-only | Out-Null } catch { Write-Host "Skipped fast-forward pull." -ForegroundColor DarkYellow }

# Stage & commit
Write-Host "Staging changes..." -ForegroundColor Yellow
git add -A
$hasChanges = git diff --cached --name-only
if ($hasChanges) {
  $msg = "Backup: snapshot $timestamp"
  git commit -m "$msg" | Out-Null
  Write-Host "Committed: $msg" -ForegroundColor Green
} else {
  Write-Host "No changes to commit." -ForegroundColor DarkYellow
}

# Create and push backup branch
Write-Host "Creating/pushing branch $branchName" -ForegroundColor Yellow
(git branch $branchName 2>$null | Out-Null)
try { git push origin $branchName | Out-Null } catch { Write-Host "Push branch failed." -ForegroundColor Red }

# Create and push tag
Write-Host "Tagging $tagName" -ForegroundColor Yellow
(git tag -a $tagName -m "Snapshot $timestamp" 2>$null)
try { git push origin $tagName | Out-Null } catch { Write-Host "Push tag failed (may already exist)." -ForegroundColor DarkYellow }

# Build ZIP (exclude VCS/editor and backups folder)
Write-Host "Creating ZIP at $zipPath" -ForegroundColor Yellow
$exclude = @('.git','node_modules','backups','.vscode','.DS_Store','Thumbs.db')
$items = Get-ChildItem -Force | Where-Object { $exclude -notcontains $_.Name }
$paths = $items | ForEach-Object { $_.FullName }
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path $paths -DestinationPath $zipPath -Force

Write-Host "Done." -ForegroundColor Green
Write-Host "Git Branch: $branchName" -ForegroundColor Green
Write-Host "Git Tag:    $tagName" -ForegroundColor Green
Write-Host "Local ZIP:  $zipPath" -ForegroundColor Green
Write-Host "Verify on GitHub (branch + tag) and keep the ZIP safe." -ForegroundColor Cyan
