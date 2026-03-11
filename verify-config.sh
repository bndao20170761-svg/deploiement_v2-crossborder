#!/bin/bash
# Vérification de la configuration Spring Cloud Config

echo "=========================================="
echo "VERIFICATION CONFIGURATION"
echo "=========================================="
echo ""

cd ~/deploiement_v2-crossborder

echo "1. Vérifier que le Config Server fonctionne:"
echo "--------------------------------------------"
curl -s http://localhost:8888/actuator/health
echo ""
echo ""

echo "2. Vérifier la configuration de la Gateway (prod):"
echo "--------------------------------------------------"
echo "URL: http://localhost:8888/GETWAY_PVVIH/prod"
curl -s http://localhost:8888/GETWAY_PVVIH/prod | head -50
echo ""
echo ""

echo "3. Vérifier la configuration de gestion-user (prod):"
echo "----------------------------------------------------"
echo "URL: http://localhost:8888/USER_API_PVVIH/prod"
curl -s http://localhost:8888/USER_API_PVVIH/prod | head -30
echo ""
echo ""

echo "4. Logs du Config Server:"
echo "-------------------------"
docker logs api-configuration 2>&1 | tail -30
echo ""

echo "5. Variables d'environnement de la Gateway:"
echo "-------------------------------------------"
docker exec gateway-pvvih env | grep -E "SPRING_PROFILES|CONFIG|EUREKA"
echo ""

echo "6. Variables d'environnement de gestion-user:"
echo "---------------------------------------------"
docker exec gestion-user env | grep -E "SPRING_PROFILES|CONFIG|EUREKA"
echo ""

echo "=========================================="
echo "VERIFICATION TERMINEE"
echo "=========================================="
echo ""
echo "Points à vérifier:"
echo ""
echo "1. Le Config Server doit retourner la configuration de GETWAY_PVVIH"
echo "   Si erreur 404: Le fichier GETWAY_PVVIH-prod.yml n'existe pas dans GitHub"
echo ""
echo "2. SPRING_PROFILES_ACTIVE doit être 'prod' (ou 'dev' selon votre config)"
echo ""
echo "3. Si la config n'est pas trouvée, vérifiez:"
echo "   - Le repo GitHub est accessible"
echo "   - Le fichier GETWAY_PVVIH-prod.yml existe"
echo "   - Les credentials GitHub sont corrects (si repo privé)"
