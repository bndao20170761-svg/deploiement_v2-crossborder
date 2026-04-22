// Utilitaires pour normaliser les données des patients
export const normalizePatientData = (patient) => {
  if (!patient) return patient;
  
  return {
    ...patient,
    // Normaliser les noms de champs pour compatibilité
    nomUtilisateur: patient.nom || patient.nomUtilisateur,
    prenomUtilisateur: patient.prenom || patient.prenomUtilisateur,
    sexe: patient.genre || patient.sexe,
    // Garder les champs originaux aussi
    nom: patient.nom || patient.nomUtilisateur,
    prenom: patient.prenom || patient.prenomUtilisateur,
    genre: patient.genre || patient.sexe
  };
};

export const normalizePatientList = (patients) => {
  if (!Array.isArray(patients)) return [];
  return patients.map(normalizePatientData);
};