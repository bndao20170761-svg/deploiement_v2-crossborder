# ✅ CHECKLIST - CORRECTION GATEWAY

## 📋 AVANT DE COMMENCER

- [ ] J'ai lu `ACTION_IMMEDIATE.md`
- [ ] J'ai compris le problème (underscores vs hyphens)
- [ ] J'ai accès au repository GitHub: https://github.com/BabacarNdaoKgl/cloud-config-repo-enda.git
- [ ] J'ai accès à la VM GCP: `babacarndao615@instance-20260310-134136`
- [ ] J'ai Postman ou un outil pour tester les API

---

## 🔧 PARTIE 1: CORRECTION SUR GITHUB

### Étape 1.1: Ouvrir le fichier local
- [ ] Ouvrir le fichier `GETWAY_PVVIH-prod-CORRIGE.yml` dans votre éditeur
- [ ] Sélectionner TOUT le contenu (Ctrl+A)
- [ ] Copier le contenu (Ctrl+C)

### Étape 1.2: Modifier sur GitHub
- [ ] Aller sur: https://github.com/BabacarNdaoKgl/cloud-config-repo-enda.git
- [ ] Cliquer sur le fichier: `GETWAY_PVVIH-prod.yml`
- [ ] Cliquer sur l'icône "Edit" (crayon en haut à droite)
- [ ] Sélectionner TOUT le contenu existant (Ctrl+A)
- [ ] Supprimer le contenu (Delete)
- [ ] Coller le nouveau contenu (Ctrl+V)

### Étape 1.3: Vérifier le contenu
- [ ] Vérifier que le fichier contient `lb://USER_API_PVVIH` (avec underscores)
- [ ] Vérifier qu'il ne contient PAS `lb://USER-API-PVVIH` (avec hyphens)
- [ ] Vérifier que tous les services utilisent des underscores:
  - [ ] `USER_API_PVVIH`
  - [ ] `PATIENT_API_PVVIH`
  - [ ] `REFERENCE_API_PVVIH`
  - [ ] `FORUM_API_PVVIH`

### Étape 1.4: Commit
- [ ] Message de commit: "Fix: Correction noms services Eureka avec underscores"
- [ ] Cliquer sur "Commit changes"
- [ ] Attendre 10 secondes que GitHub enregistre

---

## 🖥️ PARTIE 2: CORRECTION SUR LA VM

### Étape 2.1: Connexion
- [ ] Ouvrir un terminal
- [ ] Se connecter: `gcloud compute ssh babacarndao615@instance-20260310-134136`
- [ ] Aller dans le répertoire: `cd ~/deploiement_v2-crossborder`
- [ ] Vérifier que `docker-compose.yml` existe: `ls -la docker-compose.yml`

### Étape 2.2: Arrêter les services
- [ ] Arrêter Gateway: `docker-compose stop gateway-pvvih`
- [ ] Arrêter Config Server: `docker-compose stop api-configuration`
- [ ] Vérifier qu'ils sont arrêtés: `docker-compose ps | grep -E "gateway-pvvih|api-configuration"`

### Étape 2.3: Supprimer les conteneurs
- [ ] Supprimer Gateway: `docker-compose rm -f gateway-pvvih`
- [ ] Supprimer Config Server: `docker-compose rm -f api-configuration`
- [ ] Vérifier qu'ils sont supprimés: `docker ps -a | grep -E "gateway-pvvih|api-configuration"`

### Étape 2.4: Redémarrer Config Server
- [ ] Démarrer Config Server: `docker-compose up -d api-configuration`
- [ ] Attendre 20 secondes: `sleep 20`
- [ ] Vérifier qu'il répond: `curl http://localhost:8888/actuator/health`

### Étape 2.5: Vérifier la configuration chargée
- [ ] Récupérer la config: `curl http://localhost:8888/GETWAY_PVVIH/prod | grep USER`
- [ ] Vérifier que la sortie contient `USER_API_PVVIH` (underscores) ✅
- [ ] Vérifier que la sortie ne contient PAS `USER-API-PVVIH` (hyphens) ❌

### Étape 2.6: Redémarrer Gateway
- [ ] Démarrer Gateway: `docker-compose up -d gateway-pvvih`
- [ ] Attendre 30 secondes: `sleep 30`
- [ ] Vérifier qu'il répond: `curl http://localhost:8080/actuator/health`

---

## 🔍 PARTIE 3: VÉRIFICATIONS

### Étape 3.1: Vérifier Eureka
- [ ] Lister les services: `curl http://localhost:8761/eureka/apps | grep -i "application"`
- [ ] Vérifier USER_API_PVVIH: `curl http://localhost:8761/eureka/apps/USER_API_PVVIH`
- [ ] Résultat attendu: XML avec infos du service (pas de 404)

### Étape 3.2: Vérifier les routes du Gateway
- [ ] Lister les routes: `curl http://localhost:8080/actuator/gateway/routes | jq '.'`
- [ ] Chercher la route user-api-auth: `curl http://localhost:8080/actuator/gateway/routes | jq '.[] | select(.route_id=="user-api-auth")'`
- [ ] Vérifier que l'URI contient `USER_API_PVVIH` (underscores)

