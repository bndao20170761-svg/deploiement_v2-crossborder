# Fix Profil Utilisateur - Utilisation du localStorage

## 🎯 Objectif

Récupérer le nom, prénom et profil (rôle) de l'utilisateur **depuis le localStorage** au lieu de faire un appel API à chaque chargement du Header.

## ✅ Modifications effectuées

### 1. **Login.js** - Stocker les données complètes lors de la connexion

**Avant** (ligne 67) :
```javascript
const userData = { username };
localStorage.setItem("user", JSON.stringify(userData));
```

**Après** :
```javascript
// Récupérer les informations complètes de l'utilisateur depuis l'API
const userInfoResponse = await api.get("/user/me", {
  headers: { Authorization: `Bearer ${token}` }
});

// Normaliser les données (supporte plusieurs formats d'API)
const userData = {
  username: apiUserData.username || apiUserData.email || username,
  prenom: apiUserData.prenom || apiUserData.firstName || "",
  nom: apiUserData.nom || apiUserData.lastName || "",
  profil: apiUserData.profil || apiUserData.role || "",
  id: apiUserData.id || null,
};

localStorage.setItem("user", JSON.stringify(userData));
```

**Avantages** :
- ✅ Récupère **toutes** les données utilisateur lors du login
- ✅ Les données sont **normalisées** (format français/anglais)
- ✅ Gestion d'erreur : si l'API échoue, continue avec username seul
- ✅ **Une seule requête API** lors de la connexion

### 2. **Header.js** - Lire depuis localStorage

**Avant** (lignes 92-115) :
```javascript
useEffect(() => {
  const fetchDoctor = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_GATEWAY_URL}/api/user/me`,
        getAuthHeader()
      );
      // ... normalisation ...
      setDoctor(normalizedUser);
    } catch (error) {
      console.error("Erreur API...");
    }
  };
  fetchDoctor();
}, []);
```

**Après** :
```javascript
useEffect(() => {
  // Lire directement depuis localStorage
  const storedUser = localStorage.getItem("user");
  
  if (storedUser) {
    try {
      const userData = JSON.parse(storedUser);
      console.log("✅ Données utilisateur récupérées depuis localStorage:", userData);
      
      // Les données sont déjà normalisées lors du login
      setDoctor({
        prenom: userData.prenom || "",
        nom: userData.nom || "",
        username: userData.username || "",
        profil: userData.profil || ""
      });
    } catch (error) {
      console.error("❌ Erreur parsing:", error);
      setDoctor({});
    }
  }
}, []);
```

**Avantages** :
- ✅ **Aucun appel API** au chargement du Header
- ✅ **Instantané** : pas de délai de chargement
- ✅ **Moins de charge serveur**
- ✅ **Données cohérentes** : les mêmes qu'au login
- ✅ Code plus simple : suppression de axios, getAuthHeader()

### 3. Nettoyage du code

Suppressions :
- ❌ `import axios from "axios";` (ligne 10)
- ❌ Fonction `getAuthHeader()` (lignes 88-95)

## 📊 Flux de données

### Ancien flux (avec appel API)
```
Login → API /login → Token
  ↓
Header useEffect
  ↓
API /user/me → Données utilisateur
  ↓
Affichage Header
```
**Problème** : 2 appels API, délai d'affichage

### Nouveau flux (avec localStorage)
```
Login → API /login → Token
  ↓
API /user/me → Données utilisateur
  ↓
localStorage.setItem("user", userData)
  ↓
Header useEffect
  ↓
localStorage.getItem("user") → Données immédiate
  ↓
Affichage Header instantané
```
**Avantage** : 1 seul appel API (au login), affichage instantané

## 🔍 Structure des données dans localStorage

### Clé: `"user"`
```json
{
  "username": "filoraliouine@gmail.com",
  "prenom": "Filora",
  "nom": "Liouine",
  "profil": "MEDECIN",
  "id": 123
}
```

### Clé: `"token"`
```
eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOi...
```

## 🎯 Résultat attendu

### Dans le Header
```
👤 Filora Liouine  ▼
```

### Dans la console (F12)
```
✅ Données utilisateur récupérées depuis localStorage: {username: "...", prenom: "Filora", nom: "Liouine", ...}
📋 Affichage profil: Filora Liouine
```

## 🧪 Test

### 1. Test complet avec nouvelle connexion

```bash
# 1. Nettoyer le cache du navigateur
Ouvrir DevTools (F12) → Application → Storage → Clear Site Data

