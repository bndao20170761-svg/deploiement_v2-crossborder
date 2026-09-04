# Correction du Dialog "marqueur rouge"

## Problème identifié
L'utilisateur voyait toujours le message obsolète mentionnant "marqueur rouge" même après avoir fait `git pull` et rebuild. Ce message venait d'un **Dialog component hardcodé** dans CartographyMap.js qui remplaçait les traductions correctes.

## Cause racine
Dans `a_reference_front/src/components/CartographyMap.js` :
- **Ligne 128** : État `showHttpGeoDialog` 
- **Ligne 265** : Le Dialog s'ouvrait automatiquement après l'alert()
- **Lignes 1965-1994** : Dialog avec texte hardcodé obsolète :
  - "Un marqueur rouge apparaîtra à l'endroit cliqué"
  - "un marqueur rouge s'affichera à votre position"
  - Bouton "Aller à Ziguinchor" qui repositionnait la carte

Ce Dialog **remplaçait** les traductions correctes du fichier `translations.js`.

## Solution appliquée
**Supprimé complètement le Dialog obsolète** :
1. ✅ Supprimé l'état `showHttpGeoDialog` (ligne 128)
2. ✅ Supprimé l'appel `setShowHttpGeoDialog(true)` (ligne 265)
3. ✅ Supprimé tout le Dialog component (lignes 1965-1994)

## Résultat attendu
Maintenant, quand l'utilisateur clique sur "Géolocaliser" en HTTP :
1. Un seul message apparaît : **alert()** avec le texte de `translations.js`
2. Le texte correct mentionne **"marqueur bleu"** (pas rouge)
3. Pas de Dialog qui s'ouvre après

## Message correct affiché (depuis translations.js)
```
🔒 GPS automatique indisponible en HTTP.

Pour définir votre position :
Cliquez directement sur la carte à votre emplacement.

Un marqueur bleu apparaîtra là où vous cliquez.
```

## Comportement fonctionnel
1. Utilisateur clique sur bouton "Géolocaliser"
2. En HTTP : alert() s'affiche avec message clair
3. Utilisateur clique OK
4. Utilisateur clique sur carte → **marqueur bleu** apparaît
5. Utilisateur peut enregistrer structure avec cette position

## Actions requises pour déploiement
```bash
# Dans a_reference_front/
git add src/components/CartographyMap.js
git commit -m "fix: suppression Dialog obsolète marqueur rouge"
git push origin main

# Sur le serveur 100.48.20.109
git pull origin main
npm run build
# Redémarrer le serveur ou copier build/
```

## Vérification après déploiement
1. Ouvrir http://100.48.20.109:3002
2. Cliquer sur "Géolocaliser"
3. **Vérifier** : un seul message alert(), pas de Dialog
4. **Vérifier** : le texte mentionne "marqueur bleu"
5. Cliquer sur carte → marqueur bleu doit apparaître

## Fichiers modifiés
- `a_reference_front/src/components/CartographyMap.js`

## Date de correction
2026-09-04
