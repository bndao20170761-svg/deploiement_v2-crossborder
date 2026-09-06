#!/bin/bash
# Script de test pour vérifier que a-user-front répond sur le port 3003

echo "=========================================="
echo "TEST: a-user-front sur le port 3003"
echo "=========================================="
echo ""

# Test 1: Vérifier que le conteneur est bien démarré
echo "1. Vérification du conteneur a-user-front..."
docker ps | grep a-user-front
echo ""

# Test 2: Vérifier le mapping de port
echo "2. Vérification du mapping de port..."
docker port a-user-front
echo ""

# Test 3: Test HTTP local (sans SSL)
echo "3. Test HTTP local sur localhost:3003..."
curl -I http://localhost:3003
echo ""

# Test 4: Test depuis l'IP publique (HTTP)
echo "4. Test HTTP depuis l'IP publique..."
curl -I http://100.48.20.109:3003
echo ""

# Test 5: Vérifier que le port écoute sur le serveur
echo "5. Vérification que le port 3003 écoute..."
ss -tlnp | grep 3003 || netstat -tlnp | grep 3003
echo ""

# Test 6: Test de la route nginx-https /user/
echo "6. Test HTTPS via nginx-https /user/..."
curl -k -I https://localhost/user/
echo ""

echo "=========================================="
echo "FIN DES TESTS"
echo "=========================================="
echo ""
echo "✅ Si vous voyez 'HTTP/1.1 200 OK' ou 'HTTP/1.1 301', c'est OK !"
echo ""
echo "📝 Pour accéder depuis votre navigateur:"
echo "   - Via nginx-https: https://100.48.20.109/user/"
echo "   - Accès direct:    http://100.48.20.109:3003"
echo ""
echo "⚠️  N'oubliez pas d'ouvrir le port 3003 dans AWS Security Groups !"
