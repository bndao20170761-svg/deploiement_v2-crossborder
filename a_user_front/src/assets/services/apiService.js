import api from './api';

// Fonctions utilitaires pour les appels API
export const apiGet = async (endpoint) => {
  try {
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Erreur GET ${endpoint}:`, error);
    throw error;
  }
};

export const apiPost = async (endpoint, data) => {
  try {
    const response = await api.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Erreur POST ${endpoint}:`, error);
    throw error;
  }
};

export const apiPut = async (endpoint, data) => {
  try {
    const response = await api.put(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Erreur PUT ${endpoint}:`, error);
    throw error;
  }
};

export const apiDelete = async (endpoint) => {
  try {
    const response = await api.delete(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Erreur DELETE ${endpoint}:`, error);
    throw error;
  }
};

export const apiPatch = async (endpoint, data) => {
  try {
    const response = await api.patch(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Erreur PATCH ${endpoint}:`, error);
    throw error;
  }
};