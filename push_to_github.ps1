param(
  [string]$Message = "Publish updates (perf + fixes)"
)
$ErrorActionPreference = 'Stop'

# Ensure Git is installed
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "Git is not installed. Install Git and retry." -ForegroundColor Red
  exit 1
}

# Ensure repository
$repo = (git rev-parse --show-toplevel 2>$null)
if (-not $repo) {
  Write-Host "Initializing repository..." -ForegroundColor Yellow
  git init | Out-Null
}

# Ensure remote origin
$remotes = (git remote 2>$null)
if (-not $remotes) {
  Write-Host "Adding origin remote..." -ForegroundColor Yellow
  git remote add origin https://github.com/Zxyion1/FrameHouseCinema.git | Out-Null
}

# Ensure branch main
$branch = (git rev-parse --abbrev-ref HEAD 2>$null).Trim()
if ([string]::IsNullOrEmpty($branch) -or $branch -eq 'HEAD') {
  git checkout -B main | Out-Null
} elseif ($branch -ne 'main') {
  git branch -M main | Out-Null
}

# Stage and commit
Write-Host "Staging changes..." -ForegroundColor Cyan
git add -A | Out-Null
if (git diff --cached --quiet) {
  Write-Host "No changes to commit." -ForegroundColor Yellow
} else {
  git commit -m $Message | Out-Null
  Write-Host "Committed: $Message" -ForegroundColor Green
}

# Pull (rebase) then push
try {
  git pull --rebase origin main | Out-Null
} catch {
  Write-Host "Pull skipped or failed (first push or no upstream)." -ForegroundColor Yellow
}

git push -u origin main | Out-Null
Write-Host "Pushed to origin/main." -ForegroundColor Green
Write-Host "GitHub Pages will update in ~1–2 minutes:" -ForegroundColor Cyan
Write-Host "  https://zxyion1.github.io/FrameHouseCinema/" -ForegroundColor Cyan
