# Fix Docker DNS issues for Maven builds
Write-Host "Fixing Docker DNS configuration..." -ForegroundColor Cyan

# Stop Docker Desktop
Write-Host "`nStopping Docker Desktop..." -ForegroundColor Yellow
Stop-Process -Name "Docker Desktop" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 5

# Docker Desktop settings file location
$dockerSettingsPath = "$env:APPDATA\Docker\settings.json"

if (Test-Path $dockerSettingsPath) {
    Write-Host "Updating Docker settings..." -ForegroundColor Yellow
    
    $settings = Get-Content $dockerSettingsPath | ConvertFrom-Json
    
    # Add DNS servers (Google DNS and Cloudflare DNS)
    $settings | Add-Member -NotePropertyName "dns" -NotePropertyValue @("8.8.8.8", "8.8.4.4", "1.1.1.1") -Force
    
    $settings | ConvertTo-Json -Depth 10 | Set-Content $dockerSettingsPath
    
    Write-Host "Docker settings updated with DNS servers" -ForegroundColor Green
} else {
    Write-Host "Docker settings file not found at: $dockerSettingsPath" -ForegroundColor Red
}

Write-Host "`nPlease restart Docker Desktop manually and try building again." -ForegroundColor Cyan
Write-Host "After Docker restarts, run: docker-compose build --no-cache" -ForegroundColor Yellow
