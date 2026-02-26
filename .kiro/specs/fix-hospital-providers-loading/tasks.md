# Implementation Plan: Fix Hospital Providers Loading

## Overview

This implementation plan addresses the unreliable loading of providers (prestataires) when editing a hospital in the HospitalForm component. The solution simplifies the architecture by using the backend endpoint `/api/hospitaux/{id}/prestataires-only` as the single source of truth, removing localStorage dependencies and complex fallback logic.

The implementation focuses on:
1. Adding explicit provider loading logic with proper state management
2. Implementing loading indicators and error handling
3. Removing obsolete localStorage code
4. Ensuring proper separation between creation and edit modes

## Tasks

- [ ] 1. Add provider loading state management
  - [ ] 1.1 Add new state variables for loading and error handling
    - Add `isLoadingProviders` state (boolean) to track loading status
    - Add `providersLoadError` state (string | null) to store error messages
    - Remove obsolete `hospitalProvidersCache` state variable
    - _Requirements: 1.5, 3.1, 3.2, 3.4_

  - [ ] 1.2 Implement the `loadProviders` function
    - Create async function that accepts `hospitalId` parameter
    - Set loading state to true at start, false in finally block
    - Make GET request to `/api/hospitaux/{hospitalId}/prestataires-only` endpoint
    - Include Authorization header with Bearer token from localStorage
    - Handle HTTP errors (4xx, 5xx) and network errors separately
    - Call `mapProvidersFromBackend` to transform response data
    - Update `providers` state with mapped data on success
    - Set error state with descriptive message on failure
    - Log errors to console for debugging
    - _Requirements: 1.1, 1.2, 2.1, 2.4, 3.1, 3.2, 3.4, 3.5_

  - [ ] 1.3 Implement the `mapProvidersFromBackend` function
    - Create function that accepts array of backend provider DTOs
    - Map each provider to frontend format with all required fields
    - Handle missing fields with fallback values (empty strings)
    - Generate temporary IDs for providers without IDs (Date.now() + Math.random())
    - Parse `nom` field to extract `nom_prestataire` and `prenom` if needed
    - Convert `type` to lowercase with hyphens (e.g., 'MEDECIN_PEC' → 'medecin-pec')
    - Return array of mapped providers
    - _Requirements: 1.2, 2.4_

  - [ ] 1.4 Implement the `retryLoadProviders` function
    - Create function that checks if `initialData.id` exists
    - Call `loadProviders` with the hospital ID if present
    - This function will be used by the error UI retry button
    - _Requirements: 3.3_

- [ ] 2. Update useEffect to implement new loading logic
  - [ ] 2.1 Modify the useEffect hook for initialData
    - Keep existing logic for loading hospital info and services
    - Add conditional check: if `initialData.id` exists (edit mode), call `loadProviders(initialData.id)`
    - If `initialData.id` does not exist (creation mode), set `providers` to empty array
    - Remove any references to localStorage provider loading
    - Remove any references to `initialData.prestataires` for provider initialization
    - Ensure providers are loaded BEFORE displaying the form to user
    - _Requirements: 1.1, 1.4, 2.1, 2.2, 2.3, 2.5, 6.1, 6.3, 6.4_

- [ ] 3. Create UI components for loading states
  - [ ] 3.1 Create `ProvidersLoadingIndicator` component
    - Display CircularProgress spinner with size 24
    - Show text "Chargement des prestataires..." next to spinner
    - Use Box with flex layout and gap spacing
    - _Requirements: 1.5, 5.1_

  - [ ] 3.2 Create `ProvidersLoadError` component
    - Accept `error` (string) and `onRetry` (function) as props
    - Display Alert with severity="error"
    - Show error message with ❌ emoji prefix
    - Include "Réessayer" button that calls `onRetry` prop
    - _Requirements: 3.1, 3.2, 3.3, 5.3_

  - [ ] 3.3 Create `NoProvidersMessage` component
    - Display Alert with severity="info"
    - Show message "ℹ️ Aucun prestataire associé à cet hôpital. Vous pouvez en ajouter ci-dessous."
    - Only shown when providers array is empty in edit mode
    - _Requirements: 1.3, 5.5_

