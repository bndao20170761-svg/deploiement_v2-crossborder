# 🎯 Solution Simple - Erreur 404 sur /user/

## ❌ Le problème

```
GET https://100.48.20.109/static/js/main.2149f24b.js 
❌ 404 (Not Found)
```

## ✅ La solution (3 fichiers modifiés)

### 1. `nginx-https.conf`

Avant :
```nginx
location /user {
    rewrite ^/user/(.*)$ /$1 break;  ❌ Casse les chemins
    ...
}
```

Après :
```nginx
location /user/ {
    proxy_pass http://a-user-front:80/;  ✅ Simple
    ...
}
```

### 2. `a_user_front/package.json`

Ajouter :
```json
"homepage": "/user",
```

### 3. `gestion_forum_front/package.json`

Ajouter :
```json
"homepage": "/forum",
```

## 🚀 Déployer

### Sur votre PC :
```powershell
git add .
git commit -m "fix: correction 404 /user/"
git push
```

### Sur le serveur :
```bash
ssh ec2-user@100.48.20.109
cd ~/deploiement_v2-crossborder
git pull
docker compose stop nginx-https a-user-front gestion-forum-front
docker compose build --no-cache a-user-front gestion-forum-front
docker compose up -d
```

## ✅ Tester

1. Ouvrez `https://100.48.20.109/user/`
2. F12 → Console
3. Vérifiez : ✅ Pas d'erreur 404

## 🔄 Si ça ne marche pas

Videz le cache :
- **Windows** : `Ctrl + Shift + R`
- **Mac** : `Cmd + Shift + R`

C'est tout ! 🎉
