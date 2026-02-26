# Résumé des corrections localhost → noms de services Docker

## ✅ Fichiers Backend Java corrigés (MISE À JOUR FINALE)

### 1. Bootstrap Properties (Eureka & Config Server)

Tous les fichiers bootstrap.properties ont été mis à jour pour utiliser les noms de services Docker:

**Fichiers corrigés:**
- ✅ `gestion_user/src/main/resources/bootstrap.properties`
- ✅ `gestion_reference/src/main/resources/bootstrap.properties`
- ✅ `gestion_patient/src/main/resources/bootstrap.properties` (CORRIGÉ)
- ✅ `Forum_PVVIH/src/main/resources/bootstrap.properties` (CORRIGÉ)

**Corrections:**
- `http://localhost:8761/eureka/` → `http://api-register:8761/eureka/`
- `http://localhost:8880` → `http://api-configuration:8888`

### 2. Application Properties (Database Connections)

Tous les fichiers application.properties ont été mis à jour pour utiliser les noms de services Docker:

**Fichiers corrigés:**
- ✅ `gestion_user/src/main/resources/application.properties`
- ✅ `gestion_reference/src/main/resources/application.properties`
- ✅ `gestion_patient/src/main/resources/application.properties` (CORRIGÉ)
- ✅ `Forum_PVVIH/src/main/resources/application.properties` (CORRIGÉ)

**Corrections:**
- `jdbc:mysql://localhost:3306/patient_db` → `jdbc:mysql://mysql-patient:3306/patient_db`
- `mongodb://localhost:27017/forum_db` → `mongodb://admin:password@mongodb:27017/forum_db?authSource=admin`
- Username: `root` → `patient_service` (pour gestion_patient)

### 3. Configuration CORS

Tous les fichiers de configuration CORS ont été mis à jour pour inclure:
- Les URLs localhost (pour accès depuis le navigateur)
- Les noms de services Docker (pour communication interne)

#### Fichiers modifiés:

**Getway_PVVIH:**
- ✅ `src/main/java/sn/uasz/Getway_PVVIH/config/SecurityConfig.java`

**gestion_user:**
- ✅ `src/main/java/sn/uasz/User_API_PVVIH/config/SecurityConfig.java`
- ✅ `src/main/java/sn/uasz/User_API_PVVIH/controllers/MembreController.java`
- ✅ `src/main/java/sn/uasz/User_API_PVVIH/controllers/AssociationController.java`
- ✅ `src/main/java/sn/uasz/User_API_PVVIH/controllers/AssistantSocialController.java`
- ✅ `src/main/java/sn/uasz/User_API_PVVIH/controllers/DoctorController.java`
- ✅ `src/main/java/sn/uasz/User_API_PVVIH/controllers/UserController.java`
- ✅ `src/main/java/sn/uasz/User_API_PVVIH/controllers/HopitalController.java`
- ✅ `src/main/java/sn/uasz/User_API_PVVIH/controllers/ProxyController.java`

**gestion_reference:**
- ✅ `src/main/java/sn/uasz/referencement_PVVIH/config/SecurityConfig.java`
- ✅ `src/main/java/sn/uasz/referencement_PVVIH/controllers/AuthController.java`
- ✅ `src/main/java/sn/uasz/referencement_PVVIH/controllers/UserController.java`
- ✅ `src/main/java/sn/uasz/referencement_PVVIH/controllers/ReferencementController.java`

**Forum_PVVIH:**
- ✅ `src/main/java/sn/uaz/Forum_PVVIH/config/SecurityConfig.java`

**gestion_patient:**
- ✅ `src/main/java/sn/uasz/Patient_PVVIH/config/SecurityConfig.java`
- ✅ `src/main/java/sn/uasz/Patient_PVVIH/controllers/AuthController.java`
- ✅ `src/main/java/sn/uasz/Patient_PVVIH/controllers/UserController.java`

### 2. Clients Feign

Les clients Feign ont été mis à jour pour utiliser les noms de services Docker avec fallback configurable:

**gestion_reference:**
- ✅ `src/main/java/sn/uasz/referencement_PVVIH/feign/UserServiceClient.java`
  - `http://localhost:9089` → `http://gestion-user:8080`
- ✅ `src/main/java/sn/uasz/referencement_PVVIH/feign/HopitalClient.java`
  - `http://localhost:9089` → `http://gestion-user:8080`

**gestion_patient:**
- ✅ `src/main/java/sn/uasz/Patient_PVVIH/feign/UserServiceClient.java`
  - `http://localhost:9089` → `http://gestion-user:8080`
- ✅ `src/main/java/sn/uasz/Patient_PVVIH/feign/PatientClient.java`
  - `http://localhost:9090` → `http://gestion-reference:8080`

### 3. Controllers avec appels HTTP directs

**gestion_user/ProxyController.java:**
- ✅ Toutes les URLs `http://localhost:8080` → `http://forum-pvvih:8080`

## 📝 Configuration CORS finale

Tous les services backend acceptent maintenant les requêtes depuis:

### Accès externe (navigateur):
```java
"http://localhost:3000",
"http://127.0.0.1:3000",
"http://localhost:3001",
"http://127.0.0.1:3001",
"http://localhost:3002",
"http://127.0.0.1:3002",
"http://localhost:3003",
"http://localhost:3004",
"http://localhost:4000",
"http://127.0.0.1:4000",
"http://localhost:8080",
"http://localhost:8081"
```

