import { apiGet, apiPost, apiPut, apiDelete } from '../services/apiService';

export function getAllPatients() {
  // Correspond à GET /api/integration/patients
  return apiGet('/api/integration/patients');
}

export function createPatient(patient) {
  return apiPost('/api/integration/patients', patient);
}

export function updatePatient(id, patient) {
  return apiPut(`/api/integration/patients/${id}`, patient);
}

export function deletePatient(id) {
  return apiDelete(`/api/integration/patients/${id}`);
}
