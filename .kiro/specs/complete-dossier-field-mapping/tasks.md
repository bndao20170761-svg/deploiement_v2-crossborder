# Implementation Plan: Complete Dossier Field Mapping

## Overview

Ce plan d'implémentation décrit les étapes pour ajouter tous les champs manquants de la table `dossier` dans l'entité JPA `Dossier.java`, mettre à jour les DTOs correspondants, et s'assurer que le service gère correctement ces nouveaux champs lors des opérations CRUD.

L'implémentation sera incrémentale, en ajoutant les champs par catégorie, puis en mettant à jour les DTOs et le mapper, et enfin en testant l'intégration complète.

## Tasks

- [ ] 1. Ajouter les champs parentaux à l'entité Dossier
  - Ajouter les 12 champs relatifs aux parents (mère et père) avec annotations @Column
  - Utiliser les noms de colonnes exacts de la base de données (avec accents)
  - Tous les champs sont de type String sauf les téléphones
  - _Requirements: 1.1-1.12_

- [ ] 2. Ajouter les champs répondants à l'entité Dossier
  - Ajouter les 10 champs relatifs aux répondants 1 et 2 avec annotations @Column
  - Tous les champs sont de type String
  - _Requirements: 2.1-2.10_

- [ ] 3. Ajouter les champs ARV à l'entité Dossier
  - Ajouter les 9 champs relatifs au traitement ARV avec annotations @Column
  - Utiliser LocalDate pour les dates (dateDebutArv, dateDebutTar)
  - Utiliser String pour les protocoles et stades OMS
  - _Requirements: 3.1-3.9_

- [ ] 4. Ajouter les champs de naissance à l'entité Dossier
  - Ajouter les 5 champs relatifs à la naissance avec annotations @Column
  - Utiliser Double pour poidsNaissance, Integer pour tailleNaissance et perimetreCranien
  - Utiliser String pour apgar et naissanceStructure
  - _Requirements: 4.1-4.5_

- [ ] 5. Ajouter les champs de dépistage à l'entité Dossier
  - Ajouter les 8 champs relatifs au dépistage et diagnostic avec annotations @Column
  - Utiliser LocalDate pour dateTest, dateConfirmation, dateReference
  - Utiliser String pour les autres champs
  - _Requirements: 5.1-5.8_

- [ ] 6. Ajouter les champs de soutien à l'entité Dossier
  - Ajouter les 7 champs relatifs aux personnes de soutien avec annotations @Column
  - Tous les champs sont de type String
  - _Requirements: 6.1-6.7_

- [ ] 7. Ajouter les champs PTME à l'entité Dossier
  - Ajouter les 7 champs relatifs à la PTME et enfants exposés avec annotations @Column
  - Utiliser Integer pour enfantSevrageAgeMois et nbGrossessesPtme
  - Utiliser String pour les autres champs
  - _Requirements: 7.1-7.7_

- [ ] 8. Ajouter les champs d'éducation thérapeutique à l'entité Dossier
  - Ajouter les 4 champs relatifs à l'ETP avec annotations @Column
  - Utiliser LocalDate pour dateDebutEtp
  - Utiliser Integer pour ageEtp et ageAnnonce
  - Utiliser String pour annonceComplete
  - _Requirements: 8.1-8.4_

- [ ] 9. Ajouter les champs de vaccination à l'entité Dossier
  - Ajouter les 2 champs relatifs à la vaccination avec annotations @Column
  - Tous les champs sont de type String
  - _Requirements: 9.1-9.2_

- [ ] 10. Ajouter les autres champs médicaux à l'entité Dossier
  - Ajouter les 6 champs médicaux restants avec annotations @Column
  - Tous les champs sont de type String
  - _Requirements: 10.1-10.6_

- [ ] 11. Ajouter les champs socio-professionnels à l'entité Dossier
  - Ajouter les 2 champs socio-professionnels avec annotations @Column
  - Tous les champs sont de type String
  - _Requirements: 11.1-11.2_

