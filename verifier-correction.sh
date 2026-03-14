#!/bin/bash

# ============================================================================
# Script de vérification après correction du Gateway
# ============================================================================
# Ce script vérifie que la correction a bien été appliquée
# ============================================================================

set -e

echo "=========================================="
echo "VÉRIFICATION CORRECTION GATEWAY"
echo "=========================================="
echo ""

ERRORS=0
WARNINGS=0

# ============================================================================
# VÉRIFICATION 1: Config Server
# ============================================================================
echo "1. Vérification Config Server..."
echo "----------------------------------------------"

if curl -s http://localhost:8888/actuator/health > /dev/null 2>&1; then
    echo "✓ Config Server répond"
    
    # Vérifier la configuration chargée
    CONFIG=$(curl -s http://localhost:8888/GETWAY_PVVIH/prod 2>/dev/null || echo "")
    
    if [ -n "$CONFIG" ]; then
        if echo "$CONFIG" | grep -q "USER_API_PVVIH"; then
            echo "✓ Configuration correcte (USER_API_PVVIH avec underscores)"
        elif echo "$CONFIG" | grep -q "USER-API-PVVIH"; then
            echo "❌ Configuration INCORRECTE (USER-API-PVVIH avec hyphens)"
            echo "   → La configuration sur GitHub n'a pas été mise à jour!"
            ERRORS=$((ERRORS + 1))
        else
            echo "⚠ Impossible de vérifier la configuration"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo "⚠ Config Server ne retourne pas de configuration"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "❌ Config Server ne répond pas"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# ============================================================================
# VÉRIFICATION 2: Eureka
# ============================================================================
echo "2. Vérification Eureka..."
echo "----------------------------------------------"

if curl -s http://localhost:8761/actuator/health > /dev/null 2>&1; then
    echo "✓ Eureka répond"
    
    # Vérifier les services enregistrés
    EUREKA_APPS=$(curl -s http://localhost:8761/eureka/apps 2>/dev/null || echo "")
    
    if [ -n "$EUREKA_APPS" ]; then
        # Compter les services
        SERVICE_COUNT=$(echo "$EUREKA_APPS" | grep -o "<application>" | wc -l)
        echo "✓ $SERVICE_COUNT services enregistrés dans Eureka"
        
        # Vérifier chaque service
        if echo "$EUREKA_APPS" | grep -q "USER_API_PVVIH"; then
            echo "  ✓ USER_API_PVVIH enregistré"
        else
            echo "  ❌ USER_API_PVVIH NON enregistré"
            ERRORS=$((ERRORS + 1))
        fi
        
        if echo "$EUREKA_APPS" | grep -q "PATIENT_API_PVVIH"; then
            echo "  ✓ PATIENT_API_PVVIH enregistré"
        else
            echo "  ⚠ PATIENT_API_PVVIH NON enregistré"
            WARNINGS=$((WARNINGS + 1))
        fi
        
        if echo "$EUREKA_APPS" | grep -q "REFERENCE_API_PVVIH"; then
            echo "  ✓ REFERENCE_API_PVVIH enregistré"
        else
            echo "  ⚠ REFERENCE_API_PVVIH NON enregistré"
            WARNINGS=$((WARNINGS + 1))
        fi
        
        if echo "$EUREKA_APPS" | grep -q "GETWAY_PVVIH"; then
            echo "  ✓ GETWAY_PVVIH enregistré"
        else
            echo "  ❌ GETWAY_PVVIH NON enregistré"
            ERRORS=$((ERRORS + 1))
        fi
    else
        echo "⚠ Impossible de récupérer les services d'Eureka"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "❌ Eureka ne répond pas"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# ============================================================================
# VÉRIFICATION 3: Gateway
# ============================================================================
echo "3. Vérification Gateway..."
echo "----------------------------------------------"

if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "✓ Gateway répond"
    
    # Vérifier les routes
    ROUTES=$(curl -s http://localhost:8080/actuator/gateway/routes 2>/dev/null || echo "")
    
    if [ -n "$ROUTES" ]; then
        ROUTE_COUNT=$(echo "$ROUTES" | jq '. | length' 2>/dev/null || echo "?")
        echo "✓ Gateway a chargé $ROUTE_COUNT routes"
        
        # Vérifier les routes spécifiques
        if echo "$ROUTES" | grep -q "USER_API_PVVIH"; then
            echo "  ✓ Routes vers USER_API_PVVIH configurées"
        else
            echo "  ❌ Routes vers USER_API_PVVIH NON configurées"
            ERRORS=$((ERRORS + 1))
        fi
        
        # Vérifier la route user-api-auth spécifiquement
        USER_AUTH_ROUTE=$(echo "$ROUTES" | jq '.[] | select(.route_id=="user-api-auth")' 2>/dev/null || echo "")
        if [ -n "$USER_AUTH_ROUTE" ]; then
            echo "  ✓ Route 'user-api-auth' trouvée"
            
            # Vérifier l'URI
            if echo "$USER_AUTH_ROUTE" | grep -q "USER_API_PVVIH"; then
                echo "    ✓ URI correcte (USER_API_PVVIH)"
            else
                echo "    ❌ URI incorrecte"
                ERRORS=$((ERRORS + 1))
            fi
        else
            echo "  ❌ Route 'user-api-auth' NON trouvée"
            ERRORS=$((ERRORS + 1))
        fi
    else
        echo "⚠ Impossible de récupérer les routes"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "❌ Gateway ne répond pas"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# ============================================================================
# VÉRIFICATION 4: Service gestion-user
# ============================================================================
echo "4. Vérification gestion-user..."
echo "----------------------------------------------"

# Vérifier que le conteneur est en cours d'exécution
if docker ps | grep -q "gestion-user"; then
    echo "✓ Conteneur gestion-user en cours d'exécution"
    
    # Trouver l'IP du conteneur
    USER_IP=$(docker inspect gestion-user 2>/dev/null | grep -m 1 '"IPAddress"' | cut -d'"' -f4)
    
    if [ -n "$USER_IP" ] && [ "$USER_IP" != "null" ]; then
        echo "✓ IP du conteneur: $USER_IP"
        
        # Tester l'endpoint directement
        if curl -s http://$USER_IP:8080/actuator/health > /dev/null 2>&1; then
            echo "✓ Service gestion-user répond directement"
        else
            echo "⚠ Service gestion-user ne répond pas directement"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo "⚠ Impossible de trouver l'IP du conteneur"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "❌ Conteneur gestion-user NON en cours d'exécution"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# ============================================================================
# VÉRIFICATION 5: Test endpoint via Gateway
# ============================================================================
echo "5. Test endpoint /api/auth/register via Gateway..."
echo "----------------------------------------------"

# Test avec une requête POST
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test-verification@test.com","password":"test123","nom":"Test","prenom":"Verification","nationalite":"Sénégal"}' \
  2>/dev/null || echo "ERROR\n000")

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo "✓ Endpoint fonctionne (HTTP $HTTP_CODE)"
    if echo "$BODY" | grep -q "token"; then
        echo "  ✓ Token JWT retourné"
    fi
elif [ "$HTTP_CODE" = "400" ]; then
    echo "⚠ Endpoint répond mais erreur de validation (HTTP 400)"
    echo "  → Cela peut être normal si l'utilisateur existe déjà"
    WARNINGS=$((WARNINGS + 1))
elif [ "$HTTP_CODE" = "404" ]; then
    echo "❌ Endpoint retourne 404 Not Found"
    echo "  → La correction n'a pas été appliquée correctement"
    ERRORS=$((ERRORS + 1))
else
    echo "❌ Endpoint ne fonctionne pas (HTTP $HTTP_CODE)"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# ============================================================================
# RÉSUMÉ
# ============================================================================
echo "=========================================="
echo "RÉSUMÉ"
echo "=========================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ TOUT EST CORRECT!"
    echo ""
    echo "Vous pouvez maintenant tester depuis l'extérieur:"
    echo "POST http://34.32.116.206:8080/api/auth/register"
    echo ""
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️ CORRECTION APPLIQUÉE AVEC AVERTISSEMENTS"
    echo ""
    echo "Erreurs: $ERRORS"
    echo "Avertissements: $WARNINGS"
    echo ""
    echo "Les avertissements peuvent être normaux si certains services"
    echo "ne sont pas encore démarrés."
    echo ""
    exit 0
else
    echo "❌ CORRECTION NON APPLIQUÉE CORRECTEMENT"
    echo ""
    echo "Erreurs: $ERRORS"
    echo "Avertissements: $WARNINGS"
    echo ""
    echo "ACTIONS À FAIRE:"
    
    if curl -s http://localhost:8888/GETWAY_PVVIH/prod 2>/dev/null | grep -q "USER-API-PVVIH"; then
        echo "1. ⚠️ La configuration sur GitHub utilise encore des hyphens"
        echo "   → Suivez les instructions dans ACTION_IMMEDIATE.md"
    fi
    
    if ! docker ps | grep -q "gateway-pvvih"; then
        echo "2. ⚠️ Le Gateway n'est pas démarré"
        echo "   → Exécutez: docker-compose up -d gateway-pvvih"
    fi
    
    if ! docker ps | grep -q "gestion-user"; then
        echo "3. ⚠️ Le service gestion-user n'est pas démarré"
        echo "   → Exécutez: docker-compose up -d gestion-user"
    fi
    
    echo ""
    echo "Consultez PROBLEME_ET_SOLUTION_GATEWAY.md pour plus de détails"
    echo ""
    exit 1
fi