### Étape 3.3: Vérifier gestion-user
- [ ] Vérifier que le conteneur est démarré: `docker-compose ps gestion-user`
- [ ] Voir les logs: `docker-compose logs --tail=20 gestion-user`
- [ ] Pas d'erreurs dans les logs

### Étape 3.4: Vérifier les logs du Gateway
- [ ] Voir les logs: `docker-compose logs --tail=50 gateway-pvvih`
- [ ] Chercher les erreurs: `docker-compose logs gateway-pvvih | grep -i error`
- [ ] Pas d'erreurs critiques

---

## 🧪 PARTIE 4: TESTS

### Étape 4.1: Test depuis la VM (localhost)
- [ ] Exécuter:
  ```bash
  curl -X POST http://localhost:8080/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"username":"test-vm@test.com","password":"test123","nom":"Test","prenom":"VM","nationalite":"Sénégal"}'
  ```
- [ ] Résultat: HTTP 200 ou 201 avec token JWT ✅
- [ ] Pas de 404 Not Found ❌

### Étape 4.2: Test depuis l'extérieur (Postman)
- [ ] Ouvrir Postman
- [ ] Créer une nouvelle requête POST
- [ ] URL: `http://34.32.116.206:8080/api/auth/register`
- [ ] Headers: `Content-Type: application/json`
- [ ] Body (raw JSON):
  ```json
  {
    "username": "test-postman@test.com",
    "password": "test123",
    "nom": "Test",
    "prenom": "Postman",
    "nationalite": "Sénégal"
  }
  ```
- [ ] Envoyer la requête
- [ ] Résultat: HTTP 200 ou 201 avec token JWT ✅
- [ ] Pas de 404 Not Found ❌

### Étape 4.3: Test direct sur gestion-user (bypass Gateway)
- [ ] Trouver l'IP du conteneur: `docker inspect gestion-user | grep IPAddress`
- [ ] Noter l'IP (exemple: 172.18.0.10)
- [ ] Tester directement:
  ```bash
  curl -X POST http://172.18.0.10:8080/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"username":"test-direct@test.com","password":"test123","nom":"Test","prenom":"Direct","nationalite":"Sénégal"}'
  ```
- [ ] Résultat: HTTP 200 ou 201 avec token JWT ✅

---

## ✅ PARTIE 5: VALIDATION FINALE

### Étape 5.1: Tous les services sont UP
- [ ] `docker-compose ps` montre tous les services "Up"
- [ ] Aucun service en état "Exit" ou "Restarting"

### Étape 5.2: Aucune erreur dans les logs
- [ ] Gateway: `docker-compose logs gateway-pvvih | grep -i error` → Aucune erreur critique
- [ ] Config Server: `docker-compose logs api-configuration | grep -i error` → Aucune erreur critique
- [ ] gestion-user: `docker-compose logs gestion-user | grep -i error` → Aucune erreur critique

### Étape 5.3: Configuration correcte
- [ ] Config Server retourne la bonne config avec underscores
- [ ] Gateway a chargé les routes avec underscores
- [ ] Eureka montre tous les services enregistrés

### Étape 5.4: Endpoint fonctionne
- [ ] Test depuis la VM: ✅ HTTP 200/201
- [ ] Test depuis Postman: ✅ HTTP 200/201
- [ ] Test direct sur gestion-user: ✅ HTTP 200/201

---

## 🎉 SUCCÈS !

Si toutes les cases sont cochées, la correction est terminée avec succès !

Vous pouvez maintenant:
- ✅ Enregistrer des utilisateurs via l'API
- ✅ Utiliser les tokens JWT pour les autres endpoints
- ✅ Accéder à tous les services via le Gateway

---

## ❌ EN CAS D'ÉCHEC

Si certaines cases ne sont pas cochées:

### Si la config GitHub n'est pas correcte
→ Retourner à la PARTIE 1 et recommencer

### Si Config Server ne charge pas la bonne config
→ Vérifier que GitHub a bien été modifié
→ Attendre 30 secondes et réessayer
→ Redémarrer Config Server: `docker-compose restart api-configuration`

### Si Gateway ne trouve pas les services
→ Vérifier que les services sont dans Eureka: `curl http://localhost:8761/eureka/apps`
→ Vérifier les logs du Gateway: `docker-compose logs gateway-pvvih`
→ Redémarrer Gateway: `docker-compose restart gateway-pvvih`

### Si gestion-user ne répond pas
→ Vérifier qu'il est démarré: `docker-compose ps gestion-user`
→ Voir les logs: `docker-compose logs gestion-user`
→ Redémarrer: `docker-compose restart gestion-user`

### Si l'endpoint retourne toujours 404
→ Vérifier que TOUTES les étapes ont été suivies
→ Exécuter le script de vérification: `./verifier-correction.sh`
→ Consulter `PROBLEME_ET_SOLUTION_GATEWAY.md`

---

## 📞 AIDE SUPPLÉMENTAIRE

Consultez ces fichiers pour plus d'informations:
- `ACTION_IMMEDIATE.md` - Guide rapide
- `PROBLEME_ET_SOLUTION_GATEWAY.md` - Explication détaillée
- `SCHEMA_CORRECTION_GATEWAY.md` - Schémas visuels
- `COMPARAISON_AVANT_APRES.md` - Voir les différences
- `INDEX_CORRECTION_GATEWAY.md` - Index de tous les fichiers
