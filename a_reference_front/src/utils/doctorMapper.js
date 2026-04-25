/**
 * Utilitaire pour normaliser et mapper les données des médecins
 * en fonction de la structure reçue du backend
 */

export const normalizeDoctorData = (doctor) => {
  if (!doctor) return null;

  return {
    // Données originales
    ...doctor,
    
    // Propriétés normalisées - accès aux informations de l'utilisateur
    prenomUtilisateur: doctor.utilisateur?.prenom || doctor.prenomUtilisateur || doctor.prenomDocteur || '',
    nomUtilisateur: doctor.utilisateur?.nom || doctor.nomUtilisateur || doctor.nomDocteur || '',
    
    // Codes - support de multiples formats
    codeDoctor: doctor.codeDoctor || '',
    codeDocteur: doctor.codeDocteur || doctor.codeDoctor || '',
    
    // Informations de base
    fonction: doctor.fonction || '',
    specialite: doctor.fonction || doctor.specialite || 'Médecin',
    telephone: doctor.telephone || '',
    email: doctor.email || '',
    pseudo: doctor.pseudo || doctor.username || '',
    
    // Localisation
    lieuExercice: doctor.lieuExercice || '',
    
    // Noms composés pour affichage
    nomComplet: `${doctor.utilisateur?.prenom || doctor.prenomUtilisateur || doctor.prenomDocteur || ''} ${doctor.utilisateur?.nom || doctor.nomUtilisateur || doctor.nomDocteur || ''}`.trim(),
    nomAffichage: `${doctor.utilisateur?.prenom || doctor.prenomUtilisateur || doctor.prenomDocteur || ''} ${doctor.utilisateur?.nom || doctor.nomUtilisateur || doctor.nomDocteur || ''}`.trim() || 'Médecin',
    
    // Affichage détaillé pour les listes
    affichageDetaille: `${doctor.utilisateur?.prenom || doctor.prenomUtilisateur || doctor.prenomDocteur || ''} ${doctor.utilisateur?.nom || doctor.nomUtilisateur || doctor.nomDocteur || ''}`.trim() + 
      (doctor.fonction ? ` - ${doctor.fonction}` : '') +
      (doctor.codeDoctor ? ` (${doctor.codeDoctor})` : '')
  };
};

export const normalizeDoctorsList = (doctors) => {
  if (!Array.isArray(doctors)) return [];
  return doctors.map(doctor => normalizeDoctorData(doctor));
};

export const getDoctorDisplayName = (doctor) => {
  if (!doctor) return 'Médecin';
  
  const firstName = doctor.utilisateur?.prenom || doctor.prenomUtilisateur || doctor.prenomDocteur || '';
  const lastName = doctor.utilisateur?.nom || doctor.nomUtilisateur || doctor.nomDocteur || '';
  
  return `${firstName} ${lastName}`.trim() || 'Médecin';
};

export const getDoctorCode = (doctor) => {
  if (!doctor) return '';
  return doctor.codeDoctor || doctor.codeDocteur || '';
};
