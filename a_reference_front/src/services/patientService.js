import api from './httpClient';

// Créer un patient
export const createPatient = async (patientData) => {
  const result = await api.post('/integration/patients', patientData);
  return result.data;
};

// Vérifier si un patient a un dossier
export const checkPatientHasDossier = async (codePatient) => {
  try {
    const response = await api.get(`/integration/patients/${codePatient}/has-dossier`);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur vérification dossier:", error);
    return false;
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

