# 🔧 Explication: Pourquoi le Port 3003 ne Fonctionnait Pas

## ❌ Le Problème (AVANT)

```
Port 3003 utilisé par 2 services en même temps:
┌─────────────────────────────────────────┐
│  docker-compose.yml                     │
│                                         │
│  a-user-front:                          │
│    ports:                               │
│      - "3003:80"  ← HTTP sans SSL      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  nginx-https.conf                       │
│                                         │
│  server {                               │
│    listen 3003 ssl;  ← HTTPS avec SSL  │
│  }                                      │
└─────────────────────────────────────────┘

        ❌ CONFLIT!
    Les deux veulent le port 3003
```

### Résultat
Quand vous tapez `https://100.48.20.109:3003`:
- Le système ne sait pas quel service utiliser
- nginx-https ne peut pas démarrer son listener SSL sur 3003
- Vous obtenez `ERR_SSL_PROTOCOL_ERROR`

## ✅ La Solution (APRÈS)

```
Ports séparés:

Port 3013 (HTTP direct):
┌─────────────────────────────────────────┐
│  docker-compose.yml                     │
│                                         │
│  a-user-front:                          │
│    ports:                               │
│      - "3013:80"  ← HTTP sans SSL      │
└─────────────────────────────────────────┘

Port 3003 (HTTPS avec SSL):
┌─────────────────────────────────────────┐
│  nginx-https.conf                       │
│                                         │
│  server {                               │
│    listen 3003 ssl;  ← HTTPS avec SSL  │
│    proxy_pass http://a-user-front:80;   │
│  }                                      │
└─────────────────────────────────────────┘

        ✅ PLUS DE CONFLIT!
```

### Résultat
Maintenant vous avez **2 façons d'accéder** à `a-user-front`:

1. **HTTPS (recommandé)** : `https://100.48.20.109:3003`
   - Passe par nginx-https
   - Certificat SSL (auto-signé)
   - Sécurisé

2. **HTTP (debug)** : `http://100.48.20.109:3013`
   - Accès direct au conteneur
   - Pas de SSL
   - Pour tests uniquement

## 📊 Ports Utilisés - Vue Complète

### nginx-https (Proxy SSL)
| Port | Protocole | Cible |
|------|-----------|-------|
| 443  | HTTPS     | a-reference-front |
| 3001 | HTTPS     | a-reference-front |
| 3002 | HTTPS     | gestion-forum-front |
| 3003 | HTTPS     | a-user-front |
| 8080 | HTTPS     | gateway-pvvih (passthrough) |

### Conteneurs Frontend (HTTP Direct)
| Port | Service | Protocole |
|------|---------|-----------|
| 3011 | a-reference-front | HTTP |
| 3012 | gestion-forum-front | HTTP |
| 3013 | a-user-front | HTTP (changé de 3003) |

## 🎯 Ce Qui A Changé

### Fichier Modifié: `docker-compose.yml`

**AVANT:**
```yaml
  a-user-front:
    container_name: a-user-front
    ports:
      - "3003:80"  # ❌ Conflit avec nginx-https
```

**APRÈS:**
```yaml
  a-user-front:
    container_name: a-user-front
    ports:
      - "3013:80"  # ✅ Port libre, plus de conflit
```

### Fichier Déjà Correct: `nginx-https.conf`

```nginx
# Serveur HTTPS pour a-user-front sur port 3003
server {
    listen 3003 ssl;
    server_name _;

    ssl_certificate /etc/nginx/ssl/nginx-selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx-selfsigned.key;

    location / {
        proxy_pass http://a-user-front:80;
        # ... headers ...
    }
}
```

## 🚀 Commandes d'Application

```bash
# Sur le serveur:
cd ~/deploiement_v2-crossborder
docker compose stop a-user-front nginx-https
docker compose rm -f a-user-front nginx-https
docker compose up -d a-user-front nginx-https

# Vérifier:
docker ps | grep -E "(nginx-https|a-user-front)"
curl -k -I https://localhost:3003/
```

## ✅ Vérification Finale

### Sur le Serveur
```bash
# Doit afficher "listen 3003 ssl"
docker exec nginx-https cat /etc/nginx/conf.d/default.conf | grep "listen.*3003"

# Doit retourner HTTP/2 200
curl -k -I https://localhost:3003/
```

### Depuis Votre PC
Ouvrir dans le navigateur:
```
https://100.48.20.109:3003
```

Résultat attendu:
- ✅ Avertissement certificat (cliquer "Avancé" → "Continuer")
- ✅ Application se charge
- ✅ Plus d'erreur ERR_SSL_PROTOCOL_ERROR
- ✅ Plus d'erreur 404 sur les JS/CSS

---

**Dernière mise à jour** : 6 septembre 2026  
**Fichiers modifiés** : `docker-compose.yml`  
**Fichiers créés** : Documents de correction et scripts
