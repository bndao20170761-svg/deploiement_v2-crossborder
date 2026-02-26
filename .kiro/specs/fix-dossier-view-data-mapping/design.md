# Design Document: Fix DossierView Data Mapping

## Overview

This design addresses the data mapping issue in the DossierView and DossierViewEnhanced React components. Currently, most fields display "Non renseigné" (Not filled) because the components are attempting to access JSON fields that don't exist in the API response. The solution involves updating the DataTable mappings to correctly reference the actual field names returned by the API.

The fix is straightforward: update the data transformation functions in each DataTable to map the correct JSON fields from the API response to the table columns.

## Architecture

### Current Architecture

Both components follow the same pattern:
1. Fetch dossier data from API endpoint: `/api/dossiers/{codePatient}`
2. Extract the first page: `dossier.pages[0]`
3. Render multiple sections with DataTable components
4. Each DataTable transforms array data into table rows

### Problem Analysis

The DataTable components are trying to access fields that don't exist in the API response:

**indexTests**: Trying to access `t.date`, `t.observations` but JSON has `nom`, `type`, `statut`, `resultat`, `age`, `sexe`

**priseEnChargeTbs**: Trying to access `tb.typeTb`, `tb.traitement`, `tb.resultat` but JSON has `date`, `debut`, `fin`, `issu`

**ptmes**: Trying to access `p.observations` but JSON doesn't have this field (has `dateDiagnostic`, `rangCpn`, `dateProbableAcc`, `issue`)

**suiviPathologiques**: Trying to access `s.pathologie`, `s.traitement`, `s.evolution` but JSON has `date`, `taille`, `poids`, `imc`, `ta`, `temperature`, `pouls`, `rechercheTB`, `resultatTB`, `tpt`, `autresPathologies`, `cotrimoxazole`

**depistageFamiliales**: Trying to access `d.date`, `d.membreFamille`, `d.lien`, `d.priseEnCharge` but JSON has `nom`, `type`, `age`, `sexe`, `statut`, `resultat`, `soins`, `identifiant`

## Components and Interfaces

### Affected Components

1. **DossierView.js** (`a_reference_front/src/components/DossierView.js`)
   - Main dossier display component
   - Contains 5 DataTable instances that need fixing

2. **DossierViewEnhanced.js** (`a_reference_front/src/components/DossierViewEnhanced.js`)
   - Enhanced version with age-based conditional rendering
   - Contains the same 5 DataTable instances that need fixing

### DataTable Component Interface

```javascript
<DataTable
  headers={['Column1', 'Column2', ...]}
  data={arrayData.map(item => ({
    col1: item.field1 || '-',
    col2: item.field2 || '-',
    ...
  }))}
  emptyMessage="No data message"
/>
```

The `data` prop expects an array of objects where each object represents a table row, and the object values become the table cells.

## Data Models

### API Response Structure

```javascript
{
  "codeDossier": "string",
  "codePatient": "string",
  "nomComplet": "string",
  "doctorCreateNom": "string",
  "identificationBiom": "base64string",
  "pages": [{
    // Index Tests
    "indexTests": [{
      "id": number,
      "nom": "string",
      "type": "string",
      "age": number,
      "sexe": "string",
      "statut": "string",
      "resultat": "string",
      "soins": "string",
      "identifiant": "string"
    }],
    
    // Prise en charge TB
    "priseEnChargeTbs": [{
      "id": number,
      "date": "YYYY-MM-DD",
      "debut": "YYYY-MM-DD",
      "fin": "YYYY-MM-DD",
      "issu": "string"
    }],
    
    // PTME
    "ptmes": [{
      "id": number,
      "dateDiagnostic": "YYYY-MM-DD",
      "rangCpn": "string",
      "dateProbableAcc": "YYYY-MM-DD",
      "issue": "string"
    }],
    
    // Suivi Pathologique
    "suiviPathologiques": [{
      "id": number,
      "date": "YYYY-MM-DD",
      "taille": "string",
      "poids": "string",
      "imc": "string",
      "ta": "string",
      "temperature": "string",
      "pouls": "string",
      "rechercheTB": "string",
      "resultatTB": "string",
      "tpt": "string",
      "autresPathologies": "string",
      "cotrimoxazole": "string"
    }],
    
    // Depistage Familial
    "depistageFamiliales": [{
      "id": number,
      "nom": "string",
      "type": "string",
      "age": number,
      "sexe": "string",
      "statut": "string",
      "resultat": "string",
      "soins": "string",
      "identifiant": "string"
    }]
  }]
}
```

### Mapping Corrections

#### 1. Index Tests Mapping

**Current (incorrect)**:
```javascript
headers={['Date', 'Type', 'Résultat', 'Observations']}
data={page.indexTests.map(t => ({
  date: t.date || '-',
  type: t.type || '-',
  resultat: t.resultat || '-',
  observations: t.observations || '-'
}))}
```