- [ ] 12. Générer les getters et setters pour tous les nouveaux champs
  - Utiliser Lombok @Getter et @Setter (déjà présents sur la classe)
  - Vérifier que tous les nouveaux champs sont accessibles
  - _Requirements: 1.1-11.2_

- [ ] 13. Checkpoint - Vérifier la compilation de l'entité Dossier
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Mettre à jour DossierDTO avec tous les nouveaux champs
  - Ajouter tous les 72 nouveaux champs dans DossierDTO
  - Utiliser les mêmes types que l'entité (String, LocalDate, Integer, Double)
  - Utiliser les mêmes noms en camelCase
  - _Requirements: 12.1, 13.1_

- [ ] 15. Mettre à jour DossierViewDto avec tous les nouveaux champs
  - Ajouter tous les 72 nouveaux champs dans DossierViewDto
  - Utiliser les mêmes types que l'entité
  - Utiliser les mêmes noms en camelCase
  - _Requirements: 12.2, 13.2_

- [ ] 16. Mettre à jour PatientPvvihMapper pour mapper les nouveaux champs
  - Ajouter les mappings pour tous les nouveaux champs dans toDossier()
  - Ajouter les mappings pour tous les nouveaux champs dans toDossierViewDto()
  - MapStruct devrait gérer automatiquement les champs avec noms identiques
  - _Requirements: 12.1, 12.2, 13.3_

- [ ] 17. Vérifier que DossierService.createDossierPatient() gère les nouveaux champs
  - Le mapper devrait automatiquement gérer les nouveaux champs
  - Vérifier qu'aucune logique supplémentaire n'est nécessaire
  - _Requirements: 12.1, 12.3_

- [ ] 18. Vérifier que DossierService.dossierView() retourne les nouveaux champs
  - Le mapper devrait automatiquement gérer les nouveaux champs
  - Vérifier qu'aucune logique supplémentaire n'est nécessaire
  - _Requirements: 12.2, 12.4_

- [ ] 19. Checkpoint - Vérifier la compilation de tous les composants
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 20. Écrire des tests unitaires pour la création de dossier avec nouveaux champs
  - Tester la création d'un dossier avec tous les champs remplis
  - Tester la création d'un dossier avec tous les champs null
  - Vérifier que les données sont correctement sauvegardées
  - _Requirements: 12.3, 14.3_

- [ ]* 21. Écrire des tests unitaires pour la lecture de dossier avec nouveaux champs
  - Tester la lecture d'un dossier avec tous les champs remplis
  - Tester la lecture d'un dossier avec tous les champs null
  - Vérifier que les données sont correctement récupérées
  - _Requirements: 12.4, 14.1_

- [ ]* 22. Écrire des tests unitaires pour la mise à jour de dossier
  - Tester la mise à jour de quelques nouveaux champs
  - Vérifier que les champs non modifiés sont préservés
  - Vérifier que les anciens champs sont préservés
  - _Requirements: 12.5, 14.2_

- [ ]* 23. Écrire un test de propriété pour le round-trip database
  - [ ]* 23.1 Configurer jqwik ou JUnit-Quickcheck pour les tests de propriété
    - Ajouter la dépendance dans pom.xml
    - Configurer le framework pour 100+ itérations
  
  - [ ]* 23.2 Écrire le générateur de données aléatoires pour Dossier
    - Générer des valeurs aléatoires pour tous les types (String, LocalDate, Integer, Double)
    - Inclure des cas limites (null, chaînes vides, dates extrêmes)
  
  - [ ]* 23.3 Implémenter Property 1: Database round-trip preserves all new fields
    - **Property 1: Database round-trip preserves all new fields**
    - **Validates: Requirements 1.1-1.12, 2.1-2.10, 3.1-3.9, 4.1-4.5, 5.1-5.8, 6.1-6.7, 7.1-7.7, 8.1-8.4, 9.1-9.2, 10.1-10.6, 11.1-11.2, 12.3, 12.4**
    - Générer un Dossier aléatoire, le sauvegarder, le relire, vérifier l'égalité de tous les champs

