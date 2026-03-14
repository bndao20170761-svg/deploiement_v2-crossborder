# RÉSUMÉ SIMPLE - CORRECTION DU PROBLÈME 404

## 🔴 LE PROBLÈME EN UNE PHRASE

Quand vous essayez d'enregistrer un utilisateur, vous obtenez une erreur 404 parce que le Gateway cherche un service avec des tirets (`USER-API-PVVIH`) mais Eureka a enregistré le service avec des underscores (`USER_API_PVVIH`).

---

## 🎯 LA SOLUTION EN 3 ÉTAPES

### 1️⃣ CORRIGER SUR GITHUB (2 minutes)

**Où ?** https://github.com/BabacarNdaoKgl/cloud-config-repo-enda.git

**Quoi faire ?**
1. Ouvrir le fichier `GETWAY_PVVIH-prod.yml`
2. Cliquer sur "Edit" (le crayon)
3. Tout supprimer
4. Copier-coller le contenu du fichier `GETWAY_PVVIH-prod-CORRIGE.yml` (dans votre projet local)
5. Sauvegarder avec le message: "Fix: Correction noms services Eureka avec underscores"

**Pourquoi ?** Pour que le Gateway cherche les bons noms de services (avec underscores au lieu de tirets).

---

### 2️⃣ REDÉMARRER LES SERVICES SUR LA VM (3 minutes)

**Où ?** Sur votre VM GCP

**Commandes à exécuter:**
```bash
# Se connecter à la VM
gcloud compute ssh babacarndao615@instance-20260310-134136
cd ~/deploiement_v2-crossborder

# Arrêter et supprimer les conteneurs
docker-compose stop gateway-pvvih api-configuration
docker-compose rm -f gateway-pvvih api-configuration

# Redémarrer Config Server et attendre
docker-compose up -d api-configuration
sleep 20

# Redémarrer Gateway et attendre
docker-compose up -d gateway-pvvih
sleep 30
```

**Pourquoi ?** Pour que les services rechargent la nouvelle configuration depuis GitHub.

**IMPORTANT:** Un simple `docker-compose restart` ne suffit PAS ! Il faut supprimer (`rm -f`) puis recréer (`up -d`).

---

### 3️⃣ TESTER (30 secondes)

**Depuis Postman:**
```
POST http://34.32.116.206:8080/api/auth/register
Content-Type: application/json

{
  "username": "test@test.com",
  "password": "test123",
  "nom": "Test",
  "prenom": "User",
  "nationalite": "Sénégal"
}
```

**Résultat attendu:** HTTP 200 ou 201 avec un token JWT

**Si ça marche:** ✅ Problème résolu !

**Si ça ne marche pas:** ❌ Voir la section "Diagnostic" ci-dessous

---

## 🔍 EXPLICATION TECHNIQUE SIMPLE

### Ce qui se passait AVANT (incorrect)

```
Vous → Gateway → Cherche "USER-API-PVVIH" dans Eureka
                 ↓
                 Eureka dit: "Je ne connais pas USER-API-PVVIH"
                 ↓
                 Gateway retourne: 404 Not Found
```

### Ce qui se passe APRÈS (correct)

```
Vous → Gateway → Cherche "USER_API_PVVIH" dans Eureka
                 ↓
                 Eureka dit: "Oui, USER_API_PVVIH est à 172.18.0.10:8080"
                 ↓
                 Gateway envoie votre requête à gestion-user
                 ↓
                 gestion-user traite et retourne un token JWT
                 ↓
                 Gateway vous retourne: 200 OK avec le token
```

---

## 📊 TABLEAU DES NOMS

| Service | Nom INCORRECT (avant) | Nom CORRECT (après) |
|---------|----------------------|---------------------|
| gestion-user | USER-API-PVVIH ❌ | USER_API_PVVIH ✅ |
| gestion-patient | PATIENT-API-PVVIH ❌ | PATIENT_API_PVVIH ✅ |
| gestion-reference | REFERENCE-API-PVVIH ❌ | REFERENCE_API_PVVIH ✅ |
| forum-pvvih | FORUM-API-PVVIH ❌ | FORUM_API_PVVIH ✅ |

**La règle:** Utiliser des **underscores** (_) et non des **tirets** (-)

---

## 🛠️ DIAGNOSTIC SI ÇA NE MARCHE PAS

### Vérification 1: La config GitHub est-elle correcte ?

```bash
# Sur la VM
curl http://localhost:8888/GETWAY_PVVIH/prod | grep USER
```

**Résultat attendu:** Vous devez voir `USER_API_PVVIH` (avec underscores)

**Si vous voyez `USER-API-PVVIH` (avec tirets):** La config GitHub n'a pas été mise à jour correctement. Retournez à l'étape 1.

---

