<#
Sync all site files to GitHub (main branch)
Usage:
  powershell -ExecutionPolicy Bypass -File .\sync_to_github.ps1
#>

Write-Host "=== Sync to GitHub: main ===" -ForegroundColor Cyan

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "Git is not installed or not in PATH." -ForegroundColor Red
  exit 1
}

# Move to repo root
$top = (git rev-parse --show-toplevel 2>$null)
if (-not $top) { Write-Host "Not a git repository." -ForegroundColor Red; exit 1 }
Set-Location $top

# Ensure remote is reachable
try { git fetch --quiet } catch { Write-Host "Warning: could not fetch remote." -ForegroundColor DarkYellow }

# Ensure main exists locally
$current = (git rev-parse --abbrev-ref HEAD).Trim()
if ($current -ne 'main') {
  try { git switch main | Out-Null } catch { Write-Host "Could not switch to 'main'." -ForegroundColor Red; exit 1 }
}

# Optional: fast-forward
try { git pull --ff-only | Out-Null } catch { Write-Host "Info: pull fast-forward not applied (maybe already up-to-date)." -ForegroundColor DarkYellow }

# Stage all changes
Write-Host "Staging changes..." -ForegroundColor Yellow
git add -A

# Commit if there are changes
$hasChanges = git diff --cached --name-only
if ($hasChanges) {
  $stamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
  $msg = "Sync: site pages + assets ($stamp)"
  git commit -m "$msg" | Out-Null
  Write-Host "Committed: $msg" -ForegroundColor Green
} else {
  Write-Host "No changes to commit." -ForegroundColor DarkYellow
}

# Push to main
Write-Host "Pushing to origin/main..." -ForegroundColor Yellow
git push origin main | Out-Null
Write-Host "Push complete." -ForegroundColor Green

# Optional tag (uncomment to enable tagging each sync)
# $tag = "deploy-" + (Get-Date -Format 'yyyyMMdd-HHmm')
# git tag -a $tag -m "Deployed $tag"
# git push origin $tag

Write-Host "Done. Verify on GitHub and GitHub Pages." -ForegroundColor Cyan
