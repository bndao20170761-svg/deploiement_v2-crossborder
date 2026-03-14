# COMPARAISON AVANT/APRÈS - CONFIGURATION GATEWAY

## CE QUI ÉTAIT INCORRECT (sur GitHub actuellement)

### Configuration avec HYPHENS (❌ INCORRECT)

```yaml
spring:
  cloud:
    gateway:
      routes:
        # Route pour USER API
        - id: user-api-auth
          uri: lb://USER-API-PVVIH  # ❌ INCORRECT - Hyphens
          predicates:
            - Path=/api/auth/**
        
        # Route pour PATIENT API
        - id: patient-pvvih
          uri: lb://PATIENT-API-PVVIH  # ❌ INCORRECT - Hyphens
          predicates:
            - Path=/api/dossiers/**
        
        # Route pour REFERENCE API
        - id: referencement-pvvih
          uri: lb://REFERENCE-API-PVVIH  # ❌ INCORRECT - Hyphens
          predicates:
            - Path=/api/references/**
        
        # Route pour FORUM API
        - id: forum-pvvih
          uri: lb://FORUM-API-PVVIH  # ❌ INCORRECT - Hyphens
          predicates:
            - Path=/api/sujets/**
```

### Résultat avec cette configuration

```
Gateway cherche dans Eureka: USER-API-PVVIH
Eureka a enregistré: USER_API_PVVIH
Résultat: Service non trouvé → 404 Not Found
```

---

## CE QUI EST CORRECT (dans GETWAY_PVVIH-prod-CORRIGE.yml)

### Configuration avec UNDERSCORES (✅ CORRECT)

```yaml
spring:
  cloud:
    gateway:
      routes:
        # Route pour USER API
        - id: user-api-auth
          uri: lb://USER_API_PVVIH  # ✅ CORRECT - Underscores
          predicates:
            - Path=/api/auth/**
        
        # Route pour PATIENT API
        - id: patient-pvvih
          uri: lb://PATIENT_API_PVVIH  # ✅ CORRECT - Underscores
          predicates:
            - Path=/api/dossiers/**
        
        # Route pour REFERENCE API
        - id: referencement-pvvih
          uri: lb://REFERENCE_API_PVVIH  # ✅ CORRECT - Underscores
          predicates:
            - Path=/api/references/**
        
        # Route pour FORUM API
        - id: forum-pvvih
          uri: lb://FORUM_API_PVVIH  # ✅ CORRECT - Underscores
          predicates:
            - Path=/api/sujets/**
```

### Résultat avec cette configuration

```
Gateway cherche dans Eureka: USER_API_PVVIH
Eureka a enregistré: USER_API_PVVIH
Résultat: Service trouvé → Requête routée correctement → 200 OK
```

---

## SERVICES ENREGISTRÉS DANS EUREKA (d'après vos logs)

```xml
<applications>
  <application>
    <name>USER_API_PVVIH</name>        <!-- Underscores -->
  </application>
  <application>
    <name>PATIENT_API_PVVIH</name>     <!-- Underscores -->
  </application>
  <application>
    <name>REFERENCE_API_PVVIH</name>   <!-- Underscores -->
  </application>
  <application>
    <name>FORUM_API_PVVIH</name>       <!-- Underscores (probablement) -->
  </application>
  <application>
    <name>GETWAY_PVVIH</name>          <!-- Underscores -->
  </application>
</applications>
```

---

## TABLEAU RÉCAPITULATIF

| Service | Nom dans Eureka | URI INCORRECTE (GitHub actuel) | URI CORRECTE (à mettre) |
|---------|-----------------|--------------------------------|-------------------------|
| gestion-user | `USER_API_PVVIH` | `lb://USER-API-PVVIH` ❌ | `lb://USER_API_PVVIH` ✅ |
| gestion-patient | `PATIENT_API_PVVIH` | `lb://PATIENT-API-PVVIH` ❌ | `lb://PATIENT_API_PVVIH` ✅ |
| gestion-reference | `REFERENCE_API_PVVIH` | `lb://REFERENCE-API-PVVIH` ❌ | `lb://REFERENCE_API_PVVIH` ✅ |
| forum-pvvih | `FORUM_API_PVVIH` | `lb://FORUM-API-PVVIH` ❌ | `lb://FORUM_API_PVVIH` ✅ |

---

## POURQUOI LES SERVICES S'ENREGISTRENT AVEC UNDERSCORES

Dans les fichiers `application.properties` de chaque service:

```properties
# gestion_user/src/main/resources/application.properties
spring.application.name=User_API_PVVIH

# gestion_patient/src/main/resources/application.properties
spring.application.name=Patient_API_PVVIH

# gestion_reference/src/main/resources/application.properties
spring.application.name=Reference_API_PVVIH

# Forum_PVVIH/src/main/resources/application.properties
spring.application.name=Forum_API_PVVIH
```

Eureka convertit automatiquement en majuscules: `User_API_PVVIH` → `USER_API_PVVIH`

---

## EXEMPLE DE REQUÊTE

### Avant la correction (❌ 404)

```
Client → POST http://34.32.116.206:8080/api/auth/register
         ↓
Gateway → Cherche "USER-API-PVVIH" dans Eureka
         ↓
Eureka → "Je n'ai pas USER-API-PVVIH, j'ai seulement USER_API_PVVIH"
         ↓
Gateway → Retourne 404 Not Found au client
```

### Après la correction (✅ 200)

```
Client → POST http://34.32.116.206:8080/api/auth/register
         ↓
Gateway → Cherche "USER_API_PVVIH" dans Eureka
         ↓
Eureka → "Oui, USER_API_PVVIH est à l'adresse 172.18.0.10:8080"
         ↓
Gateway → Route la requête vers http://172.18.0.10:8080/api/auth/register
         ↓
gestion-user → Traite la requête et retourne un token JWT
         ↓
Gateway → Retourne 200 OK avec le token au client
```

---

## VÉRIFICATION RAPIDE

Pour vérifier si la correction est appliquée:

```bash
# Sur la VM, après avoir redémarré les services
curl http://localhost:8888/GETWAY_PVVIH/prod | grep -o "USER[_-]API[_-]PVVIH"
```

**Résultat attendu**: `USER_API_PVVIH` (avec underscores)
**Résultat incorrect**: `USER-API-PVVIH` (avec hyphens)

---

## NOTES IMPORTANTES

1. **Les noms de routes (id) peuvent avoir des hyphens** - c'est OK:
   ```yaml
   - id: user-api-auth  # ✅ OK - c'est juste un identifiant
   ```

2. **Mais les URIs doivent correspondre exactement à Eureka**:
   ```yaml
   uri: lb://USER_API_PVVIH  # ✅ DOIT correspondre à Eureka
   ```

3. **Le préfixe `lb://` est obligatoire** pour la découverte Eureka:
   ```yaml
   uri: lb://USER_API_PVVIH  # ✅ Correct - load balancing via Eureka
   uri: http://USER_API_PVVIH  # ❌ Incorrect - ne passera pas par Eureka
   ```

4. **La casse est importante**:
   ```yaml
   uri: lb://USER_API_PVVIH  # ✅ Correct - majuscules
   uri: lb://user_api_pvvih  # ❌ Incorrect - minuscules
   ```
