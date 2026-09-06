# 🔧 Rebuild et Redéploiement du Gateway avec HTTPS

## ✅ Modification effectuée

Le fichier `Getway_PVVIH/src/main/java/sn/uasz/Getway_PVVIH/config/SecurityConfig.java` a été modifié pour inclure :

```java
// Production HTTPS AWS (IP: 100.48.20.109) - via nginx-https
"https://100.48.20.109"
```

## 📋 Étapes de déploiement

### 1. Pousser les changements sur GitHub

```powershell
# Sur votre PC (PowerShell)
cd "C:\Users\babac\Desktop\Babacar Ndao\Master2 GL\deploiement\vesion_2_enda_crossborder"

git add Getway_PVVIH/src/main/java/sn/uasz/Getway_PVVIH/config/SecurityConfig.java
git commit -m "feat: ajout HTTPS dans CORS SecurityConfig du Gateway"
git push origin main
```

### 2. Sur le serveur AWS - Rebuild le Gateway

```bash
# SSH vers le serveur
ssh ec2-user@100.48.20.109

# Aller dans le dossier du projet
cd ~/deploiement_v2-crossborder

# Pull les derniers changements
git pull

# Arrêter le gateway
docker compose stop gateway-pvvih

# Rebuild le gateway (avec --no-cache pour forcer)
docker compose build --no-cache gateway-pvvih

# Redémarrer tous les services
docker compose up -d

# Attendre 30 secondes
sleep 30

# Vérifier que le gateway démarre
docker logs gateway-pvvih --tail 50
```

### 3. Vérification

```bash
# Vérifier que le conteneur est en bonne santé
docker ps | grep gateway-pvvih

# Chercher HTTPS dans les logs
docker logs gateway-pvvih | grep -i "https://100.48.20.109"

# Tester l'API
curl -k https://100.48.20.109/api/user-auth/login
```

## 🧪 Test dans le navigateur

1. Ouvrez `https://100.48.20.109/login`
2. **F12** → Console
3. **F12** → Network (filtrez "XHR")
4. Essayez de vous connecter
5. **Vérifiez qu'il n'y a PAS d'erreur CORS**

### Erreurs attendues SI tout est OK

✅ **Pas d'erreur CORS** dans la console
✅ La requête vers `https://100.48.20.109/api/user-auth/login` passe
✅ Le serveur répond (même si credentials invalides)

### Erreurs SI problème CORS

❌ `Access to XMLHttpRequest has been blocked by CORS policy`
❌ `No 'Access-Control-Allow-Origin' header is present`

## 📊 Comparaison AVANT / APRÈS

### AVANT (SecurityConfig.java)
```java
// Production GCP
"http://100.48.20.109:3000",
"http://100.48.20.109:3001",
// ... 
// ❌ Pas de HTTPS
```

### APRÈS (SecurityConfig.java)
```java
// Production HTTP AWS
"http://100.48.20.109:3000",
"http://100.48.20.109:3001",
// ...
// Production HTTPS AWS - via nginx-https
"https://100.48.20.109"  // ✅ AJOUTÉ
```

## 🎯 Prochaines étapes

Une fois le Gateway redéployé avec HTTPS dans CORS :

1. ✅ **Gateway CORS OK** (fait)
2. ⏳ **Rebuild les frontends** avec URLs HTTPS (à faire)
3. ⏳ **Tester la connexion** (à faire)
4. ⏳ **Tester le GPS** (objectif final)

## 📞 Commandes de dépannage

### Le Gateway ne démarre pas

```bash
# Vérifier les erreurs
docker logs gateway-pvvih --tail 100

# Vérifier Eureka
docker logs api-register --tail 50

# Redémarrer Eureka puis Gateway
docker compose restart api-register
sleep 10
docker compose restart gateway-pvvih
```

### Le build échoue

```bash
# Vérifier que Java compile
cd ~/deploiement_v2-crossborder/Getway_PVVIH
mvn clean compile

# Si erreur de syntaxe, vérifier le fichier
cat src/main/java/sn/uasz/Getway_PVVIH/config/SecurityConfig.java
```

### CORS ne fonctionne toujours pas

```bash
# Vérifier que le code est bien dans l'image
docker exec gateway-pvvih cat /app/classes/sn/uasz/Getway_PVVIH/config/SecurityConfig.class

# Force rebuild complet
docker compose down
docker compose build --no-cache gateway-pvvih
docker compose up -d
```

## 💡 Note importante

**Ce changement dans `SecurityConfig.java` est dans le code source du Gateway lui-même.**

C'est **différent** de la configuration externe sur GitHub (`GETWAY_PVVIH-dev.yml`) :
- `SecurityConfig.java` : Configuration **hardcodée** dans le code Java
- `GETWAY_PVVIH-dev.yml` : Configuration **externe** chargée par Spring Cloud Config

**Les deux doivent avoir HTTPS !** Idéalement, on utilise la config externe, mais avoir les deux assure que CORS fonctionne même si la config externe ne charge pas.
