# Design Document - Complete Dossier Field Mapping

## Overview

Ce document décrit la conception technique pour compléter le mapping de tous les champs de la table `dossier` dans l'entité JPA `Dossier.java`. Actuellement, l'entité ne mappe que 5 champs de base, alors que la table contient plus de 60 champs critiques pour la gestion complète des dossiers médicaux.

L'objectif est d'ajouter tous les champs manquants à l'entité JPA, de mettre à jour les DTOs correspondants, et de s'assurer que le `DossierService` gère correctement ces nouveaux champs lors des opérations CRUD.

### Champs actuellement mappés
- codeDossier
- codificationNationale
- numeroNotification
- identificationBiom
- biometricStatus

### Catégories de champs à ajouter
1. Informations parentales (12 champs)
2. Informations des répondants (10 champs)
3. Informations médicales ARV (9 champs)
4. Informations de naissance (5 champs)
5. Informations de dépistage (8 champs)
6. Informations de soutien (7 champs)
7. Informations PTME (7 champs)
8. Informations d'éducation thérapeutique (4 champs)
9. Informations de vaccination (2 champs)
10. Autres informations médicales (6 champs)
11. Informations socio-professionnelles (2 champs)

**Total: ~72 nouveaux champs à mapper**

## Architecture

### Composants impactés

1. **Entité JPA: Dossier.java**
   - Ajout de tous les nouveaux champs avec annotations JPA appropriées
   - Utilisation de @Column pour mapper les noms de colonnes de la base de données
   - Types de données appropriés (String, LocalDate, Integer, Double, Boolean)

2. **DTOs**
   - DossierDTO: pour la création/mise à jour de dossiers
   - DossierViewDto: pour l'affichage complet d'un dossier
   - Ajout de tous les nouveaux champs dans les deux DTOs

3. **Mapper: PatientPvvihMapper**
   - Mise à jour des méthodes de mapping pour inclure tous les nouveaux champs
   - Conversion bidirectionnelle entre entités et DTOs

4. **Service: DossierService**
   - Mise à jour de createDossierPatient() pour gérer les nouveaux champs
   - Mise à jour de dossierView() pour retourner les nouveaux champs
   - Pas de changement dans la logique métier, seulement le mapping

### Stratégie de mapping


Tous les nouveaux champs seront:
- **Nullable**: Permettre null pour maintenir la rétrocompatibilité
- **Mappés explicitement**: Utiliser @Column(name="...") pour mapper les noms de colonnes exactes
- **Typés correctement**: Utiliser les types Java appropriés selon les données

## Components and Interfaces

### 1. Entité Dossier.java

L'entité sera enrichie avec tous les nouveaux champs organisés par catégorie:

