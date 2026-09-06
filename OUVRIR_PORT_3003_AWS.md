# 🔥 Ouvrir le port 3003 dans AWS Security Groups

## ⚠️ Important

Le port 3003 est maintenant exposé dans Docker, mais il faut **aussi l'ouvrir dans le pare-feu AWS** pour y accéder depuis l'extérieur.

## 📋 Étapes pour ouvrir le port 3003

### Option 1: Via la Console AWS (Interface graphique)

#### 1. Se connecter à AWS Console
- Allez sur https://console.aws.amazon.com
- Connectez-vous avec vos identifiants

#### 2. Aller dans EC2
- Dans la barre de recherche, tapez "EC2"
- Cliquez sur "EC2"

#### 3. Trouver votre instance
- Dans le menu de gauche, cliquez sur "Instances"
- Trouvez votre instance avec l'IP `100.48.20.109`
- Notez le **Security Group** (exemple: `sg-0123456789abcdef0`)

#### 4. Modifier le Security Group
- Dans le menu de gauche, cliquez sur "Security Groups"
- Trouvez le Security Group de votre instance
- Sélectionnez-le et cliquez sur "Actions" → "Edit inbound rules"

#### 5. Ajouter la règle pour le port 3003
- Cliquez sur "Add rule"
- Configurez :
  - **Type**: Custom TCP
  - **Protocol**: TCP
  - **Port range**: 3003
  - **Source**: 
    - Pour accès public : `0.0.0.0/0` (n'importe quelle IP)
    - Pour votre IP uniquement : `Votre_IP/32` (plus sécurisé)
  - **Description**: a-user-front direct access

#### 6. Sauvegarder
- Cliquez sur "Save rules"

### Option 2: Via AWS CLI (Ligne de commande)

#### Prérequis
```bash
# Installer AWS CLI si ce n'est pas déjà fait
# Sur Windows: https://aws.amazon.com/cli/
# Sur Linux: sudo apt-get install awscli
```

#### Commande pour ouvrir le port 3003

```bash
# 1. Trouver le Security Group ID de votre instance
aws ec2 describe-instances \
    --filters "Name=ip-address,Values=100.48.20.109" \
    --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' \
    --output text

# Résultat attendu: sg-XXXXXXXXXXXXXXXXX

# 2. Ouvrir le port 3003 (remplacez sg-XXXXXXXXXXXXXXXXX par votre ID)
aws ec2 authorize-security-group-ingress \
    --group-id sg-XXXXXXXXXXXXXXXXX \
    --protocol tcp \
    --port 3003 \
    --cidr 0.0.0.0/0 \
    --description "a-user-front direct access"
```

## 🧪 Tester après ouverture du port

### Sur le serveur AWS (en SSH)

```bash
# Tester en local
curl -I http://localhost:3003

# Tester avec l'IP publique
curl -I http://100.48.20.109:3003
```

### Depuis votre PC

```powershell
# PowerShell
curl.exe -I http://100.48.20.109:3003

# Ou dans un navigateur
# Ouvrez: http://100.48.20.109:3003
```

### Résultat attendu

Vous devriez voir :
```
HTTP/1.1 200 OK
Server: nginx/1.25.3
...
```

Ou bien une redirection :
```
HTTP/1.1 301 Moved Permanently
...
```

## ✅ Vérification complète

Une fois le port ouvert, testez :

### 1. Accès direct sur port 3003 (HTTP)
```
http://100.48.20.109:3003
```

### 2. Accès via nginx-https (HTTPS)
```
https://100.48.20.109/user/
```

### 3. Vérifier les deux marchent
Les deux URLs doivent afficher le frontend `a-user-front`

## 🔒 Sécurité

### Option 1 : Accès public (moins sécurisé)
```
Source: 0.0.0.0/0
```
- ✅ N'importe qui peut accéder
- ❌ Moins sécurisé
- ⚠️ Données transmises en HTTP (non chiffrées)

### Option 2 : Accès restreint à votre IP (plus sécurisé)
```
Source: VOTRE_IP/32
```
- ✅ Seulement vous pouvez accéder
- ✅ Plus sécurisé
- ⚠️ Il faut mettre à jour si votre IP change

### Option 3 : Utiliser uniquement nginx-https (recommandé)
- ✅ HTTPS avec certificat SSL
- ✅ Données chiffrées
- ✅ Un seul port à gérer (443)
- ✅ Architecture unifiée

## 📊 Résumé des ports AWS

Ports à ouvrir dans AWS Security Groups :

| Port | Service | Protocole | Source | Obligatoire |
|------|---------|-----------|--------|-------------|
| 22 | SSH | TCP | Votre IP | ✅ Oui |
| 80 | HTTP | TCP | 0.0.0.0/0 | ✅ Oui (redirection) |
| 443 | HTTPS | TCP | 0.0.0.0/0 | ✅ Oui (nginx-https) |
| 3003 | a-user-front | TCP | 0.0.0.0/0 | ⚠️ Optionnel (debug) |
| 8080 | Gateway | TCP | ❌ NE PAS ouvrir | ❌ Non (interne) |
| 8761 | Eureka | TCP | ❌ NE PAS ouvrir | ❌ Non (interne) |

## ⚠️ Attention

### Ne PAS ouvrir ces ports :
- **8080** (gateway-pvvih) - Interne uniquement
- **8761** (api-register) - Interne uniquement
- **3306, 3307, 3308, 3309** (MySQL) - Interne uniquement
- **27017** (MongoDB) - Interne uniquement

Ces services doivent être accessibles **uniquement via le réseau Docker interne**.

## 🎯 Recommandation finale

Pour la production :
1. **Utilisez HTTPS** : `https://100.48.20.109/user/`
2. **Ne pas ouvrir le port 3003** sauf pour le debugging
3. **Utilisez nginx-https** comme point d'entrée unique

Le port 3003 est utile uniquement pour :
- Le développement local
- Le debugging
- Les tests rapides

---

## 📝 Commande rapide pour vérifier

```bash
# Vérifier que le port est ouvert dans AWS
nmap -p 3003 100.48.20.109

# Ou avec telnet
telnet 100.48.20.109 3003
```

Si la connexion réussit, le port est bien ouvert ! 🎉
