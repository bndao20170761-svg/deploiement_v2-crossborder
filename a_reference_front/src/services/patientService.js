import api, { apiSafe } from './api';

// Créer un patient
export const createPatient = async (patientData) => {
  const result = await api.post('/integration/patients', patientData);
  return result.data;
};

// Vérifier si un patient a un dossier en appelant l'endpoint direct du dossier
export const checkPatientHasDossier = async (codePatient) => {
  try {
    const response = await apiSafe.get(`/dossiers/${codePatient}`);
    const dossier = response.data;
    console.log("✅ Dossier check successful:", { codePatient, dossier });
    return Boolean(dossier);
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
    const response = await apiSafe.get(`/dossiers/${codePatient}`);
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