```java
@Entity
@Table(name = "dossier")
public class Dossier {
    // Champs existants...
    
    // === INFORMATIONS PARENTALES ===
    @Column(name = "mère_nom_prenoms")
    private String mereNomPrenoms;
    
    @Column(name = "mère_profession")
    private String mereProfession;
    
    @Column(name = "mère_statut_vih")
    private String mereStatutVih;
    
    @Column(name = "mère_statut")
    private String mereStatut;
    
    @Column(name = "mère_niveau_instruction")
    private String mereNiveauInstruction;
    
    @Column(name = "mère_telephone")
    private String mereTelephone;
    
    @Column(name = "père_nom_prenoms")
    private String pereNomPrenoms;
    
    @Column(name = "père_profession")
    private String pereProfession;
    
    @Column(name = "père_statut_vih")
    private String pereStatutVih;
    
    @Column(name = "père_statut")
    private String pereStatut;
    
    @Column(name = "père_niveau_instruction")
    private String pereNiveauInstruction;
    
    @Column(name = "père_telephone")
    private String pereTelephone;
    
    // === INFORMATIONS RÉPONDANTS ===
    @Column(name = "répondant1_nom")
    private String repondant1Nom;
    
    @Column(name = "répondant1_lien")
    private String repondant1Lien;
    
    @Column(name = "répondant1_profession")
    private String repondant1Profession;
    
    @Column(name = "répondant1_tel")
    private String repondant1Tel;
    
    @Column(name = "répondant1_niveau")
    private String repondant1Niveau;
    
    @Column(name = "répondant2_nom")
    private String repondant2Nom;
    
    @Column(name = "répondant2_lien")
    private String repondant2Lien;
    
    @Column(name = "répondant2_profession")
    private String repondant2Profession;
    
    @Column(name = "répondant2_tel")
    private String repondant2Tel;
    
    @Column(name = "répondant2_niveau")
    private String repondant2Niveau;
    
    // === INFORMATIONS MÉDICALES ARV ===
    @Column(name = "arv")
    private String arv;
    
    @Column(name = "stade_oms")
    private String stadeOms;
    
    @Column(name = "protocole_initial_arv")
    private String protocoleInitialArv;
    
    @Column(name = "protocole_actuel_arv")
    private String protocoleActuelArv;
    
    @Column(name = "date_début_arv")
    private LocalDate dateDebutArv;
    
    @Column(name = "date_début_tar")
    private LocalDate dateDebutTar;
    
    @Column(name = "protocole_initial_tar")
    private String protocoleInitialTar;
    
    @Column(name = "arv_stade_oms_initial")
    private String arvStadeOmsInitial;
    
    @Column(name = "stade_oms_initial")
    private String stadeOmsInitial;
    
    // === INFORMATIONS DE NAISSANCE ===
    @Column(name = "poids_naissance")
    private Double poidsNaissance;
    
    @Column(name = "taille_naissance")
    private Integer tailleNaissance;
    
    @Column(name = "périmètre_crânien")
    private Integer perimetreCranien;
    
    @Column(name = "apgar")
    private String apgar;
    
    @Column(name = "naissance_structure")
    private String naissanceStructure;
    
    // === INFORMATIONS DE DÉPISTAGE ===
    @Column(name = "date_test")
    private LocalDate dateTest;
    
    @Column(name = "date_confirmation")
    private LocalDate dateConfirmation;
    
    @Column(name = "lieu_test")
    private String lieuTest;
    
    @Column(name = "resultat")
    private String resultat;
    
    @Column(name = "site_origine")
    private String siteOrigine;
    
    @Column(name = "portes_entree")
    private String portesEntree;
    
    @Column(name = "reference")
    private String reference;
    
    @Column(name = "date_reference")
    private LocalDate dateReference;
    
    // === INFORMATIONS DE SOUTIEN ===
    @Column(name = "soutien_nom")
    private String soutienNom;
    
    @Column(name = "soutien_prénoms")
    private String soutienPrenoms;
    
    @Column(name = "soutien_lien")
    private String soutienLien;
    
    @Column(name = "soutien_telephone")
    private String soutienTelephone;
    
    @Column(name = "soutien_adresse")
    private String soutienAdresse;
    
    @Column(name = "personne_contact")
    private String personneContact;
    
    @Column(name = "telephone_contact")
    private String telephoneContact;
    
    // === INFORMATIONS PTME ===
    @Column(name = "enfant_prophylaxie_arv_naissance")
    private String enfantProphylaxieArvNaissance;
    
    @Column(name = "enfant_prophylaxie_cotrimoxazole")
    private String enfantProphylaxieCotrimoxazole;
    
    @Column(name = "enfant_alimentation")
    private String enfantAlimentation;
    
    @Column(name = "enfant_sevrage_age_mois")
    private Integer enfantSevrageAgeMois;
    
    @Column(name = "enfant_numero_seropositif")
    private String enfantNumeroSeropositif;
    
    @Column(name = "mère_trithérapie_grossesse")
    private String mereTritherapieGrossesse;
    
    @Column(name = "nb_grossesses_ptme")
    private Integer nbGrossessesPtme;
    
    // === INFORMATIONS ÉDUCATION THÉRAPEUTIQUE ===
    @Column(name = "date_début_etp")
    private LocalDate dateDebutEtp;
    
    @Column(name = "age_etp")
    private Integer ageEtp;
    
    @Column(name = "annonce_complete")
    private String annonceComplete;
    
    @Column(name = "age_annonce")
    private Integer ageAnnonce;
    
    // === INFORMATIONS VACCINATION ===
    @Column(name = "vaccins")
    private String vaccins;
    
    @Column(name = "autres_vaccins")
    private String autresVaccins;
    
    // === AUTRES INFORMATIONS MÉDICALES ===
    @Column(name = "tuberculose")
    private String tuberculose;
    
    @Column(name = "autres_ant")
    private String autresAnt;
    
    @Column(name = "maladies_chroniques")
    private String maladiesChroniques;
    
    @Column(name = "autres_maladies_chroniques")
    private String autresMaladiesChroniques;
    
    @Column(name = "contraception")
    private String contraception;
    
    @Column(name = "prep")
    private String prep;
    
    // === INFORMATIONS SOCIO-PROFESSIONNELLES ===
    @Column(name = "profession")
    private String profession;
    
    @Column(name = "statut_familial")
    private String statutFamilial;
}
```

