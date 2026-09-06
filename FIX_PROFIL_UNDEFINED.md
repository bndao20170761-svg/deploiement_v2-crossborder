# Fix: Profil "undefined undefined"

## 🐛 Problème identifié

Le profil utilisateur affichait "undefined undefined" **même quand les données nom/prénom existent**.

### Cause racine

Dans `Header.js` ligne 536, le code utilisait :

```javascript
{(doctor && doctor.prenom && doctor.nom) 
  ? `${doctor.prenom} ${doctor.nom}` 
  : doctor.username}
```

**Problème** : Si `doctor.prenom` ou `doctor.nom` sont des **chaînes vides** (`""`), la condition est FALSE car une chaîne vide est "falsy" en JavaScript.

Résultat : même si les données existent, ça affiche `username` à la place.

## ✅ Solution appliquée

Nouveau code (lignes 536 et 559) :

```javascript
{doctor?.nom || doctor?.prenom 
  ? `${doctor.prenom || ''} ${doctor.nom || ''}`.trim()
  : doctor?.username || 'Utilisateur'}
```

**Explication** :
- `doctor?.nom || doctor?.prenom` : vérifie si AU MOINS UN des deux existe (pas vide)
- `${doctor.prenom || ''} ${doctor.nom || ''}` : remplace les valeurs null/undefined par chaîne vide
- `.trim()` : enlève les espaces au début/fin (important si un seul champ est rempli)
- Fallback : `username` puis `'Utilisateur'`

## 🎯 Cas gérés

| Situation | Ancien code | Nouveau code |
|-----------|-------------|--------------|
| Prénom + Nom présents | ✅ "Jean Dupont" | ✅ "Jean Dupont" |
| Prénom + Nom vides | ❌ "username" | ✅ "" → "username" |
| Seulement Prénom | ❌ "username" | ✅ "Jean" |
| Seulement Nom | ❌ "username" | ✅ "Dupont" |
| Rien | ✅ "username" | ✅ "username" |
| Tout vide | ❌ undefined | ✅ "Utilisateur" |

## 📋 Déploiement

### Sur votre PC (PowerShell)

```powershell
# Exécuter le script de déploiement
.\deploy-fix-profil.ps1
```

OU manuellement :

```powershell
git add a_reference_front/src/components/Header.js
git commit -m "fix: affichage correct nom/prénom utilisateur"
git push origin main
```

### Sur le serveur AWS

```bash
ssh ec2-user@100.48.20.109

cd ~/deploiement_v2-crossborder
git pull
docker compose stop a-reference-front
docker compose build --no-cache a-reference-front
docker compose up -d a-reference-front
```

### Vérification

```bash
# Vérifier que le conteneur tourne
docker ps | grep a-reference-front

# Voir les logs
docker logs a-reference-front --tail 20
```

### Test dans le navigateur

1. Ouvrir `https://100.48.20.109`
2. Se connecter avec `filoraliouine@gmail.com`
3. Vérifier le profil en haut à droite
4. **Forcer le refresh** : Ctrl+Shift+R (pour vider le cache)

## 🔍 Debug si ça ne marche toujours pas

### Vérifier les données utilisateur

Ouvrir la console du navigateur (F12) et chercher :

```
✅ Données utilisateur récupérées: {...}
🔄 Données normalisées: {...}
📋 Affichage: "Prénom Nom"
```

### Si les données sont vides dans l'API

```bash
# Sur le serveur
docker exec -it mysql-user mysql -u root -ppassword123

USE db_user_pvvih;

# Vérifier les données
SELECT username, nom, prenom, profil FROM users 
WHERE username = 'filoraliouine@gmail.com';

# Si vides, mettre à jour
UPDATE users 
SET prenom = 'Filora', nom = 'Liouine' 
WHERE username = 'filoraliouine@gmail.com';
```

### Si l'API retourne null

Le code dans Header.js normalise déjà plusieurs formats :

```javascript
const normalizedUser = {
  prenom: userData.prenom || userData.firstName || "",
  nom: userData.nom || userData.lastName || "",
  username: userData.username || userData.email || "",
  profil: userData.profil || userData.role || ""
};
```

Donc ça supporte :
- Format français : `prenom`, `nom`
- Format anglais : `firstName`, `lastName`
- Email comme fallback pour username

## 🎉 Résultat attendu

Après déploiement, le header devrait afficher :

```
👤 Filora Liouine  ▼
```

Au lieu de :

```
👤 undefined undefined  ▼
```

## 📝 Fichiers modifiés

- ✅ `a_reference_front/src/components/Header.js` (lignes 536 + 559)

## ⚠️ Important

N'oubliez pas de **rebuilder l'image Docker** ! Les modifications du code source ne sont pas prises en compte tant que l'image n'est pas reconstruite.

```bash
docker compose build --no-cache a-reference-front
```

L'option `--no-cache` force la reconstruction complète (important !).
