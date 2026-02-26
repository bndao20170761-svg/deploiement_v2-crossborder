# Script de vérification rapide d'un service
param(
    [Parameter(Mandatory=$false)]
    [string]$Service = "gestion-reference"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Vérification de $Service" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# 1. Vérifier l'état
Write-Host "`n1. État du conteneur:" -ForegroundColor Yellow
$status = docker-compose ps $Service 2>&1
Write-Host $status

# Extraire l'état
$isRunning = $status | Select-String "Up"
if ($isRunning) {
    Write-Host "✓ Le service est en cours d'exécution" -ForegroundColor Green
} else {
    Write-Host "✗ Le service n'est pas en cours d'exécution" -ForegroundColor Red
    Write-Host "`nVoir les logs pour plus de détails:" -ForegroundColor Yellow
    docker-compose logs --tail=50 $Service
    exit 1
}

# 2. Vérifier les logs récents
Write-Host "`n2. Derniers logs (20 lignes):" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
$logs = docker-compose logs --tail=20 $Service

# Chercher des erreurs
$errors = $logs | Select-String "ERROR|Exception|Failed"
if ($errors) {
    Write-Host "⚠ Erreurs détectées dans les logs:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host $_ -ForegroundColor Red }
} else {
    Write-Host "✓ Aucune erreur détectée dans les logs récents" -ForegroundColor Green
}

# Afficher les logs
Write-Host $logs

# 3. Vérifier le message de démarrage
Write-Host "`n3. Vérification du démarrage:" -ForegroundColor Yellow
$startedMessage = docker-compose logs $Service | Select-String "Started.*in.*seconds"
if ($startedMessage) {
    Write-Host "✓ Application démarrée avec succès" -ForegroundColor Green
    Write-Host $startedMessage -ForegroundColor Gray
} else {
    Write-Host "⚠ Message de démarrage non trouvé (le service démarre peut-être encore...)" -ForegroundColor Yellow
}

# 4. Vérifier Tomcat
Write-Host "`n4. Vérification de Tomcat:" -ForegroundColor Yellow
$tomcatMessage = docker-compose logs $Service | Select-String "Tomcat started on port"
if ($tomcatMessage) {
    Write-Host "✓ Tomcat démarré" -ForegroundColor Green
    Write-Host $tomcatMessage -ForegroundColor Gray
} else {
    Write-Host "⚠ Message Tomcat non trouvé" -ForegroundColor Yellow
}

# 5. Vérifier Eureka (si applicable)
Write-Host "`n5. Vérification Eureka:" -ForegroundColor Yellow
$eurekaMessage = docker-compose logs $Service | Select-String "Registered.*Eureka|DiscoveryClient"
if ($eurekaMessage) {
    Write-Host "✓ Enregistré avec Eureka" -ForegroundColor Green
    Write-Host $eurekaMessage[0] -ForegroundColor Gray
} else {
    Write-Host "ℹ Pas d'enregistrement Eureka détecté (peut-être non configuré)" -ForegroundColor Gray
}

# 6. Statistiques du conteneur
Write-Host "`n6. Statistiques du conteneur:" -ForegroundColor Yellow
$containerName = docker-compose ps -q $Service
if ($containerName) {
    $stats = docker stats --no-stream $containerName 2>$null
    if ($stats) {
        Write-Host $stats
    }
}

# Résumé
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Résumé de la vérification" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

if ($isRunning -and -not $errors -and $startedMessage) {
    Write-Host "✓ Le service $Service fonctionne correctement!" -ForegroundColor Green
} elseif ($isRunning -and -not $startedMessage) {
    Write-Host "⚠ Le service est en cours de démarrage..." -ForegroundColor Yellow
    Write-Host "Attendez quelques secondes et relancez la vérification." -ForegroundColor Yellow
} else {
    Write-Host "✗ Le service a des problèmes" -ForegroundColor Red
    Write-Host "Consultez les logs complets avec:" -ForegroundColor Yellow
    Write-Host "  docker-compose logs -f $Service" -ForegroundColor Cyan
}

Write-Host "`nCommandes utiles:" -ForegroundColor Yellow
Write-Host "  Voir logs en temps réel : docker-compose logs -f $Service" -ForegroundColor Cyan
Write-Host "  Redémarrer le service   : docker-compose restart $Service" -ForegroundColor Cyan
Write-Host "  Arrêter le service      : docker-compose stop $Service" -ForegroundColor Cyan
Write-Host "  Voir l'état             : docker-compose ps $Service" -ForegroundColor Cyan
