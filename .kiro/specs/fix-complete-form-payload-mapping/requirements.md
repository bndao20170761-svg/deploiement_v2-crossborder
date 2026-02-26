# Requirements Document

## Introduction

This specification addresses a critical data loss issue in the dossier creation form where comprehensive patient data collected through the frontend form is not being transmitted to the backend API. The form (`FormulaireCompletFusionne.js`) collects extensive patient information across 16 steps, but the `handleSubmit()` function only maps a small subset of fields to the API payload, resulting in approximately 90% of collected data being lost during submission.

## Glossary

- **Form_Component**: The React component `FormulaireCompletFusionne.js` that collects patient data
- **Payload**: The JSON object sent to the backend API containing patient data
- **PageDTO**: The backend Data Transfer Object that defines the expected structure for patient page data
- **Page_Entity**: The JPA entity that persists patient page data to the database
- **FormData**: The React state object containing all collected form field values
- **HandleSubmit**: The function responsible for constructing the payload and submitting it to the API

## Requirements

### Requirement 1: Complete Parent Information Mapping

**User Story:** As a healthcare worker, I want all parent information I enter in the form to be saved to the database, so that I have complete family medical history.

#### Acceptance Criteria

1. WHEN the form is submitted, THE System SHALL include `pereNiveauInstruction` in the payload
2. WHEN the form is submitted, THE System SHALL include `pereStatutVih` in the payload
3. WHEN the form is submitted, THE System SHALL include `pereTelephone` in the payload
4. WHEN the form is submitted, THE System SHALL include `mereNiveauInstruction` in the payload
5. WHEN the form is submitted, THE System SHALL include `mereProfession` in the payload
6. WHEN the form is submitted, THE System SHALL include `mereStatutVih` in the payload
7. WHEN the form is submitted, THE System SHALL include `mereTelephone` in the payload

### Requirement 2: Complete Birth Information Mapping

**User Story:** As a healthcare worker, I want all birth-related information I enter to be saved, so that I have complete neonatal records.

#### Acceptance Criteria

1. WHEN the form is submitted, THE System SHALL include `naissanceStructure` in the payload
2. WHEN the form is submitted, THE System SHALL include `poidsNaissance` in the payload
3. WHEN the form is submitted, THE System SHALL include `tailleNaissance` in the payload
4. WHEN the form is submitted, THE System SHALL include `perimetreCranien` in the payload
5. WHEN the form is submitted, THE System SHALL include `apgar` in the payload
6. WHEN the form is submitted, THE System SHALL include `portesEntree` array in the payload
7. WHEN the form is submitted, THE System SHALL include `reference` in the payload
8. WHEN the form is submitted, THE System SHALL include `dateReference` in the payload
9. WHEN the form is submitted, THE System SHALL include `siteOrigine` in the payload

### Requirement 3: Complete Education and Vaccination Mapping

**User Story:** As a healthcare worker, I want therapeutic education and vaccination data to be saved, so that I can track patient education progress and immunization status.

#### Acceptance Criteria

1. WHEN the form is submitted, THE System SHALL include `dateDebutETP` in the payload
2. WHEN the form is submitted, THE System SHALL include `ageETP` in the payload
3. WHEN the form is submitted, THE System SHALL include `annonceComplete` in the payload
4. WHEN the form is submitted, THE System SHALL include `ageAnnonce` in the payload
5. WHEN the form is submitted, THE System SHALL include `vaccins` array in the payload
6. WHEN the form is submitted, THE System SHALL include `autresVaccins` in the payload

### Requirement 4: Complete PMTCT (PTME) Child Information Mapping

**User Story:** As a healthcare worker, I want all exposed child information to be saved, so that I can properly track prevention of mother-to-child transmission cases.

#### Acceptance Criteria

1. WHEN the form is submitted, THE System SHALL include `enfantProphylaxieArvNaissance` in the payload
2. WHEN the form is submitted, THE System SHALL include `enfantProphylaxieCotrimoxazole` in the payload
3. WHEN the form is submitted, THE System SHALL include `enfantAlimentation` array in the payload
4. WHEN the form is submitted, THE System SHALL include `enfantSevrageAgeMois` in the payload
5. WHEN the form is submitted, THE System SHALL include `enfantNumeroSeropositif` in the payload

### Requirement 5: Complete Mother ARV Information Mapping

**User Story:** As a healthcare worker, I want mother's ARV treatment information to be saved, so that I can track treatment history for PMTCT cases.

