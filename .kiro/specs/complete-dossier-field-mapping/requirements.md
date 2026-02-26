# Requirements Document - Complete Dossier Field Mapping

## Introduction

Ce document spécifie les exigences pour compléter le mapping de TOUS les champs de la table `dossier` dans l'entité JPA `Dossier.java`. Actuellement, l'entité ne mappe que quelques champs de base (codeDossier, codificationNationale, numeroNotification, identificationBiom, biometricStatus), alors que la table contient de nombreux champs critiques pour la gestion complète des dossiers médicaux des patients PVVIH.

## Glossary

- **Dossier**: Entité JPA représentant un dossier médical patient dans le système
- **JPA**: Java Persistence API - framework de mapping objet-relationnel
- **PVVIH**: Personne Vivant avec le VIH
- **ARV**: Antirétroviral - médicament pour le traitement du VIH
- **TAR**: Traitement Antirétroviral
- **PTME**: Prévention de la Transmission Mère-Enfant
- **OMS**: Organisation Mondiale de la Santé
- **ETP**: Education Thérapeutique du Patient
- **DossierService**: Service Spring gérant les opérations CRUD sur les dossiers
- **DossierDTO**: Data Transfer Object pour la création/mise à jour de dossiers
- **DossierViewDto**: DTO pour l'affichage complet d'un dossier

## Requirements

### Requirement 1: Mapper les informations parentales

**User Story:** En tant que système, je veux mapper tous les champs relatifs aux parents du patient, afin de conserver les informations familiales complètes dans l'entité JPA.

#### Acceptance Criteria

1. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ mère_nom_prenoms
2. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ mère_profession
3. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ mère_statut_vih
4. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ mère_statut
5. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ mère_niveau_instruction
6. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ mère_telephone
7. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ père_nom_prenoms
8. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ père_profession
9. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ père_statut_vih
10. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ père_statut
11. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ père_niveau_instruction
12. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ père_telephone

### Requirement 2: Mapper les informations des répondants

**User Story:** En tant que système, je veux mapper tous les champs relatifs aux répondants du patient, afin de conserver les contacts responsables du patient.

#### Acceptance Criteria

1. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ répondant1_nom
2. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ répondant1_lien
3. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ répondant1_profession
4. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ répondant1_tel
5. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ répondant1_niveau
6. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ répondant2_nom
7. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ répondant2_lien
8. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ répondant2_profession
9. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ répondant2_tel
10. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ répondant2_niveau

### Requirement 3: Mapper les informations médicales ARV

**User Story:** En tant que système, je veux mapper tous les champs relatifs au traitement ARV, afin de suivre l'historique thérapeutique du patient.

#### Acceptance Criteria

1. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ arv
2. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ stade_oms
3. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ protocole_initial_arv
4. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ protocole_actuel_arv
5. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ date_début_arv
6. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ date_début_tar
7. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ protocole_initial_tar
8. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ arv_stade_oms_initial
9. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ stade_oms_initial

### Requirement 4: Mapper les informations de naissance

**User Story:** En tant que système, je veux mapper tous les champs relatifs à la naissance du patient, afin de conserver les données périnatales.

#### Acceptance Criteria

1. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ poids_naissance
2. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ taille_naissance
3. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ périmètre_crânien
4. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ apgar
5. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ naissance_structure

### Requirement 5: Mapper les informations de dépistage et diagnostic

**User Story:** En tant que système, je veux mapper tous les champs relatifs au dépistage et diagnostic VIH, afin de tracer le parcours de diagnostic du patient.

#### Acceptance Criteria

1. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ date_test
2. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ date_confirmation
3. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ lieu_test
4. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ resultat
5. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ site_origine
6. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ portes_entree
7. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ reference
8. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ date_reference

### Requirement 6: Mapper les informations de soutien

**User Story:** En tant que système, je veux mapper tous les champs relatifs aux personnes de soutien, afin d'identifier les ressources d'accompagnement du patient.

#### Acceptance Criteria

1. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ soutien_nom
2. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ soutien_prénoms
3. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ soutien_lien
4. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ soutien_telephone
5. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ soutien_adresse
6. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ personne_contact
7. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ telephone_contact

### Requirement 7: Mapper les informations PTME et enfant exposé

