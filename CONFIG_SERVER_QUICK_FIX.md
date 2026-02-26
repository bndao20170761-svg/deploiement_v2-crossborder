# Config Server Quick Fix Guide

## Current Situation

Your microservices are failing because they cannot load configuration from the Config Server. The Config Server is configured to fetch configurations from your GitHub repository:

**Repository:** `https://github.com/BabacarNdaoKgl/cloud-config-repo-enda.git`

## Quick Diagnosis

Run this command to check if the Config Server can serve configurations:

```powershell
.\verify-config-server.ps1
```

This will:
- Check if Config Server is running
- Test configuration endpoints for all services
- Show Config Server logs
- Verify GitHub repository accessibility

## Expected Configuration Files

Your GitHub repository should contain these files:

1. `Forum_API_PVVIH-dev.properties`
2. `Patient_API_PVVIH-dev.properties`
3. `Reference_API_PVVIH-dev.properties`
4. `User_API_PVVIH-dev.properties`
5. `GETWAY_PVVIH-dev.yml`

## Quick Fix Options

### Option A: Verify GitHub Repository (RECOMMENDED)

1. **Check if files exist in GitHub:**
   - Go to: https://github.com/BabacarNdaoKgl/cloud-config-repo-enda
   - Verify all 5 files are present
   - Verify file names match exactly (case-sensitive)

2. **If files are missing or incorrectly named:**
   - Copy files from your local Git repo: `C:\Users\babac\cloud-config-repo\cloud-config-repo-enda`
   - Push to GitHub:
     ```bash
     cd C:\Users\babac\cloud-config-repo\cloud-config-repo-enda
     git add .
     git commit -m "Add correct configuration files"
     git push origin main
     ```

3. **Restart Config Server to reload:**
   ```bash
   docker-compose restart api-configuration
   docker logs -f api-configuration
   ```

### Option B: Use Local Configuration Files (ALTERNATIVE)

If you want to use local files instead of GitHub:

1. **Copy files from your Git repo:**
   ```powershell
   .\copy-config-from-git.ps1
   ```

2. **Update Config Server to use local files:**
   
   Edit `api_configuration/demo/src/main/resources/application.properties`:
   ```properties
   spring.application.name=config-server
   server.port=8888
   
   # Use native profile for local files
   spring.profiles.active=native
   spring.cloud.config.server.native.search-locations=file:///app/config
   ```

3. **Update docker-compose.yml:**
   
   Find the `api-configuration` service and update volumes:
   ```yaml
   api-configuration:
     volumes:
       - ./cloud-config-repo:/app/config:ro
   ```

4. **Rebuild and restart:**
   ```bash
   docker-compose down
   docker-compose up -d --build api-configuration
   ```

## Verification Steps

After applying the fix:

1. **Check Config Server health:**
   ```bash
   curl http://localhost:8888/actuator/health
   ```

2. **Test configuration endpoints:**
   ```bash
   curl http://localhost:8888/Forum_API_PVVIH/dev
   curl http://localhost:8888/Patient_API_PVVIH/dev
   curl http://localhost:8888/Reference_API_PVVIH/dev
   curl http://localhost:8888/User_API_PVVIH/dev
   ```

3. **Check Config Server logs:**
   ```bash
   docker logs api-configuration
   ```
   
   Look for:
   - `Cloning repository...` (for GitHub option)
   - `Successfully cloned` (for GitHub option)
   - No errors about missing files

4. **Restart all services:**
   ```bash
   docker-compose restart forum-pvvih gestion-user gestion-patient gestion-reference gateway-pvvih
   ```

5. **Monitor service logs:**
   ```bash
   docker-compose logs -f forum-pvvih gestion-user gestion-patient gestion-reference
   ```
   
   Look for:
   - `Located property source` (successful config load)
   - No "Could not resolve placeholder" errors
   - Services registering with Eureka

## Common Issues

### Issue: "Could not resolve placeholder"

**Cause:** Configuration file is missing required properties

**Fix:** 
- Verify the configuration file contains all required properties
- For JWT services: Must have `app.jwt.secret`
- For Forum: Must have `gestion.user.url`

### Issue: Config Server logs show "Cannot clone repository"

**Cause:** GitHub repository is private or inaccessible

**Fix:**
- Make repository public, OR
- Add GitHub credentials to Config Server, OR
- Switch to local file system (Option B above)

### Issue: Services timeout waiting for Config Server

**Cause:** Config Server takes too long to start

**Fix:**
- Wait longer (Config Server needs to clone repository)
- Check Config Server logs for errors
- Increase `start_period` in docker-compose healthcheck

## Need More Help?

- **Detailed troubleshooting:** See `FIX_CONFIG_SERVER_SOLUTION.md`
- **Check service logs:** `docker-compose logs -f [service-name]`
- **Check all logs:** `docker-compose logs -f`
- **Restart everything:** `docker-compose down && docker-compose up -d`

## Quick Commands Reference

```bash
# Check what's running
docker-compose ps

# View logs for specific service
docker logs api-configuration
docker logs forum-pvvih
docker logs gestion-user

# Restart specific service
docker-compose restart api-configuration

# Restart all services
docker-compose restart

# Stop everything
docker-compose down

# Start everything fresh
docker-compose up -d --build

# Follow all logs
docker-compose logs -f
```
