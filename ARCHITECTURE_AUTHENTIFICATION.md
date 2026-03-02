# Architecture d'Authentification - Microservices

## 🎯 Principe Fondamental

**UN SEUL SERVICE GÈRE L'AUTHENTIFICATION : `gestion_user`**

Les autres services (gestion_reference, gestion_forum, etc.) :
- ✅ VALIDENT les JWT reçus
- ❌ NE GÈRENT PAS l'authentification (login/register)
- ❌ N'ONT PAS besoin d'accéder à la table users

## 📊 Architecture

```
┌─────────────────┐
│   Frontend      │
│  (React App)    │
└────────┬────────┘
         │
         │ 1. POST /api/auth/login
         │    (username + password)
         ▼
┌─────────────────┐
│  gestion_user   │ ◄─── SEUL SERVICE D'AUTHENTIFICATION
│                 │
│ • Login         │
│ • Register      │
│ • Reset pwd     │
│ • Génère JWT    │
└────────┬────────┘
         │
         │ 2. Retourne JWT
         ▼
┌─────────────────┐
│   Frontend      │
│  (stocke JWT)   │
└────────┬────────┘
         │
         │ 3. GET /api/references
         │    Header: Authorization: Bearer <JWT>
         ▼
┌──────────────────┐
│ gestion_reference│ ◄─── VALIDE UNIQUEMENT LE JWT
│                  │
│ • Vérifie JWT    │
│ • Extrait user   │
│ • Pas de DB user │
└──────────────────┘
```

## 🔐 Flux d'Authentification

### 1. Login (via gestion_user)

```http
POST http://localhost:8081/api/auth/login
Content-Type: application/json

{
  "username": "john",
  "password": "password123"
}
```

**Réponse :**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Appel à gestion_reference (avec JWT)

```http
GET http://localhost:8082/api/references
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Ce qui se passe dans gestion_reference :**
1. `JwtAuthTokenFilter` intercepte la requête
2. Extrait le JWT du header Authorization
3. Valide le JWT (signature + expiration)
4. Extrait le username du JWT
5. Crée un `UserDetails` virtuel (pas de DB)
6. Autorise la requête

## 🚫 Ce qui NE DOIT PAS se passer

### ❌ Mauvaise Architecture (Avant)

```
gestion_reference essaie de :
1. Gérer le login localement
2. Chercher l'utilisateur dans SA base de données
3. Avoir une table users dupliquée
```

**Problème :** Duplication des données, incohérence, complexité

### ✅ Bonne Architecture (Après)

```
gestion_reference :
1. Reçoit un JWT déjà généré par gestion_user
2. Valide uniquement la signature du JWT
3. N'accède JAMAIS à une table users
4. Fait confiance au JWT
```

## 🔧 Configuration Technique

### gestion_user (Service d'authentification)

```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // ✅ Authentifie contre SA base de données
        // ✅ Génère un JWT
        // ✅ Retourne le JWT
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        // ✅ Crée l'utilisateur dans SA base de données
    }
}
```

### gestion_reference (Service métier)

```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // ❌ DÉSACTIVÉ - Redirige vers gestion_user
        return ResponseEntity.status(501).body(
            "Use gestion_user for authentication"
        );
    }
}

// ✅ Validation JWT uniquement
@Component
public class JwtAuthTokenFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, ...) {
        String jwt = extractJwt(request);
        if (jwtUtils.validateJwtToken(jwt)) {
            String username = jwtUtils.getUserNameFromJwtToken(jwt);
            // ✅ Crée un UserDetails virtuel (pas de DB)
            UserDetails userDetails = jwtOnlyUserDetailsService
                .loadUserByUsername(username);
            // ✅ Autorise la requête
        }
    }
}
```

## 📝 Endpoints par Service

### gestion_user (Port 8081)

| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/api/auth/login` | POST | ❌ | Authentification |
| `/api/auth/register` | POST | ❌ | Inscription |
| `/api/auth/reset-password-request` | POST | ❌ | Demande reset |
| `/api/auth/reset-password` | POST | ❌ | Reset password |
| `/api/user/profile` | GET | ✅ | Profil utilisateur |
| `/api/user/update` | PUT | ✅ | Mise à jour profil |

### gestion_reference (Port 8082)

| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/api/auth/*` | * | ❌ | ⚠️ DÉSACTIVÉ - Utiliser gestion_user |
| `/api/references` | GET | ✅ | Liste références |
| `/api/references` | POST | ✅ | Créer référence |
| `/api/patients` | GET | ✅ | Liste patients |

## 🔑 Clé Secrète JWT

**IMPORTANT :** Les deux services doivent utiliser la MÊME clé secrète JWT

```properties
# gestion_user/src/main/resources/application.properties
jwt.secret=VotreCleSecreteTresLongueEtSecurisee123456789

# gestion_reference/src/main/resources/application.properties
jwt.secret=VotreCleSecreteTresLongueEtSecurisee123456789
```

## 🧪 Tests

### Test 1 : Login via gestion_user

```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"password123"}'
```

### Test 2 : Accès à gestion_reference avec JWT

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:8082/api/references \
  -H "Authorization: Bearer $TOKEN"
```

### Test 3 : Vérifier que login est désactivé sur gestion_reference

```bash
curl -X POST http://localhost:8082/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"password123"}'

# Devrait retourner 501 avec message de redirection
```

## 🐛 Résolution du Problème Initial

### Symptôme
```
gestion_reference essayait de chercher l'utilisateur dans sa propre base
→ Erreur car l'utilisateur n'existe que dans gestion_user
```

### Solution Appliquée

1. ✅ Désactivé `AuthenticationManager` dans gestion_reference
2. ✅ Désactivé les endpoints `/api/auth/*` dans gestion_reference
3. ✅ Configuré `JwtOnlyUserDetailsService` pour validation JWT uniquement
4. ✅ Supprimé la dépendance à `UserRepository` pour l'authentification

### Résultat

- ✅ gestion_reference valide les JWT sans accéder à la DB
- ✅ Pas de duplication de données utilisateurs
- ✅ Architecture microservices propre
- ✅ Un seul point d'authentification

## 📚 Ressources

- [JWT.io](https://jwt.io/) - Débugger les JWT
- [Spring Security](https://spring.io/projects/spring-security)
- [Microservices Authentication Patterns](https://microservices.io/patterns/security/access-token.html)
