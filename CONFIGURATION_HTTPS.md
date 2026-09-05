# Configuration HTTPS - Résumé des changements

## ✅ Fichiers modifiés localement

### 1. `nginx-https.conf`
Configuration nginx corrigée pour éviter les conflits de routes :
- **Ordre important** : `/api/` → `/user/` → `/forum/` → `/` (racine en dernier)
- Supprimé les `rewrite` qui causaient les 404
- Tous les frontends utilisent `proxy_pass` sans modification de chemin
- Supprimé la route conflictuelle `/static/`

### 2. `docker-compose.yml`
- Service `nginx-https` actif avec ports 80 et 443
- Frontends **sans ports exposés** (3001, 3002, 3003 commentés)
- Volumes SSL montés : `/etc/ssl/certs/` et `/etc/ssl/private/`

## 📋 Changements à faire sur le serveur AWS

### Étape 1 : Pousser les fichiers sur GitHub
```powershell
git add nginx-https.conf
git commit -m "fix: correction configuration nginx-https routes"
git push origin main
```

### Étape 2 : Sur le serveur AWS (IP: 100.48.20.109)
```bash
cd ~/deploiement_v2-crossborder

# Pull les derniers changements
git pull

# Redémarrer nginx-https pour appliquer la nouvelle config
docker compose restart nginx-https

# Vérifier les logs
docker logs nginx-https --tail 50
```

### Étape 3 : Mettre à jour la configuration Gateway sur GitHub
**Fichier à modifier** : `https://github.com/BabacarNdaoKgl/cloud-config-repo-enda.git`
**Nom du fichier** : `GETWAY_PVVIH-dev.yml`

**Section CORS à modifier** :
```yaml
spring:
  cloud:
    gateway:
      globalcors:
        corsConfigurations:
          '[/**]':
            allowedOrigins:
              # Développement local
              - "http://localhost:3000"
              - "http://localhost:3001"
              - "http://localhost:3002"
              - "http://localhost:3003"
              - "http://127.0.0.1:3000"
              - "http://127.0.0.1:3001"
              - "http://127.0.0.1:3002"
              - "http://127.0.0.1:3003"
              # Production HTTPS AWS (IP: 100.48.20.109)
              # Note: Avec nginx-https, tous les frontends passent par le port 443
              - "https://100.48.20.109"
            allowedMethods:
              - GET
              - POST
              - PUT
              - DELETE
              - OPTIONS
              - PATCH
            allowedHeaders: "*"
            allowCredentials: true
            maxAge: 3600
```

### Étape 4 : Recharger la configuration Gateway
```bash
# Sur le serveur AWS, redémarrer le gateway pour recharger la config
docker compose restart gateway-pvvih

# Attendre 30 secondes que le gateway se reconnecte à Eureka
sleep 30

# Vérifier que le gateway est en bonne santé
docker ps | grep gateway-pvvih
docker logs gateway-pvvih --tail 50
```

## 🧪 Tests à effectuer

### Test 1 : Page principale (a_reference_front)
```
https://100.48.20.109/
```
- ✅ La page doit s'afficher complètement
- ✅ Les fichiers CSS et JS doivent se charger (pas de 404)
- ✅ Après connexion, tester la géolocalisation GPS

### Test 2 : Page utilisateur (a_user_front)  
```
https://100.48.20.109/user/
```
- ✅ La page doit s'afficher complètement
- ✅ Les fichiers CSS et JS doivent se charger

### Test 3 : Page forum (gestion_forum_front)
```
https://100.48.20.109/forum/
```
- ✅ La page doit s'afficher complètement
- ✅ Les fichiers CSS et JS doivent se charger

### Test 4 : API Gateway
```bash
# Test depuis le navigateur ou curl
curl -k https://100.48.20.109/api/auth/test
```

## 📊 Architecture HTTPS finale

```
Utilisateur (navigateur)
    ↓ HTTPS (443)
nginx-https
    ├─→ / → a-reference-front:80 (HTTP interne)
    ├─→ /user/ → a-user-front:80 (HTTP interne)
    ├─→ /forum/ → gestion-forum-front:80 (HTTP interne)
    └─→ /api/ → gateway-pvvih:8080 (HTTP interne)
```

**Important** : 
- Communication **externe** (navigateur → nginx) : **HTTPS** sur port 443
- Communication **interne** (nginx → conteneurs) : **HTTP** (plus simple, sécurisé par le réseau Docker)
- Les ports 3001, 3002, 3003 **ne sont plus utilisés** (commentés dans docker-compose.yml)

## ⚠️ Problèmes résolus

1. **404 sur fichiers statiques** : Suppression du conflit entre `location /static/` et `location /`
2. **Ordre des routes** : Les routes spécifiques (`/api/`, `/user/`, `/forum/`) sont maintenant **avant** la route générique `/`
3. **CORS** : Ajout de `https://100.48.20.109` dans allowedOrigins
4. **Rewrite conflicts** : Suppression des `rewrite` qui causaient des chemins incorrects

## 🎯 Prochaine étape

Une fois les changements appliqués :

1. **Testez le GPS** sur `https://100.48.20.109/` (page principale)
   - Acceptez le certificat auto-signé
   - Connectez-vous
   - Allez sur Cartographie
   - Cliquez "Géolocaliser"
   - Le navigateur devrait demander la permission GPS ✅

2. **Vérifiez `/user/` et `/forum/`** : les pages doivent maintenant se charger complètement

## 📞 En cas de problème

Si après ces changements il y a encore des 404 :
```bash
# Vérifier la configuration nginx
docker exec nginx-https cat /etc/nginx/conf.d/default.conf

# Vérifier les logs nginx en temps réel
docker logs -f nginx-https

# Vérifier que les conteneurs frontends répondent
docker exec nginx-https wget -O- http://a-reference-front:80
docker exec nginx-https wget -O- http://a-user-front:80
docker exec nginx-https wget -O- http://gestion-forum-front:80
```
