# 🚨 ACTION IMMÉDIATE - Corriger Port 3003 SSL

## Le Problème
```
https://100.48.20.109:3003/ → ERR_SSL_PROTOCOL_ERROR
```

## La Cause
Le port 3003 n'a **PAS de configuration SSL** dans nginx-https.conf

## La Solution en 3 Commandes

### Sur votre PC Windows (PowerShell) :
```powershell
scp nginx-https.conf ec2-user@100.48.20.109:~/deploiement_v2-crossborder/
```

### Sur le serveur GCP :
```bash
ssh ec2-user@100.48.20.109

cd ~/deploiement_v2-crossborder

docker compose stop nginx-https && docker compose rm -f nginx-https && docker compose up -d nginx-https
```

### Vérification :
```bash
docker exec nginx-https cat /etc/nginx/conf.d/default.conf | grep -c "listen.*ssl"
```
**Résultat attendu** : `4` (ports 443, 3001, 3002, 3003)

## Test Final

Ouvrez dans votre navigateur :
```
https://100.48.20.109:3003
```

Devrait maintenant afficher l'application a-user-front ✅

---

**Temps estimé** : 2 minutes
**Fichiers modifiés** : `nginx-https.conf` (déjà corrigé localement)
**Action requise** : Transférer + Redémarrer nginx-https
