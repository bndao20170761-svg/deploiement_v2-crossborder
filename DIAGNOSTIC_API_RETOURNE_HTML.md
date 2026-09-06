# 🚨 PROBLÈME CRITIQUE : API Retourne HTML au lieu de JSON

## Symptômes

```javascript
// Au lieu de JSON, l'API retourne du HTML !
✅ patientService: Données patients: <!doctype html><html lang="en">...

// Erreur JavaScript qui suit
Uncaught TypeError: r.filter is not a function
```

## Cause Racine

Quand **a-reference-front** (port 3001) appelle l'API Gateway :
```
GET https://100.48.20.109:8080/api/patients
```

**Le nginx-https retourne la page HTML de a-user-front au lieu de router vers le Gateway !**

## Pourquoi Cela Arrive ?

### Configuration nginx-https.conf actuelle

```nginx
# Port 443 - Configuration PRINCIPALE
server {
    listen 443 ssl;
    
    # Route /api/ vers Gateway ✅
    location /api/ {
        proxy_pass http://gateway-pvvih:8080/api/;
    }
    
    # Route /user/ vers a-user-front ✅
    location /user/ {
        proxy_pass http://a-user-front:80/;
    }
    
    # Route TOUT LE RESTE vers a-reference-front ✅
    location / {
        proxy_pass http://a-reference-front:80;
    }
}

# Port 8080 - PAS DE CONFIGURATION SSL ! ❌
# PROBLÈME : Pas de bloc "server { listen 8080 ssl; }"
```

### Ce Qui Se Passe

1. **Frontend a-reference-front** charge sur `https://100.48.20.109:3001` ✅
2. **JavaScript** essaie d'appeler `https://100.48.20.109:8080/api/patients`
3. **Port 8080 n'a PAS de configuration SSL dans nginx** ❌
4. **La requête tombe sur le port 443 par défaut** (fallback)
5. **nginx-https sur port 443 ne reconnaît pas le pattern `/api/`** car la requête vient avec l'host `:8080`
6. **nginx route vers la location `/` par défaut** → a-reference-front HTML ❌

## Solution

### Option 1 : Ajouter le Port 8080 SSL dans nginx-https.conf (RECOMMANDÉ)

```nginx
# Ajouter ce bloc à nginx-https.conf
server {
    listen 8080 ssl;
    server_name _;

    # Certificats SSL
    ssl_certificate /etc/nginx/ssl/nginx-selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx-selfsigned.key;
    
    # Configuration SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Router TOUT vers le Gateway
    location / {
        proxy_pass http://gateway-pvvih:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Headers CORS
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Option 2 : Changer les URLs Frontend pour utiliser /api/ sur port 443

Modifier les frontends pour qu'ils appellent :
```
https://100.48.20.109/api/patients  (au lieu de :8080/api/patients)
```

Mais nécessite rebuild de tous les frontends.

## Action Immédiate

### Sur le Serveur GCP

```bash
# 1. Vérifier la configuration nginx actuelle
docker exec nginx-https cat /etc/nginx/conf.d/default.conf | grep "listen.*8080"

# 2. Si VIDE (pas de port 8080 configuré), c'est confirmé !

# 3. Tester directement le Gateway depuis le serveur
curl http://gateway-pvvih:8080/api/users/actuator/health

# 4. Vérifier que le Gateway est accessible
docker logs gateway-pvvih --tail 50
```

## Vérification du Problème

```bash
# Test depuis le serveur
curl -I https://100.48.20.109:8080/api/users/actuator/health

# Si retourne du HTML au lieu de JSON → CONFIRMÉ
```

## Impact

- ❌ **Aucune API ne fonctionne** depuis les frontends
- ❌ **Authentification OK** (car elle utilise localStorage, pas d'API)
- ❌ **Chargement des données** → Erreurs JavaScript
- ❌ **Toutes les fonctionnalités dynamiques** cassées

## Prochaines Étapes

1. **Confirmer le diagnostic** sur le serveur
2. **Ajouter la configuration port 8080 SSL** dans nginx-https.conf
3. **Copier le fichier corrigé** vers le serveur
4. **Redémarrer nginx-https**
5. **Tester** : `curl -k https://100.48.20.109:8080/api/users/actuator/health`

---

**Dernière mise à jour** : 6 septembre 2026
**Priorité** : 🔥 CRITIQUE - Bloque toutes les fonctionnalités
