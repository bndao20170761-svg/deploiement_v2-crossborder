# 🎯 URLs d'Accès aux Applications

## ⚠️ MISE À JOUR IMPORTANTE - Port 3003 Corrigé

**Problème résolu** : Le port 3003 avait un conflit entre HTTP et HTTPS. Maintenant corrigé !

## ✅ URLs Fonctionnelles (À UTILISER)

### Frontends avec Ports Directs (HTTPS)
Utilisez ces URLs pour accéder aux applications :

| Application | URL | Description | Status |
|------------|-----|-------------|--------|
| **a-reference-front** | `https://100.48.20.109:3001` | Interface référencement médical | ✅ Fonctionne |
| **gestion-forum-front** | `https://100.48.20.109:3002` | Forum communautaire | ✅ Fonctionne |
| **a-user-front** | `https://100.48.20.109:3003` | Interface utilisateur | ✅ **CORRIGÉ - MAINTENANT HTTPS** |
| **Par défaut** | `https://100.48.20.109` | Redirige vers a-reference-front | ✅ Fonctionne |

### API Gateway
| Service | URL | Description | Status |
|---------|-----|-------------|--------|
| **Gateway** | `https://100.48.20.109:8080` | Point d'entrée API principal | ✅ Fonctionne |

### URLs HTTP Directes (Pour Debug)
| Application | URL | Description |
|------------|-----|-------------|
| **a-reference-front** | `http://100.48.20.109:3011` | Accès HTTP direct (sans SSL) |
| **gestion-forum-front** | `http://100.48.20.109:3012` | Accès HTTP direct (sans SSL) |
| **a-user-front** | `http://100.48.20.109:3013` | Accès HTTP direct (**changé de 3003 à 3013**) |

### APIs Backend (via Gateway)
Toutes les APIs sont accessibles via le Gateway sur le port 8080 :

```
https://100.48.20.109:8080/users/...
https://100.48.20.109:8080/references/...
https://100.48.20.109:8080/patients/...
https://100.48.20.109:8080/forum/...
```

## ❌ URLs Non Fonctionnelles (NE PAS UTILISER)

Ces URLs ne fonctionnent pas actuellement (problème de routing nginx) :

- ❌ `https://100.48.20.109/user/` → Erreur 404
- ❌ `https://100.48.20.109/forum/` → Erreur 404
- ❌ `https://100.48.20.109/reference/` → Redirige vers port 3001

## 🔧 Configuration Actuelle

### Architecture
```
Internet
   ↓
HTTPS:443 (nginx-https avec SSL auto-signé)
   ↓
┌─────────────────────────────────────────┐
│  Ports Directs (passthrough SSL)       │
│  - :3001 → a-reference-front:80         │
│  - :3002 → gestion-forum-front:80       │
│  - :3003 → a-user-front:80              │
│  - :8080 → gateway-pvvih:8080           │
└─────────────────────────────────────────┘
```

### Certificats SSL
- **Type** : Auto-signé (self-signed)
- **Domaine** : 100.48.20.109
- **Validité** : 365 jours
- **Localisation** : `/etc/nginx/ssl/nginx-selfsigned.{crt,key}`

## 📝 Notes Importantes

### Avertissement Navigateur
Lors du premier accès, votre navigateur affichera un avertissement de sécurité car le certificat est auto-signé. C'est normal.

**Pour contourner l'avertissement :**
- **Chrome/Edge** : Cliquez sur "Avancé" puis "Continuer vers 100.48.20.109"
- **Firefox** : Cliquez sur "Avancé" puis "Accepter le risque et continuer"

### Ports à Ouvrir dans le Pare-feu
Si vous ne pouvez pas accéder aux URLs, vérifiez que ces ports sont ouverts :

```bash
# Vérifier les règles du pare-feu GCP
gcloud compute firewall-rules list --filter="targetTags:pvvih-server"
```

Ports nécessaires :
- **443** : HTTPS principal (nginx-https)
- **3001** : a-reference-front (HTTPS)
- **3002** : gestion-forum-front (HTTPS)
- **3003** : a-user-front (HTTPS)
- **8080** : API Gateway (HTTPS)

### Variables d'Environnement Frontend

Les frontends sont configurés pour utiliser le Gateway via ces variables :

**a-reference-front** :
```env
REACT_APP_GATEWAY_URL=https://100.48.20.109:8080
```

**gestion-forum-front** :
```env
REACT_APP_API_BASE_URL=https://100.48.20.109:8080
```

**a-user-front** :
```env
REACT_APP_API_URL=https://100.48.20.109:8080
```

## 🧪 Tests de Connectivité

### Depuis votre PC
```powershell
# Test HTTPS frontends
curl -k https://100.48.20.109:3001
curl -k https://100.48.20.109:3002
curl -k https://100.48.20.109:3003

# Test API Gateway
curl -k https://100.48.20.109:8080/actuator/health
```

### Depuis le Serveur
```bash
# Test containers directs (HTTP interne)
curl http://172.28.0.15/  # a-reference-front
curl http://172.28.0.13/  # a-user-front
curl http://localhost:8080/actuator/health  # gateway
```

## 🔄 Redémarrage des Services

Si vous rencontrez des problèmes :

```bash
# Sur le serveur
cd ~/deploiement_v2-crossborder

# Redémarrer tous les frontends
docker compose restart a-reference-front gestion-forum-front a-user-front

# Redémarrer le proxy HTTPS
docker compose restart nginx-https

# Vérifier les logs
docker compose logs -f nginx-https
```

## 📊 État des Services

Pour vérifier que tous les services tournent :

```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

Vous devriez voir :
- ✅ **nginx-https** (healthy) → 0.0.0.0:443->443/tcp, :3001-3003->3001-3003/tcp
- ✅ **a-reference-front** (healthy) → 0.0.0.0:3001->80/tcp
- ✅ **gestion-forum-front** (healthy) → 0.0.0.0:3002->80/tcp
- ✅ **a-user-front** (healthy) → 0.0.0.0:3003->80/tcp
- ✅ **gateway-pvvih** (healthy) → 0.0.0.0:8080->8080/tcp

## 🚀 Prochaines Étapes (Optionnelles)

### Option 1 : Utiliser un Vrai Certificat SSL
Pour production, remplacez le certificat auto-signé par un certificat Let's Encrypt :
```bash
# Installer certbot
sudo yum install -y certbot

# Obtenir un certificat (nécessite un nom de domaine)
sudo certbot certonly --standalone -d votre-domaine.com
```

### Option 2 : Configurer un Nom de Domaine
Pointez un nom de domaine vers l'IP `100.48.20.109` :
- Configurez un enregistrement A dans votre DNS
- Mettez à jour `nginx-https.conf` avec le nouveau nom de domaine
- Générez un nouveau certificat SSL

### Option 3 : Corriger les Chemins `/user/` et `/forum/`
Nécessite une refonte complète :
1. Rebuild des frontends avec `PUBLIC_URL` ou `basename` React Router
2. Modification de `nginx-https.conf` pour le routing
3. Tests complets de navigation

**Recommandation** : Les ports directs fonctionnent parfaitement. Inutile de compliquer.

---

**Dernière mise à jour** : 6 septembre 2026
**IP du Serveur** : 100.48.20.109
**Environnement** : GCP VM (Amazon Linux 2023)
