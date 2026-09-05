# Configuration HTTPS pour PVVIH

## 📋 Résumé

Cette configuration ajoute HTTPS à votre application PVVIH en utilisant un certificat SSL auto-signé et un proxy inverse Nginx.

## 🎯 Objectif

**Activer le GPS dans les navigateurs** qui bloquent la géolocalisation en HTTP.

## 🏗️ Architecture

```
Internet (HTTPS:443) → Nginx (SSL) → Frontends (HTTP interne)
                           ↓
                       Gateway (HTTP interne) → Microservices
```

### Flux de connexion :

1. **Utilisateur** → `https://100.48.20.109` (HTTPS, port 443)
2. **Nginx** déchiffre SSL → Redirige vers `a_reference_front:80` (HTTP interne)
3. **Frontend** communique avec Gateway via `/api` → Nginx redirige vers `gateway:8080`

## 📁 Fichiers créés

1. **nginx-https.conf** - Configuration Nginx avec SSL
2. **docker-compose.yml** - Modifié pour inclure service Nginx
3. **deploy-https.sh** - Script de déploiement automatisé

## 🔐 Certificats SSL

Les certificats sont montés depuis le serveur :
- `/etc/ssl/certs/nginx-selfsigned.crt` → Certificat public
- `/etc/ssl/private/nginx-selfsigned.key` → Clé privée

Ces certificats ont été créés avec :
```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/nginx-selfsigned.key \
  -out /etc/ssl/certs/nginx-selfsigned.crt \
  -subj "/C=SN/ST=Ziguinchor/L=Ziguinchor/O=PVVIH/CN=100.48.20.109"
```

## 🌐 URLs après déploiement

| Service | URL HTTPS |
|---------|-----------|
| A Reference Front | `https://100.48.20.109/` |
| A User Front | `https://100.48.20.109/user` |
| Forum Front | `https://100.48.20.109/forum` |
| API Gateway | `https://100.48.20.109/api` |

**Note** : HTTP est automatiquement redirigé vers HTTPS

## 🚀 Déploiement

### Sur le serveur (100.48.20.109) :

```bash
# 1. Rendre le script exécutable
chmod +x deploy-https.sh

# 2. Lancer le déploiement
./deploy-https.sh
```

## ✅ Vérification

1. Ouvrir `https://100.48.20.109`
2. Accepter l'avertissement de sécurité (certificat auto-signé)
3. Tester la géolocalisation : cliquer sur "Géolocaliser"
4. **Le GPS doit fonctionner !** ✅

## ⚠️ Avertissement de sécurité

Le navigateur affichera :
```
⚠️ Votre connexion n'est pas privée
```

**C'est normal !** Le certificat est auto-signé.

Pour éviter cet avertissement :
- Option 1 : Obtenir un domaine gratuit + certificat Let's Encrypt
- Option 2 : Accepter le risque (OK pour test/démo)

## 🔄 Rollback (retour à HTTP)

Pour revenir à HTTP si nécessaire :

```bash
# 1. Restaurer docker-compose.yml
git checkout docker-compose.yml

# 2. Redémarrer
docker-compose down
docker-compose up -d
```

## 🔧 Ports utilisés

| Port | Service | Accès |
|------|---------|-------|
| 80 | Nginx HTTP | Redirige vers 443 |
| 443 | Nginx HTTPS | Accès public |
| 8080 | Gateway | Interne seulement |
| 3001-3003 | Frontends | Interne seulement |

## 📊 Avantages de cette configuration

✅ GPS fonctionne (HTTPS requis)
✅ Pas de changement dans les microservices
✅ Communication interne reste en HTTP (plus rapide)
✅ Un seul point d'entrée (Nginx)
✅ Redirection HTTP → HTTPS automatique
✅ Headers de sécurité ajoutés

## 🐛 Dépannage

### Nginx ne démarre pas
```bash
docker logs nginx-https
```

### Certificat introuvable
```bash
ls -la /etc/ssl/certs/nginx-selfsigned.crt
ls -la /etc/ssl/private/nginx-selfsigned.key
```

### GPS ne fonctionne toujours pas
- Vérifier que vous accédez via `https://` (pas `http://`)
- Vérifier dans la console du navigateur (F12)
- Confirmer que le certificat est accepté

## 📝 Notes importantes

1. **Communication interne** : Les conteneurs communiquent en HTTP (c'est normal et sécurisé dans Docker)
2. **Endpoints API** : `http://100.48.20.109:8080/api/*` continue de fonctionner
3. **Accès HTTPS** : `https://100.48.20.109/api/*` est maintenant disponible
4. **Pas de changement** dans le code des microservices ou frontends

## 🎉 Résultat

GPS fonctionne maintenant en HTTPS ! L'utilisateur peut :
1. Cliquer sur "Géolocaliser"
2. Autoriser l'accès à la position
3. Voir le marqueur bleu à sa position exacte
4. Enregistrer une structure de santé

---

**Date de création** : 2026-09-04  
**Certificat valide jusqu'au** : 2027-09-04 (365 jours)
