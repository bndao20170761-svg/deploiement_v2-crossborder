# Update all Dockerfiles to use Maven settings.xml
Write-Host "Updating Dockerfiles to use Maven settings..." -ForegroundColor Cyan

$projects = @(
    "api_configuration/demo",
    "api_register",
    "forum_pvvih",
    "gestion_patient",
    "gestion_reference",
    "gestion_user",
    "Getway_PVVIH"
)

$newDockerfileContent = @'
FROM maven:3.9-eclipse-temurin-17-alpine AS build

# Set working directory
WORKDIR /app

# Copy Maven settings first
COPY settings.xml /root/.m2/settings.xml

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B -s /root/.m2/settings.xml || true

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests -B -s /root/.m2/settings.xml

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

# Create non-root user
RUN addgroup -S spring && adduser -S spring -G spring

# Set working directory
WORKDIR /app

# Copy jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Change ownership
RUN chown -R spring:spring /app

# Switch to non-root user
USER spring

# Expose port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
'@

foreach ($project in $projects) {
    $dockerfilePath = Join-Path $project "Dockerfile"
    if (Test-Path $dockerfilePath) {
        Write-Host "Updating Dockerfile in $project..." -ForegroundColor Yellow
        $newDockerfileContent | Out-File -FilePath $dockerfilePath -Encoding UTF8
        Write-Host "  Updated: $dockerfilePath" -ForegroundColor Green
    } else {
        Write-Host "  Skipped: $dockerfilePath (not found)" -ForegroundColor Gray
    }
}

Write-Host "`nAll Dockerfiles updated successfully!" -ForegroundColor Green
Write-Host "Run these commands in order:" -ForegroundColor Cyan
Write-Host "1. .\add-maven-mirror.ps1" -ForegroundColor Yellow
Write-Host "2. docker-compose build --no-cache" -ForegroundColor Yellow
