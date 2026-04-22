// Utilitaires pour normaliser les données des doctors
export const normalizeDoctorData = (doctor) => {
  if (!doctor) return doctor;
  
  return {
    ...doctor,
    // Les doctors utilisent déjà nomUtilisateur/prenomUtilisateur
    // mais on s'assure qu'ils sont présents
    nomUtilisateur: doctor.nomUtilisateur || doctor.nom || '',
    prenomUtilisateur: doctor.prenomUtilisateur || doctor.prenom || '',
    // Normaliser d'autres champs si nécessaire
    lieuExercice: doctor.lieuExercice || doctor.hopitalNom || '',
    specialite: doctor.fonction || doctor.specialite || ''
  };
};

export const normalizeDoctorList = (doctors) => {
  if (!Array.isArray(doctors)) return [];
  return doctors.map(normalizeDoctorData);
};