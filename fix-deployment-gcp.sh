#!/bin/bash
# Script de correction pour le déploiement GCP
# À exécuter sur votre VM GCP

echo "========================================"
echo "CORRECTION DU DEPLOIEMENT GCP"
echo "========================================"
echo ""

cd ~/deploiement_v2-crossborder

echo "1. Arrêt de tous les services..."
docker-compose down
echo "✓ Services arrêtés"
echo ""

echo "2. Nettoyage des conteneurs et réseaux..."
docker system prune -f
echo "✓ Nettoyage effectué"
echo ""

echo "3. Vérification du fichier .env..."
if [ ! -f .env ]; then
    echo "Création du fichier .env..."
    cat > .env << 'EOF'
# Database passwords
MONGO_PASSWORD=admin123
MYSQL_ROOT_PASSWORD=root123
MYSQL_USER_PASSWORD=user123
MYSQL_REFERENCE_PASSWORD=reference123
MYSQL_PATIENT_PASSWORD=patient123

# JWT Secret (IMPORTANT: Changez cette valeur en production!)
JWT_SECRET=VotreSecretJWTTresSecurise123456789

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://34.32.116.206:3001,http://34.32.116.206:3002,http://34.32.116.206:3003,http://localhost:3001,http://localhost:3002,http://localhost:3003

# Frontend URLs
REACT_APP_GATEWAY_URL=http://34.32.116.206:8080
REACT_APP_API_URL=http://34.32.116.206:8080
REACT_APP_USER_API_URL=http://34.32.116.206:8080
REACT_APP_FORUM_API_URL=http://34.32.116.206:8080
REACT_APP_AUTH_API_URL=http://34.32.116.206:8080/api/auth
REACT_APP_FORUM_URL=http://34.32.116.206:3001
REACT_APP_FRONTEND1_URL=http://34.32.116.206:3002
REACT_APP_FRONTEND2_URL=http://34.32.116.206:3003

# Spring Profile
SPRING_PROFILES_ACTIVE=prod
EOF
    echo "✓ Fichier .env créé"
else
    echo "✓ Fichier .env existe déjà"
fi
echo ""

echo "4. Démarrage des bases de données..."
docker-compose up -d mongodb mysql-user mysql-reference mysql-patient
echo "Attente de 45 secondes pour l'initialisation des bases de données..."
sleep 45
echo "✓ Bases de données démarrées"
echo ""

echo "5. Vérification de l'état des bases de données..."
docker-compose ps mongodb mysql-user mysql-reference mysql-patient
echo ""

echo "6. Initialisation de la base de données user_db..."
docker exec -i mysql-user mysql -uroot -proot123 << 'EOSQL'
CREATE DATABASE IF NOT EXISTS user_db;
USE user_db;

-- Vérifier si les tables existent déjà
SELECT COUNT(*) INTO @table_exists FROM information_schema.tables 
WHERE table_schema = 'user_db' AND table_name = 'users';

-- Créer les tables si elles n'existent pas
SET @create_tables = IF(@table_exists = 0, 'true', 'false');

-- Table users
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nom VARCHAR(255),
    prenom VARCHAR(255),
    profil VARCHAR(50),
    sexe VARCHAR(10),
    nationalite VARCHAR(100),
    statut_matrimoniale VARCHAR(50),
    active BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_dernier_acces TIMESTAMP NULL
);

-- Table roles
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Table user_roles
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Insérer les rôles par défaut
INSERT IGNORE INTO roles (name) VALUES ('ROLE_ADMIN'), ('ROLE_USER'), ('ROLE_PATIENT'), ('ROLE_DOCTOR');

SELECT 'Base de données user_db initialisée avec succès' AS status;
EOSQL

if [ $? -eq 0 ]; then
    echo "✓ Base de données user_db initialisée"
else
    echo "✗ Erreur lors de l'initialisation de user_db"
fi
echo ""

echo "7. Démarrage de l'API Register (Eureka)..."
docker-compose up -d api-register
echo "Attente de 40 secondes pour Eureka..."
sleep 40
echo "✓ API Register démarré"
echo ""

echo "8. Vérification d'Eureka..."
curl -s http://localhost:8761/actuator/health | head -5
echo ""

echo "9. Démarrage de l'API Configuration..."
docker-compose up -d api-configuration
echo "Attente de 40 secondes pour Config Server..."
sleep 40
echo "✓ API Configuration démarré"
echo ""

echo "10. Vérification du Config Server..."
curl -s http://localhost:8888/actuator/health | head -5
echo ""

echo "11. Démarrage de la Gateway..."
docker-compose up -d gateway-pvvih
echo "Attente de 40 secondes pour la Gateway..."
sleep 40
echo "✓ Gateway démarré"
echo ""

echo "12. Vérification de la Gateway..."
curl -s http://localhost:8080/actuator/health | head -5
echo ""

echo "13. Démarrage des services métier..."
docker-compose up -d gestion-user gestion-reference gestion-patient forum-pvvih
echo "Attente de 60 secondes pour les services métier..."
sleep 60
echo "✓ Services métier démarrés"
echo ""

echo "14. Démarrage des frontends..."
docker-compose up -d gestion-forum-front a-reference-front a-user-front
echo "Attente de 20 secondes pour les frontends..."
sleep 20
echo "✓ Frontends démarrés"
echo ""

echo "15. État final de tous les services..."
docker-compose ps
echo ""

echo "16. Vérification des services enregistrés dans Eureka..."
docker logs api-register 2>&1 | grep "registered with" | tail -10
echo ""

echo "17. Test des endpoints principaux..."
echo ""
echo "Test Gateway Health:"
curl -s http://localhost:8080/actuator/health
echo ""
echo ""
echo "Test Gateway Routes:"
curl -s http://localhost:8080/actuator/gateway/routes | head -20
echo ""

echo "========================================"
echo "CORRECTION TERMINEE"
echo "========================================"
echo ""
echo "Vérifications à faire:"
echo "1. Tous les services doivent être 'healthy': docker-compose ps"
echo "2. Tester un endpoint: curl -X POST http://localhost:8080/api/auth/login -H 'Content-Type: application/json' -d '{\"username\":\"test\",\"password\":\"test\"}'"
echo "3. Vérifier les logs si problème: docker logs <service-name>"
echo ""
echo "Si les problèmes persistent:"
echo "1. Vérifiez les logs de la Gateway: docker logs gateway-pvvih"
echo "2. Vérifiez les logs de gestion-user: docker logs gestion-user"
echo "3. Exécutez: ./check-logs-gcp.sh"
