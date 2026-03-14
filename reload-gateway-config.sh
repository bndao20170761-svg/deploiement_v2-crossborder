#!/bin/bash

# ============================================================================
# Script de rechargement forcé de la configuration du Gateway
# ============================================================================
# Ce script force le Gateway à recharger sa configuration depuis GitHub
# en supprimant et recréant les conteneurs (pas juste un restart)
# ============================================================================

set -e  # Arrêter en cas d'erreur

echo "=========================================="
echo "RECHARGEMENT FORCÉ CONFIG GATEWAY"
echo "=========================================="
echo ""

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ ERREUR: docker-compose.yml non trouvé"
    echo "Exécutez ce script depuis ~/deploiement_v2-crossborder"
    exit 1
fi

echo "✓ Répertoire correct détecté"
echo ""

# ============================================================================
# ÉTAPE 1: Arrêter et supprimer les conteneurs
# ============================================================================
echo "ÉTAPE 1: Arrêt et suppression des conteneurs..."
echo "----------------------------------------------"

echo "→ Arrêt de gateway-pvvih..."
docker-compose stop gateway-pvvih

echo "→ Arrêt de api-configuration..."
docker-compose stop api-configuration

echo "→ Suppression de gateway-pvvih..."
docker-compose rm -f gateway-pvvih

echo "→ Suppression de api-configuration..."
docker-compose rm -f api-configuration

echo "✓ Conteneurs supprimés"
echo ""

# ============================================================================
# ÉTAPE 2: Redémarrer Config Server
# ============================================================================
echo "ÉTAPE 2: Redémarrage du Config Server..."
echo "----------------------------------------------"

echo "→ Démarrage de api-configuration..."
docker-compose up -d api-configuration

echo "→ Attente 20 secondes pour que Config Server charge la config depuis GitHub..."
for i in {20..1}; do
    echo -ne "   $i secondes restantes...\r"
    sleep 1
done
echo ""

# Vérifier que Config Server est prêt
echo "→ Vérification que Config Server répond..."
if curl -s http://localhost:8888/actuator/health > /dev/null 2>&1; then
    echo "✓ Config Server est prêt"
else
    echo "⚠ Config Server ne répond pas encore (peut être normal)"
fi
echo ""

# ============================================================================
# ÉTAPE 3: Vérifier la configuration chargée
# ============================================================================
echo "ÉTAPE 3: Vérification de la configuration..."
echo "----------------------------------------------"

echo "→ Récupération de la config GETWAY_PVVIH/prod depuis Config Server..."
CONFIG_RESPONSE=$(curl -s http://localhost:8888/GETWAY_PVVIH/prod)

if echo "$CONFIG_RESPONSE" | grep -q "USER_API_PVVIH"; then
    echo "✓ Configuration correcte détectée (USER_API_PVVIH avec underscores)"
elif echo "$CONFIG_RESPONSE" | grep -q "USER-API-PVVIH"; then
    echo "❌ ERREUR: Configuration incorrecte (USER-API-PVVIH avec hyphens)"
    echo ""
    echo "La configuration sur GitHub n'a pas été mise à jour !"
    echo "Suivez les instructions dans INSTRUCTIONS_CORRECTION_COMPLETE.md"
    echo ""
    exit 1
else
    echo "⚠ Impossible de vérifier la configuration"
    echo "Réponse du Config Server:"
    echo "$CONFIG_RESPONSE" | head -20
fi
echo ""

# ============================================================================
# ÉTAPE 4: Redémarrer le Gateway
# ============================================================================
echo "ÉTAPE 4: Redémarrage du Gateway..."
echo "----------------------------------------------"

echo "→ Démarrage de gateway-pvvih..."
docker-compose up -d gateway-pvvih

echo "→ Attente 30 secondes pour que Gateway se connecte à Eureka..."
for i in {30..1}; do
    echo -ne "   $i secondes restantes...\r"
    sleep 1
done
echo ""

# Vérifier que Gateway est prêt
echo "→ Vérification que Gateway répond..."
if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "✓ Gateway est prêt"
else
    echo "⚠ Gateway ne répond pas encore"
fi
echo ""

# ============================================================================
# ÉTAPE 5: Vérifications finales
# ============================================================================
echo "ÉTAPE 5: Vérifications finales..."
echo "----------------------------------------------"

# Vérifier les routes
echo "→ Vérification des routes chargées..."
ROUTES=$(curl -s http://localhost:8080/actuator/gateway/routes 2>/dev/null || echo "")

if [ -n "$ROUTES" ]; then
    ROUTE_COUNT=$(echo "$ROUTES" | jq '. | length' 2>/dev/null || echo "?")
    echo "✓ Gateway a chargé $ROUTE_COUNT routes"
    
    if echo "$ROUTES" | grep -q "USER_API_PVVIH"; then
        echo "✓ Route USER_API_PVVIH trouvée (correct avec underscores)"
    else
        echo "⚠ Route USER_API_PVVIH non trouvée"
    fi
else
    echo "⚠ Impossible de récupérer les routes (Gateway peut ne pas être prêt)"
fi
echo ""

# Vérifier Eureka
echo "→ Vérification des services dans Eureka..."
EUREKA_APPS=$(curl -s http://localhost:8761/eureka/apps 2>/dev/null || echo "")

if [ -n "$EUREKA_APPS" ]; then
    if echo "$EUREKA_APPS" | grep -q "USER_API_PVVIH"; then
        echo "✓ USER_API_PVVIH enregistré dans Eureka"
    else
        echo "⚠ USER_API_PVVIH non trouvé dans Eureka"
    fi
    
    if echo "$EUREKA_APPS" | grep -q "GETWAY_PVVIH"; then
        echo "✓ GETWAY_PVVIH enregistré dans Eureka"
    else
        echo "⚠ GETWAY_PVVIH non trouvé dans Eureka"
    fi
else
    echo "⚠ Impossible de contacter Eureka"
fi
echo ""

# ============================================================================
# RÉSUMÉ
# ============================================================================
echo "=========================================="
echo "RÉSUMÉ"
echo "=========================================="
echo ""
echo "✓ Config Server redémarré et config rechargée depuis GitHub"
echo "✓ Gateway redémarré avec nouvelle configuration"
echo ""
echo "PROCHAINES ÉTAPES:"
echo "1. Vérifier les logs du Gateway:"
echo "   docker-compose logs --tail=50 gateway-pvvih"
echo ""
echo "2. Tester l'endpoint d'enregistrement depuis Postman:"
echo "   POST http://34.32.116.206:8080/api/auth/register"
echo "   Body: {\"username\":\"test@test.com\",\"password\":\"test123\",\"nom\":\"Test\",\"prenom\":\"User\",\"nationalite\":\"Sénégal\"}"
echo ""
echo "3. Si ça ne marche pas, voir les logs détaillés:"
echo "   docker-compose logs gateway-pvvih | grep -i error"
echo "   docker-compose logs gestion-user | grep -i error"
echo ""
echo "=========================================="
