# Guide: Augmenter l'espace disque sur GCP

## Problème
Votre VM a seulement ~10GB d'espace, ce qui est insuffisant pour Docker.

## Solution: Augmenter le disque à 30GB minimum

### Étape 1: Dans GCP Console

1. **Aller sur GCP Console** → Compute Engine → VM instances
2. **Arrêter votre instance** `instance-20260310-134136`
   - Cliquer sur les 3 points → Stop
   - Attendre que le statut soit "Stopped"

3. **Modifier le disque**
   - Aller dans "Disks" (Disques) dans le menu de gauche
   - Trouver le disque attaché à votre instance
   - Cliquer sur le nom du disque
   - Cliquer sur "EDIT" (MODIFIER) en haut
   - Changer "Size" de 10 GB à **30 GB** (ou plus)
   - Cliquer sur "SAVE"

4. **Redémarrer l'instance**
   - Retourner à VM instances
   - Cliquer sur les 3 points → Start
   - Attendre que l'instance démarre

### Étape 2: Sur la VM (après redémarrage)

```bash
# Se connecter à la VM
gcloud compute ssh instance-20260310-134136

# Vérifier le disque (devrait montrer 30GB)
lsblk

# Installer cloud-guest-utils si nécessaire
sudo apt-get update
sudo apt-get install -y cloud-guest-utils

# Redimensionner la partition
sudo growpart /dev/sda 1

# Redimensionner le système de fichiers
sudo resize2fs /dev/sda1

# Vérifier l'espace disponible
df -h /
```

### Étape 3: Nettoyer Docker

```bash
cd ~/deploiement_v2-crossborder

# Nettoyer Docker
chmod +x URGENCE_ESPACE_DISQUE.sh
./URGENCE_ESPACE_DISQUE.sh

# Vérifier l'espace
df -h /
```

### Étape 4: Rebuild

```bash
# Rebuild le service qui a échoué
docker-compose build gestion-user

# Ou rebuild tout
docker-compose build
```

## Alternative: Si vous ne pouvez pas augmenter le disque

Utilisez Docker Hub pour éviter de builder sur la VM:

```bash
# Sur votre machine locale Windows (PowerShell):
docker-compose build
docker-compose push  # Nécessite configuration Docker Hub

# Sur la VM:
docker-compose pull
docker-compose up -d
```

## Vérification finale

```bash
# Espace total
df -h /

# Espace Docker
docker system df

# Si tout est OK, démarrer les services
docker-compose up -d
```
