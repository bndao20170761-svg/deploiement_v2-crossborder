# Guide de Test avec Postman - API PVVIH

## 🔴 ERREUR COMMUNE : Mauvais endpoint !

Vous avez utilisé : `POST http://34.32.116.206:8080/api/user-auth/register` ❌

## ✅ ENDPOINTS CORRECTS

### Architecture de routage :

```
Gateway (port 8080)
  ↓
  /api/auth/*        → Service: USER-API-PVVIH (gestion-user)
  /api/reference/*   → Service: REFERENCE-API-PVVIH (gestion-reference)
  /api/patient/*     → Service: PATIENT-API-PVVIH (gestion-patient)
  /api/forum/*       → Service: FORUM-API-PVVIH (forum-pvvih)
```

---

## 📝 TEST 1 : Inscription d'un utilisateur

### Endpoint
```
POST http://34.32.116.206:8080/api/auth/register
```

### Headers
```
Content-Type: application/json
```

### Body (JSON)
```json
{
  "username": "babacarndao1011@gmail.com",
  "password": "passe123",
  "nom": "Ndao",
  "prenom": "Babacar",
  "nationalite": "Sénégalaise"
}
```

### Réponse attendue (200 OK)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "babacarndao1011@gmail.com",
    "nom": "Ndao",
    "prenom": "Babacar",
    "profil": "USER"
  },
  "success": true,
  "message": "Utilisateur babacarndao1011@gmail.com enregistré avec succès !"
}
```

---

## 🔐 TEST 2 : Connexion

### Endpoint
```
POST http://34.32.116.206:8080/api/auth/login
```

### Headers
```
Content-Type: application/json
```

### Body (JSON)
```json
{
  "username": "babacarndao1011@gmail.com",
  "password": "passe123"
}
```

### Réponse attendue (200 OK)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 👤 TEST 3 : Récupérer les infos de l'utilisateur connecté

### Endpoint
```
GET http://34.32.116.206:8080/api/auth/me
```

### Headers
```
Authorization: Bearer <votre_token_ici>
Content-Type: application/json
```

### Réponse attendue (200 OK)
```json
{
  "id": 1,
  "username": "babacarndao1011@gmail.com",
  "nom": "Ndao",
  "prenom": "Babacar",
  "profil": "USER",
  "nationalite": "Sénégalaise",
  "active": true,
  "dateCreation": "2026-03-10T21:30:00",
  "dateDernierAcces": null
}
```

---

## 🔄 TEST 4 : Réinitialiser un mot de passe (admin)

### Endpoint
```
POST http://34.32.116.206:8080/api/auth/force-reset-password
```

### Headers
```
Content-Type: application/json
```

### Body (JSON)
```json
{
  "username": "babacarndao1011@gmail.com",
  "newPassword": "nouveauMotDePasse123"
}
```

### Réponse attendue (200 OK)
```json
{
  "message": "Mot de passe mis à jour. Vous pouvez maintenant vous connecter."
}
```

---

## 🏥 TEST 5 : Créer un hôpital (nécessite authentification)

### Endpoint
```
POST http://34.32.116.206:8080/api/reference/hopitaux
```

### Headers
```
Authorization: Bearer <votre_token_ici>
Content-Type: application/json
```

### Body (JSON)
```json
{
  "nom": "Hôpital Principal de Dakar",
  "adresse": "Avenue Cheikh Anta Diop",
  "ville": "Dakar",
  "pays": "Sénégal",
  "telephone": "+221 33 889 01 01",
  "email": "contact@hopital-dakar.sn",
  "latitude": 14.6937,
  "longitude": -17.4441
}
```

---

## 🩺 TEST 6 : Créer un patient (nécessite authentification)

### Endpoint
```
POST http://34.32.116.206:8080/api/patient/patients
```

### Headers
```
Authorization: Bearer <votre_token_ici>
Content-Type: application/json
```

### Body (JSON)
```json
{
  "nom": "Diop",
  "prenom": "Fatou",
  "dateNaissance": "1990-05-15",
  "sexe": "F",
  "telephone": "+221 77 123 45 67",
  "adresse": "Parcelles Assainies, Dakar"
}
```

---

## 💬 TEST 7 : Créer un post sur le forum (nécessite authentification)

### Endpoint
```
POST http://34.32.116.206:8080/api/forum/posts
```

### Headers
```
Authorization: Bearer <votre_token_ici>
Content-Type: application/json
```

### Body (JSON)
```json
{
  "titre": "Question sur le traitement ARV",
  "contenu": "Bonjour, j'aimerais avoir des informations sur les effets secondaires des ARV...",
  "auteur": "babacarndao1011@gmail.com",
  "categorie": "TRAITEMENT"
}
```

---

## 🔍 Vérification des services

### Vérifier que le Gateway est accessible
```
GET http://34.32.116.206:8080/actuator/health
```

### Vérifier Eureka (Service Registry)
```
GET http://34.32.116.206:8761
```

---

## ⚠️ Codes d'erreur courants

| Code | Signification | Solution |
|------|---------------|----------|
| 404  | Endpoint non trouvé | Vérifiez l'URL (ex: `/api/auth/register` pas `/api/user-auth/register`) |
| 401  | Non authentifié | Ajoutez le header `Authorization: Bearer <token>` |
| 403  | Accès refusé | Vérifiez que votre token est valide |
| 500  | Erreur serveur | Vérifiez les logs du service avec `docker-compose logs` |
| 503  | Service indisponible | Le service backend n'est pas démarré ou pas enregistré dans Eureka |

---

## 📊 Ordre de test recommandé

1. ✅ Vérifier que le Gateway répond (`/actuator/health`)
2. ✅ Vérifier Eureka (tous les services doivent être enregistrés)
3. ✅ Inscription d'un utilisateur (`POST /api/auth/register`)
4. ✅ Connexion (`POST /api/auth/login`) → récupérer le token
5. ✅ Tester les endpoints protégés avec le token

---

## 🐛 Debugging

### Voir les logs du Gateway
```bash
docker-compose logs -f gateway-pvvih
```

### Voir les logs du service User
```bash
docker-compose logs -f gestion-user
```

### Voir tous les services enregistrés dans Eureka
Ouvrez dans votre navigateur : `http://34.32.116.206:8761`

---

## 📝 Notes importantes

1. Le champ `profil` dans le body d'inscription est ignoré - tous les nouveaux utilisateurs ont le profil "USER"
2. Le token JWT expire après 1 heure (3600000 ms)
3. Les endpoints `/api/auth/register` et `/api/auth/login` sont publics (pas besoin de token)
4. Tous les autres endpoints nécessitent un token valide dans le header `Authorization`

