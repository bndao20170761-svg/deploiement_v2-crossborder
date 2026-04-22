// Exemple de structure pour un patient
// Patient
export const examplePatient = {
  codePatient: '',        // String
  adressePermanent: '',   // String
  adresseTemporaire: '',  // String
  age: null,
  utilisateur:null,           // Number
  dateNaissance: '',      // Format ISO : yyyy-MM-dd
  profession: '',
  nationaliteUtilisateur:'',// String
  pseudo: '',
  username:'',
  password:'',// String
  sexe: '',
  nomUtilisateur:'',// String ('Homme', 'Femme', etc.)
  prenomUtilisateur:'',
  statutMatrimoniale: '', // String
  telephone: ''    // Objet User ou id utilisateur
};

// Doctor
export const exampleDoctor = {
  codeDoctor: '',     // String
  email: '',          // String
  fonction: '',       // String
  lieuExercice: '',   // String
  pseudo: '',         // String
  telephone: '',
  nomUtilisateur:'',// String ('Homme', 'Femme', etc.)
    prenomUtilisateur:'',
    statutMatrimoniale: '',
  // String
  hopital: null,      // Objet Hopital ou id hopital
  utilisateur: null   // Objet User ou id utilisateur
};

// Reference
export const exampleReference = {
  id: null,               // Number
  active: false,          // Boolean
  date: '',               // Format ISO : yyyy-MM-dd
  etat: false,            // Boolean
  site: '',               // String
  statut: '',
  nomUtilisateur:'',// String ('Homme', 'Femme', etc.)
  prenomUtilisateur:'',
  statutMatrimoniale: '',
  patientId,
               // String
  hopital: null,      // Objet Hopital ou id hopital
   utilisateur: null  // String
  type: '',               // String
  validation: false,      // Boolean
  assistantSocial: null,  // Objet AssistantSocial ou code_assistant
  medecinAuteur: null,    // Objet Doctor ou codeDoctor
  medecin: null,          // Objet Doctor ou codeDoctor
  patient: null           // Objet Patient ou codePatient
};


export const exampleWizardData = {
  patient: null,
  doctor: null,

  motif: {
    autresAPreciser: false,
    changementAdresse: false,
    services: false,

    motifAutres: {
      autresMotif: "",
    },
    motifChangements: {
      permanent: false,
      temporaire: false,
    },
    motifServs: {
      arv: false,
      bilan: false,
      io: false,
      ptme: false,
      suivi: false,
    },
  },

  renseignementClinique: {
    poidsKg: null,
    profilVIH: "",
    stadeOMS: "",
    traitementARV: false,
    dateDebutARV: "",
    protocole1ereLigne: "",
    protocole2emeLigne: "",
    date_protocole1: "",
    date_protocole2: "",
    transaminase: "",
    dateTransaminase: "",
    cd4Dernier: "",
    dateCd4Dernier: "",
    cd4DebutTraitement: "",
    dateCd4DebutTraitement: "",
    cd4Inclusion: "",
    dateCd4Inclusion: "",
    chargeViraleNiveau: "",
    dateDebutChargeVirale: "",
    hbNiveau: "",
    dateHb: "",
    lymphocytesTotaux: "",
    dateLymphocytes: "",
    allergie: "",
    dateAllergie: "",
    creatinemie: "",
    dateCreatinemie: "",
    cracheBaar: "",
    dateCracheBaar: "",
    aghbs: "",
    dateAghbs: "",
    autreAnalyse: false,
    autreAnalyseNom: "",
    dateAutreAnalyse: "",
    autreTraitement: "",
    autreTraitementText: "",
    transaminaseAsat: "",
    dateTransaminaseAsat: "",
    transaminaseAlat: "",
    dateTransaminaseAlat: "",
    profils: [],
    stades: [],
    protocoles1s: [],
    protocoles2s: [],
    protocolesTheraps: [],
  },

  symptoms: [],
  observations: "",
};


// Langues supportées
export const languages = ['fr', 'en', 'pt'];

// Exemple de structure pour les traductions
export const exampleTranslations = {
  key: {
    fr: 'Texte en français',
    en: 'Text in English',
    pt: 'Texto em português'
  }
};
