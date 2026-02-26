// src/components/doctorService.js

import { apiGet } from '../services/apiService';

// Fonction pour récupérer tous les médecins
export async function getAllDoctors() {
  return apiGet('/api/integration/doctors');
}
