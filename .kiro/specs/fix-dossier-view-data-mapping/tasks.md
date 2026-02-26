# Implementation Plan: Fix DossierView Data Mapping

## Overview

This implementation plan addresses the data mapping issue in DossierView.js and DossierViewEnhanced.js components. The fix involves updating 5 DataTable instances in each component to correctly map JSON fields from the API response to table columns. The plan includes both implementation tasks and comprehensive testing with unit tests and property-based tests.

## Tasks

- [ ] 1. Fix Index Tests data mapping in both components
  - [ ] 1.1 Update DossierView.js indexTests DataTable mapping
    - Update headers to: ['Nom', 'Type', 'Âge', 'Sexe', 'Statut', 'Résultat']
    - Update data mapping to use: nom, type, age, sexe, statut, resultat fields
    - Ensure fallback values use '-' for missing fields
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [ ] 1.2 Update DossierViewEnhanced.js indexTests DataTable mapping
    - Apply identical mapping changes as DossierView.js
    - Ensure consistency between both components
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 6.1_
  
  - [ ]* 1.3 Write unit test for indexTests mapping
    - Test specific example with known indexTests data
    - Verify all 6 fields render correctly
    - Test edge case with empty array
    - Test edge case with null/undefined values
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [ ]* 1.4 Write property test for indexTests field completeness
    - **Property 1: Index Tests Field Mapping Completeness**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6**
    - Generate random indexTests objects with all 6 fields
    - Verify all fields appear in rendered output
    - Run minimum 100 iterations
    - Tag: `// Feature: fix-dossier-view-data-mapping, Property 1: Index Tests Field Mapping Completeness`

- [ ] 2. Fix Prise En Charge TB data mapping in both components
  - [ ] 2.1 Update DossierView.js priseEnChargeTbs DataTable mapping
    - Update headers to: ['Date', 'Début', 'Fin', 'Issue']
    - Update data mapping to use: date, debut, fin, issu fields
    - Ensure fallback values use '-' for missing fields
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 2.2 Update DossierViewEnhanced.js priseEnChargeTbs DataTable mapping
    - Apply identical mapping changes as DossierView.js
    - Ensure consistency between both components
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 6.1_
  
  - [ ]* 2.3 Write unit test for priseEnChargeTbs mapping
    - Test specific example with known TB treatment data
    - Verify all 4 fields render correctly
    - Test edge case with empty array
    - Test edge case with null/undefined values
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ]* 2.4 Write property test for priseEnChargeTbs field completeness
    - **Property 2: Prise En Charge TB Field Mapping Completeness**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
    - Generate random priseEnChargeTbs objects with all 4 fields
    - Verify all fields appear in rendered output
    - Run minimum 100 iterations
    - Tag: `// Feature: fix-dossier-view-data-mapping, Property 2: Prise En Charge TB Field Mapping Completeness`

- [ ] 3. Fix PTME data mapping in both components
  - [ ] 3.1 Update DossierView.js ptmes DataTable mapping
    - Update headers to: ['Date diagnostic', 'Rang CPN', 'Date probable accouchement', 'Issue']
    - Update data mapping to use: dateDiagnostic, rangCpn, dateProbableAcc, issue fields
    - Ensure fallback values use '-' for missing fields
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ] 3.2 Update DossierViewEnhanced.js ptmes DataTable mapping
    - Apply identical mapping changes as DossierView.js
    - Ensure consistency between both components
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 6.1_
  
  - [ ]* 3.3 Write unit test for ptmes mapping
    - Test specific example with known PTME data
    - Verify all 4 fields render correctly
    - Test edge case with empty array
    - Test edge case with null/undefined values
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ]* 3.4 Write property test for ptmes field completeness
    - **Property 3: PTME Field Mapping Completeness**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
    - Generate random ptmes objects with all 4 fields
    - Verify all fields appear in rendered output
    - Run minimum 100 iterations
    - Tag: `// Feature: fix-dossier-view-data-mapping, Property 3: PTME Field Mapping Completeness`

- [ ] 4. Checkpoint - Verify first three mappings
  - Ensure all tests pass for indexTests, priseEnChargeTbs, and ptmes mappings
  - Ask the user if questions arise