**User Story:** En tant que système, je veux mapper tous les champs relatifs à la PTME et aux enfants exposés, afin de suivre la prévention de transmission mère-enfant.

#### Acceptance Criteria

1. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ enfant_prophylaxie_arv_naissance
2. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ enfant_prophylaxie_cotrimoxazole
3. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ enfant_alimentation
4. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ enfant_sevrage_age_mois
5. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ enfant_numero_seropositif
6. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ mère_trithérapie_grossesse
7. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ nb_grossesses_ptme

### Requirement 8: Mapper les informations d'éducation thérapeutique

**User Story:** En tant que système, je veux mapper tous les champs relatifs à l'éducation thérapeutique, afin de suivre le parcours éducatif du patient.

#### Acceptance Criteria

1. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ date_début_etp
2. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ age_etp
3. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ annonce_complete
4. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ age_annonce

### Requirement 9: Mapper les informations de vaccination

**User Story:** En tant que système, je veux mapper tous les champs relatifs à la vaccination, afin de suivre le statut vaccinal du patient.

#### Acceptance Criteria

1. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ vaccins
2. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ autres_vaccins

### Requirement 10: Mapper les autres informations médicales

**User Story:** En tant que système, je veux mapper tous les autres champs médicaux, afin de conserver un dossier médical complet.

#### Acceptance Criteria

1. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ tuberculose
2. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ autres_ant
3. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ maladies_chroniques
4. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ autres_maladies_chroniques
5. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ contraception
6. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ prep

### Requirement 11: Mapper les informations socio-professionnelles

**User Story:** En tant que système, je veux mapper tous les champs socio-professionnels, afin de comprendre le contexte social du patient.

#### Acceptance Criteria

1. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ profession
2. WHEN un dossier est créé ou lu, THE Dossier SHALL mapper le champ statut_familial

### Requirement 12: Gérer les opérations CRUD avec les nouveaux champs

**User Story:** En tant que DossierService, je veux gérer correctement tous les nouveaux champs lors des opérations CRUD, afin que les données soient persistées et récupérées correctement.

#### Acceptance Criteria

1. WHEN un DossierDTO est converti en Dossier, THE DossierService SHALL mapper tous les nouveaux champs du DTO vers l'entité
2. WHEN un Dossier est converti en DossierViewDto, THE DossierService SHALL mapper tous les nouveaux champs de l'entité vers le DTO
3. WHEN un dossier est créé, THE DossierService SHALL persister tous les nouveaux champs en base de données
4. WHEN un dossier est lu, THE DossierService SHALL récupérer tous les nouveaux champs depuis la base de données
5. WHEN un dossier est mis à jour, THE DossierService SHALL mettre à jour tous les nouveaux champs modifiés

### Requirement 13: Assurer la compatibilité avec les DTOs existants

**User Story:** En tant que système, je veux que les DTOs existants soient mis à jour pour inclure les nouveaux champs, afin de maintenir la cohérence de l'API.

#### Acceptance Criteria

1. WHEN DossierDTO est utilisé, THE DossierDTO SHALL contenir tous les nouveaux champs mappés
2. WHEN DossierViewDto est utilisé, THE DossierViewDto SHALL contenir tous les nouveaux champs mappés
3. WHEN le mapper est utilisé, THE PatientPvvihMapper SHALL convertir correctement tous les nouveaux champs entre DTOs et entités
4. WHEN l'API REST retourne un dossier, THE API SHALL inclure tous les nouveaux champs dans la réponse JSON

### Requirement 14: Maintenir la rétrocompatibilité

**User Story:** En tant que système, je veux que les dossiers existants continuent de fonctionner après l'ajout des nouveaux champs, afin de ne pas casser les données existantes.

#### Acceptance Criteria

1. WHEN un dossier existant est lu, THE Dossier SHALL retourner null pour les nouveaux champs non renseignés
2. WHEN un dossier existant est mis à jour, THE Dossier SHALL préserver les valeurs existantes des anciens champs
3. WHEN un nouveau dossier est créé sans renseigner les nouveaux champs, THE Dossier SHALL accepter des valeurs null pour ces champs
4. WHEN l'application démarre, THE JPA SHALL créer ou mettre à jour le schéma de base de données sans perdre les données existantes
