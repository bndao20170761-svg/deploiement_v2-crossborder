import axios from 'axios';
import { normalizeToken, isJwtFormatValid } from '../utils/tokenUtils';

const API_BASE_URL = process.env.REACT_APP_GATEWAY_URL || 'http://13.53.133.40:8080';

const getToken = () => normalizeToken(localStorage.getItem('token'));

const buildAuthHeaders = () => {
  const token = getToken();
  if (!token || !isJwtFormatValid(token)) {
    throw new Error('Session expirée ou invalide. Veuillez vous reconnecter.');
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const authRequest = async (method, path, data = null, extraConfig = {}) => {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${path}`,
      headers: buildAuthHeaders(),
      ...extraConfig,
    };

    if (data !== null) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      // Seulement sur 401 (token expiré) — pas sur 403 (accès refusé)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    throw error;
  }
};

const referenceDossierService = {
  // Obtenir toutes les références
  getAllReferences: async () => {
    try {
      return await authRequest('get', '/api/references-dossiers');
    } catch (error) {
      console.error('Erreur lors de la récupération des références:', error);
      throw error;
    }
  },

  // Obtenir une référence par code
  getReferenceByCode: async (codeReference) => {
    try {
      return await authRequest('get', `/api/references-dossiers/${codeReference}`);
    } catch (error) {
      console.error('Erreur lors de la récupération de la référence:', error);
      throw error;
    }
  },

  // Obtenir les références par patient
  getReferencesByPatient: async (codePatient) => {
    try {
      return await authRequest('get', `/api/references-dossiers/patient/${codePatient}`);
    } catch (error) {
      console.error('Erreur lors de la récupération des références du patient:', error);
      throw error;
    }
  },

  // Obtenir les références par hôpital
  getReferencesByHopital: async (codeHopital) => {
    try {
      return await authRequest('get', `/api/references-dossiers/hopital/${codeHopital}`);
    } catch (error) {
      console.error('Erreur lors de la récupération des références de l\'hôpital:', error);
      throw error;
    }
  },

  // Obtenir les références par médecin
  getReferencesByDoctor: async (codeDocteur) => {
    try {
      return await authRequest('get', `/api/references-dossiers/medecin/${codeDocteur}`);
    } catch (error) {
      console.error('Erreur lors de la récupération des références du médecin:', error);
      throw error;
    }
  },

  // Obtenir les références par statut
  getReferencesByStatut: async (statut) => {
    try {
      return await authRequest('get', `/api/references-dossiers/statut/${statut}`);
    } catch (error) {
      console.error('Erreur lors de la récupération des références par statut:', error);
      throw error;
    }
  },

  // Obtenir les références reçues
  getReferencesRecues: async () => {
    try {
      return await authRequest('get', '/api/references-dossiers/recues');
    } catch (error) {
      console.error('Erreur lors de la récupération des références reçues:', error);
      throw error;
    }
  },

  // Vérifier si le médecin peut accepter la référence
  canAcceptReference: async (codeReference) => {
    try {
      return await authRequest('get', `/api/references-dossiers/can-accept/${codeReference}`);
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions d\'acceptation:', error);
      return false;
    }
  },

  // Vérifier si le médecin peut modifier la référence
  canEditReference: async (codeReference) => {
    try {
      return await authRequest('get', `/api/references-dossiers/can-edit/${codeReference}`);
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions de modification:', error);
      return false;
    }
  },

  // Accepter une référence
  acceptReference: async (codeReference) => {
    try {
      return await authRequest('post', `/api/references-dossiers/accept/${codeReference}`);
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de la référence:', error);
      throw error;
    }
  },

  // Obtenir les références envoyées
  getReferencesEnvoyees: async () => {
    try {
      return await authRequest('get', '/api/references-dossiers/envoyees');
    } catch (error) {
      console.error('Erreur lors de la récupération des références envoyées:', error);
      throw error;
    }
  },

  // Obtenir les références en attente
  getReferencesEnAttente: async () => {
    try {
      return await authRequest('get', '/api/references-dossiers/en-attente');
    } catch (error) {
      console.error('Erreur lors de la récupération des références en attente:', error);
      throw error;
    }
  },

  // Créer une nouvelle référence
  createReference: async (referenceData) => {
    try {
      return await authRequest('post', '/api/references-dossiers', referenceData);
    } catch (error) {
      console.error('Erreur lors de la création de la référence:', error);
      throw error;
    }
  },

  // Mettre à jour une référence
  updateReference: async (codeReference, referenceData) => {
    try {
      return await authRequest('put', `/api/references-dossiers/${codeReference}`, referenceData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la référence:', error);
      throw error;
    }
  },

  // Accepter une référence
  accepterReference: async (codeReference, codeDocteur, nomDocteur) => {
    try {
      return await authRequest('put', `/api/references-dossiers/${codeReference}/accepter`, null, {
        params: {
          codeDocteur,
          nomDocteur,
        },
      });
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de la référence:', error);
      throw error;
    }
  },

  // Supprimer une référence
  deleteReference: async (codeReference) => {
    try {
      return await authRequest('delete', `/api/references-dossiers/${codeReference}`);
    } catch (error) {
      console.error('Erreur lors de la suppression de la référence:', error);
      throw error;
    }
  },

  // Obtenir les dossiers d'un patient depuis gestion-reference (via Feign Client)
  getDossiersByPatientFromGestionPatient: async (codePatient) => {
    try {
      return await authRequest('get', `/api/dossiers/by-patient/${codePatient}`);
    } catch (error) {
      console.error('Erreur lors de la récupération des dossiers du patient:', error);
      throw error;
    }
  },

  // Compter les références de dossiers envoyées
  countReferencesDossierEnvoyees: async () => {
    try {
      return await authRequest('get', '/api/references-dossiers/count/envoyees');
    } catch (error) {
      console.error('Erreur lors du comptage des références de dossiers envoyées:', error);
      throw error;
    }
  },

  // Compter les références de dossiers reçues non lues
  countReferencesDossierRecuesNonLues: async () => {
    try {
      return await authRequest('get', '/api/references-dossiers/count/recues-non-lues');
    } catch (error) {
      console.error('Erreur lors du comptage des références de dossiers reçues non lues:', error);
      throw error;
    }
  },

  // Vérifier si le médecin peut valider la référence (initiée par un assistant)
  canValidateReference: async (codeReference) => {
    try {
      return await authRequest('get', `/api/references-dossiers/can-validate/${codeReference}`);
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions de validation:', error);
      return false;
    }
  },

  // Valider une référence initiée par un assistant
  validerReference: async (codeReference) => {
    try {
      return await authRequest('post', `/api/references-dossiers/valider/${codeReference}`);
    } catch (error) {
      console.error('Erreur lors de la validation de la référence:', error);
      throw error;
    }
  },

  // Compter les références initiées par un assistant pour les patients du médecin (badge jaune)
  countReferencesDossierAssistant: async () => {
    try {
      return await authRequest('get', '/api/references-dossiers/count/assistant');
    } catch (error) {
      console.error('Erreur lors du comptage des références assistant:', error);
      return 0;
    }
  },
};

export default referenceDossierService;
