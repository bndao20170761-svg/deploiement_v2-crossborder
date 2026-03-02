# Guide de Test des APIs - Architecture Microservices

## 🌐 URLs des Services

### Accès Direct (pour debug)
- **gestion_user**: http://localhost:9089
- **gestion_reference**: http://localhost:9090
- **gestion_patient**: http://localhost:9091
- **forum_pvvih**: http://localhost:9092

### Accès via Gateway (RECOMMANDÉ)
- **Gateway**: http://localhost:8080
- **Routes Gateway**:
  - `/api/user-auth/*` → gestion_user
  - `/gestion-reference/*` → gestion_reference
  - `/gestion-patient/*` → gestion_patient
  - `/forum-pvvih/*` → forum_pvvih

## 📝 Tests d'Authentification

### 1. Créer un Utilisateur (Register)

**Via Gateway:**
```http
POST http://localhost:8080/api/user-auth/register
Content-Type: application/json

{
  "username": "babacarndao1011@gmail.com",
  "password": "passe123",
  "nom": "Ndao",
  "prenom": "Babacar",
  "profil": "ADMIN",
  "nationalite": "Sénégalaise",
  "actif": true
}
```

**Réponse attendue:**
```json
[
  "Utilisateur babacarndao1011@gmail.com enregistré avec succès !"
]
```

**Via Service Direct:**
```http
POST http://localhost:9089/api/auth/register
Content-Type: application/json

{
  "username": "babacarndao1011@gmail.com",
  "password": "passe123",
  "nom": "Ndao",
  "prenom": "Babacar",
  "nationalite": "Sénégalaise"
}
```

### 2. Se Connecter (Login)

**Via Gateway:**
```http
POST http://localhost:8080/api/user-auth/login
Content-Type: application/json

{
  "username": "babacarndao1011@gmail.com",
  "password": "passe123"
}
```

**Réponse attendue:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYWJhY2FybmRhbzEwMTFAZ21haWwuY29tIiwiaWF0IjoxNzA5MTI4MDAwLCJleHAiOjE3MDkyMTQ0MDB9.xxxxx"
}
```

**Via Service Direct:**
```http
POST http://localhost:9089/api/auth/login
Content-Type: application/json

{
  "username": "babacarndao1011@gmail.com",
  "password": "passe123"
}
```

### 3. Vérifier que gestion_reference refuse le login

**Test (devrait retourner 501):**
```http
POST http://localhost:9090/api/auth/login
Content-Type: application/json

{
  "username": "babacarndao1011@gmail.com",
  "password": "passe123"
}
```

**Réponse attendue (501 Not Implemented):**
```json
{
  "error": "Authentication not available in this service",
  "message": "Please use gestion_user service for authentication",
  "endpoint": "POST /api/auth/login on gestion_user"
}
```

## 🔐 Tests avec JWT

### 4. Accéder aux Références (avec JWT)

**Via Gateway:**
```http
GET http://localhost:8080/gestion-reference/api/references
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Via Service Direct:**
```http
GET http://localhost:9090/api/references
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Réponse attendue:**
```json
[
  {
    "id": 1,
    "patientId": 123,
    "hopitalId": 456,
    "dateReference": "2026-02-28T10:00:00",
    "statut": "EN_ATTENTE"
  }
]
```

### 5. Créer une Référence (avec JWT)

**Via Gateway:**
```http
POST http://localhost:8080/gestion-reference/api/references
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "patientId": 123,
  "hopitalId": 456,
  "motif": "Consultation spécialisée",
  "urgence": "NORMALE"
}
```

### 6. Accéder au Profil Utilisateur (avec JWT)

**Via Gateway:**
```http
GET http://localhost:8080/api/user-auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Via Service Direct:**
```http
GET http://localhost:9089/api/user/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ❌ Tests d'Erreur

### 7. Accès sans JWT (devrait échouer)

```http
GET http://localhost:9090/api/references
```

**Réponse attendue (403 Forbidden):**
```json
{
  "timestamp": "2026-02-28T15:00:00.000+00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access Denied",
  "path": "/api/references"
}
```

### 8. JWT invalide (devrait échouer)

```http
GET http://localhost:9090/api/references
Authorization: Bearer invalid_token_here
```

**Réponse attendue (403 Forbidden):**
```json
{
  "timestamp": "2026-02-28T15:00:00.000+00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Invalid JWT token",
  "path": "/api/references"
}
```

## 🧪 Script de Test PowerShell

```powershell
# 1. Créer un utilisateur
$registerBody = @{
    username = "babacarndao1011@gmail.com"
    password = "passe123"
    nom = "Ndao"
    prenom = "Babacar"
    profil = "ADMIN"
    nationalite = "Sénégalaise"
    actif = $true
} | ConvertTo-Json

$registerResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/user-auth/register" `
    -Method Post `
    -ContentType "application/json" `
    -Body $registerBody

Write-Host "✅ Utilisateur créé: $registerResponse"

# 2. Se connecter
$loginBody = @{
    username = "babacarndao1011@gmail.com"
    password = "passe123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/user-auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $loginBody

$token = $loginResponse.token
Write-Host "✅ Token obtenu: $($token.Substring(0, 50))..."

# 3. Accéder aux références
$headers = @{
    "Authorization" = "Bearer $token"
}

$references = Invoke-RestMethod -Uri "http://localhost:8080/gestion-reference/api/references" `
    -Method Get `
    -Headers $headers

Write-Host "✅ Références récupérées: $($references.Count) éléments"

# 4. Vérifier que login est désactivé sur gestion_reference
try {
    $refLogin = Invoke-RestMethod -Uri "http://localhost:9090/api/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody
    Write-Host "⚠️  Login devrait être désactivé!"
} catch {
    if ($_.Exception.Response.StatusCode -eq 501) {
        Write-Host "✅ Login correctement désactivé sur gestion_reference"
    }
}
```

## 🔍 Vérification des Services

### Health Checks

```bash
# Vérifier tous les services
curl http://localhost:9089/actuator/health  # gestion_user
curl http://localhost:9090/actuator/health  # gestion_reference
curl http://localhost:9091/actuator/health  # gestion_patient
curl http://localhost:9092/actuator/health  # forum_pvvih
curl http://localhost:8080/actuator/health  # gateway
```

### Eureka Dashboard

Accédez à http://localhost:8761 pour voir tous les services enregistrés.

## 📊 Architecture Testée

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. POST /api/user-auth/register
       │ 2. POST /api/user-auth/login → JWT
       ▼
┌─────────────┐
│   Gateway   │ :8080
│             │
│ Routes:     │
│ /api/user-  │──────┐
│  auth/*     │      │
│             │      │
│ /gestion-   │──┐   │
│  reference/*│  │   │
└─────────────┘  │   │
                 │   │
        ┌────────┘   └────────┐
        ▼                     ▼
┌──────────────┐      ┌──────────────┐
│ gestion_     │      │ gestion_user │
│ reference    │      │              │
│ :9090        │      │ :9089        │
│              │      │              │
│ ✅ Valide JWT│      │ ✅ Génère JWT│
│ ❌ Pas login │      │ ✅ Login     │
└──────────────┘      └──────────────┘
```

## 🎯 Points Clés

1. ✅ **UN SEUL service gère l'authentification** : gestion_user
2. ✅ **Les autres services valident uniquement les JWT**
3. ✅ **Pas de duplication de données utilisateurs**
4. ✅ **Gateway route les requêtes correctement**
5. ✅ **Tous les services partagent la même clé JWT**

## 🐛 Dépannage

### Erreur 403 sur /api/references
- Vérifiez que le JWT est valide
- Vérifiez que le header Authorization est présent
- Vérifiez que les deux services utilisent la même clé JWT

### Erreur 501 sur /api/auth/login (gestion_reference)
- ✅ C'est normal ! Le login est désactivé sur ce service
- Utilisez gestion_user pour l'authentification

### Service unhealthy
```bash
docker-compose -f docker-compose.local.yml logs <service-name>
```

### JWT expiré
- Reconnectez-vous pour obtenir un nouveau token
- Par défaut, les JWT expirent après 24h
