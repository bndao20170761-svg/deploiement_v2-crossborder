# 📤 Transfert des Fichiers vers AWS EC2

## Méthode 1: Via Git (Recommandé)

C'est la méthode la plus simple. Tous les fichiers de déploiement sont déjà dans votre repository.

### Sur votre instance EC2:

```bash
# Cloner le repository
git clone https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
cd VOTRE_REPO

# Vérifier que tous les fichiers sont présents
ls -la

# Vous devriez voir:
# - deploy-aws-simple.sh
# - .env.aws.example
# - DEMARRAGE_RAPIDE_AWS.md
# - DEPLOIEMENT_AWS_ETAPE_PAR_ETAPE.md
# - README_AWS_DEPLOIEMENT.md
# - RESUME_DEPLOIEMENT_AWS.txt
# - COMMANDES_AWS_DEPLOIEMENT.sh
# - docker-compose.yml
# - docker-compose.prod.yml
```

---

## Méthode 2: Via SCP (Si vous avez les fichiers localement)

Si vous avez les fichiers sur votre machine locale et voulez les transférer:

### Depuis votre machine locale (Windows PowerShell):

```powershell
# Transférer un fichier
scp -i "spring-key.pem" deploy-aws-simple.sh ubuntu@16.171.1.67:~/

# Transférer plusieurs fichiers
scp -i "spring-key.pem" deploy-aws-simple.sh .env.aws.example *.md ubuntu@16.171.1.67:~/

# Transférer tout le dossier
scp -i "spring-key.pem" -r . ubuntu@16.171.1.67:~/mon-projet/
```

### Depuis votre machine locale (Linux/Mac):

```bash
# Transférer un fichier
scp -i spring-key.pem deploy-aws-simple.sh ubuntu@16.171.1.67:~/

# Transférer plusieurs fichiers
scp -i spring-key.pem deploy-aws-simple.sh .env.aws.example *.md ubuntu@16.171.1.67:~/

# Transférer tout le dossier
scp -i spring-key.pem -r . ubuntu@16.171.1.67:~/mon-projet/
```

---

## Méthode 3: Copier-Coller (Pour petits fichiers)

### Pour les fichiers de configuration (.env):

1. Sur votre machine locale, ouvrez le fichier `.env.aws.example`
2. Copiez tout le contenu
3. Sur votre instance EC2:

```bash
nano .env
# Collez le contenu (clic droit dans PuTTY ou Ctrl+Shift+V dans d'autres terminaux)
# Modifiez les valeurs
# Sauvegardez: Ctrl+X → Y → Enter
```

### Pour les scripts:

1. Sur votre machine locale, ouvrez `deploy-aws-simple.sh`
2. Copiez tout le contenu
3. Sur votre instance EC2:

```bash
nano deploy-aws-simple.sh
# Collez le contenu
# Sauvegardez: Ctrl+X → Y → Enter

# Rendre exécutable
chmod +x deploy-aws-simple.sh
```

---

## Méthode 4: Via GitHub (Si vous avez déjà push)

Si vous avez déjà poussé vos modifications sur GitHub:

### Sur votre instance EC2:

```bash
# Si le repository est déjà cloné
cd VOTRE_REPO
git pull

# Si le repository n'est pas encore cloné
git clone https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
cd VOTRE_REPO
```

---

## Vérification des Fichiers

Une fois les fichiers transférés, vérifiez qu'ils sont bien présents:

```bash
# Lister tous les fichiers
ls -la

# Vérifier les fichiers de déploiement
ls -la deploy-aws-simple.sh
ls -la .env.aws.example
ls -la docker-compose.yml
ls -la docker-compose.prod.yml

# Vérifier les permissions
ls -l deploy-aws-simple.sh

# Si nécessaire, rendre exécutable
chmod +x deploy-aws-simple.sh
chmod +x COMMANDES_AWS_DEPLOIEMENT.sh
```

---

## Fichiers Essentiels pour le Déploiement

Assurez-vous d'avoir au minimum ces fichiers:

```
✓ docker-compose.yml              (Configuration Docker principale)
✓ docker-compose.prod.yml         (Configuration production)
✓ .env.aws.example                (Template de configuration)
✓ deploy-aws-simple.sh            (Script de déploiement)
✓ Tous les Dockerfiles            (Dans chaque dossier de service)
```

Fichiers de documentation (optionnels mais recommandés):

```
✓ README_AWS_DEPLOIEMENT.md
✓ DEMARRAGE_RAPIDE_AWS.md
✓ DEPLOIEMENT_AWS_ETAPE_PAR_ETAPE.md
✓ RESUME_DEPLOIEMENT_AWS.txt
✓ COMMANDES_AWS_DEPLOIEMENT.sh
```

---

## Commandes Utiles

### Vérifier la taille des fichiers

```bash
du -sh *
```

### Vérifier le contenu d'un fichier

```bash
cat deploy-aws-simple.sh
less README_AWS_DEPLOIEMENT.md
head -n 20 .env.aws.example
```

### Rechercher un fichier

```bash
find . -name "deploy-aws-simple.sh"
find . -name "*.sh"
```

---

## Problèmes Courants

### Problème: Permission denied lors du SCP

```bash
# Sur votre machine locale, vérifiez les permissions de la clé
chmod 400 spring-key.pem
```

### Problème: Fichier non exécutable

```bash
# Sur l'instance EC2
chmod +x deploy-aws-simple.sh
```

### Problème: Fichier avec mauvais format de ligne (Windows → Linux)

```bash
# Sur l'instance EC2, convertir le format
dos2unix deploy-aws-simple.sh

# Si dos2unix n'est pas installé
sudo apt install dos2unix
```

---

## Prochaines Étapes

Une fois les fichiers transférés:

1. Vérifiez que tous les fichiers sont présents
2. Créez le fichier `.env` à partir de `.env.aws.example`
3. Configurez les mots de passe et le JWT_SECRET
4. Lancez le déploiement avec `bash deploy-aws-simple.sh`

---

**Bon transfert! 📤**
