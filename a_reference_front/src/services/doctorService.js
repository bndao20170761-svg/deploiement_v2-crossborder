import api from './api';

// Récupérer tous les docteurs
export const getAllDoctors = async () => {
  try {
    const response = await api.get('/doctors');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des docteurs:', error);
    throw error;
  }
};

// Récupérer les docteurs par hopital
export const getDoctorsByHospital = async (hospitalId) => {
  try {
    const response = await api.get(`/hopitaux-proxy/${hospitalId}/doctors`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des docteurs de l'hôpital ${hospitalId}:`, error);
    throw error;
  }
};

// Récupérer un docteur par ID
export const getDoctorById = async (doctorId) => {
  try {
    const response = await api.get(`/doctors/${doctorId}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération du docteur ${doctorId}:`, error);
    throw error;
  }
};

// Récupérer l'utilisateur connecté (docteur)
export const getCurrentDoctor = async () => {
  try {
    const response = await api.get('/user/me');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du docteur connecté:', error);
    throw error;
  }
};
