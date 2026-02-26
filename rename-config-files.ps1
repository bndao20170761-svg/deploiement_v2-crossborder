# Script PowerShell pour renommer les fichiers de configuration
# selon la convention Spring Cloud Config
# 
# Convention: {application-name}-{profile}.yml
# Exemple: User_API_PVVIH-dev.yml

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Script de Renommage des Configurations" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Étape 1: Cloner ou accéder au dépôt
Write-Host "Étape 1: Accès au dépôt de configuration" -ForegroundColor Yellow
Write-Host ""

$repoUrl = "https://github.com/BabacarNdaoKgl/cloud-config-repo-enda.git"
$repoPath = "cloud-config-repo-enda"

if (Test-Path $repoPath) {
    Write-Host "Le dépôt existe déjà localement." -ForegroundColor Green
    Write-Host "Mise à jour du dépôt..." -ForegroundColor Yellow
    Set-Location $repoPath
    git pull origin main
} else {
    Write-Host "Clonage du dépôt depuis GitHub..." -ForegroundColor Yellow
    git clone $repoUrl
    Set-Location $repoPath
}

Write-Host ""
Write-Host "Dépôt prêt!" -ForegroundColor Green
Write-Host ""

# Étape 2: Afficher les fichiers actuels
Write-Host "Étape 2: Fichiers actuels dans le dépôt" -ForegroundColor Yellow
Write-Host ""
Get-ChildItem -Filter "*.yml" | ForEach-Object {
    Write-Host "  - $($_.Name)" -ForegroundColor White
}
Get-ChildItem -Filter "*.yaml" | ForEach-Object {
    Write-Host "  - $($_.Name)" -ForegroundColor White
}
Write-Host ""

# Étape 3: Renommer les fichiers selon la convention
Write-Host "Étape 3: Renommage des fichiers" -ForegroundColor Yellow
Write-Host ""

# Tableau de correspondance: ancien nom -> nouveau nom
$renameMap = @{
    # Gateway
    "application_getway.yaml" = "GETWAY_PVVIH-dev.yml"
    "application_getway.yml" = "GETWAY_PVVIH-dev.yml"
    "getway.yaml" = "GETWAY_PVVIH-dev.yml"
    "getway.yml" = "GETWAY_PVVIH-dev.yml"
    "gateway.yaml" = "GETWAY_PVVIH-dev.yml"
    "gateway.yml" = "GETWAY_PVVIH-dev.yml"
    
    # User Service
    "user.yaml" = "User_API_PVVIH-dev.yml"
    "user.yml" = "User_API_PVVIH-dev.yml"
    "user-api.yaml" = "User_API_PVVIH-dev.yml"
    "user-api.yml" = "User_API_PVVIH-dev.yml"
    "gestion_user.yaml" = "User_API_PVVIH-dev.yml"
    "gestion_user.yml" = "User_API_PVVIH-dev.yml"
    
    # Patient Service
    "patient.yaml" = "Patient_API_PVVIH-dev.yml"
    "patient.yml" = "Patient_API_PVVIH-dev.yml"
    "patient-api.yaml" = "Patient_API_PVVIH-dev.yml"
    "patient-api.yml" = "Patient_API_PVVIH-dev.yml"
    "gestion_patient.yaml" = "Patient_API_PVVIH-dev.yml"
    "gestion_patient.yml" = "Patient_API_PVVIH-dev.yml"
    
    # Reference Service
    "reference.yaml" = "referencement_PVVIH-dev.yml"
    "reference.yml" = "referencement_PVVIH-dev.yml"
    "referencement.yaml" = "referencement_PVVIH-dev.yml"
    "referencement.yml" = "referencement_PVVIH-dev.yml"
    "gestion_reference.yaml" = "referencement_PVVIH-dev.yml"
    "gestion_reference.yml" = "referencement_PVVIH-dev.yml"
    
    # Forum Service
    "forum.yaml" = "Forum_PVVIH-dev.yml"
    "forum.yml" = "Forum_PVVIH-dev.yml"
    "forum-pvvih.yaml" = "Forum_PVVIH-dev.yml"
    "forum-pvvih.yml" = "Forum_PVVIH-dev.yml"
}

$renamedCount = 0

