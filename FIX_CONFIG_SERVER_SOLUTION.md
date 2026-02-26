# Configuration Server Fix - Complete Solution

## Problem Summary

The microservices are failing to start because they cannot load configuration properties from the Config Server. The errors indicate:

1. **Forum Service**: `Could not resolve placeholder 'gestion.user.url'`
2. **Patient/Reference/User Services**: `Could not resolve placeholder 'app.jwt.secret'`
3. **Gateway Service**: Trying to connect to `localhost:8761` instead of `api-register:8761`

## Root Cause

The Config Server is configured to fetch configuration files from GitHub:
- Repository: `https://github.com/BabacarNdaoKgl/cloud-config-repo-enda.git`
- Branch: `main`

The services are looking for configuration files with the pattern:
- `Forum_API_PVVIH-dev.properties`
- `Patient_API_PVVIH-dev.properties`
- `Reference_API_PVVIH-dev.properties`
- `User_API_PVVIH-dev.properties`
- `GETWAY_PVVIH-dev.yml`

## Solution Options

### Option 1: Use GitHub Repository (RECOMMENDED)

This is the current setup and follows Spring Cloud Config best practices.

**Advantages:**
- Centralized configuration management
- Version control for configurations
- No need to rebuild containers when config changes
- Production-ready approach

**Requirements:**
1. Ensure all configuration files exist in the GitHub repository
2. Files must be named correctly: `{ServiceName}-{Profile}.properties`
3. Config Server needs time to clone the repository on startup

**Steps:**
1. Verify files exist in GitHub repository
2. Ensure proper startup order in docker-compose
3. Increase startup timeout for dependent services

### Option 2: Use Local File System (ALTERNATIVE)

Mount a local directory with configuration files.

**Advantages:**
- Faster startup (no Git clone needed)
- Works offline
- Easier for local development

**Disadvantages:**
- Not production-ready
- Requires manual file synchronization
- No version control integration

## Implementation

### Current Configuration

The Config Server (`api_configuration/demo/src/main/resources/application.properties`) is configured as:

```properties
spring.cloud.config.server.git.uri=https://github.com/BabacarNdaoKgl/cloud-config-repo-enda.git
spring.cloud.config.server.git.default-label=main
spring.cloud.config.server.git.clone-on-start=true
spring.cloud.config.server.git.timeout=10
```

### Required Configuration Files in GitHub

The following files must exist in the GitHub repository:

1. **Forum_API_PVVIH-dev.properties**
   - Must contain: `gestion.user.url`, `app.jwt.secret`, MongoDB config

2. **Patient_API_PVVIH-dev.properties**
   - Must contain: `app.jwt.secret`, database config

3. **Reference_API_PVVIH-dev.properties**
   - Must contain: `app.jwt.secret`, database config

4. **User_API_PVVIH-dev.properties**
   - Must contain: `app.jwt.secret`, database config

5. **GETWAY_PVVIH-dev.yml**
   - Must contain: Eureka config, route definitions

### Verification Steps

1. **Check GitHub Repository**
   ```bash
   # Clone the repository to verify files
   git clone https://github.com/BabacarNdaoKgl/cloud-config-repo-enda.git temp-check
   cd temp-check
   ls -la
   ```

2. **Test Config Server Locally**
   ```bash
   # After services start, test config server endpoints
   curl http://localhost:8888/Forum_API_PVVIH/dev
   curl http://localhost:8888/Patient_API_PVVIH/dev
   curl http://localhost:8888/Reference_API_PVVIH/dev
   curl http://localhost:8888/User_API_PVVIH/dev
   curl http://localhost:8888/GETWAY_PVVIH/dev
   ```

3. **Check Config Server Logs**
   ```bash
   docker logs api-configuration
   ```

   Look for:
   - `Cloning repository...`
   - `Successfully cloned repository`
   - No authentication errors

## Troubleshooting

### Issue: Config Server Cannot Clone Repository

**Symptoms:**
- Config Server logs show Git clone errors
- Services timeout waiting for config

**Solutions:**
1. Check if repository is public (no authentication needed)
2. If private, add GitHub credentials to Config Server
3. Check network connectivity from Docker container

### Issue: Configuration Files Not Found

**Symptoms:**
- Config Server starts successfully
- Services report "Could not resolve placeholder"

**Solutions:**
1. Verify file names match exactly (case-sensitive)
2. Verify files are in the root of the repository
3. Check the branch name (should be `main`)

### Issue: Services Start Before Config Server Ready

**Symptoms:**
- Services fail immediately on startup
- Config Server is still cloning repository

**Solutions:**
1. Increase `start_period` in healthcheck
2. Add retry logic in service configuration
3. Use `spring.cloud.config.fail-fast=false` (already configured)

## Next Steps

1. **Verify GitHub Repository Contents**
   - Confirm all 5 configuration files exist
   - Verify file naming is correct
   - Check file contents have all required properties

2. **Update Docker Compose** (if needed)
   - Ensure proper health checks
   - Verify startup dependencies

3. **Restart Services**
   ```bash
   docker-compose down
   docker-compose up -d
   docker-compose logs -f
   ```

4. **Monitor Startup**
   - Watch Config Server logs for successful clone
   - Watch service logs for successful config loading
   - Verify all services register with Eureka

## Alternative: Switch to Local File System

If GitHub approach doesn't work, you can switch to local file system:

1. **Copy configuration files to local directory**
   ```powershell
   .\copy-config-from-git.ps1
   ```

2. **Update Config Server application.properties**
   ```properties
   # Comment out Git configuration
   # spring.cloud.config.server.git.uri=...
   
   # Add native profile
   spring.profiles.active=native
   spring.cloud.config.server.native.search-locations=file:///app/config
   ```

3. **Update docker-compose.yml**
   ```yaml
   api-configuration:
     volumes:
       - ./cloud-config-repo:/app/config:ro
   ```

4. **Rebuild and restart**
   ```bash
   docker-compose down
   docker-compose up -d --build api-configuration
   ```
