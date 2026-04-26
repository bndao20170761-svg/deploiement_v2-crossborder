/**
 * Utilitaire pour normaliser et mapper les données des médecins
 * en fonction de la structure reçue du backend
 */

export const normalizeDoctorData = (doctor) => {
  if (!doctor) return null;

  return {
    // Données originales
    ...doctor,
    
    // Propriétés normalisées - gérer tous les formats possibles
    prenom: doctor.prenom || doctor.prenomUtilisateur || doctor.utilisateur?.prenom || doctor.prenomDocteur || '',
    nom: doctor.nom || doctor.nomUtilisateur || doctor.utilisateur?.nom || doctor.nomDocteur || '',
    
    // Pour compatibilité avec le code existant
    prenomUtilisateur: doctor.prenom || doctor.prenomUtilisateur || doctor.utilisateur?.prenom || doctor.prenomDocteur || '',
    nomUtilisateur: doctor.nom || doctor.nomUtilisateur || doctor.utilisateur?.nom || doctor.nomDocteur || '',
    
    // Codes - support de multiples formats
    codeDoctor: doctor.codeDoctor || '',
    codeDocteur: doctor.codeDocteur || doctor.codeDoctor || '',
    
    // Informations de base
    fonction: doctor.fonction || '',
    specialite: doctor.specialite || doctor.fonction || 'Médecin',
    telephone: doctor.telephone || '',
    email: doctor.email || '',
    pseudo: doctor.pseudo || doctor.username || '',
    
    // Localisation
    lieuExercice: doctor.lieuExercice || '',
    
    // Noms composés pour affichage - utiliser les champs normalisés
    nomComplet: `${doctor.prenom || doctor.prenomUtilisateur || doctor.utilisateur?.prenom || doctor.prenomDocteur || ''} ${doctor.nom || doctor.nomUtilisateur || doctor.utilisateur?.nom || doctor.nomDocteur || ''}`.trim(),
    nomAffichage: `${doctor.prenom || doctor.prenomUtilisateur || doctor.utilisateur?.prenom || doctor.prenomDocteur || ''} ${doctor.nom || doctor.nomUtilisateur || doctor.utilisateur?.nom || doctor.nomDocteur || ''}`.trim() || 'Médecin',
    
    // Affichage détaillé pour les listes
    affichageDetaille: `${doctor.prenom || doctor.prenomUtilisateur || doctor.utilisateur?.prenom || doctor.prenomDocteur || ''} ${doctor.nom || doctor.nomUtilisateur || doctor.utilisateur?.nom || doctor.nomDocteur || ''}`.trim() + 
      (doctor.specialite || doctor.fonction ? ` - ${doctor.specialite || doctor.fonction}` : '') +
      (doctor.codeDoctor ? ` (${doctor.codeDoctor})` : '')
  };
};

export const normalizeDoctorsList = (doctors) => {
  if (!Array.isArray(doctors)) return [];
  return doctors.map(doctor => normalizeDoctorData(doctor));
};

export const getDoctorDisplayName = (doctor) => {
  if (!doctor) return 'Médecin';
  
  const firstName = doctor.prenom || doctor.prenomUtilisateur || doctor.utilisateur?.prenom || doctor.prenomDocteur || '';
  const lastName = doctor.nom || doctor.nomUtilisateur || doctor.utilisateur?.nom || doctor.nomDocteur || '';
  
  return `${firstName} ${lastName}`.trim() || 'Médecin';
};

export const getDoctorCode = (doctor) => {
  if (!doctor) return '';
  return doctor.codeDoctor || doctor.codeDocteur || '';
};
