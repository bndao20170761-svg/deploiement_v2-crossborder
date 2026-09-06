# 🚀 EXÉCUTEZ CECI SUR LE SERVEUR

## 📍 Vous êtes ici

Vous avez l'erreur :
```
https://100.48.20.109/user/ → 404 sur /static/...
```

Mais vous voulez que ça marche comme :
```
https://100.48.20.109/ → ✅ Fonctionne (a-reference-front)
```

## ✅ LA SOLUTION EN 3 COMMANDES

### 1. Connectez-vous au serveur

```bash
ssh ec2-user@100.48.20.109
```

### 2. Allez dans le dossier

```bash
cd ~/deploiement_v2-crossborder
```

### 3. Exécutez le script de correction

```bash
chmod +x FIX_COMPLET_USER_PATH.sh
./FIX_COMPLET_USER_PATH.sh
```

**⏱️ Temps d'exécution** : 5-10 minutes (rebuild de l'image Docker)

## 📊 Ce que fait le script

1. ✅ Backup de `nginx-https.conf` et `Dockerfile`
2. ✅ Modifie `nginx-https.conf` avec rewrite (comme pour /)
3. ✅ Ajoute `ENV PUBLIC_URL=/user` au Dockerfile
4. ✅ Rebuild `a-user-front` avec PUBLIC_URL
5. ✅ Redémarre nginx-https et a-user-front
6. ✅ Vérifie que PUBLIC_URL est appliqué
7. ✅ Teste les URLs

## 🎯 RÉSULTAT ATTENDU

Après le script, ces URLs doivent fonctionner :

```
✅ https://100.48.20.109/user/      → a-user-front (path-based)
✅ https://100.48.20.109:3003/      → a-user-front (port direct)
✅ https://100.48.20.109/            → a-reference-front (racine)
✅ https://100.48.20.109:3001/      → a-reference-front (port direct)
```

## 🔍 VÉRIFICATION MANUELLE

Si vous voulez vérifier que PUBLIC_URL a bien été appliqué :

```bash
docker exec a-user-front cat /usr/share/nginx/html/index.html | grep static
```

**Attendu** :
```html
<script src="/user/static/js/main.2149f24b.js"></script>
<link href="/user/static/css/main.ee6e3d7a.css" rel="stylesheet">
```

**Si vous voyez `/static/...` au lieu de `/user/static/...`**, le PUBLIC_URL n'a pas été appliqué → relancez le script.

## 🐛 SI ÇA NE MARCHE PAS

### Vérifier les logs

```bash
# Logs nginx
docker logs nginx-https --tail 50

# Logs a-user-front
docker logs a-user-front --tail 50

# État des containers
docker ps | grep -E "(nginx-https|a-user-front)"
```

### Vérifier la config nginx

```bash
docker exec nginx-https nginx -T | grep -A 15 "location /user"
```

### Rebuilder manuellement

```bash
# Forcer le rebuild complet
docker compose build --no-cache --pull a-user-front

# Redémarrer
docker compose stop a-user-front nginx-https
docker compose rm -f a-user-front nginx-https
docker compose up -d a-user-front nginx-https

# Attendre
sleep 30

# Tester
curl -kI https://localhost/user/
```

## 🆘 SOLUTION DE SECOURS

Si VRAIMENT ça ne marche pas, utilisez le port direct qui fonctionne :

```
✅ https://100.48.20.109:3003/
```

C'est plus simple et ça marche déjà ! 😊

## 📝 FICHIERS CRÉÉS

Consultez ces fichiers pour comprendre :
- `SOLUTION_SIMPLE_USER_PATH.md` → Explication détaillée du problème/solution
- `FIX_COMPLET_USER_PATH.sh` → Le script que vous exécutez
- `FIX_USER_PATH_FINAL.sh` → Script alternatif (nginx seulement, sans rebuild)

## 💡 POURQUOI CETTE SOLUTION ?

**a-reference-front fonctionne** sur `/` parce que :
```nginx
location / {
    proxy_pass http://a-reference-front:80;  # PAS de trailing slash
}
```

**a-user-front ne marchait pas** sur `/user/` car :
```nginx
location /user/ {
    proxy_pass http://a-user-front:80/;  # AVEC trailing slash → enlève /user/
}
```

**Solution** : Copier exactement ce qui marche pour `/` :
1. Utiliser `rewrite` pour transformer `/user/...` en `/...`
2. Utiliser `proxy_pass` SANS trailing slash
3. Rebuilder React avec `PUBLIC_URL=/user` pour qu'il génère `/user/static/...`

C'est EXACTEMENT la même logique que pour a-reference-front ! 🎉

---

**Dernière mise à jour** : 6 septembre 2026  
**Testé sur** : GCP VM 100.48.20.109 (Amazon Linux 2023)
