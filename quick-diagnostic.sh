#!/bin/bash
# Diagnostic rapide pour erreur 404

echo "=========================================="
echo "DIAGNOSTIC RAPIDE - ERREUR 404"
echo "=========================================="
echo ""

cd ~/deploiement_v2-crossborder

echo "1. Services enregistrés dans Eureka:"
echo "------------------------------------"
docker logs api-register 2>&1 | grep "registered with" | tail -10
echo ""

echo "2. Routes chargées dans la Gateway:"
echo "-----------------------------------"
curl -s http://localhost:8080/actuator/gateway/routes | grep -E '"route_id"|"uri"|"predicates"' | head -30
echo ""

echo "3. État du service gestion-user:"
echo "--------------------------------"
docker logs gestion-user 2>&1 | grep -i "started\|eureka\|registered" | tail -10
echo ""

echo "4. Test de connectivité Gateway -> gestion-user:"
echo "------------------------------------------------"
docker exec gateway-pvvih wget -q -O- http://gestion-user:8080/actuator/health 2>&1
echo ""

echo "5. Vérifier si USER_API_PVVIH est dans Eureka:"
echo "----------------------------------------------"
curl -s http://localhost:8761/eureka/apps | grep -i "USER_API_PVVIH" && echo "✓ USER_API_PVVIH trouvé" || echo "✗ USER_API_PVVIH NON trouvé"
echo ""

echo "6. Logs récents de la Gateway (erreurs):"
echo "----------------------------------------"
docker logs gateway-pvvih 2>&1 | grep -i "error\|exception" | tail -5
echo ""

echo "7. Configuration Eureka de gestion-user:"
echo "----------------------------------------"
docker exec gestion-user env | grep EUREKA
echo ""

echo "8. Test direct du service (bypass Gateway):"
echo "-------------------------------------------"
echo "Test: http://localhost:9089/actuator/health"
curl -s http://localhost:9089/actuator/health
echo ""
echo ""

echo "=========================================="
echo "DIAGNOSTIC TERMINE"
echo "=========================================="
echo ""
echo "SOLUTIONS POSSIBLES:"
echo ""
echo "Si USER_API_PVVIH n'est pas dans Eureka:"
echo "  docker-compose restart gestion-user"
echo "  sleep 30"
echo "  docker logs gestion-user | grep Eureka"
echo ""
echo "Si les routes ne sont pas chargées:"
echo "  docker-compose restart gateway-pvvih"
echo "  sleep 30"
echo "  curl http://localhost:8080/actuator/gateway/routes"
echo ""
echo "Si le service direct ne répond pas:"
echo "  docker logs gestion-user | tail -50"
