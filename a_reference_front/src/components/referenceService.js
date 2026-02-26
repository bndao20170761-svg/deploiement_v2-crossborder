// src/services/referenceService.js
import axios from "axios";

const API_URL = `${process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8080'}/api/references`;

// Récupère le token depuis localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// Créer une nouvelle référence
export const createReference = async (referenceData) => {
  return await axios.post(`${API_URL}/New_ref`, referenceData, getAuthHeader());
};

// Obtenir les références envoyées
export const getSentReferences = async () => {
  const response = await axios.get(`${API_URL}/sent`);
  return response.data;
};

// Obtenir les références reçues
export const getReceivedReferences = async () => {
  const response = await axios.get(`${API_URL}/received`);
  return response.data;
};
// Récupérer toutes les références
export const getAllReferences = async () => {
  return await axios.get(API_URL, getAuthHeader());
};

// Récupérer une référence par ID
export const getReferenceById = async (id) => {
  return await axios.get(`${API_URL}/${id}`, getAuthHeader());
};

// Supprimer une référence
export const deleteReference = async (id) => {
  return await axios.delete(`${API_URL}/${id}`, getAuthHeader());
};