- [ ]* 24. Écrire un test de propriété pour la conversion DTO to Entity
  - [ ]* 24.1 Écrire le générateur de données aléatoires pour DossierDTO
    - Générer des valeurs aléatoires pour tous les champs du DTO
  
  - [ ]* 24.2 Implémenter Property 2: DTO to Entity conversion preserves all fields
    - **Property 2: DTO to Entity conversion preserves all fields**
    - **Validates: Requirements 12.1**
    - Générer un DossierDTO aléatoire, le convertir en Dossier, vérifier l'égalité de tous les champs

- [ ]* 25. Écrire un test de propriété pour la conversion Entity to DTO
  - [ ]* 25.1 Implémenter Property 3: Entity to DTO conversion preserves all fields
    - **Property 3: Entity to DTO conversion preserves all fields**
    - **Validates: Requirements 12.2**
    - Générer un Dossier aléatoire, le convertir en DossierViewDto, vérifier l'égalité de tous les champs

- [ ]* 26. Écrire un test de propriété pour la mise à jour
  - [ ]* 26.1 Implémenter Property 4: Update operation preserves all modified fields
    - **Property 4: Update operation preserves all modified fields**
    - **Validates: Requirements 12.5**
    - Créer un Dossier, modifier aléatoirement certains champs, sauvegarder, relire, vérifier les modifications

- [ ]* 27. Écrire un test de propriété pour la sérialisation JSON
  - [ ]* 27.1 Implémenter Property 5: JSON serialization includes all new fields
    - **Property 5: JSON serialization includes all new fields**
    - **Validates: Requirements 13.4**
    - Générer un Dossier aléatoire, le sérialiser en JSON, vérifier que tous les champs sont présents

- [ ]* 28. Écrire un test de propriété pour la préservation des champs existants
  - [ ]* 28.1 Implémenter Property 6: Update preserves existing fields when updating new fields
    - **Property 6: Update preserves existing fields when updating new fields**
    - **Validates: Requirements 14.2**
    - Créer un Dossier avec anciens champs remplis, mettre à jour seulement les nouveaux champs, vérifier que les anciens sont préservés

- [ ]* 29. Écrire des tests d'intégration avec base de données réelle
  - Utiliser @DataJpaTest avec H2 ou PostgreSQL
  - Tester la création, lecture, mise à jour avec tous les nouveaux champs
  - Vérifier la migration de schéma automatique
  - _Requirements: 12.3, 12.4, 12.5, 14.4_

- [ ]* 30. Écrire des tests d'intégration de l'API REST
  - Utiliser @SpringBootTest avec MockMvc
  - Tester POST /dossiers avec tous les nouveaux champs
  - Tester GET /dossiers/{code} et vérifier que tous les champs sont retournés
  - Vérifier la sérialisation JSON complète
  - _Requirements: 13.4_

- [ ] 31. Checkpoint final - Vérifier que tous les tests passent
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 32. Mettre à jour la documentation si nécessaire
  - Documenter les nouveaux champs dans les JavaDoc
  - Mettre à jour le README si nécessaire
  - Documenter les changements de schéma de base de données

## Notes

- Les tâches marquées avec `*` sont optionnelles et peuvent être sautées pour un MVP plus rapide
- Chaque tâche référence les exigences spécifiques pour la traçabilité
- Les checkpoints assurent une validation incrémentale
- Les tests de propriété valident les propriétés de correction universelles avec 100+ itérations
- Les tests unitaires valident des exemples spécifiques et des cas limites
- L'implémentation est incrémentale: entité → DTOs → mapper → service → tests