**Corrected**:
```javascript
headers={['Nom', 'Type', 'Âge', 'Sexe', 'Statut', 'Résultat']}
data={page.indexTests.map(t => ({
  nom: t.nom || '-',
  type: t.type || '-',
  age: t.age || '-',
  sexe: t.sexe || '-',
  statut: t.statut || '-',
  resultat: t.resultat || '-'
}))}
```

#### 2. Prise En Charge TB Mapping

**Current (incorrect)**:
```javascript
headers={['Date', 'Type TB', 'Traitement', 'Résultat']}
data={page.priseEnChargeTbs.map(tb => ({
  date: tb.dateDebut || '-',
  type: tb.typeTb || '-',
  traitement: tb.traitement || '-',
  resultat: tb.resultat || '-'
}))}
```

**Corrected**:
```javascript
headers={['Date', 'Début', 'Fin', 'Issue']}
data={page.priseEnChargeTbs.map(tb => ({
  date: tb.date || '-',
  debut: tb.debut || '-',
  fin: tb.fin || '-',
  issu: tb.issu || '-'
}))}
```

#### 3. PTME Mapping

**Current (incorrect)**:
```javascript
headers={['Date diagnostic', 'Issue', 'Observations']}
data={page.ptmes.map(p => ({
  dateDiagnostic: p.dateDiagnostic || '-',
  issue: p.issue || '-',
  observations: p.observations || '-'
}))}
```

**Corrected**:
```javascript
headers={['Date diagnostic', 'Rang CPN', 'Date probable accouchement', 'Issue']}
data={page.ptmes.map(p => ({
  dateDiagnostic: p.dateDiagnostic || '-',
  rangCpn: p.rangCpn || '-',
  dateProbableAcc: p.dateProbableAcc || '-',
  issue: p.issue || '-'
}))}
```

#### 4. Suivi Pathologique Mapping

**Current (incorrect)**:
```javascript
headers={['Date', 'Pathologie', 'Traitement', 'Évolution']}
data={page.suiviPathologiques.map(s => ({
  date: s.date || '-',
  pathologie: s.pathologie || '-',
  traitement: s.traitement || '-',
  evolution: s.evolution || '-'
}))}
```

**Corrected**:
```javascript
headers={['Date', 'Taille', 'Poids', 'IMC', 'TA', 'Temp', 'Pouls', 'Rech TB', 'Rés TB', 'TPT', 'Autres Path', 'Cotrimox']}
data={page.suiviPathologiques.map(s => ({
  date: s.date || '-',
  taille: s.taille || '-',
  poids: s.poids || '-',
  imc: s.imc || '-',
  ta: s.ta || '-',
  temperature: s.temperature || '-',
  pouls: s.pouls || '-',
  rechercheTB: s.rechercheTB || '-',
  resultatTB: s.resultatTB || '-',
  tpt: s.tpt || '-',
  autresPathologies: s.autresPathologies || '-',
  cotrimoxazole: s.cotrimoxazole || '-'
}))}
```

#### 5. Depistage Familial Mapping

**Current (incorrect)**:
```javascript
headers={['Date', 'Membre famille', 'Lien', 'Résultat', 'Prise en charge']}
data={page.depistageFamiliales.map(d => ({
  date: d.date || '-',
  membre: d.membreFamille || '-',
  lien: d.lien || '-',
  resultat: d.resultat || '-',
  priseEnCharge: d.priseEnCharge || '-'
}))}
```