foreach ($oldName in $renameMap.Keys) {
    $newName = $renameMap[$oldName]
    
    if (Test-Path $oldName) {
        Write-Host "  Renommage: $oldName -> $newName" -ForegroundColor Cyan
        git mv $oldName $newName
        $renamedCount++
    }
}

if ($renamedCount -eq 0) {
    Write-Host "  Aucun fichier à renommer trouvé." -ForegroundColor Yellow
    Write-Host "  Les fichiers ont peut-être déjà les bons noms." -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "  $renamedCount fichier(s) renommé(s)!" -ForegroundColor Green
}

Write-Host ""

# Étape 4: Afficher les nouveaux noms
Write-Host "Étape 4: Fichiers après renommage" -ForegroundColor Yellow
Write-Host ""
Get-ChildItem -Filter "*.yml" | ForEach-Object {
    Write-Host "  - $($_.Name)" -ForegroundColor Green
}
Get-ChildItem -Filter "*.yaml" | ForEach-Object {
    Write-Host "  - $($_.Name)" -ForegroundColor Green
}
Write-Host ""

# Étape 5: Commit et push
Write-Host "Étape 5: Commit et push vers GitHub" -ForegroundColor Yellow
Write-Host ""

$hasChanges = git status --porcelain
if ($hasChanges) {
    Write-Host "Création du commit..." -ForegroundColor Cyan
    git add .
    git commit -m "Rename config files to follow Spring Cloud Config naming convention

- Gateway: GETWAY_PVVIH-dev.yml
- User Service: User_API_PVVIH-dev.yml
- Patient Service: Patient_API_PVVIH-dev.yml
- Reference Service: referencement_PVVIH-dev.yml
- Forum Service: Forum_PVVIH-dev.yml

Convention: {application-name}-{profile}.yml"
    
    Write-Host ""
    Write-Host "Push vers GitHub..." -ForegroundColor Cyan
    git push origin main
    
    Write-Host ""
    Write-Host "✓ Changements poussés vers GitHub avec succès!" -ForegroundColor Green
} else {
    Write-Host "Aucun changement à commiter." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Résumé des Noms de Fichiers Attendus" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Les fichiers suivants doivent exister dans votre dépôt:" -ForegroundColor White
Write-Host ""
Write-Host "  1. application.yml" -ForegroundColor Yellow -NoNewline
Write-Host "                    (Configuration commune)" -ForegroundColor Gray
Write-Host "  2. GETWAY_PVVIH-dev.yml" -ForegroundColor Yellow -NoNewline
Write-Host "              (Gateway - Dev)" -ForegroundColor Gray
Write-Host "  3. User_API_PVVIH-dev.yml" -ForegroundColor Yellow -NoNewline
Write-Host "            (User Service - Dev)" -ForegroundColor Gray
Write-Host "  4. Patient_API_PVVIH-dev.yml" -ForegroundColor Yellow -NoNewline
Write-Host "         (Patient Service - Dev)" -ForegroundColor Gray
Write-Host "  5. referencement_PVVIH-dev.yml" -ForegroundColor Yellow -NoNewline
Write-Host "       (Reference Service - Dev)" -ForegroundColor Gray
Write-Host "  6. Forum_PVVIH-dev.yml" -ForegroundColor Yellow -NoNewline
Write-Host "               (Forum Service - Dev)" -ForegroundColor Gray
Write-Host ""
Write-Host "Pour la production, créez les mêmes fichiers avec '-prod.yml'" -ForegroundColor Cyan
Write-Host ""

# Étape 6: Vérification
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Vérification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Testez l'accès aux configurations depuis le Config Server:" -ForegroundColor White
Write-Host ""
Write-Host "  curl http://localhost:8888/GETWAY_PVVIH/dev" -ForegroundColor Yellow
Write-Host "  curl http://localhost:8888/User_API_PVVIH/dev" -ForegroundColor Yellow
Write-Host "  curl http://localhost:8888/Patient_API_PVVIH/dev" -ForegroundColor Yellow
Write-Host "  curl http://localhost:8888/referencement_PVVIH/dev" -ForegroundColor Yellow
Write-Host "  curl http://localhost:8888/Forum_PVVIH/dev" -ForegroundColor Yellow
Write-Host ""

# Retour au répertoire parent
Set-Location ..

Write-Host "Script terminé!" -ForegroundColor Green
Write-Host ""