### 2. DTOs

#### DossierDTO
Ajout de tous les nouveaux champs pour permettre la création/mise à jour:

```java
public class DossierDTO {
    // Champs existants...
    
    // Nouveaux champs (mêmes noms que l'entité en camelCase)
    private String mereNomPrenoms;
    private String mereProfession;
    // ... tous les autres champs
}
```

#### DossierViewDto
Ajout de tous les nouveaux champs pour l'affichage:

```java
public class DossierViewDto {
    // Champs existants...
    
    // Nouveaux champs
    private String mereNomPrenoms;
    private String mereProfession;
    // ... tous les autres champs
}
```

### 3. Mapper

Le PatientPvvihMapper sera mis à jour pour mapper tous les nouveaux champs:

```java
@Mapper(componentModel = "spring")
public interface PatientPvvihMapper {
    
    @Mapping(source = "mereNomPrenoms", target = "mereNomPrenoms")
    @Mapping(source = "mereProfession", target = "mereProfession")
    // ... tous les autres mappings
    Dossier toDossier(DossierDTO dto);
    
    @Mapping(source = "mereNomPrenoms", target = "mereNomPrenoms")
    @Mapping(source = "mereProfession", target = "mereProfession")
    // ... tous les autres mappings
    DossierViewDto toDossierViewDto(Dossier dossier);
}
```

### 4. Service

Le DossierService n'aura pas de changement de logique, seulement le mapping automatique via MapStruct:

```java
@Transactional
public Dossier createDossierPatient(DossierDTO dto) {
    // Le mapper gère automatiquement tous les nouveaux champs
    Dossier dossier = mapper.toDossier(dto);
    
    // Logique existante inchangée...
    
    return dossierRepository.save(dossier);
}

@Transactional()
public DossierViewDto dossierView(String codePatient) {
    Dossier dossier = dossierRepository.findByPatientCode(codePatient)
        .orElseThrow(...);
    
    // Le mapper gère automatiquement tous les nouveaux champs
    DossierViewDto dto = mapper.toDossierViewDto(dossier);
    
    // Logique existante pour enrichir avec les données user...
    
    return dto;
}
```

## Data Models

### Dossier Entity

