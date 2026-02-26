# Add Maven mirror configuration to all Spring Boot projects
Write-Host "Adding Maven mirror configuration to all projects..." -ForegroundColor Cyan

$projects = @(
    "api_configuration/demo",
    "api_register",
    "forum_pvvih",
    "gestion_patient",
    "gestion_reference",
    "gestion_user",
    "Getway_PVVIH"
)

$settingsXml = @"
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0
                              http://maven.apache.org/xsd/settings-1.0.0.xsd">
    <mirrors>
        <mirror>
            <id>aliyun-maven</id>
            <mirrorOf>central</mirrorOf>
            <name>Aliyun Maven Mirror</name>
            <url>https://maven.aliyun.com/repository/public</url>
        </mirror>
        <mirror>
            <id>maven-default-http-blocker</id>
            <mirrorOf>external:http:*</mirrorOf>
            <name>Pseudo repository to mirror external repositories initially using HTTP.</name>
            <url>http://0.0.0.0/</url>
            <blocked>true</blocked>
        </mirror>
    </mirrors>
</settings>
"@

foreach ($project in $projects) {
    if (Test-Path $project) {
        $settingsPath = Join-Path $project "settings.xml"
        Write-Host "Creating settings.xml in $project..." -ForegroundColor Yellow
        $settingsXml | Out-File -FilePath $settingsPath -Encoding UTF8
        Write-Host "  Created: $settingsPath" -ForegroundColor Green
    } else {
        Write-Host "  Skipped: $project (not found)" -ForegroundColor Gray
    }
}

Write-Host "`nMaven mirror configuration added to all projects." -ForegroundColor Green
Write-Host "Now update Dockerfiles to use this settings.xml" -ForegroundColor Cyan
