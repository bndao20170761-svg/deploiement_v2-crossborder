#!/bin/bash

# ============================================================================
# COMMANDES DE DÉPLOIEMENT AWS EC2
# ============================================================================
# Ce fichier contient toutes les commandes à exécuter pour déployer
# votre application sur AWS EC2
# 
# Vous êtes ici: ubuntu@ip-172-31-38-60:~$
# IP Publique: 16.171.1.67
# ============================================================================

echo "📋 Guide de Déploiement AWS EC2"
echo "================================"
echo ""
echo "Suivez ces étapes dans l'ordre:"
echo ""

# ============================================================================
# ÉTAPE 1: CLONER LE PROJET
# ============================================================================
echo "1️⃣  CLONER LE PROJET"
echo "-------------------"
echo ""
echo "Commandes à exécuter:"
echo ""
cat << 'EOF'
# Remplacez VOTRE_USERNAME et VOTRE_REPO par vos vraies valeurs
git clone https://github.com/VOTRE_USERNAME/VOTRE_REPO.git

# Entrer dans le répertoire
cd VOTRE_REPO

# Vérifier les fichiers
ls -la
EOF
echo ""
echo "Appuyez sur Entrée pour continuer..."
read

# ============================================================================
# ÉTAPE 2: CONFIGURER L'ENVIRONNEMENT
# ============================================================================
echo ""
echo "2️⃣  CONFIGURER L'ENVIRONNEMENT"
echo "------------------------------"
echo ""
echo "Commandes à exécuter:"
echo ""
cat << 'EOF'
# Copier le fichier d'exemple
cp .env.aws.example .env

# Éditer le fichier
nano .env
EOF
echo ""
echo "Dans nano, modifiez ces valeurs:"
echo ""
cat << 'EOF'
MONGO_PASSWORD=VotreMotDePasseMongo123!
MYSQL_ROOT_PASSWORD=VotreMotDePasseRoot123!
MYSQL_USER_PASSWORD=VotreMotDePasseUser123!
MYSQL_REFERENCE_PASSWORD=VotreMotDePasseReference123!
MYSQL_PATIENT_PASSWORD=VotreMotDePassePatient123!
JWT_SECRET=VotreCleSecreteTresLongueEtSecurisee123456789ABCDEFGHIJKLMNOP
EOF
echo ""
echo "Sauvegardez avec: Ctrl+X → Y → Enter"
echo ""
echo "Appuyez sur Entrée pour continuer..."
read

# ============================================================================
# ÉTAPE 3: RENDRE LE SCRIPT EXÉCUTABLE
# ============================================================================
echo ""
echo "3️⃣  RENDRE LE SCRIPT EXÉCUTABLE"
echo "-------------------------------"
echo ""
echo "Commande à exécuter:"
echo ""
cat << 'EOF'
chmod +x deploy-aws-simple.sh
EOF
echo ""
echo "Appuyez sur Entrée pour continuer..."
read

# ============================================================================
# ÉTAPE 4: LANCER LE DÉPLOIEMENT
# ============================================================================
echo ""
echo "4️⃣  LANCER LE DÉPLOIEMENT"
echo "------------------------"
echo ""
echo "Commande à exécuter:"
echo ""
cat << 'EOF'
bash deploy-aws-simple.sh
EOF
echo ""
echo "⏱️  Temps estimé: 10-20 minutes"
echo ""
echo "Le script va:"
echo "  • Construire toutes les images Docker"
echo "  • Démarrer tous les services"
echo "  • Vérifier les health checks"
echo "  • Afficher les URLs d'accès"
echo ""
echo "Appuyez sur Entrée pour continuer..."
read

# ============================================================================
# ÉTAPE 5: VÉRIFIER LE DÉPLOIEMENT
# ============================================================================
echo ""
echo "5️⃣  VÉRIFIER LE DÉPLOIEMENT"
echo "--------------------------"
echo ""
echo "Commandes de vérification:"
echo ""
cat << 'EOF'
# Voir l'état des services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps

