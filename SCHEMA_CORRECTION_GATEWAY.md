# SCHÉMA VISUEL - CORRECTION GATEWAY

## 🔴 SITUATION ACTUELLE (PROBLÈME)

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Postman)                        │
│                                                                 │
│  POST http://34.32.116.206:8080/api/auth/register              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GATEWAY (gateway-pvvih)                      │
│                                                                 │
│  Route configurée:                                              │
│  - Path: /api/auth/**                                           │
│  - URI: lb://USER-API-PVVIH  ❌ (avec hyphens)                 │
│                                                                 │
│  Le Gateway cherche "USER-API-PVVIH" dans Eureka...            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EUREKA (api-register)                        │
│                                                                 │
│  Services enregistrés:                                          │
│  ✓ USER_API_PVVIH      (avec underscores)                      │
│  ✓ PATIENT_API_PVVIH   (avec underscores)                      │
│  ✓ REFERENCE_API_PVVIH (avec underscores)                      │
│  ✓ FORUM_API_PVVIH     (avec underscores)                      │
│  ✓ GETWAY_PVVIH        (avec underscores)                      │
│                                                                 │
│  ❌ "USER-API-PVVIH" n'existe pas!                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         RÉSULTAT                                │
│                                                                 │
│  HTTP 404 Not Found                                             │
│  {                                                              │
│    "timestamp": "2026-03-11T01:39:42.009+00:00",               │
│    "path": "/api/auth/register",                               │
│    "status": 404,                                              │
│    "error": "Not Found"                                        │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🟢 SITUATION APRÈS CORRECTION (SOLUTION)

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Postman)                        │
│                                                                 │
│  POST http://34.32.116.206:8080/api/auth/register              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GATEWAY (gateway-pvvih)                      │
│                                                                 │
│  Route configurée:                                              │
│  - Path: /api/auth/**                                           │
│  - URI: lb://USER_API_PVVIH  ✅ (avec underscores)             │
│                                                                 │
│  Le Gateway cherche "USER_API_PVVIH" dans Eureka...            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EUREKA (api-register)                        │
│                                                                 │
│  Services enregistrés:                                          │
│  ✓ USER_API_PVVIH      (avec underscores)                      │
│  ✓ PATIENT_API_PVVIH   (avec underscores)                      │
│  ✓ REFERENCE_API_PVVIH (avec underscores)                      │
│  ✓ FORUM_API_PVVIH     (avec underscores)                      │
│  ✓ GETWAY_PVVIH        (avec underscores)                      │
│                                                                 │
│  ✅ "USER_API_PVVIH" trouvé à 172.18.0.10:8080                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  GESTION-USER (gestion-user)                    │
│                                                                 │
│  Service: USER_API_PVVIH                                        │
│  IP: 172.18.0.10:8080                                           │
│                                                                 │
│  Endpoint: POST /api/auth/register                              │
│  Controller: AuthController.register()                          │
│                                                                 │
│  Traitement:                                                    │
│  1. Validation des données                                      │
│  2. Création de l'utilisateur                                   │
│  3. Génération du token JWT                                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         RÉSULTAT                                │
│                                                                 │
│  HTTP 200 OK                                                    │
│  {                                                              │
│    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",         │
│    "type": "Bearer",                                            │
│    "id": 1,                                                     │
│    "username": "test@test.com",                                 │
│    "roles": ["ROLE_USER"]                                       │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUX DE CORRECTION

```
┌─────────────────────────────────────────────────────────────────┐
│  ÉTAPE 1: CORRECTION SUR GITHUB                                 │
│                                                                 │
│  Repository: cloud-config-repo-enda                             │
│  Fichier: GETWAY_PVVIH-prod.yml                                │
│                                                                 │
│  AVANT:                                                         │
│  uri: lb://USER-API-PVVIH  ❌                                   │
│                                                                 │
│  APRÈS:                                                         │
│  uri: lb://USER_API_PVVIH  ✅                                   │
│                                                                 │
│  Action: Commit changes                                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  ÉTAPE 2: RECHARGEMENT CONFIG SERVER                            │
│                                                                 │
│  docker-compose stop api-configuration                          │
│  docker-compose rm -f api-configuration                         │
│  docker-compose up -d api-configuration                         │
│                                                                 │
│  Attendre 20 secondes...                                        │
│                                                                 │
│  Config Server télécharge la nouvelle config depuis GitHub      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  ÉTAPE 3: RECHARGEMENT GATEWAY                                  │
│                                                                 │
│  docker-compose stop gateway-pvvih                              │
│  docker-compose rm -f gateway-pvvih                             │
│  docker-compose up -d gateway-pvvih                             │
│                                                                 │
│  Attendre 30 secondes...                                        │
│                                                                 │
│  Gateway charge la nouvelle config depuis Config Server         │
│  Gateway se connecte à Eureka                                   │
│  Gateway découvre les services avec les bons noms               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  ÉTAPE 4: TEST                                                  │
│                                                                 │
│  POST http://34.32.116.206:8080/api/auth/register              │
│                                                                 │
│  Résultat attendu: HTTP 200/201 avec token JWT ✅               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 COMPARAISON DES NOMS

```
┌──────────────────┬─────────────────────┬──────────────────────┐
│   SERVICE        │  NOM DANS EUREKA    │  URI DANS GATEWAY    │
├──────────────────┼─────────────────────┼──────────────────────┤
│ gestion-user     │ USER_API_PVVIH      │ lb://USER_API_PVVIH  │
│                  │ (underscores) ✅    │ (underscores) ✅     │
├──────────────────┼─────────────────────┼──────────────────────┤
│ gestion-patient  │ PATIENT_API_PVVIH   │ lb://PATIENT_API_... │
│                  │ (underscores) ✅    │ (underscores) ✅     │
├──────────────────┼─────────────────────┼──────────────────────┤
│ gestion-ref...   │ REFERENCE_API_PVVIH │ lb://REFERENCE_AP... │
│                  │ (underscores) ✅    │ (underscores) ✅     │
├──────────────────┼─────────────────────┼──────────────────────┤
│ forum-pvvih      │ FORUM_API_PVVIH     │ lb://FORUM_API_PVVIH │
│                  │ (underscores) ✅    │ (underscores) ✅     │
└──────────────────┴─────────────────────┴──────────────────────┘

RÈGLE: Les noms doivent CORRESPONDRE EXACTEMENT
```

---

## 🎯 POINTS DE VÉRIFICATION

```
┌─────────────────────────────────────────────────────────────────┐
│  ✓ VÉRIFICATION 1: Config Server                               │
│                                                                 │
│  curl http://localhost:8888/GETWAY_PVVIH/prod | grep USER      │
│                                                                 │
│  ✅ Doit contenir: USER_API_PVVIH (underscores)                │
│  ❌ Ne doit PAS contenir: USER-API-PVVIH (hyphens)             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ✓ VÉRIFICATION 2: Eureka                                       │
│                                                                 │
│  curl http://localhost:8761/eureka/apps/USER_API_PVVIH         │
│                                                                 │
│  ✅ Doit retourner: XML avec infos du service                   │
│  ❌ Ne doit PAS retourner: 404 Not Found                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ✓ VÉRIFICATION 3: Gateway Routes                               │
│                                                                 │
│  curl http://localhost:8080/actuator/gateway/routes            │
│                                                                 │
│  ✅ Doit contenir: "uri": "lb://USER_API_PVVIH"                │
│  ❌ Ne doit PAS contenir: "uri": "lb://USER-API-PVVIH"         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ✓ VÉRIFICATION 4: Endpoint                                     │
│                                                                 │
│  POST http://localhost:8080/api/auth/register                   │
│                                                                 │
│  ✅ Doit retourner: HTTP 200/201 avec token JWT                 │
│  ❌ Ne doit PAS retourner: HTTP 404 Not Found                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚠️ ERREURS COURANTES

```
┌─────────────────────────────────────────────────────────────────┐
│  ❌ ERREUR 1: Utiliser docker-compose restart                   │
│                                                                 │
│  docker-compose restart gateway-pvvih                           │
│                                                                 │
│  Problème: Ne recharge PAS la config depuis GitHub             │
│                                                                 │
│  Solution: Utiliser rm -f puis up -d                            │
│  docker-compose rm -f gateway-pvvih                             │
│  docker-compose up -d gateway-pvvih                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ❌ ERREUR 2: Ne pas attendre assez longtemps                   │
│                                                                 │
│  docker-compose up -d api-configuration                         │
│  docker-compose up -d gateway-pvvih  # Trop rapide!             │
│                                                                 │
│  Problème: Gateway démarre avant que Config Server soit prêt    │
│                                                                 │
│  Solution: Attendre 20s après Config Server                     │
│  docker-compose up -d api-configuration                         │
│  sleep 20                                                       │
│  docker-compose up -d gateway-pvvih                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ❌ ERREUR 3: Oublier de mettre à jour GitHub                   │
│                                                                 │
│  Redémarrer les services sans avoir modifié la config GitHub    │
│                                                                 │
│  Problème: Config Server charge toujours l'ancienne config      │
│                                                                 │
│  Solution: TOUJOURS modifier GitHub EN PREMIER                  │
│  1. Modifier GETWAY_PVVIH-prod.yml sur GitHub                  │
│  2. Attendre quelques secondes                                  │
│  3. Redémarrer les services                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 FICHIERS À CONSULTER

```
ACTION_IMMEDIATE.md
    ↓
    Guide rapide en 3 étapes (5 minutes)

PROBLEME_ET_SOLUTION_GATEWAY.md
    ↓
    Explication complète du problème

COMPARAISON_AVANT_APRES.md
    ↓
    Voir les différences de configuration

COMMANDES_CORRECTION_GATEWAY.txt
    ↓
    Toutes les commandes à exécuter

reload-gateway-config.sh
    ↓
    Script automatique de correction

verifier-correction.sh
    ↓
    Script de vérification
```

---

## 🎬 TIMELINE DE CORRECTION

```
T+0min  │ Lire ACTION_IMMEDIATE.md
        │
T+2min  │ Modifier GETWAY_PVVIH-prod.yml sur GitHub
        │ Commit changes
        │
T+3min  │ Se connecter à la VM
        │ cd ~/deploiement_v2-crossborder
        │
T+4min  │ docker-compose stop gateway-pvvih api-configuration
        │ docker-compose rm -f gateway-pvvih api-configuration
        │
T+5min  │ docker-compose up -d api-configuration
        │ Attendre 20 secondes...
        │
T+6min  │ docker-compose up -d gateway-pvvih
        │ Attendre 30 secondes...
        │
T+7min  │ Tester l'endpoint depuis Postman
        │ POST http://34.32.116.206:8080/api/auth/register
        │
T+8min  │ ✅ Correction terminée!
```

---

## 🏁 RÉSULTAT FINAL

```
AVANT LA CORRECTION:
POST http://34.32.116.206:8080/api/auth/register
→ HTTP 404 Not Found ❌

APRÈS LA CORRECTION:
POST http://34.32.116.206:8080/api/auth/register
→ HTTP 200 OK avec token JWT ✅
```