```
Dossier
├── Identifiants
│   ├── codeDossier: String (PK)
│   ├── codificationNationale: String
│   └── numeroNotification: String
├── Biométrie
│   ├── identificationBiom: String (LONGTEXT)
│   └── biometricStatus: String
├── Relations
│   ├── patientCode: String
│   ├── doctorCreateCode: String
│   ├── patient: Patient (OneToOne)
│   ├── doctorCreate: Doctor (ManyToOne)
│   └── pages: List<Page> (OneToMany)
├── Informations Parentales
│   ├── mereNomPrenoms: String
│   ├── mereProfession: String
│   ├── mereStatutVih: String
│   ├── mereStatut: String
│   ├── mereNiveauInstruction: String
│   ├── mereTelephone: String
│   ├── pereNomPrenoms: String
│   ├── pereProfession: String
│   ├── pereStatutVih: String
│   ├── pereStatut: String
│   ├── pereNiveauInstruction: String
│   └── pereTelephone: String
├── Répondants
│   ├── repondant1Nom: String
│   ├── repondant1Lien: String
│   ├── repondant1Profession: String
│   ├── repondant1Tel: String
│   ├── repondant1Niveau: String
│   ├── repondant2Nom: String
│   ├── repondant2Lien: String
│   ├── repondant2Profession: String
│   ├── repondant2Tel: String
│   └── repondant2Niveau: String
├── Informations Médicales ARV
│   ├── arv: String
│   ├── stadeOms: String
│   ├── protocoleInitialArv: String
│   ├── protocoleActuelArv: String
│   ├── dateDebutArv: LocalDate
│   ├── dateDebutTar: LocalDate
│   ├── protocoleInitialTar: String
│   ├── arvStadeOmsInitial: String
│   └── stadeOmsInitial: String
├── Naissance
│   ├── poidsNaissance: Double
│   ├── tailleNaissance: Integer
│   ├── perimetreCranien: Integer
│   ├── apgar: String
│   └── naissanceStructure: String
├── Dépistage
│   ├── dateTest: LocalDate
│   ├── dateConfirmation: LocalDate
│   ├── lieuTest: String
│   ├── resultat: String
│   ├── siteOrigine: String
│   ├── portesEntree: String
│   ├── reference: String
│   └── dateReference: LocalDate
├── Soutien
│   ├── soutienNom: String
│   ├── soutienPrenoms: String
│   ├── soutienLien: String
│   ├── soutienTelephone: String
│   ├── soutienAdresse: String
│   ├── personneContact: String
│   └── telephoneContact: String
├── PTME
│   ├── enfantProphylaxieArvNaissance: String
│   ├── enfantProphylaxieCotrimoxazole: String
│   ├── enfantAlimentation: String
│   ├── enfantSevrageAgeMois: Integer
│   ├── enfantNumeroSeropositif: String
│   ├── mereTritherapieGrossesse: String
│   └── nbGrossessesPtme: Integer
├── Éducation Thérapeutique
│   ├── dateDebutEtp: LocalDate
│   ├── ageEtp: Integer
│   ├── annonceComplete: String
│   └── ageAnnonce: Integer
├── Vaccination
│   ├── vaccins: String
│   └── autresVaccins: String
├── Autres Informations Médicales
│   ├── tuberculose: String
│   ├── autresAnt: String
│   ├── maladiesChroniques: String
│   ├── autresMaladiesChroniques: String
│   ├── contraception: String
│   └── prep: String
└── Socio-Professionnel
    ├── profession: String
    └── statutFamilial: String
```

### Types de données

- **String**: Pour tous les champs textuels (noms, statuts, descriptions)
- **LocalDate**: Pour toutes les dates (dateTest, dateConfirmation, dateDebutArv, etc.)
- **Integer**: Pour les valeurs numériques entières (âges, tailles, nombres)
- **Double**: Pour les valeurs décimales (poids)
- **Boolean**: Non utilisé dans ce mapping (les champs Oui/Non sont stockés en String)

### Contraintes

- Tous les nouveaux champs sont **nullable** pour la rétrocompatibilité
- Les noms de colonnes utilisent des accents (mère, père, périmètre) car c'est le schéma existant
- Pas de contraintes de validation au niveau JPA (validation faite au niveau DTO si nécessaire)


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

