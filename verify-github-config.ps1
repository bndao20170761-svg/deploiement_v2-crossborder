# Script de vérification du dépôt GitHub de configuration
# Vérifie que tous les fichiers nécessaires sont présents

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Vérification Dépôt GitHub Config" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$gitRepoUrl = "https://github.com/BabacarNdaoKgl/cloud-config-repo-enda"
$localGitPath = "C:\Users\babac\cloud-config-repo\cloud-config-repo-enda"

$requiredFiles = @(
    "Forum_API_PVVIH-dev.properties",
    "Patient_API_PVVIH-dev.properties",
    "Reference_API_PVVIH-dev.properties",
    "User_API_PVVIH-dev.properties",
    "GETWAY_PVVIH-dev.yaml"
)

# Vérifier le dépôt local
Write-Host "1. Vérification du dépôt Git local..." -ForegroundColor Yellow
Write-Host "   Chemin: $localGitPath" -ForegroundColor Gray

if (Test-Path $localGitPath) {
    Write-Host "   Dépôt local trouvé" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "2. Vérification des fichiers de configuration..." -ForegroundColor Yellow
    
    $allFilesPresent = $true
    foreach ($file in $requiredFiles) {
        $filePath = Join-Path $localGitPath $file
        if (Test-Path $filePath) {
            $fileInfo = Get-Item $filePath
            Write-Host "   $file : OK ($($fileInfo.Length) octets)" -ForegroundColor Green
        }
        else {
            Write-Host "   $file : MANQUANT" -ForegroundColor Red
            $allFilesPresent = $false
        }
    }
    
    if ($allFilesPresent) {
        Write-Host ""
        Write-Host "   Tous les fichiers requis sont présents!" -ForegroundColor Green
    }
    else {
        Write-Host ""
        Write-Host "   ATTENTION: Certains fichiers sont manquants" -ForegroundColor Red
        Write-Host "   Ajoutez les fichiers manquants avant de déployer" -ForegroundColor Yellow
    }
    
    # Vérifier l'état Git
    Write-Host ""
    Write-Host "3. Vérification de l'état Git..." -ForegroundColor Yellow
    
    Push-Location $localGitPath
    
    try {
        # Vérifier la branche actuelle
        $currentBranch = git branch --show-current 2>&1
        Write-Host "   Branche actuelle: $currentBranch" -ForegroundColor Gray
        
        if ($currentBranch -ne "main") {
            Write-Host "   ATTENTION: Vous n'êtes pas sur la branche 'main'" -ForegroundColor Yellow
            Write-Host "   Le Config Server utilise la branche 'main'" -ForegroundColor Yellow
        }
        
        # Vérifier s'il y a des modifications non commitées
        $status = git status --porcelain 2>&1
        if ($status) {
            Write-Host "   Modifications non commitées détectées:" -ForegroundColor Yellow
            Write-Host $status -ForegroundColor Gray
            Write-Host ""
            Write-Host "   Pensez à commiter et pousser vos modifications:" -ForegroundColor Yellow
            Write-Host "   git add ." -ForegroundColor White
            Write-Host "   git commit -m 'Mise à jour configuration'" -ForegroundColor White
            Write-Host "   git push origin main" -ForegroundColor White
        }
        else {
            Write-Host "   Aucune modification non commitée" -ForegroundColor Green
        }
        
        # Vérifier si la branche locale est à jour avec origin
        git fetch origin main 2>&1 | Out-Null
        $localCommit = git rev-parse main 2>&1
        $remoteCommit = git rev-parse origin/main 2>&1
        
        if ($localCommit -eq $remoteCommit) {
            Write-Host "   Branche locale synchronisée avec GitHub" -ForegroundColor Green
        }
        else {
            Write-Host "   ATTENTION: Branche locale différente de GitHub" -ForegroundColor Yellow
            Write-Host "   Poussez vos modifications: git push origin main" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "   Erreur lors de la vérification Git: $($_.Exception.Message)" -ForegroundColor Red
    }
    finally {
        Pop-Location
    }
}
else {
    Write-Host "   ERREUR: Dépôt local non trouvé" -ForegroundColor Red
    Write-Host "   Chemin attendu: $localGitPath" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Clonez le dépôt avec:" -ForegroundColor Yellow
    Write-Host "   git clone $gitRepoUrl $localGitPath" -ForegroundColor White
    exit 1
}

# Vérifier l'accessibilité du dépôt GitHub
Write-Host ""
Write-Host "4. Vérification de l'accessibilité GitHub..." -ForegroundColor Yellow
Write-Host "   URL: $gitRepoUrl" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri $gitRepoUrl -Method Head -TimeoutSec 10 -ErrorAction Stop
    Write-Host "   Dépôt GitHub accessible" -ForegroundColor Green
    Write-Host "   Status HTTP: $($response.StatusCode)" -ForegroundColor Green
}
catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-Host "   ATTENTION: Dépôt GitHub non trouvé (404)" -ForegroundColor Red
        Write-Host "   Vérifiez que le dépôt existe et est public" -ForegroundColor Yellow
    }
    else {
        Write-Host "   Impossible de vérifier l'accessibilité GitHub" -ForegroundColor Yellow
        Write-Host "   Cela peut être normal si le dépôt est privé" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Résumé" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($allFilesPresent) {
    Write-Host "Configuration prête pour le déploiement!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines étapes:" -ForegroundColor Yellow
    Write-Host "1. Assurez-vous que vos modifications sont poussées sur GitHub" -ForegroundColor White
    Write-Host "2. Exécutez: .\deploy-and-verify.ps1" -ForegroundColor White
    Write-Host ""
}
else {
    Write-Host "Configuration incomplète!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Actions requises:" -ForegroundColor Yellow
    Write-Host "1. Ajoutez les fichiers manquants dans: $localGitPath" -ForegroundColor White
    Write-Host "2. Commitez et poussez: git add . && git commit -m 'Config' && git push" -ForegroundColor White
    Write-Host "3. Exécutez à nouveau ce script pour vérifier" -ForegroundColor White
    Write-Host ""
}

Write-Host "Pour plus d'informations, consultez: CONFIGURATION_FINALE_GITHUB.md" -ForegroundColor Cyan
Write-Host ""
