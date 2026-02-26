# Requirements: Fix Form Payload Missing Fields

## Feature Name
fix-form-payload-missing-fields

## Overview
The medical record forms (`FormulaireMultiEtapes.js` and `FormulaireCompletFusionne.js`) are not sending all required fields to the backend, resulting in incomplete medical records where many sections display as empty even though the backend correctly saves and retrieves data.

## Problem Statement
When creating a medical record (dossier médical), many fields are not included in the payload sent to the backend:
- Parent information (père/mère) - only partially sent
- Birth details (naissance) - not sent at all
- Vaccines - not sent
- PTME/Exposed child data - not sent
- Legal respondents (répondants légaux) - not sent
- Entry/Reference information - partially sent
- ARV treatment details - partially sent
- And many other fields

This causes the medical record view to show empty sections because the data was never sent to the backend in the first place.

## User Stories

### 1. Complete Parent Information
**As a** medical staff member  
**I want** to record complete parent information (both père and mère)  
**So that** the medical record contains all necessary family background

**Acceptance Criteria:**
- 1.1 All père fields are sent in payload: nomPrenoms, statut, niveauInstruction, profession, statutVih, telephone
- 1.2 All mère fields are sent in payload: nomPrenoms, statut, niveauInstruction, profession, statutVih, telephone
- 1.3 Parent information displays correctly in the medical record view

### 2. Complete Birth Information
**As a** medical staff member  
**I want** to record complete birth information for minor patients  
**So that** the medical record contains essential neonatal data

**Acceptance Criteria:**
- 2.1 All birth fields are sent in payload: naissanceStructure, poidsNaissance, tailleNaissance, perimetreCranien, apgar
- 2.2 Birth information displays correctly in the medical record view for minors (age ≤ 15)
- 2.3 Birth information is not displayed for adults (age > 15)

### 3. Complete Entry and Reference Information
**As a** medical staff member  
**I want** to record how the patient entered the system  
**So that** we can track referral sources and entry points

**Acceptance Criteria:**
- 3.1 All entry fields are sent in payload: portesEntree (array), reference, dateReference, siteOrigine
- 3.2 Entry/reference information displays correctly in the medical record view

### 4. Complete Vaccine Information
**As a** medical staff member  
**I want** to record vaccine history for minor patients  
**So that** we can track immunization status

**Acceptance Criteria:**
- 4.1 Vaccine fields are sent in payload: vaccins (array), autresVaccins
- 4.2 Vaccine information displays correctly in the medical record view for minors
- 4.3 Vaccine information is not displayed for adults

### 5. Complete PTME and Exposed Child Information
**As a** medical staff member  
**I want** to record PTME and exposed child data for minor patients  
**So that** we can track prevention of mother-to-child transmission

**Acceptance Criteria:**
- 5.1 All PTME child fields are sent in payload: enfantProphylaxieArvNaissance, enfantProphylaxieCotrimoxazole, enfantAlimentation (array), enfantSevrageAgeMois, enfantNumeroSeropositif
- 5.2 All PTME mother fields are sent in payload: mereTritherapieGrossesse
- 5.3 PTME information displays correctly in the medical record view for minors

### 6. Complete Legal Respondent Information
**As a** medical staff member  
**I want** to record legal respondent information for minor patients  
**So that** we have emergency contacts and legal guardians on record

**Acceptance Criteria:**
- 6.1 All respondent 1 fields are sent in payload: repondant1Nom, repondant1Lien, repondant1Niveau, repondant1Profession, repondant1Tel
- 6.2 All respondent 2 fields are sent in payload: repondant2Nom, repondant2Lien, repondant2Niveau, repondant2Profession, repondant2Tel
- 6.3 Respondent information displays correctly in the medical record view for minors

### 7. Complete ARV Treatment Information
**As a** medical staff member  
**I want** to record complete ARV treatment history  
**So that** we can track antiretroviral therapy

**Acceptance Criteria:**
- 7.1 All ARV fields are sent in payload: dateDebutArv, protocoleInitialArv, protocoleActuelArv, arvStadeOmsInitial
- 7.2 ARV treatment information displays correctly in the medical record view