Après analyse des critères d'acceptation, plusieurs propriétés peuvent être combinées pour éviter la redondance:

**Propriétés identifiées:**
1. Tous les critères 1.1-11.2 testent le même concept: le mapping correct des champs entre la base de données et l'entité JPA
2. Les critères 12.1 et 12.2 testent les conversions DTO ↔ Entité
3. Le critère 12.3 teste la persistance complète (round-trip database)
4. Le critère 12.5 teste la mise à jour
5. Le critère 13.4 teste la sérialisation JSON
6. Le critère 14.2 teste la préservation des champs existants lors de mise à jour

**Redondances éliminées:**
- Les critères 1.1-11.2 peuvent être combinés en UNE propriété de round-trip database qui teste TOUS les champs
- Le critère 12.4 est redondant avec 12.3 (si le round-trip fonctionne, la lecture fonctionne)
- Le critère 13.3 est redondant avec 12.1 et 12.2
- Les critères 13.1 et 13.2 ne sont pas testables par code (vérification structurelle)
- Le critère 14.4 n'est pas testable par unit test (migration de schéma)

**Propriétés finales (après élimination des redondances):**
1. Database round-trip pour tous les nouveaux champs
2. DTO to Entity conversion
3. Entity to DTO conversion
4. Update preserves all fields
5. JSON serialization includes all fields
6. Update preserves existing fields
7. Null values are accepted (example)

### Properties

Property 1: Database round-trip preserves all new fields
*For any* Dossier with values set for all new fields (parental info, respondents, ARV info, birth info, screening info, support info, PTME info, ETP info, vaccination info, other medical info, socio-professional info), when the dossier is saved to the database and then retrieved, all field values should be identical to the original values.
**Validates: Requirements 1.1-1.12, 2.1-2.10, 3.1-3.9, 4.1-4.5, 5.1-5.8, 6.1-6.7, 7.1-7.7, 8.1-8.4, 9.1-9.2, 10.1-10.6, 11.1-11.2, 12.3, 12.4**

Property 2: DTO to Entity conversion preserves all fields
*For any* DossierDTO with values set for all new fields, when converted to a Dossier entity using the mapper, all field values should be correctly copied from the DTO to the entity.
**Validates: Requirements 12.1**

Property 3: Entity to DTO conversion preserves all fields
*For any* Dossier entity with values set for all new fields, when converted to a DossierViewDto using the mapper, all field values should be correctly copied from the entity to the DTO.
**Validates: Requirements 12.2**

Property 4: Update operation preserves all modified fields
*For any* existing Dossier, when any subset of the new fields is updated with new values and the dossier is saved and retrieved, all updated field values should reflect the new values while unchanged fields retain their original values.
**Validates: Requirements 12.5**

Property 5: JSON serialization includes all new fields
*For any* Dossier with values set for all new fields, when the dossier is serialized to JSON (via the REST API), the resulting JSON should contain all new field names and their corresponding values.
**Validates: Requirements 13.4**

Property 6: Update preserves existing fields when updating new fields
*For any* Dossier with values set for existing fields (codeDossier, codificationNationale, etc.), when only new fields are updated, all existing field values should remain unchanged after save and retrieval.
**Validates: Requirements 14.2**

## Error Handling

### Null Value Handling

Tous les nouveaux champs sont nullable pour maintenir la rétrocompatibilité:

- **Création**: Un dossier peut être créé avec des valeurs null pour tous les nouveaux champs
- **Lecture**: Les champs non renseignés retournent null
- **Mise à jour**: Les champs peuvent être mis à null explicitement
- **Validation**: Aucune validation de non-nullité au niveau JPA

### Type Conversion Errors

Les erreurs de conversion de type sont gérées par JPA:

- **LocalDate**: Si une date invalide est fournie, JPA lève une exception
- **Integer/Double**: Si une valeur non numérique est fournie, JPA lève une exception
- **String**: Aucune conversion nécessaire

