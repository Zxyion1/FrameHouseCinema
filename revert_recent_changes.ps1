<#
Revert recent domain/clean-URL changes for GitHub Pages
This script removes CNAME and the folder stubs, commits, and pushes.
#>
param()

Write-Host "=== Reverting clean-URL and custom domain changes ===" -ForegroundColor Cyan

$ErrorActionPreference = 'Stop'
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { Write-Host "Git not found." -ForegroundColor Red; exit 1 }
$top = (git rev-parse --show-toplevel 2>$null)
if (-not $top) { Write-Host "Not a git repository." -ForegroundColor Red; exit 1 }
Set-Location $top

# Files/folders to remove
$paths = @(
  'CNAME',
  'scenery',
  'people',
  'lighting',
  'architecture',
  'events',
  'videos',
  'booking',
  'book-now',
  'admin',
  'client'
) | ForEach-Object { Join-Path $top $_ }

foreach($p in $paths){ if(Test-Path $p){ Remove-Item $p -Recurse -Force -ErrorAction SilentlyContinue } }

# Stage and commit
try { git add -A } catch {}
$has = git diff --cached --name-only
if($has){
  $msg = "Revert: remove CNAME and clean-URL stubs"
  git commit -m $msg | Out-Null
  Write-Host $msg -ForegroundColor Green
} else {
  Write-Host "No changes to commit" -ForegroundColor Yellow
}

# Push
try { git push origin main | Out-Null; Write-Host "Pushed to origin/main" -ForegroundColor Green } catch { Write-Host "Push failed" -ForegroundColor Red }

Write-Host "Done. Open: https://zxyion1.github.io/FrameHouseCinema/" -ForegroundColor Cyan
