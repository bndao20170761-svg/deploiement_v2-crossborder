#!/bin/bash

# ============================================================================
# SCRIPT DE DÉPLOIEMENT VERS DOCKER HUB
# ============================================================================
# Ce script build les images localement, les tag et les pousse vers Docker Hub
# ============================================================================

set -e

echo "============================================================================"
echo "DÉPLOIEMENT VERS DOCKER HUB"
echo "============================================================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Demander le nom d'utilisateur Docker Hub
read -p "Entrez votre nom d'utilisateur Docker Hub (ex: babacar1011): " DOCKER_USERNAME

if [ -z "$DOCKER_USERNAME" ]; then
    log_error "Nom d'utilisateur requis!"
    exit 1
fi

# Version/tag des images
read -p "Entrez le tag de version (défaut: latest): " VERSION
VERSION=${VERSION:-latest}

log_info "Connexion à Docker Hub..."
docker login

echo ""
log_info "============================================================================"
log_info "ÉTAPE 1/4: BUILD DES IMAGES LOCALEMENT"
log_info "============================================================================"
echo ""

docker compose build

echo ""
log_info "============================================================================"
log_info "ÉTAPE 2/4: TAG DES IMAGES POUR DOCKER HUB"
log_info "============================================================================"
echo ""

# Liste des services à pousser
SERVICES=(
    "api-register"
    "api-configuration"
    "gateway-pvvih"
    "forum-pvvih"
    "gestion-user"
    "gestion-reference"
    "gestion-patient"
    "gestion-forum-front"
    "a-reference-front"
    "a-user-front"
)

for SERVICE in "${SERVICES[@]}"; do
    LOCAL_IMAGE="deploiement_v2-crossborder-${SERVICE}:latest"
    REMOTE_IMAGE="${DOCKER_USERNAME}/${SERVICE}:${VERSION}"
    
    log_info "Tag: ${LOCAL_IMAGE} -> ${REMOTE_IMAGE}"
    docker tag ${LOCAL_IMAGE} ${REMOTE_IMAGE}
done

echo ""
log_info "============================================================================"
log_info "ÉTAPE 3/4: PUSH DES IMAGES VERS DOCKER HUB"
log_info "============================================================================"
echo ""

for SERVICE in "${SERVICES[@]}"; do
    REMOTE_IMAGE="${DOCKER_USERNAME}/${SERVICE}:${VERSION}"
    
    log_info "Push: ${REMOTE_IMAGE}"
    docker push ${REMOTE_IMAGE}
done

echo ""
log_info "============================================================================"
log_info "ÉTAPE 4/4: CRÉATION DU FICHIER DE DÉPLOIEMENT GCP"
log_info "============================================================================"
echo ""

# Créer un fichier docker-compose pour GCP qui utilise les images Docker Hub
cat > docker-compose.gcp.yml <<EOF
version: '3.8'

networks:
  pvvih-network:
    driver: bridge

volumes:
  mongodb-data:
  mysql-user-data:
  mysql-reference-data:
  mysql-patient-data:

services:
  # ==================== Database Services ====================
  
  mongodb:
    image: mongo:7.0
    container_name: mongodb
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=\${MONGO_PASSWORD:-admin123}
      - MONGO_INITDB_DATABASE=forum_db
    volumes:
      - mongodb-data:/data/db
    networks:
      - pvvih-network
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    restart: unless-stopped

  mysql-user:
    image: mysql:8.0
    container_name: mysql-user
    ports:
      - "3307:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=\${MYSQL_ROOT_PASSWORD:-root123}
      - MYSQL_DATABASE=user_db
      - MYSQL_USER=user_service
      - MYSQL_PASSWORD=\${MYSQL_USER_PASSWORD:-user123}
    volumes:
      - mysql-user-data:/var/lib/mysql
    networks:
      - pvvih-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    restart: unless-stopped

  mysql-reference:
    image: mysql:8.0
    container_name: mysql-reference
    ports:
      - "3308:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=\${MYSQL_ROOT_PASSWORD:-root123}
      - MYSQL_DATABASE=reference_db
      - MYSQL_USER=reference_service
      - MYSQL_PASSWORD=\${MYSQL_REFERENCE_PASSWORD:-reference123}
    volumes:
      - mysql-reference-data:/var/lib/mysql
    networks:
      - pvvih-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    restart: unless-stopped

  mysql-patient:
    image: mysql:8.0
    container_name: mysql-patient
    ports:
      - "3309:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=\${MYSQL_ROOT_PASSWORD:-root123}
      - MYSQL_DATABASE=patient_db
      - MYSQL_USER=patient_service
      - MYSQL_PASSWORD=\${MYSQL_PATIENT_PASSWORD:-patient123}
    volumes:
      - mysql-patient-data:/var/lib/mysql
    networks:
      - pvvih-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    restart: unless-stopped

  # ==================== Edge Services ====================
  
  api-register:
    image: ${DOCKER_USERNAME}/api-register:${VERSION}
    container_name: api-register
    ports:
      - "8761:8761"
    environment:
      - SPRING_PROFILES_ACTIVE=\${SPRING_PROFILES_ACTIVE:-dev}
      - EUREKA_CLIENT_REGISTER_WITH_EUREKA=false
      - EUREKA_CLIENT_FETCH_REGISTRY=false
    networks:
      - pvvih-network
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:8761/actuator/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s
    restart: unless-stopped

  api-configuration:
    image: ${DOCKER_USERNAME}/api-configuration:${VERSION}
    container_name: api-configuration
    ports:
      - "8888:8888"
    environment:
      - SPRING_PROFILES_ACTIVE=\${SPRING_PROFILES_ACTIVE:-dev}
      - EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://api-register:8761/eureka/
    networks:
      - pvvih-network
    depends_on:
      api-register:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:8888/actuator/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s
    restart: unless-stopped

  gateway-pvvih:
    image: ${DOCKER_USERNAME}/gateway-pvvih:${VERSION}
    container_name: gateway-pvvih
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=\${SPRING_PROFILES_ACTIVE:-dev}
      - EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://api-register:8761/eureka/
      - SPRING_CLOUD_CONFIG_URI=http://api-configuration:8888
      - CORS_ALLOWED_ORIGINS=\${CORS_ALLOWED_ORIGINS}
      - JWT_SECRET=\${JWT_SECRET}
    networks:
      - pvvih-network
    depends_on:
      api-register:
        condition: service_healthy
      api-configuration:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s
    restart: unless-stopped

  # ==================== Backend Services ====================
  
  forum-pvvih:
    image: ${DOCKER_USERNAME}/forum-pvvih:${VERSION}
    container_name: forum-pvvih
    ports:
      - "9092:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=\${SPRING_PROFILES_ACTIVE:-dev}
      - EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://api-register:8761/eureka/
      - SPRING_CLOUD_CONFIG_URI=http://api-configuration:8888
      - SPRING_DATA_MONGODB_URI=mongodb://admin:\${MONGO_PASSWORD:-admin123}@mongodb:27017/forum_db?authSource=admin
      - SPRING_DATA_MONGODB_DATABASE=forum_db
      - SERVER_PORT=8080
      - CORS_ALLOWED_ORIGINS=\${CORS_ALLOWED_ORIGINS}
      - JWT_SECRET=\${JWT_SECRET}
      - APP_JWT_SECRET=\${JWT_SECRET}
      - APP_JWT_EXPIRATION=3600000
    networks:
      - pvvih-network
    depends_on:
      mongodb:
        condition: service_healthy
      api-register:
        condition: service_healthy
      api-configuration:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 90s
    restart: unless-stopped

  gestion-user:
    image: ${DOCKER_USERNAME}/gestion-user:${VERSION}
    container_name: gestion-user
    ports:
      - "9089:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=\${SPRING_PROFILES_ACTIVE:-dev}
      - EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://api-register:8761/eureka/
      - SPRING_CLOUD_CONFIG_URI=http://api-configuration:8888
      - SPRING_DATASOURCE_URL=jdbc:mysql://mysql-user:3306/user_db
      - SPRING_DATASOURCE_USERNAME=user_service
      - SPRING_DATASOURCE_PASSWORD=\${MYSQL_USER_PASSWORD:-user123}
      - SERVER_PORT=8080
      - CORS_ALLOWED_ORIGINS=\${CORS_ALLOWED_ORIGINS}
      - JWT_SECRET=\${JWT_SECRET}
      - APP_JWT_SECRET=\${JWT_SECRET}
      - APP_JWT_EXPIRATION=3600000
    networks:
      - pvvih-network
    depends_on:
      mysql-user:
        condition: service_healthy
      api-register:
        condition: service_healthy
      api-configuration:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 90s
    restart: unless-stopped

  gestion-reference:
    image: ${DOCKER_USERNAME}/gestion-reference:${VERSION}
    container_name: gestion-reference
    ports:
      - "9090:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=\${SPRING_PROFILES_ACTIVE:-dev}
      - EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://api-register:8761/eureka/
      - SPRING_CLOUD_CONFIG_URI=http://api-configuration:8888
      - SPRING_DATASOURCE_URL=jdbc:mysql://mysql-reference:3306/reference_db
      - SPRING_DATASOURCE_USERNAME=reference_service
      - SPRING_DATASOURCE_PASSWORD=\${MYSQL_REFERENCE_PASSWORD:-reference123}
      - APP_JWT_SECRET=\${JWT_SECRET}
      - APP_JWT_EXPIRATION=3600000
      - SERVER_PORT=8080
      - CORS_ALLOWED_ORIGINS=\${CORS_ALLOWED_ORIGINS}
      - JWT_SECRET=\${JWT_SECRET}
    networks:
      - pvvih-network
    depends_on:
      mysql-reference:
        condition: service_healthy
      api-register:
        condition: service_healthy
      api-configuration:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 90s
    restart: unless-stopped

  gestion-patient:
    image: ${DOCKER_USERNAME}/gestion-patient:${VERSION}
    container_name: gestion-patient
    ports:
      - "9091:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=\${SPRING_PROFILES_ACTIVE:-dev}
      - EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://api-register:8761/eureka/
      - SPRING_CLOUD_CONFIG_URI=http://api-configuration:8888
      - SPRING_DATASOURCE_URL=jdbc:mysql://mysql-patient:3306/patient_db
      - SPRING_DATASOURCE_USERNAME=patient_service
      - SPRING_DATASOURCE_PASSWORD=\${MYSQL_PATIENT_PASSWORD:-patient123}
      - SERVER_PORT=8080
      - CORS_ALLOWED_ORIGINS=\${CORS_ALLOWED_ORIGINS}
      - JWT_SECRET=\${JWT_SECRET}
      - APP_JWT_SECRET=\${JWT_SECRET}
      - APP_JWT_EXPIRATION=3600000
    networks:
      - pvvih-network
    depends_on:
      mysql-patient:
        condition: service_healthy
      api-register:
        condition: service_healthy
      api-configuration:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 90s
    restart: unless-stopped

  # ==================== Frontend Services ====================
  
  gestion-forum-front:
    image: ${DOCKER_USERNAME}/gestion-forum-front:${VERSION}
    container_name: gestion-forum-front
    ports:
      - "3001:80"
    environment:
      - REACT_APP_FORUM_API_URL=\${REACT_APP_FORUM_API_URL}
      - REACT_APP_AUTH_API_URL=\${REACT_APP_AUTH_API_URL}
      - REACT_APP_GATEWAY_URL=\${REACT_APP_GATEWAY_URL}
      - REACT_APP_FRONTEND1_URL=\${REACT_APP_FRONTEND1_URL}
      - REACT_APP_FRONTEND2_URL=\${REACT_APP_FRONTEND2_URL}
    networks:
      - pvvih-network
    depends_on:
      - gateway-pvvih
    restart: unless-stopped

  a-reference-front:
    image: ${DOCKER_USERNAME}/a-reference-front:${VERSION}
    container_name: a-reference-front
    ports:
      - "3002:80"
    environment:
      - REACT_APP_API_URL=\${REACT_APP_API_URL}
      - REACT_APP_GATEWAY_URL=\${REACT_APP_GATEWAY_URL}
      - REACT_APP_FORUM_URL=\${REACT_APP_FORUM_URL}
      - REACT_APP_FRONTEND2_URL=\${REACT_APP_FRONTEND2_URL}
    networks:
      - pvvih-network
    depends_on:
      - gateway-pvvih
    restart: unless-stopped

  a-user-front:
    image: ${DOCKER_USERNAME}/a-user-front:${VERSION}
    container_name: a-user-front
    ports:
      - "3003:80"
    environment:
      - REACT_APP_API_URL=\${REACT_APP_API_URL}
      - REACT_APP_GATEWAY_URL=\${REACT_APP_GATEWAY_URL}
      - REACT_APP_USER_API_URL=\${REACT_APP_USER_API_URL}
      - REACT_APP_FORUM_URL=\${REACT_APP_FORUM_URL}
      - REACT_APP_FRONTEND1_URL=\${REACT_APP_FRONTEND1_URL}
    networks:
      - pvvih-network
    depends_on:
      - gateway-pvvih
    restart: unless-stopped
EOF

log_info "Fichier docker-compose.gcp.yml créé!"

echo ""
log_info "============================================================================"
log_info "DÉPLOIEMENT TERMINÉ!"
log_info "============================================================================"
echo ""
log_info "Images poussées vers Docker Hub:"
for SERVICE in "${SERVICES[@]}"; do
    echo "  - ${DOCKER_USERNAME}/${SERVICE}:${VERSION}"
done
echo ""
log_info "Pour déployer sur GCP:"
echo "  1. Copiez le fichier docker-compose.gcp.yml sur votre instance GCP"
echo "  2. Copiez le fichier .env sur votre instance GCP"
echo "  3. Sur GCP, exécutez: docker compose -f docker-compose.gcp.yml up -d"
echo ""
