# Corrections des ports Frontend (8081 → 8080)

## Problèmes identifiés

Plusieurs fichiers dans les frontends utilisaient le port `8081` au lieu de `8080` pour le Gateway, ce qui causait des erreurs de connexion.

## Fichiers corrigés

### a_user_front
- ✅ `src/assets/components/Login.js` - Login endpoint
- ✅ `src/assets/components/Header.js` - /me endpoint
- ✅ `src/assets/components/HospitalForm.js` - Gateway URL
- ✅ `src/config/microservices.js` - Configuration Gateway et User API
- ⚠️ `src/assets/components/CartographyMap.js` - 3 occurrences (à corriger manuellement)

### a_reference_front
- ✅ `src/services/httpClient.js` - BASE_URL
- ✅ `src/services/apiService.js` - BASE_URL
- ✅ `src/components/referenceService.js` - API_URL
- ⚠️ `src/components/DossierViewEnhanced.js` - (à corriger manuellement)
- ⚠️ `src/components/ReferenceWizard.js` - 2 occurrences (à corriger manuellement)
- ⚠️ `src/components/PatientView.js` - (à corriger manuellement)
- ⚠️ `src/components/HopitalMap.js` - 2 occurrences (à corriger manuellement)
- ⚠️ `src/components/HopitalList.js` - (à corriger manuellement)
- ⚠️ `src/components/FormulaireMultiEtapes.js` - (à corriger manuellement)
- ⚠️ `src/components/Header.js` - (à corriger manuellement)
- ⚠️ `src/components/FormulaireCompletFusionne.js` - (à corriger manuellement)
- ⚠️ `src/components/DossierView.js` - (à corriger manuellement)
- ⚠️ `src/components/AdvancedSearch.js` - 2 occurrences (à corriger manuellement)

## Fichiers restants à corriger

Utilisez la commande suivante pour corriger tous les fichiers restants :

```powershell
# Rechercher et remplacer dans tous les fichiers JS/JSX
Get-ChildItem -Path "a_reference_front","a_user_front" -Recurse -Include *.js,*.jsx | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $newContent = $content -replace 'localhost:8081', 'localhost:8080'
    if ($content -ne $newContent) {
        Set-Content $_.FullName -Value $newContent -NoNewline
        Write-Host "Corrigé: $($_.FullName)"
    }
}
```

## Commandes de redéploiement

Une fois tous les fichiers corrigés :

```bash
# 1. Arrêter les frontends
docker-compose stop a-reference-front a-user-front

# 2. Reconstruire sans cache
docker-compose build a-reference-front a-user-front --no-cache

# 3. Redémarrer
docker-compose up -d a-reference-front a-user-front

# 4. Vérifier les logs
docker-compose logs -f a-reference-front a-user-front
```

## Vérification

Après le redéploiement, testez :

1. **Login** : `POST http://localhost:8080/api/user-auth/login`
2. **Register** : `POST http://localhost:8080/api/user-auth/register`
3. **Me** : `GET http://localhost:8080/api/user-auth/me` (avec token)

## Notes importantes

- Le Gateway écoute sur le port **8080** (pas 8081)
- Tous les frontends doivent pointer vers `http://localhost:8080`
- Les fichiers `.env` sont déjà corrects
- Le problème était dans le code hardcodé avec des fallbacks `|| 'http://localhost:8081'`
