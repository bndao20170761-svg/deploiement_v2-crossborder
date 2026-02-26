// assets/services/hospitalService.js
import api from './api'; // Assurez-vous que le chemin est correct

export const getAllHospitals = async () => {
  try {
    console.log('🔄 Tentative de récupération des hôpitaux...');
    const response = await api.get('/hospitaux/tous');

    console.log('✅ Réponse API hôpitaux:', response);

    if (response.status !== 200) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error('❌ Erreur détaillée hôpitaux:', error.response?.data || error.message);
    throw new Error('Impossible de charger les hôpitaux: ' + (error.response?.data?.message || error.message));
  }
};



export const getHospitalById = async (id) => {
  try {
    const response = await api.get(`/hospitaux/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'hôpital:', error);
    throw error;
  }
};

export const createHospital = async (hospitalData) => {
  try {
    const response = await api.post('/hospitaux', hospitalData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de l\'hôpital:', error);
    throw error;
  }
};

export const updateHospital = async (id, hospitalData) => {
  try {
    const response = await api.put(`/hospitaux/${id}`, hospitalData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'hôpital:', error);
    throw error;
  }
};

export const deleteHospital = async (id) => {
  try {
    const response = await api.delete(`/hospitaux/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'hôpital:', error);
    throw error;
  }
};
export const getInactiveHospitals = async () => {
  try {
    const response = await api.get('/hospitaux/inactifs');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des hôpitaux inactifs:', error);
    throw error;
  }
};

// Activer ou désactiver un hôpital (admin uniquement)
export const toggleHospitalStatus = async (id, active) => {
  try {
    const response = await api.patch(`/hospitaux/${id}/status`, null, { params: { active } });
    return response.data;
  } catch (error) {
    console.error('Erreur lors du changement de statut de l\'hôpital:', error);
    throw error;
  }
};


export const deleteHospitalService = deleteHospital;