### Database Schema Mismatch

Si le schéma de base de données ne correspond pas aux annotations JPA:

- **Colonne manquante**: JPA lève une exception au démarrage
- **Type incompatible**: JPA lève une exception lors de la lecture/écriture
- **Nom de colonne incorrect**: JPA lève une exception lors de la lecture/écriture

**Solution**: Utiliser `spring.jpa.hibernate.ddl-auto=update` pour mettre à jour automatiquement le schéma (en développement) ou créer des migrations Flyway/Liquibase (en production).

### Mapper Errors

Si le mapper MapStruct n'est pas correctement configuré:

- **Champ manquant**: Le champ reste null après conversion
- **Type incompatible**: Erreur de compilation MapStruct

**Solution**: Vérifier que tous les champs ont des noms identiques dans l'entité et les DTOs, ou ajouter des @Mapping explicites.

## Testing Strategy

### Dual Testing Approach

Cette feature nécessite à la fois des tests unitaires et des tests basés sur les propriétés:

**Unit Tests**: Pour tester des exemples spécifiques et des cas limites
- Création d'un dossier avec tous les champs remplis
- Création d'un dossier avec tous les champs null
- Lecture d'un dossier existant
- Mise à jour d'un dossier existant
- Vérification de la sérialisation JSON

**Property-Based Tests**: Pour tester les propriétés universelles
- Property 1: Database round-trip (100+ itérations avec données aléatoires)
- Property 2: DTO to Entity conversion (100+ itérations)
- Property 3: Entity to DTO conversion (100+ itérations)
- Property 4: Update preserves fields (100+ itérations)
- Property 5: JSON serialization (100+ itérations)
- Property 6: Update preserves existing fields (100+ itérations)

### Property-Based Testing Configuration

**Framework**: Utiliser une bibliothèque de property-based testing pour Java:
- **JUnit-Quickcheck**: Pour les tests basés sur JUnit
- **jqwik**: Alternative moderne avec meilleure intégration Spring Boot

**Configuration**:
- Minimum 100 itérations par test de propriété
- Génération aléatoire de valeurs pour tous les types (String, LocalDate, Integer, Double)
- Génération de cas limites (null, chaînes vides, dates extrêmes, nombres négatifs)

**Tag Format**: Chaque test de propriété doit référencer sa propriété du design:
```java
@Property
@Tag("Feature: complete-dossier-field-mapping, Property 1: Database round-trip preserves all new fields")
void testDatabaseRoundTrip(@ForAll Dossier dossier) {
    // Test implementation
}
```

### Test Coverage

**Champs à tester** (72 nouveaux champs):
- 12 champs parentaux
- 10 champs répondants
- 9 champs ARV
- 5 champs naissance
- 8 champs dépistage
- 7 champs soutien
- 7 champs PTME
- 4 champs ETP
- 2 champs vaccination
- 6 autres champs médicaux
- 2 champs socio-professionnels

**Scénarios de test**:
1. Tous les champs remplis
2. Tous les champs null
3. Mix de champs remplis et null
4. Mise à jour partielle
5. Mise à jour complète
6. Lecture après création
7. Lecture après mise à jour

### Integration Tests

En plus des tests unitaires et de propriétés, des tests d'intégration sont recommandés:

- **Test avec base de données réelle**: Utiliser @DataJpaTest avec une base H2 ou PostgreSQL
- **Test de l'API REST**: Utiliser @SpringBootTest avec MockMvc
- **Test de bout en bout**: Créer un dossier via l'API, le lire, le mettre à jour, vérifier les données

### Manual Testing

Certains aspects nécessitent des tests manuels:

- Vérification visuelle de la structure des DTOs
- Vérification de la migration de schéma en production
- Test de compatibilité avec les données existantes
- Test de performance avec de grandes quantités de données

