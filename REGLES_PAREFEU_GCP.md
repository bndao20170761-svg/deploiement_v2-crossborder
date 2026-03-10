# 🔥 Règles de Pare-feu GCP - FAQ

## ❓ Question: Dois-je recréer les règles de pare-feu pour ma nouvelle instance?

### ✅ Réponse: NON!

Les règles de pare-feu dans Google Cloud Platform sont **globales au projet**, pas spécifiques à une instance VM.

---

## 🎯 Comment ça fonctionne?

### Règles de Pare-feu GCP

Les règles de pare-feu dans GCP s'appliquent à:
- **Tout le projet GCP** (pas une instance spécifique)
- **Toutes les instances** qui correspondent aux critères de la règle
- **Tous les réseaux VPC** configurés dans la règle

### Critères d'Application

Une règle de pare-feu s'applique aux instances selon:
1. **Target tags** - Si vous avez spécifié des tags
2. **Target service accounts** - Si vous avez spécifié des comptes de service
3. **All instances in the network** - Si vous avez choisi "Toutes les instances"

---

## 🔍 Vérifier vos Règles Existantes

### Option 1: Via la Console GCP

1. Allez sur: https://console.cloud.google.com
2. Menu: **VPC Network** > **Firewall**
3. Cherchez une règle nommée: `allow-pvvih-app-ports` ou similaire
4. Vérifiez qu'elle autorise les ports: **8080, 8761, 3001, 3002, 3003**

### Option 2: Via gcloud CLI

```bash
# Lister toutes les règles de pare-feu
gcloud compute firewall-rules list

# Voir les détails d'une règle spécifique
gcloud compute firewall-rules describe allow-pvvih-app-ports
```

---

## ✅ Si la Règle Existe Déjà

### Vérifiez ces Points:

1. **Ports autorisés:**
   ```
   tcp:8080,tcp:8761,tcp:3001,tcp:3002,tcp:3003
   ```

2. **Direction:**
   ```
   Ingress (Entrée)
   ```

3. **Source IP ranges:**
   ```
   0.0.0.0/0 (tout Internet)
   ```

4. **Target:**
   ```
   All instances in the network
   OU
   Instances avec un tag spécifique
   ```

5. **Action:**
   ```
   Allow (Autoriser)
   ```

### Si Tout est Correct:

✅ **Votre nouvelle instance utilisera automatiquement cette règle!**

Aucune action nécessaire.

---

## ⚠️ Si la Règle N'existe PAS

### Créer la Règle (Une Seule Fois)

#### Via la Console GCP:

1. Allez dans **VPC Network** > **Firewall**
2. Cliquez sur **CREATE FIREWALL RULE**
3. Configurez:
   - **Name:** `allow-pvvih-app-ports`
   - **Network:** default (ou votre réseau)
   - **Priority:** 1000
   - **Direction:** Ingress
   - **Action on match:** Allow
   - **Targets:** All instances in the network
   - **Source filter:** IP ranges
   - **Source IP ranges:** `0.0.0.0/0`
   - **Protocols and ports:**
     - ☑ TCP: `8080, 8761, 3001, 3002, 3003`
4. Cliquez sur **CREATE**

#### Via gcloud CLI:

```bash
gcloud compute firewall-rules create allow-pvvih-app-ports \
  --network=default \
  --direction=INGRESS \
  --priority=1000 \
  --action=ALLOW \
  --rules=tcp:8080,tcp:8761,tcp:3001,tcp:3002,tcp:3003 \
  --source-ranges=0.0.0.0/0 \
  --description="Allow PVVIH application ports for all instances"
```

---

## 🔄 Cas Particuliers

### Si Vous Utilisez des Tags

Si votre ancienne instance avait un tag spécifique (ex: `pvvih-server`), vous devez:

1. **Option A:** Ajouter le même tag à votre nouvelle instance
   ```bash
   gcloud compute instances add-tags NOUVELLE_INSTANCE \
     --tags=pvvih-server \
     --zone=VOTRE_ZONE
   ```

2. **Option B:** Modifier la règle pour cibler "All instances"
   ```bash
   gcloud compute firewall-rules update allow-pvvih-app-ports \
     --target-tags=""
   ```

### Si Vous Utilisez des Réseaux VPC Différents

Si votre nouvelle instance est dans un réseau VPC différent:

1. Créez une nouvelle règle pour ce réseau
2. OU déplacez l'instance dans le même réseau

---

