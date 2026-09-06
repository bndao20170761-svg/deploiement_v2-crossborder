# 🐛 Debug : Profil utilisateur "undefined undefined"

## ❓ Problème
Après connexion, le profil affiche "undefined undefined" au lieu du nom/prénom.

## 🔍 Diagnostic dans le navigateur

### Étape 1 : Vérifier la console (F12)
1. Ouvrez `https://100.48.20.109`
2. F12 → Onglet **Console**
3. Cherchez le log : `✅ Données utilisateur récupérées:`
4. Regardez l'objet affiché juste après

**Ce que vous devriez voir** :
```javascript
✅ Données utilisateur récupérées: 
{
  profil: "MEDECIN",
  prenom: "Votre_Prénom",
  nom: "Votre_Nom",
  username: "votre@email.com"
}
```

**Si vous voyez à la place** :
```javascript
{
  firstName: "...",
  lastName: "...",
  // OU autre structure
}
```
→ Le backend retourne des champs différents !

### Étape 2 : Vérifier la requête Network
1. F12 → Onglet **Network**
2. Filtrez par "me"
3. Cliquez sur la requête `me` (ou `user/me`)
4. Onglet **Response** → voyez la structure JSON

## 🔧 Solutions possibles

### Solution A : Le backend retourne bien `prenom` et `nom`
Si la console montre `{prenom: "X", nom: "Y"}` mais ça affiche quand même undefined :

**Problème** : Cache du navigateur

```bash
# Sur le navigateur
1. F12 → Network → Cochez "Disable cache"
2. Ctrl+Shift+R (hard refresh)
3. Ou videz le cache : Paramètres → Effacer les données
```

### Solution B : Le backend retourne des champs différents

Si la console montre `{firstName: "X", lastName: "Y"}` :

**Le backend retourne** : `firstName` / `lastName`  
**Le frontend attend** : `prenom` / `nom`

Il faut adapter Header.js pour utiliser les bons champs.

### Solution C : Les champs sont vides en base de données

Si la console montre `{prenom: "", nom: "", username: "email@test.com"}` :

**Problème** : L'utilisateur en base n'a pas de prénom/nom renseignés

```sql
-- Vérifiez en base de données (sur le serveur)
docker exec -it mysql-user mysql -uroot -proot BDDUSER_PVVIH -e "SELECT username, nom, prenom FROM users WHERE username='filioraliou ne@gmail.com';"
```

## 📝 Test rapide depuis le navigateur

Dans la console (F12), tapez :

```javascript
// Vérifier le token
console.log("Token:", localStorage.getItem("token"));

// Vérifier les données user
console.log("User:", JSON.parse(localStorage.getItem("user") || "{}"));

// Tester l'API manuellement
fetch("https://100.48.20.109/api/user/me", {
  headers: {
    "Authorization": `Bearer ${localStorage.getItem("token")}`
  }
})
.then(r => r.json())
.then(data => console.log("API Response:", data))
.catch(e => console.error("Error:", e));
```

## 🎯 Fix rapide si les champs sont différents

Si l'API retourne `firstName` et `lastName` au lieu de `prenom` et `nom` :

### Option 1 : Modifier Header.js pour supporter les deux formats

Changez dans Header.js ligne ~99 :

```javascript
setDoctor(response.data);
```

Par :

```javascript
// Support multiple formats
const userData = response.data;
const normalizedUser = {
  prenom: userData.prenom || userData.firstName || "",
  nom: userData.nom || userData.lastName || "",
  username: userData.username || userData.email || "",
  profil: userData.profil || userData.role || ""
};
console.log("✅ Données normalisées:", normalizedUser);
setDoctor(normalizedUser);
```

### Option 2 : Vérifier que l'utilisateur a bien un nom/prénom en BDD

```bash
# SSH vers le serveur
ssh ec2-user@100.48.20.109

# Vérifier en base
docker exec -it mysql-user mysql -uroot -proot BDDUSER_PVVIH

# Dans MySQL
SELECT id, username, nom, prenom, profil FROM users;

# Si nom/prenom sont vides, les remplir
UPDATE users 
SET nom = 'NDAO', prenom = 'Babacar'  
WHERE username = 'filoraliou ne@gmail.com';

# Quitter MySQL
EXIT;
```

## 📤 Après le fix

1. **Si vous modifiez Header.js** :
   ```bash
   # Sur votre PC
   git add a_reference_front/src/components/Header.js
   git commit -m "fix: support multiple user data formats in Header"
   git push origin main
   
   # Sur le serveur
   cd ~/deploiement_v2-crossborder
   git pull
   docker compose build --no-cache a-reference-front
   docker compose up -d a-reference-front
   ```

2. **Si vous modifiez la BDD** :
   - Déconnectez-vous du site
   - Reconnectez-vous
   - Le profil devrait maintenant afficher le bon nom

## 🚨 Commande de diagnostic rapide

Exécutez ceci dans le terminal du serveur pour voir ce qui est en base :

```bash
docker exec mysql-user mysql -uroot -proot BDDUSER_PVVIH -e "SELECT username, IFNULL(nom, 'NULL') as nom, IFNULL(prenom, 'NULL') as prenom FROM users LIMIT 5;"
```

Cela montrera si les champs sont vides (`NULL`) ou remplis.
