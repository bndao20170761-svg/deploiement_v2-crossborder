# 🔥 PROBLÈME CRITIQUE IDENTIFIÉ

## Le Problème

**nginx-https** et **gateway-pvvih** veulent TOUS LES DEUX utiliser le port 8080 !

```
Error: Bind for 0.0.0.0:8080 failed: port is already allocated
```

Résultat : **nginx-https ne démarre PAS**, donc **AUCUN frontend ne répond** !

## Solution Immédiate

Sur le serveur, exécutez ces commandes :

```bash
# 1. Supprimer nginx-https qui est en erreur
docker rm -f nginx-https

# 2. Relancer nginx-https
docker compose up -d nginx-https

# 3. Vérifier que tout tourne
docker compose ps
```

## Pourquoi Ça Ne Fonctionne Pas ?

Dans `docker-compose.yml`, il y a **2 services** qui exposent le port 8080 :

```yaml
gateway-pvvih:
  ports:
    - "8080:8080"  # ✅ Le Gateway écoute sur 8080

nginx-https:
  ports:
    - "8080:8080"  # ❌ CONFLIT ! Le port est déjà pris !
```

**On ne peut PAS avoir 2 services sur le même port !**

## La Vraie Solution

### Option 1 : Retirer le mapping 8080 de nginx-https (RECOMMANDÉ)

nginx-https n'a **PAS besoin** d'exposer le port 8080 vers l'extérieur. Il doit juste router **en interne** vers le Gateway.

**Modifier `docker-compose.yml`** :

```yaml
nginx-https:
  ports:
    - "443:443"
    - "3001:3001"
    - "3002:3002"
    - "3003:3003"
    # SUPPRIMER CETTE LIGNE: - "8080:8080"
```

Puis :
```bash
docker compose down
docker compose up -d
```

### Option 2 : Utiliser un port différent pour nginx-https

Si vous voulez vraiment un accès HTTPS au Gateway via nginx, utilisez un port différent comme 8443 :

```yaml
nginx-https:
  ports:
    - "443:443"
    - "3001:3001"
    - "3002:3002"
    - "3003:3003"
    - "8443:8080"  # Nginx écoute sur 8443, redirige vers Gateway:8080
```

Dans `nginx-https.conf` :
```nginx
server {
    listen 8443 ssl;  # Changer de 8080 à 8443
    # ... reste de la config
}
```

## URLs Finales Qui Fonctionnent

### ✅ Avec la solution Option 1 (RECOMMANDÉ)

```
https://100.48.20.109:3001   → a-reference-front (HTTPS)
https://100.48.20.109:3003   → a-user-front (HTTPS)
https://100.48.20.109:3002   → gestion-forum-front (HTTPS)
http://100.48.20.109:8080    → API Gateway (HTTP direct)
```

**Les frontends React appellent** :
```env
REACT_APP_GATEWAY_URL=http://100.48.20.109:8080
```

### ✅ Avec la solution Option 2

```
https://100.48.20.109:3001   → a-reference-front (HTTPS)
https://100.48.20.109:3003   → a-user-front (HTTPS)
https://100.48.20.109:3002   → gestion-forum-front (HTTPS)
https://100.48.20.109:8443   → API Gateway via nginx (HTTPS)
http://100.48.20.109:8080    → API Gateway direct (HTTP)
```

**Les frontends React appellent** :
```env
REACT_APP_GATEWAY_URL=https://100.48.20.109:8443
```

## Diagnostic Complet

```bash
# Vérifier l'état des services
docker compose ps

# Voir les ports utilisés
docker compose ps --format "table {{.Name}}\t{{.Ports}}"

# Logs nginx-https
docker logs nginx-https --tail 50

# Logs Gateway
docker logs gateway-pvvih --tail 50

# Test accès direct frontends (sans nginx)
curl http://172.28.0.15/  # a-reference-front
curl http://172.28.0.13/  # a-user-front

# Test Gateway
curl http://localhost:8080/actuator/health
```

## Actions Immédiates

1. **Corriger `docker-compose.yml`** → Retirer le mapping `8080:8080` de nginx-https
2. **Redémarrer** : `docker compose down && docker compose up -d`
3. **Tester** : `https://100.48.20.109:3001`
4. **Vérifier les APIs** : Les frontends doivent appeler `http://100.48.20.109:8080`

---

**Date** : 6 septembre 2026  
**Priorité** : 🔥 CRITIQUE - Bloque tout