# Tester l'API Gateway
curl http://localhost:8080/actuator/health

# Tester gestion-user
curl http://localhost:9089/actuator/health

# Voir les logs
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f
EOF
echo ""
echo "Appuyez sur Entrée pour continuer..."
read

# ============================================================================
# ÉTAPE 6: TESTER L'APPLICATION
# ============================================================================
echo ""
echo "6️⃣  TESTER L'APPLICATION"
echo "-----------------------"
echo ""
echo "Test 1: Créer un utilisateur"
echo ""
cat << 'EOF'
curl -X POST http://16.171.1.67:8080/api/user-auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@test.com",
    "password": "admin123",
    "nom": "Admin",
    "prenom": "Test",
    "profil": "ADMIN",
    "nationalite": "Sénégalaise",
    "actif": true
  }'
EOF
echo ""
echo "Test 2: Se connecter"
echo ""
cat << 'EOF'
curl -X POST http://16.171.1.67:8080/api/user-auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@test.com",
    "password": "admin123"
  }'
EOF
echo ""
echo "Appuyez sur Entrée pour continuer..."
read

# ============================================================================
# URLS D'ACCÈS
# ============================================================================
echo ""
echo "🌐 URLS D'ACCÈS"
echo "==============="
echo ""
echo "Ouvrez ces URLs dans votre navigateur:"
echo ""
echo "  Gateway API:        http://16.171.1.67:8080"
echo "  Eureka Dashboard:   http://16.171.1.67:8761"
echo "  Frontend Forum:     http://16.171.1.67:3001"
echo "  Frontend Reference: http://16.171.1.67:3002"
echo "  Frontend User:      http://16.171.1.67:3003"
echo ""
echo "Appuyez sur Entrée pour continuer..."
read

# ============================================================================
# COMMANDES UTILES
# ============================================================================
echo ""
echo "📊 COMMANDES UTILES"
echo "==================="
echo ""
echo "Surveillance:"
cat << 'EOF'
# Voir les logs en temps réel
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Voir l'état des services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps

# Voir l'utilisation des ressources
docker stats

# Voir l'espace disque
df -h

# Voir la mémoire
free -h
EOF
echo ""
echo "Gestion des services:"
cat << 'EOF'
# Redémarrer un service
docker-compose -f docker-compose.yml -f docker-compose.prod.yml restart SERVICE_NAME

# Redémarrer tous les services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml restart

# Arrêter tous les services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

# Démarrer tous les services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
EOF
echo ""
echo "Dépannage:"
cat << 'EOF'
# Voir les logs d'un service spécifique
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs SERVICE_NAME

# Voir les logs en temps réel d'un service
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f SERVICE_NAME

# Nettoyer les images inutilisées
docker system prune -a
EOF
echo ""

# ============================================================================
# DOCUMENTATION
# ============================================================================
echo ""
echo "📚 DOCUMENTATION"
echo "================"
echo ""
echo "Fichiers de documentation disponibles:"
echo ""
echo "  • DEMARRAGE_RAPIDE_AWS.md           - Guide de démarrage rapide"
echo "  • DEPLOIEMENT_AWS_ETAPE_PAR_ETAPE.md - Guide détaillé étape par étape"
echo "  • ARCHITECTURE_AUTHENTIFICATION.md   - Architecture d'authentification"
echo "  • GUIDE_TEST_API.md                  - Guide de test des APIs"
echo "  • .env.aws.example                   - Exemple de configuration AWS"
echo ""
echo "Pour lire un fichier:"
echo "  cat FICHIER.md"
echo "  less FICHIER.md"
echo "  nano FICHIER.md"
echo ""

# ============================================================================
# FIN
# ============================================================================
echo ""
echo "✅ Guide terminé!"
echo ""
echo "Vous pouvez maintenant commencer le déploiement en suivant les étapes ci-dessus."
echo ""
echo "Bon déploiement! 🚀"
echo ""