#### Acceptance Criteria

1. WHEN the form is submitted, THE System SHALL include `mereTritherapieGrossesse` in the payload
2. WHEN the form is submitted, THE System SHALL include `dateDebutARV` in the payload
3. WHEN the form is submitted, THE System SHALL include `protocoleInitialArv` in the payload
4. WHEN the form is submitted, THE System SHALL include `protocoleActuelArv` in the payload

### Requirement 6: Complete Legal Guardian Information Mapping

**User Story:** As a healthcare worker, I want all legal guardian information to be saved, so that I can contact responsible parties for minor patients.

#### Acceptance Criteria

1. WHEN the form is submitted, THE System SHALL include `repondant1Nom` in the payload
2. WHEN the form is submitted, THE System SHALL include `repondant1Lien` in the payload
3. WHEN the form is submitted, THE System SHALL include `repondant1Niveau` in the payload
4. WHEN the form is submitted, THE System SHALL include `repondant1Profession` in the payload
5. WHEN the form is submitted, THE System SHALL include `repondant1Tel` in the payload
6. WHEN the form is submitted, THE System SHALL include `repondant2Nom` in the payload
7. WHEN the form is submitted, THE System SHALL include `repondant2Lien` in the payload
8. WHEN the form is submitted, THE System SHALL include `repondant2Niveau` in the payload
9. WHEN the form is submitted, THE System SHALL include `repondant2Profession` in the payload
10. WHEN the form is submitted, THE System SHALL include `repondant2Tel` in the payload

### Requirement 7: Complete Medical History Mapping

**User Story:** As a healthcare worker, I want all medical history and WHO staging information to be saved, so that I have complete clinical context for treatment decisions.

#### Acceptance Criteria

1. WHEN the form is submitted, THE System SHALL include `arvStadeOmsInitial` in the payload
2. WHEN the form is submitted, THE System SHALL include `protocole` in the payload
3. WHEN the form is submitted, THE System SHALL include `stadeOmsInitial` array in the payload
4. WHEN the form is submitted, THE System SHALL include `tuberculose` in the payload
5. WHEN the form is submitted, THE System SHALL include `autresAnt` in the payload

### Requirement 8: Complete Clinical Information Mapping

**User Story:** As a healthcare worker, I want all clinical assessment data to be saved, so that I have complete patient clinical profiles.

#### Acceptance Criteria

1. WHEN the form is submitted, THE System SHALL include `renseignementClinique.poidsKg` in the payload
2. WHEN the form is submitted, THE System SHALL include `renseignementClinique.traitementARV` in the payload
3. WHEN the form is submitted, THE System SHALL include `renseignementClinique.traitementtb` in the payload
4. WHEN the form is submitted, THE System SHALL include `renseignementClinique.allergie` in the payload
5. WHEN the form is submitted, THE System SHALL include `renseignementClinique.aghbs` in the payload
6. WHEN the form is submitted, THE System SHALL include `renseignementClinique.cd4DebutTraitement` in the payload
7. WHEN the form is submitted, THE System SHALL include `renseignementClinique.cd4Dernier` in the payload
8. WHEN the form is submitted, THE System SHALL include `renseignementClinique.chargeViraleNiveau` in the payload
9. WHEN the form is submitted, THE System SHALL include `renseignementClinique.profils` object in the payload
10. WHEN the form is submitted, THE System SHALL include `renseignementClinique.stades` object in the payload

### Requirement 9: Payload Structure Consistency

**User Story:** As a backend developer, I want the frontend payload to match the PageDTO structure exactly, so that data mapping is predictable and maintainable.

#### Acceptance Criteria

1. WHEN the payload is constructed, THE System SHALL use field names that match PageDTO property names exactly
2. WHEN the payload is constructed, THE System SHALL use data types that match PageDTO property types
3. WHEN array fields are mapped, THE System SHALL preserve array structure as defined in PageDTO
4. WHEN nested objects are mapped, THE System SHALL flatten them to match PageDTO structure if PageDTO does not support nesting

### Requirement 10: Data Integrity Validation

**User Story:** As a system administrator, I want to ensure no form data is lost during submission, so that the database contains complete patient records.

#### Acceptance Criteria

1. WHEN comparing formData to payload, THE System SHALL include all non-null formData fields in the payload
2. WHEN the form is submitted, THE System SHALL log any formData fields that are not included in the payload
3. WHEN the payload is constructed, THE System SHALL validate that all PageDTO-compatible fields from formData are present
