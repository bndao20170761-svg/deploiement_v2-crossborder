# Guide des Commandes Logs Docker

## 🎯 Commandes Rapides pour gestion-reference

### Logs en Temps Réel (Recommandé)
```cmd
docker-compose logs -f gestion-reference
```

### Dernières 100 Lignes
```cmd
docker-compose logs --tail=100 gestion-reference
```

### Dernières 50 Lignes avec Horodatage
```cmd
docker-compose logs -t --tail=50 gestion-reference
```

## 📋 Toutes les Commandes Disponibles

### 1. Logs en Temps Réel (Suivi Continu)

```cmd
# Avec docker-compose
docker-compose logs -f gestion-reference

# Avec docker directement
docker logs -f vesion_2_enda_crossborder-gestion-reference-1
```

**Appuyez sur `Ctrl+C` pour arrêter**

### 2. Afficher un Nombre Spécifique de Lignes

```cmd
# 50 dernières lignes
docker-compose logs --tail=50 gestion-reference

# 100 dernières lignes
docker-compose logs --tail=100 gestion-reference

# 500 dernières lignes
docker-compose logs --tail=500 gestion-reference

# Toutes les lignes
docker-compose logs gestion-reference
```

### 3. Logs avec Horodatage

```cmd
# Ajouter l'heure à chaque ligne
docker-compose logs -t gestion-reference

# Avec suivi en temps réel
docker-compose logs -f -t gestion-reference
```

### 4. Logs Depuis un Moment Précis

```cmd
# Depuis les 5 dernières minutes
docker-compose logs --since 5m gestion-reference

# Depuis 1 heure
docker-compose logs --since 1h gestion-reference

# Depuis 30 minutes
docker-compose logs --since 30m gestion-reference

# Depuis une date précise (format ISO 8601)
docker-compose logs --since 2024-02-26T12:00:00 gestion-reference
```

### 5. Logs Jusqu'à un Moment Précis

```cmd
# Jusqu'à il y a 10 minutes
docker-compose logs --until 10m gestion-reference

# Jusqu'à une date précise
docker-compose logs --until 2024-02-26T13:00:00 gestion-reference
```

### 6. Combiner Plusieurs Options

```cmd
# 100 dernières lignes avec horodatage en temps réel
docker-compose logs -f -t --tail=100 gestion-reference

# Logs des 30 dernières minutes avec horodatage
docker-compose logs -t --since 30m gestion-reference
```

## 🔍 Rechercher dans les Logs

### Filtrer les Logs (Windows CMD)

```cmd
# Rechercher "ERROR"
docker-compose logs gestion-reference | findstr ERROR

# Rechercher "Exception"
docker-compose logs gestion-reference | findstr Exception

# Rechercher plusieurs termes
docker-compose logs gestion-reference | findstr "ERROR Exception WARN"
```

### Filtrer les Logs (PowerShell)

```powershell
# Rechercher "ERROR"
docker-compose logs gestion-reference | Select-String "ERROR"

# Rechercher "Exception"
docker-compose logs gestion-reference | Select-String "Exception"

# Rechercher plusieurs termes
docker-compose logs gestion-reference | Select-String "ERROR|Exception|WARN"
```

## 💾 Sauvegarder les Logs dans un Fichier

### Windows CMD

```cmd
# Sauvegarder tous les logs
docker-compose logs gestion-reference > logs-gestion-reference.txt

# Sauvegarder les 500 dernières lignes
docker-compose logs --tail=500 gestion-reference > logs-gestion-reference.txt

# Ajouter à un fichier existant
docker-compose logs gestion-reference >> logs-gestion-reference.txt
```

### PowerShell

```powershell
# Sauvegarder tous les logs
docker-compose logs gestion-reference | Out-File -FilePath logs-gestion-reference.txt

# Sauvegarder avec encodage UTF-8
docker-compose logs gestion-reference | Out-File -FilePath logs-gestion-reference.txt -Encoding UTF8

# Ajouter à un fichier existant
docker-compose logs gestion-reference | Out-File -FilePath logs-gestion-reference.txt -Append
```

## 📊 Logs de Plusieurs Services

### Afficher Plusieurs Services

```cmd
# Deux services
docker-compose logs -f gestion-reference gestion-user

# Trois services
docker-compose logs -f gestion-reference gestion-user gateway-pvvih

# Tous les services
docker-compose logs -f
```

### Tous les Services Backend

```cmd
docker-compose logs -f api-configuration api-register gateway-pvvih gestion-reference gestion-patient gestion-user forum-pvvih
```

### Tous les Services Frontend

```cmd
docker-compose logs -f a-reference-front a-user-front gestion-forum-front
```

