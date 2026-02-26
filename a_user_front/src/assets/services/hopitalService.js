// assets/services/hopitalService.js
import api from './api'; // Assurez-vous que le chemin est correct

export const updateHopital = async (id, hospitalData) => {
  try {
    console.log('🔄 Mise à jour hôpital ID:', id, 'Données:', hospitalData);
    const response = await api.put(`/hospitaux/${id}`, hospitalData);
    console.log('✅ Hôpital mis à jour avec succès:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de l\'hôpital:', error.response?.data || error.message);
    throw new Error('Impossible de mettre à jour l\'hôpital: ' + (error.response?.data?.message || error.message));
  }
};














