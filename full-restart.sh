#!/bin/bash
# Redémarrage complet avec vérifications

echo "=========================================="
echo "REDEMARRAGE COMPLET DU SYSTEME"
echo "=========================================="
echo ""

cd ~/deploiement_v2-crossborder

echo "Étape 1: Arrêt de tous les services..."
docker-compose down
sleep 5
echo "✓ Services arrêtés"
echo ""

echo "Étape 2: Nettoyage..."
docker system prune -f
echo "✓ Nettoyage effectué"
echo ""

echo "Étape 3: Démarrage des bases de données..."
docker-compose up -d mongodb mysql-user mysql-reference mysql-patient
echo "Attente de 45 secondes..."
sleep 45

echo "Vérification des bases de données:"
docker-compose ps mongodb mysql-user mysql-reference mysql-patient
echo ""

echo "Étape 4: Démarrage d'Eureka..."
docker-compose up -d api-register
echo "Attente de 45 secondes pour Eureka..."
sleep 45

echo "Vérification d'Eureka:"
docker logs api-register 2>&1 | grep -i "started\|running" | tail -5
echo ""
echo "Test HTTP Eureka:"
curl -s http://localhost:8761 | head -10
echo ""

echo "Étape 5: Démarrage du Config Server..."
docker-compose up -d api-configuration
echo "Attente de 45 secondes..."
sleep 45

echo "Vérification du Config Server:"
docker logs api-configuration 2>&1 | grep -i "started\|running" | tail -5
echo ""

echo "Étape 6: Démarrage de la Gateway..."
docker-compose up -d gateway-pvvih
echo "Attente de 50 secondes..."
sleep 50

echo "Vérification de la Gateway:"
docker logs gateway-pvvih 2>&1 | grep -i "started\|running\|netty" | tail -10
echo ""

echo "Étape 7: Démarrage des services métier..."
docker-compose up -d gestion-user
echo "Attente de 50 secondes pour gestion-user..."
sleep 50

echo "Vérification de gestion-user:"
docker logs gestion-user 2>&1 | grep -i "started\|running\|tomcat" | tail -10
echo ""

echo "Démarrage des autres services..."
docker-compose up -d gestion-reference gestion-patient forum-pvvih
echo "Attente de 60 secondes..."
sleep 60
echo ""

echo "Étape 8: Vérifications finales..."
echo ""

echo "État de tous les services:"
docker-compose ps
echo ""

echo "Services enregistrés dans Eureka:"
docker logs api-register 2>&1 | grep "registered with" | tail -15
echo ""

echo "Test direct de gestion-user:"
curl -s http://localhost:9089/actuator/health
echo ""
echo ""

echo "Test de la Gateway:"
curl -s http://localhost:8080/actuator/health
echo ""
echo ""

echo "Test endpoint via Gateway:"
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}' \
  -w "\nHTTP Status: %{http_code}\n" 2>&1
echo ""

echo "=========================================="
echo "REDEMARRAGE TERMINE"
echo "=========================================="
echo ""
echo "Si vous voyez toujours des erreurs:"
echo "1. Vérifiez les logs: docker logs <service-name>"
echo "2. Vérifiez le fichier .env existe et contient les bonnes valeurs"
echo "3. Vérifiez que les ports ne sont pas déjà utilisés"