- [ ] 5. Fix Suivi Pathologique data mapping in both components
  - [ ] 5.1 Update DossierView.js suiviPathologiques DataTable mapping
    - Update headers to: ['Date', 'Taille', 'Poids', 'IMC', 'TA', 'Temp', 'Pouls', 'Rech TB', 'Rés TB', 'TPT', 'Autres Path', 'Cotrimox']
    - Update data mapping to use: date, taille, poids, imc, ta, temperature, pouls, rechercheTB, resultatTB, tpt, autresPathologies, cotrimoxazole fields
    - Ensure fallback values use '-' for missing fields
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 4.12_
  
  - [ ] 5.2 Update DossierViewEnhanced.js suiviPathologiques DataTable mapping
    - Apply identical mapping changes as DossierView.js
    - Ensure consistency between both components
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 4.12, 6.1_
  
  - [ ]* 5.3 Write unit test for suiviPathologiques mapping
    - Test specific example with known pathological follow-up data
    - Verify all 12 fields render correctly
    - Test edge case with empty array
    - Test edge case with null/undefined values
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 4.12_
  
  - [ ]* 5.4 Write property test for suiviPathologiques field completeness
    - **Property 4: Suivi Pathologique Field Mapping Completeness**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 4.12**
    - Generate random suiviPathologiques objects with all 12 fields
    - Verify all fields appear in rendered output
    - Run minimum 100 iterations
    - Tag: `// Feature: fix-dossier-view-data-mapping, Property 4: Suivi Pathologique Field Mapping Completeness`

- [ ] 6. Fix Depistage Familial data mapping in both components
  - [ ] 6.1 Update DossierView.js depistageFamiliales DataTable mapping
    - Update headers to: ['Nom', 'Type', 'Âge', 'Sexe', 'Statut', 'Résultat', 'Soins', 'Identifiant']
    - Update data mapping to use: nom, type, age, sexe, statut, resultat, soins, identifiant fields
    - Ensure fallback values use '-' for missing fields
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_
  
  - [ ] 6.2 Update DossierViewEnhanced.js depistageFamiliales DataTable mapping
    - Apply identical mapping changes as DossierView.js
    - Ensure consistency between both components
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 6.1_
  
  - [ ]* 6.3 Write unit test for depistageFamiliales mapping
    - Test specific example with known family screening data
    - Verify all 8 fields render correctly
    - Test edge case with empty array
    - Test edge case with null/undefined values
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_
  
  - [ ]* 6.4 Write property test for depistageFamiliales field completeness
    - **Property 5: Depistage Familial Field Mapping Completeness**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8**
    - Generate random depistageFamiliales objects with all 8 fields
    - Verify all fields appear in rendered output
    - Run minimum 100 iterations
    - Tag: `// Feature: fix-dossier-view-data-mapping, Property 5: Depistage Familial Field Mapping Completeness`

- [ ] 7. Setup testing infrastructure
  - [ ] 7.1 Install fast-check library for property-based testing
    - Run: `npm install --save-dev fast-check`
    - Verify installation in package.json
  
  - [ ] 7.2 Create test file structure
    - Create test file: `a_reference_front/src/components/__tests__/DossierView.test.js`
    - Create test file: `a_reference_front/src/components/__tests__/DossierViewEnhanced.test.js`
    - Setup React Testing Library imports
    - Setup fast-check imports

- [ ]* 8. Write cross-component consistency tests
  - [ ]* 8.1 Write unit test for component consistency
    - Render both DossierView and DossierViewEnhanced with identical data
    - Verify both produce identical table outputs
    - _Requirements: 6.1_
  
  - [ ]* 8.2 Write property test for missing field fallback behavior
    - **Property 6: Missing Field Fallback Behavior**
    - **Validates: Requirements 6.3**
    - Generate random data objects with randomly missing fields
    - Verify missing fields display "-" or "Non renseigné"
    - Test across all 5 table types
    - Run minimum 100 iterations
    - Tag: `// Feature: fix-dossier-view-data-mapping, Property 6: Missing Field Fallback Behavior`

- [ ] 9. Final checkpoint - Run all tests and validate
  - Run all unit tests: `npm test`
  - Run all property-based tests
  - Ensure all tests pass
  - Verify no console errors or warnings
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties with minimum 100 iterations
- Unit tests validate specific examples and edge cases
- Both DossierView.js and DossierViewEnhanced.js must be updated identically
- All 5 DataTable instances in each component need fixing (10 total updates)
- Testing uses React Testing Library with fast-check for property-based testing