### Communication interne Docker:
```java
"http://gateway-pvvih:8080",
"http://gestion-forum-front",
"http://a-reference-front",
"http://a-user-front"
```

## 🔍 Fichiers Frontend à vérifier manuellement

Les frontends utilisent des variables d'environnement. Vérifiez que ces variables sont correctement configurées:

### Variables d'environnement requises:

**gestion_forum_front:**
- `REACT_APP_FORUM_API_URL` → Doit pointer vers le gateway
- `REACT_APP_AUTH_API_URL` → Doit pointer vers le gateway
- `REACT_APP_FRONTEND1_URL` → URL du frontend 1
- `REACT_APP_FRONTEND2_URL` → URL du frontend 2

**a_reference_front:**
- `REACT_APP_GATEWAY_URL` → URL du gateway
- `REACT_APP_FORUM_URL` → URL du forum
- `REACT_APP_FRONTEND2_URL` → URL du frontend 2
- `REACT_APP_API_URL` → URL de l'API backend

**a_user_front:**
- `REACT_APP_GATEWAY_URL` → URL du gateway
- `REACT_APP_USER_API_URL` → URL de l'API utilisateur
- `REACT_APP_FORUM_URL` → URL du forum
- `REACT_APP_FRONTEND1_URL` → URL du frontend 1

### Fichiers frontend avec localhost (utilisent des variables d'environnement):

Ces fichiers sont OK car ils utilisent `process.env.REACT_APP_*` avec fallback localhost:

**gestion_forum_front:**
- `src/hooks/useTranslation.js`
- `src/pages/NotificationsPage.js`
- `src/services/api.js`
- `src/pages/HomePage.js`
- `src/pages/TopicDetailPage.js`
- `src/hooks/useNotifications.js`
- `src/components/CommentModal.js`
- `src/components/CommentList.js`
- `src/components/StatusToggle.js`
- `src/components/SectionAutocomplete.js`
- `src/components/Navbar.js`

**a_reference_front:**
- `src/config/microservices.js`
- `src/services/httpClient.js`
- `src/services/apiService.js`
- `src/services/api.js`
- `src/components/referenceService.js`
- `src/components/ReferenceWizard.js`
- `src/components/PatientView.js`
- `src/components/HopitalMap.js`

**a_user_front:**
- `src/config/microservices.js`
- `src/assets/components/CartographyMap.js`
- `src/assets/services/api.js`
- `src/assets/components/apiService.js`
- `src/assets/components/HospitalForm.js`
- `src/assets/components/Login.js`
- `src/assets/components/Header.js`

## 🎯 Points importants

### 1. CORS - Pourquoi garder localhost?

Les configurations CORS gardent `localhost` car:
- Les requêtes viennent du **navigateur du client** (en dehors de Docker)
- Le navigateur accède aux services via `localhost:3001`, `localhost:3002`, etc.
- Les noms de services Docker sont ajoutés pour la communication **interne** entre conteneurs

### 2. Frontends - Variables d'environnement

Les frontends utilisent des variables d'environnement avec fallback:
```javascript
const API_URL = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8080';
```

**Configuration dans docker-compose.yml:**
```yaml
environment:
  - REACT_APP_API_URL=http://gateway-pvvih:8080
  - REACT_APP_GATEWAY_URL=http://gateway-pvvih:8080
```

**Note**: Pour l'accès depuis le navigateur, les frontends doivent utiliser `http://localhost:8080` (port externe du gateway).

### 3. Clients Feign - Configuration flexible

Les clients Feign utilisent maintenant des propriétés configurables:
```java
@FeignClient(
    name = "gestion-user",
    url = "${feign.user-service.url:http://gestion-user:8080}",
    configuration = FeignClientConfig.class
)
```

Cela permet de surcharger l'URL via `application.properties` si nécessaire:
```properties
feign.user-service.url=http://gestion-user:8080
```

## 📊 Mapping des services

| Service Backend | Nom Docker | Port interne | Accessible depuis |
|----------------|------------|--------------|-------------------|
| Forum Service | `forum-pvvih` | 8080 | Autres services Docker |
| User Service | `gestion-user` | 8080 | Autres services Docker |
| Reference Service | `gestion-reference` | 8080 | Autres services Docker |
| Patient Service | `gestion-patient` | 8080 | Autres services Docker |
| Gateway | `gateway-pvvih` | 8080 | Tous (interne + externe) |

## ✅ Checklist de vérification

- [x] Tous les fichiers Java CORS mis à jour
- [x] Tous les clients Feign mis à jour
- [x] ProxyController mis à jour
- [x] docker-compose.yml configuré avec les bonnes variables
- [x] .env.example mis à jour
- [ ] Tester la communication entre services
- [ ] Vérifier les logs pour les erreurs de connexion
- [ ] Tester l'accès depuis le navigateur

## 🚀 Prochaines étapes

1. **Construire les images Docker:**
   ```bash
   docker-compose build
   ```

2. **Démarrer le système:**
   ```bash
   docker-compose up -d
   ```

3. **Vérifier les logs:**
   ```bash
   docker-compose logs -f
   ```

4. **Tester la communication:**
   - Accéder aux frontends via le navigateur
   - Vérifier que les services backend communiquent entre eux
   - Vérifier les logs pour les erreurs de connexion

## 📚 Documentation

Pour plus de détails, consultez:
- `MICROSERVICES_CONFIGURATION.md` - Configuration complète
- `docker-compose.yml` - Configuration des services
- `README.md` - Documentation générale
- `DEPLOYMENT.md` - Guide de déploiement
