# INDEX - CORRECTION GATEWAY 404

## 📋 FICHIERS CRÉÉS POUR LA CORRECTION

### 🚀 COMMENCEZ ICI
1. **ACTION_IMMEDIATE.md** - Action immédiate en 3 étapes (5 minutes)
2. **PROBLEME_ET_SOLUTION_GATEWAY.md** - Explication complète du problème et solution

### 📖 DOCUMENTATION DÉTAILLÉE
3. **INSTRUCTIONS_CORRECTION_COMPLETE.md** - Instructions étape par étape détaillées
4. **COMPARAISON_AVANT_APRES.md** - Comparaison visuelle avant/après correction

### 🛠️ FICHIERS TECHNIQUES
5. **GETWAY_PVVIH-prod-CORRIGE.yml** - Configuration correcte à copier sur GitHub
6. **COMMANDES_CORRECTION_GATEWAY.txt** - Toutes les commandes à exécuter
7. **reload-gateway-config.sh** - Script automatique de rechargement
8. **verifier-correction.sh** - Script de vérification après correction

---

## 🎯 GUIDE D'UTILISATION RAPIDE

### Pour une correction rapide (5 minutes)
```
1. Lire: ACTION_IMMEDIATE.md
2. Suivre les 3 étapes
3. Tester
```

### Pour comprendre le problème en détail
```
1. Lire: PROBLEME_ET_SOLUTION_GATEWAY.md
2. Voir: COMPARAISON_AVANT_APRES.md
```

### Pour une correction guidée pas à pas
```
1. Lire: INSTRUCTIONS_CORRECTION_COMPLETE.md
2. Utiliser: COMMANDES_CORRECTION_GATEWAY.txt
```

### Pour une correction automatisée
```
1. Copier reload-gateway-config.sh sur la VM
2. Exécuter: chmod +x reload-gateway-config.sh
3. Exécuter: ./reload-gateway-config.sh
```

### Pour vérifier que tout fonctionne
```
1. Copier verifier-correction.sh sur la VM
2. Exécuter: chmod +x verifier-correction.sh
3. Exécuter: ./verifier-correction.sh
```

---

## 📝 RÉSUMÉ DU PROBLÈME

**Symptôme**: 404 Not Found sur `POST http://34.32.116.206:8080/api/auth/register`

**Cause**: 
- Services enregistrés dans Eureka avec **underscores**: `USER_API_PVVIH`
- Configuration Gateway sur GitHub avec **hyphens**: `USER-API-PVVIH`
- Gateway ne trouve pas les services → 404

**Solution**:
1. Remplacer la config GitHub par `GETWAY_PVVIH-prod-CORRIGE.yml`
2. Supprimer et recréer les conteneurs Gateway et Config Server
3. Tester l'endpoint

---

## 🔍 VÉRIFICATIONS CLÉS

### 1. Config Server a la bonne config
```bash
curl http://localhost:8888/GETWAY_PVVIH/prod | grep "USER_API_PVVIH"
```
✅ Doit contenir `USER_API_PVVIH` (underscores)

### 2. Services enregistrés dans Eureka
```bash
curl http://localhost:8761/eureka/apps | grep -i "application"
```
✅ Doit montrer `USER_API_PVVIH`, `PATIENT_API_PVVIH`, etc.

### 3. Gateway a chargé les routes
```bash
curl http://localhost:8080/actuator/gateway/routes | jq '.'
```
✅ Doit montrer des routes avec `lb://USER_API_PVVIH`

