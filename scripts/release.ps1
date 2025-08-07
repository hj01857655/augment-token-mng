# Release Script for Augment Token Manager
param(
    [Parameter(Mandatory=$true)]
    [string]$Version
)

Write-Host "🚀 Preparing release v$Version..." -ForegroundColor Green

# Validate version format
if ($Version -notmatch '^\d+\.\d+\.\d+$') {
    Write-Host "❌ Invalid version format. Use semantic versioning (e.g., 1.0.0)" -ForegroundColor Red
    exit 1
}

# Update package.json
Write-Host "📝 Updating package.json..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$packageJson.version = $Version
$packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"

# Update Cargo.toml
Write-Host "📝 Updating Cargo.toml..." -ForegroundColor Yellow
$cargoToml = Get-Content "src-tauri/Cargo.toml"
$cargoToml = $cargoToml -replace 'version = "\d+\.\d+\.\d+"', "version = `"$Version`""
$cargoToml | Set-Content "src-tauri/Cargo.toml"

# Update tauri.conf.json
Write-Host "📝 Updating tauri.conf.json..." -ForegroundColor Yellow
$tauriConf = Get-Content "src-tauri/tauri.conf.json" | ConvertFrom-Json
$tauriConf.version = $Version
$tauriConf | ConvertTo-Json -Depth 10 | Set-Content "src-tauri/tauri.conf.json"

# Commit changes
Write-Host "📝 Committing version changes..." -ForegroundColor Yellow
git add package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json
git commit -m "chore: bump version to v$Version"

# Create and push tag
Write-Host "🏷️ Creating tag v$Version..." -ForegroundColor Yellow
git tag "v$Version"
git push origin main
git push origin "v$Version"

Write-Host "✅ Release v$Version initiated!" -ForegroundColor Green
Write-Host "🔗 Check GitHub Actions for build progress: https://github.com/YOUR_USERNAME/YOUR_REPO/actions" -ForegroundColor Cyan
