// patientService.js
import api from './api';

export const getAllPatients = async () => {
  try {
    const response = await api.get('/patients');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des patients:', error);
    throw error;
  }
};

export const getPatientByCode = async (codePatient) => {
  try {
    const response = await api.get(`/patients/${codePatient}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du patient:', error);
    throw error;
  }
};

export const createPatient = async (patientData) => {
  try {
    const response = await api.post('/patients', patientData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du patient:', error);
    throw error;
  }
};

export const updatePatient = async (codePatient, patientData) => {
  try {
    const response = await api.put(`/patients/${codePatient}`, patientData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du patient:', error);
    throw error;
  }
};

export const deletePatient = async (codePatient) => {
  try {
    const response = await api.delete(`/patients/${codePatient}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression du patient:', error);
    throw error;
  }
};

export const checkPatientCodeExists = async (codePatient) => {
  try {
    const response = await api.get(`/patients/exists/${codePatient}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la vérification du code patient:', error);
    throw error;
  }
};

export const countPatients = async () => {
  try {
    const response = await api.get('/patients/count');
    return response.data;
  } catch (error) {
    console.error('Erreur lors du comptage des patients:', error);
    throw error;
  }
};

// Alias pour la compatibilité
export const deletePatientService = deletePatient;