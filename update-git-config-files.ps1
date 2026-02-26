# Script pour mettre à jour les fichiers de configuration dans le dépôt Git
# Ces fichiers seront utilisés par le Config Server

$gitRepoPath = "C:\Users\babac\cloud-config-repo\cloud-config-repo-enda"

Write-Host "Mise à jour des fichiers de configuration pour Docker..." -ForegroundColor Cyan
Write-Host ""

# Vérifier que le dépôt existe
if (-not (Test-Path $gitRepoPath)) {
    Write-Host "ERREUR: Dépôt Git non trouvé à: $gitRepoPath" -ForegroundColor Red
    exit 1
}

# Forum_API_PVVIH-dev.properties
$forumConfig = @"
# Configuration Cloud Config
spring.application.name=Forum_API_PVVIH
server.port=8080

# Configuration MongoDB
spring.data.mongodb.uri=mongodb://admin:`${MONGO_PASSWORD:admin123}@mongodb:27017/forum_db?authSource=admin
spring.data.mongodb.database=forum_db

# Configuration Feign
feign.client.config.default.connect-timeout=86400
feign.client.config.default.read-timeout=86400

# URL du microservice gestion_user (utiliser le nom du service Docker)
gestion.user.url=gestion-user:8080

# JWT configuration
app.jwt.secret=hF9IsSdyj/KnkZiAJsAnwKsf4rJombf3MAX4pZFBzql8WQyPFy8gVSGxUyTaT3m4gE9yG+i1KGz5BpP5k8+jgg==
app.jwt.expiration=3600000

# Configuration des services de traduction
translation.google.enabled=false
translation.libre.enabled=true
translation.libre.url=http://localhost:5000
translation.cache.enabled=true

# Désactiver la vérification de compatibilité Spring Cloud
spring.cloud.compatibility-verifier.enabled=false
"@

# User_API_PVVIH-dev.properties
$userConfig = @"
spring.application.name=User_API_PVVIH
server.port=8080

# Configuration base de données
spring.datasource.url=jdbc:mysql://mysql-user:3306/user_db
spring.datasource.username=user_service
spring.datasource.password=user123
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# HikariCP : limite les avertissements "clock leap" après veille du PC
spring.datasource.hikari.max-lifetime=1800000
spring.datasource.hikari.keepalive-time=30000
spring.datasource.hikari.connection-timeout=30000

# JPA / Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# Sécurité / JWT
app.jwt.secret=hF9IsSdyj/KnkZiAJsAnwKsf4rJombf3MAX4pZFBzql8WQyPFy8gVSGxUyTaT3m4gE9yG+i1KGz5BpP5k8+jgg==
app.jwt.expiration=3600000

# Réduire les logs verbeux
logging.level.com.netflix.discovery=WARN
logging.level.com.zaxxer.hikari=ERROR
"@

# Patient_API_PVVIH-dev.properties
$patientConfig = @"
spring.application.name=Patient_API_PVVIH
server.port=8080

# Configuration base de données
spring.datasource.url=jdbc:mysql://mysql-patient:3306/patient_db
spring.datasource.username=patient_service
spring.datasource.password=patient123
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA / Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# Sécurité / JWT
app.jwt.secret=hF9IsSdyj/KnkZiAJsAnwKsf4rJombf3MAX4pZFBzql8WQyPFy8gVSGxUyTaT3m4gE9yG+i1KGz5BpP5k8+jgg==
app.jwt.expiration=3600000
"@

# Reference_API_PVVIH-dev.properties
$referenceConfig = @"
spring.application.name=Reference_API_PVVIH
server.port=8080

# Configuration base de données
spring.datasource.url=jdbc:mysql://mysql-reference:3306/reference_db
spring.datasource.username=reference_service
spring.datasource.password=reference123
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA / Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# Sécurité / JWT
app.jwt.secret=hF9IsSdyj/KnkZiAJsAnwKsf4rJombf3MAX4pZFBzql8WQyPFy8gVSGxUyTaT3m4gE9yG+i1KGz5BpP5k8+jgg==
app.jwt.expiration=3600000

# Bean definition overriding
spring.main.allow-bean-definition-overriding=true

# Logs pour debugging
logging.level.sn.uasz.referencement_PVVIH.feign=DEBUG
logging.level.sn.uasz.referencement_PVVIH.config.FeignClientInterceptor=DEBUG
logging.level.org.springframework.security=DEBUG
logging.level.feign=DEBUG
"@

# Écrire les fichiers
Write-Host "Écriture des fichiers de configuration..." -ForegroundColor Yellow

$files = @{
    "Forum_API_PVVIH-dev.properties" = $forumConfig
    "User_API_PVVIH-dev.properties" = $userConfig
    "Patient_API_PVVIH-dev.properties" = $patientConfig
    "Reference_API_PVVIH-dev.properties" = $referenceConfig
}

foreach ($fileName in $files.Keys) {
    $filePath = Join-Path $gitRepoPath $fileName
    $content = $files[$fileName]
    
    try {
        Set-Content -Path $filePath -Value $content -Encoding UTF8
        Write-Host "  $fileName : OK" -ForegroundColor Green
    }
    catch {
        Write-Host "  $fileName : ERREUR - $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Fichiers mis à jour avec succès!" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. Commitez les modifications:" -ForegroundColor White
Write-Host "   cd `"$gitRepoPath`"" -ForegroundColor Gray
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m `"Configuration Docker pour microservices`"" -ForegroundColor Gray
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Redémarrez le Config Server:" -ForegroundColor White
Write-Host "   docker-compose restart api-configuration" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Redémarrez les microservices:" -ForegroundColor White
Write-Host "   docker-compose restart forum-pvvih gestion-user gestion-patient gestion-reference" -ForegroundColor Gray
Write-Host ""
