#!/bin/bash

# ============================================================================
# Script : Fix User Profile - Ajouter prenom et nom dans la base de données
# ============================================================================

echo "🔍 Vérification du profil utilisateur..."
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== ÉTAPE 1: Vérification de l'utilisateur actuel ===${NC}"
echo ""

# Se connecter à MySQL et vérifier
docker exec -it mysql-user mysql -u root -ppassword123 -e "
USE db_user_pvvih;

-- Afficher l'utilisateur actuel
SELECT 
  id,
  username,
  nom,
  prenom,
  profil,
  role
FROM users 
WHERE username = 'filoraliouine@gmail.com';
" 2>/dev/null

echo ""
echo -e "${YELLOW}=== ÉTAPE 2: Mise à jour des informations ===${NC}"
echo ""

# Mise à jour
docker exec -it mysql-user mysql -u root -ppassword123 -e "
USE db_user_pvvih;

-- Mettre à jour avec de vraies valeurs
UPDATE users 
SET 
  prenom = 'Filora', 
  nom = 'Liouine'
WHERE username = 'filoraliouine@gmail.com';
" 2>/dev/null

echo -e "${GREEN}✅ Mise à jour effectuée !${NC}"
echo ""

echo -e "${BLUE}=== ÉTAPE 3: Vérification après mise à jour ===${NC}"
echo ""

# Vérifier après
docker exec -it mysql-user mysql -u root -ppassword123 -e "
USE db_user_pvvih;

SELECT 
  id,
  username,
  CONCAT(prenom, ' ', nom) AS nom_complet,
  profil,
  role
FROM users 
WHERE username = 'filoraliouine@gmail.com';
" 2>/dev/null

echo ""
echo -e "${GREEN}=== TERMINÉ ! ===${NC}"
echo ""
echo "🎯 Prochaines étapes :"
echo "1. Rafraîchissez la page https://100.48.20.109 (Ctrl+Shift+R)"
echo "2. Le profil devrait maintenant afficher : 'Filora Liouine'"
echo ""
echo "📋 Si vous voyez toujours 'Médecin' :"
echo "   - Ouvrez la console (F12)"
echo "   - Cherchez : '✅ Données utilisateur récupérées'"
echo "   - Vérifiez les valeurs de prenom et nom"
