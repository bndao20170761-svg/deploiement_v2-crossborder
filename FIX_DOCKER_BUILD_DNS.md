# Fix Docker Build DNS Issues

## Problem
Maven cannot resolve `repo.maven.apache.org` during Docker build, causing all Spring Boot services to fail building.

## Root Cause
Docker containers cannot resolve DNS names, likely due to:
1. Docker Desktop DNS configuration issues
2. Network/firewall blocking Maven Central
3. DNS server not responding

## Solutions (Try in Order)

### Solution 1: Fix Docker DNS Configuration (Recommended)

```powershell
# Run the DNS fix script
.\fix-docker-dns.ps1

# Restart Docker Desktop manually
# Then rebuild
docker-compose build --no-cache
```

### Solution 2: Use Maven Mirror

```powershell
# Add Maven mirror configuration
.\add-maven-mirror.ps1

# Update Dockerfiles to use settings
.\update-dockerfiles-maven.ps1

# Rebuild
docker-compose build --no-cache
```

### Solution 3: Build with Host Network

```powershell
# Build using host network (bypasses Docker DNS)
.\build-with-host-network.ps1
```

### Solution 4: Manual Docker Desktop DNS Fix

1. Open Docker Desktop
2. Go to Settings → Docker Engine
3. Add DNS configuration:

```json
{
  "dns": ["8.8.8.8", "8.8.4.4", "1.1.1.1"]
}
```

4. Click "Apply & Restart"
5. Rebuild: `docker-compose build --no-cache`

### Solution 5: Check Windows Network

```powershell
# Test DNS resolution
nslookup repo.maven.apache.org

# Flush DNS cache
ipconfig /flushdns

# Reset network
netsh winsock reset
netsh int ip reset
```

## Verification

After applying fixes:

```powershell
# Test if Maven Central is reachable
docker run --rm maven:3.9-eclipse-temurin-17-alpine ping -c 3 repo.maven.apache.org

# Try building one service
docker-compose build --no-cache api-configuration

# If successful, build all
docker-compose build --no-cache
```

## Alternative: Build Without Docker

If Docker DNS issues persist, build JARs locally:

```powershell
# Build each Spring Boot project
cd api_configuration/demo
mvn clean package -DskipTests

cd ../../api_register
mvn clean package -DskipTests

# ... repeat for all services
```

Then modify Dockerfiles to just copy pre-built JARs.

## Quick Reference

| Issue | Command |
|-------|---------|
| Fix DNS | `.\fix-docker-dns.ps1` |
| Add Maven mirror | `.\add-maven-mirror.ps1` |
| Build with fixes | `.\build-with-host-network.ps1` |
| Test DNS | `docker run --rm maven:3.9-eclipse-temurin-17-alpine ping repo.maven.apache.org` |
| Clean rebuild | `docker-compose build --no-cache` |

## Next Steps

Once builds succeed:
1. Start services: `docker-compose up -d`
2. Verify: `.\verify-setup.ps1`
3. Check logs: `docker-compose logs -f`
