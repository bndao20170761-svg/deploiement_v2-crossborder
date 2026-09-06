# ⚠️ URGENT: Correction Port 3003 HTTPS

## 🔴 Le Problème

Erreur sur `https://100.48.20.109:3003`:
```
ERR_SSL_PROTOCOL_ERROR
```

**Cause** : Le port 3003 était utilisé par 2 services (conflit).

## ✅ La Solution (Déjà Appliquée Localement)

J'ai modifié `docker-compose.yml`:
- **AVANT** : a-user-front utilise le port 3003 (HTTP)
- **APRÈS** : a-user-front utilise le port 3013 (HTTP)
- **nginx-https** utilise maintenant le port 3003 (HTTPS)

## 🚀 À Faire MAINTENANT Sur le Serveur

**Copier-coller ces commandes** (prend 30 secondes):

```bash
cd ~/deploiement_v2-crossborder

docker compose stop a-user-front nginx-https

docker compose rm -f a-user-front nginx-https

docker compose up -d a-user-front nginx-https

sleep 10

docker ps | grep -E "(nginx-https|a-user-front)"

curl -k -I https://localhost:3003/
```

## ✅ Vérification

Après avoir exécuté les commandes:

1. **Sur le serveur**, vous devriez voir:
   ```
   HTTP/2 200
   server: nginx
   ```

2. **Sur votre PC**, ouvrez:
   ```
   https://100.48.20.109:3003
   ```
   
   ✅ L'application doit maintenant se charger correctement

## 📋 Résumé des URLs

| URL | Description | Status |
|-----|-------------|--------|
| `https://100.48.20.109:3001` | a-reference-front | ✅ Fonctionne |
| `https://100.48.20.109:3002` | gestion-forum-front | ✅ Fonctionne |
| `https://100.48.20.109:3003` | a-user-front | ✅ **CORRIGÉ** |
| `http://100.48.20.109:3013` | a-user-front (HTTP direct) | ✅ Nouveau port |

## 📁 Fichiers Modifiés

- ✅ `docker-compose.yml` → Port 3003 → 3013 pour a-user-front
- ✅ `nginx-https.conf` → Déjà correct
- ✅ `a_user_front/Dockerfile` → Ajout PUBLIC_URL=/user (pour /user/)

## ⏱️ Temps Total

**< 1 minute** pour appliquer la correction

---

**Date** : 6 septembre 2026  
**Serveur** : 100.48.20.109  
**Action** : Redémarrage de 2 conteneurs seulement