### 4. Endpoint fonctionne
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test@test.com","password":"test123","nom":"Test","prenom":"User","nationalite":"Sénégal"}'
```
✅ Doit retourner 200/201 avec token JWT

---

## 🎬 ORDRE D'EXÉCUTION RECOMMANDÉ

### Étape 1: Comprendre (5 minutes)
1. Lire `ACTION_IMMEDIATE.md`
2. Lire `PROBLEME_ET_SOLUTION_GATEWAY.md`

### Étape 2: Corriger sur GitHub (2 minutes)
1. Ouvrir `GETWAY_PVVIH-prod-CORRIGE.yml` localement
2. Copier tout le contenu
3. Aller sur GitHub: https://github.com/BabacarNdaoKgl/cloud-config-repo-enda.git
4. Éditer `GETWAY_PVVIH-prod.yml`
5. Remplacer par le contenu copié
6. Commit

### Étape 3: Corriger sur la VM (2 minutes)
Option A - Automatique:
```bash
./reload-gateway-config.sh
```

Option B - Manuel:
```bash
# Suivre les commandes dans COMMANDES_CORRECTION_GATEWAY.txt
```

### Étape 4: Vérifier (1 minute)
```bash
./verifier-correction.sh
```

### Étape 5: Tester (30 secondes)
```
POST http://34.32.116.206:8080/api/auth/register
Body: {"username":"test@test.com","password":"test123","nom":"Test","prenom":"User","nationalite":"Sénégal"}
```

---

## ⚠️ POINTS IMPORTANTS

1. **Ne pas utiliser `docker-compose restart`**
   - ❌ `docker-compose restart gateway-pvvih` (ne recharge pas la config)
   - ✅ `docker-compose rm -f gateway-pvvih && docker-compose up -d gateway-pvvih`

2. **Respecter l'ordre de démarrage**
   - api-configuration → attendre 20s → gateway-pvvih → attendre 30s

3. **Vérifier la config GitHub avant de redémarrer**
   - La config doit contenir `USER_API_PVVIH` (underscores)
   - Pas `USER-API-PVVIH` (hyphens)

4. **Tous les services doivent utiliser underscores**
   - `USER_API_PVVIH` ✅
   - `PATIENT_API_PVVIH` ✅
   - `REFERENCE_API_PVVIH` ✅
   - `FORUM_API_PVVIH` ✅

---

## 🆘 EN CAS DE PROBLÈME

### Si la correction ne fonctionne pas

1. **Vérifier les logs**
   ```bash
   docker-compose logs gateway-pvvih | grep -i error
   docker-compose logs gestion-user | grep -i error
   ```

2. **Vérifier que les services sont démarrés**
   ```bash
   docker-compose ps
   ```

3. **Tester directement gestion-user (bypass Gateway)**
   ```bash
   docker inspect gestion-user | grep IPAddress
   curl -X POST http://172.18.0.X:8080/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"test@test.com","password":"test123","nom":"Test","prenom":"User","nationalite":"Sénégal"}'
   ```

4. **Redémarrer tous les services backend**
   ```bash
   docker-compose restart gestion-user gestion-patient gestion-reference forum-pvvih
   sleep 30
   docker-compose restart gateway-pvvih
   ```

### Si vous avez des questions

Consultez les fichiers dans cet ordre:
1. `PROBLEME_ET_SOLUTION_GATEWAY.md` - Explication détaillée
2. `COMPARAISON_AVANT_APRES.md` - Voir les différences
3. `INSTRUCTIONS_CORRECTION_COMPLETE.md` - Guide complet

---

## 📊 STATUT DES FICHIERS

| Fichier | Statut | Action requise |
|---------|--------|----------------|
| `GETWAY_PVVIH-prod-CORRIGE.yml` | ✅ Prêt | À copier sur GitHub |
| `reload-gateway-config.sh` | ✅ Prêt | À exécuter sur VM |
| `verifier-correction.sh` | ✅ Prêt | À exécuter sur VM |
| Configuration GitHub | ❌ À corriger | Remplacer par version corrigée |
| Services sur VM | ⚠️ À redémarrer | Après correction GitHub |

---

## 🎯 OBJECTIF FINAL

Après avoir suivi toutes les étapes, vous devriez pouvoir:

1. ✅ Enregistrer un utilisateur via l'API
2. ✅ Recevoir un token JWT en réponse
3. ✅ Utiliser ce token pour les autres endpoints
4. ✅ Accéder à tous les services via le Gateway

**Endpoint de test**:
```
POST http://34.32.116.206:8080/api/auth/register
```

**Résultat attendu**: HTTP 200/201 avec token JWT
