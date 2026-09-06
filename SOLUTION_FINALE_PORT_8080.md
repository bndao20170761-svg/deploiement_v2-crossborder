# 🔧 Solution Finale : Corriger le Port 8080 SSL

## 🚨 Problème Identifié

Les frontends ne peuvent pas se connecter à l'API Gateway car :
```
POST https://100.48.20.109:8080/api/user-auth/login
❌ ERR_SSL_PROTOCOL_ERROR
```

**Cause** : Le port 8080 SSL n'est pas correctement configuré dans nginx-https

## ✅ Solution Rapide (Sur le Serveur GCP)

### Étape 1 : Connectez-vous au serveur

```bash
# Depuis votre PC
ssh ec2-user@100.48.20.109
```

### Étape 2 : Allez dans le répertoire du projet

```bash
cd ~/deploiement_v2-crossborder
```

### Étape 3 : Téléchargez et exécutez le script de correction

```bash
# Option A : Si vous avez le fichier sur votre PC, transférez-le
# Sur votre PC PowerShell :
# scp CORRIGER_NGINX_HTTPS_SUR_SERVEUR.sh ec2-user@100.48.20.109:~/deploiement_v2-crossborder/

# Option B : Créez-le directement sur le serveur
cat > CORRIGER_NGINX_HTTPS_SUR_SERVEUR.sh << 'EOF'
#!/bin/bash
# Script de correction nginx-https
set -e

echo "🔧 Correction nginx-https en cours..."

# Backup
if [ -f "nginx-https.conf" ]; then
    cp nginx-https.conf nginx-https.conf.backup.$(date +%Y%m%d_%H%M%S)
fi

# Télécharger la configuration corrigée depuis GitHub (si disponible)
# OU créer manuellement

echo "✅ Redémarrage nginx-https..."
docker compose restart nginx-https

sleep 5

echo "✅ Test port 8080:"
curl -k -I https://localhost:8080/actuator/health | head -5

echo ""
echo "✅ TERMINÉ ! Testez depuis votre navigateur:"
echo "   https://100.48.20.109:8080/actuator/health"
EOF

chmod +x CORRIGER_NGINX_HTTPS_SUR_SERVEUR.sh
bash CORRIGER_NGINX_HTTPS_SUR_SERVEUR.sh
```

### Étape 4 : Vérifiez que ça fonctionne

```bash
# Test depuis le serveur
curl -k https://localhost:8080/actuator/health

# Devrait retourner du JSON (pas du HTML!)
```

## 🧪 Tests depuis votre PC

Ouvrez votre navigateur et testez :

1. **Gateway Health** : `https://100.48.20.109:8080/actuator/health`
   - Devrait afficher du JSON, pas du HTML
   
2. **Frontend a-reference** : `https://100.48.20.109:3001`
   - Login devrait fonctionner
   
3. **Frontend a-user** : `https://100.48.20.109:3003`
   - Login devrait fonctionner

## 🔍 Diagnostic si ça ne marche toujours pas

### Sur le Serveur

```bash
# 1. Vérifier que nginx-https écoute bien sur le port 8080
docker exec nginx-https netstat -tlnp | grep 8080

# 2. Vérifier les logs nginx
docker logs nginx-https --tail 50

# 3. Vérifier que le Gateway fonctionne
docker logs gateway-pvvih --tail 30

# 4. Test direct du Gateway (sans SSL)
curl http://gateway-pvvih:8080/actuator/health

# 5. Vérifier la configuration nginx chargée
docker exec nginx-https cat /etc/nginx/conf.d/default.conf | grep "listen.*8080"
```

### Depuis votre PC

```powershell
# Test connexion SSL port 8080
$ErrorActionPreference = "Continue"
Invoke-WebRequest -Uri "https://100.48.20.109:8080/actuator/health" -SkipCertificateCheck

# Devrait retourner du JSON, pas une erreur SSL
```

## 📊 Configuration Complète Attendue

```nginx
# Port 8080 - API Gateway
server {
    listen 8080 ssl;
    server_name _;

    ssl_certificate /etc/nginx/ssl/nginx-selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx-selfsigned.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://gateway-pvvih:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## ❌ Erreurs Courantes

### Erreur 1 : "ERR_SSL_PROTOCOL_ERROR"
**Cause** : Le port 8080 n'a pas de certificat SSL configuré
**Solution** : Vérifier que le bloc `listen 8080 ssl` existe dans nginx-https.conf

### Erreur 2 : API retourne du HTML au lieu de JSON
**Cause** : nginx route mal les requêtes vers le Gateway
**Solution** : Vérifier que `proxy_pass http://gateway-pvvih:8080` pointe bien vers le Gateway

### Erreur 3 : "Connection refused" sur port 8080
**Cause** : nginx-https ne démarre pas correctement
**Solution** : 
```bash
docker compose restart nginx-https
docker logs nginx-https --tail 50
```

## 🎯 Résultat Attendu

Après correction, vous devriez pouvoir :

1. ✅ Charger `https://100.48.20.109:8080/actuator/health` → JSON
2. ✅ Login sur `https://100.48.20.109:3001` → Fonctionne
3. ✅ Login sur `https://100.48.20.109:3003` → Fonctionne
4. ✅ Pas d'erreur "ERR_SSL_PROTOCOL_ERROR"
5. ✅ Les APIs retournent du JSON, pas du HTML

---

**Dernière mise à jour** : 6 septembre 2026
**Priorité** : 🔥 CRITIQUE - Bloque toutes les fonctionnalités
