# ⚠️ ACTION IMMÉDIATE - CORRECTION GATEWAY 404

## 🔴 PROBLÈME IDENTIFIÉ
Le Gateway cherche `USER-API-PVVIH` (tirets) mais Eureka a `USER_API_PVVIH` (underscores) → 404 Not Found

**Vos logs Eureka confirment:**
```xml
<application><name>USER_API_PVVIH</name></application>      ← Avec underscores
<application><name>PATIENT_API_PVVIH</name></application>   ← Avec underscores
<application><name>REFERENCE_API_PVVIH</name></application> ← Avec underscores
<application><name>FORUM_API_PVVIH</name></application>     ← Avec underscores
```

**Mais la config GitHub utilise des tirets** → Le Gateway ne trouve pas les services !

## SOLUTION EN 3 ÉTAPES

### 1️⃣ SUR GITHUB (5 minutes)

1. Aller sur: https://github.com/BabacarNdaoKgl/cloud-config-repo-enda.git
2. Ouvrir: `GETWAY_PVVIH-prod.yml`
3. Cliquer "Edit" (icône crayon)
4. **SUPPRIMER TOUT** le contenu
5. **COPIER-COLLER** le contenu complet du fichier `GETWAY_PVVIH-prod-CORRIGE.yml` (dans votre projet local)
6. Commit: "Fix: Correction noms services Eureka avec underscores"

### 2️⃣ SUR LA VM GCP (2 minutes)

```bash
# Se connecter
gcloud compute ssh babacarndao615@instance-20260310-134136
cd ~/deploiement_v2-crossborder

# Supprimer et recréer les conteneurs
docker-compose stop gateway-pvvih api-configuration
docker-compose rm -f gateway-pvvih api-configuration
docker-compose up -d api-configuration
sleep 20
docker-compose up -d gateway-pvvih
sleep 30
```

### 3️⃣ TESTER (30 secondes)

Depuis Postman:
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

**Résultat attendu**: Code 200/201 avec token JWT

---

## FICHIERS DE RÉFÉRENCE

- **PROBLEME_ET_SOLUTION_GATEWAY.md** - Explication complète du problème
- **COMMANDES_CORRECTION_GATEWAY.txt** - Toutes les commandes détaillées
- **INSTRUCTIONS_CORRECTION_COMPLETE.md** - Guide étape par étape
- **reload-gateway-config.sh** - Script automatique

---

## ⚠️ IMPORTANT

- Un simple `docker-compose restart` **NE SUFFIT PAS**
- Il faut **supprimer** (`rm -f`) puis **recréer** (`up -d`) les conteneurs
- Attendre 20s après Config Server, 30s après Gateway