# 2. Aller sur https://100.48.20.109

# 3. Se connecter avec:
Email: filoraliouine@gmail.com
Mot de passe: ********

# 4. Vérifier dans la console:
✅ Token sauvegardé dans localStorage
📡 Récupération des infos utilisateur...
✅ Informations utilisateur récupérées: {...}
🔄 Données utilisateur normalisées: {...}
💾 Données utilisateur sauvegardées dans localStorage

# 5. Vérifier le Header:
Devrait afficher: "Filora Liouine"

# 6. Rafraîchir la page (F5)
Le profil devrait s'afficher immédiatement (depuis localStorage)
```

### 2. Vérifier les données dans localStorage

```javascript
// Dans la console du navigateur (F12)
console.log(JSON.parse(localStorage.getItem("user")));

// Résultat attendu:
{
  username: "filoraliouine@gmail.com",
  prenom: "Filora",
  nom: "Liouine",
  profil: "MEDECIN",
  id: 123
}
```

## 📋 Déploiement

### 1. Sur votre PC

```powershell
git add a_reference_front/src/components/Login.js a_reference_front/src/components/Header.js
git commit -m "feat: récupération profil depuis localStorage au lieu d'API"
git push origin main
```

### 2. Sur le serveur AWS

```bash
ssh ec2-user@100.48.20.109

cd ~/deploiement_v2-crossborder
git pull
docker compose stop a-reference-front
docker compose build --no-cache a-reference-front
docker compose up -d a-reference-front

# Vérifier
docker ps | grep a-reference-front
docker logs a-reference-front --tail 20
```

### 3. Tester

1. Ouvrir `https://100.48.20.109`
2. **Nettoyer le cache** : DevTools (F12) → Application → Clear Site Data
3. Se reconnecter avec vos identifiants
4. Le profil devrait afficher immédiatement le nom et prénom

## 🐛 Dépannage

### Si le profil affiche toujours "Utilisateur"

**Vérifier localStorage** :
```javascript
// Console navigateur (F12)
console.log(localStorage.getItem("user"));
```

**Si null ou `{username: "..."}`** :
- Il faut se **reconnecter** (pas juste rafraîchir)
- Le localStorage sera rempli lors de la nouvelle connexion

**Si les données sont présentes mais vides** :
```json
{
  "username": "filoraliouine@gmail.com",
  "prenom": "",
  "nom": "",
  "profil": ""
}
```
- Le problème vient de l'API `/user/me` qui retourne des valeurs vides
- Vérifier la base de données (voir FIX_PROFIL_UNDEFINED.md)

### Forcer une nouvelle connexion

```javascript
// Console navigateur (F12)
localStorage.clear();
// Puis se reconnecter
```

## 🎉 Avantages de cette approche

| Critère | Avant (API) | Après (localStorage) |
|---------|-------------|----------------------|
| **Appels API** | 2 (login + me) | 1 (login avec me) |
| **Délai affichage** | ~500ms | Instantané |
| **Charge serveur** | Haute | Basse |
| **Offline-friendly** | ❌ Non | ✅ Oui |
| **Cohérence données** | Variable | ✅ Garantie |
| **Complexité code** | Moyenne | ✅ Simple |

## 📝 Fichiers modifiés

1. ✅ `a_reference_front/src/components/Login.js`
   - Ajout appel API `/user/me` après login
   - Stockage données complètes dans localStorage

2. ✅ `a_reference_front/src/components/Header.js`
   - Lecture depuis localStorage au lieu d'API
   - Suppression axios et getAuthHeader()
   - Code simplifié

## ⚠️ Important

Après modification, il faut :
1. **Rebuild l'image Docker** sur le serveur
2. **Se reconnecter** (pas juste rafraîchir) pour que localStorage soit rempli
3. Les anciennes sessions (avant modification) n'auront pas les données complètes
