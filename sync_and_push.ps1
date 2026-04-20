
# ─────────────────────────────────────────────────────────────────────────────
# CrisisForge AI — Sync with upstream history & push custom changes
# ─────────────────────────────────────────────────────────────────────────────

$ErrorActionPreference = "Stop"
$root = "c:\Users\KARAN PRAJAPATI\OneDrive\Desktop\project"
$tmp  = "$env:TEMP\crisisforge_backup"

Write-Host "`n[1/6] Creating temp backup folder..." -ForegroundColor Cyan
if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
New-Item -ItemType Directory -Path $tmp | Out-Null

# ── Save all custom files ──────────────────────────────────────────────────
Write-Host "[2/6] Backing up your custom files..." -ForegroundColor Cyan

$files = @(
    "frontend\src\components\GridScan.tsx",
    "frontend\src\components\GridScan.css",
    "frontend\src\App.tsx",
    "frontend\src\pages\Login.tsx"
)

foreach ($f in $files) {
    $src  = Join-Path $root $f
    $dest = Join-Path $tmp ($f -replace '\\','_')
    if (Test-Path $src) {
        Copy-Item $src $dest
        Write-Host "  Backed up: $f" -ForegroundColor Gray
    } else {
        Write-Host "  SKIPPED (not found): $f" -ForegroundColor Yellow
    }
}

# ── Reset to upstream/main ─────────────────────────────────────────────────
Write-Host "[3/6] Resetting history to upstream/main..." -ForegroundColor Cyan
Set-Location $root
git reset --hard upstream/main
Write-Host "  History now matches upstream." -ForegroundColor Green

# ── Restore custom files ───────────────────────────────────────────────────
Write-Host "[4/6] Restoring your custom files..." -ForegroundColor Cyan

# Ensure components dir exists
$compDir = Join-Path $root "frontend\src\components"
if (-not (Test-Path $compDir)) { New-Item -ItemType Directory -Path $compDir | Out-Null }

foreach ($f in $files) {
    $dest = Join-Path $root $f
    $src  = Join-Path $tmp ($f -replace '\\','_')
    if (Test-Path $src) {
        # Ensure parent directory exists
        $parentDir = Split-Path $dest
        if (-not (Test-Path $parentDir)) { New-Item -ItemType Directory -Path $parentDir | Out-Null }
        Copy-Item $src $dest -Force
        Write-Host "  Restored: $f" -ForegroundColor Gray
    }
}

# ── Commit ─────────────────────────────────────────────────────────────────
Write-Host "[5/6] Staging and committing your changes..." -ForegroundColor Cyan
git add -A
git commit -m "feat: add 3D GridScan background and fix sidebar visibility on login"
Write-Host "  Committed successfully." -ForegroundColor Green

# ── Force push ─────────────────────────────────────────────────────────────
Write-Host "[6/6] Force pushing to GitHub..." -ForegroundColor Cyan
git push --force origin main
Write-Host "`n✅ Done! Your GitHub history now matches upstream + your custom commit on top." -ForegroundColor Green
Write-Host "   You can now open a Pull Request from your fork to abhaykatre-dev/crisisforge-ai." -ForegroundColor Cyan
