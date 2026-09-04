# 📍 Guide Simple : Géolocalisation sur HTTP

## 🚨 Votre Situation Actuelle

Vous accédez à l'application via **HTTP** (`100.48.20.109:3002`), ce qui **bloque la géolocalisation GPS automatique** pour des raisons de sécurité du navigateur.

## ✅ Solution : Placement Manuel de Votre Position

### 📱 Étapes à Suivre (Très Simple)

#### 1️⃣ Ouvrir la Cartographie
- Aller sur `http://100.48.20.109:3002`
- Cliquer sur **"Cartographie"** dans le menu

#### 2️⃣ Trouver Votre Position Réelle
Vous avez 2 méthodes :

**Méthode A : Utiliser Google Maps en parallèle**
1. Ouvrir Google Maps sur votre téléphone
2. Activer le GPS
3. Noter vos coordonnées GPS exactes (latitude/longitude)
4. Ou simplement identifier des repères visuels (rues, bâtiments)

**Méthode B : Zoomer sur la carte de l'application**
1. Utiliser les contrôles **+ / -** pour zoomer
2. Chercher votre zone géographique
3. Identifier des repères visuels

#### 3️⃣ Placer Votre Position Manuellement
1. **Cliquer EXACTEMENT** sur la carte là où vous êtes
2. Un **marqueur bleu** apparaît instantanément
3. Vous verrez un message : "✅ Position placée manuellement..."
4. La carte se centre automatiquement sur votre clic avec un zoom rapproché

#### 4️⃣ Enregistrer une Structure de Santé
1. Une fenêtre de confirmation apparaît : "Voulez-vous ajouter une structure..."
2. Cliquer sur **"OK"** pour continuer
3. Remplir le formulaire avec les informations de la structure
4. Valider

## 🎯 Astuces pour Placer une Position Précise

### Pour une Position Nette

1. **Zoomer au maximum** avant de cliquer (niveau 17-19)
   - Utilisez le bouton **+** plusieurs fois
   - Ou la molette de la souris

2. **Utilisez les Modes de Carte**
   - **Vue satellite** : Pour voir les bâtiments réels
   - **Vue plan** : Pour voir les rues et noms

3. **Repères Visuels**
   - Cherchez votre rue
   - Identifiez un bâtiment connu
   - Repérez un croisement de routes

4. **Vérifiez les Coordonnées**
   - Après avoir cliqué, notez les coordonnées affichées
   - Comparez avec Google Maps si besoin

## 🔍 Exemple Pratique

### Scénario : Vous êtes au Centre de Santé de Ziguinchor

```
1. Ouvrir Cartographie
2. Zoomer sur Ziguinchor
3. Trouver la rue principale
4. Identifier le centre de santé
5. Cliquer PRÉCISÉMENT sur le bâtiment
6. Le marqueur bleu apparaît
7. Confirmer "OK" pour ajouter la structure
8. Remplir le formulaire
```

## 🆘 Problèmes Courants

### ❌ "Je clique mais rien ne se passe"
**Solutions :**
- Attendre 2 secondes après le chargement de la carte
- Recharger la page (F5)
- Vérifier que la carte est bien chargée (pas d'écran gris)

### ❌ "Le marqueur n'apparaît pas"
**Solutions :**
- Cliquer directement sur la carte (pas sur les boutons)
- Vérifier que vous n'êtes pas sur un marqueur existant
- Recharger la page et réessayer

### ❌ "La carte ne zoome pas assez"
**Solutions :**
- Cliquer plusieurs fois sur le bouton **+**
- Utiliser la molette de la souris (scroll up)
- Double-cliquer sur la zone pour zoomer rapidement

### ❌ "Je ne trouve pas ma position"
**Solutions :**
- Utiliser Google Maps en parallèle pour identifier la zone
- Chercher des noms de rues familiers
- Utiliser le mode **Satellite** pour voir les bâtiments réels

## 📊 Vérification de la Position

### Après avoir cliqué, vérifiez :

✅ **Marqueur Bleu Visible** : Apparaît à l'endroit cliqué  
✅ **Message Affiché** : "Position placée manuellement..."  
✅ **Zoom Ajusté** : La carte se centre sur votre position  
✅ **Coordonnées Affichées** : Dans la console (F12)

### Dans la Console (F12) :
```
✅ Position placée manuellement: { lat: 12.583, lng: -16.271 }
```

## 🎬 Vidéo Pas-à-Pas (Simulation)

```
┌─────────────────────────────────┐
│  1. OUVRIR CARTOGRAPHIE         │
│  [Menu] → Cartographie          │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│  2. ZOOMER SUR VOTRE ZONE       │
│  Cliquer sur [+] [+] [+]        │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│  3. CLIQUER SUR VOTRE POSITION  │
│  👆 Clic sur la carte           │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│  4. MARQUEUR BLEU APPARAÎT      │
│  📍 Position définie !          │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│  5. CONFIRMER L'AJOUT           │
│  [OK] dans la popup             │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│  6. REMPLIR LE FORMULAIRE       │
│  Nom, type, services, etc.      │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│  7. VALIDER                     │
│  ✅ Structure enregistrée !     │
└─────────────────────────────────┘
```

## 💡 Pour Plus Tard : Utiliser HTTPS

Pour activer la géolocalisation GPS automatique à l'avenir, vous devrez :

1. **Configurer HTTPS sur votre serveur**
2. **Accéder via** : `https://100.48.20.109:3002` (au lieu de http)
3. **Le bouton GPS** sera alors actif et fonctionnel

Mais **pour l'instant**, le placement manuel fonctionne **parfaitement** !

## 📞 Besoin d'Aide ?

Si vous avez toujours des difficultés :

1. **Ouvrir la console** (F12)
2. **Copier les messages** qui apparaissent
3. **Prendre une capture d'écran** de la carte
4. **Noter** :
   - Navigateur utilisé (Chrome, Firefox, etc.)
   - Action effectuée
   - Résultat obtenu

---

## ✅ Résumé en 3 Étapes

1. **Zoomer** sur votre zone géographique
2. **Cliquer** exactement où vous êtes
3. **Confirmer** et remplir le formulaire

**C'est tout !** 🎉

---

**Note** : Les modifications récentes ont supprimé la position par défaut sur Ziguinchor. Maintenant, **votre clic** définit directement **votre position réelle**.
