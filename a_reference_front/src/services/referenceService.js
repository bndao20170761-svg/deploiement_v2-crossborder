// src/services/referenceService.js
import api from './api';


// Obtenir les références envoyées
export const getSentReferences = async () => {
  const response = await api.get('/references-dossiers/envoyees');
  return response.data;
};

// Obtenir les références reçues
export const getReceivedReferences = async () => {
  const response = await api.get('/references-dossiers/recues');
  return response.data;
};

// Créer une nouvelle référence
export const createReference = async (referenceData) => {
  return await api.post('/references-dossiers', referenceData);
};

// Récupérer toutes les références
export const getAllReferences = async () => {
  return await api.get('/references-dossiers');
};

// Récupérer une référence par ID
export const getReferenceById = async (id) => {
  return await api.get(`/references-dossiers/${id}`);
};

// Validation d'une référence
export const validateReference = async (id) => {
  const response = await api.put(`/references-dossiers/${id}/validation`, {});
  return response.data;
};

// Contre-référence (feedback)
export const feedbackReference = async (id) => {
  const response = await api.put(`/references-dossiers/contreReference/${id}`, {});
  return response.data;
};

export const countRecuesNonLues = async () => {
  const response = await api.get('/references-dossiers/count/recues-non-lues');
  return response.data; // renvoie un nombre
};

//assistant send
export const getCountReferencesEnvoyeesParAssistant = async () => {
  const response = await api.get('/references-dossiers/count/assistant');
  return response.data; // renvoie un nombre
};

export const countEnvoyees = async () => {
  const response = await api.get('/references-dossiers/count/envoyees');
  return response.data; // renvoie un nombre
};

// Mettre à jour une référence
export const updateReference = async (id, referenceData) => {
  const response = await api.put(`/references-dossiers/${id}`, referenceData);
  return response.data;
};

// Supprimer une référence
export const deleteReference = async (id) => {
  return await api.delete(`/references-dossiers/${id}`);
};
