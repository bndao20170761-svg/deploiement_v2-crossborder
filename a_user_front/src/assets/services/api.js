// assets/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8080',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Intercepteur pour ajouter automatiquement le préfixe /api si absent (avant l'intercepteur JWT)
api.interceptors.request.use(
  (config) => {
    // Si l'URL ne commence pas par /api/ ou /api/user-auth/, l'ajouter
    if (config.url && 
        !config.url.startsWith('/api/') && 
        !config.url.startsWith('/api/user-auth/') &&
        !config.url.startsWith('http')) {
      config.url = '/api' + (config.url.startsWith('/') ? '' : '/') + config.url;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour ajouter le token JWT aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Services pour les associations
export const associationService = {
  getAllAssociations: async () => {
    try {
      const response = await api.get('/associations');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des associations:', error);
      throw error;
    }
  },

  getAssociationById: async (id) => {
    try {
      const response = await api.get(`/associations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'association:', error);
      throw error;
    }
  },

  createAssociation: async (associationData) => {
    try {
      const response = await api.post('/associations', associationData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'association:', error);
      throw error;
    }
  },

  updateAssociation: async (id, associationData) => {
    try {
      const response = await api.put(`/associations/${id}`, associationData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'association:', error);
      throw error;
    }
  },

  deleteAssociation: async (id) => {
    try {
      const response = await api.delete(`/associations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'association:', error);
      throw error;
    }
  }
};

export default api;