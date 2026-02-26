# Créer des Dockerfiles simplifiés pour les frontends
Write-Host "Création de Dockerfiles simplifiés..." -ForegroundColor Cyan

$frontends = @(
    @{Path="a_reference_front"; Name="a-reference-front"},
    @{Path="a_user_front"; Name="a-user-front"},
    @{Path="gestion_forum_front"; Name="gestion-forum-front"}
)

$simpleDockerfile = @'
# Dockerfile simplifié - utilise le build local
FROM nginx:alpine

# Copier le build pré-construit
COPY build /usr/share/nginx/html

# Copier la configuration nginx si elle existe
COPY nginx.conf /etc/nginx/conf.d/default.conf 2>/dev/null || true

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
'@

foreach ($frontend in $frontends) {
    $dockerfilePath = Join-Path $frontend.Path "Dockerfile.simple"
    
    Write-Host "Création de $dockerfilePath..." -ForegroundColor Yellow
    $simpleDockerfile | Out-File -FilePath $dockerfilePath -Encoding UTF8
    
    Write-Host "✓ Créé: $dockerfilePath" -ForegroundColor Green
}

Write-Host "`nDockerfiles simplifiés créés!" -ForegroundColor Green
Write-Host "`nPour les utiliser:" -ForegroundColor Yellow
Write-Host "1. Construisez les frontends localement: .\build-frontends-local.ps1" -ForegroundColor Cyan
Write-Host "2. Modifiez docker-compose.yml pour utiliser Dockerfile.simple" -ForegroundColor Cyan
Write-Host "3. Ou construisez avec: docker-compose build --build-arg DOCKERFILE=Dockerfile.simple" -ForegroundColor Cyan
