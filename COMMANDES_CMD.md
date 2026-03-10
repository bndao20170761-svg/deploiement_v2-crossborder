# Commandes Docker pour CMD (Command Prompt)

## 🚨 Important : Vous Utilisez CMD, Pas PowerShell

Les commandes PowerShell (avec `-`, `Start-Process`, etc.) ne fonctionnent **PAS** dans CMD.

Utilisez les commandes ci-dessous qui sont spécifiques à CMD.

## 🔄 Redémarrer Docker Desktop

### Méthode 1 : Commandes CMD
```cmd
taskkill /F /IM "Docker Desktop.exe"
timeout /t 10
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

### Méthode 2 : Script BAT (Recommandé)
```cmd
redemarrer-docker.bat
```

### Méthode 3 : Manuelle (Plus Simple)
1. Clic droit sur l'i