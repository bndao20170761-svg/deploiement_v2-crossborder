#!/bin/bash
# Script de correction pour l'erreur 404

echo "=========================================="
echo "CORRECTION ERREUR 404"
echo "=========================================="
echo ""

cd ~/deploiement_v2-crossborder

echo "Étape 1: Vérification de l'état actuel..."
echo ""

# Vérifier si les services sont enregistrés
REGISTERED_SERVICES=$(docker logs api-register 2>&1 | grep "registered with" | wc -l)
echo "Services enregistrés dans Eureka: $REGISTERED_SERVICES"

if [ $REGISTERED_SERVICES -lt 3 ]; then
    echo "⚠️  Peu de services enregistrés, redémarrage nécessaire"
    NEED_RESTART=true
else
    echo "✓ Plusieurs services enregistrés"
    NEED_RESTART=false
fi
echo ""

# Vérifier si USER_API_PVVIH est enregistré
USER_API_REGISTERED=$(docker logs api-register 2>&1 | grep -i "USER_API_PVVIH" | grep "registered" | wc -l)
if [ $USER_API_REGISTERED -eq 0 ]; then
    echo "❌ USER_API_PVVIH n'est PAS enregistré dans Eureka"
    NEED_USER_RESTART=true
else
    echo "✓ USER_API_PVVIH est enregistré"
    NEED_USER_RESTART=false
fi
echo ""

# Vérifier les routes de la Gateway
ROUTES_COUNT=$(curl -s http://localhost:8080/actuator/gateway/routes 2>/dev/null | grep -c '"route_id"')
echo "Nombre de routes dans la Gateway: $ROUTES_COUNT"
if [ $ROUTES_COUNT -lt 5 ]; then
    echo "⚠️  Peu de routes chargées, redémarrage de la Gateway nécessaire"
    NEED_GATEWAY_RESTART=true
else
    echo "✓ Routes chargées"
    NEED_GATEWAY_RESTART=false
fi
echo ""

# Actions correctives
if [ "$NEED_USER_RESTART" = true ]; then
    echo "Étape 2: Redémarrage de gestion-user..."
    docker-compose restart gestion-user
    echo "Attente de 40 secondes..."
    sleep 40
    
    echo "Vérification de l'enregistrement..."
    docker logs gestion-user 2>&1 | grep -i "registered with eureka" | tail -3
    echo ""
fi

if [ "$NEED_GATEWAY_RESTART" = true ]; then
    echo "Étape 3: Redémarrage de la Gateway..."
    docker-compose restart gateway-pvvih
    echo "Attente de 40 secondes..."
    sleep 40
    
    echo "Vérification des routes..."
    curl -s http://localhost:8080/actuator/gateway/routes | grep -c '"route_id"'
    echo ""
fi

if [ "$NEED_RESTART" = true ]; then
    echo "Étape 4: Redémarrage complet des services métier..."
    docker-compose restart gestion-user gestion-reference gestion-patient forum-pvvih
    echo "Attente de 60 secondes..."
    sleep 60
    echo ""
fi

echo "Étape 5: Vérification finale..."
echo ""

echo "Services enregistrés dans Eureka:"
docker logs api-register 2>&1 | grep "registered with" | tail -10
echo ""

echo "Routes de la Gateway:"
curl -s http://localhost:8080/actuator/gateway/routes | grep '"route_id"' | head -10
echo ""

echo "Test de l'endpoint /api/auth/login:"
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}' \
  -w "\nHTTP Status: %{http_code}\n"
echo ""

echo "=========================================="
echo "CORRECTION TERMINEE"
echo "=========================================="
echo ""
echo "Si vous voyez toujours une erreur 404:"
echo "1. Vérifiez que le fichier GETWAY_PVVIH-prod.yml existe dans votre repo GitHub"
echo "2. Vérifiez que spring.profiles.active=prod dans le .env"
echo "3. Redémarrez api-configuration puis gateway-pvvih"
echo ""
echo "Commandes de vérification:"
echo "  docker logs gestion-user | grep -i 'started\|eureka'"
echo "  docker logs gateway-pvvih | grep -i 'route\|config'"
echo "  curl http://localhost:8080/actuator/gateway/routes"
