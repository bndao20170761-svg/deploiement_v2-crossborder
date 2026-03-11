#!/bin/bash
# Script à exécuter DIRECTEMENT sur votre VM GCP
# Usage: ./check-logs-gcp.sh

echo "========================================"
echo "VERIFICATION DES LOGS - DEPLOIEMENT GCP"
echo "========================================"
echo ""

cd ~/deploiement_v2-crossborder

echo "1. État des conteneurs:"
echo "------------------------"
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
echo ""

echo "2. Services qui ont des problèmes (unhealthy ou restarting):"
echo "------------------------------------------------------------"
docker ps -a | grep -E "(unhealthy|Restarting)" || echo "Aucun problème détecté"
echo ""

echo "3. Vérification API Register (Eureka):"
echo "---------------------------------------"
echo "Services enregistrés:"
docker logs api-register 2>&1 | grep -i "registered with" | tail -10
echo ""
echo "Dernières erreurs:"
docker logs api-register 2>&1 | grep -i "error\|exception" | tail -5
echo ""

echo "4. Vérification API Configuration:"
echo "-----------------------------------"
echo "Derniers logs:"
docker logs api-configuration 2>&1 | tail -20
echo ""
echo "Erreurs:"
docker logs api-configuration 2>&1 | grep -i "error\|exception" | tail -5
echo ""

echo "5. Vérification Gateway:"
echo "------------------------"
echo "Derniers logs:"
docker logs gateway-pvvih 2>&1 | tail -30
echo ""
echo "Erreurs de routing:"
docker logs gateway-pvvih 2>&1 | grep -i "error\|exception\|route" | tail -10
echo ""

echo "6. Vérification Gestion User:"
echo "-----------------------------"
echo "Derniers logs:"
docker logs gestion-user 2>&1 | tail -20
echo ""
echo "Erreurs:"
docker logs gestion-user 2>&1 | grep -i "error\|exception" | tail -5
echo ""

echo "7. Test de connectivité interne:"
echo "---------------------------------"
echo "Test Gateway -> API Register:"
docker exec gateway-pvvih wget -q -O- http://api-register:8761/actuator/health 2>&1 | head -5
echo ""
echo "Test Gateway -> API Configuration:"
docker exec gateway-pvvih wget -q -O- http://api-configuration:8888/actuator/health 2>&1 | head -5
echo ""
echo "Test Gateway -> Gestion User:"
docker exec gateway-pvvih wget -q -O- http://gestion-user:8080/actuator/health 2>&1 | head -5
echo ""

echo "8. Vérification des variables d'environnement de la Gateway:"
echo "------------------------------------------------------------"
docker exec gateway-pvvih env | grep -E "EUREKA|CONFIG|JWT|CORS" | sort
echo ""

echo "9. Test des endpoints depuis la Gateway:"
echo "-----------------------------------------"
echo "Test /actuator/health:"
curl -s http://localhost:8080/actuator/health | head -10
echo ""
echo "Test /actuator/gateway/routes:"
curl -s http://localhost:8080/actuator/gateway/routes | head -20
echo ""

echo "10. Réseau Docker:"
echo "------------------"
docker network inspect deploiement_v2-crossborder_pvvih-network | grep -A 5 "Containers"
echo ""

echo "========================================"
echo "VERIFICATION TERMINEE"
echo "========================================"
echo ""
echo "Pour voir les logs complets d'un service:"
echo "  docker logs <nom-du-service>"
echo ""
echo "Pour suivre les logs en temps réel:"
echo "  docker logs -f <nom-du-service>"
echo ""
echo "Services disponibles:"
echo "  - api-register"
echo "  - api-configuration"
echo "  - gateway-pvvih"
echo "  - gestion-user"
echo "  - gestion-reference"
echo "  - gestion-patient"
echo "  - forum-pvvih"
