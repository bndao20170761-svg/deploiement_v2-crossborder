/**
 * Utilitaire pour normaliser et mapper les données des médecins
 * en fonction de la structure reçue du backend
 */

export const normalizeDoctorData = (doctor) => {
  if (!doctor) return null;

  // Extraire le nom depuis l'email si nom/prenom sont vides
  let nom = '';
  let prenom = '';
  
  if (doctor.nom && doctor.prenom) {
    // Cas normal : nom et prenom existent
    nom = doctor.nom;
    prenom = doctor.prenom;
  } else if (doctor.email) {
    // Cas fallback : extraire depuis l'email (logique simplifiée)
    const emailParts = doctor.email.split('@')[0];
    const nameParts = emailParts.split('.');
    
    if (nameParts.length >= 2) {
      // Filtrer les préfixes comme "dr", "dr_", "doctor"
      const filteredParts = nameParts.filter(part => 
        !part.toLowerCase().startsWith('dr') && 
        !part.toLowerCase().startsWith('doc') &&
        !part.toLowerCase().startsWith('med') &&
        part.length > 1
      );
      
      if (filteredParts.length >= 2) {
        // Cas optimal : au moins 2 parties significatives
        prenom = filteredParts[0]?.charAt(0).toUpperCase() + filteredParts[0]?.slice(1) || '';
        nom = filteredParts[1]?.charAt(0).toUpperCase() + filteredParts[1]?.slice(1) || '';
      } else if (filteredParts.length === 1) {
        // Une seule partie significative
        const name = filteredParts[0]?.charAt(0).toUpperCase() + filteredParts[0]?.slice(1) || '';
        nom = name;
        prenom = '';
      } else {
        // Utiliser la première partie comme nom
        nom = nameParts[0]?.charAt(0).toUpperCase() + nameParts[0]?.slice(1) || '';
        prenom = '';
      }
    } else {
      // Pas de point dans l'email : utiliser le nom d'utilisateur de l'email
      const fullName = emailParts.charAt(0).toUpperCase() + emailParts.slice(1);
      nom = fullName;
      prenom = '';
    }
  }

  // Noms composés pour affichage avec fallback ultime
  let displayName = `${prenom} ${nom}`.trim();
  if (!displayName || displayName === ' ') {
    // Fallback : utiliser le téléphone
    if (doctor.telephone) {
      displayName = `Médecin (${doctor.telephone})`;
    } else {
      displayName = 'Médecin';
    }
  }
  
  const result = {
    // Données originales
    ...doctor,
    
    // Propriétés normalisées - utiliser les champs extraits
    prenom: prenom || doctor.prenomUtilisateur || '',
    nom: nom || doctor.nomUtilisateur || '',
    
    // Pour compatibilité avec le code existant
    prenomUtilisateur: prenom || doctor.prenomUtilisateur || '',
    nomUtilisateur: nom || doctor.nomUtilisateur || '',
    
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
    
    // Ajouter les champs d'affichage
    nomComplet: displayName,
    nomAffichage: displayName,
    affichageDetaille: displayName + 
      (doctor.specialite || doctor.fonction ? ` - ${doctor.specialite || doctor.fonction}` : '') +
      (doctor.codeDoctor ? ` (${doctor.codeDoctor})` : '')
  };
  
  return result;
};

export const normalizeDoctorsList = (doctors) => {
  if (!Array.isArray(doctors)) return [];
  return doctors.map(doctor => normalizeDoctorData(doctor));
};

export const getDoctorDisplayName = (doctor) => {
  if (!doctor) return 'Médecin';
  
  // Utiliser les champs normalisés (nomUtilisateur/prenomUtilisateur)
  const firstName = doctor.prenomUtilisateur || doctor.prenom || '';
  const lastName = doctor.nomUtilisateur || doctor.nom || '';
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`.trim();
  }
  
  // Fallback : extraire depuis l'email
  if (doctor.email) {
    const emailParts = doctor.email.split('@')[0];
    const nameParts = emailParts.split('.');
    if (nameParts.length >= 2) {
      const firstName = nameParts[0]?.charAt(0).toUpperCase() + nameParts[0]?.slice(1) || '';
      const lastName = nameParts[1]?.charAt(0).toUpperCase() + nameParts[1]?.slice(1) || '';
      return `${firstName} ${lastName}`.trim();
    } else {
      return emailParts.charAt(0).toUpperCase() + emailParts.slice(1);
    }
  }
  
  return 'Médecin';
};

export const getDoctorCode = (doctor) => {
  if (!doctor) return '';
  return doctor.codeDoctor || doctor.codeDocteur || '';
};
