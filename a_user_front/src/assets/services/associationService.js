import api from './api';

export const getAllAssociations = async () => {
  try {
    const response = await api.get('/associations');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des associations:', error);
    throw error;
  }
};

export const getAssociationById = async (codeAssociation) => {
  try {
    const response = await api.get(`/associations/${codeAssociation}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'association:', error);
    throw error;
  }
};

export const createAssociation = async (associationData) => {
  try {
    const response = await api.post('/associations', associationData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de l\'association:', error);
    throw error;
  }
};

export const updateAssociation = async (codeAssociation, associationData) => {
  try {
    const response = await api.put(`/associations/${codeAssociation}`, associationData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'association:', error);
    throw error;
  }
};

export const deleteAssociation = async (codeAssociation) => {
  try {
    const response = await api.delete(`/associations/${codeAssociation}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'association:', error);
    throw error;
  }
};

export const deleteAssociationService = deleteAssociation;