**Corrected**:
```javascript
headers={['Nom', 'Type', 'Âge', 'Sexe', 'Statut', 'Résultat', 'Soins', 'Identifiant']}
data={page.depistageFamiliales.map(d => ({
  nom: d.nom || '-',
  type: d.type || '-',
  age: d.age || '-',
  sexe: d.sexe || '-',
  statut: d.statut || '-',
  resultat: d.resultat || '-',
  soins: d.soins || '-',
  identifiant: d.identifiant || '-'
}))}
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Index Tests Field Mapping Completeness

*For any* indexTests data object with fields (nom, type, age, sexe, statut, resultat), when rendered by the DataTable component, all six fields should be present in the rendered table output.

**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6**

### Property 2: Prise En Charge TB Field Mapping Completeness

*For any* priseEnChargeTbs data object with fields (date, debut, fin, issu), when rendered by the DataTable component, all four fields should be present in the rendered table output.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

### Property 3: PTME Field Mapping Completeness

*For any* ptmes data object with fields (dateDiagnostic, rangCpn, dateProbableAcc, issue), when rendered by the DataTable component, all four fields should be present in the rendered table output.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Property 4: Suivi Pathologique Field Mapping Completeness

*For any* suiviPathologiques data object with fields (date, taille, poids, imc, ta, temperature, pouls, rechercheTB, resultatTB, tpt, autresPathologies, cotrimoxazole), when rendered by the DataTable component, all twelve fields should be present in the rendered table output.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 4.12**

### Property 5: Depistage Familial Field Mapping Completeness

*For any* depistageFamiliales data object with fields (nom, type, age, sexe, statut, resultat, soins, identifiant), when rendered by the DataTable component, all eight fields should be present in the rendered table output.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8**

### Property 6: Missing Field Fallback Behavior

*For any* data object with one or more missing fields, when rendered by the DataTable component, each missing field should display either a dash ("-") or "Non renseigné" placeholder in the table cell.

**Validates: Requirements 6.3**

## Error Handling

### Missing Data Handling

The DataTable component already implements proper fallback behavior using the nullish coalescing operator:

```javascript
fieldValue: item.fieldName || '-'
```

This ensures that:
- `null` values display as "-"
- `undefined` values display as "-"
- Empty strings display as "-"
- Valid values display as-is

### Empty Array Handling

The DataTable component checks for empty arrays before rendering:

```javascript
if (!data || data.length === 0) {
  return <p className="text-gray-500 italic">{emptyMessage}</p>;
}
```

This prevents rendering errors when no data is available.

### API Response Validation

The components check for the existence of `dossier.pages[0]` before attempting to access nested data:

```javascript
const page = dossier.pages?.[0];

if (page && page.indexTests && page.indexTests.length > 0) {
  // Render table
}
```

This prevents runtime errors when the API response structure is incomplete.

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests** should focus on:
- Specific examples of correct field mapping for each table type
- Edge cases like empty arrays, null values, undefined fields
- Integration between components and DataTable
- Rendering behavior with missing data

**Property-Based Tests** should focus on:
- Universal properties that hold for all possible data inputs
- Field mapping completeness across randomized data
- Fallback behavior with randomly missing fields
- Consistency between DossierView and DossierViewEnhanced

### Property-Based Testing Configuration

For this feature, we will use **React Testing Library** with **fast-check** (JavaScript property-based testing library).

Each property test must:
- Run a minimum of 100 iterations (due to randomization)
- Reference its design document property using a comment tag
- Tag format: `// Feature: fix-dossier-view-data-mapping, Property {number}: {property_text}`

### Test Implementation Guidelines

**For Property 1 (Index Tests)**:
- Generate random indexTests objects with all required fields
- Render the component with this data
- Assert that all 6 fields appear in the rendered output
- Tag: `// Feature: fix-dossier-view-data-mapping, Property 1: Index Tests Field Mapping Completeness`

**For Property 2 (Prise En Charge TB)**:
- Generate random priseEnChargeTbs objects with all required fields
- Render the component with this data
- Assert that all 4 fields appear in the rendered output
- Tag: `// Feature: fix-dossier-view-data-mapping, Property 2: Prise En Charge TB Field Mapping Completeness`

**For Property 3 (PTME)**:
- Generate random ptmes objects with all required fields
- Render the component with this data
- Assert that all 4 fields appear in the rendered output
- Tag: `// Feature: fix-dossier-view-data-mapping, Property 3: PTME Field Mapping Completeness`

**For Property 4 (Suivi Pathologique)**:
- Generate random suiviPathologiques objects with all required fields
- Render the component with this data
- Assert that all 12 fields appear in the rendered output
- Tag: `// Feature: fix-dossier-view-data-mapping, Property 4: Suivi Pathologique Field Mapping Completeness`

**For Property 5 (Depistage Familial)**:
- Generate random depistageFamiliales objects with all required fields
- Render the component with this data
- Assert that all 8 fields appear in the rendered output
- Tag: `// Feature: fix-dossier-view-data-mapping, Property 5: Depistage Familial Field Mapping Completeness`

**For Property 6 (Missing Field Fallback)**:
- Generate random data objects with randomly missing fields
- Render the component with this data
- Assert that missing fields display "-" or "Non renseigné"
- Tag: `// Feature: fix-dossier-view-data-mapping, Property 6: Missing Field Fallback Behavior`

### Unit Test Coverage

Unit tests should cover:
1. Specific example of indexTests with known values
2. Specific example of priseEnChargeTbs with known values
3. Specific example of ptmes with known values
4. Specific example of suiviPathologiques with known values
5. Specific example of depistageFamiliales with known values
6. Edge case: empty arrays for each table type
7. Edge case: null/undefined values in data objects
8. Integration: DossierView and DossierViewEnhanced produce identical output for same data

### Testing Balance

- Unit tests provide concrete examples and catch specific bugs
- Property tests verify universal correctness across all inputs
- Together they ensure both specific correctness and general robustness
- Focus property tests on the 6 core properties identified
- Keep unit tests focused on specific examples and edge cases
