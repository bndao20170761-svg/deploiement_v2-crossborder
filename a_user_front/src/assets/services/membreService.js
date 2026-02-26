import api from './api';

export const getAllMembers = async () => {
  try {
    const response = await api.get('/membres');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des membres:', error);
    throw error;
  }
};

export const getMemberById = async (id) => {
  try {
    const response = await api.get(`/membres/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du membre:', error);
    throw error;
  }
};

export const createMember = async (memberData) => {
  try {
    const response = await api.post('/membres', memberData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du membre:', error);
    throw error;
  }
};

export const updateMember = async (id, memberData) => {
  try {
    const response = await api.put(`/membres/${id}`, memberData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du membre:', error);
    throw error;
  }
};

export const deleteMember = async (id) => {
  try {
    const response = await api.delete(`/membres/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression du membre:', error);
    throw error;
  }
};