## 🧪 Tester les Règles de Pare-feu

### Test 1: Depuis Votre Machine Locale

```bash
# Tester le port 8080 (Gateway)
curl -I http://34.32.116.206:8080

# Tester le port 3001 (Forum)
curl -I http://34.32.116.206:3001

# Tester le port 3002 (Reference)
curl -I http://34.32.116.206:3002

# Tester le port 3003 (User)
curl -I http://34.32.116.206:3003
```

### Test 2: Depuis le Navigateur

Ouvrez ces URLs:
- http://34.32.116.206:8080
- http://34.32.116.206:8761
- http://34.32.116.206:3001
- http://34.32.116.206:3002
- http://34.32.116.206:3003

### Test 3: Vérifier les Connexions Bloquées

```bash
# Tester un port NON autorisé (devrait échouer)
curl -I http://34.32.116.206:9999 --max-time 5
```

---

## 📊 Tableau Récapitulatif

| Port | Service | Doit être Ouvert | Protocole |
|------|---------|------------------|-----------|
| 8080 | Gateway API | ✅ Oui | TCP |
| 8761 | Eureka Dashboard | ✅ Oui | TCP |
| 3001 | Frontend Forum | ✅ Oui | TCP |
| 3002 | Frontend Reference | ✅ Oui | TCP |
| 3003 | Frontend User | ✅ Oui | TCP |
| 22 | SSH | ✅ Oui (par défaut) | TCP |
| 3306-3309 | MySQL | ❌ Non (interne) | TCP |
| 27017 | MongoDB | ❌ Non (interne) | TCP |
| 9089-9092 | Services Backend | ❌ Non (interne) | TCP |

---

## 🔒 Bonnes Pratiques de Sécurité

### ✅ À Faire:

1. **Limiter les sources si possible:**
   ```
   Au lieu de: 0.0.0.0/0
   Utilisez: Votre IP ou plage d'IPs spécifique
   ```

2. **Utiliser des tags pour organiser:**
   ```
   Tags: pvvih-frontend, pvvih-backend, pvvih-database
   ```

3. **Documenter vos règles:**
   ```
   Description claire de chaque règle
   ```

4. **Réviser régulièrement:**
   ```
   Supprimer les règles inutilisées
   ```

### ❌ À Éviter:

1. ❌ Ouvrir tous les ports (0-65535)
2. ❌ Autoriser tous les protocoles
3. ❌ Oublier de documenter les règles
4. ❌ Créer des règles en double

---

## 🎯 Résumé pour Votre Cas

### Scénario 1: Règle Existante ✅

**Situation:** Vous aviez déjà configuré les ports pour l'ancienne instance

**Action:** ✅ **AUCUNE!** Votre nouvelle instance utilisera automatiquement la règle existante.

**Vérification:**
```bash
# Lister les règles
gcloud compute firewall-rules list | grep pvvih

# Tester l'accès
curl -I http://34.32.116.206:8080
```

### Scénario 2: Règle N'existe Pas ❌

**Situation:** Première fois que vous configurez les ports

**Action:** Créer la règle une seule fois (voir commandes ci-dessus)

**Vérification:** Même que Scénario 1

---

## 📞 Dépannage

### Problème: Les ports ne sont pas accessibles

**Vérifications:**

1. **La règle existe-t-elle?**
   ```bash
   gcloud compute firewall-rules list
   ```

2. **La règle est-elle activée?**
   ```bash
   gcloud compute firewall-rules describe RULE_NAME
   ```

3. **L'instance est-elle dans le bon réseau?**
   ```bash
   gcloud compute instances describe INSTANCE_NAME --zone=ZONE
   ```

4. **Les services sont-ils démarrés?**
   ```bash
   # Sur l'instance
   docker-compose ps
   ```

5. **Le pare-feu de l'OS est-il configuré?**
   ```bash
   # Sur l'instance (Debian/Ubuntu)
   sudo ufw status
   ```

---

## 🎉 Conclusion

**Pour votre nouvelle instance GCP:**

✅ Si vous aviez déjà configuré les règles de pare-feu → **Rien à faire!**

❌ Si c'est votre première configuration → **Créez la règle une seule fois**

Les règles de pare-feu GCP sont globales au projet et s'appliquent automatiquement à toutes les instances correspondantes.

---

**Prochaine étape:** Déployez votre application sur la nouvelle instance!

```bash
bash setup-nouvelle-instance-gcp.sh 34.32.116.206
```
