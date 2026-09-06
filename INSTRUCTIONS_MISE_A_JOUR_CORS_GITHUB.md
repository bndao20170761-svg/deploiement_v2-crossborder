# 🚨 CORRECTION URGENTE - CORS Gateway bloque HTTPS

## ❌ Problème détecté dans les logs

```
Reject: 'https://100.48.20.109' origin is not allowed
```

Le Gateway rejette les requêtes HTTPS parce que `https://100.48.20.109` n'est PAS dans la liste `allowedOrigins` sur GitHub.

## ✅ Solution : Mettre à jour GETWAY_PVVIH-dev.yml sur GitHub

### Étape 1 : Allez sur GitHub

1. Ouvrez : https://github.com/BabacarNdaoKgl/cloud-config-repo-enda.git
2. Cherchez le fichier : `GETWAY_PVVIH-dev.yml`
3. Cliquez sur le crayon ✏️ pour éditer

### Étape 2 : Trouvez la section allowedOrigins

Cherchez cette section dans le fichier :

```yaml
spring:
  cloud:
    gateway:
      globalcors:
        corsConfigurations:
          '[/**]':
            allowedOrigins:
              - "http://localhost:3000"
              - "http://localhost:3001"
              # ... autres URLs
```

### Étape 3 : Ajoutez https://100.48.20.109

**AJOUTEZ** cette ligne dans la liste `allowedOrigins` :

```yaml
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
  # Production HTTPS AWS
  - "https://100.48.20.109"    # ⬅️ AJOUTER CETTE LIGNE
```

### Étape 4 : Sauvegardez sur GitHub

1. Scrollez en bas
2. Écrivez un message de commit : `fix: ajout https://100.48.20.109 dans CORS`
3. Cliquez "Commit changes"

### Étape 5 : Redémarrez le Gateway sur le serveur

Une fois le fichier mis à jour sur GitHub, connectez-vous au serveur AWS :

```bash
# Redémarrer le gateway pour recharger la config
docker compose restart gateway-pvvih

# Attendre 30 secondes que le gateway se reconnecte à Eureka et recharge la config
sleep 30

# Vérifier les logs
docker logs gateway-pvvih --tail 50
```

### Étape 6 : Testez la connexion

1. Ouvrez `https://100.48.20.109/login`
2. Essayez de vous connecter
3. **Ça devrait maintenant fonctionner !**

## 📝 Configuration complète recommandée

Si vous préférez remplacer TOUT le contenu du fichier, utilisez celui que j'ai créé :

Le fichier **GETWAY_PVVIH-dev-FINAL-HTTPS.yml** dans votre projet local contient la configuration complète.

Vous pouvez :
1. Ouvrir ce fichier localement
2. Copier TOUT son contenu
3. Le coller dans le fichier `GETWAY_PVVIH-dev.yml` sur GitHub
4. Commit
5. Redémarrer le gateway

## 🔍 Comment vérifier que ça marche

Après avoir redémarré le gateway, dans les logs vous devriez voir :

✅ Au lieu de : `Reject: 'https://100.48.20.109' origin is not allowed`
✅ Vous verrez : Des requêtes qui passent sans erreur CORS

Dans le navigateur (F12 → Console) :
✅ Plus d'erreur "CORS policy"
✅ Connexion réussie avec code 200

## ⚠️ IMPORTANT

Le Gateway charge sa configuration depuis GitHub au **démarrage**.

Donc après avoir modifié le fichier sur GitHub, vous **DEVEZ** redémarrer le conteneur :
```bash
docker compose restart gateway-pvvih
```

Sans redémarrage, la modification ne sera PAS prise en compte !

## 📞 Si ça ne marche toujours pas

1. Vérifiez que le fichier sur GitHub est bien sauvegardé
2. Vérifiez les logs du gateway après redémarrage :
   ```bash
   docker logs gateway-pvvih | grep -i cors
   docker logs gateway-pvvih | grep -i "100.48.20.109"
   ```
3. Vérifiez que le gateway arrive à se connecter au serveur de config :
   ```bash
   docker logs gateway-pvvih | grep -i "config"
   ```
