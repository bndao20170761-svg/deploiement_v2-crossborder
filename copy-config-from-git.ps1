# Script to copy configuration files from Git repository to local cloud-config-repo
# This resolves the configuration mismatch causing microservices to fail

Write-Host "=== Configuration File Copy Script ===" -ForegroundColor Cyan
Write-Host ""

# Define paths
$gitRepoPath = "C:\Users\babac\cloud-config-repo\cloud-config-repo-enda"
$localConfigPath = ".\cloud-config-repo"

# Check if Git repository exists
if (-not (Test-Path $gitRepoPath)) {
    Write-Host "ERROR: Git repository not found at: $gitRepoPath" -ForegroundColor Red
    Write-Host "Please verify the path and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host "Git repository found: $gitRepoPath" -ForegroundColor Green
Write-Host ""

# Create local config directory if it doesn't exist
if (-not (Test-Path $localConfigPath)) {
    Write-Host "Creating local config directory: $localConfigPath" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $localConfigPath -Force | Out-Null
}

# List of configuration files to copy
$configFiles = @(
    "Forum_API_PVVIH-dev.properties",
    "Patient_API_PVVIH-dev.properties",
    "Reference_API_PVVIH-dev.properties",
    "User_API_PVVIH-dev.properties",
    "GETWAY_PVVIH-dev.yml"
)

Write-Host "Step 1: Backing up old configuration files..." -ForegroundColor Cyan

# Backup old files
$oldFiles = @(
    "application_forum.properties",
    "application_patient.properties",
    "application_reference.properties",
    "application_user.properties",
    "application_getway.yaml"
)

$backupDir = ".\cloud-config-repo\backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

foreach ($file in $oldFiles) {
    $filePath = Join-Path $localConfigPath $file
    if (Test-Path $filePath) {
        Write-Host "  Backing up: $file" -ForegroundColor Yellow
        Copy-Item $filePath -Destination $backupDir -Force
        Remove-Item $filePath -Force
        Write-Host "    Removed old file" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Step 2: Copying new configuration files from Git repository..." -ForegroundColor Cyan

$copySuccess = 0
$copyFailed = 0

foreach ($file in $configFiles) {
    $sourcePath = Join-Path $gitRepoPath $file
    $destPath = Join-Path $localConfigPath $file
    
    if (Test-Path $sourcePath) {
        try {
            Copy-Item $sourcePath -Destination $destPath -Force
            Write-Host "  Copied: $file" -ForegroundColor Green
            $copySuccess++
        }
        catch {
            Write-Host "  ERROR copying $file : $_" -ForegroundColor Red
            $copyFailed++
        }
    }
    else {
        Write-Host "  WARNING: File not found in Git repo: $file" -ForegroundColor Yellow
        $copyFailed++
    }
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Files copied successfully: $copySuccess" -ForegroundColor Green
Write-Host "Files failed/not found: $copyFailed" -ForegroundColor $(if ($copyFailed -gt 0) { "Red" } else { "Green" })
Write-Host "Old files backed up to: $backupDir" -ForegroundColor Yellow
Write-Host ""

if ($copySuccess -gt 0) {
    Write-Host "Configuration files updated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Stop Docker services: docker-compose down" -ForegroundColor White
    Write-Host "2. Rebuild and start services: docker-compose up -d --build" -ForegroundColor White
    Write-Host "3. Check logs: docker-compose logs -f" -ForegroundColor White
}
else {
    Write-Host "ERROR: No files were copied. Please check the Git repository path." -ForegroundColor Red
    exit 1
}
