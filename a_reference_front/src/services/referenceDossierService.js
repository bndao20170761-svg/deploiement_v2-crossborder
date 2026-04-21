import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_GATEWAY_URL || 'http://16.171.10.0:8080';

const referenceDossierService = {
  // Obtenir toutes les références
  getAllReferences: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/references-dossiers`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des références:', error);
      throw error;
    }
  },

  // Obtenir une référence par code
  getReferenceByCode: async (codeReference) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/references-dossiers/${codeReference}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la référence:', error);
      throw error;
    }
  },

  // Obtenir les références par patient
  getReferencesByPatient: async (codePatient) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/references-dossiers/patient/${codePatient}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des références du patient:', error);
      throw error;
    }
  },

  // Obtenir les références par hôpital
  getReferencesByHopital: async (codeHopital) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/references-dossiers/hopital/${codeHopital}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des références de l\'hôpital:', error);
      throw error;
    }
  },

  // Obtenir les références par médecin
  getReferencesByDoctor: async (codeDocteur) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/references-dossiers/medecin/${codeDocteur}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des références du médecin:', error);
      throw error;
    }
  },

  // Obtenir les références par statut
  getReferencesByStatut: async (statut) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/references-dossiers/statut/${statut}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des références par statut:', error);
      throw error;
    }
  },

  // Obtenir les références reçues
  getReferencesRecues: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/references-dossiers/recues`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des références reçues:', error);
      throw error;
    }
  },

  // Obtenir les références envoyées
  getReferencesEnvoyees: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/references-dossiers/envoyees`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des références envoyées:', error);
      throw error;
    }
  },

  // Obtenir les références en attente
  getReferencesEnAttente: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/references-dossiers/en-attente`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des références en attente:', error);
      throw error;
    }
  },

  // Créer une nouvelle référence
  createReference: async (referenceData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/references-dossiers`, referenceData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la référence:', error);
      throw error;
    }
  },

  // Mettre à jour une référence
  updateReference: async (codeReference, referenceData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/api/references-dossiers/${codeReference}`, referenceData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la référence:', error);
      throw error;
    }
  },

  // Accepter une référence
  accepterReference: async (codeReference, codeDocteur, nomDocteur) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/api/references-dossiers/${codeReference}/accepter`, null, {
        params: {
          codeDocteur,
          nomDocteur,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de la référence:', error);
      throw error;
    }
  },

  // Supprimer une référence
  deleteReference: async (codeReference) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_BASE_URL}/api/references-dossiers/${codeReference}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression de la référence:', error);
      throw error;
    }
  },

  // Obtenir les dossiers d'un patient depuis gestion-reference (via Feign Client)
  getDossiersByPatientFromGestionPatient: async (codePatient) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/dossiers/by-patient/${codePatient}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des dossiers du patient:', error);
      throw error;
    }
  },
};

export default referenceDossierService;