- [ ] 4. Update step 2 (Prestataires) rendering logic
  - [ ] 4.1 Add conditional rendering based on loading state
    - Show `ProvidersLoadingIndicator` when `isLoadingProviders` is true
    - Show `ProvidersLoadError` when `providersLoadError` is not null and not loading
    - Show `NoProvidersMessage` when providers array is empty, not loading, no error, and in edit mode
    - Hide provider form and list while loading
    - Show provider form and list when not loading
    - _Requirements: 1.5, 3.1, 3.2, 3.3, 5.1, 5.2, 5.3_

  - [ ] 4.2 Update step 2 header text
    - Show "Prestataires associés à cet établissement" when `initialData.id` exists (edit mode)
    - Show "Ajoutez les prestataires qui travailleront dans cet établissement" when no ID (creation mode)
    - _Requirements: 6.1, 6.2_

  - [ ] 4.3 Update providers list header to show count
    - Change "📋 Récapitulatif des prestataires" to include count: "📋 Récapitulatif des prestataires ({providers.length})"
    - _Requirements: 5.4_

- [ ] 5. Remove obsolete localStorage code
  - [ ] 5.1 Delete localStorage-related functions
    - Remove `saveProvidersToLocalStorage` function completely
    - Remove `loadProvidersFromLocalStorage` function completely
    - Remove `clearProvidersFromLocalStorage` function completely
    - Remove any calls to these functions throughout the component
    - _Requirements: 7.1, 7.3_

  - [ ] 5.2 Remove obsolete state variables
    - Remove `hospitalProvidersCache` state variable declaration
    - Remove any references to `hospitalProvidersCache` in the code
    - _Requirements: 7.2_

  - [ ] 5.3 Clean up provider initialization logic
    - Remove any fallback logic that checks localStorage first
    - Remove any fallback logic that checks `initialData.prestataires`
    - Ensure only `loadProviders` function is used for edit mode
    - _Requirements: 2.2, 2.3, 7.4, 7.5_

- [ ] 6. Ensure creation mode compatibility
  - [ ] 6.1 Verify creation mode behavior
    - Test that form opens correctly without `initialData.id`
    - Verify that `loadProviders` is NOT called in creation mode
    - Verify that providers list initializes as empty array
    - Verify that no loading indicator appears in creation mode
    - Verify that users can manually add providers in creation mode
    - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [ ] 7. Test the complete implementation
  - [ ] 7.1 Test edit mode with existing providers
    - Open hospital edit form with a hospital that has providers
    - Verify loading indicator appears briefly
    - Verify providers load and display correctly
    - Verify provider count is shown in header
    - _Requirements: 1.1, 1.2, 1.5, 5.1, 5.2, 5.4_

  - [ ] 7.2 Test edit mode with no providers
    - Open hospital edit form with a hospital that has no providers
    - Verify loading indicator appears briefly
    - Verify "Aucun prestataire" message displays
    - Verify user can add providers manually
    - _Requirements: 1.3, 5.5_

  - [ ] 7.3 Test error handling scenarios
    - Test with invalid/expired authentication token
    - Test with network disconnection
    - Test with non-existent hospital ID
    - Verify error messages display correctly
    - Verify retry button works and reloads providers
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 7.4 Test creation mode
    - Open hospital creation form (no initialData)
    - Verify no loading indicator appears
    - Verify providers list is empty
    - Verify user can add providers manually
    - Verify form submission works correctly
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 7.5 Verify localStorage cleanup
    - Check that no localStorage calls remain in code
    - Verify that providers are not cached between sessions
    - Verify that providers always load fresh from backend in edit mode
    - _Requirements: 4.5, 7.1, 7.2, 7.3, 7.4, 7.5_

## Notes

- The backend endpoint `/api/hospitaux/{id}/prestataires-only` already exists and works correctly - no backend changes needed
- All provider data modifications (add, edit, delete) remain local until form submission
- The implementation maintains backward compatibility with creation mode
- Error handling provides clear feedback and recovery options for users
- The solution eliminates complex fallback logic and cache inconsistencies
