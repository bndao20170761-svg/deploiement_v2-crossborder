// src/services/hopitalService.js
import api from './httpClient';

// Récupérer les hôpitaux actifs
export const getHopitauxActifs = async () => {
  try {
    const response = await api.get('/hopitaux-proxy/actifs');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des hôpitaux actifs :", error);
    throw error;
  }
};

// Récupérer les hôpitaux pour la carte
export const getHopitauxPourCarte = async () => {
  try {
    const response = await api.get('/hopitaux-proxy/carte');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des hôpitaux pour la carte :", error);
    throw error;
  }
};

// Récupérer un hôpital par ID
export const getHopitalById = async (id) => {
  try {
    const response = await api.get(`/hopitaux-proxy/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'hôpital avec ID ${id} :`, error);
    throw error;
  }
};

// Créer un hôpital
export const createHopital = async (hopitalData) => {
  try {
    // Utiliser le service user direct pour la création (contournement temporaire du 403 sur proxy)
    const response = await api.post('/hospitaux', hopitalData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la création de l'hôpital :", error);
    throw error;
  }
};

// Mettre à jour un hôpital
export const updateHopital = async (id, hopitalData) => {
  try {
    const response = await api.put(`/hopitaux-proxy/${id}`, hopitalData);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'hôpital avec ID ${id} :`, error);
    throw error;
  }
};

// Supprimer un hôpital
export const deleteHopital = async (id) => {
  try {
    const response = await api.delete(`/hopitaux-proxy/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'hôpital avec ID ${id} :`, error);
    throw error;
  }
};

// Rechercher des hôpitaux par ville et/ou pays
export const rechercherHopitaux = async (ville, pays) => {
  try {
    const response = await api.get('/hopitaux-proxy/recherche', {
      params: { ville, pays }
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la recherche d'hôpitaux :", error);
    throw error;
  }
};

// 🔹 Récupérer les détails d’un hôpital (médecins + assistants)
export const getHopitalAvecDetails = async (id) => {
  try {
    const response = await api.get(`/hopitaux-proxy/${id}/details`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des détails de l'hôpital ${id} :`, error);
    throw error;
  }
};

// 🔹 Récupérer les hôpitaux de l’utilisateur connecté
export const getMyHospitals = async () => {
  try {
    const response = await api.get('/hopitaux-proxy/mes-hopitaux');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de mes hôpitaux :", error);
    throw error;
  }
};
// Récupérer tous les hôpitaux
export const getAllHospitals = async () => {
  try {
    const response = await api.get('/hopitaux-proxy/tous');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de tous les hôpitaux :", error);
    throw error;
  }
};

// Alias pour compatibilité éventuelle
export const deleteHopitalService = deleteHopital;
