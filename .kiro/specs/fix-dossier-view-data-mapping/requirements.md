# Requirements Document

## Introduction

This specification addresses the data mapping issue in the DossierView and DossierViewEnhanced components where most fields display "Non renseigné" (Not filled) despite the JSON response containing rich data. The components are not correctly mapping the JSON structure from the API to the display tables.

## Glossary

- **DossierView**: The React component responsible for displaying patient medical records
- **DossierViewEnhanced**: An enhanced version of DossierView with age-based conditional rendering
- **DataTable**: A reusable table component that displays structured data
- **API_Response**: The JSON data structure returned by the dossier API endpoint
- **Field_Mapping**: The correspondence between JSON field names and display columns

## Requirements

### Requirement 1: Index Tests Data Mapping

**User Story:** As a medical professional, I want to view index test data correctly, so that I can see test names, types, statuses, and results for patient screening.

#### Acceptance Criteria

1. WHEN the API returns indexTests data, THE DossierView SHALL display the nom field in the table
2. WHEN the API returns indexTests data, THE DossierView SHALL display the type field in the table
3. WHEN the API returns indexTests data, THE DossierView SHALL display the statut field in the table
4. WHEN the API returns indexTests data, THE DossierView SHALL display the resultat field in the table
5. WHEN the API returns indexTests data, THE DossierView SHALL display the age field in the table
6. WHEN the API returns indexTests data, THE DossierView SHALL display the sexe field in the table

### Requirement 2: Prise En Charge TB Data Mapping

**User Story:** As a medical professional, I want to view tuberculosis treatment data correctly, so that I can track TB diagnosis dates, treatment periods, and outcomes.

#### Acceptance Criteria

1. WHEN the API returns priseEnChargeTbs data, THE DossierView SHALL display the date field in the table
2. WHEN the API returns priseEnChargeTbs data, THE DossierView SHALL display the debut field (treatment start date) in the table
3. WHEN the API returns priseEnChargeTbs data, THE DossierView SHALL display the fin field (treatment end date) in the table
4. WHEN the API returns priseEnChargeTbs data, THE DossierView SHALL display the issu field (outcome) in the table

### Requirement 3: PTME Data Mapping

**User Story:** As a medical professional, I want to view PTME (Prevention of Mother-to-Child Transmission) data correctly, so that I can track pregnancy diagnoses and outcomes.

#### Acceptance Criteria

1. WHEN the API returns ptmes data, THE DossierView SHALL display the dateDiagnostic field in the table
2. WHEN the API returns ptmes data, THE DossierView SHALL display the rangCpn field in the table
3. WHEN the API returns ptmes data, THE DossierView SHALL display the dateProbableAcc field in the table
4. WHEN the API returns ptmes data, THE DossierView SHALL display the issue field (outcome) in the table

### Requirement 4: Suivi Pathologique Data Mapping

**User Story:** As a medical professional, I want to view pathological follow-up data correctly, so that I can track patient vital signs and health indicators over time.

#### Acceptance Criteria

1. WHEN the API returns suiviPathologiques data, THE DossierView SHALL display the date field in the table
2. WHEN the API returns suiviPathologiques data, THE DossierView SHALL display the taille field (height) in the table
3. WHEN the API returns suiviPathologiques data, THE DossierView SHALL display the poids field (weight) in the table
4. WHEN the API returns suiviPathologiques data, THE DossierView SHALL display the imc field (BMI) in the table
5. WHEN the API returns suiviPathologiques data, THE DossierView SHALL display the ta field (blood pressure) in the table
6. WHEN the API returns suiviPathologiques data, THE DossierView SHALL display the temperature field in the table
7. WHEN the API returns suiviPathologiques data, THE DossierView SHALL display the pouls field (pulse) in the table
8. WHEN the API returns suiviPathologiques data, THE DossierView SHALL display the rechercheTB field (TB screening) in the table
9. WHEN the API returns suiviPathologiques data, THE DossierView SHALL display the resultatTB field (TB result) in the table
10. WHEN the API returns suiviPathologiques data, THE DossierView SHALL display the tpt field in the table
11. WHEN the API returns suiviPathologiques data, THE DossierView SHALL display the autresPathologies field (other pathologies) in the table
12. WHEN the API returns suiviPathologiques data, THE DossierView SHALL display the cotrimoxazole field in the table

### Requirement 5: Depistage Familial Data Mapping

**User Story:** As a medical professional, I want to view family screening data correctly, so that I can track HIV testing results for family members.

#### Acceptance Criteria

1. WHEN the API returns depistageFamiliales data, THE DossierView SHALL display the nom field (test name) in the table
2. WHEN the API returns depistageFamiliales data, THE DossierView SHALL display the type field in the table
3. WHEN the API returns depistageFamiliales data, THE DossierView SHALL display the age field in the table
4. WHEN the API returns depistageFamiliales data, THE DossierView SHALL display the sexe field (gender) in the table
5. WHEN the API returns depistageFamiliales data, THE DossierView SHALL display the statut field in the table
6. WHEN the API returns depistageFamiliales data, THE DossierView SHALL display the resultat field (test result) in the table
7. WHEN the API returns depistageFamiliales data, THE DossierView SHALL display the soins field (care) in the table
8. WHEN the API returns depistageFamiliales data, THE DossierView SHALL display the identifiant field in the table

### Requirement 6: Component Consistency

**User Story:** As a developer, I want both DossierView and DossierViewEnhanced components to use the same data mappings, so that data displays consistently across the application.

#### Acceptance Criteria

1. WHEN data mapping is updated in DossierView, THE same mappings SHALL be applied to DossierViewEnhanced
2. WHEN a table displays data, THE component SHALL use field names that exist in the API response
3. WHEN a field is missing from the API response, THE component SHALL display a dash (-) or "Non renseigné" placeholder
