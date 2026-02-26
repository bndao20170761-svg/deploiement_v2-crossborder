import api from './api';

export const getAllAssistants = async () => {
  try {
    const response = await api.get('/assistants');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des assistants sociaux:', error);
    throw error;
  }
};

export const getAssistantByCode = async (codeAssistant) => {
  try {
    const response = await api.get(`/assistants/${codeAssistant}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'assistant social:', error);
    throw error;
  }
};

export const createAssistant = async (assistantData) => {
  try {
    const response = await api.post('/assistants', assistantData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de l\'assistant social:', error);
    throw error;
  }
};

export const updateAssistant = async (codeAssistant, assistantData) => {
  try {
    const response = await api.put(`/assistants/${codeAssistant}`, assistantData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'assistant social:', error);
    throw error;
  }
};

export const getHopitauxDisponibles = async () => {
  try {
    const response = await api.get('/assistants/hopitaux-disponibles');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des hôpitaux:', error);
    throw error;
  }
};

export const deleteAssistant = async (codeAssistant) => {
  try {
    const response = await api.delete(`/assistants/${codeAssistant}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'assistant social:', error);
    throw error;
  }
};

export const checkAssistantCodeExists = async (codeAssistant) => {
  try {
    const response = await api.get(`/assistants/exists/${codeAssistant}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la vérification du code assistant:', error);
    throw error;
  }
};

export const countAssistants = async () => {
  try {
    const response = await api.get('/assistants/count');
    return response.data;
  } catch (error) {
    console.error('Erreur lors du comptage des assistants:', error);
    throw error;
  }
};

// Alias pour la compatibilité
export const deleteAssistantService = deleteAssistant;