## 🛠️ Utiliser le Script PowerShell

### Utilisation Interactive (Menu)

```powershell
.\voir-logs.ps1
```

### Utilisation Directe

```powershell
# Afficher les logs de gestion-reference
.\voir-logs.ps1 -Service gestion-reference

# Suivre en temps réel
.\voir-logs.ps1 -Service gestion-reference -Suivre

# Afficher 200 lignes
.\voir-logs.ps1 -Service gestion-reference -Lignes 200

# Suivre avec 50 lignes
.\voir-logs.ps1 -Service gestion-reference -Lignes 50 -Suivre
```

## 🔧 Commandes Utiles Supplémentaires

### Vérifier si le Conteneur Tourne

```cmd
# Voir tous les conteneurs en cours
docker ps

# Voir tous les conteneurs (même arrêtés)
docker ps -a

# Filtrer pour gestion-reference
docker ps | findstr gestion-reference
```

### Informations sur le Conteneur

```cmd
# Inspecter le conteneur
docker inspect vesion_2_enda_crossborder-gestion-reference-1

# Voir les statistiques en temps réel
docker stats vesion_2_enda_crossborder-gestion-reference-1
```

### Redémarrer le Service

```cmd
# Redémarrer gestion-reference
docker-compose restart gestion-reference

# Voir les logs après redémarrage
docker-compose logs -f gestion-reference
```

## 📝 Exemples Pratiques

### Déboguer une Erreur de Démarrage

```cmd
# 1. Voir les derniers logs
docker-compose logs --tail=100 gestion-reference

# 2. Rechercher les erreurs
docker-compose logs gestion-reference | findstr "ERROR"

# 3. Suivre en temps réel
docker-compose logs -f gestion-reference
```

### Analyser les Performances

```cmd
# 1. Voir les logs avec horodatage
docker-compose logs -t --tail=200 gestion-reference

# 2. Sauvegarder pour analyse
docker-compose logs -t gestion-reference > analyse-logs.txt

# 3. Rechercher les requêtes lentes
type analyse-logs.txt | findstr "slow"
```

### Surveiller en Production

```cmd
# Suivre tous les services avec horodatage
docker-compose logs -f -t

# Ou seulement les services backend
docker-compose logs -f -t api-configuration api-register gateway-pvvih gestion-reference gestion-patient gestion-user forum-pvvih
```

## 🎨 Améliorer la Lisibilité

### Avec Couleurs (PowerShell)

```powershell
# Afficher les erreurs en rouge
docker-compose logs gestion-reference | ForEach-Object {
    if ($_ -match "ERROR") {
        Write-Host $_ -ForegroundColor Red
    } elseif ($_ -match "WARN") {
        Write-Host $_ -ForegroundColor Yellow
    } else {
        Write-Host $_
    }
}
```

## 🚨 Résolution de Problèmes

### Le Service ne Démarre Pas

```cmd
# 1. Voir tous les logs (même si arrêté)
docker-compose logs gestion-reference

# 2. Vérifier l'état
docker-compose ps gestion-reference

# 3. Redémarrer
docker-compose restart gestion-reference

# 4. Suivre les logs
docker-compose logs -f gestion-reference
```

### Logs Vides ou Manquants

```cmd
# Vérifier que le conteneur existe
docker ps -a | findstr gestion-reference

# Vérifier avec docker directement
docker logs vesion_2_enda_crossborder-gestion-reference-1

# Reconstruire si nécessaire
docker-compose up -d --force-recreate gestion-reference
```

## 📚 Référence Rapide

| Commande | Description |
|----------|-------------|
| `docker-compose logs -f gestion-reference` | Suivi en temps réel |
| `docker-compose logs --tail=100 gestion-reference` | 100 dernières lignes |
| `docker-compose logs -t gestion-reference` | Avec horodatage |
| `docker-compose logs --since 30m gestion-reference` | Depuis 30 minutes |
| `docker-compose logs gestion-reference \| findstr ERROR` | Filtrer les erreurs |
| `docker-compose logs gestion-reference > logs.txt` | Sauvegarder |
| `.\voir-logs.ps1` | Menu interactif |
| `docker ps \| findstr gestion-reference` | Vérifier l'état |

## 💡 Astuces

1. **Utilisez `-f` pour le suivi en temps réel** lors du débogage
2. **Utilisez `--tail=100`** pour limiter l'affichage initial
3. **Ajoutez `-t`** pour voir les horodatages
4. **Sauvegardez les logs** avant de redémarrer un service
5. **Utilisez `findstr` ou `Select-String`** pour filtrer
6. **Le script `voir-logs.ps1`** offre un menu pratique
