# ✅ Solution : Afficher le nom de l'utilisateur au lieu de "Médecin"

## 🔍 Diagnostic

Vous voyez **"Médecin"** au lieu de **"Prénom Nom"** parce que :
- ✅ L'API fonctionne (elle retourne bien `profil: "Médecin"`)
- ❌ Les champs `prenom` et `nom` sont **NULL** dans la base de données

```javascript
// Le code Header.js vérifie dans cet ordre :
1. Si prenom ET nom existent → Affiche "Prénom Nom" 
2. Sinon si username existe → Affiche "username"
3. Sinon → Affiche "Médecin" (valeur par défaut)
```

## 🛠️ Solution Rapide

### Sur le serveur AWS (100.48.20.109)

```bash
# Connexion SSH
ssh ec2-user@100.48.20.109

# Lancer le script de correction
cd ~/deploiement_v2-crossborder
chmod +x fix-user-profile-database.sh
./fix-user-profile-database.sh
```

### OU en une seule commande :

```bash
docker exec -it mysql-user mysql -u root -ppassword123 -e "
USE db_user_pvvih;

-- Mettre à jour l'utilisateur
UPDATE users 
SET prenom = 'Filora', nom = 'Liouine'
WHERE username = 'filoraliouine@gmail.com';

-- Vérifier
SELECT username, prenom, nom, profil FROM users 
WHERE username = 'filoraliouine@gmail.com';
"
```

## 📋 Étape par étape

### 1. Vérifier l'état actuel

```bash
docker exec -it mysql-user mysql -u root -ppassword123 -e "
USE db_user_pvvih;
SELECT id, username, nom, prenom, profil FROM users 
WHERE username = 'filoraliouine@gmail.com';
"
```

**Résultat attendu :**
```
+----+--------------------------+------+--------+---------+
| id | username                 | nom  | prenom | profil  |
+----+--------------------------+------+--------+---------+
|  1 | filoraliouine@gmail.com  | NULL | NULL   | Médecin |
+----+--------------------------+------+--------+---------+
```

### 2. Mettre à jour

```bash
docker exec -it mysql-user mysql -u root -ppassword123 -e "
USE db_user_pvvih;
UPDATE users 
SET prenom = 'Filora', nom = 'Liouine'
WHERE username = 'filoraliouine@gmail.com';
"
```

### 3. Vérifier après mise à jour

```bash
docker exec -it mysql-user mysql -u root -ppassword123 -e "
USE db_user_pvvih;
SELECT id, username, nom, prenom, profil FROM users 
WHERE username = 'filoraliouine@gmail.com';
"
```

**Résultat attendu :**
```
+----+--------------------------+---------+--------+---------+
| id | username                 | nom     | prenom | profil  |
+----+--------------------------+---------+--------+---------+
|  1 | filoraliouine@gmail.com  | Liouine | Filora | Médecin |
+----+--------------------------+---------+--------+---------+
```

### 4. Tester dans le navigateur

1. Ouvrez `https://100.48.20.109`
2. Rafraîchissez avec **Ctrl+Shift+R** (force le rechargement)
3. Le profil devrait maintenant afficher :
   ```
   👤 Filora Liouine  ▼
   ```

## 🐛 Debug : Vérifier les logs API

Si ça ne fonctionne toujours pas, ouvrez la console du navigateur (F12) :

```javascript
// Vous devriez voir :
✅ Données utilisateur récupérées: {
  id: 1,
  username: "filoraliouine@gmail.com",
  nom: "Liouine",
  prenom: "Filora",
  profil: "Médecin",
  role: "ROLE_ADMIN"
}

🔄 Données normalisées: {
  prenom: "Filora",
  nom: "Liouine",
  username: "filoraliouine@gmail.com",
  profil: "Médecin"
}

📋 Affichage: Filora Liouine
```

## 🔧 Pour d'autres utilisateurs

Si vous avez plusieurs utilisateurs sans prenom/nom :

### Lister tous les utilisateurs sans prenom/nom

```bash
docker exec -it mysql-user mysql -u root -ppassword123 -e "
USE db_user_pvvih;
SELECT id, username, nom, prenom, profil 
FROM users 
WHERE prenom IS NULL OR nom IS NULL;
"
```

### Mettre à jour un utilisateur spécifique

```bash
docker exec -it mysql-user mysql -u root -ppassword123 -e "
USE db_user_pvvih;
UPDATE users 
SET prenom = 'VotrePrenom', nom = 'VotreNom'
WHERE username = 'email@exemple.com';
"
```

### Mettre à jour tous les utilisateurs avec username comme nom

```bash
docker exec -it mysql-user mysql -u root -ppassword123 -e "
USE db_user_pvvih;
UPDATE users 
SET prenom = SUBSTRING_INDEX(username, '@', 1),
    nom = 'Utilisateur'
WHERE prenom IS NULL OR nom IS NULL;
"
```

## 📊 Vérification complète

### Vérifier tous les utilisateurs

```bash
docker exec -it mysql-user mysql -u root -ppassword123 -e "
USE db_user_pvvih;
SELECT 
  id,
  username,
  CONCAT(COALESCE(prenom, ''), ' ', COALESCE(nom, '')) AS nom_complet,
  profil,
  role
FROM users 
ORDER BY id;
"
```

## 🎯 Résultat Final

Avant :
```
👤 Médecin  ▼
```

Après :
```
👤 Filora Liouine  ▼
```

## ❓ Questions fréquentes

### Q: Pourquoi prenom et nom étaient NULL ?
**R:** Lors de l'inscription, seuls `username`, `password`, `profil`, et `role` sont obligatoires. Les champs `prenom` et `nom` sont optionnels.

### Q: Est-ce que je dois rebuilder le frontend ?
**R:** Non ! C'est une simple mise à jour de la base de données. Le frontend récupère déjà les bonnes données via l'API.

### Q: Comment forcer l'enregistrement du nom lors de l'inscription ?
**R:** Vous devez modifier le formulaire d'inscription pour rendre les champs `prenom` et `nom` obligatoires :

```java
// Dans gestion_user/src/main/java/.../dto/RegisterRequest.java
@NotBlank(message = "Le prénom est obligatoire")
private String prenom;

@NotBlank(message = "Le nom est obligatoire")
private String nom;
```

### Q: Comment voir ce que l'API retourne ?
**R:** Testez avec curl :

```bash
# D'abord se connecter
TOKEN=$(curl -s -X POST http://100.48.20.109:8080/api/user-auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"filoraliouine@gmail.com","password":"votre_password"}' \
  | jq -r '.token')

# Ensuite récupérer les infos utilisateur
curl -X GET http://100.48.20.109:8080/api/user/me \
  -H "Authorization: Bearer $TOKEN" | jq
```

## 📝 Commandes de vérification rapide

```bash
# Commande tout-en-un : vérifier + mettre à jour + re-vérifier
docker exec -it mysql-user mysql -u root -ppassword123 << EOF
USE db_user_pvvih;
SELECT '=== AVANT ===' AS '';
SELECT username, prenom, nom, profil FROM users WHERE username = 'filoraliouine@gmail.com';

UPDATE users SET prenom = 'Filora', nom = 'Liouine' WHERE username = 'filoraliouine@gmail.com';

SELECT '=== APRÈS ===' AS '';
SELECT username, prenom, nom, profil FROM users WHERE username = 'filoraliouine@gmail.com';
EOF
```

Après cette commande, rafraîchissez votre navigateur et le profil devrait afficher le nom complet !
