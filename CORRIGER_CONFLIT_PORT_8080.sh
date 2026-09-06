#!/bin/bash
# Correction du conflit de port 8080 entre nginx-https et gateway-pvvih

echo "=========================================="
echo "🔧 CORRECTION CONFLIT PORT 8080"
echo "=========================================="
echo ""

echo "❌ PROBLÈME DÉTECTÉ:"
echo "   nginx-https veut utiliser le port 8080"
echo "   gateway-pvvih utilise DÉJÀ le port 8080"
echo "   → CONFLIT !"
echo ""

echo "✅ SOLUTION:"
echo "   Utiliser des ports DIFFÉRENTS pour accéder au Gateway via nginx"
echo ""

echo "1. Arrêter nginx-https (s'il existe)"
echo "----------------------------------------"
docker rm -f nginx-https 2>/dev/null || true
echo ""

echo "2. Démarrer nginx-https SANS mappingdu port 8080"
echo "----------------------------------------"
# nginx-https n'a PAS besoin d'exposer le port 8080 directement
# Il doit juste faire du proxy vers gateway-pvvih:8080 en INTERNE
docker compose up -d nginx-https
echo ""

echo "3. Attendre le démarrage (10 secondes)"
echo "----------------------------------------"
sleep 10
echo ""

echo "4. Vérifier l'état des conteneurs"
echo "----------------------------------------"
docker compose ps | grep -E "(nginx-https|gateway-pvvih)"
echo ""

echo "5. Tests de connectivité"
echo "----------------------------------------"

echo ""
echo "Test 1: Port 443 (HTTPS principal)"
curl -k -I https://localhost:443 2>&1 | head -3

echo ""
echo "Test 2: Port 3001 (a-reference-front)"
curl -k -I https://localhost:3001 2>&1 | head -3

echo ""
echo "Test 3: Port 3003 (a-user-front)"  
curl -k -I https://localhost:3003 2>&1 | head -3

echo ""
echo "Test 4: Gateway DIRECT (port 8080 HTTP)"
curl -I http://localhost:8080/actuator/health 2>&1 | head -3

echo ""
echo "=========================================="
echo "📋 RÉSUMÉ DE LA SOLUTION"
echo "=========================================="
echo ""
echo "✅ URLS À UTILISER (depuis l'extérieur):"
echo ""
echo "   https://100.48.20.109:3001  → a-reference-front"
echo "   https://100.48.20.109:3003  → a-user-front"
echo "   https://100.48.20.109:3002  → gestion-forum-front"
echo "   http://100.48.20.109:8080   → Gateway (HTTP direct)"
echo ""
echo "❌ NE PAS UTILISER:"
echo "   https://100.48.20.109:8080  → CONFLIT DE PORT"
echo ""
echo "💡 EXPLICATION:"
echo "   Le Gateway écoute déjà sur le port 8080 (HTTP)"
echo "   nginx-https ne peut PAS utiliser le même port"
echo "   → Les frontends appellent http://100.48.20.109:8080 directement"
echo "   → OU on change les URLs frontend pour utiliser /api/ sur port 443"
echo ""
