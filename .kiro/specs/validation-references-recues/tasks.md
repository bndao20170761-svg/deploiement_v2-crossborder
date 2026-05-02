# Implementation Plan

- [x] 1. Optimiser le filtrage backend des références reçues




  - [x] 1.1 Ajouter la méthode `findByCodeDocteurAndValidationTrue` dans `ReferenceDossierRepository`


    - Ajouter `List<ReferenceDossier> findByCodeDocteurAndValidationTrue(String codeDocteur);` dans l'interface


    - _Requirements: 1.1, 1.2_
  - [x] 1.2 Utiliser la nouvelle méthode dans `getReferencesRecues()` pour le cas médecin





    - Remplacer `findByCodeDocteur` + filtre en mémoire par `findByCodeDocteurAndValidationTrue`
    - _Requirements: 1.1, 1.2_



- [ ] 2. Corriger le fallback du nom du référenceur lors de la création par un assistant
  - Dans `createReference()`, bloc assistant, renforcer la construction de `nomReferenceur` : utiliser `pseudo` puis `codeDoctor` si `nom`+`prenom` du doctor du patient sont vides
  - _Requirements: 3.1_

- [ ] 3. Corriger les couleurs et le guard dans `ReferenceDossierList`
  - [ ] 3.1 Corriger la logique de coloration des lignes du tableau
    - Remplacer `reference.validation === false` par `reference.validation != true`
    - Remplacer `!reference.etat` par `reference.etat !== true` dans les conditions bleu et rouge
    - _Requirements: 4.1, 4.2_
  - [ ] 3.2 Ajouter un guard dans `fetchReferences()` pour l'onglet "recues"
    - Après l'appel `getReferencesRecues()`, filtrer `data = (data || []).filter(ref => ref.validation === true)`
    - _Requirements: 4.1_
