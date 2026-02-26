// assets/services/hospitalService.js
import api from './api'; // Assurez-vous que le chemin est correct

// Récupérer tous les hôpitaux
export const getAllHospitals = async () => {
  try {
    const response = await api.get('/api/hopitaux-proxy/tous');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de tous les hôpitaux :", error);
    throw error;
  }
};

export const getHospitalById = async (id) => {
  try {
    const response = await api.get(`/api/hopitaux-proxy/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'hôpital:', error);
    throw error;
  }
};

export const createHospital = async (hospitalData) => {
  try {
    const response = await api.post('/api/hopitaux-proxy', hospitalData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de l\'hôpital:', error);
    throw error;
  }
};

export const updateHospital = async (id, hospitalData) => {
  try {
    const response = await api.put(`/api/hopitaux-proxy/${id}`, hospitalData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'hôpital:', error);
    throw error;
  }
};

export const deleteHospital = async (id) => {
  try {
    const response = await api.delete(`/api/hopitaux-proxy/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'hôpital:', error);
    throw error;
  }
};

export const getInactiveHospitals = async () => {
  try {
    const response = await api.get('/api/hospitaux/inactifs'); // Reste sur user service pour admin
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des hôpitaux inactifs:', error);
    throw error;
  }
};

// Activer ou désactiver un hôpital (admin uniquement)
export const toggleHospitalStatus = async (id, active) => {
  try {
    const response = await api.patch(`/api/hospitaux/${id}/status`, null, { params: { active } }); // Reste sur user service pour admin
    return response.data;
  } catch (error) {
    console.error('Erreur lors du changement de statut de l\'hôpital:', error);
    throw error;
  }
};

// Récupérer les hôpitaux actifs
export const getActiveHospitals = async () => {
  try {
    const response = await api.get('/api/hopitaux-proxy/actifs');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des hôpitaux actifs:', error);
    throw error;
  }
};

// Récupérer les hôpitaux pour la carte
export const getHospitalsForMap = async () => {
  try {
    const response = await api.get('/api/hopitaux-proxy/carte');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des hôpitaux pour la carte:', error);
    throw error;
  }
};

// Récupérer mes hôpitaux (utilisateur connecté)
export const getMyHospitals = async () => {
  try {
    const response = await api.get('/api/hopitaux-proxy/mes-hopitaux');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de mes hôpitaux:', error);
    throw error;
  }
};

// Récupérer hôpital avec détails
export const getHospitalWithDetails = async (id) => {
  try {
    const response = await api.get(`/api/hopitaux-proxy/${id}/details`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des détails de l\'hôpital:', error);
    throw error;
  }
};

// Rechercher des hôpitaux
export const searchHospitals = async (ville, pays) => {
  try {
    const params = new URLSearchParams();
    if (ville) params.append('ville', ville);
    if (pays) params.append('pays', pays);
    
    const response = await api.get(`/api/hopitaux-proxy/recherche?${params}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la recherche d\'hôpitaux:', error);
    throw error;
  }
};


export const deleteHospitalService = deleteHospital;