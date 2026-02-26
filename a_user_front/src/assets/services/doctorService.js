// src/services/doctorService.js
import api from './api';

export const getAllDoctors = async () => {
  try {
    const response = await api.get('/doctors');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des médecins:', error);
    throw error;
  }
};

export const getDoctorByCode = async (codeDoctor) => {
  try {
    const response = await api.get(`/doctors/${codeDoctor}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du médecin:', error);
    throw error;
  }
};

export const createDoctor = async (doctorData) => {
  try {
    const response = await api.post('/doctors', doctorData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du médecin:', error);
    throw error;
  }
};

export const updateDoctor = async (codeDoctor, doctorData) => {
  try {
    const response = await api.put(`/doctors/${codeDoctor}`, doctorData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du médecin:', error);
    throw error;
  }
};

export const getHopitauxDisponibles = async () => {
  try {
    const response = await api.get('/doctors/hopitaux-disponibles');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des hôpitaux:', error);
    throw error;
  }
};

export const deleteDoctor = async (codeDoctor) => {
  try {
    const response = await api.delete(`/doctors/${codeDoctor}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression du médecin:', error);
    throw error;
  }
};

export const checkDoctorCodeExists = async (codeDoctor) => {
  try {
    const response = await api.get(`/doctors/exists/${codeDoctor}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la vérification du code médecin:', error);
    throw error;
  }
};

export const countDoctors = async () => {
  try {
    const response = await api.get('/doctors/count');
    return response.data;
  } catch (error) {
    console.error('Erreur lors du comptage des médecins:', error);
    throw error;
  }
};

// Alias pour la compatibilité
export const deleteDoctorService = deleteDoctor;
