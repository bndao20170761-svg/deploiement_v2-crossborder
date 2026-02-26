import api from './api'; // Assurez-vous que ce chemin est correct

export const memberService = {
  // Récupérer tous les membres
  getAllMembers: async () => {
    try {
      const response = await api.get('/membres');
      console.log("Réponse API membres:", response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des membres:', error);
      throw error;
    }
  },

  // Récupérer un membre par ID
  getMemberById: async (id) => {
    try {
      const response = await api.get(`/membres/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du membre:', error);
      throw error;
    }
  },

  // Créer un nouveau membre
  createMember: async (memberData) => {
    try {
      const response = await api.post('/membres', memberData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du membre:', error);
      throw error;
    }
  },

  // Mettre à jour un membre existant
  updateMember: async (id, memberData) => {
    try {
      const response = await api.put(`/membres/${id}`, memberData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du membre:', error);
      throw error;
    }
  },

  // Supprimer un membre
  deleteMember: async (id) => {
    try {
      const response = await api.delete(`/membres/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression du membre:', error);
      throw error;
    }
  }
};