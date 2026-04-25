import api, { apiSafe } from './api';

const getDossiersByPatientWithFallback = async (codePatient) => {
  try {
    return await apiSafe.get(`/dossiers/by-patient/${codePatient}`);
  } catch (error) {
    // Some environments expose dossiers via /integration instead of /dossiers.
    if (error?.response?.status === 403 || error?.response?.status === 404) {
      console.warn("⚠️ /dossiers/by-patient inaccessible, tentative via /integration:", {
        codePatient,
        status: error.response?.status
      });
      return apiSafe.get(`/integration/dossiers/by-patient/${codePatient}`);
    }
    throw error;
  }
};

// Créer un patient
export const createPatient = async (patientData) => {
  const result = await api.post('/integration/patients', patientData);
  return result.data;
};

/** Création dossier médical (gestion_patient via gateway) — utiliser `api` pour JWT + baseURL. */
export const createDossier = async (dossierDTO) => {
  const result = await api.post('/dossiers', dossierDTO);
  return result.data;
};

// Vérifier si un patient a un dossier - utilise l'endpoint /by-patient/ du backend
export const checkPatientHasDossier = async (codePatient) => {
  try {
    const response = await getDossiersByPatientWithFallback(codePatient);
    const dossiers = response.data;
    const hasDossier = Array.isArray(dossiers) ? dossiers.length > 0 : Boolean(dossiers?.codeDossier);
    console.log("Dossier check successful:", { codePatient, hasDossier, dossiersCount: Array.isArray(dossiers) ? dossiers.length : 1 });
    return hasDossier;
  } catch (error) {
    console.warn("⚠️ Erreur vérification dossier (non critique):", {
      codePatient,
      status: error.response?.status,
      message: error.message,
      path: error.config?.url
    });
    return false;
  }
};

// Récupérer les dossiers d'un patient (gestion_patient)
export const getDossiersByPatient = async (codePatient) => {
  try {
    const response = await getDossiersByPatientWithFallback(codePatient);
    return response.data;
  } catch (error) {
    console.warn("⚠️ Erreur getDossiersByPatient (non critique):", {
      codePatient,
      status: error.response?.status,
      message: error.message
    });
    return null;
  }
};

/**
 * Pour l'affichage UI : GET /api/dossiers/{id} attend un code dossier, pas le code patient.
 * On charge donc la liste via /by-patient puis on prend le premier dossier (comportement historique).
 */
export const getPrimaryDossierForPatient = async (codePatient) => {
  const list = await getDossiersByPatient(codePatient);
  if (list == null) return null;
  if (Array.isArray(list)) return list.length > 0 ? list[0] : null;
  return list;
};

// Récupérer tous les patients
export const getAllPatients = async () => {
  // Correspond à GET /api/integration/patients (gestion_reference via gateway)
  console.log("🔄 patientService: Appel getAllPatients...");
  try {
    const result = await api.get('/integration/patients');
    console.log("✅ patientService: Résultat getAllPatients:", result);
    console.log("✅ patientService: Données patients:", result.data);
    return result.data; // ← FIX: Retourner result.data au lieu de result
  } catch (error) {
    console.error("❌ patientService: Erreur getAllPatients:", error);
    throw error;
  }
};

// Mettre à jour un patient
export const updatePatient = async (codePatient, patientData) => {
  const result = await api.put(`/integration/patients/${codePatient}`, patientData);
  return result.data;
};

export const deletePatient = async (codePatient) => {
  const result = await api.delete(`/integration/patients/${codePatient}`);
  return result.data;
};

// Rechercher des patients
export const searchPatients = async (searchTerm) => {
  try {
    const result = await api.get(`/integration/patients/search?q=${encodeURIComponent(searchTerm)}`);
    return result.data;
  } catch (error) {
    console.error("Erreur lors de la recherche de patients:", error);
    throw error;
  }
};

// Récupérer le patient avec son dossier principal (dossierView)
export const getPatientWithDossier = async (codePatient) => {
  try {
    const result = await api.get(`/dossiers/view/${codePatient}`);
    return result.data;
  } catch (error) {
    console.error("Erreur lors de la récupération du patient avec dossier:", error);
    throw error;
  }
};