### Vérification 2: Les services sont-ils dans Eureka ?

```bash
# Sur la VM
curl http://localhost:8761/eureka/apps/USER_API_PVVIH
```

**Résultat attendu:** Du XML avec les informations du service

**Si vous obtenez 404:** Le service gestion-user n'est pas enregistré dans Eureka. Vérifiez qu'il est démarré:
```bash
docker-compose ps gestion-user
docker-compose logs gestion-user
```

---

### Vérification 3: Le Gateway a-t-il chargé les routes ?

```bash
# Sur la VM
curl http://localhost:8080/actuator/gateway/routes | grep USER
```

**Résultat attendu:** Vous devez voir `USER_API_PVVIH` (avec underscores)

**Si vous ne voyez rien:** Le Gateway n'a pas chargé les routes. Redémarrez-le:
```bash
docker-compose restart gateway-pvvih
sleep 30
```

---

### Vérification 4: gestion-user fonctionne-t-il directement ?

```bash
# Trouver l'IP du conteneur
docker inspect gestion-user | grep IPAddress

# Tester directement (remplacez 172.18.0.10 par l'IP trouvée)
curl -X POST http://172.18.0.10:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test@test.com","password":"test123","nom":"Test","prenom":"User","nationalite":"Sénégal"}'
```

**Résultat attendu:** HTTP 200/201 avec token JWT

**Si ça marche:** Le problème vient du Gateway, pas de gestion-user

**Si ça ne marche pas:** Le problème vient de gestion-user. Vérifiez ses logs:
```bash
docker-compose logs gestion-user | grep -i error
```

---

## 📁 FICHIERS UTILES

### Pour une correction rapide
- **ACTION_IMMEDIATE.md** - Les 3 étapes en détail
- **CHECKLIST_CORRECTION.md** - Liste de vérification complète

### Pour comprendre le problème
- **PROBLEME_ET_SOLUTION_GATEWAY.md** - Explication détaillée
- **SCHEMA_CORRECTION_GATEWAY.md** - Schémas visuels
- **COMPARAISON_AVANT_APRES.md** - Voir les différences

### Pour les commandes
- **COMMANDES_CORRECTION_GATEWAY.txt** - Toutes les commandes
- **reload-gateway-config.sh** - Script automatique
- **verifier-correction.sh** - Script de vérification

---

## ⚠️ POINTS IMPORTANTS À RETENIR

1. **Ne jamais utiliser `docker-compose restart`** pour recharger la config
   - ❌ `docker-compose restart gateway-pvvih`
   - ✅ `docker-compose rm -f gateway-pvvih && docker-compose up -d gateway-pvvih`

2. **Toujours modifier GitHub EN PREMIER** avant de redémarrer les services

3. **Attendre suffisamment longtemps** après chaque démarrage
   - Config Server: 20 secondes
   - Gateway: 30 secondes

4. **Les noms doivent correspondre EXACTEMENT**
   - Eureka: `USER_API_PVVIH` (underscores)
   - Gateway: `lb://USER_API_PVVIH` (underscores)

5. **L'ordre de démarrage est important**
   - api-configuration → attendre 20s → gateway-pvvih → attendre 30s

---

## 🎉 APRÈS LA CORRECTION

Une fois que tout fonctionne, vous pourrez:

✅ Enregistrer des utilisateurs via l'API
✅ Recevoir des tokens JWT
✅ Utiliser ces tokens pour accéder aux autres endpoints
✅ Accéder à tous les services via le Gateway (port 8080)

---

## 📞 BESOIN D'AIDE ?

Si après avoir suivi toutes les étapes, ça ne marche toujours pas:

1. Exécutez le script de vérification:
   ```bash
   chmod +x verifier-correction.sh
   ./verifier-correction.sh
   ```

2. Consultez les logs:
   ```bash
   docker-compose logs gateway-pvvih | grep -i error
   docker-compose logs gestion-user | grep -i error
   ```

3. Vérifiez que tous les services sont démarrés:
   ```bash
   docker-compose ps
   ```

4. Lisez les fichiers de documentation détaillée listés ci-dessus

---

## 🏁 RÉSUMÉ ULTRA-COURT

**Problème:** Gateway cherche `USER-API-PVVIH` (tirets) mais Eureka a `USER_API_PVVIH` (underscores)

**Solution:**
1. Modifier `GETWAY_PVVIH-prod.yml` sur GitHub (remplacer tirets par underscores)
2. Sur la VM: `docker-compose rm -f gateway-pvvih api-configuration && docker-compose up -d api-configuration && sleep 20 && docker-compose up -d gateway-pvvih && sleep 30`
3. Tester: `POST http://34.32.116.206:8080/api/auth/register`

**Résultat:** ✅ HTTP 200/201 avec token JWT