### 8. Complete Medical History Information
**As a** medical staff member  
**I want** to record complete medical history  
**So that** we have comprehensive patient background

**Acceptance Criteria:**
- 8.1 All medical history fields are sent in payload: tuberculose, autresAnt, stadeOmsInitial (array)
- 8.2 Medical history displays correctly in the medical record view

### 9. Complete Contact and Support Information
**As a** medical staff member  
**I want** to record contact person and support network  
**So that** we can reach family members and support persons

**Acceptance Criteria:**
- 9.1 All contact fields are sent in payload: personneContact, telephoneContact
- 9.2 All support fields are sent in payload: soutienNom, soutienPrenoms, soutienLien, soutienTelephone, soutienAdresse
- 9.3 Contact and support information displays correctly in the medical record view

### 10. Complete TAR Treatment Information
**As a** medical staff member  
**I want** to record TAR (Traitement AntiRétroviral) information  
**So that** we can track current treatment protocols

**Acceptance Criteria:**
- 10.1 All TAR fields are sent in payload: stadeOms, dateDebutTar, protocoleInitialTar
- 10.2 TAR information displays correctly in the medical record view

### 11. Complete Social and Professional Information
**As a** medical staff member  
**I want** to record social and professional information for adult patients  
**So that** we have complete patient profiles

**Acceptance Criteria:**
- 11.1 All social fields are sent in payload: profession, statutFamilial
- 11.2 Social information displays correctly in the medical record view for adults
- 11.3 Enhanced social information is displayed for adults (age > 15)

### 12. Complete Chronic Disease Information
**As a** medical staff member  
**I want** to record chronic disease information  
**So that** we can track comorbidities

**Acceptance Criteria:**
- 12.1 Chronic disease fields are sent in payload: maladiesChroniques (array), autresMaladiesChroniques
- 12.2 Chronic disease information displays correctly in the medical record view

### 13. Complete PTME Pregnancy Information
**As a** medical staff member  
**I want** to record PTME pregnancy information  
**So that** we can track prevention efforts during pregnancy

**Acceptance Criteria:**
- 13.1 PTME pregnancy fields are sent in payload: nbGrossessesPtme, contraception, prep
- 13.2 PTME pregnancy information displays correctly in the medical record view

## Technical Requirements

### FormulaireMultiEtapes.js
- TR1: Add all missing fields to `donneesFormulaire` state initialization
- TR2: Update `handleSubmit` to include all fields in the payload
- TR3: Ensure all form inputs are properly bound to state
- TR4: Maintain localStorage persistence for all new fields

### FormulaireCompletFusionne.js
- TR5: Verify all fields are in `formData` state initialization
- TR6: Update `handleSubmit` to include all fields in the payload
- TR7: Ensure all form inputs are properly bound to state
- TR8: Remove hardcoded `codeDossier` value (should be auto-generated by backend)

### Payload Structure
- TR9: Payload must match the backend DTO structure exactly
- TR10: All fields must be sent even if empty (null or empty string)
- TR11: Arrays must be sent as empty arrays [] if no data, not null
- TR12: Date fields must be in ISO format (YYYY-MM-DD)

## Out of Scope
- Modifying backend code (already correct)
- Modifying DossierViewEnhanced.js (already correct)
- Adding new fields not in the backend DTO
- Changing the age threshold for minor/adult (already correct at 15 years)

## Dependencies
- Backend API: gestion_patient service (already correct)
- Frontend component: DossierViewEnhanced.js (already correct)
- Backend entities: Page.java, Dossier.java (already correct with proper JPA relations)

## Success Metrics
- All sections in the medical record view display data when forms are filled
- No null values for fields that were filled in the form
- Complete medical records can be created for both minors and adults
- All parent, birth, vaccine, PTME, and respondent information is saved and displayed

## Notes
- The backend correctly saves and retrieves all data with proper JPA cascading
- The frontend correctly displays all sections conditionally based on age
- The real issue is missing fields in the form payload, not code bugs in backend or display logic
- Age threshold for minor/adult is 15 years (≤15 = minor, >15 = adult)
